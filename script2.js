const scamData = [
  { name: "88181", link: "https://hoathinh3d.mx/profile/88181" },
  { name: "97955", link: "https://hoathinh3d.mx/profile/97955" },
  { name: "93998", link: "https://hoathinh3d.mx/profile/93998" },
  { name: "104115", link: "https://hoathinh3d.mx/profile/104115" },
  { name: "101460", link: "https://hoathinh3d.mx/profile/101460" },
  { name: "107058", link: "https://hoathinh3d.mx/profile/107058" }
];

// Cuộn ngang LED (có avatar)
const scamList = document.getElementById("scamList");
scamData.forEach((item) => {
  const div = document.createElement("div");
  div.className = "scam-item";

  // Ảnh đại diện anonymous
  const img = document.createElement("img");
  img.src = "https://i.ibb.co/jv01F3Jy/IMG-4761.png";
  img.alt = "Anonymous Avatar";
  img.className = "avatar";

  // Tên/ID scam
  const a = document.createElement("a");
  a.href = item.link;
  a.target = "_blank";
  a.textContent = item.name;

  div.appendChild(img);
  div.appendChild(a);
  scamList.appendChild(div);
});
// Bảng xếp hạng
const scamTable = document.querySelector("#scamTable tbody");
function renderTable(data) {
  scamTable.innerHTML = "";
  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td><a href="${item.link}" target="_blank">Xem Link</a></td>
    `;
    scamTable.appendChild(row);
  });
}
renderTable(scamData);

// Tìm kiếm gần đúng
document.getElementById("searchInput").addEventListener("input", function() {
  const keyword = this.value.trim().toLowerCase();
  const filtered = scamData.filter(item =>
    item.name.toLowerCase().includes(keyword)
  );
  renderTable(filtered);
});
