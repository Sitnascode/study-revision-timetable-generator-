/**********************************************************
 * Utility Helpers
 **********************************************************/
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const STORAGE_KEY = "subjectsData";
const TIMETABLE_KEY = "generatedTimetable";

/**********************************************************
 * DOM References
 **********************************************************/
const tableBody = $("#timetableTable tbody");

const regenerateBtn = $("#regenerateBtn");
const exportPDF = $("#exportPDF");
const exportExcel = $("#exportExcel");
const printTable = $("#printTable");

/**********************************************************
 * Data Containers
 **********************************************************/
let subjects = [];
let timetable = [];

/**********************************************************
 * Local Storage Helpers
 **********************************************************/
function loadSubjects() {
  try {
    subjects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    subjects = [];
  }
}

function saveTimetable() {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
}

function loadTimetable() {
  try {
    timetable = JSON.parse(localStorage.getItem(TIMETABLE_KEY)) || [];
  } catch (e) {
    timetable = [];
  }
}

/**********************************************************
 * Generate Timetable
 **********************************************************/
function generateTimetable() {
  loadSubjects();
  loadTimetable();

  // If timetable doesn't exist, generate it from subjects and config
  if (!timetable.length && subjects.length > 0) {
    const config = getGenerateConfig();
    timetable = createTimetableFromSubjects(subjects, config);
    saveTimetable();
  }

  if (!timetable.length) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;">No timetable generated. Please add subjects and configure settings first.</td></tr>`;
    return;
  }

  renderTimetable();
}

/**********************************************************
 * Get Generate Config
 **********************************************************/
function getGenerateConfig() {
  try {
    return JSON.parse(localStorage.getItem("finalConfig")) || {};
  } catch (e) {
    return {};
  }
}

/**********************************************************
 * Create Timetable from Subjects
 **********************************************************/
function createTimetableFromSubjects(subjects, config) {
  if (!subjects || subjects.length === 0) return [];

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
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  // Calculate total priority
  const totalPriority = sortedSubjects.reduce(
    (sum, s) => sum + (s.priority || 1),
    0
  );

  // Generate daily schedule
  const schedule = generateDailySchedule(
    sortedSubjects,
    totalStudyHours,
    totalPriority,
    studyHoursPerDay,
    totalDays,
    config,
    preferredTime
  );

  return schedule;
}

/**********************************************************
 * Generate Daily Schedule
 **********************************************************/
function generateDailySchedule(
  subjects,
  totalStudyHours,
  totalPriority,
  hoursPerDay,
  totalDays,
  config,
  preferredTime
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
          endMinute % 60
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

/**********************************************************
 * Format Time Helper
 **********************************************************/
function formatTime(hour, minute) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor(minute) % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
}

/**********************************************************
 * Render Table
 **********************************************************/
