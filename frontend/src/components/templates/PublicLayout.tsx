import { Outlet } from 'react-router-dom'

import { Footer } from '@/components/organisms/Footer'
import { Navbar } from '@/components/organisms/Navbar'

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main">
      <Navbar />

      <main className="flex-1 w-full" id="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
