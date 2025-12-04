/**********************************************************
 * Utility Helpers
 **********************************************************/
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const STORAGE_KEY     = "subjectsData";
const TIMETABLE_KEY   = "generatedTimetable";


/**********************************************************
 * DOM References
 **********************************************************/
const headerUsername   = $("#headerUsername");
const headerExamDate   = $("#headerExamDate");
const headerHoursPerDay= $("#headerHoursPerDay");

const headerTotalDays  = $("#headerTotalDays");
const headerTotalHours = $("#headerTotalHours");

const tableBody        = $("#timetableTable tbody");

const regenerateBtn = $("#regenerateBtn");
const exportPDF     = $("#exportPDF");
const exportExcel   = $("#exportExcel");
const printTable    = $("#printTable");


/**********************************************************
 * Data Containers
 **********************************************************/
let subjects  = [];
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
 * Header Calculations
 **********************************************************/
function updateTotals() {

  const today    = new Date();
  const examDate = new Date(headerExamDate.value);

  today.setHours(0,0,0,0);
  examDate.setHours(0,0,0,0);

  if (isNaN(examDate)) {
    headerTotalDays.textContent  = 0;
    headerTotalHours.textContent = 0;
    return;
  }

  let diffDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  diffDays     = diffDays > 0 ? diffDays : 0;

  const hoursPerDay = parseInt(headerHoursPerDay.value) || 1;

  headerTotalDays.textContent  = diffDays;
  headerTotalHours.textContent = diffDays * hoursPerDay;
}


/**********************************************************
 * Header Events
 **********************************************************/
headerExamDate.addEventListener("input", () => {
  updateTotals();
  generateTimetable();
});

headerHoursPerDay.addEventListener("input", () => {
  updateTotals();
  generateTimetable();
});

headerUsername.addEventListener("input", () => {
  localStorage.setItem("username", headerUsername.value.trim());
});

headerUsername.value =
  localStorage.getItem("username") || headerUsername.value;


/**********************************************************
 * Generate Timetable
 **********************************************************/
function generateTimetable() {

  loadSubjects();

  const totalDays   = parseInt(headerTotalDays.textContent) || 0;
  const hoursPerDay = parseInt(headerHoursPerDay.value) || 1;

  if (!subjects.length || totalDays < 1) {
    tableBody.innerHTML =
      `<tr><td colspan="6" style="text-align:center;color:#888;">No timetable generated</td></tr>`;
    return;
  }

  // Sort subjects by priority desc
  const sorted = [...subjects].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  const totalPriority   = sorted.reduce((acc, s) => acc + (s.priority || 1), 0);
  const totalStudyHours = totalDays * hoursPerDay;

  timetable = sorted.map(s => {
    const hours = Math.round(
      totalStudyHours * ((s.priority || 1) / totalPriority)
    );
    return { ...s, hours };
  });

  saveTimetable();
  renderTimetable();
}


/**********************************************************
 * Render Table
 **********************************************************/
function renderTimetable() {

  if (!timetable.length) {
    tableBody.innerHTML =
      `<tr><td colspan="6" style="text-align:center;color:#888;">No timetable generated</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";

  timetable.forEach((s, i) => {

    const tr = document.createElement("tr");

    // Calculate background color based on difficulty
    const colorIntensity = 60 + (s.difficulty || 1) * 30;
    tr.style.backgroundColor = `hsl(200,50%,${100 - colorIntensity / 2}%)`;

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td>${s.difficulty}</td>
      <td>${s.importance || "-"}</td>
      <td>${s.priority}</td>
      <td>${s.hours} hrs</td>
    `;

    tableBody.appendChild(tr);
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
    "No,Subject,Difficulty,Importance,Priority,Hours\n";

  timetable.forEach((s, i) => {
    csv += `${i + 1},${s.name},${s.difficulty},${s.importance || "-"},${s.priority},${s.hours}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href     = URL.createObjectURL(blob);
  link.download = "timetable.csv";
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

  doc.setFontSize(16);
  doc.text("StudyRevise Timetable", 14, 20);

  const headers = [["No","Subject","Difficulty","Importance","Priority","Hours"]];

  const body = timetable.map((s,i)=>[
    i+1, s.name, s.difficulty, s.importance || "-", s.priority, s.hours
  ]);

  doc.autoTable({
    head: headers,
    body,
    startY: 30,
    theme: "grid",
    headStyles: { fillColor: [52,73,94] },
    styles: { cellPadding: 3, fontSize: 12 }
  });

  doc.save("timetable.pdf");
});


/**********************************************************
 * Regenerate Timetable
 **********************************************************/
regenerateBtn.addEventListener("click", () => {
  localStorage.removeItem(TIMETABLE_KEY);
  window.location.href = "generate.html";
});


/**********************************************************
 * Init App
 **********************************************************/
loadSubjects();
loadTimetable();
generateTimetable();
