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
import BloodBankRequests from './components/BloodBankRequests'
import BloodInventory from './components/BloodInventory'
import AddDirectDonation from './components/AddDirectDonation'
import DonorUrgentNeeds from './components/DonorUrgentNeeds'
import BloodBankUrgentNeeds from './components/BloodBankUrgentNeeds'
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
  const [user, setUser] = useState(null) // Store logged-in user

  useEffect(() => {
    const handleHashChange = () => {
      setShowDirectory(window.location.hash === '#blood-bank-directory')
      setShowLogin(window.location.hash === '#login')
      setShowRequestBlood(window.location.hash === '#request-blood')
      setShowViewCamps(window.location.hash === '#view-camps')
      setShowCampRegistrations(window.location.hash === '#camp-registrations')
      setShowBloodRequests(window.location.hash === '#blood-requests')
      setShowBloodInventory(window.location.hash === '#blood-inventory')
      setShowAddDonation(window.location.hash === '#add-donation')
      setShowUrgentNeeds(window.location.hash === '#urgent-needs')
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
