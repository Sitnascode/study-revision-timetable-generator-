const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------------------------
   Helpers
--------------------------- */
function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ---------------------------
   DOM refs
--------------------------- */
const themeBtn = $("#themeToggle");
const sidebarEl = $("#sidebar");

const examDateInput = $("#examDate");
const daysLeftSpan = $("#daysLeft");

const inputs = {
  studyHours: $("#studyHours"),
  startDate: $("#startDate"),
  endDate: $("#endDate"),
  hydrationBreak: $("#hydrationBreak"),
  prayerBreak: $("#prayerBreak"),
  eyeRestBreak: $("#eyeRestBreak"),
  movementBreak: $("#movementBreak"),
  maxTopics: $("#maxTopics"),
  avoidLateNight: $("#avoidLateNight"),
  includeRevision: $("#includeRevision"),
  maxHours: $("#maxHours"),
  pomodoroType: $("#pomodoroType"),
  customStudy: $("#customStudy"),
  customBreak: $("#customBreak"),
  profileSummary: $("#profileSummary"),
  subjectsList: $("#subjectsList"),
};

const STORAGE_KEY = "finalConfig";

/* ---------------------------
   Theme toggle (persist)
--------------------------- */
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
  };

  // Add event listeners to both buttons
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }
  if (darkModeToggleMobile) {
    darkModeToggleMobile.addEventListener("click", toggleDarkMode);
  }
}

/* ---------------------------
   Sidebar behaviour (hover + click-to-lock)
--------------------------- */
function initSidebar() {
  const sidebar = sidebarEl;
  if (!sidebar) return;
  let manuallyLocked = false;

  sidebar.addEventListener("mouseenter", () => {
    if (!manuallyLocked) sidebar.classList.add("expanded");
  });

  sidebar.addEventListener("mouseleave", () => {
    if (!manuallyLocked) sidebar.classList.remove("expanded");
  });

  sidebar.addEventListener("click", (e) => {
    if (
      e.target.closest(".menu-item") ||
      e.target.closest(".user-profile-item") ||
      e.target.closest(".logout-item")
    )
      return;
    manuallyLocked = !manuallyLocked;
    sidebar.classList.toggle("expanded", manuallyLocked);
  });
}

/* ---------------------------
   Days left
--------------------------- */
function updateDaysLeft() {
  if (!examDateInput || !daysLeftSpan) return;
  const val = examDateInput.value;
  if (!val) {
    daysLeftSpan.textContent = "-";
    return;
  }

  const examDate = new Date(val + "T00:00:00");
  const today = new Date();
  const diffMs =
    examDate.setHours(0, 0, 0, 0) -
    new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  daysLeftSpan.textContent = diffDays >= 0 ? diffDays : 0;
}

/* ---------------------------
   Persistence helpers
--------------------------- */
function getStoredConfig() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function writeStoredConfig(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}
function readUIToConfig() {
  return {
    examDate: examDateInput?.value || "",
    studyHours: inputs.studyHours?.value || "",
    startDate: inputs.startDate?.value || "",
    endDate: inputs.endDate?.value || "",
    hydrationBreak: !!inputs.hydrationBreak?.checked,
    prayerBreak: !!inputs.prayerBreak?.checked,
    eyeRestBreak: !!inputs.eyeRestBreak?.checked,
    movementBreak: !!inputs.movementBreak?.checked,
    maxTopics: inputs.maxTopics?.value || "",
    avoidLateNight: !!inputs.avoidLateNight?.checked,
    includeRevision: !!inputs.includeRevision?.checked,
    maxHours: inputs.maxHours?.value || "",
    pomodoroType: inputs.pomodoroType?.value || "standard",
    customStudy: inputs.customStudy?.value || "",
    customBreak: inputs.customBreak?.value || "",
  };
}

const saveUIToStorage = debounce(() => {
  writeStoredConfig(readUIToConfig());
}, 200);

