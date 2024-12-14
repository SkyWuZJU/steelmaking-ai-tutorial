'use client'

import { useState, useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { clearChats } from '@/lib/actions/chat'
import { toast } from 'sonner'
import { Spinner } from './ui/spinner'

type ClearHistoryProps = {
  empty: boolean
  userId?: string
}

export function ClearHistory({ empty, userId }: ClearHistoryProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          disabled={empty || !userId}
        >
          清空对话
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定要清空历史对话吗？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作无法撤销。这将永久删除您的历史记录并从我们的服务器中移除您的数据。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={event => {
              event.preventDefault()
              startTransition(async () => {
                if (!userId) return
                const result = await clearChats(userId)
                if (result?.error) {
                  toast.error(result.error)
                } else {
                  toast.success('历史记录已清空')
                }
                setOpen(false)
              })
            }}
          >
            {isPending ? <Spinner /> : '清空'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
