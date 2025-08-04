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
const messagesRef = db.ref("messages");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesUl = document.getElementById("messages");
const imageInput = document.getElementById("imageInput");
const emojiToggle = document.getElementById("emojiToggle");
const emojiPicker = document.getElementById("emojiPicker");
const clearBtn = document.getElementById("clearBtn");

const username = "Ẩn danh";

sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (text !== "") {
    messagesRef.push({
      name: username,
      text,
      time: Date.now()
    });
    messageInput.value = "";
  }
};

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

imageInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    messagesRef.push({
      name: username,
      image: reader.result,
      time: Date.now()
    });
  };
  reader.readAsDataURL(file);
};

emojiToggle.onclick = () => {
  emojiPicker.classList.toggle("hidden");
};

document.addEventListener("click", (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiToggle) {
    emojiPicker.classList.add("hidden");
  }
});

emojiPicker.innerHTML = "😀😃😄😆😁😍🥰😊🤩😎😢😞😔😟😕😣😖😫🥺😭😠😤😡🤬😒🙄😑😬😾💢😲😯😮😳🤯😱😨😰😵🤐🤔😐🤨😇😴🥱🤤😪😷🤒🤕🤧🥶🥵😈👿🤠👻💀👽🫠".split("").map(e => `<span>${e}</span>`).join("");
emojiPicker.onclick = (e) => {
  if (e.target.tagName === "SPAN") {
    messageInput.value += e.target.textContent;
  }
};

messagesRef.on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const li = document.createElement("li");
  li.className = "message sent";
  
  if (msg.text) {
    li.innerHTML = `
      <div>${msg.text}</div>
      ${msg.image ? `<img class="message-img" src="${msg.image}" />` : ""}
      <div class="meta">${msg.name} • ${new Date(msg.time).toLocaleTimeString()}</div>
      <div class="action-icon">👼</div>
      <div class="actions">
        <button onclick="editMessage('${snapshot.key}', '${msg.text}')">✏️ Sửa</button>
        <button onclick="deleteMessage('${snapshot.key}')">🗑️ Thu hồi</button>
      </div>
    `;
  } else if (msg.image) {
    li.innerHTML = `
      <img class="message-img" src="${msg.image}" />
      <div class="meta">${msg.name} • ${new Date(msg.time).toLocaleTimeString()}</div>
      <div class="action-icon">👼</div>
      <div class="actions">
        <button onclick="deleteMessage('${snapshot.key}')">🗑️ Thu hồi</button>
      </div>
    `;
  }

  li.querySelector(".action-icon")?.addEventListener("click", () => {
    li.querySelector(".actions").style.display = "block";
  });

  messagesUl.appendChild(li);
  messagesUl.scrollTop = messagesUl.scrollHeight;
});

function deleteMessage(key) {
  messagesRef.child(key).remove();
}

function editMessage(key, oldText) {
  const newText = prompt("Chỉnh sửa tin nhắn:", oldText);
  if (newText && newText !== oldText) {
    messagesRef.child(key).update({ text: newText });
  }
}

messagesRef.on("child_removed", (snapshot) => {
  const msgEl = document.querySelector(`[data-id="${snapshot.key}"]`);
  if (msgEl) msgEl.remove();
});

clearBtn.onclick = () => {
  if (confirm("Xóa toàn bộ tin nhắn?")) {
    messagesRef.remove();
    messagesUl.innerHTML = "";
  }
};
