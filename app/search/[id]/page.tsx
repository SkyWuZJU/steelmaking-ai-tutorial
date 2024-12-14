import { notFound, redirect } from 'next/navigation'
import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { AI } from '@/app/actions'
import { getUserIdFromToken } from '@/lib/auth'

export const maxDuration = 60

type SearchPageProps = Promise<{
  id: string
}>

export async function generateMetadata(context: { params: SearchPageProps }) {
  const params = await context.params
  const userId = (await getUserIdFromToken()) ?? redirect('/login')

  const chat = await getChat(params.id, userId)
  return {
    title: chat?.title.toString().slice(0, 50) || 'Search'
  }
}

export default async function SearchPage(context: { params: SearchPageProps }) {
  const params = await context.params
  const userId = (await getUserIdFromToken()) ?? redirect('/login')

  const chat = await getChat(params.id, userId)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== userId) {
    notFound()
  }

  return (
    <AI
      initialAIState={{
        chatId: chat.id,
        messages: chat.messages
      }}
    >
      <Chat id={(await params).id} />
    </AI>
  )
}
