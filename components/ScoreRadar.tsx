"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from "recharts"

export default function ScoreRadar({scores}:{scores:any}){

  const data = [
    {subject:"Authority",value:scores.authority},
    {subject:"AIO",value:scores.aio},
    {subject:"GEO",value:scores.geo},
    {subject:"AEO",value:scores.aeo},
  ]

  return(

    <div style={{width:"100%",height:250}}>

      <ResponsiveContainer>

        <RadarChart data={data}>

          <PolarGrid stroke="#2a2a2a" />

          <PolarAngleAxis dataKey="subject" stroke="#aaa" />

          <Radar
            dataKey="value"
            stroke="#eaff00"
            fill="#eaff00"
            fillOpacity={0.35}
          />

        </RadarChart>

      </ResponsiveContainer>

    </div>

  )
}