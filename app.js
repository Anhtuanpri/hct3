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
const messageBox = document.getElementById("chat-messages");
const imageInput = document.getElementById("imageInput");

let userId = localStorage.getItem("chatUserId") || Date.now().toString();
localStorage.setItem("chatUserId", userId);

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text && !imageInput.files[0]) return;

  const msg = {
    id: Date.now(),
    sender: userId,
    text: text,
    image: "",
    time: new Date().toLocaleTimeString()
  };

  if (imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      msg.image = reader.result;
      db.ref("messages").push(msg);
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    db.ref("messages").push(msg);
  }

  messageInput.value = "";
  imageInput.value = "";
}

function renderMessage(id, msg) {
  const div = document.createElement("div");
  div.className = "message" + (msg.sender === userId ? " mine" : "");
  div.innerHTML = `
    <div>${msg.text || ""}</div>
    ${msg.image ? `<img src="${msg.image}" />` : ""}
    <div class="meta">${msg.time}</div>
    ${msg.sender === userId ? `
      <div class="controls">
        <span onclick="editMessage('${id}', '${msg.text.replace(/'/g, "\\'")}')">✏️</span>
        <span onclick="deleteMessage('${id}')">❌</span>
      </div>` : ""}
  `;
  messageBox.appendChild(div);
  messageBox.scrollTop = messageBox.scrollHeight;
}

function deleteMessage(id) {
  db.ref("messages").child(id).remove();
}

function editMessage(id, oldText) {
  const newText = prompt("Chỉnh sửa tin nhắn:", oldText);
  if (newText !== null && newText.trim() !== "") {
    db.ref("messages").child(id).update({ text: newText });
  }
}

db.ref("messages").on("value", (snapshot) => {
  messageBox.innerHTML = "";
  snapshot.forEach((child) => {
    renderMessage(child.key, child.val());
  });
});

function toggleEmojiPicker() {
  const picker = document.getElementById("emojiPicker");
  picker.style.display = picker.style.display === "none" ? "flex" : "none";
  if (picker.innerHTML === "") {
    const emojis = ["😀","😅","😂","😍","😎","😭","😡","👍","🙏","❤️"];
    emojis.forEach(emoji => {
      const span = document.createElement("span");
      span.textContent = emoji;
      span.onclick = () => {
        messageInput.value += emoji;
      };
      picker.appendChild(span);
    });
  }
}
