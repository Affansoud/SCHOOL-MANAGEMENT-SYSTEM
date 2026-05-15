// teacher-panel.js - Teacher Panel Dashboard Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const quickActionBtns = document.querySelectorAll('.quick-action-btn');
  const pageTitle = document.getElementById('pageTitle');

  // All sections
  const dashboardSection = document.getElementById('dashboardSection');
  const uploadResultSection = document.getElementById('uploadResultSection');
  const uploadAttendanceSection = document.getElementById('uploadAttendanceSection');
  const uploadPerformanceSection = document.getElementById('uploadPerformanceSection');
  const classAttendanceSection = document.getElementById('classAttendanceSection');
  const messagesSection = document.getElementById('messagesSection');

  // All sections map
  const sectionsMap = {
    'dashboard': dashboardSection,
    'upload-result': uploadResultSection,
    'upload-attendance': uploadAttendanceSection,
    'upload-performance': uploadPerformanceSection,
    'class-attendance': classAttendanceSection,
    'messages': messagesSection,
    'profile': null
  };

  // Section titles map
  const sectionTitles = {
    'dashboard': 'Teacher Dashboard',
    'upload-result': 'Upload Results',
    'upload-attendance': 'Upload Attendance',
    'upload-performance': 'Upload Performance',
    'class-attendance': 'Class Attendance',
    'messages': 'Messages',
    'profile': 'My Profile'
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
    Object.values(sectionsMap).forEach(section => {
      if (section) section.style.display = 'none';
    });

    // Show target section
    if (sectionsMap[sectionName]) {
      sectionsMap[sectionName].style.display = 'block';
    } else if (sectionName === 'profile') {
      // Show profile placeholder in dashboard area
      if (dashboardSection) {
        dashboardSection.style.display = 'block';
        dashboardSection.innerHTML = `
          <div class="card" style="text-align: center; padding: 60px 30px;">
            <i class="fas fa-user-cog" style="font-size: 3rem; color: #2563eb; margin-bottom: 16px;"></i>
            <h2>My Profile</h2>
            <p style="color: #64748b; margin: 12px 0;">Profile settings and personal information.</p>
            <div style="text-align: left; max-width: 400px; margin: 20px auto;">
              <p><strong>Name:</strong> Mr. Michael Chen</p>
              <p><strong>Email:</strong> michael.chen@smartschool.edu</p>
              <p><strong>Subjects:</strong> Mathematics, Algebra, Geometry</p>
              <p><strong>Classes:</strong> Grade 5-8</p>
            </div>
          </div>
        `;
      }
    }

    // Update page title
    if (pageTitle) {
      pageTitle.textContent = sectionTitles[sectionName] || 'Dashboard';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // ----- Quick Action Buttons -----
  quickActionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
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

  // ----- File Upload Display Name -----
  const setupFileUpload = (fileInputId, fileNameSpanId) => {
    const fileInput = document.getElementById(fileInputId);
    const fileNameSpan = document.getElementById(fileNameSpanId);
    if (fileInput && fileNameSpan) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          fileNameSpan.textContent = fileInput.files[0].name;
        } else {
          fileNameSpan.textContent = 'No file chosen';
        }
      });
    }
  };

  setupFileUpload('resultFile', 'resultFileName');
  setupFileUpload('attendanceFile', 'attendanceFileName');

  // ----- Form Submission Handlers -----
  const handleFormSubmit = (formId, successId) => {
    const form = document.getElementById(formId);
    const successMsg = document.getElementById(successId);
    if (form && successMsg) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simple validation check
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputs.forEach(input => {
          if (!input.value) {
            isValid = false;
            input.style.borderColor = '#ef4444';
          } else {
            input.style.borderColor = '#e2e8f0';
          }
        });

        if (isValid) {
          successMsg.classList.add('show');
          form.reset();
          // Reset file names
          const fileSpans = form.querySelectorAll('.file-name');
          fileSpans.forEach(span => span.textContent = 'No file chosen');
          
          // Hide success after 4 seconds
          setTimeout(() => {
            successMsg.classList.remove('show');
          }, 4000);
        }
      });
    }
  };

  handleFormSubmit('resultForm', 'resultSuccess');
  handleFormSubmit('attendanceForm', 'attendanceSuccess');
  handleFormSubmit('performanceForm', 'performanceSuccess');

  // ----- Input Focus Reset Border -----
  document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.style.borderColor = '#2563eb';
    });
    input.addEventListener('blur', () => {
      if (!input.value && input.hasAttribute('required')) {
        input.style.borderColor = '#ef4444';
      } else {
        input.style.borderColor = '#e2e8f0';
      }
    });
  });

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
      const confirmLogout = confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        window.location.href = 'index.html';
      }
    });
  }

  console.log('Teacher Panel Dashboard initialized successfully.');
});