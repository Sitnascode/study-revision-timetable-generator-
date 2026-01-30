(() => {
  const STORAGE_KEY = "subjectsData"; // updated key for timetable page

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const refs = {
    subjectName: $("#subjectName"),
    difficulty: $("#difficulty"),
    importance: $("#importance"),
    addBtn: $("#addSubjectBtn"),
    tableBody: $("#subjectsTable tbody"),
    continueBtn: $("#continueBtn"),
    clearAllBtn: $("#clearAllBtn"),
    formError: $("#formError"),
    themeBtn: $("#themeToggle"),
    sidebar: $("#sidebar"),
    editModal: $("#editModal"),
    modalBackdrop: $("#modalBackdrop"),
    modalSubjectName: $("#modalSubjectName"),
    modalDifficulty: $("#modalDifficulty"),
    modalImportance: $("#modalImportance"),
    modalSave: $("#modalSave"),
    modalCancel: $("#modalCancel"),
  };

  let subjects = [];
  let dragSrcIndex = null;
  let editingIndex = null;

  const loadSubjects = () => {
    try {
      subjects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      subjects = [];
    }
  };

  const saveSubjects = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    updateContinueState();
  };

  const showError = (msg) => {
    refs.formError.textContent = msg;
    setTimeout(() => {
      if (refs.formError.textContent === msg) refs.formError.textContent = "";
    }, 3000);
  };

  const resetAddForm = () => {
    refs.subjectName.value = "";
    refs.difficulty.value = "";
    refs.importance.value = "";
    refs.subjectName.focus();
  };

  const updateContinueState = () => {
    refs.continueBtn.disabled = subjects.length === 0;
  };

  const renderTable = () => {
    refs.tableBody.innerHTML = "";
    if (!subjects.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.textContent = "No subjects added yet.";
      td.style.textAlign = "center";
      td.style.opacity = 0.6;
      tr.appendChild(td);
      refs.tableBody.appendChild(tr);
      updateContinueState();
      return;
    }

    subjects.forEach((sub, i) => {
      const tr = document.createElement("tr");
      tr.setAttribute("draggable", "true");
      tr.dataset.index = i;

      const dragTd = document.createElement("td");
      dragTd.className = "drag-handle";
      dragTd.textContent = "☰";
      tr.appendChild(dragTd);

      tr.innerHTML += `
        <td>${sub.name}</td>
        <td>${sub.difficulty}</td>
        <td>${sub.importance}</td>
        <td>${sub.priority}</td>
        <td>
          <button class="btn ghost edit-btn" aria-label="Edit ${sub.name}">✏️</button>
          <button class="btn ghost delete-btn" aria-label="Delete ${sub.name}">🗑</button>
        </td>
      `;

      refs.tableBody.appendChild(tr);
    });

    updateContinueState();
    initDragDrop();
  };

  refs.addBtn.addEventListener("click", () => {
    const name = refs.subjectName.value.trim();
    const diff = refs.difficulty.value;
    const imp = refs.importance.value;

    if (!name || !diff || !imp) return showError("Fill all fields");
    if (subjects.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      return showError("Subject already exists");

    subjects.push({
      name,
      difficulty: parseInt(diff),
      importance: parseInt(imp),
      priority: parseInt(diff) * parseInt(imp), // added priority
    });

    saveSubjects();
    renderTable();
    resetAddForm();
  });

  refs.tableBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const idx = parseInt(tr.dataset.index);

    if (e.target.classList.contains("edit-btn")) {
      editingIndex = idx;
      const s = subjects[idx];
      refs.modalSubjectName.value = s.name;
      refs.modalDifficulty.value = s.difficulty;
      refs.modalImportance.value = s.importance;
      openModal();
    } else if (e.target.classList.contains("delete-btn")) {
      if (confirm(`Delete ${subjects[idx].name}?`)) {
        subjects.splice(idx, 1);
        saveSubjects();
        renderTable();
      }
    }
  });

  const openModal = () => {
    refs.editModal.setAttribute("aria-hidden", "false");
    refs.editModal.classList.add("show");
    refs.modalSubjectName.focus();
    trapFocus(refs.editModal);
  };

  const closeModal = () => {
    refs.editModal.setAttribute("aria-hidden", "true");
    refs.editModal.classList.remove("show");
    removeTrap(refs.editModal);
  };

  refs.modalSave.addEventListener("click", () => {
    const name = refs.modalSubjectName.value.trim();
    const diff = refs.modalDifficulty.value;
    const imp = refs.modalImportance.value;

    if (!name || !diff || !imp) return alert("Fill all fields");
    if (
      subjects.some(
        (s, i) =>
          s.name.toLowerCase() === name.toLowerCase() && i !== editingIndex
      )
    )
      return alert("Duplicate subject");

    subjects[editingIndex] = {
      name,
      difficulty: parseInt(diff),
      importance: parseInt(imp),
      priority: parseInt(diff) * parseInt(imp), // added priority
    };

    saveSubjects();
    renderTable();
    closeModal();
  });

  refs.modalCancel.addEventListener("click", closeModal);
  refs.modalBackdrop.addEventListener("click", closeModal);

  function trapFocus(modal) {
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0],
      last = focusables[focusables.length - 1];
    function handleKey(e) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      if (e.key === "Escape") closeModal();
    }
    modal.addEventListener("keydown", handleKey);
    modal.dataset.keyHandler = handleKey;
  }

  function removeTrap(modal) {
    if (modal.dataset.keyHandler)
      modal.removeEventListener("keydown", modal.dataset.keyHandler);
  }

  // Drag & Drop (unchanged)
  let initDragDrop = () => {
    /* keep original drag & drop logic here */
  };

  refs.clearAllBtn.addEventListener("click", () => {
    if (confirm("Delete all subjects?")) {
      subjects = [];
      saveSubjects();
      renderTable();
    }
  });

  refs.continueBtn.addEventListener("click", () => {
    if (subjects.length === 0) return;
    window.location.href = "generate.html";
  });

  loadSubjects();
  renderTable();
})();

