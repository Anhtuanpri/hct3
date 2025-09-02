/*************** 1) Firebase config (đúng region) ***************/
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

/*************** 2) DOM ***************/
const $ = (s)=>document.querySelector(s);
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
function toast(t){ if(!toastEl) return; toastEl.textContent=t; toastEl.classList.add("show"); setTimeout(()=>toastEl.classList.remove("show"),1500); }
const timeFmt = (ts)=>new Date(ts).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
const esc = (s="")=>s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function uid(){
  let id=localStorage.getItem("uid");
  if(!id){ id="u_"+Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem("uid",id); }
  return id;
}
const myUID = uid();
function getNick(){
  let n = localStorage.getItem("nick");
  if (!n) {
    n = prompt("Nhập tên hiển thị:", "Khách") || "Khách";
    localStorage.setItem("nick", n);
  }
  return n;
}
const myNick = ()=> localStorage.getItem("nick") || getNick();
const isAdmin = ()=> localStorage.getItem("isAdmin")==="1"; // bật thử: localStorage.setItem('isAdmin','1')

/*************** 4) Theme + Ribbon ***************/
(function initTheme(){ const s=localStorage.getItem("theme")||"dark"; if(s==="light") document.body.classList.add("light");})();
themeToggle?.addEventListener("click", ()=>{ document.body.classList.toggle("light"); localStorage.setItem("theme", document.body.classList.contains("light")?"light":"dark"); });
hideRibbon?.addEventListener("click", ()=>{ ribbon.style.display="none"; });

/*************** 5) Emoji picker (bên input) ***************/
const EMOJIS = "😀😁😂🤣😊😍😘😎😇😉🙂🤔🥲🥳👍❤️🔥✨🎉💥💯".split("");
function buildEmojiPicker(){
  emojiPicker.innerHTML=""; 
  EMOJIS.forEach(e=>{
    const b=document.createElement("button");
    b.className="emoji-item"; b.type="button"; b.textContent=e;
    b.onclick=()=>{ input.value+=e; emojiPicker.classList.add("hidden"); input.focus(); };
    emojiPicker.appendChild(b);
  });
}
emojiToggle?.addEventListener("click", ()=>{ if(emojiPicker.classList.contains("hidden")) buildEmojiPicker(); emojiPicker.classList.toggle("hidden"); });
document.addEventListener("click", (ev)=>{ if(!emojiPicker.classList.contains("hidden")&&!emojiPicker.contains(ev.target)&&ev.target!==emojiToggle){ emojiPicker.classList.add("hidden"); }});

/*************** 6) Reaction ***************/
const REACTS = ["❤️","😂","😡"]; // ba cảm xúc

/*************** 7) Render 1 message ***************/
function renderMessage(key, msg){
  let li = messagesList.querySelector(`li[data-key="${key}"]`);
  if (!li) {
    li = document.createElement("li");
    li.dataset.key = key;
    messagesList.appendChild(li);
  }
  li.className = "message" + (msg.uid===myUID ? " me" : "");

  // tổng hợp reactions
  const reactions = msg.reactions || {};
  const counts = REACTS.map(emoji=>{
    const users = reactions[emoji] ? Object.keys(reactions[emoji]) : [];
    return {emoji, n: users.length, mine: users.includes(myUID)};
  });

  const countsHtml = counts.map(({emoji,n,mine}) => 
    n ? `<span class="like-count" data-emoji="${emoji}" ${mine?'style="filter:drop-shadow(0 0 6px rgba(244,63,94,.5))"':''}>${emoji} ${n}</span>` : ""
  ).join("");

  let html = "";
  if (msg.text)     html += `<div class="text">${esc(msg.text)}</div>`;
  if (msg.imageURL) html += `<img class="message-img" src="${esc(msg.imageURL)}" alt="image">`;

  // meta: tên + giờ
  html += `<div class="meta">${esc(msg.sender || "Ẩn danh")} • ${timeFmt(msg.time||Date.now())}</div>`;

  // under-row: nút reaction + đếm + admin
  html += `
    <div class="under">
      <button class="icon mini react-btn" title="Reaction">❤</button>
      <div class="reactions">${countsHtml}</div>
      ${isAdmin()?'<button class="icon mini admin-del" title="Xoá tất cả (admin)">🧹</button>':''}
    </div>
  `;

  li.innerHTML = html;
  messagesList.scrollTop = messagesList.scrollHeight;
}

