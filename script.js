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
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chat-messages");
const imageUpload = document.getElementById("imageUpload");

let currentUser = "Ẩn danh";
let editingId = null;

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text && !imageUpload.files[0]) return;

  const msg = {
    sender: currentUser,
    text,
    timestamp: Date.now()
  };

  if (editingId) {
    db.ref("messages/" + editingId).update(msg);
    editingId = null;
  } else {
    const newMsgRef = db.ref("messages").push();
    msg.id = newMsgRef.key;

    if (imageUpload.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        msg.image = e.target.result;
        newMsgRef.set(msg);
      };
      reader.readAsDataURL(imageUpload.files[0]);
    } else {
      newMsgRef.set(msg);
    }
  }

  messageInput.value = "";
  imageUpload.value = "";
}

function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "message " + (msg.sender === currentUser ? "my-message" : "other-message");
  div.innerHTML = `
    ${msg.text ? `<div>${msg.text}</div>` : ""}
    ${msg.image ? `<img src="${msg.image}" />` : ""}
    <div class="info">${msg.sender} • ${new Date(msg.timestamp).toLocaleTimeString()}</div>
    ${msg.sender === currentUser ? `
      <div class="message-actions">
        <button onclick="editMessage('${msg.id}', \`${msg.text || ""}\`)">✏️</button>
        <button onclick="deleteMessage('${msg.id}')">🗑️</button>
        <button onclick="recallMessage('${msg.id}')">↩️</button>
      </div>
    ` : ""}
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function editMessage(id, text) {
  messageInput.value = text;
  editingId = id;
}

function deleteMessage(id) {
  db.ref("messages/" + id).remove();
}

function recallMessage(id) {
  db.ref("messages/" + id).update({ text: "Tin nhắn đã được thu hồi", image: null });
}

db.ref("messages").on("value", snapshot => {
  chatMessages.innerHTML = "";
  snapshot.forEach(child => {
    renderMessage(child.val());
  });
});
