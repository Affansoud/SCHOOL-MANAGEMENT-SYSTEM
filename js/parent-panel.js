/**
 * ============================================================
 * parent-auth-system.js
 * Complete Authentication System - All in One File
 * Features:
 * - Login with validation
 * - OTP verification with timer
 * - Session management
 * - Dashboard with full functionality
 * - Logout with session cleanup
 * - NO blinking, NO infinite loops, NO auto-refresh
 * ============================================================
 */

(function() {
    'use strict';

    // ==================== DEMO CREDENTIALS ====================
    const VALID_CREDENTIALS = {
        registrationNumber: 'STD2025001',
        email: 'parent@example.com',
        password: '1234',
        otp: '567890'
    };

    // ==================== GLOBAL STATE ====================
    let currentPage = 'login'; // 'login' or 'dashboard'
    let isProcessing = false;
    let otpTimerInterval = null;
    let resendTimerInterval = null;
    let otpExpiryTime = null;
    let currentOtp = VALID_CREDENTIALS.otp;

    // ==================== DOM REFERENCES ====================
    // Login Page Elements
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
    
    const registrationNumber = document.getElementById('registrationNumber');
    const parentEmail = document.getElementById('parentEmail');
    const password = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const rememberMeCheckbox = document.getElementById('rememberMeCheckbox');
    
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

    // Dashboard Page Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('pageTitle');
    const currentDateEl = document.getElementById('currentDate');
    const welcomeName = document.getElementById('welcomeName');
    const parentNameEl = document.getElementById('parentName');
    const parentChild = document.getElementById('parentChild');

    // ==================== INITIALIZATION ====================
    function init() {
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
        if (registrationNumber) {
            setTimeout(() => registrationNumber.focus(), 500);
        }
        
        console.log('%c🔐 SmartSchool Auth System Initialized', 'color: #2563eb; font-weight: bold; font-size: 14px;');
        console.log('%c📋 Demo Credentials Available - Check login form', 'color: #f59e0b; font-weight: bold;');
    }

    // ==================== SESSION MANAGEMENT ====================
    function checkExistingSession() {
        // Check sessionStorage
        const sessionToken = sessionStorage.getItem('parentSessionToken');
        const sessionExpiry = sessionStorage.getItem('parentSessionExpiry');
        
        if (sessionToken && sessionExpiry) {
            const now = Date.now();
            if (now < parseInt(sessionExpiry)) {
                return true;
            } else {
                clearAllSessions();
            }
        }
        
        // Check localStorage for Remember Me
        const rememberData = localStorage.getItem('parentRememberMe');
        if (rememberData) {
            try {
                const parsed = JSON.parse(rememberData);
                const now = Date.now();
                if (now < parsed.expiry) {
                    sessionStorage.setItem('parentSessionToken', parsed.token);
                    sessionStorage.setItem('parentSessionExpiry', parsed.expiry.toString());
                    sessionStorage.setItem('parentUserData', JSON.stringify(parsed.userData));
                    return true;
                } else {
                    localStorage.removeItem('parentRememberMe');
                }
            } catch (e) {
                localStorage.removeItem('parentRememberMe');
            }
        }
        
        return false;
    }

    function createSession() {
        const sessionToken = generateToken();
        const sessionDuration = 30 * 60 * 1000; // 30 minutes
        const expiry = Date.now() + sessionDuration;
        
        const userData = {
            email: parentEmail ? parentEmail.value.trim().toLowerCase() : 'parent@example.com',
            registrationNumber: registrationNumber ? registrationNumber.value.trim().toUpperCase() : 'STD2025001',
            studentName: 'Emily Johnson',
            studentGrade: 'Grade 5',
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('parentSessionToken', sessionToken);
        sessionStorage.setItem('parentSessionExpiry', expiry.toString());
        sessionStorage.setItem('parentUserData', JSON.stringify(userData));
        
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
            const rememberDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
            const rememberData = {
                token: sessionToken,
                expiry: Date.now() + rememberDuration,
                userData: userData
            };
            localStorage.setItem('parentRememberMe', JSON.stringify(rememberData));
        }
        
        console.log('%c✅ Session Created Successfully', 'color: #10b981; font-weight: bold;');
    }

    function clearAllSessions() {
        sessionStorage.removeItem('parentSessionToken');
        sessionStorage.removeItem('parentSessionExpiry');
        sessionStorage.removeItem('parentUserData');
        sessionStorage.removeItem('parentEmailForOtp');
        localStorage.removeItem('parentRememberMe');
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
        currentPage = 'login';
        loginPage.style.display = 'flex';
        dashboardPage.style.display = 'none';
        document.body.style.background = '';
    }

    function showDashboardPage() {
        currentPage = 'dashboard';
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        document.body.style.background = '#f1f5f9';
        
        // Refresh dashboard data
        setCurrentDate();
        loadUserData();
    }

    // ==================== LOGIN EVENT LISTENERS ====================
    function setupLoginEventListeners() {
        // Login form
        if (loginFormElement) {
            loginFormElement.addEventListener('submit', handleLoginSubmit);
        }
        
        // OTP form
        if (otpFormElement) {
            otpFormElement.addEventListener('submit', handleOtpSubmit);
        }
        
        // Password toggle
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', handlePasswordToggle);
        }
        
        // Back to login
        if (backToLoginButton) {
            backToLoginButton.addEventListener('click', handleBackToLogin);
        }
        
        // Resend OTP
        if (resendOtpButton) {
            resendOtpButton.addEventListener('click', handleResendOtp);
        }
        
        // OTP inputs
        setupOtpInputs();
        
        // Real-time validation
        setupRealTimeValidation();
    }

    // ==================== LOGIN HANDLER ====================
    function handleLoginSubmit(e) {
        // CRITICAL: Prevent default form submission
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent double submission
        if (isProcessing) return;
        
        // Validate
        if (!validateLoginForm()) return;
        
        // Start processing
        isProcessing = true;
        disableButton(loginSubmitBtn);
        
        // Show loading
        showLoading('Verifying credentials...');
        
        // Simulate API call
        setTimeout(() => {
            const regNum = registrationNumber.value.trim().toUpperCase();
            const email = parentEmail.value.trim().toLowerCase();
            const pass = password.value.trim();
            
            if (regNum === VALID_CREDENTIALS.registrationNumber &&
                email === VALID_CREDENTIALS.email &&
                pass === VALID_CREDENTIALS.password) {
                
                // Success - Switch to OTP
                hideLoading();
                sessionStorage.setItem('parentEmailForOtp', email);
                switchToOtpForm();
                showNotification('Verification code sent to your email', 'success');
                
            } else {
                // Invalid
                hideLoading();
                showNotification('Invalid credentials. Please check and try again.', 'error');
                shakeElement(loginFormElement);
            }
            
            isProcessing = false;
            enableButton(loginSubmitBtn, 'Sign In to Dashboard', 'fa-arrow-right');
            
        }, 1500);
    }

    // ==================== OTP HANDLER ====================
    function handleOtpSubmit(e) {
        // CRITICAL: Prevent default form submission
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent double submission
        if (isProcessing) return;
        
        const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
        clearOtpError();
        
        // Validate OTP length
        if (enteredOtp.length !== 6) {
            showOtpError('Please enter all 6 digits');
            shakeElement(otpInputContainer);
            return;
        }
        
        // Check expiry
        if (otpExpiryTime && Date.now() > otpExpiryTime) {
            showOtpError('Code expired. Please request a new one.');
            return;
        }
        
        // Start processing
        isProcessing = true;
        disableButton(verifyOtpSubmitBtn);
        showLoading('Verifying code...');
        
        setTimeout(() => {
            if (enteredOtp === currentOtp) {
                // SUCCESS
                hideLoading();
                createSession();
                showSuccessOverlay();
                
                // Redirect to dashboard after animation
                setTimeout(() => {
                    hideSuccessOverlay();
                    showDashboardPage();
                }, 2500);
                
            } else {
                // Invalid OTP
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
        
        if (!registrationNumber.value.trim()) {
            showFieldError(regNumError, 'Registration number is required');
            markFieldError(registrationNumber);
            isValid = false;
        } else if (registrationNumber.value.trim().toUpperCase() !== VALID_CREDENTIALS.registrationNumber) {
            showFieldError(regNumError, 'Invalid registration number');
            markFieldError(registrationNumber);
            isValid = false;
        } else {
            markFieldSuccess(registrationNumber);
        }
        
        if (!parentEmail.value.trim()) {
            showFieldError(emailError, 'Email address is required');
            markFieldError(parentEmail);
            isValid = false;
        } else if (!isValidEmail(parentEmail.value.trim())) {
            showFieldError(emailError, 'Please enter a valid email');
            markFieldError(parentEmail);
            isValid = false;
        } else if (parentEmail.value.trim().toLowerCase() !== VALID_CREDENTIALS.email) {
            showFieldError(emailError, 'Email not found');
            markFieldError(parentEmail);
            isValid = false;
        } else {
            markFieldSuccess(parentEmail);
        }
        
        if (!password.value.trim()) {
            showFieldError(passwordError, 'Password is required');
            markFieldError(password);
            isValid = false;
        } else if (password.value.trim() !== VALID_CREDENTIALS.password) {
            showFieldError(passwordError, 'Invalid password');
            markFieldError(password);
            isValid = false;
        } else {
            markFieldSuccess(password);
        }
        
        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFieldError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.animation = 'none';
            element.offsetHeight;
            element.style.animation = 'shake 0.3s ease';
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
        [registrationNumber, parentEmail, password].forEach(el => {
            if (el) el.classList.remove('error', 'success');
        });
    }

    function showOtpError(message) {
        if (otpError) otpError.textContent = message;
        showNotification(message, 'error');
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
                
                if (e.key === 'ArrowLeft' && index > 0) {
                    otpInputs[index - 1].focus();
                    e.preventDefault();
                }
                
                if (e.key === 'ArrowRight' && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
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
        
        const email = sessionStorage.getItem('parentEmailForOtp') || 'your email';
        if (otpSentToEmail) {
            otpSentToEmail.textContent = `Sent to: ${email}`;
        }
        
        startOtpTimer(180);
        startResendCooldown(30);
        
        if (otpInputs[0]) {
            setTimeout(() => otpInputs[0].focus(), 300);
        }
        
        console.log(`%c📧 OTP for demo: ${currentOtp}`, 'color: #10b981; font-weight: bold;');
    }

    function handleBackToLogin() {
        clearAllTimers();
        clearOtpInputs();
        clearOtpError();
        sessionStorage.removeItem('parentEmailForOtp');
        
        otpFormSection.classList.remove('active');
        loginFormSection.classList.add('active');
        
        clearAllErrors();
        
        if (registrationNumber) registrationNumber.focus();
        
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
        showOtpError('Code expired. Please request a new one.');
        if (otpTimerDisplay) {
            otpTimerDisplay.style.background = '#fee2e2';
        }
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
        
        showLoading('Resending code...');
        
        setTimeout(() => {
            hideLoading();
            clearOtpInputs();
            clearOtpError();
            
            if (otpTimerDisplay) otpTimerDisplay.style.background = '';
            
            startOtpTimer(180);
            startResendCooldown(30);
            
            if (otpInputs[0]) otpInputs[0].focus();
            
            showNotification('New code sent to your email', 'success');
            console.log(`%c📧 Resent OTP: ${currentOtp}`, 'color: #10b981; font-weight: bold;');
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
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        
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
        if (registrationNumber) {
            registrationNumber.addEventListener('input', () => {
                if (registrationNumber.value.trim()) {
                    if (registrationNumber.value.trim().toUpperCase() === VALID_CREDENTIALS.registrationNumber) {
                        markFieldSuccess(registrationNumber);
                        if (regNumError) regNumError.textContent = '';
                    } else {
                        markFieldError(registrationNumber);
                    }
                } else {
                    registrationNumber.classList.remove('error', 'success');
                    if (regNumError) regNumError.textContent = '';
                }
            });
        }
        
        if (parentEmail) {
            parentEmail.addEventListener('input', () => {
                if (parentEmail.value.trim()) {
                    if (parentEmail.value.trim().toLowerCase() === VALID_CREDENTIALS.email) {
                        markFieldSuccess(parentEmail);
                        if (emailError) emailError.textContent = '';
                    } else {
                        markFieldError(parentEmail);
                    }
                } else {
                    parentEmail.classList.remove('error', 'success');
                    if (emailError) emailError.textContent = '';
                }
            });
        }
        
        if (password) {
            password.addEventListener('input', () => {
                if (password.value.trim()) {
                    if (password.value.trim() === VALID_CREDENTIALS.password) {
                        markFieldSuccess(password);
                        if (passwordError) passwordError.textContent = '';
                    } else {
                        markFieldError(password);
                    }
                } else {
                    password.classList.remove('error', 'success');
                    if (passwordError) passwordError.textContent = '';
                }
            });
        }
    }

    // ==================== DASHBOARD EVENT LISTENERS ====================
    function setupDashboardEventListeners() {
        // Sidebar
        if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
        
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', handleDashboardNav);
        });
        
        // Logout
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
        
        // Stat cards hover
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
            card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
        });
        
        // Announcements click
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
                'dashboard': 'Dashboard',
                'results': 'Academic Results',
                'attendance': 'Attendance Records',
                'payments': 'Fee Payments',
                'messages': 'Messages',
                'profile': 'Profile Settings'
            };
            pageTitle.textContent = titles[section] || 'Dashboard';
        }
        
        if (window.innerWidth <= 768) closeSidebar();
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            clearAllSessions();
            
            // Show brief message then redirect
            const msg = document.createElement('div');
            msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:24px 32px;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.2);z-index:9999;font-family:Inter,sans-serif;font-weight:600;font-size:1rem;display:flex;align-items:center;gap:12px;animation:fadeInScale 0.3s ease;';
            msg.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logging out securely...';
            document.body.appendChild(msg);
            
            setTimeout(() => {
                msg.remove();
                showLoginPage();
                // Reset login form
                if (loginFormSection && otpFormSection) {
                    otpFormSection.classList.remove('active');
                    loginFormSection.classList.add('active');
                }
                clearAllErrors();
                clearOtpInputs();
                clearOtpError();
                clearAllTimers();
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
            const userData = JSON.parse(sessionStorage.getItem('parentUserData') || '{}');
            
            if (userData.email) {
                const name = userData.email.split('@')[0];
                const displayName = name.charAt(0).toUpperCase() + name.slice(1);
                
                if (welcomeName) welcomeName.textContent = displayName;
                if (parentNameEl) parentNameEl.textContent = `${displayName} Johnson`;
            }
            
            if (userData.registrationNumber && parentChild) {
                parentChild.textContent = `Parent of Emily (${userData.studentGrade || 'Grade 5'})`;
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
        if (successTitle) successTitle.textContent = 'Login Successful!';
        if (successMessage) successMessage.textContent = 'Welcome to the Parent Dashboard';
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

    function showNotification(message, type) {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
        
        notification.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${bgColor}; color: white;
            padding: 14px 20px; border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 2000; display: flex; align-items: center;
            gap: 10px; font-size: 0.9rem;
            font-family: 'Inter', sans-serif; font-weight: 500;
            animation: slideInRight 0.3s ease;
            max-width: 400px; cursor: pointer;
        `;
        
        document.body.appendChild(notification);
        
        const removeNotification = () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        };
        
        notification.addEventListener('click', removeNotification);
        setTimeout(removeNotification, 4000);
    }

    // ==================== ADD ANIMATION STYLES ====================
    function addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-8px); }
                40% { transform: translateX(8px); }
                60% { transform: translateX(-6px); }
                80% { transform: translateX(6px); }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes fadeInScale {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // ==================== STARTUP ====================
    addAnimationStyles();
    init();

})();