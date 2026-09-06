import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../lib/api";


export function useAdminProductPage(){
    const {getToken, isSignedIn} = useAuth()
    const queryClient = useQueryClient()

    const [modelOpen, setModelOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const {data: userData} = useQuery({
        queryKey: ["user"],
        queryFn: () => apiFetch("/api/get-user", {getToken}),
        enabled: isSignedIn
    })

    const isAdmin = userData?.user?.role === "admin"

    const {data, isLoading} = useQuery({
        queryKey: ["admin", "products"],
        queryFn: () => apiFetch("/api/admin/products", {getToken}),
        enabled: isSignedIn && isAdmin
    })

    // this mutation either update or create a product
    const saveMutation = useMutation({
        mutationFn: async({body, id}) => {
            if(id) {
                return apiFetch(`/api/admin/products/${id}`, {
                    getToken,
                    method: "PATCH",
                    body,
                })
            }

            return apiFetch("/api/admin/products", {getToken, method: "POST", body})
        },

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admin", "products"]})
            queryClient.invalidateQueries({queryKey: ["products"]})
            queryClient.invalidateQueries({queryKey: ["product-categories"]})
            setModelOpen(false)
            setEditing(null)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (productId) => apiFetch(`/api/admin/products/${productId}`, {getToken, method: "DELETE"}),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admin", "products"]})
            queryClient.invalidateQueries({queryKey: ["products"]})
            queryClient.invalidateQueries({queryKey: ["product-categories"]})
        },
        onError: (error) => {
            window.alert(error instanceof Error ? error.message : "Delete Failed")
        }

    })

    return {
        getToken,
        isSignedIn,
        userData,
        modelOpen,
        setModelOpen,
        editing,
        setEditing,
        products: data?.products ?? [],
        isLoading,
        saveMutation,
        deleteMutation
    }
}