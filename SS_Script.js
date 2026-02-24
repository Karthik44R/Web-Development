// Sample student database (using localStorage)
const STUDENT_DB_KEY = 'studentDatabase';
const LOGGED_IN_USER = 'loggedInUser';
const FILES_DB_KEY = 'studentFiles';
const TIMETABLE_DB_KEY = 'studentTimetable';
const THEME_KEY = 'appTheme';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Initialize sample data
function initializeSampleData() {
    const existingDB = localStorage.getItem(STUDENT_DB_KEY);
    if (!existingDB) {
        const sampleStudents = {
            '2024001A34': {
                name: 'John Doe',
                admission: '2024001A34',
                email: 'john@university.edu',
                password: 'password123',
                cgpa: 3.85,
                semester: 5,
                credits: 120
            },
            '2024001B35': {
                name: 'Sarah Smith',
                admission: '2024001B35',
                email: 'sarah@university.edu',
                password: 'password123',
                cgpa: 3.92,
                semester: 5,
                credits: 120
            },
            '2024001C36': {
                name: 'Mike Johnson',
                admission: '2024001C36',
                email: 'mike@university.edu',
                password: 'password123',
                cgpa: 3.78,
                semester: 5,
                credits: 120
            }
        };
        localStorage.setItem(STUDENT_DB_KEY, JSON.stringify(sampleStudents));
    }
}

// Toggle between login and register forms
function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm.classList.contains('active')) {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }
    
    // Clear error messages
    clearErrors();
}

// Clear all error messages
function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(err => {
        err.classList.remove('show');
        err.textContent = '';
    });
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const admission = document.getElementById('login-admission').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    initializeSampleData();
    const db = JSON.parse(localStorage.getItem(STUDENT_DB_KEY));
    
    if (db[admission]) {
        if (db[admission].password === password) {
            // Login successful
            localStorage.setItem(LOGGED_IN_USER, JSON.stringify(db[admission]));
            window.location.href = 'Dashboard.html'; // Redirect to dashboard
        } else {
            errorElement.textContent = 'Invalid password. Please try again.';
            errorElement.classList.add('show');
        }
    } else {
        errorElement.textContent = 'Admission number not found. Please register first.';
        errorElement.classList.add('show');
    }
}

// Handle Registration
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const admission = document.getElementById('register-admission').value.trim().toUpperCase();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorElement = document.getElementById('register-error');
    
    // Validation
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long.';
        errorElement.classList.add('show');
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match.';
        errorElement.classList.add('show');
        return;
    }
    
    // Validate: 9 numbers and 1 alphabet anywhere in the string
    const hasOneLetter = (admission.match(/[A-Z]/g) || []).length === 1;
    const hasNineNumbers = (admission.match(/[0-9]/g) || []).length === 9;
    const isTenChars = admission.length === 10;
    
    if (!isTenChars || !hasOneLetter || !hasNineNumbers) {
        errorElement.textContent = 'Admission number must be 10 characters (9 numbers and 1 letter)';
        errorElement.classList.add('show');
        return;
    }
    
    initializeSampleData();
    const db = JSON.parse(localStorage.getItem(STUDENT_DB_KEY));
    
    if (db[admission]) {
        errorElement.textContent = 'This admission number is already registered.';
        errorElement.classList.add('show');
        return;
    }
    
    // Create new student record
    db[admission] = {
        name: name,
        admission: admission,
        email: email,
        password: password,
        cgpa: 0,
        semester: 1,
        credits: 0
    };
    
    localStorage.setItem(STUDENT_DB_KEY, JSON.stringify(db));
    
    // Show success message
    errorElement.textContent = 'Registration successful! Please login.';
    errorElement.style.color = '#27ae60';
    errorElement.classList.add('show');
    
    // Clear form and switch to login
    document.getElementById('register-form').reset();
    setTimeout(() => {
        toggleForms();
        clearErrors();
    }, 2000);
}

