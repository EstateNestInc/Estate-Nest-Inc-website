/* ===========================
   TVM FINANCIAL CALCULATOR
   Estate Nest Inc
   =========================== */

// Calculator Tab Switching
document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs and content
        document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.calc-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding content
        const calcType = this.getAttribute('data-calc');
        document.getElementById(calcType).classList.add('active');
    });
});

/* ===========================
   FUTURE VALUE CALCULATOR
   FV = PV * (1 + r/n)^(n*t)
   =========================== */
function calculateFV() {
    // Get input values
    const presentValue = parseFloat(document.getElementById('fv-present').value);
    const annualRate = parseFloat(document.getElementById('fv-rate').value) / 100;
    const years = parseFloat(document.getElementById('fv-years').value);
    const compoundFrequency = parseFloat(document.getElementById('fv-compound').value);
    
    // Validate inputs
    if (isNaN(presentValue) || isNaN(annualRate) || isNaN(years)) {
        showResult('fv-result', 'Please fill in all fields with valid numbers.', 'error');
        return;
    }
    
    if (presentValue <= 0 || years <= 0) {
        showResult('fv-result', 'Present value and years must be greater than zero.', 'error');
        return;
    }
    
    // Calculate Future Value
    const ratePerPeriod = annualRate / compoundFrequency;
    const totalPeriods = compoundFrequency * years;
    const futureValue = presentValue * Math.pow(1 + ratePerPeriod, totalPeriods);
    
    // Calculate total interest earned
    const interestEarned = futureValue - presentValue;
    const percentageGain = ((futureValue - presentValue) / presentValue) * 100;
    
    // Display result
    const resultHTML = `
        <h4>Future Value Calculation Results</h4>
        <p><strong>Initial Investment:</strong> ${formatCurrency(presentValue)}</p>
        <p><strong>Annual Interest Rate:</strong> ${(annualRate * 100).toFixed(2)}%</p>
        <p><strong>Investment Period:</strong> ${years} years</p>
        <p><strong>Compounding:</strong> ${getCompoundingText(compoundFrequency)}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
        <p class="highlight">Future Value: ${formatCurrency(futureValue)}</p>
        <p><strong>Total Interest Earned:</strong> ${formatCurrency(interestEarned)}</p>
        <p><strong>Percentage Gain:</strong> ${percentageGain.toFixed(2)}%</p>
    `;
    
    showResult('fv-result', resultHTML, 'success');
}

/* ===========================
   PRESENT VALUE CALCULATOR
   PV = FV / (1 + r/n)^(n*t)
   =========================== */
function calculatePV() {
    // Get input values
    const futureValue = parseFloat(document.getElementById('pv-future').value);
    const annualRate = parseFloat(document.getElementById('pv-rate').value) / 100;
    const years = parseFloat(document.getElementById('pv-years').value);
    const compoundFrequency = parseFloat(document.getElementById('pv-compound').value);
    
    // Validate inputs
    if (isNaN(futureValue) || isNaN(annualRate) || isNaN(years)) {
        showResult('pv-result', 'Please fill in all fields with valid numbers.', 'error');
        return;
    }
    
    if (futureValue <= 0 || years <= 0) {
        showResult('pv-result', 'Future value and years must be greater than zero.', 'error');
        return;
    }
    
    // Calculate Present Value
    const ratePerPeriod = annualRate / compoundFrequency;
    const totalPeriods = compoundFrequency * years;
    const presentValue = futureValue / Math.pow(1 + ratePerPeriod, totalPeriods);
    
    // Calculate discount amount
    const discountAmount = futureValue - presentValue;
    const discountPercentage = (discountAmount / futureValue) * 100;
    
    // Display result
    const resultHTML = `
        <h4>Present Value Calculation Results</h4>
        <p><strong>Desired Future Value:</strong> ${formatCurrency(futureValue)}</p>
        <p><strong>Annual Interest Rate:</strong> ${(annualRate * 100).toFixed(2)}%</p>
        <p><strong>Investment Period:</strong> ${years} years</p>
        <p><strong>Compounding:</strong> ${getCompoundingText(compoundFrequency)}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
        <p class="highlight">Present Value Needed: ${formatCurrency(presentValue)}</p>
        <p><strong>Discount Amount:</strong> ${formatCurrency(discountAmount)}</p>
        <p><strong>Discount Rate:</strong> ${discountPercentage.toFixed(2)}%</p>
        <p style="font-size: 0.9rem; color: #6c757d; margin-top: 1rem;">
            <em>You need to invest ${formatCurrency(presentValue)} today to reach ${formatCurrency(futureValue)} in ${years} years.</em>
        </p>
    `;
    
    showResult('pv-result', resultHTML, 'success');
}

