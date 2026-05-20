// index.js - School Management System with Carousel & Gallery Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const statNumbers = document.querySelectorAll('.stat-number');

  // Carousel elements
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevArrow = document.getElementById('prevArrow');
  const nextArrow = document.getElementById('nextArrow');
  let currentSlide = 0;
  let autoSlideInterval;

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
    document.body.style.overflow = 'hidden';
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

  // Close sidebar when a navigation link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeSidebar();
    });
  });

  // Close sidebar on pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // ----- Smooth scrolling for anchor links -----
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

  // ----- Carousel Functions -----
  const showSlide = (index) => {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide and dot
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  };

  const nextSlide = () => {
    let newIndex = currentSlide + 1;
    if (newIndex >= slides.length) {
      newIndex = 0;
    }
    showSlide(newIndex);
  };

  const prevSlide = () => {
    let newIndex = currentSlide - 1;
    if (newIndex < 0) {
      newIndex = slides.length - 1;
    }
    showSlide(newIndex);
  };

  const startAutoSlide = () => {
    autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
  };

  // Event listeners for carousel
  if (prevArrow) {
    prevArrow.addEventListener('click', () => {
      prevSlide();
      stopAutoSlide();
      startAutoSlide(); // Restart timer after manual navigation
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', () => {
      nextSlide();
      stopAutoSlide();
      startAutoSlide();
    });
  }

  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener('click', function() {
      const slideIndex = parseInt(this.getAttribute('data-slide'));
      showSlide(slideIndex);
      stopAutoSlide();
      startAutoSlide();
    });
  });

  // Pause auto-slide when hovering over hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoSlide);
    heroSection.addEventListener('mouseleave', startAutoSlide);
  }

  // Start auto-slide
  startAutoSlide();

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

  // ----- Scroll-triggered card animations -----
  const animatedElements = document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .stat-item, .gallery-item');
  
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

  // ----- Gallery Image Click to Enlarge (Simple Lightbox Effect) -----
  const galleryImages = document.querySelectorAll('.gallery-item img');
  galleryImages.forEach(img => {
    img.addEventListener('click', function() {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
      `;

      // Create enlarged image
      const enlargedImg = document.createElement('img');
      enlargedImg.src = this.src;
      enlargedImg.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: zoomIn 0.3s ease;
      `;

      overlay.appendChild(enlargedImg);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      // Close on click
      overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 200);
      });

      // Close on Escape key
      const closeOnEscape = (e) => {
        if (e.key === 'Escape') {
          overlay.remove();
          document.body.style.overflow = '';
          document.removeEventListener('keydown', closeOnEscape);
        }
      };
      document.addEventListener('keydown', closeOnEscape);
    });
  });

  console.log('SmartSchool Homepage with Carousel & Gallery initialized successfully.');
});