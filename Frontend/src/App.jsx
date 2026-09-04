import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'
import { Routes, Route } from 'react-router'
import Home from './pages/Home'

function App() {
  const {isLoaded} = useAuth()

  if(!isLoaded) return <PageLoader />

  return (
    
    <Layout>
      <Routes>
        <Route path="/" element={<Home />}/>
      </Routes>
    </Layout>
    
    
  )
}

export default App
