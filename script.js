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
const msgInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const msgBox = document.getElementById("messages");
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const imageUpload = document.getElementById("image-upload");
const clearBtn = document.getElementById("clear-chat");
const replyPreview = document.getElementById("reply-preview");

let replyTo = null;

// Emoji Picker
const emojis = ["😀","😁","😂","🤣","😅","😊","😍","😎","😡","😭","😘","🤔"];
emojiBtn.onclick = () => emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none";
emojis.forEach(e => {
  const span = document.createElement("span");
  span.textContent = e;
  span.onclick = () => {
    msgInput.value += e;
    emojiPicker.style.display = "none";
  };
  emojiPicker.appendChild(span);
});

// Send message
sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text && !imageUpload.files.length) return;

  const msgData = {
    name: "Ẩn danh",
    text,
    timestamp: new Date().toLocaleTimeString(),
  };
  if (replyTo) {
    msgData.reply = replyTo;
    replyTo = null;
    replyPreview.style.display = "none";
  }

  // If sending image
  const file = imageUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      msgData.image = reader.result;
      messagesRef.push(msgData);
    };
    reader.readAsDataURL(file);
  } else {
    messagesRef.push(msgData);
  }

  msgInput.value = "";
  imageUpload.value = "";
};

// Show messages
messagesRef.on("child_added", snap => {
  const data = snap.val();
  const div = document.createElement("div");
  div.className = "message " + (data.name === "Ẩn danh" ? "right" : "left");

  const info = document.createElement("div");
  info.className = "info";
  info.innerText = `${data.name} - ${data.timestamp}`;

  const content = document.createElement("div");
  content.innerText = data.text || "";

  if (data.reply) {
    const replyBox = document.createElement("div");
    replyBox.className = "reply-preview";
    replyBox.innerText = `↩️ Trả lời: ${data.reply.text || "[Ảnh]"}`;
    div.appendChild(replyBox);
  }

  if (data.image) {
    const img = document.createElement("img");
    img.src = data.image;
    img.className = "message-image";
    div.appendChild(img);
  }

  // Buttons
  const menu = document.createElement("div");
  menu.className = "message-menu";
  menu.innerHTML = `
    <button class="reply-btn">↩️</button>
    <button class="delete-btn">🗑️</button>
  `;
  menu.querySelector(".reply-btn").onclick = () => {
    replyTo = data;
    replyPreview.style.display = "block";
    replyPreview.innerText = `↩️ Đang trả lời: ${data.text || "[Ảnh]"}`;
  };
  menu.querySelector(".delete-btn").onclick = () => {
    messagesRef.child(snap.key).remove();
    div.remove();
  };

  div.appendChild(info);
  div.appendChild(content);
  div.appendChild(menu);

  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
});

// Clear chat
clearBtn.onclick = () => {
  if (confirm("Xóa toàn bộ tin nhắn?")) {
    messagesRef.remove();
    msgBox.innerHTML = "";
  }
};
