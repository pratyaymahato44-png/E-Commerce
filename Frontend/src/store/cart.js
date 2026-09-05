import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCart = create(
    persist(( set, get) => ({
            items: [],

            addItem(productId, quantity = 1){
                const items = [...get().items]

                const idx = items.findIndex((item) => item.productId === productId)

                if(idx >= 0){
                    items[idx] = {...items[idx], quantity: items[idx].quantity + quantity}
                }
                else{
                    items.push({productId, quantity: quantity})
                }
                set({items})

            },
            
            removeItem(productId) {
                set({ items: get().items.filter((item) => item.productId !== productId) })
            },

            setQuantity(productId, quantity) {
                if(quantity <= 0){
                    set({ items: get().items.filter((item) => item.productId !== productId) })

                    return
                }

                

                const items = get().items.map((item) => item.productId === productId ? {...item, quantity} : item)

                set({items})
            },

            clear() {
                set({items: []})
            }
        }),
        {name: "my-cart"}
    )
)