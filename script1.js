// ================== LIGHT/DARK MODE ==================
const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  modeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// ================== PROFILE PICTURE ==================
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const btnDelete = document.getElementById("btnDelete");
const setPictureBtn = document.getElementById("setPictureBtn");

setPictureBtn.addEventListener("click", ()=> avatarInput.click());

avatarInput.addEventListener("change", function() {
  const file = this.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = e => { avatarPreview.src = e.target.result; }
    reader.readAsDataURL(file);
  }
});

btnDelete.addEventListener("click", () => {
  avatarPreview.src = "";
  avatarInput.value = "";
});

// ================== CUSTOM SESSION ==================
document.getElementById("session").addEventListener("change", ()=> {
  document.getElementById("customSessionBox").style.display =
    document.getElementById("session").value === "Custom" ? "block" : "none";
});

// ================== SAVE PROFILE ==================
function saveProfile(){
  const avatarSrc = avatarPreview.src;
  const studentData = {
    username: document.getElementById("username").value,
    name: document.getElementById("name").value,
    grade: document.getElementById("grade").value,
    focus: document.getElementById("focus").value,
    session: document.getElementById("session").value,
    customStudy: document.getElementById("study").value,
    customBreak: document.getElementById("break").value,
    maxHours: document.getElementById("maxHours").value,
    sleep: document.getElementById("sleep").value,
    style: document.getElementById("style").value,
    avatar: avatarSrc || null
  };
  localStorage.setItem("studentData", JSON.stringify(studentData));
  alert("Profile Saved Successfully!");
  window.location.href="index.html";
}

// ================== SIDEBAR TOGGLE ==================
const sidebar = document.getElementById("sidebar");
sidebar.addEventListener("mouseenter", ()=> sidebar.classList.add("expanded"));
sidebar.addEventListener("mouseleave", ()=> sidebar.classList.remove("expanded"));