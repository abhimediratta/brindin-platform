import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brindin Platform',
  description: 'Creative production platform for Indian digital advertising',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
