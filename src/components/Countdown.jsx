import { useState, useEffect } from 'react'

const TARGET = new Date('2026-07-04T00:00:00')

function pad(n) {
  return String(n).padStart(2, '0')
}

function getTimeLeft() {
  const now = new Date()
  const diff = TARGET - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, total: diff }
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-mono text-4xl sm:text-5xl font-bold text-white tabular-nums tracking-tight">
        {pad(value)}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">
        {label}
      </div>
    </div>
  )
}

function Sep() {
  return <div className="font-mono text-3xl font-bold text-brand-teal pb-2 select-none">:</div>
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  const totalDays = Math.ceil((TARGET - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-end gap-3 sm:gap-5">
        <Unit value={time.days}    label="days"    />
        <Sep />
        <Unit value={time.hours}   label="hours"   />
        <Sep />
        <Unit value={time.minutes} label="minutes" />
        <Sep />
        <Unit value={time.seconds} label="seconds" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
          T–{totalDays} days to July 4, 2026
        </span>
      </div>
    </div>
  )
}
