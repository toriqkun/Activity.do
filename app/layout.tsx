import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ProfileProvider } from "./context/ProfileContext";

export const metadata: Metadata = {
  title: "Activity.do: Your Daily Operations, Done.",
  description: "Build Todo App with Next JS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ProfileProvider>{children}</ProfileProvider>
        <Toaster position="bottom-right" reverseOrder={false} />
      </body>
    </html>
  );
}