/* ===========================
   PAYMENT CALCULATOR
   PMT = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
   =========================== */
function calculatePayment() {
    // Get input values
    const principal = parseFloat(document.getElementById('pmt-principal').value);
    const annualRate = parseFloat(document.getElementById('pmt-rate').value) / 100;
    const years = parseFloat(document.getElementById('pmt-years').value);
    const paymentFrequency = parseFloat(document.getElementById('pmt-frequency').value);
    
    // Validate inputs
    if (isNaN(principal) || isNaN(annualRate) || isNaN(years)) {
        showResult('pmt-result', 'Please fill in all fields with valid numbers.', 'error');
        return;
    }
    
    if (principal <= 0 || years <= 0) {
        showResult('pmt-result', 'Loan amount and term must be greater than zero.', 'error');
        return;
    }
    
    // Calculate Payment
    const ratePerPeriod = annualRate / paymentFrequency;
    const totalPayments = paymentFrequency * years;
    
    let payment;
    if (ratePerPeriod === 0) {
        payment = principal / totalPayments;
    } else {
        payment = (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPayments)) / 
                  (Math.pow(1 + ratePerPeriod, totalPayments) - 1);
    }
    
    // Calculate totals
    const totalPaid = payment * totalPayments;
    const totalInterest = totalPaid - principal;
    const interestPercentage = (totalInterest / principal) * 100;
    
    // Display result
    const resultHTML = `
        <h4>Payment Calculation Results</h4>
        <p><strong>Loan Amount:</strong> ${formatCurrency(principal)}</p>
        <p><strong>Annual Interest Rate:</strong> ${(annualRate * 100).toFixed(2)}%</p>
        <p><strong>Loan Term:</strong> ${years} years</p>
        <p><strong>Payment Frequency:</strong> ${getPaymentFrequencyText(paymentFrequency)}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
        <p class="highlight">${getPaymentFrequencyText(paymentFrequency)} Payment: ${formatCurrency(payment)}</p>
        <p><strong>Total Amount Paid:</strong> ${formatCurrency(totalPaid)}</p>
        <p><strong>Total Interest Paid:</strong> ${formatCurrency(totalInterest)}</p>
        <p><strong>Interest as % of Principal:</strong> ${interestPercentage.toFixed(2)}%</p>
        <p style="font-size: 0.9rem; color: #6c757d; margin-top: 1rem;">
            <em>Total of ${totalPayments} payments over ${years} years.</em>
        </p>
    `;
    
    showResult('pmt-result', resultHTML, 'success');
}

/* ===========================
   COMPREHENSIVE LOAN CALCULATOR
   =========================== */
