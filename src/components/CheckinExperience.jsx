import { useEffect, useMemo, useRef, useState } from 'react'
import DogPortrait from './DogPortrait'
import { Icon } from './Icons'
import { analyzePhoto, generateVoice, saveCheckin } from '../lib/demoAdapters'

const waveform = [18, 30, 22, 44, 58, 26, 40, 70, 48, 32, 56, 78, 36, 24, 50, 66, 32, 54, 82, 46, 26, 38, 64, 42, 72, 34, 20, 48, 62, 40, 74, 46, 30, 56, 68, 38, 24, 52, 76, 44, 28, 60, 46, 34, 54, 72, 32, 20, 44, 58, 28, 40, 64, 36, 24, 50, 70, 42, 30, 56]

function Waveform({ playing }) {
  return (
    <div className={`waveform ${playing ? 'playing' : ''}`} aria-hidden="true">
      {waveform.map((height, index) => (
        <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 18}ms` }} />
      ))}
    </div>
  )
}

export default function CheckinExperience({ dog, initialAnalysis, latestCheckin, onCheckinSaved }) {
  const [analysis, setAnalysis] = useState(() => latestCheckin ? {
    mood: latestCheckin.mood,
    energy_level: latestCheckin.energy,
    posture_notes: latestCheckin.postureNotes || 'Saved check-in',
    health_flags: latestCheckin.flags?.length ? latestCheckin.flags : ['none'],
    confidence: latestCheckin.confidence || 0,
    voiceLine: latestCheckin.summaryText || `${latestCheckin.mood}, energy ${latestCheckin.energy} out of 10.`,
    provider: 'history',
  } : initialAnalysis)
  const [hasReading, setHasReading] = useState(Boolean(latestCheckin))
  const [status, setStatus] = useState('ready')
  const [preview, setPreview] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('idle')
  const [voiceProvider, setVoiceProvider] = useState('')
  const [pipeline, setPipeline] = useState(null)
  const fileInput = useRef(null)
  const speaking = useRef(null)
  const audio = useRef(null)
  const audioUrl = useRef('')

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
    window.speechSynthesis?.cancel()
    audio.current?.pause()
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current)
  }, [preview])

  const visibleSignals = useMemo(() => {
    if (!hasReading) return 'Waiting for today’s photo'
    const flags = analysis.health_flags.filter((flag) => flag !== 'none')
    return flags.length ? flags.join(', ') : 'Bright eyes, soft mouth'
  }, [analysis, hasReading])

  async function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      setError('That file is over 20 MB. Choose a smaller photo or video.')
      return
    }

    setError('')
    setStatus('analyzing')
    if (preview) URL.revokeObjectURL(preview)
    const nextPreview = URL.createObjectURL(file)
    setPreview(nextPreview)
    setMediaType(file.type)

    try {
      const result = await analyzePhoto(file, dog)
      setAnalysis(result)
      setHasReading(true)
      const saved = {
        id: `local-${Date.now()}`,
        dogId: dog.id,
        isoDate: new Date().toISOString().slice(0, 10),
        day: 'Today',
        date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date()),
        mood: result.mood,
        energy: result.energy_level,
        flags: result.health_flags,
        postureNotes: result.posture_notes,
        confidence: result.confidence,
        summaryText: result.voiceLine,
        time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date()),
      }
      const stored = await saveCheckin(saved)
      onCheckinSaved(saved)
      setPipeline({
        analysis: result.provider === 'gemini' ? 'Gemini' : 'Demo analysis',
        storage: stored.provider === 'snowflake' ? 'Snowflake' : 'local history',
      })
      setStatus('complete')
    } catch (requestError) {
      setError('The check-in could not be read. Try the photo again.')
      setStatus('ready')
    }
  }

  function stopVoice() {
    audio.current?.pause()
    audio.current = null
    window.speechSynthesis?.cancel()
    setVoiceStatus('idle')
    setPlaying(false)
  }

  function playBrowserVoice() {
    if (!('speechSynthesis' in window)) throw new Error('Voice playback is not available in this browser.')
    const utterance = new SpeechSynthesisUtterance(analysis.voiceLine)
    const voices = window.speechSynthesis.getVoices()
    utterance.voice = voices.find((voice) => /Daniel|Samantha|English/.test(voice.name)) || voices[0] || null
    utterance.rate = 0.94
    utterance.pitch = 1.06
    utterance.onend = stopVoice
    utterance.onerror = stopVoice
    speaking.current = utterance
    setVoiceProvider('Browser fallback')
    setVoiceStatus('playing')
    setPlaying(true)
    window.speechSynthesis.speak(utterance)
  }

  async function toggleVoice() {
    if (playing) {
      stopVoice()
      return
    }
    setError('')
    setVoiceStatus('loading')
    try {
      const generated = await generateVoice(analysis.voiceLine)
      if (!generated) {
        playBrowserVoice()
        return
      }
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current)
      audioUrl.current = generated.url
      const player = new Audio(generated.url)
      player.onended = stopVoice
      player.onerror = () => {
        stopVoice()
        setError('The ElevenLabs audio could not play. Try again.')
      }
      audio.current = player
      setVoiceProvider(generated.provider)
      setVoiceStatus('playing')
      setPlaying(true)
      await player.play()
    } catch {
      try {
        playBrowserVoice()
      } catch {
        setVoiceStatus('idle')
        setError('Voice playback is not available in this browser.')
      }
    }
  }

  return (
    <section id="check-in" className="checkin-section reveal-section" aria-labelledby="checkin-title">
      <div className="checkin-heading">
        <div>
          <h1 id="checkin-title">How are you feeling today, {dog.name}?</h1>
          <p>Add a photo for a gentle read of mood, energy and visible signals.</p>
        </div>
        <div className="upload-actions">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            onChange={handleFile}
            aria-label="Choose a photo or short video for today's check-in"
          />
          <button
            className="button primary"
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={status === 'analyzing'}
          >
            {status === 'analyzing' ? <span className="spinner" /> : <Icon name="camera" />}
            {status === 'analyzing' ? 'Reading the photo' : 'Choose a photo'}
          </button>
          <span className="file-note">JPG, PNG or short video, up to 20 MB</span>
        </div>
      </div>

      {error && <p className="inline-message error" role="alert">{error}</p>}
      {status === 'complete' && <p className="inline-message success" role="status"><Icon name="check" size={17} /> {pipeline ? `${pipeline.analysis} saved to ${pipeline.storage}.` : `Check-in saved to ${dog.name}’s history.`}</p>}

      <div className={`voice-strip ${status === 'analyzing' ? 'is-loading' : ''}`} aria-busy={status === 'analyzing'}>
        <div className="checkin-media">
          {preview && mediaType.startsWith('video') ? (
            <video src={preview} controls muted playsInline aria-label="Today's check-in video" />
          ) : preview ? (
            <img src={preview} alt={`Today's uploaded check-in for ${dog.name}`} />
          ) : (
            <DogPortrait dog={dog} />
          )}
          {status === 'analyzing' && <div className="scan-line"><span>Observing visible signals</span></div>}
        </div>

        <dl className="analysis-list">
          <div>
            <dt>Mood</dt>
            <dd>{hasReading ? analysis.mood : 'Waiting'}</dd>
          </div>
          <div>
            <dt>Energy</dt>
            <dd><strong>{hasReading ? analysis.energy_level : '—'}</strong>{hasReading && <span>/10</span>}</dd>
          </div>
          <div>
            <dt>Posture</dt>
            <dd>{hasReading ? analysis.posture_notes : 'Add a clear photo to begin'}</dd>
          </div>
          <div>
            <dt>Visible signals</dt>
            <dd>{visibleSignals}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{hasReading ? `${Math.round(analysis.confidence * 100)}%` : '—'}</dd>
          </div>
        </dl>

        <div className="voice-note">
          <h2>{hasReading ? `${dog.name} says` : `${dog.name}’s update`}</h2>
          <blockquote>{hasReading ? analysis.voiceLine : 'The daily voice note will appear after the first photo check-in.'}</blockquote>
          <div className="player-row">
            <button className="play-button" type="button" onClick={toggleVoice} disabled={!hasReading || voiceStatus === 'loading'} aria-label={playing ? `Stop ${dog.name} voice note` : `Play ${dog.name} voice note`}>
              {voiceStatus === 'loading' ? <span className="spinner" /> : <Icon name={playing ? 'pause' : 'play'} size={22} />}
            </button>
            <Waveform playing={playing} />
          </div>
          <p className="player-caption">{!hasReading ? 'Ready after the first photo' : voiceStatus === 'loading' ? `Preparing ${dog.name}’s ElevenLabs voice` : playing ? `${voiceProvider} voice playing` : 'ElevenLabs voice with browser fallback'}</p>
        </div>
      </div>
    </section>
  )
}
