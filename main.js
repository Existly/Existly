/**
 * EXISTLY CORE INTERACTIONS & ANIMATIONS
 * Description: Main client-side script for Existly.
 * Features: Mobile menu, accordions, dynamic filters, form validation, 
 *           scroll-triggered animations, and sticky header.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('remove-green-chromakey')) {
    const svgDiv = document.createElement('div');
    svgDiv.innerHTML = `
      <svg width="0" height="0" style="position: absolute;">
        <defs>
          <filter id="remove-green-chromakey" color-interpolation-filters="sRGB">
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              1.5 -3 1.5 1 0
            "/>
          </filter>
        </defs>
      </svg>
    `;
    document.body.appendChild(svgDiv);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initFAQAccordion();
  initScrollAnimations();
  initSubpageFilters();
  initContactForm();
  initTestimonialSlider();
  initUpworkSlider();
});

/**
 * 1. Sticky Header scroll effect
 */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check
}

/**
 * 2. Mobile menu slide-out & Dropdowns
 */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const dropdownToggle = document.querySelector('.nav-item-dropdown > .nav-link');
  const dropdownParent = document.querySelector('.nav-item-dropdown');
  const langToggle = document.querySelector('.lang-toggle-btn');
  const langParent = document.querySelector('.lang-dropdown-wrapper');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    // Close menu when clicking a link (non-dropdown links)
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Handle dropdown toggle on click for all screen sizes
  const dropdowns = document.querySelectorAll('.nav-item-dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-link');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other dropdowns
        dropdowns.forEach(other => {
          if (other !== dropdown) other.classList.remove('active');
        });
        if (langParent) langParent.classList.remove('active');
        
        dropdown.classList.toggle('active');
      });
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });

  // Handle language selector toggle on click (for mobile/touch accessibility)
  if (langToggle && langParent) {
    langToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      langParent.classList.toggle('active');
      // Close dropdowns if open
      dropdowns.forEach(d => d.classList.remove('active'));
    });

    document.addEventListener('click', (e) => {
      if (!langParent.contains(e.target)) {
        langParent.classList.remove('active');
      }
    });
  }
}

/**
 * 3. FAQ Accordion (Homepage)
 */
function initFAQAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const box = header.parentElement;
      const body = box.querySelector('.faq-body');
      const isActive = box.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item-box').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-body').style.maxHeight = null;
      });

      if (!isActive) {
        box.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 4. Intersection Observer for Scroll Animations
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      observer.observe(el);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    animatedElements.forEach(el => {
      el.classList.add('visible');
    });
  }
}

/**
 * 5. Dynamic Subpage Navigation Filters
 * Smoothly scrolls to section when filter button is clicked,
 * and highlights active filter based on current scroll position.
 */
function initSubpageFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sections = Array.from(filterBtns)
    .map(btn => document.querySelector(btn.getAttribute('data-target')))
    .filter(sec => sec !== null);

  if (filterBtns.length === 0) return;

  // Click handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offset = 100; // Header height offset
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Set active immediately
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Scroll active state synchronizer
  const scrollSpy = () => {
    const scrollPosition = window.scrollY + 120; // offset

    sections.forEach((section, index) => {
      if (section) {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (scrollPosition >= top && scrollPosition < bottom) {
          filterBtns.forEach(btn => btn.classList.remove('active'));
          // Find button matching this section
          const targetBtn = Array.from(filterBtns).find(btn => btn.getAttribute('data-target') === `#${section.id}`);
          if (targetBtn) {
            targetBtn.classList.add('active');
          }
        }
      }
    });
  };

  window.addEventListener('scroll', scrollSpy);
  scrollSpy(); // Initial call
}

