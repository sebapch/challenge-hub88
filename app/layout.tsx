import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ApolloProviderWrapper from "./components/ApolloProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Country Filter Challenge",
  description: "Filter countries challenge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloProviderWrapper>
          {children}
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}