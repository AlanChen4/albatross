import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Reenie_Beanie } from "next/font/google";
import "./globals.css";

const reenieBeanie = Reenie_Beanie({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Albatross",
  description: "Daily lateral thinking puzzles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static theme detection script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${reenieBeanie.className} relative`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
