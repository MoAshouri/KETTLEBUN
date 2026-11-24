type IconName = 'bag' | 'down' | 'plus' | 'minus' | 'close' | 'check' | 'copy' | 'whatsapp'

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    bag: <><path d="M5 8h14l1.3 13H3.7L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    down: <path d="m6 9 6 6 6-6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    minus: <path d="M5 12h14"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    whatsapp: <><path d="M20.6 11.7a8.6 8.6 0 0 1-12.9 7.4l-4.3 1.1 1.2-4.2a8.6 8.6 0 1 1 16-4.3Z"/><path d="M9 8.1c-.7.2-.9 1.1-.6 2 .4 1.6 2.6 3.9 4.3 4.5.9.3 2 .1 2.3-.6l.2-.6-1.9-.9-.8.8a6.1 6.1 0 0 1-2.5-2.5l.5-.8-.8-1.9H9Z"/></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export function Teapot({ ceramic = false }: { ceramic?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 84" fill="none" className={ceramic ? 'teapot teapot--ceramic' : 'teapot'}>
      {ceramic && <defs><radialGradient id="glaze" cx="30%" cy="28%" r="78%"><stop stopColor="#f7ad84"/><stop offset=".46" stopColor="#cc593d"/><stop offset="1" stopColor="#84281e"/></radialGradient></defs>}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={ceramic ? 2.1 : 4.8}>
        <path className="teapot-steam" d="M65 21c10-8-7-9 1-17m13 17c10-8-6-9 1-17"/>
        <path d="M25 42C3 32 1 63 21 62m49-20c10 3 12-13 26-11-7 4-7 16-13 23-3 4-6 6-12 6"/>
        <path d="M30 34c4-10 27-10 33 0M45 25c-5-5 8-9 8 0" fill={ceramic ? 'url(#glaze)' : undefined}/>
        <path d="M30 35c-6 5-11 13-11 23 0 13 10 20 28 20s28-7 28-20c0-10-5-18-11-23H30Z" fill={ceramic ? 'url(#glaze)' : undefined}/>
        {ceramic && <path d="M31 47c-4 3-6 8-6 13" stroke="#f2a382" opacity=".8"/>}
      </g>
    </svg>
  )
}
