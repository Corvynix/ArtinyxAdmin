import ScarcityBadge from "../ScarcityBadge";

export default function ScarcityBadgeExample() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <ScarcityBadge remaining={8} total={10} delay={0} />
      <ScarcityBadge remaining={3} total={10} delay={0} />
      <ScarcityBadge remaining={1} total={5} delay={0} />
      <ScarcityBadge remaining={0} total={5} delay={0} />
    </div>
  );
}