function calculateLoan() {
    // Get input values
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const downPayment = parseFloat(document.getElementById('loan-down').value) || 0;
    const annualRate = parseFloat(document.getElementById('loan-rate').value) / 100;
    const years = parseFloat(document.getElementById('loan-years').value);
    
    // Validate inputs
    if (isNaN(loanAmount) || isNaN(annualRate) || isNaN(years)) {
        showResult('loan-result', 'Please fill in all required fields with valid numbers.', 'error');
        return;
    }
    
    if (loanAmount <= 0 || years <= 0) {
        showResult('loan-result', 'Loan amount and term must be greater than zero.', 'error');
        return;
    }
    
    if (downPayment >= loanAmount) {
        showResult('loan-result', 'Down payment must be less than loan amount.', 'error');
        return;
    }
    
    // Calculate principal after down payment
    const principal = loanAmount - downPayment;
    const monthlyRate = annualRate / 12;
    const totalPayments = years * 12;
    
    // Calculate monthly payment
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = principal / totalPayments;
    } else {
        monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }
    
    // Calculate totals
    const totalPaid = monthlyPayment * totalPayments;
    const totalInterest = totalPaid - principal;
    const totalCost = totalPaid + downPayment;
    
    // Calculate down payment percentage
    const downPaymentPercent = (downPayment / loanAmount) * 100;
    
    // Display comprehensive result
    const resultHTML = `
        <h4>Comprehensive Loan Analysis</h4>
        <div style="background: #f8f6f0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <p><strong>Property/Loan Value:</strong> ${formatCurrency(loanAmount)}</p>
            <p><strong>Down Payment:</strong> ${formatCurrency(downPayment)} (${downPaymentPercent.toFixed(2)}%)</p>
            <p><strong>Amount Financed:</strong> ${formatCurrency(principal)}</p>
            <p><strong>Interest Rate:</strong> ${(annualRate * 100).toFixed(2)}%</p>
            <p><strong>Loan Term:</strong> ${years} years (${totalPayments} months)</p>
        </div>
        <hr style="margin: 1rem 0; border: none; border-top: 2px solid #d4af37;">
        <p class="highlight">Monthly Payment: ${formatCurrency(monthlyPayment)}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
        <p><strong>Total Principal Paid:</strong> ${formatCurrency(principal)}</p>
        <p><strong>Total Interest Paid:</strong> ${formatCurrency(totalInterest)}</p>
        <p><strong>Total Amount Paid:</strong> ${formatCurrency(totalPaid)}</p>
        <p><strong>Total Cost (incl. down payment):</strong> ${formatCurrency(totalCost)}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
        <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <p style="font-size: 0.95rem; margin-bottom: 0.5rem;"><strong>Key Insights:</strong></p>
            <p style="font-size: 0.9rem; margin-bottom: 0.3rem;">• Interest represents ${((totalInterest / principal) * 100).toFixed(1)}% of the principal</p>
            <p style="font-size: 0.9rem; margin-bottom: 0.3rem;">• You'll pay ${formatCurrency(totalInterest)} in interest over ${years} years</p>
            <p style="font-size: 0.9rem;">• Total cost is ${((totalCost / loanAmount) * 100).toFixed(1)}% of original loan value</p>
        </div>
    `;
    
    showResult('loan-result', resultHTML, 'success');
}

/* ===========================
   HELPER FUNCTIONS
   =========================== */

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Get compounding frequency text
function getCompoundingText(frequency) {
    const frequencies = {
        1: 'Annually',
        2: 'Semi-Annually',
        4: 'Quarterly',
        12: 'Monthly',
        365: 'Daily'
    };
    return frequencies[frequency] || 'Unknown';
}

// Get payment frequency text
function getPaymentFrequencyText(frequency) {
    const frequencies = {
        12: 'Monthly',
        26: 'Bi-Weekly',
        52: 'Weekly'
    };
    return frequencies[frequency] || 'Unknown';
}

// Show result with animation
function showResult(elementId, content, type) {
    const resultElement = document.getElementById(elementId);
    resultElement.innerHTML = content;
    resultElement.classList.add('show');
    
    // Add appropriate styling based on type
    if (type === 'error') {
        resultElement.style.background = '#ffebee';
        resultElement.style.borderLeftColor = '#dc3545';
    } else {
        resultElement.style.background = '#f8f6f0';
        resultElement.style.borderLeftColor = '#d4af37';
    }
    
    // Scroll to result
    resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Input sanitization for calculator
document.querySelectorAll('.calc-form input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        // Remove any non-numeric characters except decimal point and minus
        this.value = this.value.replace(/[^0-9.-]/g, '');
        
        // Ensure only one decimal point
        const parts = this.value.split('.');
        if (parts.length > 2) {
            this.value = parts[0] + '.' + parts.slice(1).join('');
        }
    });
});

/* ===========================
   CALCULATOR KEYBOARD SHORTCUTS
   =========================== */
document.addEventListener('keydown', function(e) {
    // Enter key to calculate in active calculator
    if (e.key === 'Enter' && e.target.closest('.calc-form')) {
        e.preventDefault();
        const activeCalc = document.querySelector('.calc-content.active');
        const calcId = activeCalc.id;
        
        switch(calcId) {
            case 'future-value':
                calculateFV();
                break;
            case 'present-value':
                calculatePV();
                break;
            case 'payment':
                calculatePayment();
                break;
            case 'loan':
                calculateLoan();
                break;
        }
    }
});

console.log('✅ TVM Financial Calculator loaded successfully');

