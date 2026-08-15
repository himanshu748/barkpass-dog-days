import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { json, postOnly, readJson, safeMessage } from '../_shared.js'
import { rpcUrl, vaultKeypair } from '../_solana.js'

export default {
  async fetch(request) {
    const methodError = postOnly(request)
    if (methodError) return methodError

    try {
      const { wallet } = await readJson(request)
      const from = new PublicKey(wallet)
      const shelter = process.env.SOLANA_SHELTER_WALLET
        ? new PublicKey(process.env.SOLANA_SHELTER_WALLET)
        : vaultKeypair().publicKey
      const connection = new Connection(rpcUrl(), 'confirmed')
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
      const transaction = new Transaction({ feePayer: from, recentBlockhash: blockhash }).add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: shelter,
          lamports: Math.round(0.01 * LAMPORTS_PER_SOL),
        }),
      )

      return json({
        transaction: transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
        lastValidBlockHeight,
        shelter: shelter.toBase58(),
        amount: 0.01,
        mode: 'live',
        provider: 'solana',
      })
    } catch (error) {
      console.error('Solana tip preparation failed:', error instanceof Error ? error.message : error)
      return json({ error: safeMessage(error, 'Solana devnet could not prepare the shelter tip.') }, 502)
    }
  },
}
