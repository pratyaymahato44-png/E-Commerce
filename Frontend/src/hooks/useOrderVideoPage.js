import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { apiFetch } from "../lib/api";
import {StreamVideoClient} from "@stream-io/video-react-sdk"


export function useOrderVideoPage(){
    const {id} = useParams()

    const {getToken, isSignedIn} = useAuth()
    const [client, setClient] = useState(null)
    const [call, setCall] = useState(null)
    const {error, setError} = useState(null)

    const {data, isLoading, error: loadError} = useQuery({
        queryKey: ["order", id],
        queryFn: () => apiFetch(`/api/orders/${id}`, {getToken}),
        enabled: isSignedIn && Boolean(id)
    })
    const order = data?.order
    const paid = order?.status === "paid"


    useEffect(() => {
        if(!paid || !id || !isSignedIn) return undefined


        async function connectOrderVideo(){
            const token = await apiFetch("/api/stream/token", {getToken, method: "POST"})

            const videoClient = new StreamVideoClient({
                apiKey: token.apiKey,
                user: {id: token.userId, name: token.name},
                token: token.token
            })

            const activeCall = videoClient.call("default", `order-${id}`)
            await activeCall.join({create: true})
            setClient(videoClient)
            setCall(activeCall)

        }

        connectOrderVideo().catch((error) => {
            setError(error instanceof Error ? error.message : "Video failed to start")
        })

        // cleanup
        return () => {
            activeCall?.leave().catch(()=>{})
            videoClient?.disconnectUser().catch(()=>{})
        }

    },[paid, getToken, isSignedIn, id])

    return {
        id,
        order,
        paid,
        isLoading,
        loadError,
        client,
        call,
        error
    }
}