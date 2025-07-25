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
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const imageInput = document.getElementById("imageInput");
const imageBtn = document.getElementById("imageBtn");
const clearBtn = document.getElementById("clearBtn");

const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emoji-picker");

const emojis = ["😀", "😂", "😍", "🥺", "😎", "😡", "👍", "🎉", "😭", "❤️"];

emojis.forEach(emoji => {
  const span = document.createElement("span");
  span.textContent = emoji;
  span.style.cursor = "pointer";
  span.onclick = () => {
    messageInput.value += emoji;
    emojiPicker.classList.add("hidden");
    emojiVisible = false;
  };
  emojiPicker.appendChild(span);
});

let emojiVisible = false;

emojiBtn.onclick = (e) => {
  e.stopPropagation();
  emojiPicker.classList.toggle("hidden");
  emojiVisible = !emojiVisible;
};

document.addEventListener("click", (e) => {
  if (emojiVisible && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.classList.add("hidden");
    emojiVisible = false;
  }
});

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const msg = {
    text,
    time: Date.now(),
    sender: "me"
  };

  db.ref("messages").push(msg);
  messageInput.value = "";
};

imageBtn.onclick = () => imageInput.click();

imageInput.onchange = () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const msg = {
      image: reader.result,
      time: Date.now(),
      sender: "me"
    };
    db.ref("messages").push(msg);
  };
  reader.readAsDataURL(file);
};

clearBtn.onclick = () => {
  if (confirm("Xóa toàn bộ tin nhắn?")) {
    db.ref("messages").remove();
  }
};

db.ref("messages").on("value", (snapshot) => {
  messages.innerHTML = "";
  snapshot.forEach((child) => {
    const msg = child.val();
    const id = child.key;

    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.sender === "me" ? "sent" : "received");

    if (msg.text) {
      div.innerHTML = `<div>${msg.text}</div>`;
    } else if (msg.image) {
      div.innerHTML = `<img src="${msg.image}" />`;
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = new Date(msg.time).toLocaleTimeString();
    div.appendChild(meta);

    if (msg.sender === "me") {
      const action = document.createElement("div");
      action.className = "action-btn";
      action.textContent = "👼";

      const options = document.createElement("div");
      options.className = "options";

      const edit = document.createElement("button");
      edit.textContent = "✏️";
      edit.onclick = () => {
        const newText = prompt("Chỉnh sửa tin nhắn:", msg.text || "");
        if (newText !== null) {
          db.ref("messages").child(id).update({ text: newText });
        }
      };

      const del = document.createElement("button");
      del.textContent = "🗑️";
      del.onclick = () => {
        db.ref("messages").child(id).remove();
      };

      options.appendChild(edit);
      options.appendChild(del);
      div.appendChild(action);
      div.appendChild(options);
    }

    messages.appendChild(div);
  });

  messages.scrollTop = messages.scrollHeight;
});
