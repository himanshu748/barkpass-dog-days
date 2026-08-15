export const defaultAnalysis = {
  mood: 'Relaxed',
  energy_level: 7,
  posture_notes: 'Loose and comfortable',
  health_flags: ['none'],
  confidence: 0.92,
  voiceLine: 'I am feeling easy today, with plenty left in the tank for our evening walk.',
  provider: 'demo',
}

export const sampleDog = {
  id: 'sample-bruno-story',
  name: 'Bruno',
  breed: 'Golden Retriever',
  age: '4 years',
  microchip: 'demo-4821',
  vaccination: 'May 1, 2026',
  photo: '/bruno-real-passport.jpg',
}

export const sampleCheckins = [
  { id: 'demo-aug-09', dogId: sampleDog.id, isoDate: '2026-08-09', day: 'Sun', date: 'Aug 9', mood: 'Relaxed', energy: 6, flags: ['none'], postureNotes: 'Loose shoulders and a soft mouth', confidence: 0.88, summaryText: 'I am taking it easy today and ready for our usual rhythm.', time: '8:12 AM' },
  { id: 'demo-aug-10', dogId: sampleDog.id, isoDate: '2026-08-10', day: 'Mon', date: 'Aug 10', mood: 'Tired', energy: 4, flags: ['none'], postureNotes: 'Resting posture with a lowered head', confidence: 0.83, summaryText: 'I am moving slowly today. A quieter pace sounds good.', time: '7:48 AM' },
  { id: 'demo-aug-11', dogId: sampleDog.id, isoDate: '2026-08-11', day: 'Tue', date: 'Aug 11', mood: 'Alert', energy: 7, flags: ['none'], postureNotes: 'Upright stance with ears forward', confidence: 0.9, summaryText: 'I am alert and ready to see what the day brings.', time: '8:03 AM' },
  { id: 'demo-aug-12', dogId: sampleDog.id, isoDate: '2026-08-12', day: 'Wed', date: 'Aug 12', mood: 'Playful', energy: 9, flags: ['none'], postureNotes: 'Forward, springy stance', confidence: 0.93, summaryText: 'I am ready to move. That toy does not stand a chance today.', time: '7:55 AM' },
  { id: 'demo-aug-13', dogId: sampleDog.id, isoDate: '2026-08-13', day: 'Thu', date: 'Aug 13', mood: 'Playful', energy: 8, flags: ['none'], postureNotes: 'Bright eyes and an open, relaxed mouth', confidence: 0.91, summaryText: 'I still have plenty of energy for another good walk.', time: '8:17 AM' },
  { id: 'demo-aug-14', dogId: sampleDog.id, isoDate: '2026-08-14', day: 'Fri', date: 'Aug 14', mood: 'Relaxed', energy: 7, flags: ['none'], postureNotes: 'Balanced stance with loose shoulders', confidence: 0.92, summaryText: 'I am feeling easy today, with enough energy for our usual rhythm.', time: '8:06 AM' },
  { id: 'demo-aug-15', dogId: sampleDog.id, isoDate: '2026-08-15', day: 'Sat', date: 'Aug 15', mood: 'Playful', energy: 8, flags: ['none'], postureNotes: 'Forward stance with a soft, open mouth', confidence: 0.94, summaryText: 'I am feeling playful and ready to move. Let us make room for a good walk today.', time: '8:21 AM' },
]
