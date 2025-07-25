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

const userId = Date.now(); // dùng làm user tạm thời

const chatMessages = document.getElementById("chatMessages");
const emojiPicker = document.getElementById("emojiPicker");
const messageInput = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");

let replyTo = null;

// Emoji picker
const emojis = ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😙","😚"];
emojis.forEach(e => {
  const span = document.createElement("span");
  span.textContent = e;
  span.onclick = () => {
    messageInput.value += e;
  };
  emojiPicker.appendChild(span);
});

function toggleEmojiPicker() {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none";
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text && !imageInput.files[0]) return;

  const message = {
    id: Date.now(),
    sender: "Ẩn danh",
    text,
    time: new Date().toLocaleTimeString(),
    uid: userId,
    like: 0,
    reply: replyTo ? replyTo.text : null
  };

  db.ref("messages").push(message);
  messageInput.value = "";
  replyTo = null;
  document.getElementById("replyBox").style.display = "none";
}

function cancelReply() {
  replyTo = null;
  document.getElementById("replyBox").style.display = "none";
}

function renderMessage(id, data) {
  const msg = document.createElement("div");
  msg.className = "chat-message " + (data.uid === userId ? "right" : "left");
  msg.id = id;

  msg.innerHTML = `
    <div><strong>${data.sender}</strong>${data.reply ? `<br><i>↪ ${data.reply}</i>` : ""}<br>${data.text}</div>
    <div class="message-meta">${data.time} ❤️ ${data.like}</div>
    <div class="message-actions">
      <button onclick="likeMessage('${id}')">❤️</button>
      <button onclick="deleteMessage('${id}')">🗑️</button>
      <button onclick="replyMessage('${id}')">↩️</button>
    </div>
  `;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function likeMessage(id) {
  const ref = db.ref("messages/" + id);
  ref.once("value", snap => {
    if (snap.exists()) {
      const data = snap.val();
      ref.update({ like: (data.like || 0) + 1 });
    }
  });
}

function deleteMessage(id) {
  db.ref("messages/" + id).remove();
}

function replyMessage(id) {
  db.ref("messages/" + id).once("value", snap => {
    if (snap.exists()) {
      replyTo = { id, text: snap.val().text };
      document.getElementById("replyBox").style.display = "flex";
      document.getElementById("replyText").textContent = snap.val().text;
    }
  });
}

db.ref("messages").on("child_added", snap => {
  renderMessage(snap.key, snap.val());
});

db.ref("messages").on("child_removed", snap => {
  const msg = document.getElementById(snap.key);
  if (msg) msg.remove();
});

document.getElementById("clearChat").onclick = () => {
  if (confirm("Xoá toàn bộ tin nhắn?")) {
    db.ref("messages").remove();
  }
};
