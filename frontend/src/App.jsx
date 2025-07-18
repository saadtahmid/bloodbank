import Navbar from './components/Navbar'
import Header from './components/Header'
import Intro from './components/Intro'
import Features from './components/Features'
import About from './components/About'
import Footer from './components/Footer'
import BloodBankDirectory from './components/BloodBankDirectory'
import Login from './components/Login'
import RequestBlood from './components/RequestBlood'
import ViewCamps from './components/ViewCamps'
import BloodBankCampRegistrations from './components/BloodBankCampRegistrations'
import BloodBankRequests from './components/BloodBankRequests'
import BloodInventory from './components/BloodInventory'
import AddDirectDonation from './components/AddDirectDonation'
import DonorUrgentNeeds from './components/DonorUrgentNeeds'
import BloodBankUrgentNeeds from './components/BloodBankUrgentNeeds'
import Profile from './components/Profile'
import { useEffect, useState } from 'react'

function App() {
  const [showDirectory, setShowDirectory] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRequestBlood, setShowRequestBlood] = useState(false)
  const [showViewCamps, setShowViewCamps] = useState(false)
  const [showCampRegistrations, setShowCampRegistrations] = useState(false)
  const [showBloodRequests, setShowBloodRequests] = useState(false)
  const [showBloodInventory, setShowBloodInventory] = useState(false)
  const [showAddDonation, setShowAddDonation] = useState(false)
  const [showUrgentNeeds, setShowUrgentNeeds] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash

      // Reset all states
      setShowDirectory(false)
      setShowLogin(false)
      setShowRequestBlood(false)
      setShowViewCamps(false)
      setShowCampRegistrations(false)
      setShowBloodRequests(false)
      setShowBloodInventory(false)
      setShowAddDonation(false)
      setShowUrgentNeeds(false)
      setShowProfile(false)
      setShowAbout(false)

      // Set the appropriate state based on hash
      switch (hash) {
        case '#blood-bank-directory':
          setShowDirectory(true)
          break
        case '#login':
          setShowLogin(true)
          break
        case '#request-blood':
          setShowRequestBlood(true)
          break
        case '#view-camps':
          setShowViewCamps(true)
          break
        case '#camp-registrations':
          setShowCampRegistrations(true)
          break
        case '#blood-requests':
          setShowBloodRequests(true)
          break
        case '#blood-inventory':
          setShowBloodInventory(true)
          break
        case '#add-donation':
          setShowAddDonation(true)
          break
        case '#urgent-needs':
          setShowUrgentNeeds(true)
          break
        case '#profile':
          setShowProfile(true)
          break
        case '#about':
          setShowAbout(true)
          break
        default:
          // Home page (includes #home and empty)
          break
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Run on initial load
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Check if we're on the home page (no hash, #home, or empty)
  const isHomePage = !window.location.hash ||
    window.location.hash === '#home' ||
    window.location.hash === ''

  return (
    <div className="homepage-container min-h-screen flex flex-col bg-black">
      <Navbar user={user} setUser={setUser} />

      {/* Only show Header on home page */}
      {isHomePage && <Header />}

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
        ) : showBloodRequests ? (
          <BloodBankRequests user={user} />
        ) : showBloodInventory ? (
          <BloodInventory user={user} />
        ) : showAddDonation ? (
          <AddDirectDonation user={user} />
        ) : showUrgentNeeds ? (
          user && user.role && user.role.toLowerCase() === 'donor' ? (
            <DonorUrgentNeeds donor_id={user.donor_id} />
          ) : user && user.role && user.role.toLowerCase() === 'bloodbank' ? (
            <BloodBankUrgentNeeds bloodbank_id={user.bloodbank_id} />
          ) : null
        ) : showProfile ? (
          <Profile user={user} />
        ) : showAbout ? (
          <About />
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
