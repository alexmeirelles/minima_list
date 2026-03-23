import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexT',
  description: 'Weekly task manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
