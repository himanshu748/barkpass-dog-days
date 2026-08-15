import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair, generateSigner, percentAmount, signerIdentity } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import bs58 from 'bs58'
import { json, postOnly, readJson, requestOrigin, safeMessage } from '../_shared.js'
import { rpcUrl, vaultSecretKey } from '../_solana.js'
import { normalizeDog } from '../_dog.js'

export default {
  async fetch(request) {
    const methodError = postOnly(request)
    if (methodError) return methodError

    try {
      const { dog: inputDog } = await readJson(request)
      const dog = normalizeDog(inputDog)
      const metadataOrigin = process.env.BARKPASS_PUBLIC_ORIGIN || requestOrigin(request)
      const metadataUrl = new URL('/api/passport-metadata', metadataOrigin)
      Object.entries(dog).forEach(([key, value]) => metadataUrl.searchParams.set(key, value))
      const umi = createUmi(rpcUrl()).use(mplTokenMetadata())
      const keypair = umi.eddsa.createKeypairFromSecretKey(vaultSecretKey())
      const authority = createSignerFromKeypair(umi, keypair)
      umi.use(signerIdentity(authority))

      const mint = generateSigner(umi)
      const result = await createNft(umi, {
        mint,
        authority,
        payer: authority,
        updateAuthority: authority,
        name: `${dog.name}'s BarkPass`.slice(0, 32),
        symbol: 'BARK',
        uri: metadataUrl.toString(),
        sellerFeeBasisPoints: percentAmount(0),
        isMutable: true,
      }).sendAndConfirm(umi)

      const signature = bs58.encode(result.signature)
      return json({
        signature,
        mintAddress: String(mint.publicKey),
        explorerUrl: `https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`,
        transactionUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        mode: 'live',
        provider: 'solana',
      })
    } catch (error) {
      console.error('Solana mint failed:', error instanceof Error ? error.message : error)
      const message = safeMessage(error, 'Solana devnet could not mint this dog’s passport. Check the vault balance and try again.')
      return json({ error: message }, /required|invalid/i.test(message) ? 400 : 502)
    }
  },
}
