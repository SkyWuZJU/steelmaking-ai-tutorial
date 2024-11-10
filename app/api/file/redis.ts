import { redisConfig } from "@/lib/redis/config";
import { Redis } from '@upstash/redis'
import { KnowledgeFile, User } from "@/lib/types";

const redis = new Redis({
    url: redisConfig.upstashRedisRestUrl,
    token: redisConfig.upstashRedisRestToken
})

async function getAllFileIds() {
    const pipeline = redis.pipeline()

    const queryResult = await pipeline.keys('file:*').exec()
    const fileIds = queryResult.map(result => result[1]) as string[]

    return fileIds
}

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

export async function removeFile(fileId: string){
    const pipeline = redis.pipeline()

    pipeline.del(`file:${fileId}`)

    const results = await pipeline.exec()
    return results
}

export async function updateFile(fileId: string, file: KnowledgeFile) {
    const pipeline = redis.pipeline()
    pipeline.hmset(`file:${fileId}`, file)
    return await pipeline.exec()
}

export async function createFile(file:KnowledgeFile): Promise<any[]> {
    const pipeline = redis.pipeline()
    pipeline.hmset(`file:${file.id}`, file)
    
    const userId = file.uploaderUserId

    const user = await getUser(userId)
    if (!user) {
        throw new Error('User not found')
    }

    const fileList: string[] = JSON.parse(user.fileList).concat(file.id)
    pipeline.hmset(`user:${userId}`, { fileList: JSON.stringify(fileList) })

    return await pipeline.exec()
}