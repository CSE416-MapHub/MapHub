import type { Metadata } from 'next';
import { Fira_Sans, Sofia_Sans_Condensed } from 'next/font/google';
import './globals.css';

const firaSans = Fira_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});
const sofiaSansCondensed = Sofia_Sans_Condensed({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MapHub',
  description: 'Your one stop map editor ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className={`${firaSans.className} ${sofiaSansCondensed.className}`}
      >
        {children}
      </body>
    </html>
  );
}
