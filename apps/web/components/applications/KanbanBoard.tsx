import KanbanColumn from './KanbanColumn';

const COLUMNS = [
  { status: 'saved',     label: 'Saved',     color: 'var(--muted)' },
  { status: 'applied',   label: 'Applied',   color: '#0ea5e9' },
  { status: 'screening', label: 'Screening', color: 'var(--warning)' },
  { status: 'interview', label: 'Interview', color: '#9333ea' },
  { status: 'offer',     label: 'Offer',     color: 'var(--success)' },
  { status: 'rejected',  label: 'Rejected',  color: 'var(--danger)' },
];

interface KanbanBoardProps {
  applications: any[];
}

export default function KanbanBoard({ applications }: KanbanBoardProps) {
  const grouped = COLUMNS.reduce<Record<string, any[]>>((acc, col) => {
    acc[col.status] = applications.filter(a => a.status === col.status);
    return acc;
  }, {});

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <div className="kanban-board" style={{ minWidth: 960 }}>
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            applications={grouped[col.status] ?? []}
            color={col.color}
          />
        ))}
      </div>
    </div>
  );
}
