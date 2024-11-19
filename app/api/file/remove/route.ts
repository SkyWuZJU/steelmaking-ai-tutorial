import { removeFile as removeFileFromRedis } from '../redis'
import { removeFile as removeFileFromVectorstore } from '../vector-store'

export async function DELETE(request: Request) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return new Response('No fileId provided', { status: 400 })
    }

    const results = {
      redis: await removeFileFromRedis(fileId),
      vectorstore: await removeFileFromVectorstore(fileId)
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error processing api/file/remove:', error)
    return new Response(JSON.stringify({ error: 'Failed to remove file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
