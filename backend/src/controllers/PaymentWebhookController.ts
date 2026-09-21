import { Request, Response } from 'express';
import { paymentService } from '../services/PaymentService';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export class PaymentWebhookController {
  /**
   * POST /api/v1/webhooks/payments/paystack
   * Handle Paystack payment events
   */
  async handlePaystackWebhook(req: Request, res: Response) {
    try {
      const event = req.body;

      // Verify webhook signature (in production)
      // const signature = req.headers['x-paystack-signature'];
      // if (!this.verifyPaystackSignature(signature, req.body)) {
      //   return res.status(401).json({ error: 'Invalid signature' });
      // }

      logger.info('Paystack webhook received:', event.event);

      switch (event.event) {
        case 'charge.success':
          await this.handlePaymentSuccess(event.data);
          break;
        
        case 'charge.failed':
          await this.handlePaymentFailure(event.data, event.data.gateway_response || 'Payment failed');
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data, 'Recurring payment failed');
          break;
        
        case 'subscription.disable':
          await this.handleSubscriptionCancellation(event.data);
          break;
        
        default:
          logger.info(`Unhandled Paystack event: ${event.event}`);
      }

      res.json({ status: 'success' });
    } catch (error: any) {
      logger.error('Error processing Paystack webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/webhooks/payments/flutterwave
   * Handle Flutterwave payment events
   */
  async handleFlutterwaveWebhook(req: Request, res: Response) {
    try {
      const event = req.body;

      logger.info('Flutterwave webhook received:', event.event);

      switch (event.event) {
        case 'charge.completed':
          if (event.data.status === 'successful') {
            await this.handlePaymentSuccess(event.data);
          } else {
            await this.handlePaymentFailure(event.data, event.data.flw_ref || 'Payment failed');
          }
          break;
        
        default:
          logger.info(`Unhandled Flutterwave event: ${event.event}`);
      }

      res.json({ status: 'success' });
    } catch (error: any) {
      logger.error('Error processing Flutterwave webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentData: any) {
    const transactionRef = paymentData.reference || paymentData.tx_ref;
    
    if (!transactionRef) {
      logger.error('No transaction reference in payment data');
      return;
    }

    try {
      await paymentService.handlePaymentSuccess(transactionRef);
      logger.info(`Payment success processed for ${transactionRef}`);
    } catch (error: any) {
      logger.error(`Error processing payment success for ${transactionRef}:`, error);
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentData: any, reason: string) {
    const transactionRef = paymentData.reference || paymentData.tx_ref;
    
    if (!transactionRef) {
      logger.error('No transaction reference in payment data');
      return;
    }

    try {
      await paymentService.handlePaymentFailure(transactionRef, reason);
      logger.info(`Payment failure processed for ${transactionRef}: ${reason}`);
    } catch (error: any) {
      logger.error(`Error processing payment failure for ${transactionRef}:`, error);
    }
  }

  /**
   * Handle subscription cancellation
   */
  private async handleSubscriptionCancellation(subscriptionData: any) {
    logger.info('Subscription cancelled:', subscriptionData);
    // In production, update store membership status
  }

  /**
   * Verify Paystack webhook signature (placeholder)
   */
  private verifyPaystackSignature(signature: string, payload: any): boolean {
    // In production, verify the signature using your Paystack secret key
    // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET)
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    // return hash === signature;
    return true; // Placeholder
  }
}

export const paymentWebhookController = new PaymentWebhookController();
