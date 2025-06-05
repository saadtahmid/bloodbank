import Navbar from './components/Navbar'
import Header from './components/Header'
import Intro from './components/Intro'
import Features from './components/Features'
import Footer from './components/Footer'
import BloodBankDirectory from './components/BloodBankDirectory'
import { useEffect, useState } from 'react'

function App() {
  const [showDirectory, setShowDirectory] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      setShowDirectory(window.location.hash === '#blood-bank-directory')
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="homepage-container">
      <Navbar />
      <Header />
      <main>
        {showDirectory ? (
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
