export function Icon({ name, size = 20, className = '' }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    className,
  }

  const paths = {
    camera: <><path d="M4.5 7.5h3l1.4-2h6.2l1.4 2h3A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V9a1.5 1.5 0 0 1 1.5-1.5Z"/><circle cx="12" cy="13" r="3.5"/></>,
    home: <><path d="m3.5 10.5 8.5-7 8.5 7"/><path d="M5.5 9v10h13V9M9.5 19v-6h5v6"/></>,
    chart: <><path d="M4 20V9h4v11M10 20V4h4v16M16 20v-8h4v8M2.5 20h19"/></>,
    passport: <><rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="9" r="2.4"/><path d="M8.5 15c.9-1.5 2-2.2 3.5-2.2s2.6.7 3.5 2.2M8.5 18h7"/></>,
    wallet: <><path d="M4 6.5h14.5A1.5 1.5 0 0 1 20 8v10a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3 18V6a2 2 0 0 1 2-2h12"/><path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z"/><circle cx="16.5" cy="13" r=".3" fill="currentColor"/></>,
    play: <path d="m9 7 8 5-8 5V7Z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M9 7v10M15 7v10" strokeWidth="2.6"/></>,
    check: <path d="m5 12 4.2 4.2L19 6.5"/>,
    spark: <><path d="m12 3 1.3 4.1L17 9l-3.7 1.9L12 15l-1.3-4.1L7 9l3.7-1.9L12 3Z"/><path d="m18.5 15 .7 2.1L21 18l-1.8.9-.7 2.1-.7-2.1L16 18l1.8-.9.7-2.1Z"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    shield: <><path d="M12 3 5.5 5.6v5.6c0 4.2 2.5 7.4 6.5 9.8 4-2.4 6.5-5.6 6.5-9.8V5.6L12 3Z"/><path d="m9.2 12 1.8 1.8 3.8-4"/></>,
    heart: <path d="M20.8 5.9a5.2 5.2 0 0 0-7.4 0L12 7.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z"/>,
    upload: <><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M4 15v4.5h16V15"/></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}
