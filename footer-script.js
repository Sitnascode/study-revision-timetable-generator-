// ===========================
// Modal Functionality
// ===========================

document.addEventListener("DOMContentLoaded", function () {
  // Get all modal triggers
  const helpLink = document.getElementById("helpLink");
  const faqLink = document.getElementById("faqLink");
  const supportLink = document.getElementById("supportLink");

  // Get all modals
  const helpModal = document.getElementById("helpModal");
  const faqModal = document.getElementById("faqModal");
  const supportModal = document.getElementById("supportModal");

  // Get all close buttons
  const closeButtons = document.querySelectorAll(".close-modal");

  // Function to open modal
  function openModal(modal) {
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
  }

  // Function to close modal
  function closeModal(modal) {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = ""; // Restore scrolling
    }
  }

  // Add click event listeners to footer links
  if (helpLink && helpModal) {
    helpLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(helpModal);
    });
  }

  if (faqLink && faqModal) {
    faqLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(faqModal);
    });
  }

  if (supportLink && supportModal) {
    supportLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(supportModal);
    });
  }

  // Add click event listeners to close buttons
  closeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const modalId = this.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      closeModal(modal);
    });
  });

  // Close modal when clicking outside the modal content
  [helpModal, faqModal, supportModal].forEach(function (modal) {
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal(helpModal);
      closeModal(faqModal);
      closeModal(supportModal);
    }
  });

  // Handle support form submission
  const supportForm = document.querySelector(".support-form");
  if (supportForm) {
    supportForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Thank you for your message! We will get back to you soon.");
      closeModal(supportModal);
      supportForm.reset();
    });
  }
});
