// ================== THEME TOGGLE ==================
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const icon = themeToggle.querySelector("i");

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  icon.classList.replace("fa-moon", "fa-sun");
}

// Toggle theme
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    icon.classList.replace("fa-moon", "fa-sun");
    localStorage.setItem("theme", "dark");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
    localStorage.setItem("theme", "light");
  }
});


// ================== MODAL FUNCTIONALITY ==================
const helpLink = document.getElementById("helpLink");
const faqLink = document.getElementById("faqLink");
const supportLink = document.getElementById("supportLink");

const helpModal = document.getElementById("helpModal");
const faqModal = document.getElementById("faqModal");
const supportModal = document.getElementById("supportModal");

const closeButtons = document.querySelectorAll(".close-modal");

// Open modals
if (helpLink) helpLink.addEventListener("click", (e) => {
  e.preventDefault();
  helpModal.classList.add("active");
});

if (faqLink) faqLink.addEventListener("click", (e) => {
  e.preventDefault();
  faqModal.classList.add("active");
});

if (supportLink) supportLink.addEventListener("click", (e) => {
  e.preventDefault();
  supportModal.classList.add("active");
});

// Close modals
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-modal");
    document.getElementById(id).classList.remove("active");
  });
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});

// Close modals on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((m) => m.classList.remove("active"));
  }
});


// ================== SUPPORT FORM ==================
const supportForm = document.querySelector(".support-form");

if (supportForm) {
  supportForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = supportForm.querySelector("input[type='text']").value;
    const email = supportForm.querySelector("input[type='email']").value;

    alert(`Thank you, ${name}! Your request was submitted. We'll respond to ${email} soon.`);

    supportForm.reset();
    supportModal.classList.remove("active");
  });
}


// ================== SUPPORT BUTTONS ==================
document.querySelectorAll(".support-btn").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.textContent === "Start Chat") {
      alert("Live chat coming soon!");
    } else if (button.textContent === "View Docs") {
      alert("Documentation is not ready yet.");
    }
  });
});


// ================== SMOOTH SCROLL ==================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Ignore modal links
    if (href === "#help" || href === "#faq" || href === "#support") return;

    if (href !== "#" && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: "smooth" });
    }
  });
});
