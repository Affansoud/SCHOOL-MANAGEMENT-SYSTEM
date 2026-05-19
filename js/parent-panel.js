/**
 * ============================================================
 * parent-panel.js
 * Professional Parent Panel Dashboard - All Functionality
 * Features:
 * - Dynamic content loading
 * - Chart.js integration
 * - Responsive sidebar
 * - Dark mode toggle
 * - Toast notifications
 * - Real-time updates
 * - Full CRUD simulations
 * ============================================================
 */

(function() {
    'use strict';

    // ==================== GLOBAL STATE ====================
    let currentSection = 'dashboard';
    let isSidebarOpen = false;
    let performanceChart = null;
    let subjectChart = null;
    let attendanceChart = null;
    let performanceAnalysisChart = null;
    let termComparisonChart = null;

    // ==================== DOM REFERENCES ====================
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('pageTitle');
    const contentWrapper = document.getElementById('contentWrapper');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const notificationBell = document.getElementById('notificationBell');
    const globalSearch = document.getElementById('globalSearch');
    const studentSwitch = document.getElementById('studentSwitch');
    const toastContainer = document.getElementById('toastContainer');
    const currentDateEl = document.getElementById('currentDate');

    // ==================== INITIALIZATION ====================
    function init() {
        showLoading('Initializing Dashboard...');
        
        // Set current date
        setCurrentDate();
        
        // Setup event listeners
        setupEventListeners();
        
        // Check for saved theme
        loadThemePreference();
        
        // Load dashboard data
        setTimeout(() => {
            hideLoading();
            loadDashboardCharts();
            populateAttendanceCalendar();
            populateAttendanceTable();
            showToast('Dashboard loaded successfully!', 'success');
        }, 1500);
        
        console.log('%c🎓 SmartSchool Parent Portal Initialized', 'color: #2563eb; font-weight: bold; font-size: 14px;');
        console.log('%c👋 Welcome, Sarah Johnson!', 'color: #10b981; font-weight: bold;');
    }

    // ==================== EVENT LISTENERS ====================
    function setupEventListeners() {
        // Sidebar toggle
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', toggleSidebar);
        }
        
        if (sidebarCloseBtn) {
            sidebarCloseBtn.addEventListener('click', closeSidebar);
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebar);
        }
        
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });
        
        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', openLogoutModal);
        }
        
        // Dark mode toggle
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }
        
        // Notification bell
        if (notificationBell) {
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('notificationDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }
        
        // Close notification dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        });
        
        // Global search
        if (globalSearch) {
            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch(globalSearch.value);
                }
            });
        }
        
        // Student switch
        if (studentSwitch) {
            studentSwitch.addEventListener('change', handleStudentSwitch);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Window resize
        window.addEventListener('resize', handleResize);
        
        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLogoutModal();
                closeSidebar();
            }
        });
        
        // Add click handlers to action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.querySelector('span').textContent;
                showToast(`${action} feature activated!`, 'info');
            });
        });
        
        // Add click handlers to result action buttons
        const downloadBtn = document.querySelector('.btn-primary');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                showToast('Downloading PDF...', 'info');
                setTimeout(() => showToast('PDF downloaded successfully!', 'success'), 2000);
            });
        }
        
        // Profile save buttons
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast('Changes saved successfully!', 'success');
            });
        });
        
        // Chat send button
        const chatSendBtn = document.querySelector('.chat-input button');
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', sendMessage);
        }
        
        const chatInput = document.querySelector('.chat-input input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
    }

    // ==================== SIDEBAR FUNCTIONS ====================
    function toggleSidebar() {
        if (isSidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
        isSidebarOpen = true;
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        isSidebarOpen = false;
        document.body.style.overflow = '';
    }

    // ==================== NAVIGATION ====================
    function handleNavigation(e) {
        e.preventDefault();
        
        const section = this.getAttribute('data-section');
        
        // Update active states
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
        
        // Switch section
        switchSection(section);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    }

    function switchSection(section) {
        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'results': 'Academic Results',
            'attendance': 'Attendance Records',
            'payments': 'Fee Payments',
            'messages': 'Messages',
            'profile': 'Profile Settings'
        };
        
        if (pageTitle) {
            pageTitle.textContent = titles[section] || 'Dashboard';
        }
        
        // Show/hide sections
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = section;
            
            // Load section-specific data
            loadSectionData(section);
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                loadDashboardCharts();
                break;
            case 'results':
                loadResultsCharts();
                break;
            case 'attendance':
                loadAttendanceCharts();
                populateAttendanceCalendar();
                populateAttendanceTable();
                break;
            case 'messages':
                // Messages are static for demo
                break;
            case 'profile':
                // Profile is static for demo
                break;
        }
    }

    // ==================== DASHBOARD CHARTS ====================
    function loadDashboardCharts() {
        // Performance Trend Chart
        const perfCtx = document.getElementById('performanceChart');
        if (perfCtx) {
            if (performanceChart) performanceChart.destroy();
            
            performanceChart = new Chart(perfCtx, {
                type: 'line',
                data: {
                    labels: ['Term 1', 'Term 2', 'Term 3', 'Final'],
                    datasets: [{
                        label: 'Mathematics',
                        data: [88, 92, 95, 95],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'English',
                        data: [82, 85, 88, 88],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Science',
                        data: [85, 88, 90, 92],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100
                        }
                    }
                }
            });
        }
        
        // Subject Performance Chart
        const subjectCtx = document.getElementById('subjectChart');
        if (subjectCtx) {
            if (subjectChart) subjectChart.destroy();
            
            subjectChart = new Chart(subjectCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Math', 'English', 'Science', 'History', 'Art'],
                    datasets: [{
                        data: [95, 88, 92, 85, 98],
                        backgroundColor: [
                            '#2563eb',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    // ==================== RESULTS CHARTS ====================
    function loadResultsCharts() {
        // Performance Analysis Chart
        const analysisCtx = document.getElementById('performanceAnalysisChart');
        if (analysisCtx) {
            if (performanceAnalysisChart) performanceAnalysisChart.destroy();
            
            performanceAnalysisChart = new Chart(analysisCtx, {
                type: 'bar',
                data: {
                    labels: ['Math', 'English', 'Science', 'History', 'Art'],
                    datasets: [{
                        label: 'Score',
                        data: [95, 88, 92, 85, 98],
                        backgroundColor: [
                            'rgba(37, 99, 235, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(139, 92, 246, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100
                        }
                    }
                }
            });
        }
        
        // Term Comparison Chart
        const termCtx = document.getElementById('termComparisonChart');
        if (termCtx) {
            if (termComparisonChart) termComparisonChart.destroy();
            
            termComparisonChart = new Chart(termCtx, {
                type: 'radar',
                data: {
                    labels: ['Math', 'English', 'Science', 'History', 'Art'],
                    datasets: [{
                        label: 'Term 1',
                        data: [88, 82, 85, 80, 92],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.2)'
                    }, {
                        label: 'Term 2',
                        data: [95, 88, 92, 85, 98],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    // ==================== ATTENDANCE FUNCTIONS ====================
    function loadAttendanceCharts() {
        const attCtx = document.getElementById('attendanceChart');
        if (attCtx) {
            if (attendanceChart) attendanceChart.destroy();
            
            attendanceChart = new Chart(attCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Present Days',
                        data: [20, 18, 22, 21, 19, 20],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)'
                    }, {
                        label: 'Absent Days',
                        data: [1, 2, 0, 0, 1, 1],
                        backgroundColor: 'rgba(239, 68, 68, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true }
                    }
                }
            });
        }
    }

    function populateAttendanceCalendar() {
        const calendar = document.getElementById('attendanceCalendar');
        if (!calendar) return;
        
        const daysInMonth = 30;
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let calendarHTML = '';
        
        // Add day headers
        weekDays.forEach(day => {
            calendarHTML += `<div style="text-align:center;font-weight:600;padding:8px;font-size:0.75rem;">${day}</div>`;
        });
        
        // Add day cells
        for (let i = 1; i <= daysInMonth; i++) {
            const status = i % 7 === 0 || i % 7 === 6 ? 'absent' : 'present';
            const bgColor = status === 'present' ? '#d1fae5' : '#fee2e2';
            const textColor = status === 'present' ? '#166534' : '#991b1b';
            
            calendarHTML += `
                <div style="text-align:center;padding:8px;background:${bgColor};color:${textColor};border-radius:4px;font-size:0.75rem;font-weight:500;">
                    ${i}
                </div>
            `;
        }
        
        calendar.innerHTML = calendarHTML;
        calendar.style.display = 'grid';
        calendar.style.gridTemplateColumns = 'repeat(7, 1fr)';
        calendar.style.gap = '4px';
    }

    function populateAttendanceTable() {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;
        
        const attendanceData = [
            { date: '2024-01-15', day: 'Monday', status: 'Present', checkin: '8:00 AM', checkout: '3:30 PM', remarks: 'On time' },
            { date: '2024-01-14', day: 'Friday', status: 'Present', checkin: '8:05 AM', checkout: '3:30 PM', remarks: 'Slightly late' },
            { date: '2024-01-13', day: 'Thursday', status: 'Present', checkin: '7:55 AM', checkout: '3:30 PM', remarks: 'On time' },
            { date: '2024-01-12', day: 'Wednesday', status: 'Absent', checkin: '-', checkout: '-', remarks: 'Medical leave' },
            { date: '2024-01-11', day: 'Tuesday', status: 'Present', checkin: '8:00 AM', checkout: '3:30 PM', remarks: 'On time' },
        ];
        
        let tableHTML = '';
        attendanceData.forEach(record => {
            const statusColor = record.status === 'Present' ? '#10b981' : '#ef4444';
            tableHTML += `
                <tr>
                    <td>${record.date}</td>
                    <td>${record.day}</td>
                    <td><span style="color:${statusColor};font-weight:600;">${record.status}</span></td>
                    <td>${record.checkin}</td>
                    <td>${record.checkout}</td>
                    <td>${record.remarks}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = tableHTML;
    }

    // ==================== CHAT FUNCTIONALITY ====================
    function sendMessage() {
        const input = document.querySelector('.chat-input input');
        if (!input || !input.value.trim()) return;
        
        const chatMessages = document.querySelector('.chat-messages');
        const messageText = input.value.trim();
        
        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.innerHTML = `
            <p>${messageText}</p>
            <span>Just now</span>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear input
        input.value = '';
        
        // Simulate reply
        setTimeout(() => {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'message received';
            replyDiv.innerHTML = `
                <p>Thank you for your message. I'll get back to you shortly.</p>
                <span>Just now</span>
            `;
            chatMessages.appendChild(replyDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
    }

    // ==================== SEARCH FUNCTIONALITY ====================
    function performSearch(query) {
        if (!query.trim()) return;
        
        showToast(`Searching for "${query}"...`, 'info');
        
        // Simulate search
        setTimeout(() => {
            showToast(`Found results for "${query}"`, 'success');
        }, 1000);
    }

    function handleStudentSwitch(e) {
        const student = e.target.value;
        showToast(`Switched to ${student === 'emily' ? 'Emily' : 'Michael'}'s profile`, 'info');
        
        // Simulate data reload
        showLoading('Loading student data...');
        setTimeout(() => {
            hideLoading();
            if (student === 'emily') {
                document.getElementById('welcomeName').textContent = 'Sarah';
                document.getElementById('sidebarChildName').textContent = 'Parent of Emily (Grade 5)';
            } else {
                document.getElementById('welcomeName').textContent = 'Sarah';
                document.getElementById('sidebarChildName').textContent = 'Parent of Michael (Grade 8)';
            }
        }, 1000);
    }

    // ==================== DARK MODE ====================
    function toggleDarkMode() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const icon = darkModeToggle.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`, 'info');
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = darkModeToggle.querySelector('i');
        if (savedTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // ==================== LOGOUT FUNCTIONS ====================
    function openLogoutModal() {
        if (logoutModal) logoutModal.classList.add('active');
    }

    function closeLogoutModal() {
        if (logoutModal) logoutModal.classList.remove('active');
    }

    function confirmLogout() {
        closeLogoutModal();
        showLoading('Logging out...');
        
        setTimeout(() => {
            hideLoading();
            showToast('Logged out successfully!', 'success');
            
            // Simulate redirect to login
            setTimeout(() => {
                window.location.href = 'parent-login.html';
            }, 1500);
        }, 1000);
    }

    // ==================== UTILITY FUNCTIONS ====================
    function showLoading(message) {
        if (loadingText) loadingText.textContent = message || 'Loading...';
        if (loadingOverlay) loadingOverlay.classList.add('active');
    }

    function hideLoading() {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }

    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        });
    }

    function setCurrentDate() {
        if (currentDateEl) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateEl.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    function handleKeyboardShortcuts(e) {
        // Ctrl+B to toggle sidebar
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            toggleSidebar();
        }
        
        // Ctrl+D to toggle dark mode
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            toggleDarkMode();
        }
    }

    function handleResize() {
        if (window.innerWidth > 768 && isSidebarOpen) {
            closeSidebar();
        }
    }

    // ==================== SEARCH RESULTS FUNCTION ====================
    window.searchResults = function() {
        const regNumber = document.getElementById('regNumber').value;
        const classSelect = document.getElementById('classSelect').value;
        const yearSelect = document.getElementById('yearSelect').value;
        const termSelect = document.getElementById('termSelect').value;
        
        if (!regNumber || !classSelect || !yearSelect || !termSelect) {
            showToast('Please fill in all fields', 'warning');
            return;
        }
        
        showLoading('Fetching results...');
        
        setTimeout(() => {
            hideLoading();
            showToast('Results loaded successfully!', 'success');
            
            // Scroll to result slip
            const resultSlip = document.getElementById('resultSlip');
            if (resultSlip) {
                resultSlip.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Reload charts
            loadResultsCharts();
        }, 1500);
    };

    // ==================== GLOBAL NAVIGATION FUNCTION ====================
    window.navigateTo = function(section) {
        switchSection(section);
        
        // Update sidebar active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });
    };

    // ==================== STARTUP ====================
    init();

})();

// Make functions available globally
window.searchResults = function() {
    const regNumber = document.getElementById('regNumber')?.value;
    const classSelect = document.getElementById('classSelect')?.value;
    const yearSelect = document.getElementById('yearSelect')?.value;
    const termSelect = document.getElementById('termSelect')?.value;
    
    if (!regNumber || !classSelect || !yearSelect || !termSelect) {
        // Show toast
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast warning';
            toast.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Please fill in all fields</span>';
            toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        return;
    }
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
        
        const resultSlip = document.getElementById('resultSlip');
        if (resultSlip) {
            resultSlip.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Show success toast
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast success';
            toast.innerHTML = '<i class="fas fa-check-circle"></i><span>Results loaded successfully!</span>';
            toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }, 1500);
};

window.navigateTo = function(section) {
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'results': 'Academic Results',
        'attendance': 'Attendance Records',
        'payments': 'Fee Payments',
        'messages': 'Messages',
        'profile': 'Profile Settings'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[section] || 'Dashboard';
    
    // Show/hide sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById(`${section}Section`);
    if (targetSection) targetSection.classList.add('active');
    
    // Update sidebar active link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.closeLogoutModal = function() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.remove('active');
};

window.confirmLogout = function() {
    window.closeLogoutModal();
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
        window.location.href = 'parent-login.html';
    }, 1000);
};