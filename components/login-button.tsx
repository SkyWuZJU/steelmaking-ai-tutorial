// components/login-button.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogIn, LogOut } from 'lucide-react'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { LoginForm } from './login-form'
import { toast } from 'sonner'

export function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('/api/users/verifyToken', {
          method: 'POST'
        })
        setIsLoggedIn(res.ok)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkLoginStatus()
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/users/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        setIsLoggedIn(false)
        router.refresh()
        toast.success('Logged out successfully')
      } else {
        toast.error('Logout failed')
      }
    } catch {
      toast.error('Logout failed')
    }
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  return isLoggedIn ? (
    <Button variant="outline" className="w-full" onClick={handleLogout}>
      <LogOut size={16} className="mr-2" />
      Logout
    </Button>
  ) : (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <LogIn size={16} className="mr-2" />
          Login
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 rounded-tl-xl rounded-bl-xl">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </SheetContent>
    </Sheet>
  )
}
