// Firebase config
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

// Tên người gửi mặc định
const username = "Ẩn danh";

// DOM
const input = document.getElementById("messageInput");
const chat = document.getElementById("chatMessages");
const emojiPicker = document.getElementById("emojiPicker");

let replyTo = null;

// Emojis
const emojis = ["😀", "😁", "😂", "🤣", "😎", "😍", "😢", "😡", "❤️", "👍", "🙏", "💩"];
emojis.forEach(e => {
  const span = document.createElement("span");
  span.textContent = e;
  span.onclick = () => input.value += e;
  emojiPicker.appendChild(span);
});

function toggleEmojiPicker() {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none";
}

// Send Message
function sendMessage() {
  const text = input.value.trim();
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];

  if (!text && !file) return;

  const msg = {
    sender: username,
    text: text,
    time: Date.now(),
    replyTo: replyTo,
    likes: 0,
    image: null
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      msg.image = e.target.result;
      messagesRef.push(msg);
    };
    reader.readAsDataURL(file);
  } else {
    messagesRef.push(msg);
  }

  input.value = "";
  fileInput.value = "";
  cancelReply();
}

function cancelReply() {
  replyTo = null;
  document.getElementById("replyBox").style.display = "none";
}

// Listen messages
messagesRef.on("value", snapshot => {
  chat.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const key = child.key;
    renderMessage(data, key);
  });
  chat.scrollTop = chat.scrollHeight;
});

function renderMessage(data, key) {
  const div = document.createElement("div");
  div.className = "message" + (data.sender === username ? " own" : "");
  
  const header = document.createElement("div");
  header.className = "message-header";
  header.textContent = data.sender;

  if (data.replyTo && data.replyTo.text) {
    const reply = document.createElement("div");
    reply.style.fontSize = "12px";
    reply.style.opacity = 0.7;
    reply.textContent = "↪ " + data.replyTo.text;
    div.appendChild(reply);
  }

  div.appendChild(header);

  if (data.text) {
    const content = document.createElement("div");
    content.textContent = data.text;
    div.appendChild(content);
  }

  if (data.image) {
    const img = document.createElement("img");
    img.src = data.image;
    img.style.maxWidth = "100%";
    img.style.marginTop = "6px";
    div.appendChild(img);
  }

  const footer = document.createElement("div");
  footer.className = "message-footer";
  const time = new Date(data.time).toLocaleTimeString();
  footer.innerHTML = `<span>${time}</span><span>❤️ ${data.likes || 0}</span>`;
  div.appendChild(footer);

  // ⋯ menu
  const options = document.createElement("div");
  options.className = "message-options";
  const btn = document.createElement("button");
  btn.textContent = "⋯";
  btn.className = "options-btn";
  btn.onclick = () => popup.style.display = popup.style.display === "block" ? "none" : "block";

  const popup = document.createElement("div");
  popup.className = "options-popup";
  
  if (data.sender === username) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Chỉnh sửa";
    editBtn.onclick = () => {
      input.value = data.text;
      messagesRef.child(key).remove();
    };
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌ Thu hồi";
    delBtn.onclick = () => messagesRef.child(key).remove();
    popup.append(editBtn, delBtn);
  }

  const likeBtn = document.createElement("button");
  likeBtn.textContent = "❤️ Thích";
  likeBtn.onclick = () => {
    messagesRef.child(key).update({ likes: (data.likes || 0) + 1 });
  };

  const replyBtn = document.createElement("button");
  replyBtn.textContent = "↩️ Trả lời";
  replyBtn.onclick = () => {
    replyTo = { text: data.text, sender: data.sender };
    document.getElementById("replyToText").textContent = `Trả lời: ${data.text}`;
    document.getElementById("replyBox").style.display = "flex";
  };

  popup.append(likeBtn, replyBtn);
  options.append(btn, popup);
  div.appendChild(options);
  chat.appendChild(div);
}

function clearMessages() {
  if (confirm("Xoá toàn bộ tin nhắn?")) {
    messagesRef.remove();
  }
}
