/*************** 1) Firebase config (đúng region asia-southeast1) ***************/
const firebaseConfig = {
  apiKey: "AIzaSyCgTSTsGQaeGT9eaQCoCF6m58MBsdbHz-0",
  authDomain: "phan1-f7af4.firebaseapp.com",
  databaseURL: "https://phan1-f7af4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phan1-f7af4",
  storageBucket: "phan1-f7af4.appspot.com",
  messagingSenderId: "673326593732",
  appId: "1:673326593732:web:c7dd17ff2036264d25bb91",
  measurementId: "G-6WY24EN28R"
};

// Init Firebase (compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

/*************** 2) DOM ***************/
const $ = (s) => document.querySelector(s);
const messagesList = $("#messages");
const input        = $("#messageInput");
const sendBtn      = $("#sendBtn");
const emojiToggle  = $("#emojiToggle");
const emojiPicker  = $("#emojiPicker");
const imageInput   = $("#imageInput");
const themeToggle  = $("#themeToggle");
const clearBtn     = $("#clearBtn");
const ribbon       = $("#ribbon");
const hideRibbon   = $("#hideRibbon");
const toastEl      = $("#toast");

/*************** 3) Helpers ***************/
function showToast(t){ if(!toastEl) return; toastEl.textContent=t; toastEl.classList.add("show"); setTimeout(()=>toastEl.classList.remove("show"),1500); }
function fmtTime(ts){ return new Date(ts).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
function escapeHTML(s=""){ return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function uid(){
  let id = localStorage.getItem("uid");
  if(!id){ id = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("uid", id); }
  return id;
}
function nick(){
  return localStorage.getItem("nick") || "guest";
}
function isAdmin(){
  return localStorage.getItem("isAdmin") === "1";
}

/*************** 4) Theme + Ribbon ***************/
(function initTheme(){
  const saved = localStorage.getItem("theme") || "dark";
  if (saved === "light") document.body.classList.add("light");
})();
themeToggle?.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});
hideRibbon?.addEventListener("click", ()=>{ ribbon.style.display = "none"; });

/*************** 5) Emoji (ô chọn emoji bên cạnh ô nhập) ***************/
const EMOJIS = "😀😁😂🤣😊😍😘😎😇😉🙂🤔🥲🥳👍❤️🔥✨🎉💥💯".split("");
function buildEmojiPicker(){
  emojiPicker.innerHTML = "";
  EMOJIS.forEach(e=>{
    const b = document.createElement("button");
    b.className = "emoji-item";
    b.type="button";
    b.textContent = e;
    b.onclick = ()=>{ input.value += e; emojiPicker.classList.add("hidden"); input.focus(); };
    emojiPicker.appendChild(b);
  });
}
emojiToggle?.addEventListener("click", ()=>{
  if (emojiPicker.classList.contains("hidden")) buildEmojiPicker();
  emojiPicker.classList.toggle("hidden");
});
document.addEventListener("click", (ev)=>{
  if (!emojiPicker.classList.contains("hidden")
      && !emojiPicker.contains(ev.target)
      && ev.target !== emojiToggle) {
    emojiPicker.classList.add("hidden");
  }
});

/*************** 6) Reaction config ***************/
const REACTS = ["❤️","😂","😡"]; // tim, cười, phẫn nộ

/*************** 7) Render message ***************/
function renderMessage(key, msg, me=false, reactions={}) {
  let li = messagesList.querySelector(`li[data-key="${key}"]`);
  if (!li) {
    li = document.createElement("li");
    li.dataset.key = key;
    li.className = "message" + (me ? " me" : "");
    messagesList.appendChild(li);
  } else {
    li.className = "message" + (me ? " me" : "");
  }

  // Phần nội dung
  let html = "";
  if (msg.text) html += `<div class="text">${escapeHTML(msg.text)}</div>`;
  if (msg.imageURL) html += `<img class="message-img" src="${escapeHTML(msg.imageURL)}" alt="image">`;
  html += `<div class="meta">${fmtTime(msg.time || Date.now())}</div>`;

  // Under-row: reaction button + counts
  const counts = REACTS.map(e => {
    const users = reactions[e] ? Object.keys(reactions[e]) : [];
    const myOn  = users.includes(uid());
    const n = users.length || 0;
    return {e, n, myOn};
  });

  const countHtml = counts.map(({e,n,myOn}) => {
    if (!n) return "";
    return `<span class="like-count" data-emoji="${e}" ${myOn ? 'style="filter:drop-shadow(0 0 6px rgba(244,63,94,.5))"' : ""}>${e} ${n}</span>`;
  }).join("");

  html += `
    <div class="under">
      <button class="icon mini react-btn" title="Reaction">❤</button>
      <div class="reactions">${countHtml}</div>
      ${isAdmin() ? '<button class="icon mini admin-del" title="Xoá tất cả (admin)">🧹</button>' : ''}
    </div>
    <div class="actions" hidden></div>
  `;

  li.innerHTML = html;
  messagesList.scrollTop = messagesList.scrollHeight;
}

