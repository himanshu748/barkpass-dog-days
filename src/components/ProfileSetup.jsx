import { useRef, useState } from 'react'
import { Icon } from './Icons'
import { editableProfile, resolveProfileId } from '../lib/profileIdentity'

function canvasDataUrl(canvas) {
  return canvas.toDataURL('image/jpeg', 0.82)
}

async function preparePhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose a JPG, PNG or WebP photo.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose a photo under 12 MB.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d', { alpha: false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvasDataUrl(canvas)
}

export default function ProfileSetup({ existing = null, sampleProfileId = null, onSave, onCancel, onSample }) {
  const replacesSample = existing?.id === sampleProfileId
  const profileDraft = editableProfile(existing, sampleProfileId)
  const [form, setForm] = useState({
    name: profileDraft?.name || '',
    breed: profileDraft?.breed || '',
    age: profileDraft?.age || '',
    microchip: profileDraft?.microchip || '',
    vaccination: profileDraft?.vaccination || '',
    photo: profileDraft?.photo || '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const photoInput = useRef(null)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setStatus('photo')
    try {
      update('photo', await preparePhoto(file))
      setStatus('idle')
    } catch (photoError) {
      setError(photoError.message)
      setStatus('idle')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.breed.trim()) {
      setError('Add your dog’s name and breed to continue.')
      return
    }
    if (!form.photo) {
      setError('Add a clear photo so this BarkPass belongs to your dog.')
      return
    }
    setError('')
    setStatus('saving')
    try {
      await onSave({
        id: resolveProfileId(existing?.id, sampleProfileId),
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: form.age.trim(),
        microchip: form.microchip.trim(),
        vaccination: form.vaccination.trim(),
        photo: form.photo,
      })
    } catch (saveError) {
      setError(saveError.message || 'The profile could not be saved. Try again.')
      setStatus('idle')
    }
  }

  return (
    <div className="profile-setup-shell" role={existing ? 'dialog' : undefined} aria-modal={existing ? 'true' : undefined} aria-labelledby="profile-setup-title">
      <section className="profile-setup-card">
        <div className="profile-setup-copy">
          <a className="brand" href="/" aria-label="BarkPass home">BarkPass</a>
          <h1 id="profile-setup-title">Make BarkPass yours.</h1>
          <p>Bruno is our example. This profile, every check-in and every history answer will belong to your dog.</p>
          <ul>
            <li><Icon name="camera" size={19} /> One daily photo</li>
            <li><Icon name="spark" size={19} /> A grounded wellness history</li>
            <li><Icon name="passport" size={19} /> An optional devnet passport</li>
          </ul>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <button className={`profile-photo-picker ${form.photo ? 'has-photo' : ''}`} type="button" onClick={() => photoInput.current?.click()}>
            {form.photo ? <img src={form.photo} alt={`Selected profile for ${form.name || 'your dog'}`} /> : <Icon name="camera" size={28} />}
            <span>{status === 'photo' ? 'Preparing photo' : form.photo ? 'Change photo' : 'Add your dog’s photo'}</span>
          </button>
          <input ref={photoInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />

          <div className="profile-fields two-up">
            <label><span>Dog’s name *</span><input value={form.name} onChange={(event) => update('name', event.target.value)} maxLength="50" autoComplete="off" /></label>
            <label><span>Breed *</span><input value={form.breed} onChange={(event) => update('breed', event.target.value)} maxLength="80" autoComplete="off" /></label>
          </div>
          <div className="profile-fields two-up">
            <label><span>Age</span><input value={form.age} onChange={(event) => update('age', event.target.value)} placeholder="e.g. 4 years" maxLength="30" /></label>
            <label><span>Last vaccination</span><input value={form.vaccination} onChange={(event) => update('vaccination', event.target.value)} placeholder="Optional" maxLength="80" /></label>
          </div>
          <div className="profile-fields">
            <label><span>Microchip ID</span><input value={form.microchip} onChange={(event) => update('microchip', event.target.value)} placeholder="Optional" maxLength="80" /></label>
          </div>
          <p className="profile-privacy">The profile photo stays in this browser. Text profile details and check-ins sync to BarkPass’s Snowflake backend when available.</p>
          {error && <p className="form-error profile-error" role="alert">{error}</p>}
          <div className="profile-form-actions">
            {onCancel && <button className="button secondary" type="button" onClick={onCancel}>Cancel</button>}
            <button className="button primary" type="submit" disabled={status !== 'idle'}>
              {status === 'saving' ? <span className="spinner" /> : <Icon name="check" size={18} />}
              {status === 'saving' ? 'Saving profile' : existing && !replacesSample ? 'Save changes' : 'Create BarkPass'}
            </button>
          </div>
          {!existing && onSample && (
            <div className="sample-story-entry">
              <div>
                <strong>Want to look around first?</strong>
                <span>Explore Bruno’s seven-day sample story without replacing the profile you create for your dog.</span>
              </div>
              <button className="button sample-story-button" type="button" onClick={onSample} disabled={status !== 'idle'}>
                <Icon name="arrow" size={18} /> Explore the sample story
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  )
}
