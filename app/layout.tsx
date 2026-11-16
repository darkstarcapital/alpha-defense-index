import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata = {
  title: "NorthMan Analytics",
  description: "Institutional-grade indices for the modern investor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}