/* ---------------------------
   Populate UI
--------------------------- */
function populateUIFromConfig() {
  const cfg = getStoredConfig();
  if (examDateInput) examDateInput.value = cfg.examDate || "";
  updateDaysLeft();

  Object.keys(inputs).forEach((k) => {
    if (["profileSummary", "subjectsList"].includes(k)) return;
    const el = inputs[k];
    if (!el) return;
    if (el.type === "checkbox") el.checked = !!cfg[k];
    else el.value = cfg[k] || "";
  });

  const wrapper = $("#customPomodoroWrapper");
  if (cfg.pomodoroType === "custom") wrapper?.classList.remove("hidden");
  else wrapper?.classList.add("hidden");

  // Get data from profile setup page
  const profileSetupData = JSON.parse(
    localStorage.getItem("userProfile") || "{}",
  );

  if (inputs.profileSummary) {
    if (Object.keys(profileSetupData).length > 0) {
      // Display data from profile setup
      const sessionText = profileSetupData.session || "Not set";
      const sleepHours = profileSetupData.sleep || "Not set";
      const maxHours = profileSetupData.maxHours || "Not set";
      const learningStyle = profileSetupData.style || "Not set";
      const preferredTime = profileSetupData.focus || "Not set";

      inputs.profileSummary.innerHTML = `
        <p><strong>Name:</strong> ${profileSetupData.name || "Not set"}</p>
        <p><strong>Grade/Level:</strong> ${
          profileSetupData.grade || "Not set"
        }</p>
        <p><strong>Preferred Study Time:</strong> ${preferredTime}</p>
        <p><strong>Session Length:</strong> ${sessionText}</p>
        <p><strong>Learning Style:</strong> ${learningStyle}</p>
        <p><strong>Daily Max Hours:</strong> ${maxHours} hours</p>
        <p><strong>Sleep Hours:</strong> ${sleepHours} hours</p>
      `;
    } else {
      inputs.profileSummary.innerHTML = `
        <p style="color: var(--muted); font-style: italic;">
          No profile data found. Please complete your 
          <a href="../landing_profile_page_final/profile-setup.html" style="color: var(--accent);">profile setup</a> first.
        </p>
      `;
    }
  }

  // Get subjects from subjects page
  const subjects = JSON.parse(localStorage.getItem("subjectsData") || "[]");
  if (inputs.subjectsList) {
    inputs.subjectsList.innerHTML = "";
    if (subjects.length > 0) {
      subjects.forEach((s) => {
        const li = document.createElement("li");
        li.style.marginBottom = "8px";
        li.innerHTML = `
          <strong>${s.name}</strong> — 
          Difficulty: ${s.difficulty}/5, 
          Importance: ${s.importance}/5
        `;
        inputs.subjectsList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.style.color = "var(--muted)";
      li.style.fontStyle = "italic";
      li.innerHTML = `
        No subjects added yet. Please add subjects in the 
        <a href="subjects.html" style="color: var(--accent);">Subjects page</a> first.
      `;
      inputs.subjectsList.appendChild(li);
    }
  }
}

/* ---------------------------
   Autosave listeners
--------------------------- */
function attachAutosaveListeners() {
  const controls = $$(".wrap input, .wrap select, .wrap textarea");
  controls.forEach((ctrl) => {
    ctrl.addEventListener("input", saveUIToStorage);
    ctrl.addEventListener("change", saveUIToStorage);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden")
      writeStoredConfig(readUIToConfig());
  });
  window.addEventListener("beforeunload", () => {
    writeStoredConfig(readUIToConfig());
  });
}

/* ---------------------------
   Generate button
--------------------------- */
const generateBtn = $("#generateBtn");
if (generateBtn) {
  generateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const cfg = readUIToConfig();
    writeStoredConfig(cfg);

    // Check if subjects exist
    const subjects = JSON.parse(localStorage.getItem("subjectsData") || "[]");
    if (subjects.length === 0) {
      alert(
        "Please add subjects first in the Subjects page before generating a timetable.",
      );
      return;
    }

    if (!cfg.examDate || !cfg.studyHours) {
      alert("Please fill Exam Date and Study Hours per Day.");
      return;
    }
    if (
      cfg.startDate &&
      cfg.endDate &&
      new Date(cfg.startDate) > new Date(cfg.endDate)
    ) {
      alert("Start Date cannot be after End Date.");
      return;
    }

    // --- NEW: validate custom Pomodoro ---
    if (cfg.pomodoroType === "custom") {
      if (!cfg.customStudy || !cfg.customBreak) {
        alert(
          "Please enter both Study Minutes and Break Minutes for custom Pomodoro.",
        );
        return;
      }
    }

    // Generate timetable before navigating
    generateTimetableData(subjects, cfg);

    window.location.href = "../timetable.html";
  });
}

