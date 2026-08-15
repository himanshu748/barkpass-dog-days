import { useMemo, useState } from 'react'
import DogPortrait from './DogPortrait'
import { Icon } from './Icons'
import { askHistory } from '../lib/demoAdapters'

function EnergyChart({ data, dogName }) {
  const points = data.map((item, index) => {
    const x = 34 + index * (492 / Math.max(1, data.length - 1))
    const y = 148 - item.energy * 12
    return { ...item, x, y }
  })
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')

  return (
    <div className="chart-wrap" aria-label={`${dogName}'s recent energy trend`}>
      <svg viewBox="0 0 560 190" role="img" aria-labelledby="chart-title chart-desc">
        <title id="chart-title">Recent energy trend</title>
        <desc id="chart-desc">{data.length ? `Energy values of ${data.map((item) => item.energy).join(', ')} out of ten.` : 'No check-ins have been saved yet.'}</desc>
        {[4, 6, 8].map((value) => (
          <g key={value}>
            <line x1="34" x2="526" y1={148 - value * 12} y2={148 - value * 12} className="grid-line" />
            <text x="11" y={152 - value * 12}>{value}</text>
          </g>
        ))}
        <path d={path} className="chart-area-line" />
        {points.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r="5.5" />
            <text x={point.x} y={point.y - 13} textAnchor="middle" className="point-label">{point.energy}</text>
            <text x={point.x} y="174" textAnchor="middle">{point.day}</text>
          </g>
        ))}
        {!data.length && <text x="280" y="100" textAnchor="middle" className="empty-chart-label">Your first check-in will start the trend</text>}
      </svg>
    </div>
  )
}

export default function HistorySection({ checkins, dog }) {
  const [question, setQuestion] = useState(`How has ${dog.name}’s energy changed?`)
  const [answer, setAnswer] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const recent = useMemo(() => [...checkins].slice(-3).reverse(), [checkins])

  async function handleAsk(event) {
    event.preventDefault()
    if (!question.trim()) {
      setError(`Ask a question about ${dog.name}’s energy, mood or patterns.`)
      return
    }
    if (!checkins.length) {
      setError(`Save ${dog.name}’s first check-in before asking about patterns.`)
      return
    }
    setError('')
    setStatus('loading')
    try {
      const result = await askHistory(question, checkins, dog)
      setAnswer(result)
      setStatus('complete')
    } catch (requestError) {
      setError('BarkPass could not read the history. Try the question again.')
      setStatus('idle')
    }
  }

  return (
    <section id="history" className="history-section reveal-section" aria-labelledby="history-title">
      <div className="history-main">
        <div className="section-heading-row">
          <div>
            <h2 id="history-title">Recent days with {dog.name}</h2>
            <p>A grounded look at energy, mood and visible patterns.</p>
          </div>
          <span className="range-label">{checkins.length ? `${checkins.length} saved check-in${checkins.length === 1 ? '' : 's'}` : 'Ready for day one'}</span>
        </div>
        <EnergyChart data={checkins.slice(-7)} dogName={dog.name} />
        <form className="ask-form" onSubmit={handleAsk}>
          <label htmlFor="history-question">Ask {dog.name}’s history</label>
          <div className="ask-row">
            <input
              id="history-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about energy, mood or patterns"
              aria-describedby={error ? 'history-error' : undefined}
            />
            <button className="button secondary" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? <span className="spinner dark" /> : <Icon name="spark" size={18} />}
              {status === 'loading' ? 'Reading history' : 'Ask BarkPass'}
            </button>
          </div>
          {error && <p id="history-error" className="form-error" role="alert">{error}</p>}
        </form>
        {answer && (
          <div className="query-answer" role="status">
            <p>{answer.answer}</p>
            <ul aria-label="History facts">
              {answer.facts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
            <span className="query-source">{answer.provider === 'snowflake' ? 'Grounded in Snowflake check-ins' : 'Local demo history'}</span>
          </div>
        )}
      </div>

      <aside className="recent-checkins" aria-labelledby="recent-title">
        <h3 id="recent-title">Recent check-ins</h3>
        <ol>
          {recent.map((item) => (
            <li key={item.id}>
              <DogPortrait dog={dog} />
              <div>
                <strong>{item.date}</strong>
                <span>{item.time}</span>
                <p>{item.mood}, energy {item.energy}/10</p>
              </div>
              <span className="mood-dot" aria-label={`${item.mood} mood`} />
            </li>
          ))}
          {!recent.length && <li className="empty-recent"><p>No check-ins yet. Add today’s photo to begin.</p></li>}
        </ol>
      </aside>
    </section>
  )
}
