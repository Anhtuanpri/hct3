/*************** Firebase config ***************/
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

/*************** DOM refs ***************/
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

/*************** Helpers ***************/
function showToast(t){ if(!toastEl) return; toastEl.textContent=t; toastEl.classList.add("show"); setTimeout(()=>toastEl.classList.remove("show"),1500); }
function fmtTime(ts){ return new Date(ts).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }
function escapeHTML(s=""){ return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function uid(){ let id=localStorage.getItem("uid"); if(!id){ id="u_"+Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem("uid",id);} return id; }
const myUID = uid();
const myNick = () => localStorage.getItem("nick") || "guest";
const isAdmin = () => localStorage.getItem("isAdmin")==="1"; // bật thử: localStorage.setItem('isAdmin','1')

/*************** Theme + Ribbon ***************/
(function initTheme(){ const s=localStorage.getItem("theme")||"dark"; if(s==="light") document.body.classList.add("light");})();
themeToggle?.addEventListener("click", ()=>{ document.body.classList.toggle("light"); localStorage.setItem("theme", document.body.classList.contains("light") ? "light":"dark"); });
hideRibbon?.addEventListener("click", ()=>{ ribbon.style.display="none"; });

/*************** Emoji picker (ô bên cạnh input) ***************/
const EMOJIS = "😀😁😂🤣😊😍😘😎😇😉🙂🤔🥲🥳👍❤️🔥✨🎉💥💯".split("");
function buildEmojiPicker(){
  emojiPicker.innerHTML = "";
  EMOJIS.forEach(e=>{
    const b=document.createElement("button");
    b.className="emoji-item"; b.type="button"; b.textContent=e;
    b.onclick=()=>{ input.value+=e; emojiPicker.classList.add("hidden"); input.focus(); };
    emojiPicker.appendChild(b);
  });
}
emojiToggle?.addEventListener("click", ()=>{ if(emojiPicker.classList.contains("hidden")) buildEmojiPicker(); emojiPicker.classList.toggle("hidden");});
document.addEventListener("click",(ev)=>{ if(!emojiPicker.classList.contains("hidden") && !emojiPicker.contains(ev.target) && ev.target!==emojiToggle){ emojiPicker.classList.add("hidden"); }});

/*************** Reaction config ***************/
const REACTS = ["❤️","😂","😡"]; // tim, cười, phẫn nộ

/*************** Render message ***************/
function renderMessage(key, msg, reactions={}) {
  let li = messagesList.querySelector(`li[data-key="${key}"]`);
  if (!li) {
    li = document.createElement("li");
    li.dataset.key = key;
    li.className = "message" + (msg.uid===myUID ? " me" : "");
    messagesList.appendChild(li);
  } else {
    li.className = "message" + (msg.uid===myUID ? " me" : "");
  }

  // Đếm reaction
  const counts = REACTS.map(emoji=>{
    const users = reactions && reactions[emoji] ? Object.keys(reactions[emoji]) : [];
    return { emoji, n: users.length, mine: users.includes(myUID) };
  });

  const countsHtml = counts.map(({emoji,n,mine})=> n ? `<span class="like-count" data-emoji="${emoji}" ${mine?'style="filter:drop-shadow(0 0 6px rgba(244,63,94,.5))"':''}>${emoji} ${n}</span>` : "" ).join("");

  let inner = "";
  if (msg.text) inner += `<div class="text">${escapeHTML(msg.text)}</div>`;
  if (msg.imageURL) inner += `<img class="message-img" src="${escapeHTML(msg.imageURL)}" alt="image">`;
  inner += `<div class="meta">${fmtTime(msg.time||Date.now())}</div>
            <div class="under">
              <button class="icon mini react-btn" title="Reaction">❤</button>
              <div class="reactions">${countsHtml}</div>
              ${isAdmin()?'<button class="icon mini admin-del" title="Xoá tất cả (admin)">🧹</button>':''}
            </div>`;

  li.innerHTML = inner;
  messagesList.scrollTop = messagesList.scrollHeight;
}

/*************** Gửi text ***************/
function sendMessage(){
  const text=(input.value||"").trim();
  if(!text) return;
  db.ref("messages").push({ text, time: Date.now(), uid: myUID, sender: myNick() })
    .then(()=>{ input.value=""; })
    .catch(err=> showToast("Lỗi gửi: "+err.message));
}
sendBtn?.addEventListener("click", sendMessage);
input?.addEventListener("keypress",(e)=>{ if(e.key==="Enter") sendMessage(); });

/*************** Gửi ảnh ***************/
imageInput?.addEventListener("change", async ()=>{
  const file = imageInput.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast("Ảnh > 5MB, vui lòng chọn ảnh nhỏ hơn."); imageInput.value=""; return; }

  try{
    showToast("Đang tải ảnh…");
    const ext = (file.name.split(".").pop()||"jpg").toLowerCase();
    const objPath = `uploads/${myUID}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const ref = storage.ref().child(objPath);
    await ref.put(file, { contentType: file.type || "image/"+ext });
    const url = await ref.getDownloadURL();
    await db.ref("messages").push({ imageURL: url, time: Date.now(), uid: myUID, sender: myNick() });
    showToast("Đã gửi ảnh ✅");
  }catch(err){
    showToast("Lỗi ảnh: "+err.message);
  }finally{ imageInput.value=""; }
});

/*************** Reaction bar + toggle ***************/
messagesList.addEventListener("click",(ev)=>{
  const li = ev.target.closest("li.message");
  if (!li) return;
  const key = li.dataset.key;

  // open/close reaction bar
  if (ev.target.classList.contains("react-btn")) {
    let bar = li.querySelector(".react-bar");
    if (bar) { bar.remove(); return; }
    bar = document.createElement("div");
    bar.className = "react-bar";
    bar.style.marginTop="6px";
    REACTS.forEach(emoji=>{
      const b=document.createElement("button");
      b.className="icon mini"; b.textContent=emoji; b.title="Thả "+emoji;
      b.onclick=()=>toggleReaction(key, emoji);
      bar.appendChild(b);
    });
    li.querySelector(".under").after(bar);
  }

  // admin clear all
  if (ev.target.classList.contains("admin-del")) {
    if (!isAdmin()) return showToast("Bạn không phải admin.");
    if (!confirm("Xoá TẤT CẢ tin nhắn?")) return;
    db.ref("messages").set(null).then(()=>{ messagesList.innerHTML=""; showToast("Đã xoá"); })
      .catch(err=> showToast("Lỗi xoá: "+err.message));
  }
});

// Quan trọng: KHÔNG encodeURIComponent emoji khi lưu key → Firebase hỗ trợ Unicode.
// (Trước đây encode khiến đọc/ghi mismatch nên bấm không cập nhật.)
function toggleReaction(msgKey, emoji){
  const rRef = db.ref(`messages/${msgKey}/reactions/${emoji}/${myUID}`);
  rRef.get().then(snap=>{
    if (snap.exists()) rRef.remove(); else rRef.set(true);
  }).catch(err=> showToast("Lỗi reaction: "+err.message));
}

/*************** Realtime listeners ***************/
const listRef = db.ref("messages").limitToLast(200);

listRef.on("child_added", snap=>{
  const key = snap.key, val = snap.val() || {};
  renderMessage(key, val, val.reactions || {});
});

db.ref("messages").on("child_changed", snap=>{
  const key = snap.key, val = snap.val() || {};
  renderMessage(key, val, val.reactions || {});
});

db.ref("messages").on("child_removed", snap=>{
  const li = messagesList.querySelector(`li[data-key="${snap.key}"]`);
  if (li) li.remove();
});

/*************** Header clear (admin) ***************/
clearBtn?.addEventListener("click", ()=>{
  if (!isAdmin()) return showToast("Bạn không phải admin.");
  if (!confirm("Xoá TẤT CẢ tin nhắn?")) return;
  db.ref("messages").set(null).then(()=>{ messagesList.innerHTML=""; showToast("Đã xoá"); })
    .catch(err=> showToast("Lỗi xoá: "+err.message));
});
