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

let userName = localStorage.getItem("chatName");
const popup = document.getElementById("namePopup");

if (!userName) {
  popup.style.display = "flex";
}

function saveName() {
  const input = document.getElementById("nameInput").value.trim();
  if (input) {
    userName = input;
    localStorage.setItem("chatName", userName);
    popup.style.display = "none";
  }
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text && !selectedImage) return;

  const msg = {
    name: userName || "Ẩn danh",
    text: text,
    image: selectedImage || null,
    time: Date.now()
  };
  db.ref("chat").push(msg);
  input.value = "";
  selectedImage = null;
}

function clearMessages() {
  if (confirm("Xóa toàn bộ tin nhắn?")) {
    db.ref("chat").remove();
  }
}

function formatTime(ms) {
  const date = new Date(ms);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const chatBox = document.getElementById("chatMessages");

db.ref("chat").on("value", snapshot => {
  chatBox.innerHTML = "";
  snapshot.forEach(child => {
    const msg = child.val();
    const div = document.createElement("div");
    div.className = "message";
    if (msg.name === userName) div.classList.add("you");

    div.innerHTML = `
      <div class="name">${msg.name}</div>
      ${msg.image ? `<img src="${msg.image}" style="max-width:100%;border-radius:10px;margin-top:5px;">` : ""}
      <div class="text">${msg.text}</div>
      <div class="time">${formatTime(msg.time)}</div>
    `;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

let selectedImage = null;

document.getElementById("imageInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

function insertEmoji() {
  const input = document.getElementById("messageInput");
  input.value += "😊";
}
