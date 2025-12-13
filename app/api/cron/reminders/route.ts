import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/utils/email';

// Secret key to protect cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'default-cron-secret';

// GET /api/cron/reminders - Send event reminders (called by cron job)
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find events happening in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingEvents = await Event.find({
      date: {
        $gte: now,
        $lte: tomorrow,
      },
      status: 'open',
    }).populate('participants', 'fullName email');

    let remindersSent = 0;
    const errors: string[] = [];

    for (const event of upcomingEvents) {
      for (const participant of event.participants) {
        try {
          // Create in-app notification
          await Notification.create({
            userId: participant._id,
            type: 'reminder',
            title: 'Event Reminder',
            message: `${event.eventName} is happening tomorrow at ${event.time}!`,
            data: {
              eventId: event._id,
              eventName: event.eventName,
            },
          });

          // Send email reminder
          if (participant.email) {
            await sendEmail({
              to: participant.email,
              subject: `Reminder: ${event.eventName} is Tomorrow!`,
              html: generateReminderEmail(event, participant),
            });
          }

          remindersSent++;
        } catch (err: any) {
          errors.push(`Failed to send reminder to ${participant.email}: ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: upcomingEvents.length,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Reminder cron error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

// POST /api/cron/reminders - Manually trigger reminder for specific event
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const event = await Event.findById(eventId).populate('participants', 'fullName email');

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let remindersSent = 0;

    for (const participant of event.participants) {
      try {
        await Notification.create({
          userId: participant._id,
          type: 'reminder',
          title: 'Event Reminder',
          message: `Don't forget: ${event.eventName} at ${event.time}!`,
          data: {
            eventId: event._id,
            eventName: event.eventName,
          },
        });

        if (participant.email) {
          await sendEmail({
            to: participant.email,
            subject: `Reminder: ${event.eventName}`,
            html: generateReminderEmail(event, participant),
          });
        }

        remindersSent++;
      } catch (err: any) {
        console.error(`Failed to send reminder to ${participant.email}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
    });
  } catch (error: any) {
    console.error('Manual reminder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

function generateReminderEmail(event: any, participant: any): string {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #14b8a6, #06b6d4); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Event Reminder 🎉</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">
                    Hi ${participant.fullName.split(' ')[0]},
                  </p>
                  
                  <p style="color: #374151; font-size: 16px; margin: 0 0 30px;">
                    This is a friendly reminder that you have an upcoming event:
                  </p>
                  
                  <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h2 style="color: #0f766e; margin: 0 0 10px; font-size: 20px;">${event.eventName}</h2>
                    <p style="color: #374151; margin: 5px 0; font-size: 14px;">📅 ${eventDate}</p>
                    <p style="color: #374151; margin: 5px 0; font-size: 14px;">⏰ ${event.time}</p>
                    <p style="color: #374151; margin: 5px 0; font-size: 14px;">📍 ${event.location}</p>
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event._id}" 
                           style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          View Event Details
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    You received this email because you're registered for this event.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
