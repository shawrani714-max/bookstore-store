const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in config.env');
    console.warn('📧 For Gmail setup:');
    console.warn('   1. Enable 2-factor authentication on your Gmail account');
    console.warn('   2. Generate an App Password: https://myaccount.google.com/apppasswords');
    console.warn('   3. Set EMAIL_USER=your-email@gmail.com');
    console.warn('   4. Set EMAIL_PASS=your-app-password');
    
    // Return a mock transporter for development
    return {
      sendMail: async (options) => {
        console.log('📧 Mock Email Sent:');
        console.log('   To:', options.to);
        console.log('   Subject:', options.subject);
        console.log('   Reset URL:', options.html.match(/href="([^"]+)"/)?.[1] || 'No URL found');
        return { messageId: 'mock-message-id' };
      }
    };
  }

  // For development/testing, you can use Gmail or other services
  // For production, use services like SendGrid, Mailgun, etc.
  
  // Option 1: Gmail (for testing)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Option 2: SendGrid (recommended for production)
  // return nodemailer.createTransport({
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: 'apikey',
  //     pass: process.env.SENDGRID_API_KEY
  //   }
  // });

  // Option 3: Mailgun (alternative for production)
  // return nodemailer.createTransport({
  //   host: 'smtp.mailgun.org',
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: process.env.MAILGUN_USER,
  //     pass: process.env.MAILGUN_PASS
  //   }
  // });
};

// Low-level send mail utility
const sendMail = async (options) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: options.from || `"Bookworld India" <${process.env.EMAIL_USER || 'noreply@bookworldindia.com'}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  };
  const info = await transporter.sendMail(mailOptions);
  return info;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
    
    // Email template
    const mailOptions = {
      from: `"Bookworld India" <${process.env.EMAIL_USER || 'noreply@bookworldindia.com'}>`,
      to: email,
      subject: 'Password Reset Request - Bookworld India',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #e94e77;
              margin-bottom: 10px;
            }
            .title {
              color: #333;
              font-size: 20px;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #e94e77;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #d63384;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .link {
              word-break: break-all;
              color: #e94e77;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📚 Bookworld India</div>
              <h1 class="title">Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              
              <p>We received a request to reset your password for your Bookworld India account. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p class="link">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 10 minutes for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.
              </div>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Bookworld India Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - Bookworld India
        
        Hello ${userName || 'there'},
        
        We received a request to reset your password for your Bookworld India account. If you didn't make this request, you can safely ignore this email.
        
        To reset your password, visit this link:
        ${resetUrl}
        
        This link will expire in 10 minutes for security reasons.
        
        If you have any questions, please contact our support team.
        
        Best regards,
        The Bookworld India Team
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Bookworld India" <${process.env.EMAIL_USER || 'noreply@bookworldindia.com'}>`,
      to: email,
      subject: 'Welcome to Bookworld India! 📚',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Bookworld India</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #e94e77;
              margin-bottom: 10px;
            }
            .title {
              color: #333;
              font-size: 20px;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #e94e77;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📚 Bookworld India</div>
              <h1 class="title">Welcome to Bookworld India!</h1>
            </div>
            
            <div class="content">
              <p>Hello ${userName},</p>
              
              <p>Welcome to Bookworld India! We're excited to have you as part of our community of book lovers.</p>
              
              <p>With your new account, you can:</p>
              <ul>
                <li>Browse our extensive collection of books</li>
                <li>Add books to your wishlist</li>
                <li>Write reviews and ratings</li>
                <li>Track your orders</li>
                <li>Get exclusive offers and discounts</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" class="button">Start Shopping</a>
              </div>
              
              <p>Happy reading!</p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Bookworld India Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = {
  sendMail,
  sendPasswordResetEmail,
  sendWelcomeEmail
}; 