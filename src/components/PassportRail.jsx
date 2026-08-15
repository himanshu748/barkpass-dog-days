import DogPortrait from './DogPortrait'
import { Icon } from './Icons'

const navItems = [
  { id: 'check-in', label: 'Daily check-in', icon: 'home' },
  { id: 'history', label: 'History', icon: 'chart' },
  { id: 'passport', label: 'Passport', icon: 'passport' },
]

export default function PassportRail({ dog, active, onNavigate, onEditProfile }) {
  return (
    <aside className="passport-rail" aria-label={`${dog.name}'s pet passport`}>
      <a className="brand" href="/" aria-label="BarkPass home">BarkPass</a>
      <DogPortrait dog={dog} />
      <div className="profile-copy">
        <h2>{dog.name}</h2>
        <p>{dog.breed}</p>
        <p>{dog.age}</p>
      </div>
      <nav aria-label="BarkPass sections">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? 'active' : ''}
            aria-current={active === item.id ? 'page' : undefined}
            onClick={(event) => onNavigate(event, item.id)}
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <dl className="passport-facts">
        <div>
          <dt>Microchip</dt>
          <dd>{dog.microchip}</dd>
        </div>
        <div>
          <dt>Vaccination</dt>
          <dd>{dog.vaccination}</dd>
        </div>
      </dl>
      <button className="edit-profile-button" type="button" onClick={onEditProfile}>Edit dog profile</button>
      <p className="rail-note">Wellness companion<br />Not veterinary advice</p>
    </aside>
  )
}
