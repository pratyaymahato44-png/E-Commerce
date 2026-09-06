import { useEffect, useState } from "react";
import {useOutletContext, useParams} from "react-router"
import {useMutation, useQuery} from "@tanstack/react-query"
import {StreamChat} from "stream-chat"
import {useAuth} from "@clerk/react"
import {apiFetch} from "../lib/api.js"


export function useOrderChatPage(){
    const {id} = useParams()
    const {getToken, isSignedIn} =  useAuth()
    const {paid} = useOutletContext()

    const [client, setClient] = useState(null)
    const [error, setError] = useState(null)

    const {data: useData} = useQuery({
        queryKey: ["user"],
        queryFn: () => apiFetch("/api/get-user", {getToken}),
        enabled: isSignedIn,
        retry: false
    })

    const role = useData?.user?.role

    // for GET method => useQuery
    // for POST< DELETE< PATCH< PUT => useMutation

    const inviteMutation = useMutation({
        mutationFn: () => apiFetch(`/api/orders/${id}/video-invite`, {method: "POST" , getToken})
    })

    useEffect(() => {
        if(!paid || !id) return  undefined

        async function connectOrderChat(){
            await apiFetch(`/api/orders/${id}/stream-channel`, {method: "POST", getToken})

            const token = await apiFetch("/api/stream/token", {method: "POST", getToken})

            const chatClient = StreamChat.getInstance(token.apiKey)
            if(!chatClient.userID){
                  await chatClient.connectUser({id: token.userId, name: token.name}, token.token)
            }
          

            const channel = chatClient.channel("messaging", `order-${id}`)

            await channel.watch()

            setClient(chatClient)

            return () => {
                if(chatClient){
                    chatClient.disconnectUser()
                }
            }
        }

        connectOrderChat().catch((error) => {
            setError(error instanceof Error ? error.message : "chat failed to load")
        })
    }, [paid, id, getToken])

    const channel = client && id ? client.channel("messaging", `order-${id}`) : null

    const canInvite = role === "support" || role === "admin"

    return {
        paid,
        client,
        error,
        channel,
        canInvite,
        inviteMutation
    }
}