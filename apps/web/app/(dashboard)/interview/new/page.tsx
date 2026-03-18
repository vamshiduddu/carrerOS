import Link from 'next/link';

export default function Page() {
	return (
		<main className='panel' style={{ padding: '1rem' }}>
			<h1 className='title-display' style={{ marginTop: 0 }}>New Interview Session</h1>
			<p style={{ color: 'var(--muted)' }}>Use the Interview page to create and launch a session.</p>
			<Link className='btn btn-primary' href='/interview'>Go to Interview</Link>
		</main>
	);
}

