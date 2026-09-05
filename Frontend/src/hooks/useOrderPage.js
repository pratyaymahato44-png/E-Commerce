import { useAuth } from "@clerk/react"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "../lib/api"


function useOrderPage(){

    const {getToken, isSignedIn} = useAuth()

    const {data, isLoading, error} = useQuery({
        queryKey: ["orders"],
        queryFn: () => apiFetch("/api/orders", {getToken}),
        enabled: isSignedIn
    })

    const {data: userData} = useQuery({
        queryKey: ["user"],
        queryFn: () => apiFetch("/api/get-user", {getToken}),
        enabled: isSignedIn
    })

    const isStaff = userData?.user?.role === "support" || userData?.user?.role === "admin"

    const orders = data?.orders ?? []

    return {
        isLoading,
        error,
        orders,
        isStaff
    }
}

export {useOrderPage}