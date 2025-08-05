import nodemailer from 'nodemailer';
import { AppError } from '../utils/appError';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  return nodemailer.createTransport(config);
};

// Send email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new AppError('Email could not be sent', 500);
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name: string, verificationUrl: string): EmailTemplate => ({
    subject: 'Welcome to Lawyer Platform - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Lawyer Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Lawyer Platform</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for joining our lawyer consultation platform. To get started, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Lawyer Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (name: string, resetUrl: string): EmailTemplate => ({
    subject: 'Password Reset Request - Lawyer Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your password for your Lawyer Platform account.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <div class="warning">
              <p><strong>Important:</strong> This password reset link will expire in 10 minutes for security reasons.</p>
            </div>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Lawyer Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  consultationBooked: (clientName: string, lawyerName: string, consultationDate: string, consultationTime: string): EmailTemplate => ({
    subject: 'Consultation Booked Successfully - Lawyer Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Consultation Booked</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consultation Booked Successfully</h1>
          </div>
          <div class="content">
            <h2>Hello ${clientName}!</h2>
            <p>Your consultation has been successfully booked. Here are the details:</p>
            <div class="details">
              <h3>Consultation Details</h3>
              <p><strong>Lawyer:</strong> ${lawyerName}</p>
              <p><strong>Date:</strong> ${consultationDate}</p>
              <p><strong>Time:</strong> ${consultationTime}</p>
            </div>
            <p>You will receive a reminder email 24 hours before your consultation.</p>
            <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Lawyer Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  consultationReminder: (clientName: string, lawyerName: string, consultationDate: string, consultationTime: string, meetingLink: string): EmailTemplate => ({
    subject: 'Consultation Reminder - Tomorrow at ' + consultationTime,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Consultation Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consultation Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${clientName}!</h2>
            <p>This is a reminder that you have a consultation scheduled for tomorrow.</p>
            <div class="details">
              <h3>Consultation Details</h3>
              <p><strong>Lawyer:</strong> ${lawyerName}</p>
              <p><strong>Date:</strong> ${consultationDate}</p>
              <p><strong>Time:</strong> ${consultationTime}</p>
            </div>
            <a href="${meetingLink}" class="button">Join Meeting</a>
            <p>Please make sure to join the meeting on time. If you have any questions or need to reschedule, please contact us immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Lawyer Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send templated email
export const sendTemplatedEmail = async (
  email: string,
  template: EmailTemplate
): Promise<void> => {
  await sendEmail({
    email,
    subject: template.subject,
    message: '', // HTML will be used instead
    html: template.html
  });
};

// Bulk email sending
export const sendBulkEmail = async (
  emails: string[],
  template: EmailTemplate
): Promise<void> => {
  const promises = emails.map(email => 
    sendTemplatedEmail(email, template)
  );
  
  await Promise.allSettled(promises);
};