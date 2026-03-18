import Link from 'next/link';

export default function Page() {
	return (
		<main className='panel' style={{ padding: '1rem' }}>
			<h1 className='title-display' style={{ marginTop: 0 }}>Create Resume</h1>
			<p style={{ color: 'var(--muted)' }}>Use the resume board to create and manage resume versions.</p>
			<Link className='btn btn-primary' href='/resume'>Go to Resume Board</Link>
		</main>
	);
}

