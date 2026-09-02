import { useEffect } from "react"
import { useAuth } from "@clerk/react"
import * as Sentry from "@sentry/react"

function SentryUserSync(){
    const {userId, isLoaded} = useAuth()

    useEffect(() => {
        if (!isLoaded) return
        Sentry.setUser(userId ? {id: userId} : null)
    },[isLoaded, userId])
    
    return null
}  

export default SentryUserSync