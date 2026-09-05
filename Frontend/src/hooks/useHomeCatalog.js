import { useSearchParams } from "react-router";
import { apiFetch } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

export function useHomeCatalog(){
    const [searchParams, setSearchParams] = useSearchParams() 

    const categoryFilter = searchParams.get("category")?.trim() ?? ""

    const setCategory = (category) => {
        const next = new URLSearchParams(searchParams)

        if(!category) next.delete("category")           
        else next.set("category", category)

        setSearchParams(next, {replace: true})
    }

    const {data: categoriesData, isLoading: loadingCategories} = useQuery({
        queryKey: ["products-categories"],
        queryFn: () => apiFetch("/api/products/categories")
    })

    // console.log("Categories API response:", categoriesData);

    const {data: productsData, isLoading: loadingList, error} = useQuery({
        queryKey: ["products", categoryFilter],
        queryFn: () => apiFetch(categoryFilter ? `/api/products?category=${encodeURIComponent(categoryFilter)}` : "/api/products")
    })

    const categories = categoriesData?.category ?? []
    const products = productsData?.products ?? []
    const categoryChipsLoading = loadingCategories && categories.length === 0

    return {
        categories,
        setCategory,
        categoryFilter,
        products,
        categoryChipsLoading,
        loadingCategories,
        loadingList,
        error
    }
}