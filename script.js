/*************** 1) Firebase config (đúng region asia-southeast1) ***************/
const firebaseConfig = {
  apiKey: "AIzaSyCgTSTsGQaeGT9eaQCoCF6m58MBsdbHz-0",
  authDomain: "phan1-f7af4.firebaseapp.com",
  databaseURL: "https://phan1-f7af4-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ QUAN TRỌNG
  projectId: "phan1-f7af4",
  storageBucket: "phan1-f7af4.appspot.com",
  messagingSenderId: "673326593732",
  appId: "1:673326593732:web:c7dd17ff2036264d25bb91",
  measurementId: "G-6WY24EN28R"
};

// Khởi tạo Firebase (compat để hợp HTML hiện có)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// Nếu bật Storage sau này:
// const storage = firebase.storage();

/*************** 2) DOM refs ***************/
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
function showToast(t){
  if(!toastEl) return;
  toastEl.textContent = t;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 1600);
}
function fmtTime(ts){
  return new Date(ts).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
function escapeHTML(s=""){
  return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

/*************** 4) Theme toggle + Ribbon ***************/
(function initTheme(){
  const saved = localStorage.getItem("theme") || "dark";
  if (saved === "light") document.body.classList.add("light");
})();
themeToggle?.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});
hideRibbon?.addEventListener("click", ()=>{
  ribbon.style.display = "none";
});

/*************** 5) Emoji picker ***************/
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

/*************** 6) Render 1 message ***************/
function renderMessage(key, msg, me=false){
  const li = document.createElement("li");
  li.className = "message" + (me ? " me" : "");
  li.dataset.key = key;

  let html = "";
  if (msg.text) html += `<div class="text">${escapeHTML(msg.text)}</div>`;
  if (msg.imageURL) html += `<img class="message-img" src="${escapeHTML(msg.imageURL)}" alt="image">`;
  html += `<div class="meta">${fmtTime(msg.time || Date.now())}</div>`;

  li.innerHTML = html;
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
}

/*************** 7) Send message ***************/
function sendMessage(){
  const text = (input.value || "").trim();
  if (!text) return;

  const msg = {
    text,
    time: Date.now(),
    sender: localStorage.getItem("nick") || "guest"
  };

  // Ghi vào /messages
  db.ref("messages").push(msg)
    .then(()=>{ input.value=""; })
    .catch(err => showToast("Lỗi gửi: " + err.message));
}
sendBtn?.addEventListener("click", sendMessage);
input?.addEventListener("keypress", (e)=>{ if (e.key === "Enter") sendMessage(); });

/*************** 8) Realtime listener (load + cập nhật) ***************/
db.ref("messages").limitToLast(200).on("child_added", (snap)=>{
  const key = snap.key;
  const msg = snap.val() || {};
  const me  = msg.sender === (localStorage.getItem("nick") || "guest");
  renderMessage(key, msg, me);
});

/*************** 9) Clear all (admin) ***************/
clearBtn?.addEventListener("click", ()=>{
  if (!confirm("Xoá TẤT CẢ tin nhắn?")) return;
  db.ref("messages").set(null)
    .then(()=>{ messagesList.innerHTML=""; showToast("Đã xoá"); })
    .catch(err=> showToast("Lỗi xoá: " + err.message));
});

/*************** 10) Gửi ảnh (stub – cần bật Storage để dùng thật) ***************/
imageInput?.addEventListener("change", ()=>{
  showToast("Tính năng ảnh: cần bật Firebase Storage (mình sẽ hướng dẫn nếu bạn cần).");
  imageInput.value = "";
});
