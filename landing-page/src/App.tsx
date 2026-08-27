import { AISection } from './components/AISection'
import { FAQ } from './components/FAQ'
import { Features } from './components/Features'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { HumanStatement } from './components/HumanStatement'
import { JourneyRibbon } from './components/JourneyRibbon'
import { Navbar } from './components/Navbar'
import { PrivacySection } from './components/PrivacySection'
import { ProductShowcase } from './components/ProductShowcase'
import { TrustBar } from './components/TrustBar'

function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <a
        href="#main-content"
        className="focus-ring fixed right-4 top-3 z-[100] -translate-y-20 rounded-lg bg-blue-950 px-4 py-2 text-sm font-bold text-white transition-transform focus:translate-y-0"
      >
        رفتن به محتوای اصلی
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <JourneyRibbon />
        <Features />
        <HumanStatement />
        <HowItWorks />
        <ProductShowcase />
        <AISection />
        <PrivacySection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
