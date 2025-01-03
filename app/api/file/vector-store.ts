import {
  UpstashVectorLibArgs,
  UpstashVectorStore
} from '@langchain/community/vectorstores/upstash'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Index as UpstashIndex } from '@upstash/vector'
import { getFiles } from './redis'
import {
  RecursiveCharacterTextSplitter,
  TextSplitterChunkHeaderOptions
} from 'langchain/text_splitter'
import { parsePptxToDocument as loadPptx } from './pptx-to-document'
import { Slide } from 'pptxtojson'

export const vectorstore = new UpstashVectorStore(
  // LangChain Doc for UpstashVectorStore: https://js.langchain.com/docs/integrations/vectorstores/upstash/
  new OpenAIEmbeddings(),
  {
    index: new UpstashIndex({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN
    })
    // namespace: "test"
  } as UpstashVectorLibArgs
)

export async function removeFile(fileId: string) {
  const fileMetadata = await getFiles([fileId])

  if (!fileMetadata || fileMetadata.length === 0 || !fileMetadata[0]) {
    return null
  }

  const vectorIds = fileMetadata[0]?.vectorIds

  vectorstore.delete({ ids: vectorIds })
}

/**
 *
 * @param slides
 * @returns a list of vector IDs in string
 */
export async function addPptxFile(slides: Slide[]) {
  const CHUNK_SIZE = 1000
  const CHUNK_OVERLAP = 200
  const VALID_TYPES = [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // MIME 类型 for .pptx
  ]

  if (!slides) {
    throw new Error('No file uploaded')
  }

  const loadedPptx = await loadPptx(slides)

  // const splitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: CHUNK_SIZE,
  //   chunkOverlap: CHUNK_OVERLAP
  // })
  // const allSplits = await splitter.splitDocuments(
  //   loadedPptx
  //   // {
  //   //     appendChunkOverlapHeader: true,
  //   //     chunkHeader: "Auto attach header to each chunk",
  //   //     chunkOverlapHeader: "Auto attach overlap header to each chunk with overlap"
  //   // } as TextSplitterChunkHeaderOptions
  // )

  const results = await vectorstore.addDocuments(loadedPptx)

  return results
}

export async function updatePptxFile(fileId: string, slides: Slide[]) {
  await removeFile(fileId)
  return await addPptxFile(slides)
}
