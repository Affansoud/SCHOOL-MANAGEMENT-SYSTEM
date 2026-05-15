// application.js - Admission Application Page Interactions & Validation

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  
  const applicationForm = document.getElementById('applicationForm');
  const successMessage = document.getElementById('successMessage');
  const referenceNumberSpan = document.getElementById('referenceNumber');
  const newApplicationBtn = document.getElementById('newApplicationBtn');

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

  // ----- Form Input References -----
  const studentNameInput = document.getElementById('studentName');
  const studentAgeInput = document.getElementById('studentAge');
  const genderInput = document.getElementById('gender');
  const classApplyingInput = document.getElementById('classApplying');
  const parentNameInput = document.getElementById('parentName');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const emailInput = document.getElementById('email');
  const addressInput = document.getElementById('address');

  // Error message elements
  const studentNameError = document.getElementById('studentNameError');
  const studentAgeError = document.getElementById('studentAgeError');
  const genderError = document.getElementById('genderError');
  const classApplyingError = document.getElementById('classApplyingError');
  const parentNameError = document.getElementById('parentNameError');
  const phoneNumberError = document.getElementById('phoneNumberError');
  const emailError = document.getElementById('emailError');
  const addressError = document.getElementById('addressError');

  // ----- Helper: Clear all error messages -----
  const clearAllErrors = () => {
    studentNameError.textContent = '';
    studentAgeError.textContent = '';
    genderError.textContent = '';
    classApplyingError.textContent = '';
    parentNameError.textContent = '';
    phoneNumberError.textContent = '';
    emailError.textContent = '';
    addressError.textContent = '';
  };

  // ----- Generate a fake reference number -----
  const generateReferenceNumber = () => {
    const prefix = 'SS';
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `${prefix}-${year}-${randomDigits}`;
  };

  // ----- Form Validation Function -----
  const validateForm = () => {
    let isValid = true;
    clearAllErrors();

    // Student Name validation (minimum 3 characters)
    const studentName = studentNameInput.value.trim();
    if (studentName.length < 3) {
      studentNameError.textContent = 'Student name must be at least 3 characters.';
      isValid = false;
    }

    // Student Age validation (between 3 and 25)
    const studentAge = parseInt(studentAgeInput.value, 10);
    if (isNaN(studentAge) || studentAge < 3 || studentAge > 25) {
      studentAgeError.textContent = 'Please enter a valid age between 3 and 25.';
      isValid = false;
    }

    // Gender validation
    if (genderInput.value === '') {
      genderError.textContent = 'Please select a gender.';
      isValid = false;
    }

    // Class Applying For validation
    if (classApplyingInput.value === '') {
      classApplyingError.textContent = 'Please select a class.';
      isValid = false;
    }

    // Parent Name validation (minimum 3 characters)
    const parentName = parentNameInput.value.trim();
    if (parentName.length < 3) {
      parentNameError.textContent = 'Parent name must be at least 3 characters.';
      isValid = false;
    }

    // Phone Number validation (basic numeric check, minimum 7 digits)
    const phoneNumber = phoneNumberInput.value.trim();
    const phonePattern = /^[0-9+\-\s()]{7,}$/;
    if (!phonePattern.test(phoneNumber)) {
      phoneNumberError.textContent = 'Please enter a valid phone number (at least 7 digits).';
      isValid = false;
    }

    // Email validation
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    // Address validation (minimum 10 characters)
    const address = addressInput.value.trim();
    if (address.length < 10) {
      addressError.textContent = 'Please enter a complete address (at least 10 characters).';
      isValid = false;
    }

    return isValid;
  };

  // ----- Handle Form Submission -----
  applicationForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload

    // Hide success message if visible from previous submission
    successMessage.classList.remove('show');

    if (validateForm()) {
      // Generate reference number
      const refNumber = generateReferenceNumber();
      referenceNumberSpan.textContent = refNumber;

      // Hide the form fields (optional: keep form visible but disable)
      // We'll keep the form visible but show success message above submit button area
      successMessage.classList.add('show');

      // Reset the form fields
      applicationForm.reset();

      // Scroll to success message smoothly
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // ----- "Submit Another Application" button -----
  newApplicationBtn.addEventListener('click', () => {
    // Hide success message
    successMessage.classList.remove('show');
    // Reset form (already reset, but just in case)
    applicationForm.reset();
    clearAllErrors();
    // Scroll to top of form
    applicationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ----- Real-time error clearing on input -----
  const allInputs = [
    { input: studentNameInput, error: studentNameError },
    { input: studentAgeInput, error: studentAgeError },
    { input: genderInput, error: genderError },
    { input: classApplyingInput, error: classApplyingError },
    { input: parentNameInput, error: parentNameError },
    { input: phoneNumberInput, error: phoneNumberError },
    { input: emailInput, error: emailError },
    { input: addressInput, error: addressError }
  ];

  allInputs.forEach(({ input, error }) => {
    input.addEventListener('input', () => {
      error.textContent = '';
    });
    input.addEventListener('change', () => {
      error.textContent = '';
    });
  });

  // Hide success message if user starts typing again
  const hideSuccessOnInput = () => {
    if (successMessage.classList.contains('show')) {
      successMessage.classList.remove('show');
    }
  };

  studentNameInput.addEventListener('input', hideSuccessOnInput);
  studentAgeInput.addEventListener('input', hideSuccessOnInput);
  genderInput.addEventListener('change', hideSuccessOnInput);
  classApplyingInput.addEventListener('change', hideSuccessOnInput);
  parentNameInput.addEventListener('input', hideSuccessOnInput);
  phoneNumberInput.addEventListener('input', hideSuccessOnInput);
  emailInput.addEventListener('input', hideSuccessOnInput);
  addressInput.addEventListener('input', hideSuccessOnInput);
});