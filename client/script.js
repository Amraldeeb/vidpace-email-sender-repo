// Email sender frontend logic
document.addEventListener("DOMContentLoaded", function() {
    const emailForm = document.getElementById("emailForm");
    const previewBtn = document.getElementById("previewBtn");
    const sendBtn = document.getElementById("sendBtn");
    const closePreviewBtn = document.getElementById("closePreview");
    const previewSection = document.getElementById("previewSection");
    const previewContent = document.getElementById("previewContent");
    const statusMessage = document.getElementById("statusMessage");

    // Backend API URL - Update this when deploying
    const API_BASE_URL = "https://your-backend-api.vercel.app"; // Will be updated during deployment

    // Preview email functionality
    previewBtn.addEventListener("click", async function() {
        const recipientName = document.getElementById("recipientName").value;
        const senderName = document.getElementById("senderName").value; // New field
        const emailBody = document.getElementById("messageBody").value;

        if (!recipientName || !senderName || !emailBody) {
            showStatus("Please fill in recipient name, sender name, and email body to preview.", "error");
            return;
        }

        showStatus("Generating preview...", "info");

        try {
            const response = await fetch(`${API_BASE_URL}/generate-email-template`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipientName,
                    senderName,
                    messageBody
                }),
            });

            const result = await response.json();

            if (response.ok) {
                previewContent.innerHTML = result.htmlTemplate;
                previewSection.style.display = "block";
                showStatus("Preview generated successfully!", "success");
            } else {
                showStatus(result.error || "Failed to generate preview.", "error");
            }
        } catch (error) {
            console.error("Error:", error);
            showStatus("An error occurred while generating preview.", "error");
        }
    });

    // Close preview functionality
    closePreviewBtn.addEventListener("click", function() {
        previewSection.style.display = "none";
    });

    // Send email functionality
    emailForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const senderEmail = document.getElementById("senderEmail").value;
        const senderPassword = document.getElementById("senderPassword").value;
        const recipientEmail = document.getElementById("recipientEmail").value;
        const recipientName = document.getElementById("recipientName").value;
        const emailSubject = document.getElementById("emailSubject").value;
        const messageBody = document.getElementById("messageBody").value;
        const senderName = document.getElementById("senderName").value; // New field

        showStatus("Sending email...", "info");

        try {
            const response = await fetch(`${API_BASE_URL}/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    senderEmail,
                    senderPassword,
                    recipientEmail,
                    recipientName,
                    emailSubject,
                    messageBody,
                    senderName // Include new field
                }),
            });

            const result = await response.json();

            if (response.ok) {
                showStatus(result.message, "success");
                emailForm.reset();
                previewSection.style.display = "none";
            } else {
                showStatus(result.error || "Failed to send email.", "error");
            }
        } catch (error) {
            console.error("Error:", error);
            showStatus("An error occurred while sending email.", "error");
        }
    });

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
    }
});

