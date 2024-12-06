import { KnowledgePiece, KnowledgeFile, CreateFileApiRequest } from '@/lib/types'
import { addPptxFile as indexPpt } from '../vector-store'
import { createFile as addFileMetadataToRedis } from '../redis'
import { generateId } from 'ai'
import { Slide } from 'pptxtojson'

export async function POST(req: Request) {
  try {
    const data: CreateFileApiRequest = await req.json()

    if (!data || !data.slides || !data.metadata) {
      return new Response(`No legal file data received: ${data}`, {
        status: 400
      })
    }

    const slides: Slide[] = data.slides[0].slides
    const metadata: { fileName: string[] } = data.metadata

    let fileProcessResult: Record<string, string[]> = {}

    const fileMetadata: KnowledgeFile = {
      id: generateId(),
      name: metadata.fileName[0],
      uploaderUserId: 'anonymous', // TODO: retrieve userId from the request
      updatedAt: new Date().toISOString(),
      format: 'unknown',
      vectorIds: [] as string[]
    }

    if (fileMetadata.name.endsWith('.pptx')) {
      fileMetadata.format = 'ppt'
      fileMetadata.vectorIds = await indexPpt(slides)

      if (!fileMetadata.vectorIds || fileMetadata.vectorIds.length === 0) {
        throw new Error('Failed to index file to vector store')
      }

      fileProcessResult[fileMetadata.name] =
        await addFileMetadataToRedis(fileMetadata)
    }
    // TODO: Add handlers for other file types (.pdf, .txt, .docx)

    return new Response(
      JSON.stringify({ success: true, results: fileProcessResult }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error processing api/file/create:', error)
    return new Response(JSON.stringify({ error: 'Failed to add a new file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
