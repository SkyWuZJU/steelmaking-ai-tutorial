'use client' // Add this directive at the top

import { useState, useEffect } from 'react' // Add these imports
import { useRouter } from 'next/navigation' // Add this import
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [isDirectAccess, setIsDirectAccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!document.referrer || document.referrer === '') {
        setIsDirectAccess(true)
      }
    }
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      if (isDirectAccess) {
        router.push('/')
      } else {
        router.back()
      }
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent>
          <LoginForm />
        </SheetContent>
      </Sheet>
    </div>
  )
}
