import { Notification } from '../models/Notification';

export class NotificationService {
  /**
   * Send email notification
   */
  async sendEmailNotification(notification: Notification): Promise<void> {
    // In production, integrate with SendGrid, Mailgun, or AWS SES
    // For now, we'll log the email content
    
    const htmlTemplate = this.renderEmailTemplate(notification);
    
    console.log('📧 Sending email notification:');
    console.log('To:', notification.userId); // In production, get user email from User model
    console.log('Subject:', `🔥 Price Drop Alert: ${notification.productName}`);
    console.log('Content:', htmlTemplate.substring(0, 200) + '...');
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production:
    // await sendgrid.send({
    //   to: userEmail,
    //   from: 'alerts@pricewise.com',
    //   subject: `🔥 Price Drop Alert: ${notification.productName}`,
    //   html: htmlTemplate
    // });
  }

  /**
   * Send SMS notification
   */
  async sendSmsNotification(notification: Notification): Promise<void> {
    // In production, integrate with Twilio, Termii, or other SMS providers
    const smsMessage = this.renderSmsTemplate(notification);
    
    console.log('📱 Sending SMS notification:');
    console.log('To:', notification.userId); // In production, get user phone from User model
    console.log('Message:', smsMessage);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production:
    // await twilio.messages.create({
    //   body: smsMessage,
    //   from: '+1234567890',
    //   to: userPhone
    // });
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification: Notification): Promise<void> {
    // In production, integrate with Firebase Cloud Messaging (FCM) or OneSignal
    const pushPayload = this.renderPushTemplate(notification);
    
    console.log('🔔 Sending push notification:');
    console.log('To:', notification.userId); // In production, get user device tokens
    console.log('Payload:', JSON.stringify(pushPayload, null, 2));
    
    // Simulate push notification delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production:
    // await admin.messaging().sendToDevice(deviceToken, pushPayload);
  }

  /**
   * Render HTML email template
   */
  private renderEmailTemplate(notification: Notification): string {
    const savingsPercentage = notification.savingsPercentage.toFixed(1);
    const allTimeLowBadge = notification.isAllTimeLow 
      ? '<div style="background: #FFD700; color: #000; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0;">🏆 ALL-TIME LOW PRICE!</div>'
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Drop Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔥 Price Drop Alert!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Good news! A product on your watchlist just dropped in price.</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              ${allTimeLowBadge}
              
              <h2 style="color: #333; margin: 20px 0 10px 0; font-size: 22px;">${notification.productName}</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td width="50%" style="padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Old Price</p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 20px; text-decoration: line-through;">₦${notification.oldPrice.toLocaleString()}</p>
                  </td>
                  <td width="50%" style="padding: 15px; background-color: #e8f5e9; border-radius: 8px;">
                    <p style="margin: 0; color: #2e7d32; font-size: 14px;">New Price</p>
                    <p style="margin: 5px 0 0 0; color: #2e7d32; font-size: 24px; font-weight: bold;">₦${notification.newPrice.toLocaleString()}</p>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #e65100; font-size: 16px; font-weight: bold;">
                  💰 You save ₦${notification.savingsAmount.toLocaleString()} (${savingsPercentage}%)
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px; margin: 20px 0 10px 0;">
                <strong>Available at:</strong> ${notification.retailerName}
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${notification.affiliateUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                      Buy Now →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 30px 0 0 0;">
                This alert was sent because you're watching this product on PriceWise.<br>
                <a href="#" style="color: #667eea;">Manage your watchlist</a> | <a href="#" style="color: #667eea;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                © 2024 PriceWise. All rights reserved.<br>
                Compare prices. Save money. Shop smarter.
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

  /**
   * Render SMS template
   */
  private renderSmsTemplate(notification: Notification): string {
    const savingsPercentage = notification.savingsPercentage.toFixed(1);
    const allTimeLow = notification.isAllTimeLow ? ' 🏆ALL-TIME LOW!' : '';
    
    return `🔥 PRICE DROP ALERT!${allTimeLow}\n\n${notification.productName}\n\nWas: ₦${notification.oldPrice.toLocaleString()}\nNow: ₦${notification.newPrice.toLocaleString()}\n\n💰 Save ₦${notification.savingsAmount.toLocaleString()} (${savingsPercentage}%)\n\nAvailable at: ${notification.retailerName}\n\nBuy now: ${notification.affiliateUrl}\n\n- PriceWise`;
  }

  /**
   * Render push notification template
   */
  private renderPushTemplate(notification: Notification): any {
    const savingsPercentage = notification.savingsPercentage.toFixed(1);
    
    return {
      notification: {
        title: notification.isAllTimeLow 
          ? '🏆 All-Time Low Price!' 
          : '🔥 Price Drop Alert!',
        body: `${notification.productName} dropped to ₦${notification.newPrice.toLocaleString()} (Save ${savingsPercentage}%)`,
        icon: 'https://pricewise.com/icon.png',
        badge: 'https://pricewise.com/badge.png',
        click_action: notification.affiliateUrl
      },
      data: {
        type: 'price_drop',
        productId: notification.masterProductId,
        watchlistItemId: notification.watchlistItemId,
        url: notification.affiliateUrl
      }
    };
  }
}

export const notificationService = new NotificationService();
