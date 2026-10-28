import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata = {
  title: 'Manju Mahesh — Full-stack Developer',
  description:
    'Manju Mahesh, full-stack developer in Abu Dhabi building with React, Django and applied AI. Ask the on-page assistant about her projects and experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${grotesk.variable}`}>{children}</body>
    </html>
  );
}