import WhatsAppButton from "../WhatsAppButton";

export default function WhatsAppButtonExample() {
  return (
    <div className="p-8 max-w-md">
      <WhatsAppButton
        artworkTitle="Golden Flow"
        size="Medium"
        price={4800}
        onOrderCreate={() => console.log("Order created")}
      />
    </div>
  );
}
