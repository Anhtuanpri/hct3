// Firebase config (bạn đã xác nhận đúng)
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
const messageList = document.getElementById("messageList");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendBtn");
const emojiToggle = document.getElementById("emojiToggle");
const emojiPicker = document.getElementById("emojiPicker");
const imageInput = document.getElementById("imageInput");
const imageBtn = document.getElementById("imageBtn");

let editingKey = null;
let replyTo = null;

// Gửi tin nhắn
sendButton.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text && !imageInput.files[0]) return;

  const messageData = {
    name: "Ẩn danh",
    text: text || "",
    timestamp: Date.now(),
    replyTo: replyTo || null,
  };

  // Nếu là hình ảnh
  if (imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      messageData.image = reader.result;
      sendToFirebase(messageData);
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    sendToFirebase(messageData);
  }

  messageInput.value = "";
  imageInput.value = "";
  replyTo = null;
  renderReplyLabel();
});

function sendToFirebase(data) {
  if (editingKey) {
    db.ref("messages/" + editingKey).update(data);
    editingKey = null;
  } else {
    db.ref("messages").push(data);
  }
}

// Hiển thị tin nhắn
db.ref("messages").on("value", (snapshot) => {
  messageList.innerHTML = "";
  const data = snapshot.val();
  for (let key in data) {
    const msg = data[key];
    const item = document.createElement("li");
    item.className = "message-item";

    const msgBox = document.createElement("div");
    msgBox.className = "message-content";

    if (msg.replyTo) {
      const replyDiv = document.createElement("div");
      replyDiv.style.fontSize = "0.75rem";
      replyDiv.style.color = "#888";
      replyDiv.style.marginBottom = "5px";
      replyDiv.textContent = `↪️ Trả lời: ${msg.replyTo}`;
      msgBox.appendChild(replyDiv);
    }

    const msgText = document.createElement("div");
    msgText.className = "message-text";
    msgText.textContent = msg.text || "";
    msgBox.appendChild(msgText);

    if (msg.image) {
      const img = document.createElement("img");
      img.src = msg.image;
      img.className = "message-img";
      msgBox.appendChild(img);
    }

    const timestamp = document.createElement("div");
    timestamp.className = "timestamp";
    timestamp.textContent = new Date(msg.timestamp).toLocaleTimeString();
    msgBox.appendChild(timestamp);

    const actions = document.createElement("div");
    actions.className = "message-actions";
    actions.innerHTML = `
      <button onclick="editMessage('${key}', \`${msg.text || ""}\`)">✏️</button>
      <button onclick="deleteMessage('${key}')">🗑️</button>
      <button onclick="replyMessage('${msg.text || "Tin nhắn"}')">↩️</button>
    `;
    msgBox.appendChild(actions);

    item.appendChild(msgBox);
    messageList.appendChild(item);
  }

  messageList.scrollTop = messageList.scrollHeight;
});

function editMessage(key, text) {
  messageInput.value = text;
  editingKey = key;
}

function deleteMessage(key) {
  db.ref("messages/" + key).remove();
}

function replyMessage(content) {
  replyTo = content.slice(0, 50);
  renderReplyLabel();
}

function renderReplyLabel() {
  const existing = document.getElementById("replyLabel");
  if (existing) existing.remove();

  if (replyTo) {
    const label = document.createElement("div");
    label.id = "replyLabel";
    label.style.padding = "5px 10px";
    label.style.background = "#333";
    label.style.color = "#fff";
    label.textContent = `Trả lời: ${replyTo}`;
    document.querySelector(".input-container").prepend(label);
  }
}

// Hiện emoji picker
emojiToggle.addEventListener("click", () => {
  emojiPicker.classList.toggle("hidden");
});

emojiPicker.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    messageInput.value += e.target.textContent;
  }
});

imageBtn.addEventListener("click", () => {
  imageInput.click();
});
