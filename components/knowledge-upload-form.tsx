'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { toast } from 'sonner'
import { parse } from 'pptxtojson'
import { metadata } from '@/app/layout'
import { CreateFileApiRequest } from '@/lib/types'

const SERVER_URL = '/api/file/create'
const ACCEPT_FILE_TYPE = ['.pptx']

interface UploadFormProps {
  className?: string
}

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
  files: FileList | null,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>
) {
  event.preventDefault()
  if (!files?.length) {
    toast.error('Please select files to upload')
    return
  }

  setIsUploading(true)
  try {
    const parsedFiles = await Promise.all(
      Array.from(files).map(async file => {
        const arrayBuffer = await file.arrayBuffer()
        return await parse(arrayBuffer)
      })
    )

    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slides: parsedFiles,
        metadata: {
          fileName: Array.from(files).map(file => file.name)
        }
      } as CreateFileApiRequest)
    })

    if (!response.ok) throw new Error('Upload failed')

    toast.success('Files uploaded successfully')
    router.refresh()
  } catch (error) {
    toast.error('Error uploading files')
    console.error(error)
  } finally {
    setIsUploading(false)
  }
}

export default function KnowledgeUploadForm({ className }: UploadFormProps) {
  const [files, setFiles] = React.useState<FileList | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const router = useRouter()

  return (
    <Card className={className}>
      <form onSubmit={e => handleSubmit(e, files, setIsUploading, router)}>
        <CardHeader>
          <CardTitle>上传知识文件</CardTitle>
          <CardDescription>
            上传有关转炉炼钢的文件到AI知识库。支持{ACCEPT_FILE_TYPE.join(' ')}
            文件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="grid gap-2">
              <input
                id="files"
                type="file"
                multiple
                onChange={e => setFiles(e.target.files)}
                className="cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                accept={ACCEPT_FILE_TYPE.join(',')}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
