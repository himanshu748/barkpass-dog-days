const dogIdPattern = /^[A-Za-z0-9_-]{8,80}$/

function cleanText(value, field, { required = false, max = 100 } = {}) {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ')
  if (required && !cleaned) throw new Error(`${field} is required.`)
  if (cleaned.length > max) throw new Error(`${field} is invalid.`)
  return cleaned
}

export function normalizeDogId(value) {
  const dogId = String(value || '').trim()
  if (!dogIdPattern.test(dogId)) throw new Error('A valid dog ID is required.')
  return dogId
}

export function normalizeDog(input = {}) {
  return {
    id: normalizeDogId(input.id || input.dogId),
    name: cleanText(input.name || input.dogName, 'Dog name', { required: true, max: 50 }),
    breed: cleanText(input.breed, 'Breed', { required: true, max: 80 }),
    age: cleanText(input.age, 'Age', { max: 30 }),
    microchip: cleanText(input.microchip, 'Microchip', { max: 80 }),
    vaccination: cleanText(input.vaccination, 'Vaccination', { max: 80 }),
  }
}

export function publicPassportDog(input = {}) {
  const dog = normalizeDog(input)
  return {
    ...dog,
    age: dog.age || 'Not provided',
    microchip: dog.microchip || 'Not provided',
    vaccination: dog.vaccination || 'Not provided',
  }
}
