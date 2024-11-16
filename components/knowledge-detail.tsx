import { KnowledgeFile } from "@/lib/types"
import { 
    removeFile as removeFileFromRedis,
    createFile as createFileInRedis,
    getFiles as getFileMetadataFromRedis,
} from "@/app/api/file/redis"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { removeFile as removeFileFromVector} from "@/app/api/file/vector-store"
import { Button } from "./ui/button"
import { cn } from '@/lib/utils'
import KnowledgeDetailPlaceholder from "./knowledge-detail-placeholder"

type KnowledgeDetailProps = {
    fileId: string
}

type RemoveFileButtonProps = {
    fileId: string
}

type UpdateFileButtonProps = {
    fileId: string
}

// const getFileIdFromPathname = (pathName: string) => {
//     // Extract the id from '/manage-knowledge/[id]'
//     if (pathName.includes('/manage-knowledge/')) {
//         return pathName.split('/manage-knowledge/')[1]
//     }
// }

const RemoveFileButton = async ({fileId}: RemoveFileButtonProps) => {
    // Click the button to remove file from the database

    return (
        <Button onClick={() => {
            // TODO: Replace with calling 'api/file/remove' api
            // removeFileFromRedis(fileId)
            // removeFileFromVector(fileId)
        }}>
            删除知识文件
        </Button>
    )
}

const UpdateFileButton = async ({ fileId }: UpdateFileButtonProps) => {
    return (
        <Button onClick={() => {
            // TODO: Ask the user to upload a new file and call the api 'api/file/update' to replace the old file with the new one
        }}>
            更新知识文件
        </Button>
    )
}

const KnowledgeDetail = async ({ fileId }: KnowledgeDetailProps) => {
    const file = fileId ? (await getFileMetadataFromRedis([fileId]))[0] : null
    if (!file) {
        return <KnowledgeDetailPlaceholder />
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{file?.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                    ...文件介绍和描述...
                </CardDescription>
            </CardContent>
            <CardFooter>
                <div className="flex space-x-4">
                    <RemoveFileButton fileId={file.id} />
                    <UpdateFileButton fileId={file.id} />
                </div>
            </CardFooter>
        </Card>
    )
}

export default KnowledgeDetail