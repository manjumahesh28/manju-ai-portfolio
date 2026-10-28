import './globals.css';

export const metadata = {
  title: 'Manju Mahesh — Full-stack developer',
  description: 'Manju Mahesh, full-stack developer in Abu Dhabi. Ask the on-page assistant about her projects and experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}