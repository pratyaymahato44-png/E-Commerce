import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'
import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import CartPage from './pages/CartPage'
import OrderPage from './pages/OrderPage'
import CheckoutReturnPage from './pages/CheckoutReturnPage'
import ProductDetailPage from './pages/ProductDetailPage'
import { SentryDemoPage } from './pages/SentryDemoPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderChatPage from './pages/OrderChatPage'
import OrderSummaryPage from './pages/OrderSummaryPage'
import OrderVideoCallPage from './pages/OrderVideoCallPage'
import AdminPage from './pages/AdminPage'

function App() {
  const {isLoaded, isSignedIn} = useAuth()

  if(!isLoaded) return <PageLoader />

  return (
    
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/product/:slug' element={<ProductDetailPage />} />
        <Route path='/orders' element={isSignedIn ? <OrderPage /> : <Navigate to={"/"} replace/>} />
        <Route path='/checkout/return' element={<CheckoutReturnPage />} />
        <Route path='/sentry-demo' element={<SentryDemoPage />} />
        <Route path='/orders/:id/call' element={isSignedIn ? <OrderVideoCallPage/> : <Navigate to={"/"} replace/>} />
        <Route path='/admin' element={isSignedIn ? <AdminPage/> : <Navigate to="/" replace />} />

        {/* NESTED ROUTES */}
        <Route path='/orders/:id' element={<OrderDetailPage />}>
          <Route index element={<OrderSummaryPage />} />
          <Route path='chat' element={<OrderChatPage />} />
        </Route>
      </Routes>
    </Layout>
    
    
  )
}

export default App
