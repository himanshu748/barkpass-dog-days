import { useEffect, useState } from 'react'
import DogPortrait from './components/DogPortrait'
import { Icon } from './components/Icons'

const waveBars = [34, 54, 30, 70, 46, 88, 44, 64, 28, 74, 52, 92, 40, 68, 34, 80, 48, 62, 30, 72, 42, 86, 52, 66, 36, 76, 44, 58, 32, 82, 50, 70, 38, 62, 46, 90, 54, 72, 36, 66, 42, 78, 48, 60, 32, 74, 52, 84, 40, 64]

function BarkWave({ active = false }) {
  return (
    <div className={`landing-wave ${active ? 'active' : ''}`} aria-hidden="true">
      {waveBars.map((height, index) => (
        <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 17}ms` }} />
      ))}
    </div>
  )
}

function TrendIllustration() {
  const points = '28,146 109,122 190,151 271,87 352,73 433,116 514,91'
  return (
    <svg className="landing-trend" viewBox="0 0 540 190" role="img" aria-labelledby="landing-chart-title landing-chart-desc">
      <title id="landing-chart-title">Bruno's seven day energy pattern</title>
      <desc id="landing-chart-desc">Energy was lowest on Monday and highest on Wednesday.</desc>
      {[58, 102, 146].map((y) => <line key={y} x1="28" x2="514" y1={y} y2={y} />)}
      <polyline points={points} />
      {points.split(' ').map((point, index) => {
        const [cx, cy] = point.split(',')
        return <circle key={point} cx={cx} cy={cy} r={index === 4 ? 8 : 5} />
      })}
      {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
        <text key={day} x={28 + index * 81} y="181" textAnchor="middle">{day}</text>
      ))}
    </svg>
  )
}

export default function LandingPage() {
  const [playing, setPlaying] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    document.title = 'BarkPass, a daily wellness passport for dogs'
    const items = document.querySelectorAll('.landing-reveal')
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('visible'))
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  function playUpdate() {
    if (!('speechSynthesis' in window)) return
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }
    const voice = new SpeechSynthesisUtterance('I am feeling easy today, with plenty left in the tank for our evening walk.')
    voice.rate = 0.94
    voice.pitch = 1.06
    voice.onend = () => setPlaying(false)
    voice.onerror = () => setPlaying(false)
    setPlaying(true)
    window.speechSynthesis.speak(voice)
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="brand" href="#top" aria-label="BarkPass home">BarkPass</a>
        <nav aria-label="Landing page navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#history-story">Wellness history</a>
          <a href="#passport-story">Pet passport</a>
        </nav>
        <a className="landing-button small" href="/app">Create a BarkPass <Icon name="arrow" size={17} /></a>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="hero-copy landing-reveal visible">
            <h1>One photo. A clearer day with your dog.</h1>
            <p className="hero-lede">BarkPass turns a daily photo into a gentle mood read, a voiced update, a lasting wellness history and a portable pet passport.</p>
            <div className="hero-actions">
              <a className="landing-button" href="/app">Create your dog’s BarkPass <Icon name="arrow" size={18} /></a>
              <a className="text-link" href="/app?sample=1">Explore Bruno's sample story</a>
            </div>
            <p className="wellness-note"><Icon name="shield" size={17} /> Wellness companion, not veterinary advice.</p>
          </div>

          <div className="hero-visual landing-reveal visible" aria-label="An example BarkPass daily check-in featuring Bruno">
            <div className="hero-orbit" aria-hidden="true" />
            <article className="hero-passport-card">
              <div className="hero-media">
                {!heroLoaded && <DogPortrait />}
                <img
                  src="/bruno-real-hero.jpg"
                  alt="Bruno, a golden retriever, holding a yellow flower outdoors"
                  className={heroLoaded ? 'loaded' : ''}
                  onLoad={() => setHeroLoaded(true)}
                  onError={() => setHeroLoaded(false)}
                />
              </div>
              <div className="hero-id-row">
                <div><strong>Bruno</strong><span>Golden Retriever, 4 years</span></div>
                <span className="energy-stamp"><b>7</b>/10 energy</span>
              </div>
            </article>
            <div className="hero-voice-card">
              <button type="button" onClick={playUpdate} aria-label={playing ? 'Stop Bruno update' : 'Play Bruno update'}>
                <Icon name={playing ? 'pause' : 'play'} size={20} />
              </button>
              <div><span>Bruno says</span><strong>I am feeling easy today.</strong></div>
              <BarkWave active={playing} />
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="BarkPass technology">
          <span>Visual mood read</span>
          <strong>Gemini</strong>
          <span>Voice update</span>
          <strong>ElevenLabs</strong>
          <span>Wellness history</span>
          <strong>Snowflake</strong>
          <span>Portable record</span>
          <strong>Solana</strong>
        </section>

        <section id="how-it-works" className="ritual-section landing-reveal">
          <div className="landing-section-title">
            <h2>A daily ritual built around what dogs already show us.</h2>
            <p>No forms to remember and no diagnosis. Just one attentive moment that becomes useful over time.</p>
          </div>
          <ol className="ritual-steps">
            <li>
              <span>01</span>
              <Icon name="camera" size={27} />
              <h3>Share today’s photo</h3>
              <p>Add a photo or short clip from the walk, sofa or backyard.</p>
            </li>
            <li>
              <span>02</span>
              <Icon name="spark" size={27} />
              <h3>Notice the visible signals</h3>
              <p>Gemini observes mood, energy, posture and only what can be seen.</p>
            </li>
            <li>
              <span>03</span>
              <Icon name="play" size={27} />
              <h3>Hear their daily update</h3>
              <p>A warm voice note makes the daily check-in easy to remember.</p>
            </li>
          </ol>
        </section>

        <section className="voice-story landing-reveal">
          <div className="voice-story-copy">
            <h2>Wellness history that sounds like your dog, not a spreadsheet.</h2>
            <p>Each observation becomes a simple line in your dog’s story. Ask a plain-language question and get an answer grounded in the check-ins you actually saved.</p>
            <button type="button" className="voice-story-button" onClick={playUpdate}>
              <span><Icon name={playing ? 'pause' : 'play'} size={20} /></span>
              {playing ? 'Stop example update' : 'Play example update'}
            </button>
          </div>
          <div className="voice-stage">
            <blockquote>“I am feeling easy today, with plenty left in the tank for our evening walk.”</blockquote>
            <BarkWave active={playing} />
            <div className="voice-facts"><span>Relaxed</span><span>Energy 7/10</span><span>Confidence 92%</span></div>
          </div>
        </section>

        <section id="history-story" className="history-story landing-reveal">
          <div className="history-story-copy">
            <h2>Seven days become a pattern you can act on.</h2>
            <p>Snowflake keeps each dog’s record separate and grounded. Ask “How has my dog’s energy changed?” and see the numbers right beside the summary.</p>
            <dl>
              <div><dt>Weekly average</dt><dd>6.7</dd></div>
              <div><dt>Highest energy</dt><dd>Wednesday</dd></div>
              <div><dt>Visible flags</dt><dd>None today</dd></div>
            </dl>
          </div>
          <div className="trend-card">
            <div><span>Bruno’s energy</span><strong>Steady this week</strong></div>
            <TrendIllustration />
            <p>“Energy dipped on Monday, then returned to Bruno’s usual range.”</p>
          </div>
        </section>

        <section id="passport-story" className="passport-story landing-reveal">
          <div className="passport-object" aria-label="Bruno's on-chain pet passport">
            <div className="passport-object-top"><Icon name="passport" size={33} /><span>BarkPass</span></div>
            <DogPortrait compact />
            <div className="passport-name"><strong>Bruno</strong><span>Golden Retriever</span></div>
            <dl>
              <div><dt>Microchip</dt><dd>demo-4821</dd></div>
              <div><dt>Vaccination</dt><dd>May 1, 2026</dd></div>
            </dl>
          </div>
          <div className="passport-story-copy">
            <h2>A pet passport designed to travel with your dog.</h2>
            <p>Identity, vaccination details and a permanent mint address live together on Solana devnet. A shelter tip stays one clear action away.</p>
            <ul>
              <li><Icon name="check" size={18} /> Portable identity record</li>
              <li><Icon name="check" size={18} /> Viewable devnet mint address</li>
              <li><Icon name="check" size={18} /> Direct shelter donation rail</li>
            </ul>
            <div className="passport-story-actions">
              <a className="landing-button light" href="/app#passport">Create your dog’s passport <Icon name="arrow" size={18} /></a>
              <a className="verified-proof-link" href="https://explorer.solana.com/address/AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3?cluster=devnet" target="_blank" rel="noreferrer">View a verified live mint <Icon name="arrow" size={16} /></a>
            </div>
          </div>
        </section>

        <section className="closing-section landing-reveal">
          <DogPortrait variant="walk" />
          <h2>Make today’s photo part of your dog’s story.</h2>
          <p>One gentle check-in now. A clearer wellness history over time.</p>
          <a className="landing-button" href="/app">Start today’s check-in <Icon name="arrow" size={18} /></a>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="brand" href="#top">BarkPass</a>
        <p>BarkPass is a wellness companion, not veterinary advice.</p>
        <div><a href="#how-it-works">How it works</a><a href="/app">Open the app</a></div>
      </footer>
    </div>
  )
}
