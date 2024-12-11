'use client'

import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { ErrorCard } from './error-card'
import { parse } from 'pptxtojson'
import { CreateFileApiRequest } from '@/lib/types'

const SERVER_URL = `/api/file/update`

type UpdateFileButtonProps = {
  fileId: string
  onFileUpdate: () => void
}

const UpdateFileButton: React.FC<UpdateFileButtonProps> = ({
  fileId,
  onFileUpdate
}) => {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleFileUpload = async (file: File) => {
      const parserdFile = await parse(await file.arrayBuffer())

      try {
        const response = await fetch(SERVER_URL, {
          method: 'POST',
          body: JSON.stringify({
            slides: [parserdFile],
            metadata: {
              fileName: [file.name],
              fileId: [fileId]
            }
          } as CreateFileApiRequest)
        })

        if (response.ok) {
          onFileUpdate()
          //   window.location.reload();
        } else {
          console.error('File upload failed')
          setError('File upload failed')
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        setError('Error uploading file')
      }
    }

    const handleButtonClick = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.onchange = event => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (file) {
          handleFileUpload(file)
        }
      }
      input.click()
    }

    document
      .getElementById('update-file-button')
      ?.addEventListener('click', handleButtonClick)

    return () => {
      document
        .getElementById('update-file-button')
        ?.removeEventListener('click', handleButtonClick)
    }
  }, [fileId, onFileUpdate])

  return (
    <>
      <Button id="update-file-button">Update File</Button>
      {error && <ErrorCard errorMessage={error} />}
    </>
  )
}

export default UpdateFileButton
