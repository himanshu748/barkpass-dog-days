import { useEffect, useMemo, useState } from 'react'
import { Icon } from './Icons'

const providerNames = {
  gemini: 'Gemini',
  elevenlabs: 'ElevenLabs',
  snowflake: 'Snowflake',
  solana: 'Solana',
}

export default function IntegrationStatus() {
  const [providers, setProviders] = useState(null)

  useEffect(() => {
    let active = true
    fetch('/api/integrations')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Status unavailable')))
      .then((result) => { if (active) setProviders(result.providers || {}) })
      .catch(() => { if (active) setProviders({}) })
    return () => { active = false }
  }, [])

  const liveCount = useMemo(() => providers ? Object.values(providers).filter(Boolean).length : 0, [providers])
  const isLive = liveCount === 4

  return (
    <aside className={`integration-status ${isLive ? 'all-live' : ''}`} aria-label="Challenge integration status" aria-live="polite">
      <div className="integration-status-copy">
        <span className="integration-kicker"><Icon name="spark" size={16} /> DEV Weekend challenge stack</span>
        <strong>{providers === null ? 'Checking sponsor routes' : isLive ? 'All four sponsor routes are live' : 'Safe demo fallbacks are active'}</strong>
        <p>{isLive ? 'Upload one photo to exercise the complete provider pipeline.' : 'The full interface works here. Live-provider evidence is linked in the submission.'}</p>
      </div>
      <ul>
        {Object.entries(providerNames).map(([key, label]) => (
          <li key={key} className={providers?.[key] ? 'live' : ''}>
            <span aria-hidden="true" />
            {label}
            <small>{providers === null ? 'checking' : providers[key] ? 'live' : 'demo'}</small>
          </li>
        ))}
      </ul>
    </aside>
  )
}
