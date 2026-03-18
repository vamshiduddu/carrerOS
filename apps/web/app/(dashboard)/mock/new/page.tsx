import Link from 'next/link';

export default function Page() {
	return (
		<main className='panel' style={{ padding: '1rem' }}>
			<h1 className='title-display' style={{ marginTop: 0 }}>New Mock Session</h1>
			<p style={{ color: 'var(--muted)' }}>Start from the main Mock page to generate your question set.</p>
			<Link className='btn btn-primary' href='/mock'>Go to Mock Interviews</Link>
		</main>
	);
}

