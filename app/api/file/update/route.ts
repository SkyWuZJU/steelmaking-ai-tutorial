import { KnowledgeFile } from '@/lib/types'
import { getFiles, updateFile } from '../redis'
import { updatePptxFile } from '../vector-store'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const fileId = formData.get('fileId') as string
    const file = formData.get('file') as File

    if (!fileId || !file) {
      return Response.json({ error: 'Missing fileId or file' }, { status: 400 })
    }

    const [fileData] = await getFiles([fileId])
    if (!fileData) {
      return Response.json(
        { error: 'File not found based on the fileId' },
        { status: 404 }
      )
    }

    const updatedVectors = await updatePptxFile(fileData.id, file)
    const updatedFile: KnowledgeFile = {
      ...fileData,
      vectorIds: updatedVectors,
      updatedAt: new Date().toISOString()
    }

    await updateFile(updatedFile)

    return Response.json(updatedFile)
  } catch (error) {
    console.error('Error processing api/file/update:', error)
    return Response.json({ error: 'Failed to update file' }, { status: 500 })
  }
}