// Load student dashboard
function loadDashboard() {
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    
    if (!userStr) {
        // Not logged in, redirect to login
        window.location.href = 'Login_Register.html';
        return;
    }
    
    const student = JSON.parse(userStr);
    
    // Populate student information
    document.getElementById('display-name').textContent = student.name;
    document.getElementById('display-admission').textContent = student.admission;
    document.getElementById('display-email').textContent = student.email;
    document.getElementById('display-cgpa').textContent = student.cgpa.toFixed(2);
    
    document.getElementById('stat-cgpa').textContent = student.cgpa.toFixed(2);
    document.getElementById('stat-semester').textContent = student.semester;
    document.getElementById('stat-credits').textContent = student.credits;
    
    // Populate sidebar
    document.getElementById('sidebar-name').textContent = student.name;
    document.getElementById('sidebar-admission').textContent = student.admission;
    
    // Load files list
    loadFilesList();
}

// Handle file selection
function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}

// Handle drag and drop
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.querySelector('.upload-area').classList.add('drag-over');
}

function handleDropZone(event) {
    event.preventDefault();
    event.stopPropagation();
    document.querySelector('.upload-area').classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    handleFiles(files);
}

// Process files
function handleFiles(files) {
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return;
    
    const student = JSON.parse(userStr);
    let fileDB = JSON.parse(localStorage.getItem(FILES_DB_KEY)) || {};
    
    if (!fileDB[student.admission]) {
        fileDB[student.admission] = [];
    }
    
    for (let file of files) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            alert(`File "${file.name}" exceeds 10MB limit. Skipped.`);
            continue;
        }
        
        // Read file as base64
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileObj = {
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toLocaleDateString(),
                data: e.target.result
            };
            
            fileDB[student.admission].push(fileObj);
            localStorage.setItem(FILES_DB_KEY, JSON.stringify(fileDB));
            loadFilesList();
        };
        reader.readAsDataURL(file);
    }
}

// Load and display files list
function loadFilesList() {
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return;
    
    const student = JSON.parse(userStr);
    const fileDB = JSON.parse(localStorage.getItem(FILES_DB_KEY)) || {};
    const studentFiles = fileDB[student.admission] || [];
    const filesList = document.getElementById('files-list');
    
    if (studentFiles.length === 0) {
        filesList.innerHTML = '<p class="no-files">No files uploaded yet</p>';
        return;
    }
    
    filesList.innerHTML = studentFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-name">📄 ${file.name}</div>
                <div class="file-details">
                    Size: ${(file.size / 1024 / 1024).toFixed(2)}MB | Uploaded: ${file.uploadDate}
                </div>
            </div>
            <div class="file-actions">
                <button class="file-btn" onclick="downloadFile(${index})">Download</button>
                <button class="file-btn" onclick="deleteFile(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Download file
function downloadFile(index) {
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return;
    
    const student = JSON.parse(userStr);
    const fileDB = JSON.parse(localStorage.getItem(FILES_DB_KEY)) || {};
    const studentFiles = fileDB[student.admission] || [];
    const file = studentFiles[index];
    
    if (!file) return;
    
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
}

// Delete file
function deleteFile(index) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return;
    
    const student = JSON.parse(userStr);
    let fileDB = JSON.parse(localStorage.getItem(FILES_DB_KEY)) || {};
    
    if (fileDB[student.admission]) {
        fileDB[student.admission].splice(index, 1);
        localStorage.setItem(FILES_DB_KEY, JSON.stringify(fileDB));
        loadFilesList();
    }
}

// Toggle edit timetable
function toggleEditTimetable() {
    const view = document.getElementById('timetable-view');
    const edit = document.getElementById('timetable-edit');
    
    view.style.display = view.style.display === 'none' ? 'block' : 'none';
    edit.style.display = edit.style.display === 'none' ? 'block' : 'none';
}

