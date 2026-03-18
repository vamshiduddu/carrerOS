import PlanCard from './PlanCard';

interface PricingTableProps {
  plans: any[];
  currentPlanId?: string;
  onSelect: (planId: string) => void;
}

export default function PricingTable({ plans, currentPlanId, onSelect }: PricingTableProps) {
  if (plans.length === 0) {
    return (
      <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
        No plans available.
      </div>
    );
  }

  // Mark the middle-ish plan as popular if there are 3+
  const popularIndex = plans.length >= 3 ? 1 : -1;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
      gap: '1rem',
      alignItems: 'start',
    }}>
      {plans.map((plan: any, i: number) => (
        <PlanCard
          key={plan.name ?? plan.id ?? i}
          plan={plan}
          current={currentPlanId === (plan.name ?? plan.id)}
          onSelect={() => onSelect(plan.name ?? plan.id)}
          popular={i === popularIndex}
        />
      ))}
    </div>
  );
}
