import './globals.css';

export const metadata = {
  title: 'CareerOS — AI-Powered Career Management',
  description: 'Build smarter resumes, track applications, and ace interviews with AI. CareerOS is your career command center.',
  keywords: 'resume builder, job search, interview prep, ATS optimizer, career management'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
