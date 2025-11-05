import { apiRequest } from "@/lib/queryClient";

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  story: string | null;
  images: string[];
  sizes: Record<string, { price_cents: number; total_copies: number; remaining: number }>;
  type: "unique" | "limited" | "auction";
  status: "available" | "coming_soon" | "sold" | "auction_closed";
  auctionStart: string | null;
  auctionEnd: string | null;
  currentBidCents: number | null;
  minIncrementCents: number | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  artworkId: string;
  size: string;
  priceCents: number;
  buyerName?: string;
  whatsapp?: string;
  paymentMethod?: "vodafone_cash" | "instapay";
}

export interface CreateBidRequest {
  artworkId: string;
  amountCents: number;
  bidderName?: string;
  whatsapp?: string;
}

export interface AnalyticsEvent {
  eventType: "page_view" | "whatsapp_click" | "order_created" | "bid_placed" | "hover_story";
  artworkId?: string;
  meta?: Record<string, any>;
}

export const artworksAPI = {
  getAll: async (): Promise<Artwork[]> => {
    const response = await fetch("/api/artworks");
    if (!response.ok) throw new Error("Failed to fetch artworks");
    return response.json();
  },

  getBySlug: async (slug: string): Promise<Artwork> => {
    const response = await fetch(`/api/artworks/${slug}`);
    if (!response.ok) throw new Error("Artwork not found");
    return response.json();
  }
};

export const ordersAPI = {
  create: async (order: CreateOrderRequest) => {
    return apiRequest("POST", "/api/orders", order);
  }
};

export const bidsAPI = {
  create: async (bid: CreateBidRequest) => {
    return apiRequest("POST", "/api/bids", bid);
  },

  getByArtwork: async (artworkId: string) => {
    const response = await fetch(`/api/artworks/${artworkId}/bids`);
    if (!response.ok) throw new Error("Failed to fetch bids");
    return response.json();
  }
};

export const analyticsAPI = {
  track: async (event: AnalyticsEvent) => {
    return apiRequest("POST", "/api/analytics", event);
  }
};
