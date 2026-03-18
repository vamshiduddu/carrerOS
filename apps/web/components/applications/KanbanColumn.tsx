import ApplicationCard from './ApplicationCard';

interface KanbanColumnProps {
  status: string;
  label: string;
  applications: any[];
  color: string;
}

export default function KanbanColumn({ status, label, applications, color }: KanbanColumnProps) {
  return (
    <div className="kanban-col">
      <div className="kanban-col-header">
        <span className="kanban-col-title" style={{ color }}>{label}</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, borderRadius: '50%',
          fontSize: '0.7rem', fontWeight: 700,
          background: `${color}18`, color,
        }}>
          {applications.length}
        </span>
      </div>
      <div className="kanban-cards">
        {applications.map(app => (
          <ApplicationCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <div style={{
            padding: '1rem', textAlign: 'center',
            color: 'var(--muted)', fontSize: '0.8rem',
            border: '2px dashed var(--line-solid)', borderRadius: 12,
          }}>
            No applications
          </div>
        )}
      </div>
    </div>
  );
}
