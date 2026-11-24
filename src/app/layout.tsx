import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetailFlow | Control de inventario",
  description: "Gestión inteligente de inventario multi-tienda.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
