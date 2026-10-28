import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quizora AI — Adaptive Learning & Knowledge Gap Remediation',
  description: 'Quizora AI: Learn • Practice • Improve. An adaptive learning platform that identifies student knowledge gaps and dynamically adapts their learning path.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
