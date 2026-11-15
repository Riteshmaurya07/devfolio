import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devfolio OS | Developer Portfolio & Metrics Dashboard",
  description: "A calm, unified developer portfolio, dashboard, and metrics operating system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('devfolio-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
        <ThemeProvider>
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                borderRadius: '8px',
              }
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
