import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { CategoryProvider } from "@/context/CategoryContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "D.SHOP Admin Dashboard",
  description: "Manage your D.SHOP",
};

export default function RootLayout({ children }) {
  return (
    <CategoryProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#0f172a",
              },
            }}
          />
          <Navbar />
          <main className="flex-1 overflow-y-auto p-5">{children}</main>
        </div>
      </div>
    </CategoryProvider>
  );
}
