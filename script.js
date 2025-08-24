// === CONFIG ===
const ADMIN_NAME = "Admin"; // 👉 Đổi tên admin tại đây (chỉ 1 người có quyền xoá tất cả / xoá của người khác)

// === Firebase config ===
const firebaseConfig = {
  apiKey: "AIzaSyDL54a3OIuzaxY_IEQgscCzIfBWCQqvhcM",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "94515253749",
  appId: "1:94515253749:web:86594f2222889c6472d0bc"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref("messages");

// === Elements ===
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesUl = document.getElementById("messages");
const imageInput = document.getElementById("imageInput");
const emojiToggle = document.getElementById("emojiToggle");
const emojiPicker = document.getElementById("emojiPicker");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");
const hideRibbonBtn = document.getElementById("hideRibbon");
const ribbon = document.getElementById("ribbon");

// === Username (persist) ===
const USER_KEY = "chat_username_v1";
let username = localStorage.getItem(USER_KEY);
if (!username) {
  const rnd = Math.floor(Math.random()*900)+100;
  username = prompt("Nhập tên hiển thị:", "Ẩn danh " + rnd) || ("Ẩn danh " + rnd);
  localStorage.setItem(USER_KEY, username);
}

// Ẩn nút Clear nếu không phải admin
if (username !== ADMIN_NAME) {
  clearBtn.style.display = "none";
}

// === Theme (persist) ===
const THEME_KEY = "chat_theme_v1";
(function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if(saved === "light"){
    document.documentElement.classList.add("light");
  }
})();
themeToggle.onclick = () => {
  document.documentElement.classList.toggle("light");
  localStorage.setItem(THEME_KEY, document.documentElement.classList.contains("light") ? "light" : "dark");
  showToast("Đã chuyển chủ đề");
};

// === Ribbon dismiss today ===
const RIBBON_KEY = "ribbon_hide_2_9";
(function(){
  const v = localStorage.getItem(RIBBON_KEY);
  if(v === new Date().toDateString()){
    ribbon.style.display = "none";
  }
})();
hideRibbonBtn.onclick = () => {
  ribbon.style.display = "none";
  localStorage.setItem(RIBBON_KEY, new Date().toDateString());
};

// === Utils ===
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"), 1600);
}
function formatTime(ts){
  const d = new Date(ts);
  return d.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
}
function escapeHtml(s){return (s||'').replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;","&gt;":"&gt;","\"":"&quot;"}[c]))}

// === Emoji ===
const EMOJIS = "😀😃😄😆😁😍🥰😊🤩😎😢😞😔😟😕😣😖😫🥺😭😠😤😡🤬😒🙄😑😬😾💢😲😯😮😳🤯😱😨😰😵🤐🤔😐🤨😇😴🥱🤤😪😷🤒🤕🤧🥶🥵😈👿🤠👻💀👽🫠".split("");
emojiPicker.innerHTML = EMOJIS.map(e => `<button class="emoji-item" type="button">${e}</button>`).join("");
emojiToggle.onclick = (e) => {
  e.stopPropagation();
  emojiPicker.classList.toggle("hidden");
};
emojiPicker.onclick = (e) => {
  if (e.target.classList.contains("emoji-item")) {
    messageInput.value += e.target.textContent;
    emojiPicker.classList.add("hidden");
    messageInput.focus();
  }
};
document.addEventListener("click", (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiToggle) {
    emojiPicker.classList.add("hidden");
  }
});

// === Send text ===
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (text === "") return;
  messagesRef.push({
    name: username,
    text,
    time: Date.now()
  });
  messageInput.value = "";
};
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

// === Send image ===
imageInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    messagesRef.push({
      name: username,
      image: reader.result,
      time: Date.now()
    });
  };
  reader.readAsDataURL(file);
  imageInput.value = "";
};

