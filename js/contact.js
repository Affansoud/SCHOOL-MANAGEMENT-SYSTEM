// contact.js - Contact Page Interactions & Form Validation

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const contactForm = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');

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

  // ----- Form Validation & Submission -----
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const subjectError = document.getElementById('subjectError');
  const messageError = document.getElementById('messageError');

  // Helper: clear all error messages
  const clearErrors = () => {
    nameError.textContent = '';
    emailError.textContent = '';
    subjectError.textContent = '';
    messageError.textContent = '';
  };

  // Validation function
  const validateForm = () => {
    let isValid = true;
    clearErrors();

    // Name validation (at least 3 characters)
    const nameValue = nameInput.value.trim();
    if (nameValue.length < 3) {
      nameError.textContent = 'Name must be at least 3 characters.';
      isValid = false;
    }

    // Email validation (basic pattern)
    const emailValue = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
      emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    // Subject validation
    const subjectValue = subjectInput.value.trim();
    if (subjectValue.length < 3) {
      subjectError.textContent = 'Subject must be at least 3 characters.';
      isValid = false;
    }

    // Message validation
    const messageValue = messageInput.value.trim();
    if (messageValue.length < 10) {
      messageError.textContent = 'Message must be at least 10 characters.';
      isValid = false;
    }

    return isValid;
  };

  // Handle form submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload

    // Hide previous success message
    successMessage.classList.remove('show');

    if (validateForm()) {
      // Form is valid – show success message and reset form
      successMessage.classList.add('show');
      contactForm.reset();

      // Optional: Hide success message after 6 seconds
      setTimeout(() => {
        successMessage.classList.remove('show');
      }, 6000);
    }
  });

  // Optional: Real-time error clearing when user types
  [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      // Clear individual error on input
      if (input === nameInput) nameError.textContent = '';
      if (input === emailInput) emailError.textContent = '';
      if (input === subjectInput) subjectError.textContent = '';
      if (input === messageInput) messageError.textContent = '';
      // Hide success message if user starts typing again
      successMessage.classList.remove('show');
    });
  });
});