const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendUserCredentials = async (userEmail, userName, password, roleName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Welcome to EAT-N-GO SuperAdmin - Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Welcome to EAT-N-GO SuperAdmin</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Login Details:</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Role:</strong> ${roleName}</p>
        </div>
        
        <p style="color: #d32f2f;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        
        <p>Best regards,<br>EAT-N-GO SuperAdmin Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Credentials email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendUserCredentials };