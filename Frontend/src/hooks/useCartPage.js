import { useAuth } from "@clerk/react";
import { useCart } from "../store/cart";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useState } from "react";

export default function useCartPage(){

    const {getToken} = useAuth()
    const [checkoutLoading, setCheckoutLoading] = useState(false)

    const items = useCart((s) => s.items)
    const setQuantity = useCart((s) => s.setQuantity)
    const removeItem = useCart((s) => s.removeItem)

    const {data, isLoading: productsLoading, isError: productsError} = useQuery({
        queryKey: ["products"],
        queryFn: () => apiFetch("/api/products"),
        enabled: items.length > 0
    })

    const products = data?.products ?? []

    const prodId = new Map(products.map((product) => [product.id, product]))

    const lines = items.map((item) => ({
        item,
        product: prodId.get(item.productId) ?? null
    }))

    const subTotal = lines.reduce((sum, {item, product: p}) => {
        if(!p) return sum
        return sum + p.priceCents * item.quantity
    },0)

    async function checkout () {
        setCheckoutLoading(true)

        try {
            const body = {
                items: items.map((item) => ({productId: item.productId, quantity: item.quantity}))
            }
    
            const response = await apiFetch("/api/checkout", {
                getToken,
                method: "POST",
                body
            })
    
            if(response?.checkoutUrl){
                window.location.href = response.checkoutUrl
                return
            }            
    
        } catch (error) {
            console.log("checkout failed : ",error)
            
        }
        finally{
            setCheckoutLoading(false)
        }
    }

    return {
        items,
        setQuantity,
        removeItem,
        productsLoading,
        lines,
        productsError,
        subTotal,
        checkout,
        checkoutLoading
    }
}