import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export class EmailService {
  private transporter: Transporter | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const emailPort = parseInt(process.env.EMAIL_PORT || "587");

    if (emailUser && emailPassword) {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      try {
        await this.transporter.verify();
        this.enabled = true;
        console.log("Email service initialized successfully");
      } catch (error) {
        console.error("Email service verification failed:", error);
        this.enabled = false;
      }
    } else {
      console.log("Email credentials not found. Email service disabled.");
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      console.log("Email service not enabled. Email not sent.");
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  async sendOrderNotification(orderDetails: {
    adminEmail: string;
    buyerName: string;
    artworkTitle: string;
    size: string;
    price: number;
    orderId: string;
  }): Promise<boolean> {
    const html = `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
      <p><strong>Buyer:</strong> ${orderDetails.buyerName}</p>
      <p><strong>Artwork:</strong> ${orderDetails.artworkTitle}</p>
      <p><strong>Size:</strong> ${orderDetails.size}</p>
      <p><strong>Price:</strong> ${(orderDetails.price / 100).toFixed(2)} EGP</p>
      <p>Please review and confirm this order in the admin dashboard.</p>
    `;

    return this.sendEmail(
      orderDetails.adminEmail,
      `New Order: ${orderDetails.artworkTitle}`,
      html
    );
  }

  async sendBidNotification(bidDetails: {
    adminEmail: string;
    bidderName: string;
    artworkTitle: string;
    amount: number;
    bidId: string;
  }): Promise<boolean> {
    const html = `
      <h2>New Bid Placed</h2>
      <p><strong>Bid ID:</strong> ${bidDetails.bidId}</p>
      <p><strong>Bidder:</strong> ${bidDetails.bidderName}</p>
      <p><strong>Artwork:</strong> ${bidDetails.artworkTitle}</p>
      <p><strong>Bid Amount:</strong> ${(bidDetails.amount / 100).toFixed(2)} EGP</p>
    `;

    return this.sendEmail(
      bidDetails.adminEmail,
      `New Bid: ${bidDetails.artworkTitle}`,
      html
    );
  }

  async sendAuctionWinnerNotification(winnerDetails: {
    email: string;
    name: string;
    artworkTitle: string;
    winningBid: number;
  }): Promise<boolean> {
    const html = `
      <h2>Congratulations! You Won the Auction</h2>
      <p>Dear ${winnerDetails.name},</p>
      <p>You have won the auction for <strong>${winnerDetails.artworkTitle}</strong>!</p>
      <p><strong>Your Winning Bid:</strong> ${(winnerDetails.winningBid / 100).toFixed(2)} EGP</p>
      <p>We will contact you shortly to complete the purchase.</p>
      <p>Thank you for your participation!</p>
    `;

    return this.sendEmail(
      winnerDetails.email,
      `Auction Won: ${winnerDetails.artworkTitle}`,
      html
    );
  }

  async sendLowStockAlert(alertDetails: {
    adminEmail: string;
    artworkTitle: string;
    size: string;
    remainingStock: number;
  }): Promise<boolean> {
    const html = `
      <h2>Low Stock Alert</h2>
      <p><strong>Artwork:</strong> ${alertDetails.artworkTitle}</p>
      <p><strong>Size:</strong> ${alertDetails.size}</p>
      <p><strong>Remaining Stock:</strong> ${alertDetails.remainingStock}</p>
      <p>Please consider restocking or updating the artwork status.</p>
    `;

    return this.sendEmail(
      alertDetails.adminEmail,
      `Low Stock Alert: ${alertDetails.artworkTitle}`,
      html
    );
  }

  async sendPaymentProofNotification(proofDetails: {
    adminEmail: string;
    orderId: string;
    buyerName: string;
    artworkTitle: string;
    referenceNumber: string;
  }): Promise<boolean> {
    const html = `
      <h2>Payment Proof Uploaded</h2>
      <p><strong>Order ID:</strong> ${proofDetails.orderId}</p>
      <p><strong>Buyer:</strong> ${proofDetails.buyerName}</p>
      <p><strong>Artwork:</strong> ${proofDetails.artworkTitle}</p>
      <p><strong>Reference Number:</strong> ${proofDetails.referenceNumber}</p>
      <p>Please review and verify the payment proof in the admin dashboard.</p>
    `;

    return this.sendEmail(
      proofDetails.adminEmail,
      `Payment Proof Uploaded: Order ${proofDetails.orderId}`,
      html
    );
  }
}

export const emailService = new EmailService();