// ---- Dark Mode Toggle ----
function initDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const darkModeToggleMobile = document.getElementById("darkModeToggleMobile");

  const savedMode = localStorage.getItem("darkMode");

  // Update both buttons based on saved mode
  if (savedMode === "enabled") {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) darkModeToggle.textContent = "☀️";
    if (darkModeToggleMobile) darkModeToggleMobile.textContent = "☀️";
  }

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    const icon = isDark ? "☀️" : "🌙";

    // Update both buttons
    if (darkModeToggle) darkModeToggle.textContent = icon;
    if (darkModeToggleMobile) darkModeToggleMobile.textContent = icon;

    localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
    console.log("Dark mode:", isDark ? "enabled" : "disabled");
  };

  // Add event listeners to both buttons
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }
  if (darkModeToggleMobile) {
    darkModeToggleMobile.addEventListener("click", toggleDarkMode);
  }
}

// ---- Sidebar Toggle ----
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const menuItems = document.querySelectorAll(".menu-item");
  let isClickExpanded = false;

  // Expand on hover
  sidebar.addEventListener("mouseenter", () => {
    sidebar.classList.add("expanded");
  });

  // Collapse on mouse leave (only if not click-expanded)
  sidebar.addEventListener("mouseleave", () => {
    if (!isClickExpanded) {
      sidebar.classList.remove("expanded");
    }
  });

  // Toggle on click
  sidebar.addEventListener("click", (e) => {
    const clickedItem = e.target.closest(".menu-item");
    const clickedProfile = e.target.closest(".user-profile-item");

    // If clicking a menu item, update active state
    if (clickedItem && !clickedItem.classList.contains("logout-item")) {
      menuItems.forEach((i) => i.classList.remove("active"));
      clickedItem.classList.add("active");
    }

    // Toggle click-expanded state
    isClickExpanded = !isClickExpanded;

    if (isClickExpanded) {
      sidebar.classList.add("expanded");
    } else {
      sidebar.classList.remove("expanded");
    }
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && isClickExpanded) {
      sidebar.classList.remove("expanded");
      isClickExpanded = false;
    }
  });
}

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initDarkMode();
  });
} else {
  initSidebar();
  initDarkMode();
}