// Update timetable
function updateTimetable() {
    const time = document.getElementById('edit-time').value;
    const day = document.getElementById('edit-day').value;
    const courseName = document.getElementById('edit-course').value.trim();
    
    if (!courseName) {
        alert('Please enter a course name');
        return;
    }
    
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return;
    
    const student = JSON.parse(userStr);
    
    // Find and update the cell
    const cells = document.querySelectorAll('.timetable-cell');
    cells.forEach(cell => {
        if (cell.dataset.time === time && cell.dataset.day === day) {
            cell.textContent = courseName;
        }
    });
    
    // Save to localStorage
    let timetableDB = JSON.parse(localStorage.getItem(TIMETABLE_DB_KEY)) || {};
    if (!timetableDB[student.admission]) {
        timetableDB[student.admission] = {};
    }
    
    timetableDB[student.admission][`${time}-${day}`] = courseName;
    localStorage.setItem(TIMETABLE_DB_KEY, JSON.stringify(timetableDB));
    
    // Clear form and hide edit view
    document.getElementById('edit-course').value = '';
    toggleEditTimetable();
    alert('Timetable updated successfully!');
}

// Section Switching
function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Show selected section
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Update nav item active state
    event.target.closest('.nav-item').classList.add('active');
    
    // Update header title
    const titles = {
        'overview': 'Overview',
        'courses': 'Course Notes & Grades',
        'timetable': 'Weekly Timetable',
        'notes': 'Subject Notes',
        'documents': 'My Documents',
        'attendance': 'Attendance Status'
    };
    document.getElementById('section-title').textContent = titles[sectionName] || 'Dashboard';
    
    // Close sidebar on mobile
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('open')) {
        toggleSidebar();
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Load saved timetable
function loadSavedTimetable() {
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return;
    
    const student = JSON.parse(userStr);
    const timetableDB = JSON.parse(localStorage.getItem(TIMETABLE_DB_KEY)) || {};
    const studentTimetable = timetableDB[student.admission] || {};
    
    const cells = document.querySelectorAll('.timetable-cell');
    cells.forEach(cell => {
        const key = `${cell.dataset.time}-${cell.dataset.day}`;
        if (studentTimetable[key]) {
            cell.textContent = studentTimetable[key];
        }
    });
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        localStorage.setItem(THEME_KEY, 'dark');
        if (themeBtn) themeBtn.textContent = '🌙';
    } else {
        body.classList.add('light-theme');
        localStorage.setItem(THEME_KEY, 'light');
        if (themeBtn) themeBtn.textContent = '☀️';
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        body.classList.remove('light-theme');
        if (themeBtn) themeBtn.textContent = '🌙';
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(LOGGED_IN_USER);
        window.location.href = 'Login_Register.html';
    }
}

// Attendance Functions
const ATTENDANCE_DB_KEY = 'studentAttendance';

function getAttendanceKey() {
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return `${ATTENDANCE_DB_KEY}_${user.admission}`;
}

function getUniqueSubjects() {
    const cells = document.querySelectorAll('.timetable-cell');
    const subjects = new Set();
    
    cells.forEach(cell => {
        const subject = cell.textContent.trim();
        if (subject && subject !== 'LUNCH BREAK') {
            subjects.add(subject);
        }
    });
    
    return Array.from(subjects).sort();
}

function loadSubjectAttendance() {
    const key = getAttendanceKey();
    if (!key) return;
    
    const subjects = getUniqueSubjects();
    const grid = document.getElementById('subject-attendance-grid');
    
    if (!grid) return;
    
    // Get saved attendance
    const attendanceStr = localStorage.getItem(key);
    let attendance = {};
    if (attendanceStr) {
        attendance = JSON.parse(attendanceStr);
    }
    
    // Create cards for each subject
    grid.innerHTML = subjects.map(subject => {
        const safeId = subject.replace(/\s+/g, '-').toLowerCase();
        const isChecked = attendance[subject] || false;
        return `
            <div class="subject-attendance-card ${isChecked ? 'checked' : ''}">
                <input type="checkbox" id="subject-${safeId}" class="subject-checkbox-input" 
                    data-subject="${subject}" ${isChecked ? 'checked' : ''} 
                    onchange="updateSubjectAttendance()">
                <label class="subject-name" for="subject-${safeId}">${subject}</label>
            </div>
        `;
    }).join('');
    
    updateSubjectAttendanceDisplay();
}

