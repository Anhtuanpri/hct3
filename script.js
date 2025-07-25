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
const chatBox = document.getElementById("chat-messages");
const messageInput = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");

let user = "Ẩn danh";

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text && !imageInput.files[0]) return;

  const message = {
    name: user,
    text: text || "",
    time: Date.now(),
    image: ""
  };

  if (imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      message.image = reader.result;
      db.ref("messages").push(message);
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    db.ref("messages").push(message);
  }

  messageInput.value = "";
  imageInput.value = "";
}

function renderMessage(id, msg) {
  const div = document.createElement("div");
  div.className = "message" + (msg.name === user ? " sent" : " received");
  div.innerHTML = `<b>${msg.name}:</b> ${msg.text}`;

  if (msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    div.appendChild(img);
  }

  if (msg.name === user) {
    const opt = document.createElement("div");
    opt.className = "options";
    const angelBtn = document.createElement("button");
    angelBtn.innerText = "👼";
    angelBtn.classList.add("emoji-btn");
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.innerHTML = `
      <button onclick="editMessage('${id}', '${msg.text.replace(/'/g, "\\'")}')">✏️</button>
      <button onclick="deleteMessage('${id}')">❌</button>
    `;
    angelBtn.onclick = () => {
      actions.classList.toggle("show");
    };
    opt.appendChild(angelBtn);
    opt.appendChild(actions);
    div.appendChild(opt);
  }

  chatBox.appendChild(div);
}

function editMessage(id, oldText) {
  const newText = prompt("Sửa tin nhắn:", oldText);
  if (newText !== null) {
    db.ref("messages/" + id).update({ text: newText });
  }
}

function deleteMessage(id) {
  db.ref("messages/" + id).remove();
}

function clearChat() {
  if (confirm("Xoá toàn bộ tin nhắn?")) {
    db.ref("messages").remove();
  }
}

db.ref("messages").on("value", snapshot => {
  chatBox.innerHTML = "";
  snapshot.forEach(child => {
    renderMessage(child.key, child.val());
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

const emojiPicker = document.getElementById("emojiPicker");
const emojiBtn = document.getElementById("emojiBtn");

const emojis = ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","😍","😘","😗","😙","😚","😋","😛","😜","😝"];

emojiBtn.addEventListener("click", () => {
  emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none";
});

emojis.forEach(e => {
  const span = document.createElement("span");
  span.textContent = e;
  span.onclick = () => {
    messageInput.value += e;
    emojiPicker.style.display = "none";
  };
  emojiPicker.appendChild(span);
});

document.addEventListener("click", (e) => {
  if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
    emojiPicker.style.display = "none";
  }
});
