import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BaseAccountProvider } from "./contexts/BaseAccountContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PaymentProvider } from "./contexts/PaymentContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini e-Commerce Checkout - Base Account Demo",
  description: "A demo showcasing Base Account features including authentication, payments, and sub-accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
            <BaseAccountProvider>
              <AuthProvider>
                <PaymentProvider>
                  {children}
                </PaymentProvider>
              </AuthProvider>
            </BaseAccountProvider>
      </body>
    </html>
  );
}
