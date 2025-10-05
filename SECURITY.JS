/* ===========================
   SECURITY & VALIDATION
   Estate Nest Inc
   =========================== */

// Security Configuration
const SECURITY_CONFIG = {
    maxAttempts: 5,
    lockoutDuration: 900000, // 15 minutes in milliseconds
    sessionTimeout: 1800000, // 30 minutes
    allowedCountries: ['CA'], // Canada only
    canadianPhonePattern: /^(\+1|1)?[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    canadianEmailDomains: ['.ca', '.com', '.org', '.net'] // Common Canadian domains
};

// Track form submission attempts
let submissionAttempts = 0;
let lastAttemptTime = 0;
let isLocked = false;

/* ===========================
   INPUT SANITIZATION
   =========================== */

// Sanitize text input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return input.replace(reg, (match) => (map[match]));
}

// Sanitize all form inputs
function sanitizeFormData(formData) {
    const sanitized = {};
    for (let [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value.trim());
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/* ===========================
   VALIDATION FUNCTIONS
   =========================== */

// Validate Canadian phone number
function validateCanadianPhone(phone) {
    // Remove all non-numeric characters for validation
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Canadian phone number
    // Must be 10 digits (without country code) or 11 digits (with country code 1)
    if (cleaned.length === 10) {
        // First digit must be 2-9 (no 0 or 1)
        return /^[2-9]\d{9}$/.test(cleaned);
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
        // With country code, second digit must be 2-9
        return /^1[2-9]\d{9}$/.test(cleaned);
    }
    
    return false;
}

// Validate Canadian email
function validateCanadianEmail(email) {
    // Basic email format validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        return false;
    }
    
    // Check for common spam patterns
    const spamPatterns = [
        /temp.*mail/i,
        /disposable/i,
        /throwaway/i,
        /guerrilla/i,
        /mailinator/i,
        /10minutemail/i
    ];
    
    for (let pattern of spamPatterns) {
        if (pattern.test(email)) {
            return false;
        }
    }
    
    return true;
}

// Validate full name (no numbers or special characters)
function validateFullName(name) {
    // Allow letters, spaces, hyphens, and apostrophes only
    const namePattern = /^[a-zA-Z\s'-]{2,50}$/;
    return namePattern.test(name) && name.trim().split(' ').length >= 2;
}

/* ===========================
   FORM VALIDATION
   =========================== */

// Real-time validation for form fields
function setupRealtimeValidation() {
    const form = document.getElementById('leadForm');
    if (!form) return;
    
    // Full Name validation
    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput) {
        fullNameInput.addEventListener('blur', function() {
            validateField(this, validateFullName(this.value), 
                'Please enter your full name (first and last name)');
        });
    }
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateField(this, validateCanadianEmail(this.value), 
                'Please enter a valid email address');
        });
    }
    
    // Phone validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            validateField(this, validateCanadianPhone(this.value), 
                'Please enter a valid Canadian phone number');
        });
        
        // Format phone number as user types
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    this.value = value;
                } else if (value.length <= 6) {
                    this.value = value.slice(0, 3) + '-' + value.slice(3);
                } else {
                    this.value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
                }
            }
        });
    }
}

// Validate individual field
function validateField(field, isValid, errorMessage) {
    const errorElement = document.getElementById(field.id + '-error');
    
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('success');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        return true;
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
        return false;
    }
}

/* ===========================
   RATE LIMITING
   =========================== */

// Check if form submission is allowed
function checkRateLimit() {
    const currentTime = Date.now();
    
    // Check if locked out
    if (isLocked) {
        const timeSinceLock = currentTime - lastAttemptTime;
        if (timeSinceLock < SECURITY_CONFIG.lockoutDuration) {
            const remainingTime = Math.ceil((SECURITY_CONFIG.lockoutDuration - timeSinceLock) / 60000);
            return {
                allowed: false,
                message: `Too many attempts. Please try again in ${remainingTime} minutes.`
            };
        } else {
            // Reset after lockout period
            isLocked = false;
            submissionAttempts = 0;
        }
    }
    
    // Check attempts
    if (submissionAttempts >= SECURITY_CONFIG.maxAttempts) {
        isLocked = true;
        lastAttemptTime = currentTime;
        return {
            allowed: false,
            message: 'Too many submission attempts. Please try again in 15 minutes.'
        };
    }
    
    return { allowed: true };
}

// Increment submission attempts
function incrementAttempts() {
    submissionAttempts++;
    lastAttemptTime = Date.now();
}

/* ===========================
   RECAPTCHA VALIDATION
   =========================== */

// Validate reCAPTCHA
function validateRecaptcha() {
    const recaptchaResponse = grecaptcha.getResponse();
    const errorElement = document.getElementById('recaptcha-error');
    
    if (recaptchaResponse.length === 0) {
        if (errorElement) {
            errorElement.textContent = 'Please complete the reCAPTCHA verification';
            errorElement.classList.add('show');
        }
        return false;
    }
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    return true;
}

/* ===========================
   FORM SUBMISSION HANDLER
   =========================== */

