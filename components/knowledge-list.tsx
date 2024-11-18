'use client'

import React, { useEffect, useState } from 'react'
import KnowledgeItem from "./knowledge-item"
import { KnowledgeFile } from "@/lib/types"
import { useSelectedItem } from '../app/knowledge/selected-item-context';

type KnowledgeListProps = {
  userId?: string
}

const KnowledgeList: React.FC<KnowledgeListProps> = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const { itemId } = useSelectedItem();

  useEffect(() => {
    const loadFiles = async () => {
      const SERVER_URL = 'http://localhost:3000/api/file/get-all-id'

      try {
        const response = await fetch(SERVER_URL)
        if (!response.ok) {
          throw new Error(`Failed to fetch files: ${response.statusText}`)
        }
        const data = await response.json()
        setFiles(data)
      } catch (error) {
        console.error(error)
      }
    }

    loadFiles()
  }, [itemId])

  return (
    <div className="flex flex-col flex-1 space-y-3 h-full">
      <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
        {!files.length ? (
          <div className="text-foreground/30 text-sm text-center py-4">
            知识库为空
          </div>
        ) : (
          files.map((file) => (
            <KnowledgeItem file={file} key={file.id} />
          ))
        )}
      </div>
    </div>
  )
}

export default KnowledgeList