import "stream-chat"

declare module "stream-chat" {
    interface CustomChannelData {
        name?: string 
    }
}

declare module "stream-chat" {
    interface CustomMessageData {
        custom?: {
            video_invite: boolean,
            join_url: string
        } 
    }
}