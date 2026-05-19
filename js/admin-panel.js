/**
 * ============================================================
 * admin-auth-system.js
 * Complete Admin Authentication System
 * Features:
 * - Dynamic OTP generation (new code every time)
 * - Bootstrap 5 based professional UI
 * - Session management with localStorage/sessionStorage
 * - Full admin dashboard with all sections
 * - Logout with session cleanup
 * - NO blinking, NO infinite loops, NO auto-refresh
 * ============================================================
 */

(function() {
    'use strict';

    // ==================== DEMO CREDENTIALS ====================
    const VALID_CREDENTIALS = {
        email: 'admin@smartschool.com',
        password: '1234'
    };

    // ==================== GLOBAL STATE ====================
    let isProcessing = false;
    let otpTimerInterval = null;
    let resendTimerInterval = null;
    let otpExpiryTime = null;
    let currentOtp = null;

    // ==================== DOM REFERENCES - LOGIN PAGE ====================
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const successOverlay = document.getElementById('successOverlay');
    const successTitle = document.getElementById('successTitle');
    const successMessage = document.getElementById('successMessage');
    const progressFill = document.getElementById('progressFill');
    
    const loginFormSection = document.getElementById('loginFormSection');
    const otpFormSection = document.getElementById('otpFormSection');
    const loginFormElement = document.getElementById('loginFormElement');
    const otpFormElement = document.getElementById('otpFormElement');
    
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const rememberMeCheckbox = document.getElementById('rememberMeCheckbox');
    const btnDemoCredentials = document.getElementById('btnDemoCredentials');
    
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const otpError = document.getElementById('otpError');
    
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const verifyOtpSubmitBtn = document.getElementById('verifyOtpSubmitBtn');
    const backToLoginButton = document.getElementById('backToLoginButton');
    const resendOtpButton = document.getElementById('resendOtpButton');
    
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpInputContainer = document.getElementById('otpInputContainer');
    const otpSentToEmail = document.getElementById('otpSentToEmail');
    const timerCountdown = document.getElementById('timerCountdown');
    const resendTimerDisplay = document.getElementById('resendTimerDisplay');
    const otpDisplayCode = document.getElementById('otpDisplayCode');
    const otpDisplayBox = document.getElementById('otpDisplayBox');

    // ==================== DOM REFERENCES - DASHBOARD PAGE ====================
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const pageTitle = document.getElementById('pageTitle');
    const currentDateEl = document.getElementById('currentDate');
    const welcomeName = document.getElementById('welcomeName');
    const adminNameEl = document.getElementById('adminName');
    const adminRole = document.getElementById('adminRole');
    const globalSearch = document.getElementById('globalSearch');

    // ==================== INITIALIZATION ====================
    function init() {
        if (checkExistingSession()) {
            showDashboardPage();
            return;
        }
        
        showLoginPage();
        setupLoginEventListeners();
        setupDashboardEventListeners();
        setCurrentDate();
        loadUserData();
        
        if (adminEmail) setTimeout(() => adminEmail.focus(), 500);
        
        console.log('%c🔐 SmartSchool Admin Auth System Initialized', 'color: #2563eb; font-weight: bold; font-size: 14px;');
        console.log('%c💡 Click "Use Demo Credentials" button for test login', 'color: #f97316; font-weight: bold;');
        console.log('%c📧 OTP will be displayed VISIBLY on the verification screen', 'color: #10b981; font-weight: bold;');
    }

    // ==================== DYNAMIC OTP GENERATION ====================
    function generateOTP() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`%c========================================`, 'color: #10b981;');
        console.log(`%c📧 NEW OTP GENERATED: ${otp}`, 'color: #10b981; font-weight: bold; font-size: 16px;');
        console.log(`%c📧 This OTP is now VISIBLE on the screen`, 'color: #10b981; font-weight: bold;');
        console.log(`%c========================================`, 'color: #10b981;');
        updateOtpDisplay(otp);
        return otp;
    }

    function updateOtpDisplay(otp) {
        if (otpDisplayCode) {
            otpDisplayCode.textContent = otp;
            otpDisplayCode.classList.remove('updated');
            void otpDisplayCode.offsetWidth;
            otpDisplayCode.classList.add('updated');
        }
        if (otpDisplayBox) {
            otpDisplayBox.style.display = 'block';
            otpDisplayBox.style.opacity = '1';
        }
    }

    // ==================== SESSION MANAGEMENT ====================
    function checkExistingSession() {
        const sessionToken = sessionStorage.getItem('adminSessionToken');
        const sessionExpiry = sessionStorage.getItem('adminSessionExpiry');
        
        if (sessionToken && sessionExpiry) {
            if (Date.now() < parseInt(sessionExpiry)) return true;
            clearAllSessions();
        }
        
        const rememberData = localStorage.getItem('adminRememberMe');
        if (rememberData) {
            try {
                const parsed = JSON.parse(rememberData);
                if (Date.now() < parsed.expiry) {
                    sessionStorage.setItem('adminSessionToken', parsed.token);
                    sessionStorage.setItem('adminSessionExpiry', parsed.expiry.toString());
                    sessionStorage.setItem('adminUserData', JSON.stringify(parsed.userData));
                    return true;
                }
                localStorage.removeItem('adminRememberMe');
            } catch (e) { localStorage.removeItem('adminRememberMe'); }
        }
        return false;
    }

    function createSession() {
        const sessionToken = generateToken();
        const sessionDuration = 120 * 60 * 1000; // 2 hours for admin
        const expiry = Date.now() + sessionDuration;
        
        const userData = {
            email: adminEmail ? adminEmail.value.trim().toLowerCase() : VALID_CREDENTIALS.email,
            adminName: 'Dr. Robert Williams',
            role: 'System Administrator',
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('adminSessionToken', sessionToken);
        sessionStorage.setItem('adminSessionExpiry', expiry.toString());
        sessionStorage.setItem('adminUserData', JSON.stringify(userData));
        
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
            const rememberDuration = 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem('adminRememberMe', JSON.stringify({
                token: sessionToken,
                expiry: Date.now() + rememberDuration,
                userData: userData
            }));
        }
        
        console.log('%c✅ Admin Session Created Successfully', 'color: #10b981; font-weight: bold;');
    }

    function clearAllSessions() {
        sessionStorage.removeItem('adminSessionToken');
        sessionStorage.removeItem('adminSessionExpiry');
        sessionStorage.removeItem('adminUserData');
        sessionStorage.removeItem('adminEmailForOtp');
        sessionStorage.removeItem('adminCurrentOtp');
        localStorage.removeItem('adminRememberMe');
    }

    function generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
        return `${token}_${Date.now()}`;
    }

    // ==================== PAGE NAVIGATION ====================
    function showLoginPage() {
        loginPage.style.display = 'flex';
        dashboardPage.style.display = 'none';
        document.body.style.background = '';
    }

    function showDashboardPage() {
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        document.body.style.background = '#f1f5f9';
        setCurrentDate();
        loadUserData();
    }

    // ==================== LOGIN EVENT LISTENERS ====================
    function setupLoginEventListeners() {
        if (loginFormElement) loginFormElement.addEventListener('submit', handleLoginSubmit);
        if (otpFormElement) otpFormElement.addEventListener('submit', handleOtpSubmit);
        if (togglePasswordBtn) togglePasswordBtn.addEventListener('click', handlePasswordToggle);
        if (backToLoginButton) backToLoginButton.addEventListener('click', handleBackToLogin);
        if (resendOtpButton) resendOtpButton.addEventListener('click', handleResendOtp);
        if (btnDemoCredentials) btnDemoCredentials.addEventListener('click', handleDemoCredentials);
        setupOtpInputs();
        setupRealTimeValidation();
    }

    // ==================== DEMO CREDENTIALS ====================
    function handleDemoCredentials() {
        if (adminEmail) adminEmail.value = VALID_CREDENTIALS.email;
        if (adminPassword) adminPassword.value = VALID_CREDENTIALS.password;
        
        if (adminEmail) { adminEmail.classList.add('is-valid'); adminEmail.classList.remove('is-invalid'); }
        if (adminPassword) { adminPassword.classList.add('is-valid'); adminPassword.classList.remove('is-invalid'); }
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        
        if (adminPassword) adminPassword.focus();
        showNotification('Demo credentials auto-filled! Click Sign In to continue.', 'info');
        console.log('%c📝 Demo credentials auto-filled', 'color: #f97316; font-weight: bold;');
    }

    // ==================== LOGIN HANDLER ====================
    function handleLoginSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) return;
        if (!validateLoginForm()) return;
        
        isProcessing = true;
        disableButton(loginSubmitBtn);
        showLoading('Verifying credentials...');
        
        setTimeout(() => {
            const email = adminEmail.value.trim().toLowerCase();
            const pass = adminPassword.value.trim();
            
            if (email === VALID_CREDENTIALS.email && pass === VALID_CREDENTIALS.password) {
                currentOtp = generateOTP();
                sessionStorage.setItem('adminCurrentOtp', currentOtp);
                sessionStorage.setItem('adminEmailForOtp', email);
                hideLoading();
                switchToOtpForm();
                showNotification('Verification code generated! It is displayed above.', 'success');
            } else {
                hideLoading();
                showNotification('Invalid credentials. Please check and try again.', 'error');
                shakeElement(document.querySelector('.auth-card'));
            }
            
            isProcessing = false;
            enableButton(loginSubmitBtn, 'Sign In to Admin Panel', 'fa-arrow-right');
        }, 1500);
    }

    // ==================== OTP HANDLER ====================
    function handleOtpSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isProcessing) return;
        
        const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
        clearOtpError();
        const validOtp = sessionStorage.getItem('adminCurrentOtp') || currentOtp;
        
        if (enteredOtp.length !== 6) {
            showOtpError('Please enter all 6 digits');
            shakeElement(otpInputContainer);
            return;
        }
        
        if (otpExpiryTime && Date.now() > otpExpiryTime) {
            showOtpError('Code expired. Please request a new one.');
            if (otpDisplayBox) otpDisplayBox.style.opacity = '0.5';
            return;
        }
        
        isProcessing = true;
        disableButton(verifyOtpSubmitBtn);
        showLoading('Verifying code...');
        
        setTimeout(() => {
            if (enteredOtp === validOtp) {
                hideLoading();
                createSession();
                sessionStorage.removeItem('adminCurrentOtp');
                showSuccessOverlay();
                
                setTimeout(() => {
                    hideSuccessOverlay();
                    showDashboardPage();
                }, 2500);
            } else {
                hideLoading();
                showOtpError('Invalid code. Please try again.');
                shakeElement(otpInputContainer);
                clearOtpInputs();
                if (otpInputs[0]) otpInputs[0].focus();
                isProcessing = false;
                enableButton(verifyOtpSubmitBtn, 'Verify & Continue', 'fa-check-circle');
            }
        }, 1500);
    }

    // ==================== FORM VALIDATION ====================
    function validateLoginForm() {
        let isValid = true;
        clearAllErrors();
        
        if (!adminEmail.value.trim()) {
            showFieldError(emailError, 'Email is required');
            markFieldError(adminEmail);
            isValid = false;
        } else if (!isValidEmail(adminEmail.value.trim())) {
            showFieldError(emailError, 'Valid email required');
            markFieldError(adminEmail);
            isValid = false;
        } else if (adminEmail.value.trim().toLowerCase() !== VALID_CREDENTIALS.email) {
            showFieldError(emailError, 'Email not found');
            markFieldError(adminEmail);
            isValid = false;
        } else {
            markFieldSuccess(adminEmail);
        }
        
        if (!adminPassword.value.trim()) {
            showFieldError(passwordError, 'Password is required');
            markFieldError(adminPassword);
            isValid = false;
        } else if (adminPassword.value.trim() !== VALID_CREDENTIALS.password) {
            showFieldError(passwordError, 'Invalid password');
            markFieldError(adminPassword);
            isValid = false;
        } else {
            markFieldSuccess(adminPassword);
        }
        
        return isValid;
    }

    function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    function showFieldError(element, message) { if (element) element.textContent = message; }
    function markFieldError(input) { if (input) { input.classList.add('is-invalid'); input.classList.remove('is-valid'); } }
    function markFieldSuccess(input) { if (input) { input.classList.add('is-valid'); input.classList.remove('is-invalid'); } }
    
    function clearAllErrors() {
        [emailError, passwordError].forEach(el => { if (el) el.textContent = ''; });
        [adminEmail, adminPassword].forEach(el => { if (el) el.classList.remove('is-invalid', 'is-valid'); });
    }
    
    function showOtpError(message) { if (otpError) otpError.textContent = message; showNotification(message, 'error'); }
    function clearOtpError() { if (otpError) otpError.textContent = ''; }

    // ==================== OTP INPUT SETUP ====================
    function setupOtpInputs() {
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (!/^\d*$/.test(value)) { e.target.value = value.replace(/[^\d]/g, ''); return; }
                if (value) {
                    input.classList.add('filled');
                    if (index < otpInputs.length - 1) otpInputs[index + 1].focus();
                } else { input.classList.remove('filled'); }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].value = '';
                    otpInputs[index - 1].classList.remove('filled');
                    e.preventDefault();
                }
                if (e.key === 'ArrowLeft' && index > 0) { otpInputs[index - 1].focus(); e.preventDefault(); }
                if (e.key === 'ArrowRight' && index < otpInputs.length - 1) { otpInputs[index + 1].focus(); e.preventDefault(); }
            });
            
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').trim();
                if (/^\d{6}$/.test(pastedData)) {
                    const digits = pastedData.split('');
                    otpInputs.forEach((inp, i) => { inp.value = digits[i]; inp.classList.add('filled'); });
                    otpInputs[otpInputs.length - 1].focus();
                }
            });
            
            input.addEventListener('focus', () => input.select());
        });
    }

    function clearOtpInputs() { otpInputs.forEach(input => { input.value = ''; input.classList.remove('filled'); }); }

    // ==================== FORM SWITCHING ====================
    function switchToOtpForm() {
        clearOtpInputs();
        clearOtpError();
        loginFormSection.classList.remove('active');
        otpFormSection.classList.add('active');
        
        const email = sessionStorage.getItem('adminEmailForOtp') || 'your email';
        if (otpSentToEmail) otpSentToEmail.textContent = `Sent to: ${email}`;
        if (otpDisplayBox) { otpDisplayBox.style.display = 'block'; otpDisplayBox.style.opacity = '1'; }
        
        startOtpTimer(120);
        startResendCooldown(30);
        if (otpInputs[0]) setTimeout(() => otpInputs[0].focus(), 300);
    }

    function handleBackToLogin() {
        clearAllTimers();
        clearOtpInputs();
        clearOtpError();
        sessionStorage.removeItem('adminEmailForOtp');
        sessionStorage.removeItem('adminCurrentOtp');
        currentOtp = null;
        if (otpDisplayCode) otpDisplayCode.textContent = '------';
        
        otpFormSection.classList.remove('active');
        loginFormSection.classList.add('active');
        clearAllErrors();
        if (adminEmail) adminEmail.focus();
        isProcessing = false;
        enableButton(verifyOtpSubmitBtn, 'Verify & Continue', 'fa-check-circle');
    }

    // ==================== TIMER FUNCTIONS ====================
    function startOtpTimer(seconds) {
        clearInterval(otpTimerInterval);
        otpExpiryTime = Date.now() + (seconds * 1000);
        updateTimerDisplay(seconds);
        
        otpTimerInterval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((otpExpiryTime - Date.now()) / 1000));
            updateTimerDisplay(remaining);
            if (remaining <= 0) { clearInterval(otpTimerInterval); handleOtpExpired(); }
        }, 1000);
    }

    function updateTimerDisplay(totalSeconds) {
        if (!timerCountdown) return;
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        timerCountdown.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        timerCountdown.style.color = totalSeconds <= 30 ? '#ef4444' : '';
    }

    function handleOtpExpired() {
        showOtpError('Code expired. Please request a new one.');
        if (otpDisplayBox) otpDisplayBox.style.opacity = '0.5';
        sessionStorage.removeItem('adminCurrentOtp');
        currentOtp = null;
    }

    function startResendCooldown(seconds) {
        clearInterval(resendTimerInterval);
        if (resendOtpButton) resendOtpButton.disabled = true;
        if (resendTimerDisplay) resendTimerDisplay.style.display = 'inline';
        
        let remaining = seconds;
        updateResendTimer(remaining);
        
        resendTimerInterval = setInterval(() => {
            remaining--;
            updateResendTimer(remaining);
            if (remaining <= 0) {
                clearInterval(resendTimerInterval);
                if (resendOtpButton) resendOtpButton.disabled = false;
                if (resendTimerDisplay) resendTimerDisplay.style.display = 'none';
            }
        }, 1000);
    }

    function updateResendTimer(seconds) { if (resendTimerDisplay) resendTimerDisplay.textContent = `in ${seconds}s`; }

    function handleResendOtp() {
        if (isProcessing) return;
        showLoading('Generating new code...');
        
        setTimeout(() => {
            currentOtp = generateOTP();
            sessionStorage.setItem('adminCurrentOtp', currentOtp);
            hideLoading();
            clearOtpInputs();
            clearOtpError();
            if (otpDisplayBox) otpDisplayBox.style.opacity = '1';
            startOtpTimer(120);
            startResendCooldown(30);
            if (otpInputs[0]) otpInputs[0].focus();
            showNotification('New verification code generated!', 'success');
        }, 1000);
    }

    function clearAllTimers() {
        if (otpTimerInterval) { clearInterval(otpTimerInterval); otpTimerInterval = null; }
        if (resendTimerInterval) { clearInterval(resendTimerInterval); resendTimerInterval = null; }
        otpExpiryTime = null;
    }

    // ==================== PASSWORD TOGGLE ====================
    function handlePasswordToggle() {
        const type = adminPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPassword.setAttribute('type', type);
        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
        else { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
    }

    // ==================== REAL-TIME VALIDATION ====================
    function setupRealTimeValidation() {
        if (adminEmail) {
            adminEmail.addEventListener('input', () => {
                if (adminEmail.value.trim()) {
                    if (adminEmail.value.trim().toLowerCase() === VALID_CREDENTIALS.email) { markFieldSuccess(adminEmail); if (emailError) emailError.textContent = ''; }
                    else { markFieldError(adminEmail); }
                } else { adminEmail.classList.remove('is-invalid', 'is-valid'); if (emailError) emailError.textContent = ''; }
            });
        }
        if (adminPassword) {
            adminPassword.addEventListener('input', () => {
                if (adminPassword.value.trim()) {
                    if (adminPassword.value.trim() === VALID_CREDENTIALS.password) { markFieldSuccess(adminPassword); if (passwordError) passwordError.textContent = ''; }
                    else { markFieldError(adminPassword); }
                } else { adminPassword.classList.remove('is-invalid', 'is-valid'); if (passwordError) passwordError.textContent = ''; }
            });
        }
    }

    // ==================== DASHBOARD EVENT LISTENERS ====================
    function setupDashboardEventListeners() {
        if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
        
        navLinks.forEach(link => link.addEventListener('click', handleDashboardNav));
        
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) closeSidebar();
        });
        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && sidebar && sidebar.classList.contains('open')) closeSidebar();
        });
        
        if (globalSearch) {
            globalSearch.addEventListener('input', function() {
                const term = this.value.toLowerCase();
                document.querySelectorAll('.content-section.active .card').forEach(card => {
                    card.style.display = card.textContent.toLowerCase().includes(term) ? '' : 'none';
                });
            });
        }
    }

    function openSidebar() { if (sidebar) sidebar.classList.add('open'); if (sidebarOverlay) sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function closeSidebar() { if (sidebar) sidebar.classList.remove('open'); if (sidebarOverlay) sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; }

    function handleDashboardNav(e) {
        e.preventDefault();
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
        
        const section = this.getAttribute('data-section');
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        
        const sectionMap = {
            'dashboard': 'dashboardSection',
            'students': 'studentsSection',
            'teachers': 'teachersSection',
            'parents': 'parentsSection',
            'attendance': 'attendanceSection',
            'fees': 'feesSection',
            'performance': 'performanceSection',
            'announcements': 'announcementsSection',
            'events': 'eventsSection',
            'users': 'usersSection',
            'settings': 'settingsSection'
        };
        
        const targetId = sectionMap[section] || 'dashboardSection';
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
        
        const titles = {
            'dashboard': 'Admin Dashboard', 'students': 'Student Management',
            'teachers': 'Teacher Management', 'parents': 'Parent Management',
            'attendance': 'Attendance Reports', 'fees': 'Fee Collection',
            'performance': 'Performance Reports', 'announcements': 'Announcements',
            'events': 'School Events', 'users': 'User Management', 'settings': 'System Settings'
        };
        if (pageTitle) pageTitle.textContent = titles[section] || 'Admin Dashboard';
        if (window.innerWidth <= 992) closeSidebar();
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout from the Admin Panel?')) {
            clearAllSessions();
            currentOtp = null;
            
            const msg = document.createElement('div');
            msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:24px 32px;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.2);z-index:9999;font-family:Inter,sans-serif;font-weight:600;font-size:1rem;display:flex;align-items:center;gap:12px;';
            msg.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logging out securely...';
            document.body.appendChild(msg);
            
            setTimeout(() => {
                msg.remove();
                showLoginPage();
                if (loginFormSection && otpFormSection) {
                    otpFormSection.classList.remove('active');
                    loginFormSection.classList.add('active');
                }
                clearAllErrors();
                clearOtpInputs();
                clearOtpError();
                clearAllTimers();
                if (otpDisplayCode) otpDisplayCode.textContent = '------';
                isProcessing = false;
            }, 800);
        }
    }

    // ==================== DASHBOARD DATA ====================
    function setCurrentDate() {
        if (currentDateEl) {
            const now = new Date();
            currentDateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    function loadUserData() {
        try {
            const userData = JSON.parse(sessionStorage.getItem('adminUserData') || '{}');
            if (userData.email) {
                if (welcomeName) welcomeName.textContent = 'Dr. Williams';
                if (adminNameEl) adminNameEl.textContent = userData.adminName || 'Dr. Robert Williams';
            }
            if (userData.role && adminRole) adminRole.textContent = userData.role;
        } catch (e) { console.warn('Could not load user data:', e); }
    }

    // ==================== UI HELPERS ====================
    function showLoading(message) { if (loadingText) loadingText.textContent = message || 'Processing...'; if (loadingOverlay) loadingOverlay.classList.add('active'); }
    function hideLoading() { if (loadingOverlay) loadingOverlay.classList.remove('active'); }
    
    function showSuccessOverlay() {
        if (successTitle) successTitle.textContent = 'Authentication Successful!';
        if (successMessage) successMessage.textContent = 'Redirecting to admin dashboard...';
        if (successOverlay) successOverlay.classList.add('active');
        if (progressFill) setTimeout(() => progressFill.style.width = '100%', 100);
    }
    
    function hideSuccessOverlay() { if (successOverlay) successOverlay.classList.remove('active'); if (progressFill) progressFill.style.width = '0%'; }
    
    function disableButton(button) { if (button) { button.disabled = true; button.style.opacity = '0.7'; } }
    function enableButton(button, text, iconClass) {
        if (button) {
            button.disabled = false;
            button.style.opacity = '1';
            if (text && iconClass) button.innerHTML = `<span>${text}</span><i class="fas ${iconClass} ms-2"></i>`;
        }
    }
    
    function shakeElement(element) {
        if (element) {
            element.style.animation = 'none';
            element.offsetHeight;
            element.style.animation = 'shake 0.5s ease';
            setTimeout(() => element.style.animation = '', 500);
        }
    }
    
    function showNotification(message, type) {
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'info' ? '#2563eb' : '#3b82f6';
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
        
        const notification = document.createElement('div');
        notification.innerHTML = `<i class="fas fa-${icon} me-2"></i>${message}`;
        notification.style.cssText = `
            position:fixed;top:20px;right:20px;background:${bgColor};color:white;
            padding:14px 20px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.2);
            z-index:2000;display:flex;align-items:center;gap:10px;font-size:0.9rem;
            font-family:'Inter',sans-serif;font-weight:500;animation:slideInRight 0.3s ease;
            max-width:400px;cursor:pointer;
        `;
        
        document.body.appendChild(notification);
        
        const removeNotification = () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        };
        
        notification.addEventListener('click', removeNotification);
        setTimeout(removeNotification, 5000);
    }

    // ==================== STARTUP ====================
    init();

})();