function updateSubjectAttendance() {
    const key = getAttendanceKey();
    if (!key) return;
    
    const checkboxes = document.querySelectorAll('.subject-checkbox-input');
    const attendance = {};
    
    checkboxes.forEach(checkbox => {
        const subject = checkbox.dataset.subject;
        attendance[subject] = checkbox.checked;
        
        // Update card styling
        const card = checkbox.closest('.subject-attendance-card');
        if (checkbox.checked) {
            card.classList.add('checked');
        } else {
            card.classList.remove('checked');
        }
    });
    
    // Save to localStorage
    localStorage.setItem(key, JSON.stringify(attendance));
    
    // Update display
    updateSubjectAttendanceDisplay();
}

function updateSubjectAttendanceDisplay() {
    const subjects = getUniqueSubjects();
    let attendedCount = 0;
    
    const checkboxes = document.querySelectorAll('.subject-checkbox-input');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            attendedCount++;
        }
    });
    
    const totalSubjects = subjects.length;
    const missedCount = totalSubjects - attendedCount;
    const percentage = totalSubjects > 0 ? Math.round((attendedCount / totalSubjects) * 100) : 0;
    
    // Update summary display
    const attendedElement = document.getElementById('subjects-attended');
    const missedElement = document.getElementById('subjects-missed');
    const percentageElement = document.getElementById('subject-attendance-percentage');
    
    if (attendedElement) attendedElement.textContent = attendedCount;
    if (missedElement) missedElement.textContent = missedCount;
    if (percentageElement) percentageElement.textContent = percentage + '%';
}

// Notes Management Functions
const NOTES_DB_KEY = 'studentNotes';

function getNotesKey() {
    const userStr = localStorage.getItem(LOGGED_IN_USER);
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return `${NOTES_DB_KEY}_${user.admission}`;
}

function loadNotesFolders() {
    const subjects = getUniqueSubjects();
    const grid = document.getElementById('notes-folders');
    
    if (!grid) return;
    
    const key = getNotesKey();
    let notesDB = {};
    
    if (key) {
        const notesStr = localStorage.getItem(key);
        if (notesStr) {
            notesDB = JSON.parse(notesStr);
        }
    }
    
    // Create folder cards for each subject
    grid.innerHTML = subjects.map(subject => {
        const safeId = subject.replace(/\s+/g, '-').toLowerCase();
        const subjectNotes = notesDB[subject] || [];
        const noteCount = subjectNotes.length;
        
        return `
            <div class="notes-folder">
                <div class="folder-icon">📁</div>
                <div class="folder-name">${subject}</div>
                <div class="folder-note-count">${noteCount} note${noteCount !== 1 ? 's' : ''}</div>
                <div class="folder-actions">
                    <button class="folder-btn" onclick="openNotesFolder('${subject}')">View Notes</button>
                    <button class="folder-btn" onclick="uploadToFolder('${subject}')">Upload Notes</button>
                </div>
            </div>
        `;
    }).join('');
}

function openNotesFolder(subject) {
    const key = getNotesKey();
    if (!key) return;
    
    const notesStr = localStorage.getItem(key);
    const notesDB = notesStr ? JSON.parse(notesStr) : {};
    const subjectNotes = notesDB[subject] || [];
    
    // Create modal content - VIEW ONLY (no upload)
    let notesHTML = `
        <div class="notes-modal show">
            <div class="notes-modal-content">
                <div class="notes-modal-header">
                    <h2>${subject} - View Notes</h2>
                    <button class="modal-close-btn" onclick="closeNotesModal()">&times;</button>
                </div>
    `;
    
    if (subjectNotes.length > 0) {
        notesHTML += `<div class="notes-list">`;
        subjectNotes.forEach((note, index) => {
            notesHTML += `
                <div class="note-item">
                    <div class="note-info">
                        <div class="note-name">📄 ${note.name}</div>
                        <div class="note-date">Uploaded: ${note.uploadDate}</div>
                    </div>
                    <div class="note-actions">
                        <button class="note-btn" onclick="downloadNote('${subject}', ${index})">Download</button>
                        <button class="note-btn" onclick="deleteNote('${subject}', ${index})">Delete</button>
                    </div>
                </div>
            `;
        });
        notesHTML += '</div>';
    } else {
        notesHTML += '<p class="no-notes">No notes uploaded yet</p>';
    }
    
    notesHTML += '</div></div>';
    
    // Insert modal into page
    if (document.getElementById('notes-modal-container')) {
        document.getElementById('notes-modal-container').remove();
    }
    const modalContainer = document.createElement('div');
    modalContainer.id = 'notes-modal-container';
    modalContainer.innerHTML = notesHTML;
    document.body.appendChild(modalContainer);
}

