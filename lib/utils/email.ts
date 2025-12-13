import nodemailer from 'nodemailer';
import { emailLogger } from './logger';

// Email utility functions using Nodemailer

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter
// Uses only MAIL_USER and MAIL_PASS from .env.local
const createTransporter = () => {
  // Only use MAIL_USER and MAIL_PASS
  const emailUser = process.env.MAIL_USER;
  const emailPass = process.env.MAIL_PASS;

  // Default to Gmail SMTP settings
  const emailHost = 'smtp.gmail.com';
  const emailPort = '587';

  // If no email configuration, return null
  if (!emailUser || !emailPass) {
    emailLogger.warn('Email configuration incomplete - missing MAIL_USER or MAIL_PASS');
    return null;
  }

  // Remove spaces from password (Gmail App Passwords sometimes have spaces)
  const cleanPassword = emailPass.replace(/\s/g, '');

  // In production, enforce TLS certificate validation
  const isProduction = process.env.NODE_ENV === 'production';
  
  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort),
    secure: false, // false for 587, true for 465
    auth: {
      user: emailUser,
      pass: cleanPassword,
    },
    tls: {
      // Only disable certificate validation in development
      rejectUnauthorized: isProduction,
    },
  });
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // If no transporter (no email config), return false
    if (!transporter) {
      emailLogger.debug(`Email not sent (no config): ${options.subject}`);
      return false;
    }

    const emailFrom = process.env.MAIL_USER || 'noreply@evently.com';

    emailLogger.debug(`Sending email: ${options.subject}`);

    // Send email
    const info = await transporter.sendMail({
      from: `"Evently" <${emailFrom}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ''), // Strip HTML tags for plain text
    });

    emailLogger.info(`Email sent successfully: ${options.subject}`);

    return true;
  } catch (error: any) {
    // Log specific error details for debugging
    if (error.code === 'EAUTH') {
      emailLogger.error('Authentication failed - check email credentials');
    } else if (error.code === 'ECONNECTION') {
      emailLogger.error('Connection failed - check network settings');
    } else if (error.code === 'ETIMEDOUT') {
      emailLogger.error('Connection timeout - check email server settings');
    } else {
      emailLogger.error('Failed to send email', error);
    }
    
    return false;
  }
}

export function generateEmailTemplate(type: string, data: any): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  switch (type) {
    case 'welcome':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">Welcome to Evently! 🎉</h2>
            <p>Hi ${data.fullName || 'there'},</p>
            <p>Thank you for registering with Evently! We're excited to have you join our community.</p>
            <p>To get started, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verifyLink}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Evently. All rights reserved.</p>
          </div>
        </div>
      `;

    case 'email_verification':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">Verify Your Email</h2>
            <p>Click the link below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verifyLink}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
          </div>
        </div>
      `;

    case 'friend_request':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">New Friend Request</h2>
            <p>${data.fromName} has sent you a friend request.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/friends" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
            </div>
          </div>
        </div>
      `;

    case 'friend_accepted':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">Friend Request Accepted</h2>
            <p>${data.fromName} has accepted your friend request!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/profile?userId=${data.userId}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Profile</a>
            </div>
          </div>
        </div>
      `;

    case 'event_reminder':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">Event Reminder</h2>
            <p>Don't forget! <strong>${data.eventName}</strong> is coming up soon.</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/events/${data.eventId}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Event</a>
            </div>
          </div>
        </div>
      `;

    case 'event_joined':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">Someone Joined Your Event</h2>
            <p>${data.participantName} has joined your event: <strong>${data.eventName}</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/events/${data.eventId}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Event</a>
            </div>
          </div>
        </div>
      `;

    case 'password_reset':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/reset-password?token=${data.token}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
          </div>
        </div>
      `;

    case 'password_reset_otp':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #14b8a6; margin-top: 0;">Password Reset OTP</h2>
            <p>Hi ${data.fullName || 'there'},</p>
            <p>You requested to reset your password. Use the following OTP (One-Time Password) to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.otp}</div>
              </div>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;"><strong>This OTP will expire in 10 minutes.</strong></p>
            <p style="color: #666; font-size: 14px; text-align: center;">If you didn't request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">© ${new Date().getFullYear()} Evently. All rights reserved.</p>
          </div>
        </div>
      `;

    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>${data.message || 'You have a new notification.'}</p>
        </div>
      `;
  }
}
