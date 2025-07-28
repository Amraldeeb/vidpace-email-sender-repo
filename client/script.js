// Email sender frontend logic
document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const previewBtn = document.getElementById('previewBtn');
    const sendBtn = document.getElementById('sendBtn');
    const closePreviewBtn = document.getElementById('closePreview');
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');
    const statusMessage = document.getElementById('statusMessage');

    // Backend API URL - Update this when deploying
    const API_BASE_URL = 'https://e5h6i7cn31x8.manus.space';

    // Preview email functionality
    previewBtn.addEventListener('click', function() {
        const recipientName = document.getElementById('recipientName').value;
        const emailBody = document.getElementById('emailBody').value;
        
        if (!recipientName || !emailBody) {
            showStatus('Please fill in recipient name and email body to preview.', 'error');
            return;
        }

        // Replace {{name}} placeholder with actual name
        const personalizedBody = emailBody.replace(/\{\{name\}\}/g, recipientName);
        
        // Show preview
        previewContent.innerHTML = personalizedBody;
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Close preview functionality
    closePreviewBtn.addEventListener('click', function() {
        previewSection.style.display = 'none';
    });

    // Send email functionality
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(emailForm);
        const emailData = {
            senderEmail: formData.get('senderEmail'),
            senderPassword: formData.get('senderPassword'),
            recipientEmail: formData.get('recipientEmail'),
            recipientName: formData.get('recipientName'),
            subject: formData.get('subject'),
            emailBody: formData.get('emailBody')
        };

        // Validate form data
        if (!validateEmailData(emailData)) {
            return;
        }

        // Personalize email body
        emailData.emailBody = emailData.emailBody.replace(/\{\{name\}\}/g, emailData.recipientName);

        // Show loading state
        showStatus('<span class="loading-spinner"></span>Sending email...', 'loading');
        sendBtn.disabled = true;
        sendBtn.textContent = '📤 Sending...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            const result = await response.json();

            if (response.ok) {
                showStatus('✅ Email sent successfully!', 'success');
                emailForm.reset();
                previewSection.style.display = 'none';
            } else {
                showStatus(`❌ Error: ${result.error || 'Failed to send email'}`, 'error');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showStatus('❌ Network error. Please check your connection and try again.', 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '📤 Send Email';
        }
    });

    // Validate email data
    function validateEmailData(data) {
        if (!data.senderEmail || !data.senderPassword) {
            showStatus('Please enter your email credentials.', 'error');
            return false;
        }

        if (!data.recipientEmail || !data.recipientName) {
            showStatus('Please enter recipient information.', 'error');
            return false;
        }

        if (!data.subject || !data.emailBody) {
            showStatus('Please enter email subject and body.', 'error');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.senderEmail)) {
            showStatus('Please enter a valid sender email address.', 'error');
            return false;
        }

        if (!emailRegex.test(data.recipientEmail)) {
            showStatus('Please enter a valid recipient email address.', 'error');
            return false;
        }

        return true;
    }

    // Show status message
    function showStatus(message, type) {
        statusMessage.innerHTML = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
        
        // Scroll to status message
        statusMessage.scrollIntoView({ behavior: 'smooth' });
    }

    // Auto-save form data to localStorage
    const formInputs = emailForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        // Load saved data
        const savedValue = localStorage.getItem(`vidpace_${input.name}`);
        if (savedValue && input.type !== 'password') {
            input.value = savedValue;
        }

        // Save data on change
        input.addEventListener('input', function() {
            if (input.type !== 'password') {
                localStorage.setItem(`vidpace_${input.name}`, input.value);
            }
        });
    });

    // Clear saved data button (optional)
    const clearDataBtn = document.createElement('button');
    clearDataBtn.type = 'button';
    clearDataBtn.textContent = '🗑️ Clear Saved Data';
    clearDataBtn.style.cssText = `
        margin-top: 10px;
        padding: 8px 15px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        cursor: pointer;
    `;
    clearDataBtn.addEventListener('click', function() {
        if (confirm('Clear all saved form data?')) {
            formInputs.forEach(input => {
                localStorage.removeItem(`vidpace_${input.name}`);
            });
            emailForm.reset();
            showStatus('Saved data cleared.', 'success');
        }
    });
    
    document.querySelector('.button-group').appendChild(clearDataBtn);
});

