// track.js - Track Application Page Interactions & Logic

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

  const referenceInput = document.getElementById('referenceNumber');
  const referenceError = document.getElementById('referenceError');
  const trackBtn = document.getElementById('trackBtn');
  const trackResult = document.getElementById('trackResult');
  const trackFormContainer = document.getElementById('trackFormContainer');

  // ----- Navbar scroll effect -----
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ----- Sidebar functions -----
  const openSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Event listeners for sidebar
  hamburgerBtn.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar when any nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeSidebar();
    });
  });

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // ----- Dummy Application Database -----
  // Simulated data keyed by reference number
  const dummyApplications = {
    'APP-2025-1234': {
      studentName: 'Emily Johnson',
      class: 'Grade 5',
      parentName: 'Sarah Johnson',
      status: 'accepted',
      message: 'Congratulations! Your application has been accepted. You will receive login credentials via email within 48 hours. Please complete the enrollment fee payment to secure your spot.'
    },
    'APP-2025-5678': {
      studentName: 'Michael Chen',
      class: 'Grade 8',
      parentName: 'David Chen',
      status: 'accepted',
      message: 'Your application has been accepted. Welcome to SmartSchool! Please check your email for further instructions on document submission.'
    },
    'SS-2025-9012': {
      studentName: 'Sophia Williams',
      class: 'Grade 3',
      parentName: 'James Williams',
      status: 'in-progress',
      message: 'Your application is currently under review. Our admissions team is evaluating your documents. You will be notified once a decision has been made.'
    },
    'SS-2025-3456': {
      studentName: 'Daniel Brown',
      class: 'Grade 10',
      parentName: 'Lisa Brown',
      status: 'rejected',
      message: 'Unfortunately, your application has not been accepted at this time. This may be due to class capacity or incomplete documentation. Please contact our admissions office for more details.'
    }
  };

  // ----- Helper: Get application by reference number -----
  const getApplicationByReference = (reference) => {
    // Trim and convert to uppercase for consistent matching
    const cleanRef = reference.trim().toUpperCase();
    
    // Check if reference exists in dummy database
    if (dummyApplications[cleanRef]) {
      return dummyApplications[cleanRef];
    }
    
    // If reference starts with "APP" but not in database, generate a generic accepted response
    if (cleanRef.startsWith('APP')) {
      return {
        studentName: 'Applicant',
        class: 'To Be Determined',
        parentName: 'Parent/Guardian',
        status: 'accepted',
        message: 'Your application has been accepted based on the reference number provided. Please check your email for official confirmation and next steps.'
      };
    }
    
    // Default: show as pending for any other reference
    return {
      studentName: 'Applicant',
      class: 'To Be Determined',
      parentName: 'Parent/Guardian',
      status: 'pending',
      message: 'Your application is currently pending review. Our admissions team will process it shortly. Please check back later or ensure your reference number is correct.'
    };
  };

  // ----- Render Result in the track-result div -----
  const renderResult = (application, referenceNumber) => {
    const { studentName, class: studentClass, parentName, status, message } = application;

    // Determine status icon class
    let statusIconClass = '';
    let statusBadgeClass = '';
    let statusLabel = '';

    switch (status) {
      case 'accepted':
        statusIconClass = 'accepted';
        statusBadgeClass = 'accepted';
        statusLabel = 'Accepted';
        break;
      case 'rejected':
        statusIconClass = 'rejected';
        statusBadgeClass = 'rejected';
        statusLabel = 'Rejected';
        break;
      case 'in-progress':
        statusIconClass = 'in-progress';
        statusBadgeClass = 'in-progress';
        statusLabel = 'In Progress';
        break;
      default:
        statusIconClass = 'pending';
        statusBadgeClass = 'pending';
        statusLabel = 'Pending';
    }

    // Status icon based on status
    let statusIconHTML = '';
    if (status === 'accepted') {
      statusIconHTML = '<i class="fas fa-check-circle"></i>';
    } else if (status === 'rejected') {
      statusIconHTML = '<i class="fas fa-times-circle"></i>';
    } else if (status === 'in-progress') {
      statusIconHTML = '<i class="fas fa-spinner fa-spin"></i>';
    } else {
      statusIconHTML = '<i class="fas fa-clock"></i>';
    }

    const resultHTML = `
      <div class="result-card">
        <div class="status-icon ${statusIconClass}">
          ${statusIconHTML}
        </div>
        <div class="status-badge ${statusBadgeClass}">
          ${statusLabel}
        </div>
        <div class="result-details">
          <div class="result-detail-row">
            <span>Reference Number:</span>
            <span>${referenceNumber}</span>
          </div>
          <div class="result-detail-row">
            <span>Student Name:</span>
            <span>${studentName}</span>
          </div>
          <div class="result-detail-row">
            <span>Class Applied:</span>
            <span>${studentClass}</span>
          </div>
          <div class="result-detail-row">
            <span>Parent/Guardian:</span>
            <span>${parentName}</span>
          </div>
        </div>
        <div class="status-message ${statusBadgeClass}">
          <i class="fas fa-info-circle"></i> ${message}
        </div>
        <button class="btn btn-primary btn-track-again" id="trackAgainBtn">
          <i class="fas fa-redo"></i> Track Another Application
        </button>
      </div>
    `;

    trackResult.innerHTML = resultHTML;
    trackResult.classList.add('show');

    // Scroll to result
    trackResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Add event listener to "Track Another" button
    const trackAgainBtn = document.getElementById('trackAgainBtn');
    if (trackAgainBtn) {
      trackAgainBtn.addEventListener('click', resetTracking);
    }
  };

  // ----- Reset tracking to allow new search -----
  const resetTracking = () => {
    trackResult.classList.remove('show');
    trackResult.innerHTML = '';
    referenceInput.value = '';
    referenceError.textContent = '';
    // Scroll back to input
    trackFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    referenceInput.focus();
  };

  // ----- Handle Track Button Click -----
  trackBtn.addEventListener('click', () => {
    const referenceNumber = referenceInput.value.trim();

    // Clear previous error and result
    referenceError.textContent = '';
    trackResult.classList.remove('show');
    trackResult.innerHTML = '';

    // Validate input
    if (referenceNumber === '') {
      referenceError.textContent = 'Please enter a reference number.';
      referenceInput.focus();
      return;
    }

    if (referenceNumber.length < 6) {
      referenceError.textContent = 'Reference number seems too short. Please check and try again.';
      referenceInput.focus();
      return;
    }

    // Get application data
    const application = getApplicationByReference(referenceNumber);
    
    // Render the result
    renderResult(application, referenceNumber.toUpperCase());
  });

  // ----- Allow pressing Enter key to trigger track -----
  referenceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      trackBtn.click();
    }
  });

  // ----- Clear error on input -----
  referenceInput.addEventListener('input', () => {
    referenceError.textContent = '';
  });
});