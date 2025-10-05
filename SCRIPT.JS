/* ===========================
   MAIN JAVASCRIPT
   Estate Nest Inc
   =========================== */

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });
});

/* ===========================
   MOBILE MENU
   =========================== */
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
        this.setAttribute('aria-expanded', 
            this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        
        // Animate hamburger
        const spans = this.querySelectorAll('span');
        if (this.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
}

/* ===========================
   SCROLL ANIMATIONS
   =========================== */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all scroll-animate elements
document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el);
});

/* ===========================
   HEADER SCROLL EFFECT
   =========================== */
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 16px rgba(26, 77, 46, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(26, 77, 46, 0.1)';
    }
    
    lastScroll = currentScroll;
});

/* ===========================
   CODE ACCORDION
   =========================== */
const codeHeaders = document.querySelectorAll('.code-header');

codeHeaders.forEach(header => {
    header.addEventListener('click', function() {
        const codeBlock = this.parentElement;
        const isActive = codeBlock.classList.contains('active');
        
        // Close all code blocks
        document.querySelectorAll('.code-block').forEach(block => {
            block.classList.remove('active');
        });
        
        // Open clicked block if it wasn't active
        if (!isActive) {
            codeBlock.classList.add('active');
        }
    });
});

/* ===========================
   DATE INPUT RESTRICTIONS
   =========================== */
const dateInput = document.getElementById('preferredDate');
if (dateInput) {
    // Set minimum date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', `${year}-${month}-${day}`);
    
    // Set maximum date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxYear = maxDate.getFullYear();
    const maxMonth = String(maxDate.getMonth() + 1).padStart(2, '0');
    const maxDay = String(maxDate.getDate()).padStart(2, '0');
    dateInput.setAttribute('max', `${maxYear}-${maxMonth}-${maxDay}`);
}

/* ===========================
   DYNAMIC YEAR IN FOOTER
   =========================== */
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    const currentYear = new Date().getFullYear();
    footerYear.innerHTML = `&copy; ${currentYear} Estate Nest Inc. All rights reserved. | E&O Insurance in Force`;
}

/* ===========================
   PERFORMANCE OPTIMIZATION
   =========================== */

// Lazy load images
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Preload critical resources
function preloadResources() {
    const resources = [
        { href: 'https://fonts.googleapis.com', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
    ];
    
    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.type) link.type = resource.type;
        if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
        document.head.appendChild(link);
    });
}

preloadResources();

/* ===========================
   ACCESSIBILITY ENHANCEMENTS
   =========================== */

// Keyboard navigation for custom elements
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.focus();
        }
    }
});

// Announce page changes to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/* ===========================
   GOOGLE ANALYTICS (Optional)
   =========================== */
function initializeAnalytics() {
    // Google Analytics 4
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA4 ID
    
    // Track form submissions
    document.getElementById('leadForm')?.addEventListener('submit', function() {
        gtag('event', 'form_submission', {
            'event_category': 'engagement',
            'event_label': 'appointment_request'
        });
    });
    
    // Track calculator usage
    document.querySelectorAll('.calc-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            gtag('event', 'calculator_use', {
                'event_category': 'engagement',
                'event_label': this.getAttribute('data-calc')
            });
        });
    });
}

// Uncomment to enable analytics
// initializeAnalytics();

/* ===========================
   CONSOLE BRANDING
   =========================== */
console.log('%c Estate Nest Inc ', 'background: linear-gradient(135deg, #1a4d2e 0%, #4f7942 50%, #d4af37 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px; font-weight: bold;');
console.log('%c 🏠 Protecting What Matters Most ', 'color: #4f7942; font-size: 14px; font-weight: bold;');
console.log('%c 🔒 Secured with SSL & McAfee Protection ', 'color: #1a4d2e; font-size: 12px;');
console.log('%c 📞 780-860-3191 | hello@estatenest.ca ', 'color: #d4af37; font-size: 12px;');

/* ===========================
   ERROR HANDLING
   =========================== */
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.message, 'at', e.filename, ':', e.lineno);
    // In production, send to error tracking service
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    // In production, send to error tracking service
});

console.log('✅ Main JavaScript loaded successfully');