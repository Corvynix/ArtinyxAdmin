import twilio from "twilio";
import type { Twilio } from "twilio";

export class SMSService {
  private client: Twilio | null = null;
  private enabled: boolean = false;
  private fromNumber: string = "";

  constructor() {
    this.initialize();
  }

  private initialize() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
      this.enabled = true;
      console.log("Twilio SMS service initialized successfully");
    } else {
      console.log("Twilio credentials not found. SMS service disabled.");
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      console.log("SMS service not enabled. SMS not sent.");
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });
      console.log(`SMS sent to ${to}: ${result.sid}`);
      return true;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      return false;
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      console.log("WhatsApp service not enabled. Message not sent.");
      return false;
    }

    const whatsappTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const whatsappFrom = this.fromNumber.startsWith("whatsapp:")
      ? this.fromNumber
      : `whatsapp:${this.fromNumber}`;

    try {
      const result = await this.client.messages.create({
        body: message,
        from: whatsappFrom,
        to: whatsappTo,
      });
      console.log(`WhatsApp message sent to ${to}: ${result.sid}`);
      return true;
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      return false;
    }
  }

  async sendAuctionWinnerSMS(winnerDetails: {
    phone: string;
    name: string;
    artworkTitle: string;
    winningBid: number;
  }): Promise<boolean> {
    const message = `Congratulations ${winnerDetails.name}! You won the auction for "${winnerDetails.artworkTitle}" with a bid of ${(winnerDetails.winningBid / 100).toFixed(2)} EGP. We will contact you shortly to complete the purchase.`;

    return this.sendSMS(winnerDetails.phone, message);
  }

  async sendAuctionWinnerWhatsApp(winnerDetails: {
    phone: string;
    name: string;
    artworkTitle: string;
    winningBid: number;
  }): Promise<boolean> {
    const message = `🎉 Congratulations ${winnerDetails.name}!\n\nYou won the auction for "${winnerDetails.artworkTitle}"\n\n💰 Winning Bid: ${(winnerDetails.winningBid / 100).toFixed(2)} EGP\n\nWe will contact you shortly to complete the purchase.\n\nThank you for participating!`;

    return this.sendWhatsApp(winnerDetails.phone, message);
  }

  async sendOrderConfirmationSMS(orderDetails: {
    phone: string;
    name: string;
    artworkTitle: string;
    invoiceNumber: string;
  }): Promise<boolean> {
    const message = `Thank you ${orderDetails.name}! Your order for "${orderDetails.artworkTitle}" has been confirmed. Invoice: ${orderDetails.invoiceNumber}`;

    return this.sendSMS(orderDetails.phone, message);
  }
}

export const smsService = new SMSService();
