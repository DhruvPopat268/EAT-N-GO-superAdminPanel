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
    // console.log('Credentials email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendRestaurantCredentials = async (restaurantEmail, restaurantName, password, panelLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: restaurantEmail,
    subject: 'Welcome to EAT-N-GO - Your Restaurant Account Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; background-color: #f9fafb; }
          .credentials-box { background-color: #ffffff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .credentials-box p { margin: 10px 0; }
          .credentials-box strong { color: #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .alert { background-color: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your Restaurant Application Has Been Approved</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${restaurantName}</strong>,</p>
            
            <p>We are delighted to inform you that your restaurant application has been <strong>approved</strong>! Welcome to the EAT-N-GO family.</p>
            
            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #667eea;">🔐 Your Login Credentials</h3>
              <p><strong>Email:</strong> ${restaurantEmail}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Restaurant Panel:</strong> <a href="${panelLink}" style="color: #667eea;">${panelLink}</a></p>
            </div>
            
            <div style="text-align: center;">
              <a href="${panelLink}" class="button">Access Restaurant Dashboard</a>
            </div>
            
            <div class="alert">
              <strong>⚠️ Important Security Notice:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>This is a temporary password.</strong> Please update it from Account Settings after your first login for security purposes</li>
                <li>Keep these credentials secure and confidential</li>
                <li>Never share your credentials with anyone</li>
              </ul>
            </div>
            
            <p>You can now access your restaurant dashboard to manage your menu, orders, and business operations.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>EAT-N-GO Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 EAT-N-GO. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending restaurant credentials email:', error);
    throw error;
  }
};

const sendRestaurantPendingNotification = async (restaurantEmail, restaurantName) => {
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@eatngo.com';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: restaurantEmail,
    subject: 'EAT-N-GO - Application Received & Under Review',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; background-color: #f9fafb; }
          .info-box { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .timeline { background-color: #ffffff; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .timeline-item { display: flex; align-items: flex-start; margin: 15px 0; }
          .timeline-icon { min-width: 35px; width: 35px; height: 35px; background-color: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; font-size: 16px; flex-shrink: 0; }
          .timeline-text { flex: 1; padding-top: 5px; }
          .support-box { background-color: #f0fdf4; border: 2px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Application Received</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">We're Reviewing Your Restaurant Application</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${restaurantName}</strong>,</p>
            
            <p>Thank you for submitting your restaurant application to EAT-N-GO! We have successfully received your application and it is currently under review.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #3b82f6;">📌 Application Status: PENDING</h3>
              <p style="margin: 5px 0;">Your application is being carefully reviewed by our team to ensure the best experience for both you and our customers.</p>
            </div>
            
            <div class="timeline">
              <h3 style="margin-top: 0; color: #1f2937;">⏱️ What Happens Next?</h3>
              <div class="timeline-item">
                <div class="timeline-icon">1</div>
                <div class="timeline-text">Application review by our verification team</div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon">2</div>
                <div class="timeline-text">Document and details verification</div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon">3</div>
                <div class="timeline-text">Approval decision within 2-3 business days</div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon">4</div>
                <div class="timeline-text">Email notification with login credentials (if approved)</div>
              </div>
            </div>
            
            <p><strong>Expected Response Time:</strong> 2-3 business days</p>
            
            <p>If you do not receive a response within this timeframe, please feel free to reach out to our support team.</p>
            
            <div class="support-box">
              <h3 style="margin-top: 0; color: #22c55e;">💬 Need Help?</h3>
              <p>Contact our support team at:</p>
              <p style="font-size: 18px; font-weight: bold; color: #3b82f6; margin: 10px 0;">
                <a href="mailto:${supportEmail}" style="color: #3b82f6; text-decoration: none;">${supportEmail}</a>
              </p>
            </div>
            
            <p>We appreciate your patience and look forward to partnering with you!</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>EAT-N-GO Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 EAT-N-GO. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending pending notification email:', error);
    throw error;
  }
};

const sendRestaurantRejectionNotification = async (restaurantEmail, restaurantName, password, panelLink, rejectionReason = '') => {
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@eatngo.com';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: restaurantEmail,
    subject: 'EAT-N-GO - Application Update Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; background-color: #f9fafb; }
          .rejection-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .credentials-box { background-color: #ffffff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .credentials-box p { margin: 10px 0; }
          .credentials-box strong { color: #3b82f6; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .action-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .support-box { background-color: #f0fdf4; border: 2px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Application Update Required</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Action Needed for Your Restaurant Application</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${restaurantName}</strong>,</p>
            
            <p>Thank you for your interest in joining EAT-N-GO. After careful review of your restaurant application, we found that some details need to be updated or corrected.</p>
            
            <div class="rejection-box">
              <h3 style="margin-top: 0; color: #ef4444;">❌ Application Status: REQUIRES UPDATES</h3>
              ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : '<p>Some information in your application needs to be reviewed and updated.</p>'}
            </div>
            
            <div class="action-box">
              <h3 style="margin-top: 0; color: #f59e0b;">🔄 Next Steps</h3>
              <p>Please log in to your restaurant panel using the credentials below, review the mentioned details, and resubmit your application with the correct information.</p>
            </div>
            
            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #3b82f6;">🔐 Your Login Credentials</h3>
              <p><strong>Email:</strong> ${restaurantEmail}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Restaurant Panel:</strong> <a href="${panelLink}" style="color: #3b82f6;">${panelLink}</a></p>
            </div>
            
            <div style="text-align: center;">
              <a href="${panelLink}" class="button">Update Application Details</a>
            </div>
            
            <p><strong>What to do:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Log in to your restaurant panel using the credentials above</li>
              <li>Review and update the required information</li>
              <li>Resubmit your application for review</li>
              <li>Our team will review your updated application within 2-3 business days</li>
            </ul>
            
            <div class="support-box">
              <h3 style="margin-top: 0; color: #22c55e;">💬 Need Assistance?</h3>
              <p>If you have any questions or need help with your application, our support team is here to assist you.</p>
              <p style="font-size: 18px; font-weight: bold; color: #3b82f6; margin: 10px 0;">
                <a href="mailto:${supportEmail}" style="color: #3b82f6; text-decoration: none;">${supportEmail}</a>
              </p>
            </div>
            
            <p>We look forward to having you as part of the EAT-N-GO family once the details are updated!</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>EAT-N-GO Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 EAT-N-GO. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending rejection notification email:', error);
    throw error;
  }
};

module.exports = { 
  sendUserCredentials, 
  sendRestaurantCredentials,
  sendRestaurantPendingNotification,
  sendRestaurantRejectionNotification
};