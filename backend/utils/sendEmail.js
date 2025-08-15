import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Welcome to EventEase! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #000; color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to EventEase!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your event management journey starts here</p>
        </div>
        <div style="background-color: #fff; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #000; margin-top: 0;">Hello ${name}! 👋</h2>
          <p style="color: #333; line-height: 1.6;">
            Thank you for joining EventEase! We're excited to have you on board.
          </p>
          <p style="color: #333; line-height: 1.6;">
            With EventEase, you can:
          </p>
          <ul style="color: #333; line-height: 1.6;">
            <li>Discover amazing events</li>
            <li>Book your favorite events</li>
            <li>Create and manage your own events</li>
            <li>Connect with event organizers</li>
          </ul>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Exploring</a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendBookingConfirmationEmail = async (email, userName, eventTitle, eventDate, eventLocation, ticketId) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Booking Confirmation - EventEase 📅',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #000; color: #fff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your event is locked in</p>
        </div>
        <div style="background-color: #fff; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #000; margin-top: 0;">Hello ${userName}! 🎉</h2>
          <p style="color: #333; line-height: 1.6;">
            Your booking has been confirmed successfully!
          </p>
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #000; margin-top: 0;">Event Details:</h3>
            <p style="color: #333; margin: 5px 0;"><strong>Event:</strong> ${eventTitle}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Time:</strong> ${new Date(eventDate).toLocaleTimeString()}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Location:</strong> ${eventLocation}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Ticket ID:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${ticketId}</span></p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            We look forward to seeing you at the event! Don't forget to mark your calendar.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/bookings" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View My Bookings</a>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
            If you need to cancel or modify your booking, please visit your bookings page.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
}; 