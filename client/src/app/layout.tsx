import type { Metadata } from 'next';
import { firaSans, sofiaSansCondensed, boxIcons } from './fonts/fonts';
import ThemeProvider from '../context/themeProvider';
import NavBar from './components/navBar';
import './styles/globals.scss';
import './styles/boxicons.css';

export const metadata: Metadata = {
  title: 'MapHub',
  description: 'A complete map visuals studio.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${firaSans.variable} ${sofiaSansCondensed.variable} ${boxIcons.variable}`}
    >
      <body>
        <ThemeProvider>
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