/**
 * 6. Contact Form Validation and Mock Submission
 */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset errors
    const formErrors = contactForm.querySelectorAll('.form-error');
    formErrors.forEach(err => err.remove());

    let hasError = false;

    // Required fields check
    const requiredInputs = contactForm.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        showError(input, `${getLabelText(input)} is required`);
        hasError = true;
      } else if (input.type === 'email' && !validateEmail(input.value)) {
        showError(input, 'Please enter a valid email address');
        hasError = true;
      }
    });

    if (hasError) return;

    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50" style="width: 20px; height: 20px; animation: rotate 2s linear infinite; margin-right: 8px;">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
      </svg>
      Sending...
    `;

    // Build payload
    const phoneInput = contactForm.querySelector('input[name="phone"]');
    let fullPhone = phoneInput.value;
    if (window.intlTelInputGlobals) {
      const iti = window.intlTelInputGlobals.getInstance(phoneInput);
      if (iti) fullPhone = iti.getNumber();
    }

    const formData = {
      firstName: contactForm.querySelector('input[name="firstName"]').value,
      lastName: contactForm.querySelector('input[name="lastName"]').value,
      email: contactForm.querySelector('input[name="email"]').value,
      phone: fullPhone,
      subject: contactForm.querySelector('input[name="subject"]').value,
      message: contactForm.querySelector('textarea[name="message"]').value
    };

    // Send API request
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      if (data.error) {
        alert(data.error);
      } else {
        showSuccessModal(formData.firstName);
        contactForm.reset();
      }
    })
    .catch(err => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      alert("Something went wrong. Please try again later.");
    });
  });
}

// Helper to show inline errors
function showError(input, message) {
  input.classList.add('input-invalid');
  const errorMsg = document.createElement('span');
  errorMsg.className = 'form-error';
  errorMsg.style.color = '#ef4444';
  errorMsg.style.fontSize = '0.8rem';
  errorMsg.style.marginTop = '4px';
  errorMsg.style.display = 'block';
  errorMsg.innerText = message;
  
  if (input.parentElement.classList.contains('phone-input-wrapper')) {
    input.parentElement.parentElement.appendChild(errorMsg);
  } else {
    input.parentElement.appendChild(errorMsg);
  }

  // Clear error state on focus
  input.addEventListener('focus', function clearError() {
    input.classList.remove('input-invalid');
    errorMsg.remove();
    input.removeEventListener('focus', clearError);
  });
}

function getLabelText(input) {
  const label = input.parentElement.querySelector('.form-label');
  return label ? label.innerText.replace('*', '').trim() : 'This field';
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Success Alert Modal
function showSuccessModal(name) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(15, 23, 42, 0.7)';
  modal.style.backdropFilter = 'blur(8px)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '2000';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.3s ease';

  modal.innerHTML = `
    <div style="background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 450px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.25); transform: translateY(-30px); transition: transform 0.3s ease;">
      <div style="width: 60px; height: 60px; border-radius: 50%; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h3 style="font-size: 1.75rem; color: #0F172A; margin-bottom: 12px; font-family: 'Outfit', sans-serif;">Thank You, ${name}!</h3>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">Your message has been sent successfully. An Existly consultant will review your inquiry and get back to you within 24 hours.</p>
      <button class="btn btn-primary" id="closeSuccessModal" style="width: 100%;">Got it, thanks!</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animations
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.querySelector('div').style.transform = 'translateY(0)';
  }, 50);

  const closeModal = () => {
    modal.style.opacity = '0';
    modal.querySelector('div').style.transform = 'translateY(-30px)';
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  modal.querySelector('#closeSuccessModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// Add CSS keyframes for spinner and scroll animations to body
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes rotate { 100% { transform: rotate(360deg); } }
  @keyframes dash {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
  }
  .no-scroll { overflow: hidden; }
  .input-invalid { border-color: #ef4444 !important; }
  
  /* Scroll Animation Classes */
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(25px);
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .animate-on-scroll.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .delay-100 { transition-delay: 100ms; }
  .delay-200 { transition-delay: 200ms; }
  .delay-300 { transition-delay: 300ms; }
  .delay-400 { transition-delay: 400ms; }
  .delay-500 { transition-delay: 500ms; }
`;
document.head.appendChild(styleSheet);

/**
 * 7. Testimonial Slider Interaction
 */
function initTestimonialSlider() {
  const container = document.querySelector('.testimonial-slider-container');
  if (!container) return;

  const dots = container.querySelectorAll('.avatar-dot');
  const slides = container.querySelectorAll('.testimonial-slide');
  const prevBtn = container.querySelector('.prev-btn');
  const nextBtn = container.querySelector('.next-btn');
  let currentIndex = 0;

  function showSlide(index) {
    if (index < 0) {
      index = slides.length - 1;
    } else if (index >= slides.length) {
      index = 0;
    }
    currentIndex = index;

    // Update active slide
    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update active avatar and position them in a 3D rotating ring
    dots.forEach((dot, i) => {
      const rel = (i - currentIndex + 4) % 4;
      let tx = 0;
      let ty = 0;
      let scale = 1;
      let zIndex = 1;
      let opacity = 0.5;

      if (rel === 0) {
        // Active Center (Front & Low)
        tx = 0;
        ty = 20;
        scale = 1.35;
        zIndex = 10;
        opacity = 1;
        dot.classList.add('active');
      } else if (rel === 1) {
        // Right (Medium height & size)
        tx = 95;
        ty = 0;
        scale = 0.95;
        zIndex = 5;
        opacity = 0.6;
        dot.classList.remove('active');
      } else if (rel === 2) {
        // Back (High, centered & small)
        tx = 0;
        ty = -20;
        scale = 0.75;
        zIndex = 2;
        opacity = 0.35;
        dot.classList.remove('active');
      } else if (rel === 3) {
        // Left (Medium height & size)
        tx = -95;
        ty = 0;
        scale = 0.95;
        zIndex = 5;
        opacity = 0.6;
        dot.classList.remove('active');
      }

      dot.style.transform = `translateX(${tx}px) translateY(${ty}px) scale(${scale})`;
      dot.style.zIndex = zIndex;
      dot.style.opacity = opacity;
    });
  }

  // Click on dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(index);
    });
  });

  // Prev / Next button clicks
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentIndex + 1);
    });
  }

  // Initialize
  showSlide(0);
}

/**
 * 8. Upwork Reviews Slider
 */
function initUpworkSlider() {
  const container = document.querySelector('.upwork-slider-wrapper');
  if (!container) return;

  const track = container.querySelector('.upwork-slider-track');
  const originalCards = Array.from(container.querySelectorAll('.upwork-card'));
  const prevBtn = container.querySelector('.prev-btn');
  const nextBtn = container.querySelector('.next-btn');
  if (!track || originalCards.length === 0 || !prevBtn || !nextBtn) return;

  const originalLength = originalCards.length;
  const cloneCount = 3;

  // Clone first 3 cards and append to end
  for (let i = 0; i < cloneCount; i++) {
    const clone = originalCards[i].cloneNode(true);
    clone.classList.add('cloned');
    clone.classList.remove('animate-on-scroll', 'delay-100', 'delay-200');
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    track.appendChild(clone);
  }

  // Clone last 3 cards and prepend to start
  for (let i = originalLength - 1; i >= originalLength - cloneCount; i--) {
    const clone = originalCards[i].cloneNode(true);
    clone.classList.add('cloned');
    clone.classList.remove('animate-on-scroll', 'delay-100', 'delay-200');
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    track.insertBefore(clone, track.firstChild);
  }

  let currentIndex = cloneCount;
  let isTransitioning = false;

  function getCardsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function updateSlider(animate = true) {
    const cardsPerView = getCardsPerView();
    if (window.innerWidth <= 768) {
      track.style.transform = '';
      track.style.transition = '';
      return;
    }

    if (animate) {
      track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      track.style.transition = 'none';
    }

    const gap = 24;
    const containerWidth = track.parentElement.getBoundingClientRect().width;
    const cardWidth = (containerWidth - (gap * (cardsPerView - 1))) / cardsPerView;
    const moveDistance = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${moveDistance}px)`;
  }

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    const cardsPerView = getCardsPerView();
    if (window.innerWidth <= 768) return;

    if (currentIndex >= originalLength + cloneCount) {
      currentIndex -= originalLength;
      updateSlider(false);
    } else if (currentIndex < cloneCount) {
      currentIndex += originalLength;
      updateSlider(false);
    }
  });

  function nextSlide() {
    if (isTransitioning) return;
    if (window.innerWidth <= 768) return;
    const cardsPerView = getCardsPerView();
    isTransitioning = true;
    currentIndex = Math.min(currentIndex + cardsPerView, originalLength + 2 * cloneCount - cardsPerView);
    updateSlider(true);
  }

  function prevSlide() {
    if (isTransitioning) return;
    if (window.innerWidth <= 768) return;
    const cardsPerView = getCardsPerView();
    isTransitioning = true;
    currentIndex = Math.max(currentIndex - cardsPerView, 0);
    updateSlider(true);
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Keep index sane on resize
      const cardsPerView = getCardsPerView();
      if (currentIndex < cloneCount) {
        currentIndex = cloneCount;
      } else {
        const maxIndex = originalLength + 2 * cloneCount - cardsPerView;
        if (currentIndex > maxIndex) {
          currentIndex = maxIndex;
        }
      }
      updateSlider(false);
    }, 100);
  });

  updateSlider(false);
}

