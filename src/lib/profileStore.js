const profileKey = 'barkpass:dog-profile:v1'
const checkinsKey = (dogId) => `barkpass:checkins:v1:${dogId}`

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return value ?? fallback
  } catch {
    return fallback
  }
}

export function loadDogProfile() {
  const profile = readJson(profileKey, null)
  return profile?.id && profile?.name && profile?.breed ? profile : null
}

export function saveDogProfileLocal(profile) {
  localStorage.setItem(profileKey, JSON.stringify(profile))
}

export function loadDogCheckins(dogId) {
  const checkins = readJson(checkinsKey(dogId), [])
  return Array.isArray(checkins) ? checkins : []
}

export function saveDogCheckins(dogId, checkins) {
  localStorage.setItem(checkinsKey(dogId), JSON.stringify(checkins.slice(-30)))
}
