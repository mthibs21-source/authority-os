"use client"

import { useEffect, useState } from "react"

const steps = [
  "Analyzing entities...",
  "Checking schema...",
  "Mapping internal links...",
  "Evaluating AI extraction..."
]

export default function ScanProgress() {

  const [step,setStep] = useState(0)

  useEffect(()=>{

    const timer = setInterval(()=>{
      setStep((s)=>(s+1)%steps.length)
    },1500)

    return ()=>clearInterval(timer)

  },[])

  return (

    <div className="mt-6 text-gray-400 text-sm">

      {steps[step]}

    </div>

  )
}