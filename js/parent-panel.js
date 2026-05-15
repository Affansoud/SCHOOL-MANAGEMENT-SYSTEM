// parent-panel.js - Parent Panel Dashboard Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const pageTitle = document.getElementById('pageTitle');

  // ----- Set current date in welcome card -----
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
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openSidebar);
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // ----- Navigation Link Active State & Section Switching -----
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));

      // Add active class to clicked link
      this.classList.add('active');

      // Update page title based on clicked section
      const section = this.getAttribute('data-section');
      if (section && pageTitle) {
        const titles = {
          'dashboard': 'Dashboard',
          'results': 'Results',
          'performance': 'Performance',
          'attendance': 'Attendance',
          'payments': 'Payments',
          'messages': 'Messages',
          'profile': 'Profile'
        };
        pageTitle.textContent = titles[section] || 'Dashboard';
      }

      // On mobile, close sidebar after navigation
      if (window.innerWidth <= 768) {
        closeSidebar();
      }

      // Simulate section content change (for demo purposes)
      simulateSectionChange(section);
    });
  });

  // ----- Simulate Section Content Change -----
  const simulateSectionChange = (section) => {
    const dashboardSection = document.getElementById('dashboardSection');
    
    // For demo, we'll just update the dashboard section with a message
    // In a real app, you would show/hide different sections
    if (section !== 'dashboard' && dashboardSection) {
      const sectionNames = {
        'results': 'Results',
        'performance': 'Performance',
        'attendance': 'Attendance',
        'payments': 'Payments',
        'messages': 'Messages',
        'profile': 'Profile'
      };
      
      // Create a placeholder message for demo
      dashboardSection.innerHTML = `
        <div class="card" style="text-align: center; padding: 60px 30px;">
          <i class="fas fa-tools" style="font-size: 3rem; color: #2563eb; margin-bottom: 16px;"></i>
          <h2>${sectionNames[section] || 'Section'}</h2>
          <p style="color: #64748b; margin: 12px 0;">This section is under development. Please check back later for updates.</p>
          <button class="back-to-dashboard-btn" style="margin-top: 16px; padding: 10px 24px; background: #2563eb; color: white; border: none; border-radius: 20px; cursor: pointer; font-family: 'Inter', sans-serif;">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      `;

      // Add event listener to back button
      const backBtn = dashboardSection.querySelector('.back-to-dashboard-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          // Reset to dashboard
          location.reload(); // Simple reload for demo
        });
      }
    }
  };

  // ----- Handle window resize for responsive sidebar -----
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // ----- Stat Card Hover Animation Enhancement -----
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-6px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  // ----- Notification Click to Mark as Read -----
  const notificationItems = document.querySelectorAll('.notification-item.unread');
  notificationItems.forEach(item => {
    item.addEventListener('click', function() {
      this.classList.remove('unread');
      this.style.borderLeft = '3px solid transparent';
      this.style.background = '#f8fafc';
      
      // Update badge count
      const badge = document.querySelector('.nav-link .badge');
      if (badge) {
        let count = parseInt(badge.textContent);
        if (count > 0) {
          count--;
          badge.textContent = count;
          if (count === 0) {
            badge.style.display = 'none';
          }
        }
      }

      // Hide notification dot
      const notifDot = document.querySelector('.notification-dot');
      const unreadCount = document.querySelectorAll('.notification-item.unread').length;
      if (notifDot && unreadCount === 0) {
        notifDot.style.display = 'none';
      }
    });
  });

  // ----- Logout Confirmation -----
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const confirmLogout = confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        window.location.href = 'index.html';
      }
    });
  }

  // ----- Initialize: Show current date -----
  console.log('Parent Panel Dashboard initialized successfully.');
});