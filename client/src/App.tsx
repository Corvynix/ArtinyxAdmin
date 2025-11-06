import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ArtworkPage from "@/pages/ArtworkPage";
import Gallery from "@/pages/Gallery";
import Auctions from "@/pages/Auctions";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import Terms from "@/pages/Terms";
import AdminArtworks from "@/pages/AdminArtworks";
import AdminOrders from "@/pages/AdminOrders";
import AdminBids from "@/pages/AdminBids";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminDashboard from "@/pages/AdminDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import WallOfFame from "@/pages/WallOfFame";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/auctions" component={Auctions} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-orders" component={CustomerDashboard} />
      <Route path="/wall-of-fame" component={WallOfFame} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/artworks/:slug" component={ArtworkPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/artworks" component={AdminArtworks} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/bids" component={AdminBids} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
