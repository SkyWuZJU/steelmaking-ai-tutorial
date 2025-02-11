import { getAllFiles } from '../redis'

export async function GET(request: Request) {
  try {
    const files = await getAllFiles()

    return new Response(JSON.stringify(files), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error when processing api/file/get-all:', error)
    return new Response(JSON.stringify({ error: 'Failed to get all files' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
