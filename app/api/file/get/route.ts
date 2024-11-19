import { getFiles } from '../redis'

export async function POST(request: Request) {
  try {
    const { fileIds } = await request.json()

    if (!fileIds) {
      return new Response('No fileIds provided', { status: 400 })
    }

    const files = await getFiles(fileIds)

    return new Response(JSON.stringify(files), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error processing api/file/get:', error)
    return new Response(JSON.stringify({ error: 'Failed to get files' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
