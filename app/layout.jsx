import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Northman Bank Index',
  description: "Track. Analyze. Invest. — India's Next Gen Banking Index",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0B1120] text-white antialiased`}>{children}</body>
    </html>
  );
}
