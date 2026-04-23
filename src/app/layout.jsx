import "./globals.css";
import { Geist, Archivo, Inter, Poppins } from "next/font/google";
import ThemeInit from "@/components/common/theme-init";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

// const inter = Inter({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-sans",
// });
const Achivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-googlesansflex",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${Achivo.variable}`}>
      <body className="min-h-screen flex flex-col  font-sans">
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}