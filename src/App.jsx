import { useEffect, useState } from 'react'
import PassportRail from './components/PassportRail'
import CheckinExperience from './components/CheckinExperience'
import HistorySection from './components/HistorySection'
import PassportActions from './components/PassportActions'
import DogPortrait from './components/DogPortrait'
import ProfileSetup from './components/ProfileSetup'
import IntegrationStatus from './components/IntegrationStatus'
import { Icon } from './components/Icons'
import { connectWallet, saveDogProfile } from './lib/demoAdapters'
import { defaultAnalysis, judgeDemoCheckins, judgeDemoDog } from './data/demo'
import { loadDogCheckins, loadDogProfile, saveDogCheckins, saveDogProfileLocal } from './lib/profileStore'

export default function App() {
  const [active, setActive] = useState('check-in')
  const [dog, setDog] = useState(() => loadDogProfile())
  const [checkins, setCheckins] = useState(() => {
    const profile = loadDogProfile()
    return profile ? loadDogCheckins(profile.id) : []
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileSync, setProfileSync] = useState('')
  const [wallet, setWallet] = useState(null)
  const [walletStatus, setWalletStatus] = useState('idle')
  const [walletError, setWalletError] = useState('')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('main section[id]'))
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) setActive(visible[0].target.id)
    }, { rootMargin: '-20% 0px -55%', threshold: [0.1, 0.4, 0.7] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [dog, editingProfile])

  useEffect(() => {
    if (dog) saveDogCheckins(dog.id, checkins)
  }, [dog, checkins])

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-section')
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08 })
    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [dog, editingProfile])

  useEffect(() => {
    const requestedDemo = new URLSearchParams(window.location.search).get('demo') === '1'
    if (!dog && requestedDemo) handleDemoProfile()
  }, [])

  function navigate(event, id) {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  function handleCheckinSaved(saved) {
    setCheckins((current) => [...current.filter((item) => item.id !== saved.id), saved].slice(-30))
  }

  async function handleProfileSaved(profile) {
    saveDogProfileLocal(profile)
    if (dog?.id !== profile.id) setCheckins(loadDogCheckins(profile.id))
    setDog(profile)
    setEditingProfile(false)
    setProfileSync('Saving profile to the BarkPass backend…')
    try {
      const result = await saveDogProfile(profile)
      setProfileSync(result.provider === 'snowflake' ? 'Profile synced with Snowflake' : 'Profile saved in this browser')
    } catch {
      setProfileSync('Profile saved locally; backend sync will retry with the next check-in')
    }
  }

  async function handleDemoProfile() {
    saveDogProfileLocal(judgeDemoDog)
    saveDogCheckins(judgeDemoDog.id, judgeDemoCheckins)
    setDog(judgeDemoDog)
    setCheckins(judgeDemoCheckins)
    setEditingProfile(false)
    setProfileSync('Seven-day judge demo loaded')
    try {
      const result = await saveDogProfile(judgeDemoDog)
      if (result.provider === 'snowflake') setProfileSync('Judge demo synced with Snowflake')
    } catch {
      setProfileSync('Seven-day judge demo loaded locally')
    }
  }

  async function handleWallet() {
    if (wallet) return
    setWalletError('')
    setWalletStatus('loading')
    try {
      const result = await connectWallet()
      setWallet(result)
      setWalletStatus('complete')
    } catch (error) {
      setWalletError('The wallet did not connect. Open Phantom and try again.')
      setWalletStatus('idle')
    }
  }

  if (!dog || editingProfile) {
    return <ProfileSetup existing={dog || null} onSave={handleProfileSaved} onCancel={dog ? () => setEditingProfile(false) : undefined} onDemo={!dog ? handleDemoProfile : undefined} />
  }

  return (
    <div className="app-shell">
      <PassportRail dog={dog} active={active} onNavigate={navigate} onEditProfile={() => setEditingProfile(true)} />

      <div className="mobile-profile">
        <a className="brand" href="/" aria-label="BarkPass home">BarkPass</a>
        <div className="mobile-dog">
          <DogPortrait dog={dog} />
          <button type="button" onClick={() => setEditingProfile(true)}><strong>{dog.name}</strong><span>{dog.breed}</span></button>
        </div>
        <button className="icon-wallet" type="button" onClick={handleWallet} aria-label={wallet ? `Wallet ${wallet.address}` : 'Connect wallet'}>
          {walletStatus === 'loading' ? <span className="spinner red" /> : <Icon name={wallet ? 'check' : 'wallet'} />}
        </button>
      </div>

      <main>
        <header className="utility-header">
          <p><span className="status-dot" /> {profileSync || `${dog.name}’s live profile`}</p>
          <button className="button wallet-button" type="button" onClick={handleWallet} disabled={walletStatus === 'loading'}>
            {walletStatus === 'loading' ? <span className="spinner red" /> : <Icon name={wallet ? 'check' : 'wallet'} size={19} />}
            {walletStatus === 'loading' ? 'Connecting' : wallet ? `${wallet.provider}: ${wallet.address}` : 'Connect wallet'}
          </button>
          {walletError && <p className="wallet-error" role="alert">{walletError}</p>}
        </header>

        <IntegrationStatus />

        <CheckinExperience key={dog.id} dog={dog} initialAnalysis={defaultAnalysis} latestCheckin={checkins.at(-1)} onCheckinSaved={handleCheckinSaved} />
        <HistorySection key={`history-${dog.id}`} dog={dog} checkins={checkins} />
        <PassportActions dog={dog} wallet={wallet} />

        <footer>
          <p>BarkPass is a wellness companion, not veterinary advice.</p>
          <span>Built for gentle daily observation</span>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="BarkPass mobile sections">
        {[
          ['check-in', 'home', 'Check-in'],
          ['history', 'chart', 'History'],
          ['passport', 'passport', 'Passport'],
        ].map(([id, icon, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} onClick={(event) => navigate(event, id)} aria-current={active === id ? 'page' : undefined}>
            <Icon name={icon} size={20} /><span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
