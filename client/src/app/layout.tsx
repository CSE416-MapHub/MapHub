import type { Metadata } from 'next';
import { Fira_Sans, Sofia_Sans_Condensed } from 'next/font/google';
import ThemeProvider from '../context/themeProvider';
import './globals.scss';

const firaSans = Fira_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--fira',
});
const sofiaSansCondensed = Sofia_Sans_Condensed({
  subsets: ['latin'],
  variable: '--sofia',
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
    <html 
      lang="en"
      className={`${firaSans.variable} ${sofiaSansCondensed.variable}`}
    >
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
