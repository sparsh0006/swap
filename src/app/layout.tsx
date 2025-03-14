import '@/app/global.css';
import { WalletProvider } from '../components/WalletButton';

export const metadata = {
  title: 'Sonic Swap',
  description: 'Swap USDC to SONIC tokens on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}