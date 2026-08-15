const photoByVariant = {
  passport: '/bruno-passport-higgsfield.jpg',
  hero: '/bruno-higgsfield.jpg',
  walk: '/bruno-walk-higgsfield.jpg',
}

const altByVariant = {
  passport: 'Bruno, a golden retriever, photographed for his BarkPass profile',
  hero: 'Bruno, a golden retriever, wearing his red BarkPass collar',
  walk: 'Bruno walking toward the camera on a quiet path',
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
