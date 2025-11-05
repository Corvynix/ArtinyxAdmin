import PriceDisplay from "../PriceDisplay";

export default function PriceDisplayExample() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <PriceDisplay price={4800} referencePrice={6500} />
      <PriceDisplay price={12000} />
      <PriceDisplay price={2400} referencePrice={3200} language="ar" />
    </div>
  );
}