// --- Global Form Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const formPhones = document.querySelectorAll('#phone, #form-phone');
  if (typeof window.intlTelInput !== 'undefined') {
    formPhones.forEach(phoneInput => {
      window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        dropdownContainer: document.body,
        geoIpLookup: function(callback) {
          fetch("https://ipapi.co/json")
            .then(function(res) { return res.json(); })
            .then(function(data) { callback(data.country_code); })
            .catch(function() { callback("us"); });
        },
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.4/build/js/utils.js"
      });
    });
  }
});

// --- Chatbot Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const chatToggleBtn = document.getElementById('chat-toggle-btn');
  const chatWindow = document.getElementById('chat-window');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatFloatingPrompt = document.getElementById('chat-floating-prompt');
  
  const chatTextArea = document.getElementById('chat-text-area');
  const chatPhoneArea = document.getElementById('chat-phone-area');
  const chatPhoneInput = document.getElementById('chat-phone-input');
  const sendPhoneBtn = document.getElementById('send-phone-btn');
  
  let iti;
  if (typeof window.intlTelInput !== 'undefined' && chatPhoneInput) {
    iti = window.intlTelInput(chatPhoneInput, {
      initialCountry: "auto",
      dropdownContainer: document.body,
      geoIpLookup: function(callback) {
        fetch("https://ipapi.co/json")
          .then(function(res) { return res.json(); })
          .then(function(data) { callback(data.country_code); })
          .catch(function() { callback("us"); });
      },
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.4/build/js/utils.js"
    });
  }

  if (!chatToggleBtn) return; // Ensure element exists on page

  let chatHistory = [];

  // Append a message to the UI
  function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role === 'user' ? 'user-message' : 'ai-message');
    
    // Simple parsing: Newlines to <br> and Markdown Links to styled <a> tags
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="chat-inline-btn" target="_blank">$1</a>');

    msgDiv.innerHTML = `<div class="message-content">${formattedText}</div>`;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Load history from sessionStorage (Persists during navigation, clears when tab is closed)
  try {
    const savedStateStr = sessionStorage.getItem('existly_chat_history');
    if (savedStateStr) {
      chatHistory = JSON.parse(savedStateStr);
      chatHistory.forEach(msg => appendMessage(msg.role, msg.content));
    }
  } catch (e) {
    console.error("Failed to load chat history", e);
  }

  // Toggle Chat
  chatToggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    
    // Hide the floating prompt permanently when interacted with
    if (chatFloatingPrompt) {
      chatFloatingPrompt.classList.add('hidden');
    }

    if (!chatWindow.classList.contains('hidden')) {
      chatInput.focus();
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  closeChatBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  // Show/Hide typing indicator
  function toggleTypingIndicator(show) {
    if (show) {
      const typingDiv = document.createElement('div');
      typingDiv.id = 'typing-indicator';
      typingDiv.classList.add('typing-indicator');
      typingDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      const typingDiv = document.getElementById('typing-indicator');
      if (typingDiv) {
        typingDiv.remove();
      }
    }
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // UI Updates
    appendMessage('user', text);
    chatInput.value = '';
    toggleTypingIndicator(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory, message: text })
      });

      const data = await response.json();
      
      toggleTypingIndicator(false);

      if (data.reply) {
        let aiReply = data.reply;
        
        // Check for phone input flag
        if (aiReply.includes('[PHONE_INPUT]')) {
          aiReply = aiReply.replace('[PHONE_INPUT]', '').trim();
          chatTextArea.classList.add('hidden');
          chatPhoneArea.classList.remove('hidden');
          chatPhoneInput.focus();
        }

        appendMessage('ai', aiReply);
        // Update history for next request and save to sessionStorage
        chatHistory.push({ role: 'user', content: text });
        chatHistory.push({ role: 'ai', content: aiReply });
        sessionStorage.setItem('existly_chat_history', JSON.stringify(chatHistory));
      } else {
        appendMessage('ai', "Sorry, I'm having trouble connecting right now.");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toggleTypingIndicator(false);
      appendMessage('ai', "Sorry, an error occurred. Please try again later.");
    }
  }

  sendChatBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Handle Custom Phone Submit
  sendPhoneBtn.addEventListener('click', () => {
    let phone = chatPhoneInput.value.trim();
    if (!phone) return;
    
    if (iti) {
      phone = iti.getNumber();
    }
    
    // Switch UI back
    chatPhoneArea.classList.add('hidden');
    chatTextArea.classList.remove('hidden');
    
    // Put the combined string into the normal chat input and send
    chatInput.value = phone;
    sendMessage();
    chatPhoneInput.value = ''; // clear for next time
  });
  
  chatPhoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendPhoneBtn.click();
  });
});
