"use client"

import { useEffect, useState } from "react"

export default function ScoreRing({ score, label }: any) {

  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplay((v) => {
        if (v >= score) {
          clearInterval(timer)
          return score
        }
        return v + 1
      })
    }, 15)

    return () => clearInterval(timer)
  }, [score])

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (display / 100) * circumference

  return (

    <div className="flex flex-col items-center">

      <svg width="120" height="120">

        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#1f2937"
          strokeWidth="10"
          fill="none"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#eaff00"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />

      </svg>

      <div className="text-2xl font-bold mt-2">{display}</div>

      <div className="text-sm text-gray-400">{label}</div>

    </div>
  )
}