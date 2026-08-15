import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { requireEnv } from './_shared.js'

export function rpcUrl() {
  return process.env.SOLANA_RPC || 'https://api.devnet.solana.com'
}

export function vaultSecretKey() {
  const raw = requireEnv('SOLANA_VAULT_KEY').trim()
  let bytes
  if (raw.startsWith('[')) bytes = Uint8Array.from(JSON.parse(raw))
  else bytes = bs58.decode(raw)
  if (bytes.length !== 64 && bytes.length !== 32) throw new Error('SOLANA_VAULT_KEY is invalid.')
  return bytes
}

export function vaultKeypair() {
  const bytes = vaultSecretKey()
  return bytes.length === 32 ? Keypair.fromSeed(bytes) : Keypair.fromSecretKey(bytes)
}