/*************** 8) Send text ***************/
function sendMessage(){
  const text = (input.value || "").trim();
  if (!text) return;
  const msg = { text, time: Date.now(), sender: nick(), uid: uid() };
  db.ref("messages").push(msg)
    .then(()=>{ input.value=""; })
    .catch(err => showToast("Lỗi gửi: " + err.message));
}
sendBtn?.addEventListener("click", sendMessage);
input?.addEventListener("keypress", (e)=>{ if (e.key === "Enter") sendMessage(); });

/*************** 9) Send image ***************/
imageInput?.addEventListener("change", async ()=>{
  const file = imageInput.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) { showToast("Ảnh > 5MB, vui lòng chọn ảnh nhỏ hơn."); imageInput.value=""; return; }

  try {
    showToast("Đang tải ảnh…");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `uploads/${uid()}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const ref  = storage.ref().child(path);

    await ref.put(file);
    const url = await ref.getDownloadURL();

    await db.ref("messages").push({ imageURL: url, time: Date.now(), sender: nick(), uid: uid() });
    showToast("Đã gửi ảnh ✅");
  } catch (err) {
    showToast("Lỗi ảnh: " + err.message);
  } finally {
    imageInput.value = "";
  }
});

/*************** 10) Reaction bar (hiện 3 emoji khi bấm ❤) ***************/
messagesList.addEventListener("click", (ev)=>{
  const target = ev.target;
  const li = target.closest("li.message");
  if (!li) return;
  const key = li.dataset.key;

  // Mở/đóng thanh chọn reaction
  if (target.classList.contains("react-btn")) {
    // Nếu đã có thanh -> toggle
    let bar = li.querySelector(".react-bar");
    if (bar) { bar.remove(); return; }

    bar = document.createElement("div");
    bar.className = "react-bar";
    bar.style.marginTop = "6px";
    REACTS.forEach(e=>{
      const b = document.createElement("button");
      b.className = "icon mini";
      b.textContent = e;
      b.title = "Thả " + e;
      b.addEventListener("click", ()=> toggleReaction(key, e));
      bar.appendChild(b);
    });
    // đóng khi click ngoài
    document.addEventListener("click", function onDoc(e2){
      if (!bar.contains(e2.target) && e2.target !== target) {
        bar.remove(); document.removeEventListener("click", onDoc);
      }
    });

    // chèn ngay dưới under
    li.querySelector(".under").after(bar);
  }

  // Admin xoá tất cả
  if (target.classList.contains("admin-del")) {
    if (!isAdmin()) return showToast("Bạn không phải admin.");
    if (!confirm("Xoá TẤT CẢ tin nhắn?")) return;
    db.ref("messages").set(null)
      .then(()=>{ messagesList.innerHTML=""; showToast("Đã xoá toàn bộ"); })
      .catch(err => showToast("Lỗi xoá: " + err.message));
  }
});

// Toggle reaction của user
function toggleReaction(msgKey, emoji){
  const rPath = `messages/${msgKey}/reactions/${encodeURIComponent(emoji)}/${uid()}`;
  const ref = db.ref(rPath);
  ref.get().then(snap=>{
    if (snap.exists()) {
      ref.remove(); // bỏ reaction
    } else {
      ref.set(true); // thả reaction
    }
  }).catch(err=> showToast("Lỗi reaction: " + err.message));
}

/*************** 11) Realtime listener ***************/
const msgRef = db.ref("messages").limitToLast(200);

// Khi có message mới
msgRef.on("child_added", (snap)=>{
  const key = snap.key;
  const msg = snap.val() || {};
  const me  = msg.uid === uid();
  renderMessage(key, msg, me, msg.reactions || {});
});

// Khi message thay đổi (ví dụ reaction thay đổi)
db.ref("messages").on("child_changed", (snap)=>{
  const key = snap.key;
  const msg = snap.val() || {};
  const me  = msg.uid === uid();
  renderMessage(key, msg, me, msg.reactions || {});
});

/*************** 12) Admin clear ở header ***************/
clearBtn?.addEventListener("click", ()=>{
  if (!isAdmin()) { showToast("Bạn không phải admin."); return; }
  if (!confirm("Xoá TẤT CẢ tin nhắn?")) return;
  db.ref("messages").set(null)
    .then(()=>{ messagesList.innerHTML=""; showToast("Đã xoá"); })
    .catch(err=> showToast("Lỗi xoá: " + err.message));
});
