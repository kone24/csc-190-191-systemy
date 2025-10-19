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
    let inactivityTimer: NodeJS.Timeout;

    // resets timer back to 0 upon detected user activity
    // if no user activity for 20 minutes, their session times out
    // reloading the page and requiring re-log-in to verify credentials
    function resetTimer() {
      clearTimeout(inactivityTimer);      // clear timer (restart/start at 0)
      inactivityTimer = setTimeout(() => {
        alert("Session expired. Please log in again.");     // error message
        localStorage.removeItem("token"); // remove tokens on expiration
        window.location.reload();         // reload page to 'log out' or let user have invalid log in credentails again
      }, 20 * 60 * 1000);                 // 20 minutes
    }

    // Listen to user activity events (keeps them logged in if activity detected)
    ["click", "mousemove", "keypress"].forEach((evt) =>
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
