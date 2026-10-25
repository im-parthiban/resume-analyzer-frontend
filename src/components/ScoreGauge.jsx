import { useEffect, useState } from 'react'
import { getScoreStyle } from '../utils/scoreStyle'

const ARC_LENGTH = Math.PI * 80

export default function ScoreGauge({ score }) {
  const [shown, setShown] = useState(0)
  const style = getScoreStyle(score)

  useEffect(() => {
    const timer = setTimeout(() => setShown(score), 150)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <svg viewBox="0 0 200 115" className="w-full" role="img" aria-label={`Match score ${score} out of 100`}>
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-slate-200"
        />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className={`${style.stroke} transition-all duration-1000 ease-out`}
          strokeDasharray={`${(shown / 100) * ARC_LENGTH} ${ARC_LENGTH}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <p className={`text-5xl font-semibold ${style.text}`}>{score}</p>
        <p className="text-sm text-slate-500">out of 100</p>
      </div>
    </div>
  )
}