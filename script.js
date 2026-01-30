// ================== THEME TOGGLE ==================
const themeToggle = document.getElementById("themeToggle");
const body = document.body;
const icon = themeToggle.querySelector("i");

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  icon.classList.remove("fa-moon");
  icon.classList.add("fa-sun");
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
    localStorage.setItem("theme", "dark");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
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
helpLink.addEventListener("click", (e) => {
  e.preventDefault();
  helpModal.classList.add("active");
});

faqLink.addEventListener("click", (e) => {
  e.preventDefault();
  faqModal.classList.add("active");
});

supportLink.addEventListener("click", (e) => {
  e.preventDefault();
  supportModal.classList.add("active");
});

// Close modals
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.getAttribute("data-modal");
    const modal = document.getElementById(modalId);
    modal.classList.remove("active");
  });
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});

// Close modal on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active");
    });
  }
});

// ================== SUPPORT FORM ==================
const supportForm = document.querySelector(".support-form");
if (supportForm) {
  supportForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(supportForm);
    const name = supportForm.querySelector('input[type="text"]').value;
    const email = supportForm.querySelector('input[type="email"]').value;
    const message = supportForm.querySelector("textarea").value;

    // Show success message
    alert(
      `Thank you, ${name}! Your support request has been submitted. We'll respond to ${email} within 24 hours.`
    );

    // Reset form
    supportForm.reset();

    // Close modal
    supportModal.classList.remove("active");
  });
}

// ================== SUPPORT BUTTONS ==================
const supportButtons = document.querySelectorAll(".support-btn");
supportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const buttonText = button.textContent;

    if (buttonText === "Start Chat") {
      alert("Live chat feature coming soon! Please use email support for now.");
    } else if (buttonText === "View Docs") {
      alert("Documentation is being prepared. Check back soon!");
    }
  });
});

// ================== SMOOTH SCROLL ==================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Don't prevent default for modal links
    if (href === "#help" || href === "#faq" || href === "#support") {
      return;
    }

    if (href !== "#" && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});
