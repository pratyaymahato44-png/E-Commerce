import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'
import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import CartPage from './pages/CartPage'

function App() {
  const {isLoaded} = useAuth()

  if(!isLoaded) return <PageLoader />

  return (
    
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/cart' element={<CartPage />} />
      </Routes>
    </Layout>
    
    
  )
}

export default App