function openNotesUpload(subject) {
    const key = getNotesKey();
    if (!key) return;
    
    // Create modal content - UPLOAD ONLY
    let uploadHTML = `
        <div class="notes-modal show">
            <div class="notes-modal-content">
                <div class="notes-modal-header">
                    <h2>${subject} - Upload Notes</h2>
                    <button class="modal-close-btn" onclick="closeNotesModal()">&times;</button>
                </div>
                <div class="notes-upload-box" ondrop="handleNotesDropZone(event, '${subject}')" ondragover="handleNotesDragOver(event)">
                    <div class="notes-upload-icon">📝</div>
                    <h3>Upload Notes</h3>
                    <p>Drag & Drop or click to browse</p>
                    <input type="file" id="notes-file-input-${subject}" style="display: none;" onchange="handleNotesFileSelect(event, '${subject}')" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx">
                    <button class="btn btn-primary" onclick="document.getElementById('notes-file-input-${subject}').click()">Browse Files</button>
                </div>
            </div>
        </div>
    `;
    
    // Insert modal into page
    if (document.getElementById('notes-modal-container')) {
        document.getElementById('notes-modal-container').remove();
    }
    const modalContainer = document.createElement('div');
    modalContainer.id = 'notes-modal-container';
    modalContainer.innerHTML = uploadHTML;
    document.body.appendChild(modalContainer);
}

function closeNotesModal() {
    const modal = document.getElementById('notes-modal-container');
    if (modal) {
        modal.remove();
    }
}

function uploadToFolder(subject) {
    openNotesUpload(subject);
}

function handleNotesDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
}

function handleNotesDropZone(event, subject) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    handleNotesFiles(files, subject);
}

function handleNotesFileSelect(event, subject) {
    const files = event.target.files;
    handleNotesFiles(files, subject);
}

function handleNotesFiles(files, subject) {
    const key = getNotesKey();
    if (!key) return;
    
    let notesDB = JSON.parse(localStorage.getItem(key)) || {};
    
    if (!notesDB[subject]) {
        notesDB[subject] = [];
    }
    
    for (let file of files) {
        // Validate file size (10MB)
        if (file.size > MAX_FILE_SIZE) {
            alert(`File "${file.name}" exceeds 10MB limit. Skipped.`);
            continue;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const noteObj = {
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toLocaleDateString(),
                data: e.target.result
            };
            
            notesDB[subject].push(noteObj);
            localStorage.setItem(key, JSON.stringify(notesDB));
            loadNotesFolders();
            openNotesFolder(subject);
        };
        reader.readAsDataURL(file);
    }
}

function downloadNote(subject, index) {
    const key = getNotesKey();
    if (!key) return;
    
    const notesDB = JSON.parse(localStorage.getItem(key)) || {};
    const subjectNotes = notesDB[subject] || [];
    const note = subjectNotes[index];
    
    if (!note) return;
    
    const link = document.createElement('a');
    link.href = note.data;
    link.download = note.name;
    link.click();
}

function deleteNote(subject, index) {
    if (!confirm('Delete this note?')) return;
    
    const key = getNotesKey();
    if (!key) return;
    
    let notesDB = JSON.parse(localStorage.getItem(key)) || {};
    
    if (notesDB[subject]) {
        notesDB[subject].splice(index, 1);
        localStorage.setItem(key, JSON.stringify(notesDB));
        loadNotesFolders();
        openNotesFolder(subject);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load theme first
    loadSavedTheme();
    
    initializeSampleData();
    
    // If on dashboard, load student data
    if (document.querySelector('.dashboard-container')) {
        loadDashboard();
        loadSavedTimetable();
        loadSubjectAttendance();
        loadNotesFolders();
    }
});
