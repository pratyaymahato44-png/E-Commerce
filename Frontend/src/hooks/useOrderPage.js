import { useAuth } from "@clerk/react"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "../lib/api"


function useOrderPage(){

    const {getToken, isSignedIn, isLoaded} = useAuth()

    const {data, isLoading: orderLoading, error: orderError} = useQuery({
        queryKey: ["orders"],
        queryFn: () => apiFetch("/api/orders", {getToken}),
        enabled: isLoaded && isSignedIn === true,
        retry: false
    })

    const {data: userData, isLoading: userLoading, error: userError} = useQuery({
        queryKey: ["user"],
        queryFn: () => apiFetch("/api/get-user", {getToken}),
        enabled: isLoaded && isSignedIn === true,
        retry: false
    })

    const isStaff = userData?.user?.role === "support" || userData?.user?.role === "admin"

    const orders = data?.orders ?? []

    return {
        isLoading: !isLoaded || orderLoading,
        error: orderError,
        orders,
        isStaff
    }
}

export {useOrderPage}