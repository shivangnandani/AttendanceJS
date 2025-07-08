// ---- Bubble background: original theme, multiple containers for coverage ----
(function(){
  const bubbleBg = document.getElementById('bubbleBg');
  const containers = [
    {top:"0",left:"0"}, {top:"0",left:"33vw"}, {top:"0",left:"66vw"}, {top:"0",left:"99vw"},
    {top:"33vh",left:"0"}, {top:"33vh",left:"33vw"}, {top:"33vh",left:"66vw"}, {top:"33vh",left:"99vw"},
    {top:"66vh",left:"0"}, {top:"66vh",left:"33vw"}, {top:"66vh",left:"66vw"}, {top:"66vh",left:"99vw"}
  ];
  containers.forEach(pos => {
    const cont = document.createElement('div');
    cont.className = "bubble-container";
    cont.style.top = pos.top;
    cont.style.left = pos.left;
    for(let i=0;i<5;i++){
      let b=document.createElement('div');
      b.className='bubble';
      for(let j=0;j<5;j++){
        let s=document.createElement('span');
        b.appendChild(s);
      }
      cont.appendChild(b);
    }
    bubbleBg.appendChild(cont);
  });
})();

// ---- Theme Toggle ----
function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggleBtn').textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeToggleBtn').textContent = '🌙';
  }
  localStorage.setItem('theme', theme);
}
function getSystemTheme() {
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function toggleTheme() {
  let isDark = document.body.classList.contains('dark-mode');
  setTheme(isDark ? 'light' : 'dark');
}
document.getElementById('themeToggleBtn').onclick = toggleTheme;
window.addEventListener('DOMContentLoaded', () => {
  let saved = localStorage.getItem('theme');
  setTheme(saved ? saved : getSystemTheme());
});
window.addEventListener('keydown', function(e){
  // Theme toggle on spacebar (when not typing)
  if (e.key === " " && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
    toggleTheme();
  }
});

// ---- Attendance System JS ----
let facultyDB = {
  PUJ: "Pradyumansinh U Jadeja",
  SRM: "Shruti R Maniar",
  DBK: "Dixita B Kagathara",
  AVB: "Arjun V Bala",
  FAS: "Firoz A Sherasiya",
  MRF: "Madhuresh R Fichadiya",
  VDB: "Vasudev D Barjadiya",
  PBV: "Punit B Vadher",
  PJB: "Prashant J Bakotiya",
  NKK: "Nikitaben K Koringa",
  DHZ: "Dhvanik H Zala"
};
let facultyCode = "", facultyName = "";
let fromRoll = 0, toRoll = 0, className = "";
let attendanceList = [], rollNos = [];
let attendanceDate = "", attendanceTime = "", attendanceSlot = "";
let attendancePointer = 0;

// ---- Faculty Screen ----
const facultyCodeInput = document.getElementById('facultyCode');
const facultyNameInput = document.getElementById('facultyName');
facultyCodeInput.addEventListener('input', function(e){
  let val = this.value.toUpperCase().replace(/[^A-Z]/g, "");
  this.value = val;
  document.getElementById('codeMsg').textContent = "";
  document.getElementById('nameMsg').textContent = "";
  facultyNameInput.classList.remove("invalid");
  facultyNameInput.value = "";
  facultyNameInput.disabled = true;
});
facultyCodeInput.addEventListener('keydown', function(e){
  if (e.key === "Enter" || e.key === "Tab") {
    let code = facultyCodeInput.value.trim().toUpperCase();
    if (!code || !/^[A-Z]+$/.test(code)) {
      document.getElementById('codeMsg').textContent = "Only alphabets allowed.";
      facultyCodeInput.classList.add("invalid");
      return;
    }
    facultyCodeInput.classList.remove("invalid");
    if (facultyDB[code]) {
      facultyNameInput.value = facultyDB[code];
      facultyNameInput.disabled = true;
      document.getElementById('facultyNextBtn').focus();
    } else {
      facultyNameInput.value = "";
      facultyNameInput.disabled = false;
      facultyNameInput.focus();
    }
    e.preventDefault();
  }
});
facultyNameInput.addEventListener('keydown', function(e){
  if (e.key === "Enter") handleFaculty();
});
function handleFaculty() {
  let code = facultyCodeInput.value.trim().toUpperCase();
  let name = facultyNameInput.value.trim();
  let codeMsg = document.getElementById('codeMsg');
  let nameMsg = document.getElementById('nameMsg');
  codeMsg.textContent = ""; nameMsg.textContent = "";
  facultyCodeInput.classList.remove("invalid"); facultyNameInput.classList.remove("invalid");

  if (!code || !/^[A-Z]+$/.test(code)) {
    codeMsg.textContent = "Only alphabets allowed in Faculty Code.";
    facultyCodeInput.classList.add("invalid");
    facultyCodeInput.focus();
    return;
  }
  if (facultyDB[code]) {
    facultyNameInput.value = facultyDB[code];
    facultyNameInput.disabled = true;
    facultyName = facultyDB[code];
  } else {
    if (!name) {
      nameMsg.textContent = "Faculty Name is required.";
      facultyNameInput.classList.add("invalid");
      facultyNameInput.disabled = false;
      facultyNameInput.focus();
      return;
    }
    facultyDB[code] = name;
    facultyName = name;
  }
  facultyCode = code;
  document.getElementById('screen1').style.display = "none";
  document.getElementById('screen2').style.display = "";
  document.getElementById('fromRoll').focus();
}

// ---- Range Screen ----
let fromEntered = false, toEntered = false;
const fromRollInput = document.getElementById('fromRoll');
const toRollInput = document.getElementById('toRoll');
function validateRangeInputs() {
  let from = fromRollInput.value.trim();
  let to = toRollInput.value.trim();
  let msg = document.getElementById('rangeMsg');
  fromRollInput.classList.remove("invalid"); toRollInput.classList.remove("invalid");
  msg.textContent = "";
  fromEntered = !!from;
  toEntered = !!to;
  if (fromEntered && toEntered) {
    if (!/^\d+$/.test(from) || !/^\d+$/.test(to)) {
      msg.textContent = "Only numbers allowed in roll numbers.";
      if (!/^\d+$/.test(from)) fromRollInput.classList.add("invalid");
      if (!/^\d+$/.test(to)) toRollInput.classList.add("invalid");
      document.getElementById('rangeNextBtn').disabled = true;
      return false;
    }
    let fromNum = parseInt(from, 10), toNum = parseInt(to, 10);
    if (fromNum < 0 || toNum < 0 || fromNum > toNum) {
      msg.textContent = "Out of range. From should be <= To and both positive.";
      fromRollInput.classList.add("invalid");
      toRollInput.classList.add("invalid");
      document.getElementById('rangeNextBtn').disabled = true;
      return false;
    }
    msg.textContent = "";
    document.getElementById('rangeNextBtn').disabled = false;
    return true;
  }
  document.getElementById('rangeNextBtn').disabled = true;
  return false;
}
fromRollInput.addEventListener('input', validateRangeInputs);
toRollInput.addEventListener('input', validateRangeInputs);
fromRollInput.addEventListener('keydown', function(e){
  if (e.key === "Enter") toRollInput.focus();
});
toRollInput.addEventListener('keydown', function(e){
  if (e.key === "Enter") handleRange();
});
function handleRange() {
  if (!validateRangeInputs()) return;
  fromRoll = parseInt(fromRollInput.value.trim(), 10);
  toRoll = parseInt(toRollInput.value.trim(), 10);
  if (fromRoll >= 109 && toRoll <= 280) className = "A";
  else if (fromRoll >= 301 && toRoll <= 429) className = "B";
  else className = "Other";
  rollNos = [];
  for (let i = fromRoll; i <= toRoll; i++) rollNos.push(i);
  attendanceList = [];
  attendancePointer = 0;
  let now = new Date();
  attendanceDate = now.toLocaleDateString();
  attendanceTime = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  attendanceSlot = getSlot(now);
  document.getElementById('screen2').style.display = "none";
  document.getElementById('screen3').style.display = "";
  updateAttendanceMeta();
  showCurrentRoll();
}

// ---- Slot Calculation ----
function getSlot(dt) {
  let h = dt.getHours(), m = dt.getMinutes();
  let mins = h * 60 + m;
  if (mins >= 465 && mins < 525) return "1"; // 7:45-8:45
  if (mins >= 525 && mins < 580) return "2"; // 8:45-9:40
  if (mins >= 590 && mins < 640) return "3"; // 9:50-10:40
  if (mins >= 640 && mins < 690) return "4"; // 10:40-11:30
  if (mins >= 730 && mins < 780) return "5"; // 12:10-1:00
  if (mins >= 780 && mins < 830) return "6"; // 1:00-1:50
  return "N/A";
}

// ---- Attendance Input: Instant Validation, Instant Move ----
const presentInput = document.getElementById('presentInput');
const presentMsg = document.getElementById('presentMsg');

presentInput.addEventListener('input', function() {
  let val = this.value.trim().toLowerCase();

  if (val === "") {
    this.classList.remove("invalid");
    presentMsg.textContent = "";
    return;
  }
  if (!/^(1|0|p|a|present|absent)$/i.test(val)) {
    this.classList.add("invalid");
    presentMsg.textContent = "Enter 1/0 or p/a";
    return;
  }
  this.classList.remove("invalid");
  presentMsg.textContent = "";
  handleAttendanceInput();
});
presentInput.addEventListener('keydown', function(e){
  if (e.key === "Enter") {
    e.preventDefault();
    let val = this.value.trim().toLowerCase();
    if (/^(1|0|p|a|present|absent)$/i.test(val)) {
      handleAttendanceInput();
    }
  }
});
function handleAttendanceInput() {
  let input = presentInput;
  let val = input.value.trim().toLowerCase();
  let msg = presentMsg;
  msg.textContent = "";
  input.classList.remove("invalid");

  if (!/^(1|0|p|a|present|absent)$/i.test(val)) {
    msg.textContent = "Enter 1/0 or p/a";
    input.classList.add("invalid");
    input.focus();
    return;
  }
  let isPresent = (val === "1" || val === "p" || val === "present");
  attendanceList.push({ roll: rollNos[attendancePointer], present: isPresent });
  attendancePointer++;
  showCurrentRoll();
}

function updateAttendanceMeta() {
  document.getElementById('attendanceMeta').innerHTML =
    `<b>Date:</b> ${attendanceDate} &nbsp; <b>Time:</b> ${attendanceTime} &nbsp; <b>Slot:</b> ${attendanceSlot}<br>
    <b>Faculty:</b> ${facultyName} <br>
    <b>Class:</b> ${className} &nbsp; <b>Range:</b> ${fromRoll} - ${toRoll}`;
}
function showCurrentRoll() {
  let label = document.getElementById('currentRollLabel');
  let input = document.getElementById('presentInput');
  let msg = document.getElementById('presentMsg');
  msg.textContent = "";
  if (attendancePointer >= rollNos.length) {
    label.textContent = "Done!";
    input.style.display = "none";
    document.getElementById('submitBtn').style.display = "";
    document.getElementById('submitBtn').focus();
    return;
  }
  label.textContent = `Roll No: ${rollNos[attendancePointer]}`;
  input.value = "";
  input.style.display = "";
  input.classList.remove("invalid");
  input.focus();
  document.getElementById('submitBtn').style.display = "none";
}
document.getElementById('attendanceForm').addEventListener('submit', function(e){
  e.preventDefault();
  if (attendancePointer < rollNos.length) {
    handleAttendanceInput();
  } else {
    document.getElementById('screen3').style.display = "none";
    showNotepadPrint();
  }
});

// ---- Review Grid ----
let reviewSelectedIndex = 0;
function showReview() {
  document.getElementById('screen3').style.display = "none";
  document.getElementById('screen4').style.display = "";
  buildReviewGrid();
  reviewSelectedIndex = 0;
  highlightReviewRow();
  document.addEventListener('keydown', reviewKeyHandler);
}
function buildReviewGrid() {
  let grid = `<table class="table table-bordered review-grid"><thead><tr>
    <th>Roll No</th><th>Status</th></tr></thead><tbody>`;
  for (let i = 0; i < attendancePointer; i++) {
    let att = attendanceList[i];
    grid += `<tr data-idx="${i}">
      <td style="font-size:1.2em;font-weight:600;">${att.roll}</td>
      <td>
        <input type="checkbox" ${att.present ? "checked" : ""} onchange="toggleAttendance(${i}, this)">
        <span class="${att.present ? "present" : "absent"}">${att.present ? "Present" : "Absent"}</span>
      </td>
    </tr>`;
  }
  grid += "</tbody></table>";
  document.getElementById('reviewGrid').innerHTML = grid;
}
window.toggleAttendance = function(idx, el) {
  attendanceList[idx].present = el.checked;
  buildReviewGrid();
  highlightReviewRow();
};
function highlightReviewRow() {
  let rows = document.querySelectorAll('#reviewGrid tr[data-idx]');
  rows.forEach(r => r.classList.remove('review-selected'));
  if (rows[reviewSelectedIndex]) rows[reviewSelectedIndex].classList.add('review-selected');
  // Scroll into view if needed
  let container = document.getElementById('reviewGrid');
  let row = rows[reviewSelectedIndex];
  if (row && container) {
    let rowRect = row.getBoundingClientRect();
    let contRect = container.getBoundingClientRect();
    if (rowRect.top < contRect.top) {
      row.scrollIntoView({block: "nearest"});
    } else if (rowRect.bottom > contRect.bottom) {
      row.scrollIntoView({block: "nearest"});
    }
  }
}
function reviewKeyHandler(e) {
  let rows = document.querySelectorAll('#reviewGrid tr[data-idx]');
  if (!rows.length) return;
  if (e.key === "ArrowDown") {
    reviewSelectedIndex = (reviewSelectedIndex + 1) % rows.length;
    highlightReviewRow();
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    reviewSelectedIndex = (reviewSelectedIndex - 1 + rows.length) % rows.length;
    highlightReviewRow();
    e.preventDefault();
  } else if (e.key === "Enter" || e.key === " ") {
    let idx = parseInt(rows[reviewSelectedIndex].getAttribute('data-idx'));
    attendanceList[idx].present = !attendanceList[idx].present;
    buildReviewGrid();
    highlightReviewRow();
    e.preventDefault();
  } else if (e.key === "Backspace" || e.key === "Escape") {
    returnToAttendance();
    e.preventDefault();
  }
}
function returnToAttendance() {
  document.removeEventListener('keydown', reviewKeyHandler);
  document.getElementById('screen4').style.display = "none";
  document.getElementById('screen3').style.display = "";
  showCurrentRoll();
}
window.addEventListener('keydown', function(e){
  if ((e.key === "R" || e.key === "r") && document.getElementById('screen3').style.display !== "none") {
    showReview();
  }
  if (e.altKey && (e.key === "R" || e.key === "r") && document.getElementById('screen3').style.display !== "none") {
    showReview();
  }
});

// ---- Notepad Print, Download, Clipboard ----
function showNotepadPrint() {
  let absent = attendanceList.filter(a => !a.present).map(a => a.roll);
  let present = attendanceList.filter(a => a.present).map(a => a.roll);

  // Prepare TXT content (full report)
  let txtLines = [];
  txtLines.push(`Faculty: ${facultyName}`);
  txtLines.push(`Date: ${attendanceDate}`);
  txtLines.push(`Time: ${attendanceTime}`);
  txtLines.push(`Slot: ${attendanceSlot}`);
  txtLines.push(`Class: ${className}`);
  txtLines.push(`Range: ${fromRoll} - ${toRoll}`);
  txtLines.push(`Absent:`);
  txtLines.push(absent.length ? absent.join(', ') : "None");
  txtLines.push(`Present:`);
  txtLines.push(present.length ? present.join(', ') : "None");
  let txtContent = txtLines.join('\n');

  // Prepare CSV content (only absent roll numbers comma separated)
  let csvContent = absent.length ? absent.join(',') : '';

  // Show TXT preview by default
  document.getElementById('notepadPrint').textContent = txtContent;
  document.getElementById('screen5').style.display = "";

  const fileTypeSelect = document.getElementById('downloadFormat');
  const downloadBtn = document.getElementById('saveBtn');

  // Restore last selected format or default to txt
  const savedType = localStorage.getItem('fileTypeSelect');
  if (savedType) fileTypeSelect.value = savedType;
  else fileTypeSelect.value = 'txt';

  // Update preview and focus Download button on dropdown change
  fileTypeSelect.onchange = function() {
    localStorage.setItem('fileTypeSelect', this.value);
    if (this.value === 'csv') {
      document.getElementById('notepadPrint').textContent = csvContent;
    } else {
      document.getElementById('notepadPrint').textContent = txtContent;
    }
    downloadBtn.focus(); // Auto focus Download button on dropdown change
  };

  // Initial focus on Download button when page shows
  setTimeout(() => downloadBtn.focus(), 100);

  // Download button: download and copy
  downloadBtn.onclick = function() {
    let format = fileTypeSelect.value;
    let content = (format === 'csv') ? csvContent : txtContent;
    let ext = format;
    let dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'_');
    let filename = `${className}_${dateStr}.${ext}`;
    let mimeType = (format === 'csv') ? 'text/csv' : 'text/plain';
    let blob = new Blob([content], { type: mimeType });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 200);
    // Copy to clipboard
    navigator.clipboard.writeText(content);
  };
}

window.onload = function() {
  setTimeout(() => facultyCodeInput.focus(), 120);
};