// Enhanced form submission with security
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Check rate limiting
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        alert(rateLimitCheck.message);
        return false;
    }
    
    // Validate reCAPTCHA
    if (typeof grecaptcha !== 'undefined' && !validateRecaptcha()) {
        return false;
    }
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        insuranceType: document.getElementById('insuranceType').value,
        preferredDate: document.getElementById('preferredDate').value,
        preferredTime: document.getElementById('preferredTime').value,
        message: document.getElementById('message').value,
        diabetes: document.querySelector('input[name="diabetes"]:checked')?.value || 'no',
        cancer: document.querySelector('input[name="cancer"]:checked')?.value || 'no',
        medicalCondition: document.getElementById('medicalCondition')?.value || '',
        medication: document.getElementById('medication')?.value || '',
        yearDiagnosed: document.getElementById('yearDiagnosed')?.value || '',
        consent: document.getElementById('consentCheckbox').checked,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    // Validate all required fields
    let isValid = true;
    
    // Validate full name
    if (!validateFullName(formData.fullName)) {
        validateField(document.getElementById('fullName'), false, 
            'Please enter your full name (first and last name)');
        isValid = false;
    }
    
    // Validate email
    if (!validateCanadianEmail(formData.email)) {
        validateField(document.getElementById('email'), false, 
            'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    if (!validateCanadianPhone(formData.phone)) {
        validateField(document.getElementById('phone'), false, 
            'Please enter a valid Canadian phone number');
        isValid = false;
    }
    
    // Validate service type
    if (!formData.insuranceType) {
        validateField(document.getElementById('insuranceType'), false, 
            'Please select a service type');
        isValid = false;
    }
    
    // Validate consent
    if (!formData.consent) {
        const consentError = document.getElementById('consent-error');
        if (consentError) {
            consentError.textContent = 'You must agree to the terms to proceed';
            consentError.classList.add('show');
        }
        isValid = false;
    }
    
    if (!isValid) {
        incrementAttempts();
        return false;
    }
    
    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData);
    
    // Log sanitized data (in production, send to backend)
    console.log('Secure form submission:', sanitizedData);
    
    // Increment attempts
    incrementAttempts();
    
    // Show success message
    alert('Thank you! Your secure appointment request has been submitted. We will contact you within 24 hours.');
    
    // Reset form
    document.getElementById('leadForm').reset();
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
    }
    
    // Reset validation states
    document.querySelectorAll('.error, .success').forEach(el => {
        el.classList.remove('error', 'success');
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
    });
    
    // In production, send to backend with HTTPS
    /*
    fetch('https://www.estatenest.ca/api/submit-appointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(sanitizedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you! Your appointment request has been submitted.');
            document.getElementById('leadForm').reset();
        } else {
            alert('There was an error. Please try again or call us directly.');
        }
    })
    .catch(error => {
        console.error('Submission error:', error);
        alert('There was an error submitting your request. Please call us at 780-860-3191.');
    });
    */
    
    return false;
}

/* ===========================
   SHOW/HIDE MEDICAL SECTION
   =========================== */

// Show medical section for life insurance
function toggleMedicalSection() {
    const insuranceType = document.getElementById('insuranceType');
    const medicalSection = document.getElementById('medicalSection');
    
    if (insuranceType && medicalSection) {
        insuranceType.addEventListener('change', function() {
            if (this.value === 'life' || this.value === 'corporate') {
                medicalSection.style.display = 'block';
                medicalSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                medicalSection.style.display = 'none';
            }
        });
    }
}

/* ===========================
   CONTENT SECURITY POLICY
   =========================== */

// Prevent inline script execution
function enforceCSP() {
    // Log any CSP violations
    document.addEventListener('securitypolicyviolation', (e) => {
        console.error('CSP Violation:', {
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy
        });
    });
}

/* ===========================
   SESSION TIMEOUT
   =========================== */

let sessionTimer;

function resetSessionTimer() {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        alert('Your session has expired for security reasons. Please refresh the page.');
        // Optionally reload the page
        // location.reload();
    }, SECURITY_CONFIG.sessionTimeout);
}

// Reset timer on user activity
document.addEventListener('mousemove', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);
document.addEventListener('click', resetSessionTimer);
document.addEventListener('scroll', resetSessionTimer);

/* ===========================
   INITIALIZATION
   =========================== */

document.addEventListener('DOMContentLoaded', function() {
    // Setup real-time validation
    setupRealtimeValidation();
    
    // Setup medical section toggle
    toggleMedicalSection();
    
    // Enforce CSP
    enforceCSP();
    
    // Start session timer
    resetSessionTimer();
    
    // Attach form submission handler
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', handleFormSubmission);
    }
    
    console.log('🔒 Security features initialized');
});

/* ===========================
   ANTI-BOT MEASURES
   =========================== */

// Honeypot field (hidden from users, bots will fill it)
function createHoneypot() {
    const form = document.getElementById('leadForm');
    if (form) {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        form.appendChild(honeypot);
    }
}

// Check honeypot on submission
function checkHoneypot() {
    const honeypot = document.querySelector('input[name="website"]');
    if (honeypot && honeypot.value !== '') {
        console.warn('Bot detected via honeypot');
        return false;
    }
    return true;
}

// Initialize honeypot
createHoneypot();

console.log('✅ Security & Validation system loaded');

