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

const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const messageList = document.getElementById("messageList");
const imageBtn = document.getElementById("imageBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPanel = document.getElementById("emojiPanel");
const namePopup = document.getElementById("namePopup");
const nameInput = document.getElementById("nameInput");
const confirmNameBtn = document.getElementById("confirmNameBtn");
const toggleNameBtn = document.getElementById("toggleNameBtn");
const chatWrapper = document.querySelector(".chat-wrapper");
const toggleChatBtn = document.getElementById("toggleChatBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

let username = localStorage.getItem("username") || "Ẩn Danh";
let editingId = null;

// Open name popup if not set
if (!localStorage.getItem("username")) {
  namePopup.style.display = "flex";
}

confirmNameBtn.onclick = () => {
  const name = nameInput.value.trim();
  if (name) {
    username = name;
    localStorage.setItem("username", username);
    namePopup.style.display = "none";
  }
};

toggleNameBtn.onclick = () => {
  namePopup.style.display = "flex";
};

toggleChatBtn.onclick = () => {
  chatWrapper.classList.toggle("hidden");
};

sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (text) {
    const msgData = {
      text,
      user: username,
      time: new Date().toLocaleTimeString(),
      avatar: "https://i.imgur.com/HvD5fJz.png", // Avatar mẫu
      like: 0
    };
    if (editingId) {
      db.ref("messages/" + editingId).update({ text });
      editingId = null;
    } else {
      db.ref("messages").push(msgData);
    }
    msgInput.value = "";
  }
};

function renderMessage(id, data) {
  const div = document.createElement("div");
  div.className = `message ${data.user === username ? "me" : ""}`;
  div.innerHTML = `
    <div style="display:flex; align-items:center;">
      <img src="${data.avatar}" class="avatar">
      <div>
        <strong>${data.user}</strong>
        <div>${data.text}</div>
        <div class="meta">${data.time}</div>
      </div>
    </div>
    ${data.user === username ? `
    <div class="options">
      <button onclick="editMessage('${id}', '${data.text}')">✏️</button>
      <button onclick="deleteMessage('${id}')">🗑️</button>
      <button onclick="recallMessage('${id}')">↩️</button>
    </div>` : `
    <div class="options">
      <button onclick="likeMessage('${id}')">❤️ ${data.like || 0}</button>
    </div>`}
  `;
  return div;
}

db.ref("messages").on("value", (snapshot) => {
  messageList.innerHTML = "";
  snapshot.forEach(child => {
    const msg = child.val();
    const id = child.key;
    const node = renderMessage(id, msg);
    messageList.appendChild(node);
  });
  messageList.scrollTop = messageList.scrollHeight;
});

function editMessage(id, text) {
  msgInput.value = text;
  editingId = id;
  msgInput.focus();
}

function deleteMessage(id) {
  db.ref("messages/" + id).remove();
}

function recallMessage(id) {
  db.ref("messages/" + id).update({ text: "Tin nhắn đã được thu hồi." });
}

function likeMessage(id) {
  db.ref("messages/" + id).once("value").then(snapshot => {
    const msg = snapshot.val();
    db.ref("messages/" + id).update({ like: (msg.like || 0) + 1 });
  });
}

clearAllBtn.onclick = () => {
  if (confirm("Xoá toàn bộ tin nhắn?")) {
    db.ref("messages").remove();
  }
};

emojiBtn.onclick = () => {
  emojiPanel.classList.toggle("show");
};

emojiPanel.querySelectorAll("span").forEach(emoji => {
  emoji.onclick = () => {
    msgInput.value += emoji.textContent;
    emojiPanel.classList.remove("show");
    msgInput.focus();
  };
});

imageBtn.onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const msgData = {
        text: `<img src="${reader.result}" style="max-width:100%;">`,
        user: username,
        time: new Date().toLocaleTimeString(),
        avatar: "https://i.imgur.com/HvD5fJz.png",
        like: 0
      };
      db.ref("messages").push(msgData);
    };
    reader.readAsDataURL(file);
  };
  input.click();
};
