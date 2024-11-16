import { getAllFiles } from "@/app/api/file/redis"
import { cache } from "react"
import KnowledgeItem from "./knowledge-item"

type KnowledgeListProps = {
    userId?: string  // Admin access management is moved to the knowledge-container.tsx
}

const loadFiles = cache(async () => {
    return await getAllFiles()
})

const KnowledgeList: React.FC<KnowledgeListProps> = async () => {
    const files = await loadFiles()
    console.debug('files:', files)

    return (
        <div className="flex flex-col flex-1 space-y-3 h-full">
            <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
                {!files?.length ? (
                    <div className="text-foreground/30 text-sm text-center py-4">
                        知识库为空
                    </div>
                ) : (
                    files?.map((file) => (
                        <KnowledgeItem file={file}/>
                    ))
                )}
            </div>
        </div>
    )
}

export default KnowledgeList