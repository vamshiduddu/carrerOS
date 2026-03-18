interface LoadingSkeletonProps {
  rows?: number;
  type?: 'card' | 'list' | 'text';
}

export default function LoadingSkeleton({ rows = 3, type = 'list' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 140, borderRadius: 18 }} />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 16, borderRadius: 6, width: i === rows - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  // list (default)
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
      ))}
    </div>
  );
}
