'use client'

import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { ErrorCard } from './error-card'

const SERVER_URL = 'http://localhost:3000/api/file/update'

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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileId', fileId)

      try {
        const response = await fetch(SERVER_URL, {
          method: 'POST',
          body: formData
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
