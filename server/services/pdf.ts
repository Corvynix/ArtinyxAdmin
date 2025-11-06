import PDFDocument from "pdfkit";
import { storage } from "../storage";
import type { Order } from "@shared/schema";

export class PDFService {
  async generateInvoice(orderId: string): Promise<Buffer> {
    const order = await storage.getOrder(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const artwork = await storage.getArtwork(order.artworkId);
    if (!artwork) {
      throw new Error("Artwork not found");
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text("ARTINYXUS", 50, 50);
      doc.fontSize(10).text("Invoice", 50, 75);
      doc.moveDown();

      doc.fontSize(12).text(`Invoice Number: ${order.invoiceNumber || "N/A"}`, 50, 120);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 140);
      doc.moveDown();

      doc.fontSize(14).text("Bill To:", 50, 180);
      doc.fontSize(10).text(order.buyerName || "Guest", 50, 200);
      doc.text(`WhatsApp: ${order.whatsapp || "N/A"}`, 50, 215);
      if (order.email) {
        doc.text(`Email: ${order.email}`, 50, 230);
      }
      doc.moveDown();

      doc.fontSize(14).text("Order Details:", 50, 270);
      doc.fontSize(10).text(`Artwork: ${artwork.title}`, 50, 290);
      doc.text(`Size: ${order.size}`, 50, 305);
      doc.text(`Type: ${artwork.type}`, 50, 320);
      doc.moveDown();

      doc.fontSize(12).text(`Amount: ${(order.priceCents / 100).toFixed(2)} EGP`, 50, 360);
      doc.text(`Payment Method: ${order.paymentMethod || "N/A"}`, 50, 380);
      doc.text(`Status: ${order.status}`, 50, 400);

      doc.fontSize(8).text("Thank you for your purchase!", 50, 500, {
        align: "center",
      });

      doc.end();
    });
  }

  async generateSalesReport(
    startDate: Date,
    endDate: Date,
    ordersData: Order[],
    revenueData: {
      totalRevenue: number;
      bestSelling: Array<{
        artworkId: string;
        title: string;
        totalSales: number;
        revenue: number;
      }>;
    }
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text("ARTINYXUS", 50, 50);
      doc.fontSize(14).text("Sales Report", 50, 75);
      doc.fontSize(10).text(
        `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        50,
        95
      );
      doc.moveDown();

      doc.fontSize(12).text("Summary:", 50, 130);
      doc.fontSize(10).text(
        `Total Orders: ${ordersData.length}`,
        50,
        150
      );
      doc.text(
        `Total Revenue: ${(revenueData.totalRevenue / 100).toFixed(2)} EGP`,
        50,
        165
      );
      doc.moveDown();

      doc.fontSize(12).text("Best Selling Artworks:", 50, 200);
      let yPosition = 220;
      revenueData.bestSelling.slice(0, 5).forEach((item, index) => {
        doc.fontSize(10).text(
          `${index + 1}. ${item.title}`,
          50,
          yPosition
        );
        doc.text(
          `   Sales: ${item.totalSales} | Revenue: ${(item.revenue / 100).toFixed(2)} EGP`,
          50,
          yPosition + 15
        );
        yPosition += 35;
      });

      doc.fontSize(12).text("Order Status Breakdown:", 50, yPosition + 20);
      const statusCounts = ordersData.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      yPosition += 40;
      Object.entries(statusCounts).forEach(([status, count]) => {
        doc.fontSize(10).text(`${status}: ${count}`, 50, yPosition);
        yPosition += 15;
      });

      doc.fontSize(8).text(
        `Generated on ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 50,
        { align: "center" }
      );

      doc.end();
    });
  }
}

export const pdfService = new PDFService();
