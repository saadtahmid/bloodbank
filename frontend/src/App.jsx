import Navbar from './components/Navbar'
import Header from './components/Header'
import Intro from './components/Intro'
import Features from './components/Features'
import Footer from './components/Footer'

function App() {
  return (
    <div className="homepage-container">
      <Navbar />
      <Header />
      <main>
        <Intro />
        <Features />
      </main>
      <Footer />
    </div>
  )
}

export default App
