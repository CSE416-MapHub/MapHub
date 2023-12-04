import type { Metadata } from 'next';
import { firaSans, sofiaSansCondensed, boxIcons } from './fonts/fonts';

import { AuthProvider } from 'context/AuthProvider';
import NotificationsProvider from 'context/notificationsProvider';
import ThemeProvider from '../context/themeProvider';
import NavBar from './components/navBar';
import SnackPack from './components/snackPack';
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
          <NotificationsProvider>
            <AuthProvider>
              <NavBar />
              {children}
              <SnackPack />
            </AuthProvider>
          </NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
