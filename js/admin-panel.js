// admin-panel.js - Admin Panel Dashboard Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const viewAllLinks = document.querySelectorAll('.view-all');
  const pageTitle = document.getElementById('pageTitle');
  const globalSearch = document.getElementById('globalSearch');

  // All section elements
  const allSections = {
    'dashboard': document.getElementById('dashboardSection'),
    'applications': document.getElementById('applicationsSection'),
    'results-management': document.getElementById('resultsManagementSection'),
    'performance-reports': document.getElementById('performanceReportsSection'),
    'attendance-reports': document.getElementById('attendanceReportsSection'),
    'payments': document.getElementById('paymentsSection'),
    'manage-teachers': document.getElementById('manageTeachersSection'),
    'manage-students': document.getElementById('manageStudentsSection'),
    'messages': document.getElementById('messagesSection'),
    'settings': document.getElementById('settingsSection')
  };

  // Section titles map
  const sectionTitles = {
    'dashboard': 'Admin Dashboard',
    'applications': 'Application Review',
    'results-management': 'Results Management',
    'performance-reports': 'Performance Reports',
    'attendance-reports': 'Attendance Reports',
    'payments': 'Payment Status',
    'manage-teachers': 'Manage Teachers',
    'manage-students': 'Manage Students',
    'messages': 'Message Inbox',
    'settings': 'System Settings'
  };

  // ----- Set current date -----
  const currentDateElement = document.getElementById('currentDate');
  if (currentDateElement) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
  }

  // ----- Sidebar Toggle Functions -----
  const openSidebar = () => {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Event listeners for sidebar
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // ----- Switch Sections Function -----
  const switchSection = (sectionName) => {
    // Hide all sections
    Object.values(allSections).forEach(section => {
      if (section) section.style.display = 'none';
    });

    // Show target section
    if (allSections[sectionName]) {
      allSections[sectionName].style.display = 'block';
    }

    // Update page title
    if (pageTitle) {
      pageTitle.textContent = sectionTitles[sectionName] || 'Dashboard';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  // ----- Navigation Link Click Handlers -----
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Get section name
      const section = this.getAttribute('data-section');
      if (section) {
        switchSection(section);
      }
    });
  });

  // ----- View All Links -----
  viewAllLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      if (section) {
        // Update sidebar active state
        navLinks.forEach(l => l.classList.remove('active'));
        const targetLink = document.querySelector(`.nav-link[data-section="${section}"]`);
        if (targetLink) targetLink.classList.add('active');

        // Switch to section
        switchSection(section);
      }
    });
  });

  // ----- Global Search Filter -----
  if (globalSearch) {
    globalSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      // Search through all visible tables
      const visibleTables = document.querySelectorAll('.content-section[style*="display: block"] .data-table tbody tr, .active-section .data-table tbody tr');
      
      visibleTables.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // ----- Table Filter Functionality -----
  const tableFilters = document.querySelectorAll('.table-filter');
  tableFilters.forEach(filter => {
    filter.addEventListener('input', function() {
      const filterValue = this.value.toLowerCase();
      const tableId = this.getAttribute('data-table');
      const table = document.getElementById(tableId);
      
      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          if (text.includes(filterValue)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }
    });
  });

  // ----- Application Accept/Reject Handler (Global function) -----
  window.handleApplication = function(refNumber, action) {
    const message = action === 'accept' 
      ? `Application ${refNumber} has been accepted. Student will be notified via email.`
      : `Application ${refNumber} has been rejected. Parent will be notified with reason.`;
    
    // Show confirmation
    alert(message);

    // Update the table row
    const rows = document.querySelectorAll('#appsTable tbody tr');
    rows.forEach(row => {
      const refCell = row.querySelector('td:first-child');
      if (refCell && refCell.textContent.trim() === refNumber) {
        const statusCell = row.querySelector('.status');
        const actionsCell = row.querySelector('td:last-child');
        
        if (action === 'accept') {
          statusCell.textContent = 'Accepted';
          statusCell.className = 'status status-done';
          actionsCell.innerHTML = '<span class="text-light">Completed</span>';
        } else {
          statusCell.textContent = 'Rejected';
          statusCell.className = 'status status-overdue';
          actionsCell.innerHTML = '<span class="text-light">Completed</span>';
        }

        // Update badge count
        updateBadgeCount();
      }
    });
  };

  // ----- Update Pending Applications Badge -----
  const updateBadgeCount = () => {
    const pendingCount = document.querySelectorAll('#appsTable .status-pending').length;
    const badge = document.querySelector('.nav-link[data-section="applications"] .badge');
    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    }

    // Update dashboard stat card
    const pendingStatCard = document.querySelector('.stat-card .stat-icon .fa-file-alt');
    if (pendingStatCard) {
      const statInfo = pendingStatCard.closest('.stat-card').querySelector('.stat-info h3');
      if (statInfo) {
        statInfo.textContent = pendingCount;
      }
    }
  };

  // ----- Handle window resize -----
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // ----- Logout Confirmation -----
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const confirmLogout = confirm('Are you sure you want to logout from the admin panel?');
      if (confirmLogout) {
        window.location.href = 'index.html';
      }
    });
  }

  // ----- Message Click to Mark as Read -----
  const messageItems = document.querySelectorAll('.message-item.unread');
  messageItems.forEach(item => {
    item.addEventListener('click', function() {
      this.classList.remove('unread');
      this.style.borderLeft = '3px solid transparent';
      this.style.background = '#f8fafc';
      
      // Update unread count
      const unreadCount = document.querySelectorAll('.message-item.unread').length;
      const unreadSpan = document.querySelector('.unread-count');
      if (unreadSpan) {
        unreadSpan.textContent = `${unreadCount} unread`;
        if (unreadCount === 0) {
          unreadSpan.textContent = 'All read';
        }
      }

      // Update messages badge
      const msgBadge = document.querySelector('.nav-link[data-section="messages"] .badge');
      if (msgBadge) {
        if (unreadCount > 0) {
          msgBadge.textContent = unreadCount;
        } else {
          msgBadge.style.display = 'none';
        }
      }
    });
  });

  // ----- Notification Bell Click -----
  const notificationBell = document.querySelector('.notification-icon');
  if (notificationBell) {
    notificationBell.addEventListener('click', () => {
      // Switch to messages section
      navLinks.forEach(l => l.classList.remove('active'));
      const msgLink = document.querySelector('.nav-link[data-section="messages"]');
      if (msgLink) {
        msgLink.classList.add('active');
        switchSection('messages');
      }
    });
  }

  // ----- Initialize Badge Counts -----
  updateBadgeCount();

  console.log('Admin Panel Dashboard initialized successfully.');
  console.log('Available sections:', Object.keys(allSections).join(', '));
});