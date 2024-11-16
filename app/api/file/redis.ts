import { redisConfig } from "@/lib/redis/config";
import { Redis } from '@upstash/redis'
import { KnowledgeFile, User } from "@/lib/types";

const redis = new Redis({
    url: redisConfig.upstashRedisRestUrl,
    token: redisConfig.upstashRedisRestToken
})

async function getUser(userId: string) {
    const pipeline = redis.pipeline()

    const queryResult = await pipeline.hgetall(`user:${userId}`).exec()
    const user = queryResult[0] as Record<string, string> | null

    return user
}

async function createUser(user: User) {
    const pipeline = redis.pipeline()

    pipeline.hmset(`user:${user.id}`, user)
    return await pipeline.exec()
}

export async function getFiles(fileIds: string[]): Promise<(KnowledgeFile | null)[]> {
    const pipeline = redis.pipeline()

    fileIds.forEach(fileId => {
        pipeline.hgetall(`file:${fileId}`)
    })

    return await pipeline.exec()
}

export async function getAllFiles(): Promise<KnowledgeFile[]> {
    const pipeline = redis.pipeline()

    const queryResult = await pipeline.scan(0, {match: 'file:*'}).exec()
    const fileKeys = queryResult[0][1] as string[]
    console.debug('fileIds:', fileKeys)
    const files = await getFiles(fileKeys.map(key => key.split(':').at(-1) as string))

    return files.filter(file => file !== null) as KnowledgeFile[]
}

export async function createFile(file:KnowledgeFile): Promise<any[]> {
    const userId = file.uploaderUserId
    const user = await getUser(userId)
    if (!user) {
        throw new Error('User not found')
    }

    const pipeline = redis.pipeline()
    pipeline.hmset(`file:${file.id}`, file)

    const fileList: string[] = user.fileList=='[]' ? JSON.parse(user.fileList).concat(file.id) : [file.id]
    pipeline.hmset(`user:${userId}`, { fileList: JSON.stringify(fileList) })

    return await pipeline.exec()
}

export async function removeFile(fileId: string) {
    const pipeline = redis.pipeline()

    pipeline.del(`file:${fileId}`)
    const results = await pipeline.exec()

    // TODO: remove file from user's fileList

    return results
}

export async function updateFile(file: KnowledgeFile) {
    const pipeline = redis.pipeline()
    pipeline.hmset(`file:${file.id}`, file)
    return await pipeline.exec()
}