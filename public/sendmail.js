const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com', // Corrected host for Gmail
    port: 465,
    auth: {
        user: 'wbdev25@gmail.com', // Your email
        pass: 'xnra ijaq iuak izqy' // Your email password or app-specific password
    }
});

// Function to send mail
function sendMail(to, sub, msg) {
    

    transporter.sendMail({
        to:to,
        subject:sub,
        html:msg
    });
}

// Usage example
sendMail("wbdev25@gmail.com", "This is SUBJECT", "This is the message body.");
