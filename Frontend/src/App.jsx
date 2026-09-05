import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'
import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import CartPage from './pages/CartPage'
import OrderPage from './pages/OrderPage'

function App() {
  const {isLoaded, isSignedIn} = useAuth()

  if(!isLoaded) return <PageLoader />

  return (
    
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/orders' element={isSignedIn ? <OrderPage /> : <Navigate to={"/"} replace/>} />
      </Routes>
    </Layout>
    
    
  )
}

export default App
