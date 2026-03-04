import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuthorityOS",
  description: "AI Search Authority Scanner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#070d18] text-white`}>

        <Navbar />

        {children}

        <Footer />

      </body>
    </html>
  );
}

function Navbar() {
  return (
    <div className="w-full border-b border-white/10 backdrop-blur sticky top-0 z-50 bg-[#070d18]/80">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        <div className="font-bold text-xl text-[#eaff00]">
          AuthorityOS
        </div>

        <div className="text-sm text-slate-300">
          AI Search Authority Scanner
        </div>

      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-white/10 mt-40">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-slate-400 flex justify-between">

        <div>
          © {new Date().getFullYear()} AuthorityOS
        </div>

        <div>
          Built for AI Search
        </div>

      </div>
    </div>
  );
}
