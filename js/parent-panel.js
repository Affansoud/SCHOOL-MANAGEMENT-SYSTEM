// parent-panel.js - Complete Parent Panel with all features

document.addEventListener('DOMContentLoaded', () => {
    // ============ DOM ELEMENTS ============
    const authOverlay = document.getElementById('authOverlay');
    const loginCard = document.getElementById('loginCard');
    const otpCard = document.getElementById('otpCard');
    const loginForm = document.getElementById('loginForm');
    const otpForm = document.getElementById('otpForm');
    const regInput = document.getElementById('regNumber');
    const passInput = document.getElementById('password');
    const togglePassBtn = document.getElementById('togglePass');
    const regError = document.getElementById('regError');
    const passError = document.getElementById('passError');
    const otpError = document.getElementById('otpError');
    const otpBoxes = document.querySelectorAll('.otp-input');
    const timerDisplay = document.getElementById('timerDisplay');
    const resendBtn = document.getElementById('resendBtn');
    const backToLoginBtn = document.getElementById('backToLogin');
    const loginBtn = document.getElementById('loginBtn');
    const verifyBtn = document.getElementById('verifyBtn');
    
    const dashboardContainer = document.getElementById('dashboardContainer');
    const contentWrapper = document.getElementById('contentWrapper');
    const pageTitle = document.getElementById('pageTitle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarCloseBtn = document.getElementById('sidebarClose');
    const navLinks = document.querySelectorAll('.nav-link');
    const darkToggle = document.getElementById('darkToggle');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const cancelLogoutBtn = document.getElementById('cancelLogout');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const toastContainer = document.getElementById('toastContainer');
    
    const VALID_REG = 'PRNT001';
    const VALID_PASS = 'parent123';
    const VALID_OTP = '123456';
    
    let otpTimerInterval = null;
    let timeLeft = 120;
    let isOtpActive = false;
    
    // ============ TOAST ============
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = '0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
    
    function setButtonLoading(btn, isLoading) {
        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.btn-spinner');
        btn.disabled = isLoading;
        if (text) text.style.display = isLoading ? 'none' : 'inline';
        if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
    
    // ============ PASSWORD TOGGLE ============
    togglePassBtn.addEventListener('click', () => {
        const type = passInput.type === 'password' ? 'text' : 'password';
        passInput.type = type;
        const icon = togglePassBtn.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    
    // ============ LOGIN ============
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        regError.textContent = '';
        passError.textContent = '';
        const reg = regInput.value.trim();
        const pass = passInput.value.trim();
        let isValid = true;
        if (!reg) { regError.textContent = 'Registration number is required'; isValid = false; }
        if (!pass) { passError.textContent = 'Password is required'; isValid = false; }
        if (!isValid) return;
        
        setButtonLoading(loginBtn, true);
        setTimeout(() => {
            setButtonLoading(loginBtn, false);
            if (reg.toUpperCase() === VALID_REG && pass === VALID_PASS) {
                showToast('Credentials verified! Please enter OTP.', 'success');
                loginCard.style.display = 'none';
                otpCard.style.display = 'block';
                startOtpTimer();
                if (otpBoxes.length > 0) otpBoxes[0].focus();
            } else {
                passError.textContent = 'Invalid registration number or password';
            }
        }, 1000);
    });
    
    // ============ OTP ============
    function startOtpTimer() {
        clearInterval(otpTimerInterval);
        timeLeft = 120;
        isOtpActive = true;
        resendBtn.disabled = true;
        updateTimerDisplay();
        otpTimerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(otpTimerInterval);
                isOtpActive = false;
                resendBtn.disabled = false;
                timerDisplay.textContent = '00:00';
                otpError.textContent = 'OTP expired. Please resend.';
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    otpBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            if (e.target.value && index < otpBoxes.length - 1) otpBoxes[index + 1].focus();
            otpError.textContent = '';
        });
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && index > 0) otpBoxes[index - 1].focus();
        });
    });
    
    resendBtn.addEventListener('click', () => {
        if (resendBtn.disabled) return;
        otpForm.reset();
        otpError.textContent = '';
        startOtpTimer();
        if (otpBoxes.length > 0) otpBoxes[0].focus();
        showToast('New OTP sent! (Demo: 123456)', 'info');
    });
    
    backToLoginBtn.addEventListener('click', () => {
        clearInterval(otpTimerInterval);
        otpCard.style.display = 'none';
        loginCard.style.display = 'block';
        loginForm.reset();
        regError.textContent = '';
        passError.textContent = '';
    });
    
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isOtpActive) { otpError.textContent = 'OTP expired. Please resend.'; return; }
        let otpValue = '';
        otpBoxes.forEach(box => otpValue += box.value);
        if (otpValue.length !== 6) { otpError.textContent = 'Please enter complete 6-digit OTP'; return; }
        
        setButtonLoading(verifyBtn, true);
        setTimeout(() => {
            setButtonLoading(verifyBtn, false);
            if (otpValue === VALID_OTP) {
                clearInterval(otpTimerInterval);
                showToast('Verification successful! Welcome!', 'success');
                authOverlay.style.display = 'none';
                dashboardContainer.style.display = 'flex';
                loadSection('dashboard');
                setCurrentDate();
            } else {
                otpError.textContent = 'Invalid OTP. (Demo: 123456)';
            }
        }, 800);
    });
    
    // ============ DASHBOARD SECTIONS ============
    function setCurrentDate() {
        const now = new Date();
        const dateEl = document.querySelector('.welcome-date span');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    }
    
    function loadSection(section) {
        const titles = {
            dashboard: 'Dashboard',
            results: 'Academic Results',
            attendance: 'Attendance',
            payments: 'Fee Payments',
            messages: 'Messages',
            profile: 'Profile Settings'
        };
        pageTitle.textContent = titles[section] || 'Dashboard';
        
        switch(section) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'results':
                loadResults();
                break;
            case 'attendance':
                loadAttendance();
                break;
            case 'payments':
                loadPayments();
                break;
            case 'messages':
                loadMessages();
                break;
            case 'profile':
                loadProfile();
                break;
            default:
                loadDashboard();
        }
    }
    
    function loadDashboard() {
        contentWrapper.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-text">
                    <h1>Welcome back, Sarah! 👋</h1>
                    <p>Here's what's happening with Emily's education today.</p>
                </div>
                <div class="welcome-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span></span>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background:#eff6ff;color:#2563eb;"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-info"><h3>92.5%</h3><p>Average Score</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#f0fdf4;color:#16a34a;"><i class="fas fa-calendar-check"></i></div>
                    <div class="stat-info"><h3>95%</h3><p>Attendance Rate</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#fffbeb;color:#f59e0b;"><i class="fas fa-credit-card"></i></div>
                    <div class="stat-info"><h3>$450</h3><p>Outstanding Balance</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#fef2f2;color:#ef4444;"><i class="fas fa-envelope"></i></div>
                    <div class="stat-info"><h3>5</h3><p>New Messages</p></div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <button class="action-btn" onclick="document.querySelector('[data-section=\\'results\\']').click()">
                        <i class="fas fa-file-alt"></i><span>View Results</span>
                    </button>
                    <button class="action-btn" onclick="document.querySelector('[data-section=\\'payments\\']').click()">
                        <i class="fas fa-credit-card"></i><span>Pay Fees</span>
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-download"></i><span>Download Report</span>
                    </button>
                    <button class="action-btn" onclick="document.querySelector('[data-section=\\'messages\\']').click()">
                        <i class="fas fa-comment"></i><span>Contact Teacher</span>
                    </button>
                </div>
            </div>
            
            <div class="content-row">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-file-alt"></i> Recent Results</h3>
                        <a href="#" class="view-all" data-section="results">View All <i class="fas fa-arrow-right"></i></a>
                    </div>
                    <div class="table-responsive">
                        <table class="results-table">
                            <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Term</th></tr></thead>
                            <tbody>
                                <tr><td>Mathematics</td><td>95/100</td><td><span class="grade grade-a">A</span></td><td>Term 2</td></tr>
                                <tr><td>English</td><td>88/100</td><td><span class="grade grade-b">B+</span></td><td>Term 2</td></tr>
                                <tr><td>Science</td><td>92/100</td><td><span class="grade grade-a">A-</span></td><td>Term 2</td></tr>
                                <tr><td>History</td><td>85/100</td><td><span class="grade grade-b">B</span></td><td>Term 2</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-bell"></i> Notifications</h3>
                    </div>
                    <div class="notifications-list">
                        <div class="notification-item unread">
                            <div class="notif-icon-small"><i class="fas fa-calendar-alt"></i></div>
                            <div class="notif-content">
                                <p><strong>Parent-Teacher Meeting</strong> scheduled for Friday at 4 PM.</p>
                                <span class="notif-time">2 hours ago</span>
                            </div>
                        </div>
                        <div class="notification-item unread">
                            <div class="notif-icon-small"><i class="fas fa-file-alt"></i></div>
                            <div class="notif-content">
                                <p><strong>Term 2 Results</strong> have been published.</p>
                                <span class="notif-time">1 day ago</span>
                            </div>
                        </div>
                        <div class="notification-item">
                            <div class="notif-icon-small"><i class="fas fa-credit-card"></i></div>
                            <div class="notif-content">
                                <p><strong>Payment Confirmed:</strong> Tuition fee received.</p>
                                <span class="notif-time">3 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        setCurrentDate();
        setupViewAllLinks();
    }
    
    function loadResults() {
        contentWrapper.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-chart-bar"></i> Academic Results - Term 2, 2024</h3>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
                    <div class="form-group" style="flex:1;min-width:150px;">
                        <label>Registration Number</label>
                        <input type="text" value="STD2025001">
                    </div>
                    <div class="form-group" style="flex:1;min-width:150px;">
                        <label>Class</label>
                        <select><option>Grade 5</option><option>Grade 6</option></select>
                    </div>
                    <div class="form-group" style="flex:1;min-width:150px;">
                        <label>Year</label>
                        <select><option>2024</option><option>2023</option></select>
                    </div>
                    <div class="form-group" style="flex:1;min-width:150px;">
                        <label>Term</label>
                        <select><option>Term 2</option><option>Term 1</option><option>Term 3</option></select>
                    </div>
                </div>
                
                <div style="text-align:center;padding:20px;background:var(--primary-light);border-radius:12px;margin-bottom:20px;">
                    <i class="fas fa-graduation-cap" style="font-size:2rem;color:var(--primary);"></i>
                    <h2 style="margin:8px 0;">SmartSchool Academy</h2>
                    <p>Academic Result Slip</p>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
                    <div><strong>Student Name:</strong> Emily Johnson</div>
                    <div><strong>Registration No:</strong> STD2025001</div>
                    <div><strong>Class:</strong> Grade 5-A</div>
                    <div><strong>Academic Year:</strong> 2024</div>
                </div>
                
                <div class="table-responsive">
                    <table class="results-table">
                        <thead>
                            <tr><th>Subject</th><th>CAT 1</th><th>CAT 2</th><th>Final Exam</th><th>Total</th><th>Grade</th><th>Remarks</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Mathematics</td><td>45/50</td><td>48/50</td><td>92/100</td><td>185/200</td><td><span class="grade grade-a">A</span></td><td>Excellent</td></tr>
                            <tr><td>English</td><td>42/50</td><td>44/50</td><td>88/100</td><td>174/200</td><td><span class="grade grade-b">B+</span></td><td>Very Good</td></tr>
                            <tr><td>Science</td><td>46/50</td><td>45/50</td><td>90/100</td><td>181/200</td><td><span class="grade grade-a">A-</span></td><td>Excellent</td></tr>
                            <tr><td>Social Studies</td><td>40/50</td><td>43/50</td><td>85/100</td><td>168/200</td><td><span class="grade grade-b">B</span></td><td>Good</td></tr>
                            <tr><td>Art & Craft</td><td>48/50</td><td>49/50</td><td>95/100</td><td>192/200</td><td><span class="grade grade-a">A+</span></td><td>Outstanding</td></tr>
                        </tbody>
                        <tfoot>
                            <tr><td colspan="4"><strong>Total Average</strong></td><td><strong>900/1000</strong></td><td><strong>A-</strong></td><td><strong>Excellent</strong></td></tr>
                        </tfoot>
                    </table>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">
                    <div style="background:#f8fafc;padding:16px;border-radius:12px;">
                        <h4>Teacher's Remarks:</h4>
                        <p>Emily has shown excellent performance this term. Keep up the good work!</p>
                    </div>
                    <div style="background:#f8fafc;padding:16px;border-radius:12px;">
                        <h4>Principal's Remarks:</h4>
                        <p>Congratulations on a great performance. Continue to strive for excellence.</p>
                    </div>
                </div>
                
                <div class="result-actions">
                    <button class="btn-download"><i class="fas fa-download"></i> Download PDF</button>
                    <button class="btn-print"><i class="fas fa-print"></i> Print Result</button>
                    <button class="btn-share"><i class="fas fa-share"></i> Share Result</button>
                </div>
            </div>
        `;
    }
    
    function loadAttendance() {
        contentWrapper.innerHTML = `
            <div class="attendance-stats">
                <div class="attendance-stat present">
                    <i class="fas fa-check-circle"></i>
                    <h3>180</h3>
                    <p>Days Present</p>
                </div>
                <div class="attendance-stat absent">
                    <i class="fas fa-times-circle"></i>
                    <h3>8</h3>
                    <p>Days Absent</p>
                </div>
                <div class="attendance-stat late">
                    <i class="fas fa-clock"></i>
                    <h3>2</h3>
                    <p>Times Late</p>
                </div>
                <div class="attendance-stat">
                    <i class="fas fa-percentage" style="color:var(--primary);"></i>
                    <h3>95%</h3>
                    <p>Attendance Rate</p>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-history"></i> Attendance History</h3>
                </div>
                <div class="table-responsive">
                    <table class="attendance-table">
                        <thead>
                            <tr><th>Date</th><th>Day</th><th>Status</th><th>Check-in</th><th>Remarks</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Mar 15, 2024</td><td>Monday</td><td><span class="status-badge status-paid">Present</span></td><td>7:45 AM</td><td>On time</td></tr>
                            <tr><td>Mar 14, 2024</td><td>Friday</td><td><span class="status-badge status-paid">Present</span></td><td>7:50 AM</td><td>On time</td></tr>
                            <tr><td>Mar 13, 2024</td><td>Thursday</td><td><span class="status-badge status-overdue">Absent</span></td><td>-</td><td>Sick</td></tr>
                            <tr><td>Mar 12, 2024</td><td>Wednesday</td><td><span class="status-badge status-pending">Late</span></td><td>8:15 AM</td><td>Traffic</td></tr>
                            <tr><td>Mar 11, 2024</td><td>Tuesday</td><td><span class="status-badge status-paid">Present</span></td><td>7:40 AM</td><td>On time</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    function loadPayments() {
        contentWrapper.innerHTML = `
            <div class="payment-summary">
                <div class="payment-card">
                    <h4>Total Fees</h4>
                    <h2>$2,500</h2>
                    <p>Term 2, 2024</p>
                </div>
                <div class="payment-card">
                    <h4>Total Paid</h4>
                    <h2>$2,050</h2>
                    <p>82% Complete</p>
                    <div class="progress-bar"><div class="progress-fill success" style="width:82%;"></div></div>
                </div>
                <div class="payment-card">
                    <h4>Outstanding Balance</h4>
                    <h2>$450</h2>
                    <p>Due by: Mar 30, 2024</p>
                </div>
                <div class="payment-card">
                    <h4>Next Payment</h4>
                    <h2>$450</h2>
                    <p>Due in 15 days</p>
                    <button class="btn-save" style="margin-top:8px;">Pay Now</button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><h3>Fee Structure - Term 2, 2024</h3></div>
                <div class="table-responsive">
                    <table class="fee-table">
                        <thead><tr><th>Fee Item</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
                        <tbody>
                            <tr><td>Tuition Fee</td><td>$1,500</td><td><span class="status-badge status-paid">Paid</span></td><td>Jan 15, 2024</td></tr>
                            <tr><td>Activity Fee</td><td>$300</td><td><span class="status-badge status-paid">Paid</span></td><td>Jan 15, 2024</td></tr>
                            <tr><td>Library Fee</td><td>$150</td><td><span class="status-badge status-paid">Paid</span></td><td>Jan 15, 2024</td></tr>
                            <tr><td>Computer Lab Fee</td><td>$100</td><td><span class="status-badge status-paid">Paid</span></td><td>Feb 1, 2024</td></tr>
                            <tr><td>Examination Fee</td><td>$250</td><td><span class="status-badge status-pending">Pending</span></td><td>Mar 30, 2024</td></tr>
                            <tr><td>Sports Fee</td><td>$200</td><td><span class="status-badge status-pending">Pending</span></td><td>Mar 30, 2024</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><h3>Payment History</h3></div>
                <div class="table-responsive">
                    <table class="payment-table">
                        <thead><tr><th>Receipt No</th><th>Date</th><th>Amount</th><th>Method</th><th>Action</th></tr></thead>
                        <tbody>
                            <tr><td>REC-001</td><td>Jan 5, 2024</td><td>$1,950</td><td>Bank Transfer</td><td><button class="btn-download" style="padding:6px 12px;font-size:0.8rem;">Receipt</button></td></tr>
                            <tr><td>REC-045</td><td>Feb 1, 2024</td><td>$100</td><td>Credit Card</td><td><button class="btn-download" style="padding:6px 12px;font-size:0.8rem;">Receipt</button></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    function loadMessages() {
        contentWrapper.innerHTML = `
            <div class="messages-container">
                <div class="messages-sidebar">
                    <div class="messages-search">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search messages...">
                    </div>
                    <div class="contact-list">
                        <div class="contact-item active">
                            <div class="contact-avatar">MA</div>
                            <div class="contact-info">
                                <h4>Mrs. Anderson</h4>
                                <p>Math Teacher</p>
                            </div>
                            <span class="unread-count">2</span>
                        </div>
                        <div class="contact-item">
                            <div class="contact-avatar">MS</div>
                            <div class="contact-info">
                                <h4>Mr. Smith</h4>
                                <p>Science Teacher</p>
                            </div>
                            <span class="unread-count">1</span>
                        </div>
                        <div class="contact-item">
                            <div class="contact-avatar">AO</div>
                            <div class="contact-info">
                                <h4>Admin Office</h4>
                                <p>School Administration</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="messages-chat">
                    <div class="chat-header">
                        <div class="contact-avatar">MA</div>
                        <div>
                            <h4>Mrs. Anderson</h4>
                            <p style="font-size:0.8rem;color:var(--success);">Online</p>
                        </div>
                    </div>
                    <div class="chat-messages">
                        <div class="message received">
                            <p>Hello Mrs. Johnson, Emily has been doing great in Math class. She scored 95% in the recent test.</p>
                            <span>10:30 AM</span>
                        </div>
                        <div class="message sent">
                            <p>Thank you, Mrs. Anderson! That's wonderful to hear.</p>
                            <span>10:32 AM</span>
                        </div>
                        <div class="message received">
                            <p>She could work on her problem-solving speed, but overall she's among the top students!</p>
                            <span>10:35 AM</span>
                        </div>
                    </div>
                    <div class="chat-input">
                        <input type="text" placeholder="Type your message...">
                        <button><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function loadProfile() {
        contentWrapper.innerHTML = `
            <div class="profile-grid">
                <div class="card profile-card">
                    <div class="profile-avatar-large"><i class="fas fa-user-circle"></i></div>
                    <h3>Sarah Johnson</h3>
                    <p>Parent/Guardian</p>
                    <p style="color:var(--text-light);">Member since: January 2023</p>
                </div>
                
                <div class="card">
                    <div class="card-header"><h3>Personal Information</h3></div>
                    <div class="form-row">
                        <div class="form-group"><label>Full Name</label><input type="text" value="Sarah Johnson"></div>
                        <div class="form-group"><label>Email</label><input type="email" value="sarah@email.com"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Phone</label><input type="tel" value="+1 (555) 123-4567"></div>
                        <div class="form-group"><label>Relationship</label><select><option>Mother</option><option>Father</option></select></div>
                    </div>
                    <div class="form-group"><label>Address</label><input type="text" value="123 Education Street"></div>
                    <button class="btn-save">Save Changes</button>
                </div>
                
                <div class="card">
                    <div class="card-header"><h3>Change Password</h3></div>
                    <div class="form-group"><label>Current Password</label><input type="password"></div>
                    <div class="form-group"><label>New Password</label><input type="password"></div>
                    <div class="form-group"><label>Confirm Password</label><input type="password"></div>
                    <button class="btn-save">Update Password</button>
                </div>
                
                <div class="card">
                    <div class="card-header"><h3>Notification Settings</h3></div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);">
                        <div><strong>Email Notifications</strong><p style="font-size:0.85rem;color:var(--text-light);">Receive updates about performance</p></div>
                        <input type="checkbox" checked style="width:20px;height:20px;">
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);">
                        <div><strong>SMS Alerts</strong><p style="font-size:0.85rem;color:var(--text-light);">Get urgent notifications</p></div>
                        <input type="checkbox" style="width:20px;height:20px;">
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;">
                        <div><strong>Attendance Alerts</strong><p style="font-size:0.85rem;color:var(--text-light);">Get notified when absent</p></div>
                        <input type="checkbox" checked style="width:20px;height:20px;">
                    </div>
                </div>
            </div>
        `;
    }
    
    function setupViewAllLinks() {
        document.querySelectorAll('.view-all').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                if (section) {
                    loadSection(section);
                    navLinks.forEach(l => l.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        });
    }
    
    // ============ NAVIGATION ============
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const section = this.dataset.section;
            loadSection(section);
            if (window.innerWidth <= 768) closeSidebar();
        });
    });
    
    // ============ SIDEBAR ============
    function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); }
    function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); }
    hamburgerBtn.addEventListener('click', openSidebar);
    sidebarCloseBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // ============ DARK MODE ============
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const icon = darkToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
    
    // ============ LOGOUT ============
    logoutBtn.addEventListener('click', () => logoutModal.classList.add('active'));
    cancelLogoutBtn.addEventListener('click', () => logoutModal.classList.remove('active'));
    confirmLogoutBtn.addEventListener('click', () => {
        logoutModal.classList.remove('active');
        dashboardContainer.style.display = 'none';
        authOverlay.style.display = 'flex';
        loginCard.style.display = 'block';
        otpCard.style.display = 'none';
        loginForm.reset();
        otpForm.reset();
        clearInterval(otpTimerInterval);
        showToast('Logged out successfully.', 'success');
    });
    logoutModal.addEventListener('click', (e) => {
        if (e.target === logoutModal) logoutModal.classList.remove('active');
    });
    
    // ============ INITIAL LOAD ============
    loadSection('dashboard');
    
    console.log('Parent Panel initialized successfully!');
    console.log('Demo: PRNT001 / parent123 / OTP: 123456');
});