// === Firebase config ===
const firebaseConfig = {
  apiKey: "AIzaSyDL54a3OIuzaxY_IEQgscCzIfBWCQqvhcM",
  authDomain: "sample-firebase-ai-app-2a091.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-2a091-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-ai-app-2a091",
  storageBucket: "sample-firebase-ai-app-2a091.appspot.com",
  messagingSenderId: "94515253749",
  appId: "1:94515253749:web:86594f2222889c6472d0bc"
};

// === Khởi tạo Firebase ===
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref("messages");

let username = localStorage.getItem("chatUsername") || "Anonymous";
let editingKey = null;

// Gửi tin nhắn
function sendMessage(text, imageUrl = null) {
  if (editingKey) {
    messagesRef.child(editingKey).update({
      text,
      imageUrl,
      edited: true,
    });
    editingKey = null;
  } else {
    const message = {
      user: username,
      text,
      imageUrl,
      timestamp: Date.now()
    };
    messagesRef.push(message);
  }
  document.getElementById("messageInput").value = "";
  hideEmojiPicker();
}

// Hiển thị tin nhắn
function renderMessage(key, data) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(data.user === username ? "sent" : "received");

  const sender = document.createElement("div");
  sender.style.fontSize = "11px";
  sender.style.marginBottom = "3px";
  sender.textContent = data.user;

  const text = document.createElement("div");
  text.textContent = data.text;

  messageDiv.appendChild(sender);
  messageDiv.appendChild(text);

  if (data.imageUrl) {
    const img = document.createElement("img");
    img.src = data.imageUrl;
    messageDiv.appendChild(img);
  }

  // 👼 icon mở menu
  if (data.user === username) {
    const optionsToggle = document.createElement("div");
    optionsToggle.textContent = "👼";
    optionsToggle.className = "options-toggle";

    const optionsMenu = document.createElement("div");
    optionsMenu.className = "message-options";

    const recallBtn = document.createElement("button");
    recallBtn.textContent = "Thu hồi";
    recallBtn.onclick = () => {
      messagesRef.child(key).remove();
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "Chỉnh sửa";
    editBtn.onclick = () => {
      document.getElementById("messageInput").value = data.text;
      editingKey = key;
    };

    optionsMenu.appendChild(recallBtn);
    optionsMenu.appendChild(editBtn);

    optionsToggle.onclick = () => {
      optionsMenu.style.display = optionsMenu.style.display === "flex" ? "none" : "flex";
    };

    messageDiv.appendChild(optionsToggle);
    messageDiv.appendChild(optionsMenu);
  }

  document.getElementById("messagesContainer").appendChild(messageDiv);
  scrollToBottom();
}

// Tự động cuộn xuống dưới
function scrollToBottom() {
  const container = document.getElementById("messagesContainer");
  container.scrollTop = container.scrollHeight;
}

// Lắng nghe tin nhắn mới
messagesRef.on("child_added", snapshot => {
  renderMessage(snapshot.key, snapshot.val());
});

// Tin nhắn bị xóa
messagesRef.on("child_removed", snapshot => {
  document.getElementById("messagesContainer").innerHTML = "";
  messagesRef.once("value", snap => {
    snap.forEach(child => {
      renderMessage(child.key, child.val());
    });
  });
});

// Tin nhắn được chỉnh sửa
messagesRef.on("child_changed", snapshot => {
  document.getElementById("messagesContainer").innerHTML = "";
  messagesRef.once("value", snap => {
    snap.forEach(child => {
      renderMessage(child.key, child.val());
    });
  });
});

// Gửi văn bản
document.getElementById("sendBtn").onclick = () => {
  const input = document.getElementById("messageInput");
  if (input.value.trim()) sendMessage(input.value.trim());
};

// Gửi ảnh
document.getElementById("imageInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    sendMessage("", e.target.result);
  };
  reader.readAsDataURL(file);
});

// Clear chat
document.getElementById("clearChatBtn").onclick = () => {
  if (confirm("Bạn có chắc muốn xóa toàn bộ tin nhắn?")) {
    messagesRef.remove();
  }
};

// Emoji picker
let pickerVisible = false;
const picker = new EmojiButton();
document.getElementById("emojiBtn").addEventListener("click", () => {
  picker.togglePicker(document.getElementById("emojiBtn"));
});
picker.on("emoji", emoji => {
  document.getElementById("messageInput").value += emoji;
});

// Đóng picker khi nhấn ngoài
document.addEventListener("click", function (e) {
  if (!e.target.closest(".emoji-picker") && !e.target.closest("#emojiBtn")) {
    hideEmojiPicker();
  }
});

function hideEmojiPicker() {
  const pickerEl = document.querySelector(".emoji-picker");
  if (pickerEl) pickerEl.remove();
}
