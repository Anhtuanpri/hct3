// script.js

// 1. Config Firebase (thay bằng config project của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyCgTSTsGQaeGT9eaQCoCF6m58MBsdbHz-0",
  authDomain: "phan1-f7af4.firebaseapp.com",
  databaseURL: "https://phan1-f7af4-default-rtdb.firebaseio.com", // ✅ nhớ có databaseURL
  projectId: "phan1-f7af4",
  storageBucket: "phan1-f7af4.appspot.com",
  messagingSenderId: "673326593732",
  appId: "1:673326593732:web:c7dd17ff2036264d25bb91",
  measurementId: "G-6WY24EN28R"
};

// 2. Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 3. DOM elements
const messagesList = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// 4. Hàm gửi tin nhắn
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  const msg = {
    text,
    time: Date.now()
  };
  firebase.database().ref("messages").push(msg);
  input.value = "";
}

// 5. Lắng nghe tin nhắn mới (Realtime)
firebase.database().ref("messages").on("child_added", (snapshot) => {
  const msg = snapshot.val();
  const li = document.createElement("li");
  li.className = "message";
  li.innerHTML = `
    <div class="text">${msg.text}</div>
    <div class="meta">${new Date(msg.time).toLocaleTimeString()}</div>
  `;
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
});

// 6. Gửi khi bấm nút hoặc Enter
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
