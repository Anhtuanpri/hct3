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

const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chat-box");
const emojiPicker = document.getElementById("emojiPicker");
const imageUpload = document.getElementById("imageUpload");

function toggleEmojiPicker() {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
}

emojiPicker.addEventListener("click", e => {
  if (e.target.textContent) {
    messageInput.value += e.target.textContent;
  }
});

imageUpload.addEventListener("change", () => {
  const file = imageUpload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    sendMessage(reader.result, true);
  };
  reader.readAsDataURL(file);
});

function sendMessage(content, isImage = false) {
  if (!content && !messageInput.value.trim()) return;
  const message = {
    name: "Ẩn danh",
    text: isImage ? "" : messageInput.value.trim(),
    image: isImage ? content : null,
    time: Date.now()
  };
  db.ref("messages").push(message);
  messageInput.value = "";
  emojiPicker.style.display = "none";
}

db.ref("messages").on("value", snapshot => {
  chatBox.innerHTML = "";
  snapshot.forEach(child => {
    const msg = child.val();
    const div = document.createElement("div");
    div.classList.add("message");

    let html = `<div class="name">${msg.name}</div>`;
    if (msg.text) html += `<div class="text">${msg.text}</div>`;
    if (msg.image) html += `<div class="text"><img src="${msg.image}" style="max-width:100%; border-radius: 10px;"></div>`;
    html += `<div class="meta">
               <span>${new Date(msg.time).toLocaleTimeString()}</span>
             </div>`;
    div.innerHTML = html;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});
