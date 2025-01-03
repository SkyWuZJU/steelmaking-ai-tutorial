import { redisConfig } from '@/lib/redis/config'
import { Redis } from '@upstash/redis'
import { KnowledgeFile, User } from '@/lib/types'

export const redis = new Redis({
  url: redisConfig.upstashRedisRestUrl,
  token: redisConfig.upstashRedisRestToken
})

export async function getUser(userId: string): Promise<User | null> {
  const pipeline = redis.pipeline()

  const queryResult = (await pipeline.hgetall(`user:${userId}`).exec())[0]
  if (!queryResult) {
    return null
  }

  const user =
    Object.keys(queryResult).length > 0
      ? {
          ...queryResult,
          fileList: queryResult.fileList
            ? JSON.parse(queryResult.fileList as string)
            : []
        }
      : null

  return user ? (user as User) : null
}

export async function createUser(user: User) {
  const pipeline = redis.pipeline()

  const userRecord: Record<string, unknown> = {
    userName: user.userName,
    role: user.role,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt
  }
  if (user.fileList) {
    userRecord.fileList = JSON.stringify(user.fileList)
  }

  pipeline.hmset(`user:${user.userName}`, userRecord)
  return await pipeline.exec()
}

export async function getFiles(
  fileIds: string[]
): Promise<(KnowledgeFile | null)[]> {
  const pipeline = redis.pipeline()

  fileIds.forEach(fileId => {
    pipeline.hgetall(`file:${fileId}`)
  })

  return await pipeline.exec()
}

export async function getAllFiles(): Promise<KnowledgeFile[]> {
  const pipeline = redis.pipeline()

  const queryResult = await pipeline.scan(0, { match: 'file:*' }).exec()
  const fileKeys = queryResult[0][1] as string[]
  const files = await getFiles(
    fileKeys.map(key => key.split(':').at(-1) as string)
  )

  return files.filter(file => file !== null) as KnowledgeFile[]
}

export async function createFile(file: KnowledgeFile): Promise<any[]> {
  const userId = file.uploaderUserId
  const user = await getUser(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const pipeline = redis.pipeline()
  pipeline.hmset(`file:${file.id}`, file)

  const fileList: string[] =
    !user.fileList || user.fileList.length === 0
      ? [file.id]
      : [...user.fileList, file.id]

  pipeline.hmset(`user:${userId}`, { fileList: JSON.stringify(fileList) })

  return await pipeline.exec()
}

export async function removeFile(fileId: string) {
  const [file] = await getFiles([fileId])
  if (!file) {
    throw new Error('File not found')
  }
  const user = await getUser(file.uploaderUserId)
  if (!user) {
    throw new Error('User not found')
  }
  const pipeline = redis.pipeline()

  pipeline.del(`file:${fileId}`)

  if (user.fileList) {
    pipeline.hmset(`user:${user.userName}`, {
      fileList: JSON.stringify(
        user.fileList.filter((id: string) => id !== fileId)
      )
    })
  }

  const results = await pipeline.exec()

  return results
}

export async function updateFile(file: KnowledgeFile) {
  const pipeline = redis.pipeline()
  pipeline.hmset(`file:${file.id}`, file)
  return await pipeline.exec()
}
