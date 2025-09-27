import axios from "axios";

class EventUpdateService {
  constructor() {
    this.baseURL = process.env.SMYTHOS_AGENT_URL||"https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai";
    //this.apiKey = process.env.SMYTHOS_API_KEY;
  }

  /**
   * Send event update notifications to contacts in Google Sheet
   * @param {Object} updateData - The update data
   * @param {string} updateData.sheetLink - Google Sheet Link/URL
   * @param {string} updateData.emailSubject - Email subject
   * @param {string} updateData.emailBody - Email body content
   */
  async sendEventUpdate(updateData) {
    const { sheetLink, emailSubject, emailBody } = updateData;
    
    const payload = {
      sheetLink,
      emailSubject,
      emailBody
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/api/send_event_update`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log('✅ Event update sent successfully:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Event update sent successfully'
      };

    } catch (error) {
      console.error('❌ Error sending event update:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to send event update'
      };
    }
  }

  /**
   * Validate required fields for event update
   */
  validateEventUpdate(data) {
    const required = ['sheetLink', 'emailSubject', 'emailBody'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Generate formatted email body for event updates
   */
  generateEventUpdateEmail(eventData, customMessage = '') {
    const { eventName, dateTime, location, eventType, description } = eventData;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📅 Event Update</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Important information about your upcoming event</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">${eventName}</h2>
            <div style="margin: 15px 0;">
              <p style="margin: 8px 0; font-size: 16px;"><strong>📅 Date & Time:</strong> ${new Date(dateTime).toLocaleString()}</p>
              <p style="margin: 8px 0; font-size: 16px;"><strong>📍 Location:</strong> ${location}</p>
              <p style="margin: 8px 0; font-size: 16px;"><strong>🎯 Event Type:</strong> ${eventType}</p>
              ${description ? `<p style="margin: 8px 0; font-size: 16px;"><strong>📝 Description:</strong> ${description}</p>` : ''}
            </div>
          </div>
          
          ${customMessage ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; margin-bottom: 20px;">
              <h3 style="color: #1976d2; margin-top: 0;">📢 Additional Information</h3>
              <p style="margin-bottom: 0; color: #333; line-height: 1.6;">${customMessage}</p>
            </div>
          ` : ''}
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404; font-weight: 500;">⏰ Please mark your calendar and arrive 15 minutes early for check-in.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin: 0;">Thank you for your attention!</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Best regards, Event Management Team</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #999; margin: 0;">
            This is an automated notification from Eventure Event Management System.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate reminder email for upcoming events
   */
  generateReminderEmail(eventData, hoursUntilEvent) {
    const timeText = hoursUntilEvent <= 24 ? 
      (hoursUntilEvent <= 1 ? 'in less than an hour!' : `in ${hoursUntilEvent} hours!`) :
      `in ${Math.ceil(hoursUntilEvent / 24)} days!`;

    return this.generateEventUpdateEmail(eventData, 
      `🔔 <strong>Reminder:</strong> This event is starting ${timeText} Don't forget to prepare and arrive on time.`
    );
  }

  /**
   * Send bulk notification for event updates
   */
  async sendBulkEventNotification(eventData, sheetLink, customMessage = '') {
    try {
      const emailSubject = `Important Update: ${eventData.eventName}`;
      const emailBody = this.generateEventUpdateEmail(eventData, customMessage);

      return await this.sendEventUpdate({
        sheetLink,
        emailSubject,
        emailBody
      });
    } catch (error) {
      console.error('Error sending bulk event notification:', error);
      throw error;
    }
  }

  /**
   * Send event reminder notification
   */
  async sendEventReminder(eventData, sheetLink) {
    try {
      const eventDate = new Date(eventData.dateTime);
      const now = new Date();
      const hoursUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60));

      const emailSubject = `Reminder: ${eventData.eventName} - Starting Soon!`;
      const emailBody = this.generateReminderEmail(eventData, hoursUntilEvent);

      return await this.sendEventUpdate({
        sheetLink,
        emailSubject,
        emailBody
      });
    } catch (error) {
      console.error('Error sending event reminder:', error);
      throw error;
    }
  }
}

export default new EventUpdateService();
