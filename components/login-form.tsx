'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export function LoginForm({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const router = useRouter()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [invitationCode, setInvitationCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password || (!isLoginMode && !passwordConfirmation)) {
      setErrorMessage('Please fill out all fields')
      return
    }

    if (!isLoginMode && password !== passwordConfirmation) {
      setErrorMessage('Passwords do not match')
      return
    }

    if (!isLoginMode && !invitationCode) {
      setErrorMessage('Please enter your invitation code')
      return
    }

    try {
      if (isLoginMode) {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })

        if (res.ok) {
          router.refresh()
          if (onLoginSuccess) onLoginSuccess()
        } else {
          const data = await res.json()
          setErrorMessage(data.message || 'Login failed')
        }
      } else {
        const res = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            role: 'user',
            invitationCode
          })
        })
        if (res.ok) {
          setIsLoginMode(true)
          setErrorMessage('Registration successful. Please log in.')
        } else if (res.status === 400) {
          setErrorMessage('Username already exists. Please choose another one.')
        } else {
          const data = await res.json()
          setErrorMessage(data.message || 'Registration failed')
        }
      }
    } catch (error) {
      console.debug('Error in login form:\n', error)
      setErrorMessage('An error occurred. Please try again.')
    }
  }

  return (
    <SheetContent className="w-80 rounded-tl-xl rounded-bl-xl">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-1 text-sm font-normal mb-2">
          {isLoginMode ? 'Login' : 'Register'}
        </SheetTitle>
      </SheetHeader>
      <div className="my-2 h-full pb-12 md:pb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          {!isLoginMode && (
            <div>
              <label
                htmlFor="passwordConfirmation"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          )}
          {!isLoginMode && (
            <div>
              <label
                htmlFor="invitationCode"
                className="block text-sm font-medium text-gray-700"
              >
                Invitation Code
              </label>
              <input
                id="invitationCode"
                name="invitationCode"
                type="text"
                required
                value={invitationCode}
                onChange={e => setInvitationCode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          )}
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
          <Button type="submit" className="w-full">
            {isLoginMode ? 'Login' : 'Register'}
          </Button>
          <div className="text-sm text-center">
            {isLoginMode ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className="text-blue-600 hover:underline"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className="text-blue-600 hover:underline"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </SheetContent>
  )
}
