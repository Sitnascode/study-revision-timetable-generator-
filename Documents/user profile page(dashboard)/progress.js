// ---- Data layer: read/write localStorage ----
function getTimetable() {
  // Get planned hours from generated timetable
  const generatedTimetable = JSON.parse(
    localStorage.getItem("generatedTimetable") || "[]"
  );

  if (generatedTimetable.length > 0) {
    // Convert schedule to subject hours mapping
    const subjectHours = {};
    generatedTimetable.forEach((session) => {
      const subject = session.subject;
      if (!subjectHours[subject]) {
        subjectHours[subject] = 0;
      }
      subjectHours[subject] += session.duration || 0;
    });

    console.log("📊 Planned hours from generated timetable:", subjectHours);
    return subjectHours;
  }

  // Fallback: Calculate from subjects and config
  const subjects = JSON.parse(localStorage.getItem("subjectsData") || "[]");
  const config = JSON.parse(localStorage.getItem("finalConfig") || "{}");

  if (subjects.length > 0 && config.studyHours) {
    const studyHoursPerDay = parseInt(config.studyHours) || 4;
    const examDate = config.examDate ? new Date(config.examDate) : null;

    let totalDays = 30;
    if (examDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      examDate.setHours(0, 0, 0, 0);
      const diffTime = examDate - today;
      totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const totalStudyHours = totalDays * studyHoursPerDay;
    const totalPriority = subjects.reduce(
      (sum, s) => sum + (s.priority || 1),
      0
    );

    const subjectHours = {};
    subjects.forEach((subject) => {
      const priorityRatio = (subject.priority || 1) / totalPriority;
      const allocatedHours = Math.round(totalStudyHours * priorityRatio);
      subjectHours[subject.name] = Math.max(1, allocatedHours);
    });

    console.log("📊 Planned hours calculated from config:", {
      studyHoursPerDay,
      totalDays,
      totalStudyHours,
      subjectHours,
    });

    return subjectHours;
  }

  console.warn("⚠️ No timetable or subjects data found");
  return {};
}

function getStudyLog() {
  // Get actual study log from tracking data
  const tracking = JSON.parse(localStorage.getItem("progressTracking") || "[]");

  // Convert tracking data to study log format
  const studyLog = [];
  let totalTrackedHours = 0;

  tracking.forEach((entry) => {
    if (entry.status === "completed" && entry.hours > 0) {
      const hours = parseFloat(entry.hours) || 0;
      totalTrackedHours += hours;

      // Use actual hours from tracking
      studyLog.push({
        subject: entry.subject,
        date: entry.date,
        duration: hours,
        status: entry.status,
      });
    }
  });

  // Also include manual study log entries if they exist
  const manualLog = JSON.parse(localStorage.getItem("studyLog") || "[]");
  studyLog.push(...manualLog);

  console.log("✅ Study log from tracking:", {
    trackingEntries: tracking.length,
    completedSessions: studyLog.length,
    totalHoursTracked: totalTrackedHours.toFixed(2),
  });

  return studyLog;
}

function saveStudyLog(log) {
  localStorage.setItem("studyLog", JSON.stringify(log));
}

// ---- Utilities ----
function dateToYMD(d) {
  return d.toISOString().slice(0, 10);
}
function parseISO(s) {
  return new Date(s + "T00:00:00");
}

// ---- Range helpers ----
function computeRange(range) {
  const end = new Date();
  let start = new Date();
  if (range === "today") {
    start = new Date();
  } else if (range === "week") {
    start.setDate(end.getDate() - 6);
  } else if (range === "month") {
    start.setMonth(end.getMonth() - 1);
    start.setDate(end.getDate() + 1);
  }
  return { start: dateToYMD(start), end: dateToYMD(end) };
}

// ---- Analytics ----
function filterLogByRange(log, startYMD, endYMD) {
  const start = parseISO(startYMD);
  const end = parseISO(endYMD);
  end.setHours(23, 59, 59, 999);
  return log.filter((s) => {
    const d = parseISO(s.date);
    return d >= start && d <= end;
  });
}

function computeStats(timetable, logFiltered) {
  const subjectTotals = {};
  for (const s of Object.keys(timetable)) subjectTotals[s] = 0;
  for (const entry of logFiltered) {
    subjectTotals[entry.subject] =
      (subjectTotals[entry.subject] || 0) + entry.duration;
  }
  const totalStudied = Object.values(subjectTotals).reduce((a, b) => a + b, 0);
  const plannedHours = Object.values(timetable).reduce((a, b) => a + b, 0);
  const productivity =
    plannedHours > 0 ? Math.round((totalStudied / plannedHours) * 100) : 0;
  return { subjectTotals, totalStudied, plannedHours, productivity };
}

function computeStreak(log) {
  // Get tracking data for more accurate streak calculation
  const tracking = JSON.parse(localStorage.getItem("progressTracking") || "[]");

  // Combine both sources
  const allDates = new Set();

  // Add dates from study log
  log.forEach((s) => allDates.add(s.date));

  // Add dates from tracking (only completed sessions)
  tracking.forEach((t) => {
    if (t.status === "completed") {
      allDates.add(t.date);
    }
  });

  // Count consecutive days up to today
  let streak = 0;
  let d = new Date();

  while (true) {
    const ymd = dateToYMD(d);
    if (allDates.has(ymd)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ---- AI Insights ----
async function generateAIInsights(timetable, subjectTotals, stats, streak) {
  // Try to use serverless AI function first
  try {
    const response = await fetch("/api/insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timetable,
        subjectTotals,
        stats,
        streak,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.insights && data.insights.length >= 3) {
        console.log("✅ AI insights generated successfully");
        return data.insights;
      }

      if (data.fallback) {
        console.log("ℹ️ AI unavailable, using smart insights");
      }
    }
  } catch (error) {
    // Serverless function not available or error occurred
    console.log("ℹ️ Serverless function not available, using smart insights");
  }

  // Always fallback to smart rule-based insights
  return buildFallbackInsights(timetable, subjectTotals, stats, streak);
}

function buildFallbackInsights(timetable, subjectTotals, stats, streak) {
  const insights = [];
  const subjects = Object.keys(timetable);
  const totalStudied = Math.round(stats.totalStudied);
  const productivity = stats.productivity;

  // Analyze each subject's performance
  const subjectAnalysis = subjects.map((subj) => {
    const planned = timetable[subj] || 0;
    const actual = subjectTotals[subj] || 0;
    const percentage = planned > 0 ? (actual / planned) * 100 : 0;
    return { subject: subj, planned, actual, percentage };
  });

  // Sort by performance (worst first)
  subjectAnalysis.sort((a, b) => a.percentage - b.percentage);

  // 1. CRITICAL SUBJECT INSIGHT
  const weakestSubject = subjectAnalysis[0];
  if (weakestSubject && weakestSubject.planned > 0) {
    if (weakestSubject.percentage === 0) {
      insights.push(
        `⚠️ ${weakestSubject.subject} hasn't been studied yet! Start with a 1-hour session today.`
      );
    } else if (weakestSubject.percentage < 30) {
      insights.push(
        `📚 ${weakestSubject.subject} is falling behind (${Math.round(
          weakestSubject.percentage
        )}%). Prioritize it in your next session.`
      );
    } else if (weakestSubject.percentage < 60) {
      insights.push(
        `📖 ${weakestSubject.subject} needs more focus. You're at ${Math.round(
          weakestSubject.percentage
        )}% - aim for 2 more hours this week.`
      );
    }
  }

  // 2. PRODUCTIVITY & STREAK INSIGHT
  if (streak === 0) {
    if (totalStudied > 0) {
      insights.push(
        `🔥 You studied ${totalStudied}h but broke your streak. Start fresh today to rebuild momentum!`
      );
    } else {
      insights.push(
        `🎯 Begin your study journey today! Even 30 minutes will start your streak.`
      );
    }
  } else if (streak >= 7) {
    insights.push(
      `🔥 Incredible ${streak}-day streak! You're in the top 10% of consistent learners. Keep going!`
    );
  } else if (streak >= 3) {
    insights.push(
      `⚡ ${streak}-day streak active! ${
        7 - streak
      } more days to reach a full week milestone.`
    );
  } else if (streak === 1) {
    insights.push(
      `✨ Day 1 of your streak! Study again tomorrow to build consistency.`
    );
  } else {
    insights.push(
      `💪 ${streak}-day streak! Consistency is building. Don't break the chain!`
    );
  }

  // 3. PERFORMANCE & BALANCE INSIGHT
  if (productivity === 0) {
    insights.push(
      `📊 No study data yet. Log your first session to see personalized insights!`
    );
  } else if (productivity < 50) {
    const hoursNeeded = Math.round(
      stats.plannedHours * 0.5 - stats.totalStudied
    );
    insights.push(
      `📉 At ${productivity}% productivity. Add ${hoursNeeded}h this week to reach 50% and stay on track.`
    );
  } else if (productivity >= 50 && productivity < 80) {
    insights.push(
      `📈 Good progress at ${productivity}%! Push to 80% by adding 1-2 hours daily.`
    );
  } else if (productivity >= 80 && productivity < 100) {
    const hoursToGo = Math.round(stats.plannedHours - stats.totalStudied);
    insights.push(
      `🎯 Almost there! ${productivity}% complete. Just ${hoursToGo}h more to hit your goal.`
    );
  } else if (productivity === 100) {
    insights.push(
      `🎉 Perfect! You hit 100% of your goal. Consider adding advanced topics or review sessions.`
    );
  } else if (productivity > 100) {
    insights.push(
      `🚀 Outstanding! ${productivity}% productivity - you exceeded your goal by ${
        productivity - 100
      }%!`
    );
  }

  // 4. SUBJECT BALANCE INSIGHT (if we need more)
  if (insights.length < 3 && subjects.length > 1) {
    const strongestSubject = subjectAnalysis[subjectAnalysis.length - 1];
    const weakest = subjectAnalysis[0];

    if (
      strongestSubject.percentage > 80 &&
      weakest.percentage < 40 &&
      weakest.planned > 0
    ) {
      insights.push(
        `⚖️ Balance needed: ${strongestSubject.subject} (${Math.round(
          strongestSubject.percentage
        )}%) vs ${weakest.subject} (${Math.round(
          weakest.percentage
        )}%). Redistribute your time.`
      );
    }
  }

  // 5. TIME-BASED INSIGHT (if we still need more)
  if (insights.length < 3) {
    const avgHoursPerDay = totalStudied / 7;
    if (avgHoursPerDay < 1) {
      insights.push(
        `⏰ You're averaging ${avgHoursPerDay.toFixed(
          1
        )}h/day. Aim for at least 2h daily for better results.`
      );
    } else if (avgHoursPerDay >= 1 && avgHoursPerDay < 3) {
      insights.push(
        `⏱️ Solid ${avgHoursPerDay.toFixed(
          1
        )}h/day average! Increase to 3-4h for optimal learning.`
      );
    } else if (avgHoursPerDay >= 3) {
      insights.push(
        `💯 Excellent ${avgHoursPerDay.toFixed(
          1
        )}h/day! Remember to take breaks to avoid burnout.`
      );
    }
  }

  // 6. MOTIVATIONAL INSIGHT (if still need more)
  if (insights.length < 3) {
    if (totalStudied > 20) {
      insights.push(
        `🌟 You've invested ${totalStudied} hours in learning! That's dedication paying off.`
      );
    } else if (totalStudied > 10) {
      insights.push(
        `📚 ${totalStudied} hours logged! You're building a strong foundation. Keep it up!`
      );
    } else if (totalStudied > 0) {
      insights.push(
        `🎓 Great start with ${totalStudied} hours! Small steps lead to big achievements.`
      );
    }
  }

  return insights.slice(0, 3);
}

// ---- Charts ----
// Base palette used for subjects (matching the reference image)
const SUBJECT_COLORS = ["#5b5fef", "#06b6d4", "#ff9f40", "#ff6384", "#4bc0c0"];

let barChart;

// ---- Heatmap Calendar ----
function renderHeatmap(days, dayData) {
  const heatmapContainer = document.getElementById("heatmapCalendar");
  heatmapContainer.innerHTML = "";

  if (days.length === 0) {
    heatmapContainer.innerHTML =
      '<div style="text-align: center; padding: 20px; color: var(--muted);">No data available for this period</div>';
    return;
  }

  const maxHours = Math.max(...dayData, 1);

  days.forEach((day, index) => {
    const hours = dayData[index];
    const date = new Date(day);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dateNum = date.getDate();

    // Calculate level (0-4) based on hours
    let level = 0;
    if (hours > 0) {
      const percentage = (hours / maxHours) * 100;
      if (percentage >= 80) level = 4;
      else if (percentage >= 60) level = 3;
      else if (percentage >= 40) level = 2;
      else if (percentage > 0) level = 1;
    }

    const dayDiv = document.createElement("div");
    dayDiv.className = `heatmap-day heatmap-level-${level}`;

    // Show day name for week view, date number for month view
    const label = days.length <= 7 ? dayName : dateNum;

    dayDiv.innerHTML = `
      <div class="heatmap-day-label">${label}</div>
      <div class="heatmap-day-hours">${hours}h</div>
    `;
    dayDiv.title = `${day}: ${hours} hours studied`;
    heatmapContainer.appendChild(dayDiv);
  });
}

// ---- Progress Bars ----
function renderProgressBars(timetable, subjectTotals) {
  const progressContainer = document.getElementById("progressBars");
  progressContainer.innerHTML = "";

  const subjects = Object.keys(timetable);

  if (subjects.length === 0) {
    progressContainer.innerHTML =
      '<div class="progress-empty">No subjects added yet</div>';
    return;
  }

  subjects.forEach((subject) => {
    const planned = timetable[subject] || 0;
    const completed = Math.round(subjectTotals[subject] || 0);
    const percentage =
      planned > 0 ? Math.min((completed / planned) * 100, 100) : 0;

    const progressItem = document.createElement("div");
    progressItem.className = "progress-item";
    progressItem.innerHTML = `
      <div class="progress-header">
        <div class="progress-subject">${subject}</div>
        <div class="progress-percentage">${Math.round(percentage)}%</div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="progress-details">
        <span>${completed}h completed</span>
        <span>${planned}h planned</span>
      </div>
    `;
    progressContainer.appendChild(progressItem);
  });
}

function renderCharts(labels, pieData, days, dayData, cumData, colors) {
  const isDarkMode = document.body.classList.contains("dark-mode");
  const textColor = isDarkMode ? "#f1f5f9" : "#0f172a";
  const gridColor = isDarkMode
    ? "rgba(74, 222, 128, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const barColor = isDarkMode ? "#4ade80" : "#4f46e5";

  // BAR: Weekly overview
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: days.map((d) => {
        const date = new Date(d);
        return date.toLocaleDateString("en-US", { weekday: "short" });
      }),
      datasets: [
        {
          label: "Hours",
          data: dayData,
          backgroundColor: barColor,
          borderRadius: 8,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        x: {
          ticks: { color: textColor },
          grid: { display: false },
        },
      },
    },
  });
}

// ---- Render UI ----
function render(rangeStart, rangeEnd) {
  const timetable = getTimetable();
  const log = getStudyLog();
  const filtered = filterLogByRange(log, rangeStart, rangeEnd);
  const stats = computeStats(timetable, filtered);

  // Determine the range type for dynamic titles
  const startDate = new Date(rangeStart);
  const endDate = new Date(rangeEnd);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  let rangeType = "Weekly";
  let heatmapTitle = "Study Heatmap Calendar";

  if (daysDiff === 0) {
    rangeType = "Today's";
    heatmapTitle = "Today's Study Activity";
  } else if (daysDiff <= 7) {
    rangeType = "Weekly";
    heatmapTitle = "This Week's Study Heatmap";
  } else if (daysDiff <= 31) {
    rangeType = "Monthly";
    heatmapTitle = "This Month's Study Heatmap";
  } else {
    rangeType = "Custom Range";
    heatmapTitle = "Study Heatmap Calendar";
  }

  // Update chart titles
  const chartTitle = document.getElementById("chartTitle");
  const heatmapTitleEl = document.getElementById("heatmapTitle");

  if (chartTitle) {
    chartTitle.textContent = `${rangeType} Overview`;
  }
  if (heatmapTitleEl) {
    heatmapTitleEl.textContent = heatmapTitle;
  }

  // Get data source information
  const tracking = JSON.parse(localStorage.getItem("progressTracking") || "[]");
  const generatedTimetable = JSON.parse(
    localStorage.getItem("generatedTimetable") || "[]"
  );

  // display integers (natural numbers) everywhere
  document.getElementById("totalHours").textContent = Math.round(
    stats.totalStudied
  );
  document.getElementById("plannedHours").textContent = Math.round(
    stats.plannedHours
  );
  document.getElementById("productivity").textContent =
    (stats.productivity > 100 ? 100 : Math.round(stats.productivity)) + "%";
  document.getElementById("streak").textContent = computeStreak(log);

  // Show data source info in console for debugging
  console.log("Progress Data Sources:", {
    trackingEntries: tracking.length,
    timetableSessions: generatedTimetable.length,
    studyLogEntries: log.length,
    plannedSubjects: Object.keys(timetable).length,
  });

  // table
  const tbody = document.querySelector("#subjectTable tbody");
  tbody.innerHTML = "";

  const subjects = Object.keys(timetable);

  if (subjects.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="4" style="text-align: center; padding: 20px; color: var(--muted);">
        No subjects found. Please add subjects and generate a timetable first.
        <br><br>
        <a href="generate/subjects.html" style="color: var(--accent); text-decoration: underline;">
          Go to Subjects Page
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  } else {
    for (const subj of subjects) {
      const planned = Math.round(timetable[subj] || 0);
      const completedRaw = stats.subjectTotals[subj] || 0;
      const completed = Math.round(completedRaw);
      const pct = planned > 0 ? Math.round((completedRaw / planned) * 100) : 0;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${subj}</td><td>${planned}</td><td>${completed}</td><td>${pct}%</td>`;
      tbody.appendChild(tr);
    }
  }

  // insights - show loading state
  const insList = document.getElementById("insightsList");
  const insightsStrong = document.querySelector(".insights strong");
  insightsStrong.textContent = "AI Insights";
  insList.innerHTML =
    '<li style="color: var(--muted);">Analyzing your study patterns...</li>';

  // Generate AI insights asynchronously
  generateAIInsights(
    timetable,
    stats.subjectTotals,
    stats,
    computeStreak(log)
  ).then((insights) => {
    insList.innerHTML = "";
    for (const i of insights) {
      const li = document.createElement("li");
      li.textContent = i;
      insList.appendChild(li);
    }
  });

  // charts data
  const labels = Object.keys(stats.subjectTotals).filter(
    (k) => (stats.subjectTotals[k] || 0) > 0
  );
  const pieData = labels.map((l) => Math.round(stats.subjectTotals[l] || 0));
  const colors = labels.map(
    (_, i) => SUBJECT_COLORS[i % SUBJECT_COLORS.length]
  );

  // days range
  const sd = parseISO(rangeStart);
  const ed = parseISO(rangeEnd);
  const days = [];
  const dayData = [];
  const cumData = [];
  let cur = new Date(sd);
  let cum = 0;
  while (cur <= ed) {
    const ymd = dateToYMD(cur);
    days.push(ymd);
    const sum = filtered
      .filter((s) => s.date === ymd)
      .reduce((a, b) => a + b.duration, 0);
    // use whole-number hours for the bar chart
    dayData.push(Math.round(sum));
    cum += Math.round(sum);
    cumData.push(cum);
    cur.setDate(cur.getDate() + 1);
  }

  renderCharts(labels, pieData, days, dayData, cumData, colors);
  renderHeatmap(days, dayData);
  renderProgressBars(timetable, stats.subjectTotals);

  // Update tracking subjects dropdown
  populateTrackingSubjects();
}

// ---- Dark Mode ----
function initDarkMode(reRenderCallback) {
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

    // Re-render charts with new colors
    if (reRenderCallback) {
      reRenderCallback();
    }
  });
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

// ---- Init and events ----
function init() {
  initSidebar();

  const rangeSelect = document.getElementById("rangeSelect");
  const customDates = document.getElementById("customDates");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const applyRange = document.getElementById("applyRange");

  function applyCurrentRange() {
    const range = rangeSelect.value;
    if (range === "custom") {
      customDates.style.display = "inline-flex";
      const s = startDate.value || dateToYMD(new Date());
      const e = endDate.value || dateToYMD(new Date());
      render(s, e);
    } else {
      customDates.style.display = "none";
      const r = computeRange(range);
      // set custom date inputs for visibility when switched
      startDate.value = r.start;
      endDate.value = r.end;
      render(r.start, r.end);
    }
  }

  // Initialize dark mode with callback to re-render charts
  initDarkMode(applyCurrentRange);

  rangeSelect.addEventListener("change", applyCurrentRange);
  applyRange.addEventListener("click", (e) => {
    e.preventDefault();
    applyCurrentRange();
  });

  // add session
  document.getElementById("addSession").addEventListener("submit", (e) => {
    e.preventDefault();
    const subj = document.getElementById("subjInput").value.trim();
    const date = document.getElementById("dateInput").value;
    const hrs = parseFloat(document.getElementById("hoursInput").value);

    // Validation
    if (!subj || !date || !hrs) return;

    if (hrs < 1) {
      alert("Please enter at least 1 hour.");
      return;
    }

    if (hrs > 24) {
      alert(
        "Study hours cannot exceed 24 hours in a day. Please enter a valid number."
      );
      return;
    }

    const log = getStudyLog();
    log.push({ subject: subj, date: date, duration: hrs });
    saveStudyLog(log);

    // ensure timetable knows this subject
    const timetable = getTimetable();
    if (!timetable[subj]) {
      timetable[subj] = 2;
      localStorage.setItem("timetable", JSON.stringify(timetable));
    }

    applyCurrentRange();
    e.target.reset();
  });

  // initial render
  applyCurrentRange();
}

window.addEventListener("load", init);
