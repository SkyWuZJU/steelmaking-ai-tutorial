'use client'

import React, { useEffect, useState } from 'react'
import { KnowledgeFile } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import KnowledgeDetailPlaceholder from './knowledge-detail-placeholder'
import RemoveFileButton from './knowledge-button-remove'
import UpdateFileButton from './knowledge-button-update'

type KnowledgeDetailProps = {
  fileId: string
}

const KnowledgeDetail: React.FC<KnowledgeDetailProps> = ({ fileId }) => {
  const [file, setFile] = useState<KnowledgeFile | null>(null)

  const fetchFile = async () => {
    const SERVER_URL = 'http://localhost:3000/api/file/get'
    const response = await fetch(SERVER_URL, {
      method: 'POST', // Changed to POST as per your original code
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileIds: [fileId] })
    })

    if (response.ok) {
      const files = await response.json()
      setFile(files[0])
    } else {
      console.error('Failed to fetch file metadata')
      setFile(null)
    }
  }

  useEffect(() => {
    fetchFile()
  }, [fileId])

  const handleFileUpdate = () => {
    fetchFile()
  }

  if (!file) {
    return <KnowledgeDetailPlaceholder />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{file.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>...文件介绍和描述...</CardDescription>
      </CardContent>
      <CardFooter>
        <div className="flex space-x-4">
          <RemoveFileButton fileId={fileId} />
          <UpdateFileButton fileId={fileId} onFileUpdate={handleFileUpdate} />
        </div>
      </CardFooter>
    </Card>
  )
}

export default KnowledgeDetail