/* ---------------------------
   Generate Timetable Data
--------------------------- */
function generateTimetableData(subjects, config) {
  if (!subjects || subjects.length === 0) return;

  // Get configuration values
  const examDate = config.examDate ? new Date(config.examDate) : null;
  const studyHoursPerDay = parseInt(config.studyHours) || 4;
  const startDate = config.startDate ? new Date(config.startDate) : new Date();
  const endDate = config.endDate ? new Date(config.endDate) : examDate;
  const maxHoursPerDay = parseInt(config.maxHours) || studyHoursPerDay;

  // Get user profile for preferred study times
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const preferredTime = userProfile.focus || "morning";

  // Calculate total days available
  let totalDays = 30; // default
  if (examDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate - today;
    totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else if (startDate && endDate) {
    const diffTime = endDate - startDate;
    totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Calculate total study hours available
  const totalStudyHours = totalDays * studyHoursPerDay;

  // Sort subjects by priority (descending)
  const sortedSubjects = [...subjects].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );

  // Calculate total priority
  const totalPriority = sortedSubjects.reduce(
    (sum, s) => sum + (s.priority || 1),
    0,
  );

  // Generate daily schedule
  const schedule = generateDailySchedule(
    sortedSubjects,
    totalStudyHours,
    totalPriority,
    studyHoursPerDay,
    totalDays,
    config,
    preferredTime,
  );

  // Save to localStorage
  localStorage.setItem("generatedTimetable", JSON.stringify(schedule));
  console.log("Study schedule generated:", schedule);
}

/* ---------------------------
   Generate Daily Schedule
--------------------------- */
function generateDailySchedule(
  subjects,
  totalStudyHours,
  totalPriority,
  hoursPerDay,
  totalDays,
  config,
  preferredTime,
) {
  const schedule = [];

  // Determine start time based on preference
  let startHour = 9; // default morning
  if (preferredTime === "afternoon") startHour = 14;
  else if (preferredTime === "evening") startHour = 18;
  else if (preferredTime === "night") startHour = 21;

  // Get Pomodoro settings
  const pomodoroType = config.pomodoroType || "standard";
  let studyMinutes = 25;
  let breakMinutes = 5;

  if (pomodoroType === "extended") {
    studyMinutes = 50;
    breakMinutes = 10;
  } else if (pomodoroType === "custom") {
    studyMinutes = parseInt(config.customStudy) || 25;
    breakMinutes = parseInt(config.customBreak) || 5;
  }

  // Calculate sessions per hour
  const sessionDuration = studyMinutes + breakMinutes;
  const sessionsPerHour = 60 / sessionDuration;

  // Allocate hours to each subject based on priority
  const subjectHours = subjects.map((subject) => {
    const priorityRatio = (subject.priority || 1) / totalPriority;
    const allocatedHours = totalStudyHours * priorityRatio;
    return {
      ...subject,
      totalHours: Math.max(1, Math.round(allocatedHours)),
      remainingHours: Math.max(1, Math.round(allocatedHours)),
    };
  });

  // Generate schedule for each day
  for (let day = 0; day < Math.min(totalDays, 30); day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    let currentHour = startHour;
    let currentMinute = 0;
    let hoursScheduledToday = 0;

    // Rotate through subjects for this day
    let subjectIndex = day % subjects.length;

    while (hoursScheduledToday < hoursPerDay) {
      const subject = subjectHours[subjectIndex];

      if (subject.remainingHours > 0) {
        // Calculate session duration (1 hour blocks)
        const sessionHours = Math.min(1, subject.remainingHours);
        const endHour = currentHour + Math.floor(sessionHours);
        const endMinute = currentMinute + (sessionHours % 1) * 60;

        // Format time
        const startTime = formatTime(currentHour, currentMinute);
        const endTime = formatTime(
          endHour + Math.floor(endMinute / 60),
          endMinute % 60,
        );

        schedule.push({
          day: day + 1,
          dayName,
          date: dateStr,
          subject: subject.name,
          startTime,
          endTime,
          duration: sessionHours,
          difficulty: subject.difficulty,
          importance: subject.importance,
          priority: subject.priority,
          pomodoroSessions: Math.ceil(sessionHours * sessionsPerHour),
          studyMinutes,
          breakMinutes,
        });

        subject.remainingHours -= sessionHours;
        hoursScheduledToday += sessionHours;

        // Add break time
        currentHour = endHour + Math.floor(endMinute / 60);
        currentMinute = (endMinute % 60) + 15; // 15 min break between subjects

        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }

      // Move to next subject
      subjectIndex = (subjectIndex + 1) % subjects.length;

      // Safety check to avoid infinite loop
      if (currentHour >= 23 || hoursScheduledToday >= hoursPerDay) break;
    }
  }

  return schedule;
}

/* ---------------------------
   Format Time Helper
--------------------------- */
function formatTime(hour, minute) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor(minute) % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
}

/* ---------------------------
   Pomodoro toggle
--------------------------- */
$("#pomodoroType")?.addEventListener("change", (e) => {
  const wrapper = $("#customPomodoroWrapper");
  wrapper?.classList.toggle("hidden", e.target.value !== "custom");
  writeStoredConfig(readUIToConfig());
});

/* ---------------------------
   Sidebar Toggle (Updated)
--------------------------- */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

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

/* ---------------------------
   Init on load
--------------------------- */
window.addEventListener("load", () => {
  initSidebar();
  initDarkMode();
  populateUIFromConfig();
  attachAutosaveListeners();
  examDateInput?.addEventListener("input", updateDaysLeft);
  examDateInput?.addEventListener("change", updateDaysLeft);
});
