import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/ThemeProvider";
import TanstackProvider from "@/providers/TanstackProvider";
import { cookies } from "next/headers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Yuri Perfections | Precision Craftsmanship. Exceptional Finishes.",
  description:
    "At Yuri Perfections, we deliver high-quality interior and exterior finishing solutions for both residential and commercial spaces. With a strong focus on precision, craftsmanship, and detail, we transform environments into refined, functional spaces built to last.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const getCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("theme");
  };

  const defaultTheme = await getCookie();

  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <TanstackProvider>
          <ThemeProvider defaultTheme={defaultTheme?.value}>
            {children}
          </ThemeProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}