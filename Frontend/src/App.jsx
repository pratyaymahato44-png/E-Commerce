import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'

function App() {
  const {isLoaded} = useAuth()

  if(!isLoaded) return <PageLoader />

  return (
    
    <Layout>
    <h1 className='text-3xl text-center'>This is a Ecommerse Website</h1>
     <header>
        <Show when="signed-out">
          <SignInButton mode='modal'/>
          <SignUpButton mode='modal'/>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      <button className='btn btn-primary'>click me</button>
      </Layout>
    
    
  )
}

export default App
