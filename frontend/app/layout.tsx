"use client"; 

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";      // needed for the expiration tokens

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // after 20 minutes of inactivity, the session is set to expire, 
  // token is cleared, and the page reloads
  useEffect(() => {
    let inactivityTimer: number;

    const logout = () => {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.reload();
    };

    const resetTimer = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(
        logout,
        20 * 60 * 1000 // 20 minutes
      );
    };

    const activityEvents = ["click", "mousemove", "keypress"];

    activityEvents.forEach((evt) =>
      window.addEventListener(evt, resetTimer)
    );
    resetTimer(); // start timer

    return () => {
      ["click", "mousemove", "keypress"].forEach((evt) =>
        window.removeEventListener(evt, resetTimer)
      );
      clearTimeout(inactivityTimer);
    };
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}