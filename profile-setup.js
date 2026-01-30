// Theme Toggle Functionality
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme === "dark") {
  body.classList.add("dark");
} else {
  body.classList.remove("dark");
}
updateThemeIcon();

themeToggle.addEventListener("click", () => {
  if (body.classList.contains("dark")) {
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
  updateThemeIcon();
});

function updateThemeIcon() {
  const icon = themeToggle.querySelector("i");
  if (body.classList.contains("dark")) {
    icon.className = "fa-solid fa-sun";
  } else {
    icon.className = "fa-solid fa-moon";
  }
}

// Avatar Management
const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");
const setPictureBtn = document.getElementById("setPictureBtn");
const btnDelete = document.getElementById("btnDelete");

// Load saved avatar
const savedAvatar = localStorage.getItem("userAvatar");
if (savedAvatar) {
  avatarPreview.innerHTML = `<img src="${savedAvatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
}

// Set Picture Button
setPictureBtn.addEventListener("click", () => {
  avatarInput.click();
});

// Handle File Selection
avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      avatarPreview.innerHTML = `<img src="${imageUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      localStorage.setItem("userAvatar", imageUrl);
    };
    reader.readAsDataURL(file);
  }
});

// Remove Picture Button
btnDelete.addEventListener("click", () => {
  avatarPreview.innerHTML = '<i class="fa fa-user"></i>';
  localStorage.removeItem("userAvatar");
  avatarInput.value = "";
});

// Custom Session Toggle
const sessionSelect = document.getElementById("session");
const customSessionBox = document.getElementById("customSessionBox");

sessionSelect.addEventListener("change", () => {
  if (sessionSelect.value === "Custom") {
    customSessionBox.style.display = "flex";
  } else {
    customSessionBox.style.display = "none";
  }
});

// Form Submission
const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Collect form data
  const profileData = {
    username: document.getElementById("username").value,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    grade: document.getElementById("grade").value,
    focus: document.getElementById("focus").value,
    session: document.getElementById("session").value,
    style: document.getElementById("style").value,
    maxHours: document.getElementById("maxHours").value,
    sleep: document.getElementById("sleep").value,
    avatar: localStorage.getItem("userAvatar") || null,
    // Study goals
    weeklyHours: document.getElementById("weeklyHours").value || null,
    dailyGoal: document.getElementById("dailyGoal").value || null,
    learningTarget: document.getElementById("learningTarget").value || null,
  };

  // Add custom session if selected
  if (profileData.session === "Custom") {
    profileData.customStudy = document.getElementById("study").value;
    profileData.customBreak = document.getElementById("break").value;
  }

  // Save to localStorage
  localStorage.setItem("userProfile", JSON.stringify(profileData));

  // Show success message
  alert("Profile saved successfully!");

  // Redirect to subjects page
  window.location.href = "subjects.html";
});
