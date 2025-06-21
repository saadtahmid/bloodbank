import Navbar from './components/Navbar'
import Header from './components/Header'
import Intro from './components/Intro'
import Features from './components/Features'
import Footer from './components/Footer'
import BloodBankDirectory from './components/BloodBankDirectory'
import Login from './components/Login'
import RequestBlood from './components/RequestBlood'
import ViewCamps from './components/ViewCamps'
import BloodBankCampRegistrations from './components/BloodBankCampRegistrations'
import { useEffect, useState } from 'react'

function App() {
  const [showDirectory, setShowDirectory] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRequestBlood, setShowRequestBlood] = useState(false)
  const [showViewCamps, setShowViewCamps] = useState(false)
  const [showCampRegistrations, setShowCampRegistrations] = useState(false)
  const [user, setUser] = useState(null) // Store logged-in user

  useEffect(() => {
    const handleHashChange = () => {
      setShowDirectory(window.location.hash === '#blood-bank-directory')
      setShowLogin(window.location.hash === '#login')
      setShowRequestBlood(window.location.hash === '#request-blood')
      setShowViewCamps(window.location.hash === '#view-camps')
      setShowCampRegistrations(window.location.hash === '#camp-registrations')
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Pass setUser to Login so it can set user on successful login
  return (
    <div className="homepage-container min-h-screen flex flex-col bg-black">
      <Navbar user={user} setUser={setUser} />
      <Header />
      <main className="flex-1 flex flex-col">
        {showLogin ? (
          <Login setUser={setUser} />
        ) : showRequestBlood ? (
          <RequestBlood user={user} />
        ) : showViewCamps ? (
          <ViewCamps user={user} />
        ) : showDirectory ? (
          <BloodBankDirectory />
        ) : showCampRegistrations ? (
          <BloodBankCampRegistrations user={user} />
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
