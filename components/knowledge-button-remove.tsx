import { Button } from './ui/button'
import { ErrorCard } from './error-card'
import React, { useEffect, useState } from 'react'
import { useSelectedItem } from '../app/knowledge/selected-item-context'

const SERVER_URL = `/api/file/remove`

type RemoveFileButtonProps = {
  fileId: string
}

const RemoveFileButton: React.FC<RemoveFileButtonProps> = ({ fileId }) => {
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setItemId } = useSelectedItem()

  useEffect(() => {
    if (!isRemoving) return

    const removeFile = async () => {
      try {
        const response = await fetch(SERVER_URL, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileId })
        })

        if (response.ok) {
          console.log('File removed successfully')
          setError(null)
          setItemId('') // Clear selected item
        } else {
          console.error('Failed to remove file')
          setError('Failed to remove file')
        }
      } catch (error) {
        console.error('Error removing file:', error)
        setError('Error removing file')
      } finally {
        setIsRemoving(false)
      }
    }

    removeFile()
  }, [isRemoving, fileId, setItemId])

  return (
    <>
      {error && <ErrorCard errorMessage={error} />}
      <Button
        variant="destructive"
        onClick={() => setIsRemoving(true)}
        disabled={isRemoving}
      >
        {isRemoving ? 'Removing...' : 'Remove File'}
      </Button>
    </>
  )
}

export default RemoveFileButton
