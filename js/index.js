// index.js - School Management System with Carousel & Gallery Interactions

document.addEventListener('DOMContentLoaded', () => {
  // ==================== DOM ELEMENTS ====================
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
  const slideDuration = 5000; // 5 seconds per slide

  // ==================== NAVBAR SCROLL EFFECT ====================
  const handleNavbarScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll(); // Initial check

  // ==================== SIDEBAR TOGGLE ====================
  const openSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '17px'; // Prevent layout shift
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openSidebar();
  });

  closeSidebarBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar when a navigation link is clicked
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

  // ==================== SMOOTH SCROLLING ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==================== CAROUSEL FUNCTIONS ====================
  const showSlide = (index) => {
    // Handle edge cases
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide and dot
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  };

  const nextSlide = () => {
    showSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    showSlide(currentSlide - 1);
  };

  const startAutoSlide = () => {
    stopAutoSlide(); // Clear any existing interval
    autoSlideInterval = setInterval(nextSlide, slideDuration);
  };

  const stopAutoSlide = () => {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  };

  // Arrow navigation
  if (prevArrow) {
    prevArrow.addEventListener('click', () => {
      prevSlide();
      startAutoSlide(); // Restart timer
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', () => {
      nextSlide();
      startAutoSlide();
    });
  }

  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener('click', function() {
      const slideIndex = parseInt(this.getAttribute('data-slide'));
      showSlide(slideIndex);
      startAutoSlide();
    });
  });

  // Pause auto-slide when hovering over hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoSlide);
    heroSection.addEventListener('mouseleave', startAutoSlide);
    
    // Pause when hovering over arrows
    if (prevArrow) {
      prevArrow.addEventListener('mouseenter', stopAutoSlide);
      prevArrow.addEventListener('mouseleave', startAutoSlide);
    }
    if (nextArrow) {
      nextArrow.addEventListener('mouseenter', stopAutoSlide);
      nextArrow.addEventListener('mouseleave', startAutoSlide);
    }
  }

  // Keyboard navigation for carousel
  document.addEventListener('keydown', (e) => {
    // Only if sidebar is closed
    if (!sidebar.classList.contains('active')) {
      if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoSlide();
      }
    }
  });

  // Start auto-slide
  startAutoSlide();

  // ==================== ANIMATED COUNTERS ====================
  const animateCounters = () => {
    statNumbers.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000; // Animation duration in ms
      const startTime = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(target * easeOutQuart);
        
        counter.textContent = currentValue;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      
      requestAnimationFrame(updateCounter);
    });
  };

  // Intersection Observer for counter animation
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    let countersAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          animateCounters();
          countersAnimated = true;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

  // ==================== SCROLL REVEAL ANIMATIONS ====================
  const animatedElements = document.querySelectorAll(
    '.feature-card, .step-card, .testimonial-card, .stat-item, .gallery-item, .why-us-image'
  );
  
  const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => {
    // Set initial hidden state
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px) scale(0.95)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    scrollRevealObserver.observe(el);
  });

  // Reveal elements already in view on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';
        }
      });
    }, 100);
  });

  // ==================== GALLERY LIGHTBOX ====================
  const galleryImages = document.querySelectorAll('.gallery-item');
  
  galleryImages.forEach(item => {
    item.addEventListener('click', function() {
      const img = this.querySelector('img');
      const caption = this.querySelector('.gallery-caption');
      
      // Create lightbox overlay
      const overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
        padding: 20px;
      `;

      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        text-align: center;
        animation: zoomIn 0.4s ease;
      `;

      // Create enlarged image
      const enlargedImg = document.createElement('img');
      enlargedImg.src = img.src;
      enlargedImg.alt = img.alt;
      enlargedImg.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      `;

      // Create caption
      if (caption) {
        const captionClone = caption.cloneNode(true);
        captionClone.style.cssText = `
          color: white;
          margin-top: 20px;
          text-align: center;
        `;
        imageContainer.appendChild(enlargedImg);
        imageContainer.appendChild(captionClone);
      } else {
        imageContainer.appendChild(enlargedImg);
      }

      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.5);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        z-index: 10000;
      `;
      
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.4)';
        closeBtn.style.transform = 'scale(1.1)';
      });
      
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        closeBtn.style.transform = 'scale(1)';
      });

      overlay.appendChild(closeBtn);
      overlay.appendChild(imageContainer);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      // Close functions
      const closeLightbox = () => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 300);
      };

      // Click on overlay background to close
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeLightbox();
        }
      });

      // Close button click
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });

      // Escape key to close
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeLightbox();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    });
  });

  // Add lightbox animations to stylesheet
  const lightboxStyle = document.createElement('style');
  lightboxStyle.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes zoomIn {
      from { 
        opacity: 0;
        transform: scale(0.9);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }
  `;
  document.head.appendChild(lightboxStyle);

  // ==================== INITIALIZATION LOG ====================
  console.log('%c🚀 SmartSchool Management System %cInitialized Successfully', 
    'font-size: 1.2rem; font-weight: bold; color: #2563eb;', 
    'font-size: 0.9rem; color: #64748b;');
  console.log('%c📸 Image Carousel: %c4 slides rotating every 5 seconds', 'color: #2563eb;', 'color: #475569;');
  console.log('%c🖼️ Gallery: %c9 images with lightbox feature', 'color: #2563eb;', 'color: #475569;');
  console.log('%c📊 Statistics: %cAnimated counters on scroll', 'color: #2563eb;', 'color: #475569;');
  console.log('%c📱 Responsive: %cFully responsive design ready', 'color: #2563eb;', 'color: #475569;');
});