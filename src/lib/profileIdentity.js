export function resolveProfileId(existingId, sampleProfileId, createId = () => crypto.randomUUID()) {
  if (!existingId || existingId === sampleProfileId) return createId()
  return existingId
}

export function editableProfile(existing, sampleProfileId) {
  if (!existing || existing.id === sampleProfileId) return null
  return existing
}
