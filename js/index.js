// index.js - School Management System Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const statNumbers = document.querySelectorAll('.stat-number');

  // ----- Navbar scroll effect: transparent -> solid -----
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ----- Sidebar toggle functions -----
  const openSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Hamburger button opens sidebar
  hamburgerBtn.addEventListener('click', openSidebar);

  // Close button inside sidebar
  closeSidebarBtn.addEventListener('click', closeSidebar);

  // Click on overlay closes sidebar
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar when a navigation link is clicked (smooth scroll then close)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Allow default anchor behavior for internal links
      closeSidebar();
      // Optional: smooth scroll handled by CSS scroll-behavior or manually if needed
    });
  });

  // Close sidebar on pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // ----- Smooth scrolling for anchor links (additional safety) -----
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

  // ----- Animated counters for Statistics Section -----
  const animateCounters = () => {
    statNumbers.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1800; // ms
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

  // Intersection Observer to trigger counter animation when stats section is visible
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  }

  // ----- Scroll-triggered card animations (simple fade-up class toggling) -----
  const animatedElements = document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .stat-item');
  
  const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15 });

  animatedElements.forEach(el => {
    // Initial hidden state for animation
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scrollRevealObserver.observe(el);
  });

  // Make sure elements that are already visible get revealed immediately
  window.addEventListener('load', () => {
    animatedElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  });
});