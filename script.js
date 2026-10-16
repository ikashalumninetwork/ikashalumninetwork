/*
  PENGATURAN ADMIN IKASH
  1. Masukkan link undangan WhatsApp resmi pada variabel di bawah.
  2. QR contoh pada folder assets BUKAN QR pembayaran aktif. Ganti hanya dengan QR resmi yang sudah diverifikasi.
*/
const IKASH_WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/FgT5aGB1WZs6EqXm6DNiHJ?s=cl&p=a&mlu=4&ilr=4";
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") !== "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap");
  try { localStorage.setItem("ikash-theme", isDark ? "dark" : "light"); } catch (e) {}
});
try {
  const savedTheme = localStorage.getItem("ikash-theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀";
  }
} catch (e) {}

const mobileMenu = document.getElementById("mobileMenu");
const mainNav = document.getElementById("mainNav");
mobileMenu.addEventListener("click", () => {
  mainNav.classList.toggle("open");
  mobileMenu.textContent = mainNav.classList.contains("open") ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open");
  mobileMenu.textContent = "☰";
}));

document.querySelectorAll("[data-wa]").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  if (IKASH_WHATSAPP_GROUP_LINK.startsWith("https://chat.whatsapp.com/") &&
      !IKASH_WHATSAPP_GROUP_LINK.includes("MASUKKAN_LINK")) {
    window.open(IKASH_WHATSAPP_GROUP_LINK, "_blank", "noopener,noreferrer");
  } else {
    showToast("Link grup WhatsApp belum diatur. Admin IKASH perlu memasukkan link undangan resmi di script.js.");
  }
}));


document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  const category = button.dataset.filter;
  document.querySelectorAll(".gallery-card").forEach(card => {
    card.style.display = category === "all" || card.dataset.category === category ? "flex" : "none";
  });
}));

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
function openModal(title, body) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
document.querySelectorAll("[data-info]").forEach(button => button.addEventListener("click", () => {
  const parts = button.dataset.info.split("|");
  openModal(parts[0], parts[1]);
}));
function makeGalleryCard(item) {
  const card = document.createElement("button");
  card.className = "gallery-card saved-gallery-card";
  card.dataset.category = item.category;
  card.dataset.title = item.title;
  card.dataset.savedId = item.id;
  const img = document.createElement("img");
  img.className = "gallery-photo"; img.src = item.dataUrl; img.alt = item.title;
  const title = document.createElement("b"); title.textContent = item.title;
  const meta = document.createElement("small"); meta.textContent = ({reuni:"Temu Alumni", sosial:"Kegiatan Sosial", pondok:"Kenangan Pondok"})[item.category] || "Dokumentasi IKASH";
  const open = document.createElement("span"); open.className = "gallery-open"; open.textContent = "Lihat foto ↗";
  card.append(img, title, meta, open);
  card.addEventListener("click", () => {
    modalTitle.textContent = item.title;
    modalBody.textContent = "Foto ini tersimpan di browser/perangkat yang digunakan untuk menambahkannya. Untuk menghapusnya, gunakan tombol hapus pada kartu galeri.";
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
  });
  const del = document.createElement("button"); del.type = "button"; del.className = "gallery-delete"; del.textContent = "Hapus"; del.setAttribute("aria-label", "Hapus " + item.title);
  del.addEventListener("click", event => { event.stopPropagation(); removeSavedPhoto(item.id); });
  card.appendChild(del);
  return card;
}
function getSavedPhotos() { try { return JSON.parse(localStorage.getItem("ikash-gallery-photos") || "[]"); } catch (e) { return []; } }
function renderSavedPhotos() {
  const grid = document.querySelector(".gallery-grid");
  grid.querySelectorAll(".saved-gallery-card").forEach(card => card.remove());
  getSavedPhotos().forEach(item => grid.appendChild(makeGalleryCard(item)));
  applyGalleryFilter(document.querySelector(".filter.active")?.dataset.filter || "all");
}
function removeSavedPhoto(id) {
  const photos = getSavedPhotos().filter(item => item.id !== id);
  try { localStorage.setItem("ikash-gallery-photos", JSON.stringify(photos)); renderSavedPhotos(); showToast("Foto dihapus dari galeri perangkat ini."); }
  catch (e) { showToast("Foto tidak dapat dihapus. Coba muat ulang halaman."); }
}
function applyGalleryFilter(category) {
  document.querySelectorAll(".gallery-card").forEach(card => { card.style.display = category === "all" || card.dataset.category === category ? "flex" : "none"; });
}
document.querySelectorAll(".gallery-card:not(.saved-gallery-card)").forEach(card => card.addEventListener("click", () => {
  openModal(card.dataset.title, "Ini kartu kategori galeri. Gunakan tombol Tambah foto ke galeri untuk menyimpan dokumentasi pada browser ini.");
}));
document.getElementById("galleryFiles").addEventListener("change", async event => {
  const files = Array.from(event.target.files || []).filter(file => file.type.startsWith("image/"));
  if (!files.length) return;
  const category = (prompt("Kategori foto: ketik reuni, sosial, atau pondok", "reuni") || "reuni").toLowerCase();
  const validCategory = ["reuni", "sosial", "pondok"].includes(category) ? category : "reuni";
  const current = getSavedPhotos();
  for (const file of files) {
    if (file.size > 3 * 1024 * 1024) { showToast("Foto " + file.name + " lebih dari 3 MB, dilewati."); continue; }
    const title = (prompt("Judul untuk foto: " + file.name, file.name.replace(/\.[^.]+$/, "")) || file.name).trim();
    const dataUrl = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => resolve(null); reader.readAsDataURL(file); });
    if (dataUrl) current.push({id: Date.now().toString(36) + Math.random().toString(36).slice(2,7), title: title || "Dokumentasi IKASH", category: validCategory, dataUrl});
  }
  try { localStorage.setItem("ikash-gallery-photos", JSON.stringify(current)); renderSavedPhotos(); showToast("Foto tersimpan di galeri browser ini."); }
  catch (e) { showToast("Penyimpanan browser penuh. Coba foto yang lebih kecil."); }
  event.target.value = "";
});
renderSavedPhotos();
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOk").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

document.getElementById("year").textContent = new Date().getFullYear();
