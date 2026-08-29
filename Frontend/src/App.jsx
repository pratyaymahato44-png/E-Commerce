import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

function App() {


  return (
    <>
    <h1>This is a Ecommerse Website</h1>
     <header>
        <Show when="signed-out">
          <SignInButton mode='modal'/>
          <SignUpButton mode='modal'/>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </>
    
  )
}

export default App
