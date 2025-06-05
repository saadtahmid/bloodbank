import Navbar from './components/Navbar'
import Header from './components/Header'
import Intro from './components/Intro'
import Features from './components/Features'
import Footer from './components/Footer'
import BloodBankDirectory from './components/BloodBankDirectory'
import Login from './components/Login'
import { useEffect, useState } from 'react'

function App() {
  const [showDirectory, setShowDirectory] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      setShowDirectory(window.location.hash === '#blood-bank-directory')
      setShowLogin(window.location.hash === '#login')
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="homepage-container min-h-screen flex flex-col bg-black">
      <Navbar />
      <Header />
      <main className="flex-1 flex flex-col">
        {showLogin ? (
          <Login />
        ) : showDirectory ? (
          <BloodBankDirectory />
        ) : (
          <>
            <Intro />
            <Features />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
