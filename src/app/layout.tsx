import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/hooks/use-data';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/app-layout';

export const metadata: Metadata = {
  title: 'Navyata Track',
  description: 'Daily transactions tracking for Navyata Boutique',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <DataProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
