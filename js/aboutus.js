// about.js - About Us Page Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Element References -----
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const statNumbers = document.querySelectorAll('.stat-number');

  // ----- Navbar scroll effect: transparent to solid background -----
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ----- Sidebar open/close functions -----
  const openSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Event: Hamburger button opens sidebar
  hamburgerBtn.addEventListener('click', openSidebar);

  // Event: Close button inside sidebar
  closeSidebarBtn.addEventListener('click', closeSidebar);

  // Event: Click on dark overlay closes sidebar
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Event: Close sidebar when any navigation link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeSidebar();
      // For same-page anchor links, smooth scroll is handled separately
    });
  });

  // Event: Press Escape key to close sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // ----- Smooth scrolling for internal anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ----- Animated Counters for Statistics Section -----
  const animateCounters = () => {
    statNumbers.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1800; // milliseconds
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(() => setTimeout(updateCounter, stepTime));
        } else {
          counter.textContent = target;
        }
      };
      updateCounter();
    });
  };

  // Use Intersection Observer to trigger counters when stats section is visible
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
  }

  // ----- Scroll-triggered reveal animations for cards -----
  const animatedElements = document.querySelectorAll('.feature-card, .mv-card, .benefit-card, .stat-item, .about-image');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15 });

  animatedElements.forEach(el => {
    // Set initial hidden state for animation
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  // Immediately reveal elements that are already in view on load
  window.addEventListener('load', () => {
    animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  });
});