// === Like toggle ===
function toggleLike(key){
  const likeRef = messagesRef.child(key).child("likes").child(encodeKey(username));
  likeRef.get().then(snap => {
    if (snap.exists()) likeRef.remove();
    else likeRef.set(true);
  });
}
function encodeKey(s){ return s.replace(/[.#$\[\]]/g, "_"); }

// === Render helpers ===
function renderMessage(key, msg){
  const li = document.createElement("li");
  const isMe = msg.name === username;
  li.className = "message" + (isMe ? " me" : "");
  li.dataset.id = key;

  const safeName = escapeHtml(msg.name || "Ẩn danh");
  const textHtml = msg.text ? `<div class="text">${escapeHtml(msg.text)}</div>` : "";
  const imgHtml = msg.image ? `<img class="message-img" alt="ảnh gửi" loading="lazy" src="${msg.image}">` : "";
  const metaHtml = `<div class="meta">${safeName} • ${formatTime(msg.time)}</div>`;

  // Like
  const likes = msg.likes ? Object.keys(msg.likes) : [];
  const iLike = likes.includes(encodeKey(username));
  const likeBtn = `<button class="icon mini like${iLike ? " on":""}" data-act="like" title="Thích">${iLike ? "❤️" : "🤍"}</button>`;
  const likeCount = `<span class="like-count">${likes.length || ""}</span>`;

  // Actions: owner can edit & recall; admin can delete any
  const canEdit = !!msg.text && isMe;
  const canDeleteAny = (username === ADMIN_NAME);
  const canDeleteOwn = isMe;
  const hasActions = canEdit || canDeleteAny || canDeleteOwn;

  const actionsHtml = hasActions ? `
    <div class="actions">
      ${canEdit ? `<button data-act="edit">✏️ Sửa</button><button data-act="recall">↩️ Thu hồi</button>` : ""}
      ${(canDeleteAny && !isMe) ? `<button data-act="delete-any">🗑️ Xoá (Admin)</button>` : ""}
      ${canDeleteOwn && !canEdit ? `<button data-act="delete-own">🗑️ Xoá</button>` : ""}
    </div>` : "";

  // Kebab icon
  const kebab = hasActions ? `<button class="kebab" title="Tác vụ" data-act="menu">⋯</button>` : "";

  li.innerHTML = `${kebab}${textHtml}${imgHtml}${metaHtml}
    <div class="under">
      <div class="left">${likeBtn}${likeCount}</div>
      <div class="right"></div>
    </div>
    ${actionsHtml}`;

  // Event handlers
  li.addEventListener("click", (e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;

    const act = btn.dataset.act;
    if (act === "menu"){
      const actions = li.querySelector(".actions");
      if(actions) actions.style.display = actions.style.display === "block" ? "none" : "block";
      return;
    }
    if (act === "like"){
      toggleLike(key);
      return;
    }
    if (act === "edit"){
      const newText = prompt("Chỉnh sửa tin nhắn:", msg.text || "");
      if (newText != null && newText !== msg.text && newText.trim() !== "") {
        messagesRef.child(key).update({ text: newText.trim() });
      }
      li.querySelector(".actions").style.display = "none";
      return;
    }
    if (act === "recall" || act === "delete-own"){
      if(confirm("Thu hồi tin nhắn của bạn?")){
        messagesRef.child(key).remove();
      }
      return;
    }
    if (act === "delete-any"){
      if(confirm("Admin xoá tin nhắn này?")){
        messagesRef.child(key).remove();
      }
      return;
    }
  });

  document.addEventListener("click", (e) => {
    if (!li.contains(e.target)) {
      const actions = li.querySelector(".actions");
      if(actions) actions.style.display = "none";
    }
  });

  return li;
}

// === Realtime listeners ===
messagesRef.on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const li = renderMessage(snapshot.key, msg);
  messagesUl.appendChild(li);
  messagesUl.scrollTop = messagesUl.scrollHeight;
});

messagesRef.on("child_changed", (snapshot) => {
  const msg = snapshot.val();
  const li = document.querySelector(`[data-id="${snapshot.key}"]`);
  if (li) {
    const newLi = renderMessage(snapshot.key, msg);
    li.replaceWith(newLi);
  }
});

messagesRef.on("child_removed", (snapshot) => {
  const msgEl = document.querySelector(`[data-id="${snapshot.key}"]`);
  if (msgEl) msgEl.remove();
});

// === Clear all (Admin only) ===
clearBtn.onclick = () => {
  if (username !== ADMIN_NAME) return;
  if (confirm("Xoá toàn bộ tin nhắn? Hành động không thể hoàn tác.")) {
    messagesRef.remove();
    messagesUl.innerHTML = "";
    showToast("Đã xoá tất cả");
  }
};
