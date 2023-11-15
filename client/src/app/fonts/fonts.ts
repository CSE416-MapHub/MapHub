import localFont from 'next/font/local';
import { Fira_Sans, Sofia_Sans_Condensed } from 'next/font/google';

const firaSans = Fira_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--fira',
});
const sofiaSansCondensed = Sofia_Sans_Condensed({
  subsets: ['latin'],
  variable: '--sofia',
});
const boxIcons = localFont({
  src: [
    {
      path: './boxicons.eot',
    },
    {
      path: './boxicons.woff2',
    },
    {
      path: './boxicons.woff'
    },
    {
      path: './boxicons.ttf',
    },
  ],
  weight: '400',
  style: 'normal',
  variable: '--boxicons',
});

export {firaSans, sofiaSansCondensed, boxIcons};
