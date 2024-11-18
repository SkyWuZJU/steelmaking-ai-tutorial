import { redis } from "../redis"

export async function GET() {
    const pipeline = redis.pipeline()
    pipeline.hmset(`user:anonymous`, { fileList: JSON.stringify([]) })

    return await pipeline.exec()
}