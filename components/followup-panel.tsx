'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/app/actions'
import { UserMessage } from './user-message'
import { ArrowRight } from 'lucide-react'
import { useAppState } from '@/lib/utils/app-state'

export function FollowupPanel() {
  const [input, setInput] = useState('')
  const { submit } = useActions()
  const [, setMessages] = useUIState<typeof AI>()
  const { isGenerating, setIsGenerating } = useAppState()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isGenerating) return

    setIsGenerating(true)
    setInput('')

    const formData = new FormData(event.currentTarget as HTMLFormElement)

    const userMessage = {
      id: Date.now(),
      isGenerating: false,
      component: <UserMessage message={input} />
    }

    const responseMessage = await submit(formData)
    setMessages(currentMessages => [
      ...currentMessages,
      userMessage,
      responseMessage
    ])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center space-x-1"
    >
      <Input
        type="text"
        name="input"
        placeholder="对当前话题继续提问"
        value={input}
        className="pr-14 h-12"
        onChange={e => setInput(e.target.value)}
      />
      <Button
        type="submit"
        size={'icon'}
        disabled={input.length === 0 || isGenerating}
        variant={'ghost'}
        className="absolute right-1"
      >
        <ArrowRight size={20} />
      </Button>
    </form>
  )
}