/*************** 8) Gửi tin ***************/
function sendMessage(){
  const text=(input.value||"").trim();
  if(!text) return;
  const payload = { text, time:Date.now(), uid:myUID, sender: myNick() };
  db.ref("messages").push(payload).then(()=>{ input.value=""; }).catch(e=>toast("Lỗi gửi: "+e.message));
}
sendBtn?.addEventListener("click", sendMessage);
input?.addEventListener("keypress", (e)=>{ if(e.key==="Enter") sendMessage(); });

/*************** 9) Gửi ảnh ***************/
imageInput?.addEventListener("change", async ()=>{
  const file = imageInput.files?.[0];
  if (!file) return;
  if (file.size > 5*1024*1024){ toast("Ảnh > 5MB, chọn ảnh nhỏ hơn."); imageInput.value=""; return; }
  try{
    toast("Đang tải ảnh…");
    const ext = (file.name.split(".").pop()||"jpg").toLowerCase();
    const path = `uploads/${myUID}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const ref  = storage.ref().child(path);
    await ref.put(file, { contentType: file.type || ("image/"+ext) });
    const url = await ref.getDownloadURL();
    await db.ref("messages").push({ imageURL:url, time:Date.now(), uid:myUID, sender: myNick() });
    toast("Đã gửi ảnh ✅");
  }catch(e){ toast("Lỗi ảnh: "+e.message); }
  finally{ imageInput.value=""; }
});

/*************** 10) Mở thanh reaction & toggle reaction ***************/
messagesList.addEventListener("click", (ev)=>{
  const li = ev.target.closest("li.message"); if(!li) return;
  const key = li.dataset.key;

  // Mở/đóng thanh chọn 3 emoji
  if (ev.target.classList.contains("react-btn")) {
    let bar = li.querySelector(".react-bar");
    if (bar) { bar.remove(); return; }
    bar = document.createElement("div");
    bar.className = "react-bar";
    bar.style.marginTop = "6px";
    REACTS.forEach(emoji=>{
      const b = document.createElement("button");
      b.className = "icon mini";
      b.textContent = emoji;
      b.title = "Thả "+emoji;
      b.onclick = ()=> toggleReaction(key, emoji);
      bar.appendChild(b);
    });
    li.querySelector(".under").after(bar);
  }

  // Admin xoá tất cả
  if (ev.target.classList.contains("admin-del")) {
    if (!isAdmin()) return toast("Bạn không phải admin.");
    if (!confirm("Xoá TẤT CẢ tin nhắn?")) return;
    db.ref("messages").set(null).then(()=>{ messagesList.innerHTML=""; toast("Đã xoá"); })
      .catch(err=> toast("Lỗi xoá: "+err.message));
  }
});

// Toggle reaction (không encode emoji – Firebase hỗ trợ Unicode)
function toggleReaction(msgKey, emoji){
  const rRef = db.ref(`messages/${msgKey}/reactions/${emoji}/${myUID}`);
  rRef.get().then(snap=>{
    if (snap.exists()) rRef.remove(); else rRef.set(true);
  }).catch(e=> toast("Lỗi reaction: "+e.message));
}

/*************** 11) Realtime listeners ***************/
const listRef = db.ref("messages").limitToLast(200);
listRef.on("child_added",  snap => renderMessage(snap.key, snap.val()||{}));
db.ref("messages").on("child_changed", snap => renderMessage(snap.key, snap.val()||{}));
db.ref("messages").on("child_removed", snap => {
  const li = messagesList.querySelector(`li[data-key="${snap.key}"]`);
  if (li) li.remove();
});

/*************** 12) Header clear (admin) ***************/
clearBtn?.addEventListener("click", ()=>{
  if (!isAdmin()) return toast("Bạn không phải admin.");
  if (!confirm("Xoá TẤT CẢ tin nhắn?")) return;
  db.ref("messages").set(null).then(()=>{ messagesList.innerHTML=""; toast("Đã xoá"); })
    .catch(err=> toast("Lỗi xoá: "+err.message));
});
