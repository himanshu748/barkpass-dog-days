const photoByVariant = {
  passport: '/bruno-real-passport.jpg',
  hero: '/bruno-real-hero.jpg',
  walk: '/bruno-real-walk.jpg',
}

const altByVariant = {
  passport: 'Bruno, a golden retriever, photographed against a blue background',
  hero: 'Bruno, a golden retriever, holding a yellow flower outdoors',
  walk: 'Bruno as a golden retriever puppy wearing a red collar',
}

export default function DogPortrait({ variant = 'passport', className = '', dog = null }) {
  const source = dog?.photo || photoByVariant[variant] || photoByVariant.passport
  const alt = dog?.name
    ? `${dog.name}, ${dog.breed || 'a dog'}, in their BarkPass profile`
    : altByVariant[variant] || altByVariant.passport
  return (
    <img
      src={source}
      alt={alt}
      className={`dog-portrait ${className}`.trim()}
      loading={variant === 'walk' ? 'lazy' : 'eager'}
      decoding="async"
    />
  )
}