function renderTimetable() {
  if (!timetable.length) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;">No timetable generated</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";

  // Group by day
  const groupedByDay = {};
  timetable.forEach((session) => {
    const key = `Day ${session.day} - ${session.dayName}, ${session.date}`;
    if (!groupedByDay[key]) {
      groupedByDay[key] = [];
    }
    groupedByDay[key].push(session);
  });

  // Create a consistent color map for subjects
  const subjectColorMap = {};
  const allSubjects = [...new Set(timetable.map((s) => s.subject))];
  allSubjects.forEach((subject, index) => {
    subjectColorMap[subject] = index;
  });

  // Render grouped schedule
  Object.keys(groupedByDay).forEach((dayKey) => {
    // Day header row
    const headerTr = document.createElement("tr");
    const isDarkMode = document.body.classList.contains("dark-mode");
    const headerTextColor = isDarkMode ? "#ffffff" : "#0f172a";
    const headerBgColor = isDarkMode
      ? "rgba(14, 165, 233, 0.3)"
      : "var(--accent-soft)";

    headerTr.style.backgroundColor = headerBgColor;
    headerTr.style.fontWeight = "bold";
    headerTr.style.color = headerTextColor;
    headerTr.innerHTML = `
      <td colspan="6" style="text-align:left; padding: 12px; font-size: 14px; color: ${headerTextColor} !important; font-weight: bold; background: ${headerBgColor};">
        📅 ${dayKey}
      </td>
    `;
    tableBody.appendChild(headerTr);

    // Sessions for this day
    groupedByDay[dayKey].forEach((session, idx) => {
      const tr = document.createElement("tr");

      // Get consistent color for this subject
      const isDark = document.body.classList.contains("dark-mode");
      const subjectIndex = subjectColorMap[session.subject] || 0;

      // Set text color based on mode
      const textColor = isDark ? "#ffffff" : "#0f172a";

      if (isDark) {
        // DARK MODE: Light blue with higher opacity for better visibility
        const subjectHue = 190 + ((subjectIndex * 5) % 30); // Light blue shades
        const opacity = 0.25 + (session.difficulty || 1) * 0.08; // Higher opacity for visibility
        tr.style.backgroundColor = `hsla(${subjectHue}, 70%, 60%, ${opacity})`;
        tr.style.color = "#ffffff";
      } else {
        // LIGHT MODE: Light blue only (190° to 220°)
        const subjectHue = 190 + ((subjectIndex * 5) % 30); // Light blue shades
        const lightness = 92 - (session.difficulty || 1) * 4; // Difficulty affects lightness (72-92%)
        tr.style.backgroundColor = `hsl(${subjectHue}, 50%, ${lightness}%)`;
        tr.style.color = "#0f172a";
      }

      tr.innerHTML = `
        <td style="color: ${textColor} !important;">${idx + 1}</td>
        <td style="color: ${textColor} !important;"><strong style="color: ${textColor} !important;">${
        session.subject
      }</strong></td>
        <td style="color: ${textColor} !important;">${session.startTime} - ${
        session.endTime
      }</td>
        <td style="color: ${textColor} !important;">${session.duration.toFixed(
        1
      )} hrs</td>
        <td style="color: ${textColor} !important;">
          <span style="font-size: 13px; font-weight: 500; color: ${textColor} !important;">
            ${session.pomodoroSessions} × ${session.studyMinutes}min
          </span>
        </td>
        <td style="color: ${textColor} !important;">
          <span style="font-size: 13px; font-weight: 600; padding: 4px 10px; background: var(--accent-soft); border-radius: 12px; color: ${textColor} !important;">
            Priority: ${session.priority}
          </span>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  });
}

/**********************************************************
 * Export: CSV
 **********************************************************/
exportExcel.addEventListener("click", () => {
  if (!timetable.length) {
    alert("No timetable to export!");
    return;
  }

  let csv =
    "Day,Date,Subject,Start Time,End Time,Duration (hrs),Pomodoro Sessions,Priority\n";

  timetable.forEach((s) => {
    csv += `"Day ${s.day} - ${s.dayName}","${s.date}","${s.subject}","${s.startTime}","${s.endTime}",${s.duration},${s.pomodoroSessions},${s.priority}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "study-schedule.csv";
  link.click();
});

/**********************************************************
 * Export: Print
 **********************************************************/
printTable.addEventListener("click", () => {
  if (!timetable.length) {
    alert("No timetable to print!");
    return;
  }
  window.print();
});

/**********************************************************
 * Export: PDF
 **********************************************************/
exportPDF.addEventListener("click", () => {
  if (!timetable.length) {
    alert("No timetable to export!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("StudyRevise - Study Schedule", 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

  // Group by day for better PDF layout
  const groupedByDay = {};
  timetable.forEach((session) => {
    const key = `Day ${session.day} - ${session.dayName}, ${session.date}`;
    if (!groupedByDay[key]) {
      groupedByDay[key] = [];
    }
    groupedByDay[key].push(session);
  });

  let startY = 35;

  Object.keys(groupedByDay).forEach((dayKey, dayIndex) => {
    // Add day header
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(dayKey, 14, startY);
    startY += 5;

    const headers = [
      ["#", "Subject", "Time", "Duration", "Pomodoro", "Priority"],
    ];

    const body = groupedByDay[dayKey].map((s, i) => [
      i + 1,
      s.subject,
      `${s.startTime} - ${s.endTime}`,
      `${s.duration.toFixed(1)} hrs`,
      `${s.pomodoroSessions} × ${s.studyMinutes}min`,
      s.priority,
    ]);

    doc.autoTable({
      head: headers,
      body,
      startY: startY,
      theme: "striped",
      headStyles: { fillColor: [14, 165, 233], fontSize: 10 },
      styles: { cellPadding: 2, fontSize: 9 },
      margin: { left: 14 },
    });

    startY = doc.lastAutoTable.finalY + 10;
  });

  doc.save("study-schedule.pdf");
});

/**********************************************************
 * Regenerate Timetable
 **********************************************************/
regenerateBtn.addEventListener("click", () => {
  localStorage.removeItem(TIMETABLE_KEY);
  window.location.href = "generate.html";
});

/**********************************************************
 * Dark Mode
 **********************************************************/
function initDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle");

  if (!darkModeToggle) {
    console.error("Dark mode toggle button not found");
    return;
  }

  const savedMode = localStorage.getItem("darkMode");

  // Apply saved mode on load
  if (savedMode === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
  } else {
    darkModeToggle.textContent = "🌙";
  }

  // Toggle dark mode on click
  darkModeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    darkModeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");

    console.log("Dark mode toggled:", isDark ? "enabled" : "disabled");
  });
}

/**********************************************************
 * Progress Tracking
 **********************************************************/
const TRACKING_KEY = "progressTracking";

function dateToYMD(d) {
  return d.toISOString().slice(0, 10);
}

function getProgressTracking() {
  const data = localStorage.getItem(TRACKING_KEY);
  return data ? JSON.parse(data) : [];
}

function saveProgressTracking(tracking) {
  localStorage.setItem(TRACKING_KEY, JSON.stringify(tracking));
}

function populateTrackingSubjects() {
  const select = document.getElementById("trackingSubject");

  if (!select) return;

  // Clear existing options except the first one
  select.innerHTML = '<option value="">Select a subject</option>';

  // Get unique subjects from timetable schedule
  const uniqueSubjects = new Set();
  timetable.forEach((session) => {
    if (session.subject) {
      uniqueSubjects.add(session.subject);
    }
  });

  // Add subjects to dropdown
  uniqueSubjects.forEach((subjectName) => {
    const option = document.createElement("option");
    option.value = subjectName;
    option.textContent = subjectName;
    select.appendChild(option);
  });
}

function renderTrackingHistory() {
  const tracking = getProgressTracking();
  const container = document.getElementById("trackingHistoryList");

  if (!container) return;

  if (tracking.length === 0) {
    container.innerHTML =
      '<div class="tracking-empty">No progress tracked yet. Start by marking your first session!</div>';
    return;
  }

  // Sort by date (most recent first)
  const sorted = [...tracking].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Show only last 10 entries
  const recent = sorted.slice(0, 10);

  container.innerHTML = "";

  recent.forEach((item) => {
    const div = document.createElement("div");
    div.className = "tracking-item";

    const statusEmoji =
      {
        completed: "✅",
        "in-progress": "⏳",
        skipped: "⏭️",
      }[item.status] || "📝";

    const statusText =
      {
        completed: "Completed",
        "in-progress": "In Progress",
        skipped: "Skipped",
      }[item.status] || item.status;

    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const hoursText = item.hours ? `${item.hours}h` : "";

    div.innerHTML = `
      <div class="tracking-item-info">
        <div class="tracking-item-status">${statusEmoji}</div>
        <div class="tracking-item-details">
          <div class="tracking-item-subject">${item.subject} ${
      hoursText
        ? `<span style="color: var(--accent); font-weight: 600;">(${hoursText})</span>`
        : ""
    }</div>
          <div class="tracking-item-date">${formattedDate}</div>
        </div>
      </div>
      <div class="tracking-item-badge ${item.status}">${statusText}</div>
    `;

    container.appendChild(div);
  });
}

function initProgressTracking() {
  const markBtn = document.getElementById("markProgressBtn");
  const subjectSelect = document.getElementById("trackingSubject");
  const dateInput = document.getElementById("trackingDate");
  const hoursInput = document.getElementById("trackingHours");
  const statusSelect = document.getElementById("trackingStatus");

  if (
    !markBtn ||
    !subjectSelect ||
    !dateInput ||
    !hoursInput ||
    !statusSelect
  ) {
    console.log("Progress tracking elements not found");
    return;
  }

  // Set today's date as default
  dateInput.value = dateToYMD(new Date());

  // Populate subjects
  populateTrackingSubjects();

  // Render history
  renderTrackingHistory();

  // Handle mark progress button
  markBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const subject = subjectSelect.value;
    const date = dateInput.value;
    const hours = parseFloat(hoursInput.value) || 0;
    const status = statusSelect.value;

    if (!subject) {
      alert("Please select a subject");
      return;
    }

    if (!date) {
      alert("Please select a date");
      return;
    }

    if (status === "completed" && hours <= 0) {
      alert("Please enter hours studied for completed sessions");
      return;
    }

    const tracking = getProgressTracking();

    // Check if entry already exists for this subject and date
    const existingIndex = tracking.findIndex(
      (item) => item.subject === subject && item.date === date
    );

    if (existingIndex >= 0) {
      // Update existing entry
      tracking[existingIndex].status = status;
      tracking[existingIndex].hours = hours;
      tracking[existingIndex].timestamp = new Date().toISOString();
    } else {
      // Add new entry
      tracking.push({
        subject,
        date,
        status,
        hours,
        timestamp: new Date().toISOString(),
      });
    }

    saveProgressTracking(tracking);
    renderTrackingHistory();

    // Reset form
    subjectSelect.value = "";
    dateInput.value = dateToYMD(new Date());
    hoursInput.value = "";
    statusSelect.value = "completed";

    // Show success message
    const originalText = markBtn.textContent;
    markBtn.textContent = "✓ Marked!";
    markBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";

    setTimeout(() => {
      markBtn.textContent = originalText;
      markBtn.style.background = "";
    }, 2000);
  });
}

/**********************************************************
 * Init App
 **********************************************************/
generateTimetable();
initDarkMode();
initProgressTracking();

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

// Initialize sidebar when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSidebar);
} else {
  initSidebar();
}
