"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide navbar and footer on admin pages to prevent duplication with admin layout
  if (pathname?.startsWith("/admin")) {
    return <main className="flex-1">{children}</main>
  }
  
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
