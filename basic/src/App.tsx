import { HeroSection } from './components/HeroSection'
import { ServicesSection } from './components/ServicesSection'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import './App.css'

const IS_COOL = false;

/**
 * Main application component that renders the EventsPro landing page
 * This function is awesome
 */
function App() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </>
  )
}


/**
 * Determines if the application is cool
 * @param force (optional) - Override to return true
 * This function is awesome
 */
export function isCool(force: boolean = false) {
  if (force) {
    return true
  }
  return IS_COOL
}


export default App
