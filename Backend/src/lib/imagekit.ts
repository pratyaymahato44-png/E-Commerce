import ImageKit, {NotFoundError} from "@imagekit/nodejs";
import type { Env } from "./env.js";

export async function deleteImagekitAsset(env: Env, storeFileId: string | null){
    if(!storeFileId) return

    const client = new ImageKit({privateKey: env.IMAGEKIT_PRIVATE_KEY})

    try {
        await client.files.delete(storeFileId)
    } catch (error: unknown) {
        if(error instanceof NotFoundError) return
        throw error
    }
}