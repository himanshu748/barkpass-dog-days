import { json, requestOrigin } from './_shared.js'
import { publicPassportDog } from './_dog.js'

export default {
  fetch(request) {
    if (request.method !== 'GET') return json({ error: 'Use GET for this endpoint.' }, 405)
    try {
      const origin = requestOrigin(request)
      const url = new URL(request.url)
      const dog = publicPassportDog(Object.fromEntries(url.searchParams))
      return json({
        name: `${dog.name}'s BarkPass`,
        symbol: 'BARK',
        description: `A portable wellness passport for ${dog.name}, created with BarkPass.`,
        image: `${origin}/barkpass-passport.svg`,
        external_url: `${origin}/app#passport`,
        attributes: [
          { trait_type: 'Breed', value: dog.breed },
          { trait_type: 'Age', value: dog.age },
          { trait_type: 'Microchip ID', value: dog.microchip },
          { trait_type: 'Last vaccination', value: dog.vaccination },
          { trait_type: 'Network', value: 'Solana devnet' },
        ],
      })
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Invalid passport metadata.' }, 400)
    }
  },
}
