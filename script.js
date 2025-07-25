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

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const imageUpload = document.getElementById("image-upload");

let user = "Ẩn danh";

const emojis = ["😀", "😂", "😍", "😎", "🤔", "😢", "👍", "👎", "🔥", "🎉"];
emojis.forEach(emoji => {
  const span = document.createElement("span");
  span.textContent = emoji;
  span.style.cursor = "pointer";
  span.onclick = () => {
    messageInput.value += emoji;
    emojiPicker.classList.add("hidden");
  };
  emojiPicker.appendChild(span);
});

emojiBtn.onclick = () => {
  emojiPicker.classList.toggle("hidden");
};

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (text) {
    const message = {
      sender: user,
      text,
      time: Date.now()
    };
    db.ref("messages").push(message);
    messageInput.value = "";
  }
};

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const message = {
        sender: user,
        image: reader.result,
        time: Date.now()
      };
      db.ref("messages").push(message);
    };
    reader.readAsDataURL(file);
  }
});

clearBtn.onclick = () => {
  if (confirm("Xoá toàn bộ tin nhắn?")) {
    db.ref("messages").remove();
  }
};

function renderMessage(id, data) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(data.sender === user ? "sent" : "received");

  if (data.text) {
    div.innerHTML = `<div>${data.text}</div>`;
  } else if (data.image) {
    div.innerHTML = `<img src="${data.image}" style="max-width: 100%;">`;
  }

  if (data.sender === user) {
    const toolsBtn = document.createElement("button");
    toolsBtn.className = "tools-btn";
    toolsBtn.textContent = "👼";
    toolsBtn.onclick = () => div.classList.toggle("show-tools");
    div.appendChild(toolsBtn);

    const actionBar = document.createElement("div");
    actionBar.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => {
      const newText = prompt("Chỉnh sửa tin nhắn:", data.text || "");
      if (newText !== null) {
        db.ref("messages/" + id).update({ text: newText });
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = () => {
      if (confirm("Thu hồi tin nhắn này?")) {
        db.ref("messages/" + id).remove();
      }
    };

    actionBar.appendChild(editBtn);
    actionBar.appendChild(deleteBtn);
    div.appendChild(actionBar);
  }

  chatBox.appendChild(div);
}

db.ref("messages").on("value", snapshot => {
  chatBox.innerHTML = "";
  snapshot.forEach(child => {
    renderMessage(child.key, child.val());
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});
