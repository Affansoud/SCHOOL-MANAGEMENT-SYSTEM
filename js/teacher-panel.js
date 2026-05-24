/**
 * ============================================================
 * teacher-panel.js
 * Complete Teacher Authentication System
 * Features:
 * - DYNAMIC OTP generation (new code every time) - VISIBLE ON SCREEN
 * - Professional login with validation
 * - Session management with localStorage/sessionStorage
 * - Full teacher dashboard with sidebar navigation
 * - Logout with session cleanup
 * ============================================================
 */

(function() {
    'use strict';

    // ==================== DEMO CREDENTIALS ====================
    const VALID_CREDENTIALS = {
        registrationNumber: 'TCH2025001',
        email: 'teacher@smartschool.com',
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
    const progressFill = document.getElementById('progressFill');
    
    const loginFormSection = document.getElementById('loginFormSection');
    const otpFormSection = document.getElementById('otpFormSection');
    const loginFormElement = document.getElementById('loginFormElement');
    const otpFormElement = document.getElementById('otpFormElement');
    
    const teacherRegNumber = document.getElementById('teacherRegNumber');
    const teacherEmail = document.getElementById('teacherEmail');
    const teacherPassword = document.getElementById('teacherPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const rememberMeCheckbox = document.getElementById('rememberMeCheckbox');
    const btnDemoCredentials = document.getElementById('btnDemoCredentials');
    
    const regNumError = document.getElementById('regNumError');
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
    const otpTimerDisplay = document.getElementById('otpTimerDisplay');
    
    // OTP Display Box elements
    const otpDisplayBox = document.getElementById('otpDisplayBox');
    const otpDisplayCode = document.getElementById('otpDisplayCode');

    // ==================== DOM REFERENCES - DASHBOARD PAGE ====================
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('pageTitle');
    const currentDateEl = document.getElementById('currentDate');
    const welcomeName = document.getElementById('welcomeName');
    const teacherNameEl = document.getElementById('teacherName');
    const teacherSubject = document.getElementById('teacherSubject');

    // ==================== INITIALIZATION ====================
    function init() {
        console.log('%c🔐 SmartSchool Teacher Auth System Initialized', 'color: #4f46e5; font-weight: bold; font-size: 14px;');
        console.log('%c💡 Click "Use Demo Credentials" button for test login', 'color: #f97316; font-weight: bold;');
        console.log('%c📧 OTP will be displayed VISIBLY on the verification screen', 'color: #10b981; font-weight: bold;');
        
        // Check existing session
        if (checkExistingSession()) {
            showDashboardPage();
            return;
        }
        
        // Show login page
        showLoginPage();
        
        // Setup event listeners
        setupLoginEventListeners();
        setupDashboardEventListeners();
        
        // Set current date on dashboard
        setCurrentDate();
        
        // Load user data on dashboard
        loadUserData();
        
        // Focus first login input
        if (teacherRegNumber) {
            setTimeout(() => teacherRegNumber.focus(), 500);
        }
    }

    // ==================== DYNAMIC OTP GENERATION ====================
    function generateOTP() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`%c========================================`, 'color: #10b981;');
        console.log(`%c📧 NEW OTP GENERATED: ${otp}`, 'color: #10b981; font-weight: bold; font-size: 16px;');
        console.log(`%c📧 This OTP is now VISIBLE on the screen`, 'color: #10b981; font-weight: bold;');
        console.log(`%c📧 In production, it would be sent via email/SMS`, 'color: #94a3b8;');
        console.log(`%c========================================`, 'color: #10b981;');
        
        // Update the display box with the new OTP
        updateOtpDisplay(otp);
        
        return otp;
    }

    // ==================== UPDATE OTP DISPLAY ====================
    function updateOtpDisplay(otp) {
        if (otpDisplayCode) {
            const formattedOtp = otp.split('').join(' ');
            otpDisplayCode.textContent = formattedOtp;
            
            // Add animation class
            otpDisplayCode.classList.remove('updated');
            void otpDisplayCode.offsetWidth; // Trigger reflow
            otpDisplayCode.classList.add('updated');
        }
        
        if (otpDisplayBox) {
            otpDisplayBox.style.display = 'block';
            otpDisplayBox.style.opacity = '1';
        }
    }

    // ==================== SESSION MANAGEMENT ====================
    function checkExistingSession() {
        const sessionToken = sessionStorage.getItem('teacherSessionToken');
        const sessionExpiry = sessionStorage.getItem('teacherSessionExpiry');
        
        if (sessionToken && sessionExpiry) {
            const now = Date.now();
            if (now < parseInt(sessionExpiry)) {
                return true;
            } else {
                clearAllSessions();
            }
        }
        
        const rememberData = localStorage.getItem('teacherRememberMe');
        if (rememberData) {
            try {
                const parsed = JSON.parse(rememberData);
                const now = Date.now();
                if (now < parsed.expiry) {
                    sessionStorage.setItem('teacherSessionToken', parsed.token);
                    sessionStorage.setItem('teacherSessionExpiry', parsed.expiry.toString());
                    sessionStorage.setItem('teacherUserData', JSON.stringify(parsed.userData));
                    return true;
                } else {
                    localStorage.removeItem('teacherRememberMe');
                }
            } catch (e) {
                localStorage.removeItem('teacherRememberMe');
            }
        }
        
        return false;
    }

    function createSession() {
        const sessionToken = generateToken();
        const sessionDuration = 60 * 60 * 1000; // 60 minutes
        const expiry = Date.now() + sessionDuration;
        
        const userData = {
            email: teacherEmail ? teacherEmail.value.trim().toLowerCase() : VALID_CREDENTIALS.email,
            registrationNumber: teacherRegNumber ? teacherRegNumber.value.trim().toUpperCase() : VALID_CREDENTIALS.registrationNumber,
            teacherName: 'Mr. James Anderson',
            subject: 'Mathematics Teacher',
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('teacherSessionToken', sessionToken);
        sessionStorage.setItem('teacherSessionExpiry', expiry.toString());
        sessionStorage.setItem('teacherUserData', JSON.stringify(userData));
        
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
            const rememberDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
            const rememberData = {
                token: sessionToken,
                expiry: Date.now() + rememberDuration,
                userData: userData
            };
            localStorage.setItem('teacherRememberMe', JSON.stringify(rememberData));
        }
        
        console.log('%c✅ Teacher Session Created Successfully', 'color: #10b981; font-weight: bold;');
    }

    function clearAllSessions() {
        sessionStorage.removeItem('teacherSessionToken');
        sessionStorage.removeItem('teacherSessionExpiry');
        sessionStorage.removeItem('teacherUserData');
        sessionStorage.removeItem('teacherEmailForOtp');
        sessionStorage.removeItem('teacherCurrentOtp');
        localStorage.removeItem('teacherRememberMe');
    }

    function generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
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
        document.body.style.minHeight = '100vh';
        
        setCurrentDate();
        loadUserData();
    }

    // ==================== LOGIN EVENT LISTENERS ====================
    function setupLoginEventListeners() {
        if (loginFormElement) {
            loginFormElement.addEventListener('submit', handleLoginSubmit);
        }
        
        if (otpFormElement) {
            otpFormElement.addEventListener('submit', handleOtpSubmit);
        }
        
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', handlePasswordToggle);
        }
        
        if (backToLoginButton) {
            backToLoginButton.addEventListener('click', handleBackToLogin);
        }
        
        if (resendOtpButton) {
            resendOtpButton.addEventListener('click', handleResendOtp);
        }
        
        if (btnDemoCredentials) {
            btnDemoCredentials.addEventListener('click', handleDemoCredentials);
        }
        
        setupOtpInputs();
        setupRealTimeValidation();
    }

    // ==================== DEMO CREDENTIALS HANDLER ====================
    function handleDemoCredentials() {
        if (teacherRegNumber) teacherRegNumber.value = VALID_CREDENTIALS.registrationNumber;
        if (teacherEmail) teacherEmail.value = VALID_CREDENTIALS.email;
        if (teacherPassword) teacherPassword.value = VALID_CREDENTIALS.password;
        
        markFieldSuccess(teacherRegNumber);
        markFieldSuccess(teacherEmail);
        markFieldSuccess(teacherPassword);
        
        if (regNumError) regNumError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        
        if (btnDemoCredentials) {
            btnDemoCredentials.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btnDemoCredentials.style.transform = 'scale(1)';
            }, 150);
        }
        
        if (teacherPassword) teacherPassword.focus();
        
        showToast('Demo credentials auto-filled! Click Sign In to continue.', 'info');
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
            const regNum = teacherRegNumber.value.trim().toUpperCase();
            const email = teacherEmail.value.trim().toLowerCase();
            const pass = teacherPassword.value.trim();
            
            if (regNum === VALID_CREDENTIALS.registrationNumber &&
                email === VALID_CREDENTIALS.email &&
                pass === VALID_CREDENTIALS.password) {
                
                currentOtp = generateOTP();
                sessionStorage.setItem('teacherCurrentOtp', currentOtp);
                sessionStorage.setItem('teacherEmailForOtp', email);
                
                hideLoading();
                switchToOtpForm();
                showToast('Verification code generated! It is displayed above.', 'success');
                
            } else {
                hideLoading();
                showToast('Invalid credentials. Please check and try again.', 'error');
                shakeElement(loginFormElement);
            }
            
            isProcessing = false;
            enableButton(loginSubmitBtn, 'Sign In to Dashboard', 'fa-arrow-right');
            
        }, 1500);
    }

    // ==================== OTP HANDLER ====================
    function handleOtpSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isProcessing) return;
        
        const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
        clearOtpError();
        
        const validOtp = sessionStorage.getItem('teacherCurrentOtp') || currentOtp;
        
        if (enteredOtp.length !== 6) {
            showOtpError('Please enter all 6 digits of the verification code');
            shakeElement(otpInputContainer);
            return;
        }
        
        if (otpExpiryTime && Date.now() > otpExpiryTime) {
            showOtpError('Verification code has expired. Please request a new one.');
            if (otpTimerDisplay) otpTimerDisplay.style.background = '#fee2e2';
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
                showSuccessOverlay();
                
                sessionStorage.removeItem('teacherCurrentOtp');
                
                setTimeout(() => {
                    hideSuccessOverlay();
                    showDashboardPage();
                }, 2500);
                
            } else {
                hideLoading();
                showOtpError('Invalid verification code. Please check and try again.');
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
        
        if (!teacherRegNumber.value.trim()) {
            showFieldError(regNumError, 'Teacher registration number is required');
            markFieldError(teacherRegNumber);
            isValid = false;
        } else if (teacherRegNumber.value.trim().toUpperCase() !== VALID_CREDENTIALS.registrationNumber) {
            showFieldError(regNumError, 'Invalid registration number');
            markFieldError(teacherRegNumber);
            isValid = false;
        } else {
            markFieldSuccess(teacherRegNumber);
        }
        
        if (!teacherEmail.value.trim()) {
            showFieldError(emailError, 'Email address is required');
            markFieldError(teacherEmail);
            isValid = false;
        } else if (!isValidEmail(teacherEmail.value.trim())) {
            showFieldError(emailError, 'Please enter a valid email address');
            markFieldError(teacherEmail);
            isValid = false;
        } else if (teacherEmail.value.trim().toLowerCase() !== VALID_CREDENTIALS.email) {
            showFieldError(emailError, 'Email not found in our records');
            markFieldError(teacherEmail);
            isValid = false;
        } else {
            markFieldSuccess(teacherEmail);
        }
        
        if (!teacherPassword.value.trim()) {
            showFieldError(passwordError, 'Password is required');
            markFieldError(teacherPassword);
            isValid = false;
        } else if (teacherPassword.value.trim() !== VALID_CREDENTIALS.password) {
            showFieldError(passwordError, 'Invalid password');
            markFieldError(teacherPassword);
            isValid = false;
        } else {
            markFieldSuccess(teacherPassword);
        }
        
        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFieldError(element, message) {
        if (element) {
            element.textContent = message;
        }
    }

    function markFieldError(input) {
        if (input) {
            input.classList.add('error');
            input.classList.remove('success');
        }
    }

    function markFieldSuccess(input) {
        if (input) {
            input.classList.add('success');
            input.classList.remove('error');
        }
    }

    function clearAllErrors() {
        [regNumError, emailError, passwordError].forEach(el => {
            if (el) el.textContent = '';
        });
        [teacherRegNumber, teacherEmail, teacherPassword].forEach(el => {
            if (el) el.classList.remove('error', 'success');
        });
    }

    function showOtpError(message) {
        if (otpError) otpError.textContent = message;
        showToast(message, 'error');
    }

    function clearOtpError() {
        if (otpError) otpError.textContent = '';
    }

    // ==================== OTP INPUT SETUP ====================
    function setupOtpInputs() {
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (!/^\d*$/.test(value)) {
                    e.target.value = value.replace(/[^\d]/g, '');
                    return;
                }
                
                if (value) {
                    input.classList.add('filled');
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                } else {
                    input.classList.remove('filled');
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].value = '';
                    otpInputs[index - 1].classList.remove('filled');
                    e.preventDefault();
                }
            });
            
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').trim();
                
                if (/^\d{6}$/.test(pastedData)) {
                    const digits = pastedData.split('');
                    otpInputs.forEach((inp, i) => {
                        inp.value = digits[i];
                        inp.classList.add('filled');
                    });
                    otpInputs[otpInputs.length - 1].focus();
                }
            });
            
            input.addEventListener('focus', () => {
                input.select();
            });
        });
    }

    function clearOtpInputs() {
        otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
    }

    // ==================== FORM SWITCHING ====================
    function switchToOtpForm() {
        clearOtpInputs();
        clearOtpError();
        
        loginFormSection.classList.remove('active');
        otpFormSection.classList.add('active');
        
        const email = sessionStorage.getItem('teacherEmailForOtp') || 'your email';
        if (otpSentToEmail) {
            otpSentToEmail.textContent = `Sent to: ${email}`;
        }
        
        if (otpDisplayBox) {
            otpDisplayBox.style.display = 'block';
            otpDisplayBox.style.opacity = '1';
        }
        
        startOtpTimer(120);
        startResendCooldown(30);
        
        if (otpInputs[0]) {
            setTimeout(() => otpInputs[0].focus(), 300);
        }
    }

    function handleBackToLogin() {
        clearAllTimers();
        clearOtpInputs();
        clearOtpError();
        sessionStorage.removeItem('teacherEmailForOtp');
        sessionStorage.removeItem('teacherCurrentOtp');
        currentOtp = null;
        
        if (otpDisplayCode) {
            otpDisplayCode.textContent = '------';
        }
        
        otpFormSection.classList.remove('active');
        loginFormSection.classList.add('active');
        
        clearAllErrors();
        
        if (teacherRegNumber) teacherRegNumber.focus();
        
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
            
            if (remaining <= 0) {
                clearInterval(otpTimerInterval);
                handleOtpExpired();
            }
        }, 1000);
    }

    function updateTimerDisplay(totalSeconds) {
        if (!timerCountdown) return;
        
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        timerCountdown.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (totalSeconds <= 30) {
            timerCountdown.style.color = '#ef4444';
        } else {
            timerCountdown.style.color = '';
        }
    }

    function handleOtpExpired() {
        showOtpError('Verification code has expired. Please request a new one.');
        if (otpTimerDisplay) {
            otpTimerDisplay.style.background = '#fee2e2';
        }
        if (otpDisplayBox) {
            otpDisplayBox.style.opacity = '0.5';
        }
        sessionStorage.removeItem('teacherCurrentOtp');
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

    function updateResendTimer(seconds) {
        if (resendTimerDisplay) {
            resendTimerDisplay.textContent = `in ${seconds}s`;
        }
    }

    function handleResendOtp() {
        if (isProcessing) return;
        
        showLoading('Generating new code...');
        
        setTimeout(() => {
            currentOtp = generateOTP();
            sessionStorage.setItem('teacherCurrentOtp', currentOtp);
            
            hideLoading();
            clearOtpInputs();
            clearOtpError();
            
            if (otpDisplayBox) otpDisplayBox.style.opacity = '1';
            if (otpTimerDisplay) otpTimerDisplay.style.background = '';
            
            startOtpTimer(120);
            startResendCooldown(30);
            
            if (otpInputs[0]) otpInputs[0].focus();
            
            showToast('New verification code generated!', 'success');
        }, 1000);
    }

    function clearAllTimers() {
        if (otpTimerInterval) {
            clearInterval(otpTimerInterval);
            otpTimerInterval = null;
        }
        if (resendTimerInterval) {
            clearInterval(resendTimerInterval);
            resendTimerInterval = null;
        }
        otpExpiryTime = null;
    }

    // ==================== PASSWORD TOGGLE ====================
    function handlePasswordToggle() {
        const type = teacherPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        teacherPassword.setAttribute('type', type);
        
        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // ==================== REAL-TIME VALIDATION ====================
    function setupRealTimeValidation() {
        if (teacherRegNumber) {
            teacherRegNumber.addEventListener('input', () => {
                if (teacherRegNumber.value.trim()) {
                    if (teacherRegNumber.value.trim().toUpperCase() === VALID_CREDENTIALS.registrationNumber) {
                        markFieldSuccess(teacherRegNumber);
                        if (regNumError) regNumError.textContent = '';
                    } else {
                        markFieldError(teacherRegNumber);
                    }
                } else {
                    teacherRegNumber.classList.remove('error', 'success');
                    if (regNumError) regNumError.textContent = '';
                }
            });
        }
        
        if (teacherEmail) {
            teacherEmail.addEventListener('input', () => {
                if (teacherEmail.value.trim()) {
                    if (teacherEmail.value.trim().toLowerCase() === VALID_CREDENTIALS.email) {
                        markFieldSuccess(teacherEmail);
                        if (emailError) emailError.textContent = '';
                    } else {
                        markFieldError(teacherEmail);
                    }
                } else {
                    teacherEmail.classList.remove('error', 'success');
                    if (emailError) emailError.textContent = '';
                }
            });
        }
        
        if (teacherPassword) {
            teacherPassword.addEventListener('input', () => {
                if (teacherPassword.value.trim()) {
                    if (teacherPassword.value.trim() === VALID_CREDENTIALS.password) {
                        markFieldSuccess(teacherPassword);
                        if (passwordError) passwordError.textContent = '';
                    } else {
                        markFieldError(teacherPassword);
                    }
                } else {
                    teacherPassword.classList.remove('error', 'success');
                    if (passwordError) passwordError.textContent = '';
                }
            });
        }
    }

    // ==================== DASHBOARD EVENT LISTENERS ====================
    function setupDashboardEventListeners() {
        if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
        
        navLinks.forEach(link => {
            link.addEventListener('click', handleDashboardNav);
        });
        
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
        
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.querySelector('span').textContent;
                showToast(`"${action}" feature will be available soon!`, 'info');
            });
        });
        
        document.querySelectorAll('.announcement-item.unread').forEach(item => {
            item.addEventListener('click', function() {
                this.classList.remove('unread');
                this.style.borderLeft = '3px solid transparent';
                this.style.background = '#f8fafc';
            });
        });
    }

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function handleDashboardNav(e) {
        e.preventDefault();
        
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
        
        const section = this.getAttribute('data-section');
        if (section && pageTitle) {
            const titles = {
                'dashboard': 'Teacher Dashboard',
                'classes': 'My Classes',
                'attendance': 'Attendance Management',
                'grades': 'Student Grades',
                'announcements': 'Announcements',
                'schedule': 'Class Schedule',
                'messages': 'Messages',
                'profile': 'Profile Settings'
            };
            pageTitle.textContent = titles[section] || 'Teacher Dashboard';
        }
        
        if (window.innerWidth <= 768) closeSidebar();
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout from the Teacher Portal?')) {
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
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateEl.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    function loadUserData() {
        try {
            const userData = JSON.parse(sessionStorage.getItem('teacherUserData') || '{}');
            
            if (userData.email) {
                if (welcomeName) welcomeName.textContent = `Mr. Anderson`;
                if (teacherNameEl) teacherNameEl.textContent = userData.teacherName || 'Mr. James Anderson';
            }
            
            if (userData.subject && teacherSubject) {
                teacherSubject.textContent = userData.subject;
            }
        } catch (e) {
            console.warn('Could not load user data:', e);
        }
    }

    // ==================== UI HELPERS ====================
    function showLoading(message) {
        if (loadingText) loadingText.textContent = message || 'Processing...';
        if (loadingOverlay) loadingOverlay.classList.add('active');
    }

    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }

    function showSuccessOverlay() {
        if (successOverlay) successOverlay.classList.add('active');
        
        if (progressFill) {
            setTimeout(() => {
                progressFill.style.width = '100%';
            }, 100);
        }
    }

    function hideSuccessOverlay() {
        if (successOverlay) successOverlay.classList.remove('active');
        if (progressFill) progressFill.style.width = '0%';
    }

    function disableButton(button) {
        if (button) {
            button.disabled = true;
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
        }
    }

    function enableButton(button, text, iconClass) {
        if (button) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            if (text && iconClass) {
                button.innerHTML = `<span>${text}</span><i class="fas ${iconClass}"></i>`;
            }
        }
    }

    function shakeElement(element) {
        if (element) {
            element.style.animation = 'none';
            element.offsetHeight;
            element.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    }

    function showToast(message, type) {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'info' ? '#4f46e5' : '#3b82f6';
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
        
        notification.className = `toast-notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
        
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