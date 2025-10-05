/* ===========================

   ACCESSIBILITY TOOLBAR

   =========================== */



// Create accessibility toolbar

function createAccessibilityToolbar() {

    const toolbar = document.createElement('div');

    toolbar.className = 'accessibility-toolbar';

    toolbar.setAttribute('role', 'toolbar');

    toolbar.setAttribute('aria-label', 'Accessibility options');

    

    toolbar.innerHTML = `

        <button class="a11y-btn" id="increase-text" aria-label="Increase text size">

            <span aria-hidden="true">A+</span>

        </button>

        <button class="a11y-btn" id="decrease-text" aria-label="Decrease text size">

            <span aria-hidden="true">A-</span>

        </button>

        <button class="a11y-btn" id="high-contrast" aria-label="Toggle high contrast">

            <span aria-hidden="true">◐</span>

        </button>

        <button class="a11y-btn" id="toggle-animations" aria-label="Toggle animations">

            <span aria-hidden="true">⟳</span>

        </button>

        <button class="a11y-btn" id="screen-reader-mode" aria-label="Screen reader mode">

            <span aria-hidden="true">👁</span>

        </button>

    `;

    

    document.body.insertBefore(toolbar, document.body.firstChild);

    

    // Add event listeners

    setupAccessibilityControls();

}



// Setup accessibility controls

function setupAccessibilityControls() {

    let fontSize = 16;

    const root = document.documentElement;

    

    // Text size controls

    document.getElementById('increase-text')?.addEventListener('click', function() {

        fontSize = Math.min(fontSize + 2, 24);

        root.style.fontSize = fontSize + 'px';

        announceToScreenReader(`Text size increased to ${fontSize} pixels`);

    });

    

    document.getElementById('decrease-text')?.addEventListener('click', function() {

        fontSize = Math.max(fontSize - 2, 12);

        root.style.fontSize = fontSize + 'px';

        announceToScreenReader(`Text size decreased to ${fontSize} pixels`);

    });

    

    // High contrast mode

    document.getElementById('high-contrast')?.addEventListener('click', function() {

        document.body.classList.toggle('high-contrast');

        const isActive = document.body.classList.contains('high-contrast');

        announceToScreenReader(`High contrast mode ${isActive ? 'enabled' : 'disabled'}`);

    });

    

    // Toggle animations

    document.getElementById('toggle-animations')?.addEventListener('click', function() {

        document.body.classList.toggle('no-animations');

        const isActive = document.body.classList.contains('no-animations');

        announceToScreenReader(`Animations ${isActive ? 'disabled' : 'enabled'}`);

    });

    

    // Screen reader mode

    document.getElementById('screen-reader-mode')?.addEventListener('click', function() {

        document.body.classList.toggle('screen-reader-mode');

        const isActive = document.body.classList.contains('screen-reader-mode');

        announceToScreenReader(`Screen reader optimized mode ${isActive ? 'enabled' : 'disabled'}`);

    });

}



// Screen reader announcements

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



// Initialize on page load

document.addEventListener('DOMContentLoaded', createAccessibilityToolbar);



console.log('✅ Accessibility features loaded');
