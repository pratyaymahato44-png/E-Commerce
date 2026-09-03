import Navbar from "./Navbar"
import Footer from "./Footer"
import { useCart } from "../store/cart"

function Layout({children}){

    const products = useCart(s => s.products)

    const resetProduct = useCart(s => s.resetProducts)
    return(
        <div className="flex min-h-svh flex-col bg-base-200 text-base-content">
            <Navbar />

            <button onClick={resetProduct}>Reset Product</button>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10">{children}</main>

            <Footer />
        </div>
    )
}

export default Layout