import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parallel Worlds",
  description: "Experience simultaneous multi-timeline navigation through AI-generated video. Explore four parallel outcomes from a single decision point.",
  keywords: ["AI", "video", "timeline", "parallel worlds", "world model", "interactive"],
  authors: [{ name: "Parallel Worlds" }],
  openGraph: {
    title: "Parallel Worlds | Multi-Timeline Navigation",
    description: "Experience simultaneous multi-timeline navigation through AI-generated video.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-[#09090B] text-white">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(24, 24, 27, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
      </body>
    </html>
  );
}
