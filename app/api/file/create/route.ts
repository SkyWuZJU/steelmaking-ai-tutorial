import { KnowledgePiece, KnowledgeFile } from '@/lib/types'
import { addPptxFile as indexPpt } from '../vector-store'
import { createFile as addFileMetadataToRedis } from '../redis'
import { generateId } from 'ai'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return new Response('No files uploaded', { status: 400 })
    }

    let fileProcessResult: Record<string, string[]> = {}
    // Process each file
    await Promise.all(
      files.map(async file => {
        if (!(file instanceof File)) {
          throw new Error('Invalid file object')
        }

        const fileMetadata: KnowledgeFile = {
          id: generateId(),
          name: file.name,
          uploaderUserId: 'anonymous', // TODO: retrieve userId from the request
          updatedAt: new Date().toISOString(),
          format: 'unknown',
          vectorIds: [] as string[]
        }

        if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
          fileMetadata.format = 'ppt'
          fileMetadata.vectorIds = await indexPpt(file)

          if (!fileMetadata.vectorIds || fileMetadata.vectorIds.length === 0) {
            throw new Error('Failed to index file to vector store')
          }

          fileProcessResult[file.name] =
            await addFileMetadataToRedis(fileMetadata)
        }
        // TODO: Add handlers for other file types (.pdf, .txt, .docx)
      })
    )

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
