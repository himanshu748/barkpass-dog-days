import { useState } from 'react'
import { Icon } from './Icons'
import { runChainAction } from '../lib/demoAdapters'

function ActionPanel({ title, copy, action, icon, buttonLabel, wallet, dog, amount }) {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleAction() {
    if (!wallet) {
      setError('Connect a wallet before continuing.')
      return
    }
    setError('')
    setStatus('loading')
    try {
      const nextResult = await runChainAction(action, wallet, dog)
      setResult(nextResult)
      setStatus('complete')
    } catch (requestError) {
      setError(`The ${action} request did not complete. Try again on devnet.`)
      setStatus('idle')
    }
  }

  const completeLabel = result?.mode === 'live'
    ? 'Confirmed on devnet'
    : result?.mode === 'verified-example'
      ? 'Verified proof ready'
      : 'Demo ready'

  return (
    <article className="chain-action">
      <Icon name={icon} size={28} />
      <div className="chain-copy">
        <h3>{title}</h3>
        <p>{copy}</p>
        {amount && <span className="amount">{amount}</span>}
      </div>
      <div className="chain-control">
        <button className="button outline" type="button" onClick={handleAction} disabled={status === 'loading' || status === 'complete'}>
          {status === 'loading' ? <span className="spinner red" /> : <Icon name={status === 'complete' ? 'check' : icon} size={18} />}
          {status === 'loading' ? 'Confirming' : status === 'complete' ? completeLabel : buttonLabel}
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
        {result?.message && <p className="chain-result-note" role="status">{result.message}</p>}
        {result && (
          result.explorerUrl && <a href={result.explorerUrl} target="_blank" rel="noreferrer" className="explorer-link">
            {result.mode === 'live' ? 'View on Solana Explorer' : 'View verified live example'} <Icon name="arrow" size={15} />
          </a>
        )}
      </div>
    </article>
  )
}

export default function PassportActions({ dog, wallet }) {
  return (
    <section id="passport" className="passport-section reveal-section" aria-labelledby="passport-title">
      <div className="passport-intro">
        <span className="tag-icon"><Icon name="passport" size={30} /></span>
        <div>
          <h2 id="passport-title">On-chain pet passport</h2>
          <p>A portable devnet record for {dog.name}’s identity and care details.</p>
        </div>
        <dl>
          <div><dt>Breed</dt><dd>{dog.breed}</dd></div>
          <div><dt>Microchip</dt><dd>{dog.microchip}</dd></div>
          <div><dt>Last vaccination</dt><dd>{dog.vaccination}</dd></div>
        </dl>
      </div>
      <div className="chain-actions">
        <ActionPanel
          title={`Mint ${dog.name}’s passport`}
          copy="Create a permanent demo passport record on Solana devnet."
          action="mint"
          icon="shield"
          buttonLabel="Mint passport"
          wallet={wallet}
          dog={dog}
        />
        <ActionPanel
          title="Tip a shelter"
          copy="Send a small devnet contribution to the demo shelter wallet."
          action="tip"
          icon="heart"
          buttonLabel="Tip a shelter"
          wallet={wallet}
          dog={dog}
          amount="0.01 devnet SOL"
        />
      </div>
    </section>
  )
}
