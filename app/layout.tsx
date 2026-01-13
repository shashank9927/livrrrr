import type { Metadata } from "next";
import "./globals.css";
import RoomIdContextProvider from "./context/RoomIdContext";
import { Toaster } from 'sonner'
import DarkModeProvider from "./context/DarkModeContext";
import AppBar from "./components/AppBar";
import { Bricolage_Grotesque } from "next/font/google";
import UserIdContextProvider from "./context/UserIdContext";

const bricolage_grotesque_init = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LiveWire",
  description: "Real-time chat rooms - Connect instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage_grotesque_init.className} bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200`}
        suppressHydrationWarning
      >
        <DarkModeProvider>
          <UserIdContextProvider>
            <RoomIdContextProvider>
              <AppBar />
              {children}
              <Toaster />
            </RoomIdContextProvider>
          </UserIdContextProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
