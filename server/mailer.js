const nodemailer = require('nodemailer');

/**
 * Send email using Nodemailer with SMTP configuration
 * @param {Object} emailData - Email configuration object
 * @param {string} emailData.from - Sender email address
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML email body
 * @param {Object} emailData.auth - Authentication credentials
 * @param {string} emailData.auth.user - SMTP username (email)
 * @param {string} emailData.auth.pass - SMTP password
 * @returns {Promise} - Promise that resolves with email result
 */
async function sendEmail(emailData) {
    try {
        // Create transporter with SMTP configuration for Namecheap Private Email
        const transporter = nodemailer.createTransporter({
            host: 'mail.privateemail.com',
            port: 587, // Use 587 for TLS or 465 for SSL
            secure: false, // true for 465, false for other ports
            auth: {
                user: emailData.auth.user,
                pass: emailData.auth.pass
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            },
            // Connection timeout
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000, // 30 seconds
            socketTimeout: 60000, // 60 seconds
        });

        // Verify SMTP connection configuration
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        // Prepare email options
        const mailOptions = {
            from: {
                name: 'Vidpace Sales Team',
                address: emailData.from
            },
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            // Optional: Add text version for better compatibility
            text: emailData.html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
            // Email headers
            headers: {
                'X-Mailer': 'Vidpace Email Sender v1.0',
                'X-Priority': '3', // Normal priority
            }
        };

        console.log(`Sending email from ${emailData.from} to ${emailData.to}...`);

        // Send email
        const result = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', {
            messageId: result.messageId,
            response: result.response,
            accepted: result.accepted,
            rejected: result.rejected
        });

        return result;

    } catch (error) {
        console.error('Error in sendEmail function:', error);
        
        // Enhanced error handling with specific error types
        if (error.code === 'EAUTH') {
            throw new Error('SMTP Authentication failed. Please check your email credentials.');
        } else if (error.code === 'ECONNECTION') {
            throw new Error('Failed to connect to SMTP server. Please check your internet connection.');
        } else if (error.code === 'ETIMEDOUT') {
            throw new Error('SMTP connection timed out. Please try again.');
        } else if (error.code === 'ENOTFOUND') {
            throw new Error('SMTP server not found. Please check the server configuration.');
        } else if (error.responseCode === 550) {
            throw new Error('Recipient email address was rejected by the server.');
        } else if (error.responseCode === 554) {
            throw new Error('Email rejected due to policy reasons. Please check the content.');
        } else {
            throw error;
        }
    }
}

/**
 * Test SMTP connection with given credentials
 * @param {string} email - Email address
 * @param {string} password - Email password
 * @returns {Promise<boolean>} - Promise that resolves to true if connection is successful
 */
async function testSMTPConnection(email, password) {
    try {
        const transporter = nodemailer.createTransporter({
            host: 'mail.privateemail.com',
            port: 587,
            secure: false,
            auth: {
                user: email,
                pass: password
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            }
        });

        await transporter.verify();
        console.log('SMTP connection test successful for:', email);
        return true;
    } catch (error) {
        console.error('SMTP connection test failed for:', email, error.message);
        return false;
    }
}

module.exports = {
    sendEmail,
    testSMTPConnection
};

