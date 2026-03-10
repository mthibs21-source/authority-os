"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts"

export default function AuthorityRadar({ scores }: any) {

  const data = [
    { metric: "Authority", value: scores.authority },
    { metric: "AIO", value: scores.aio },
    { metric: "GEO", value: scores.geo },
    { metric: "AEO", value: scores.aeo }
  ]

  return (

    <div className="w-full h-[300px]">

      <ResponsiveContainer>

        <RadarChart data={data}>

          <PolarGrid stroke="#1f2937" />

          <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />

          <PolarRadiusAxis />

          <Radar
            dataKey="value"
            stroke="#eaff00"
            fill="#eaff00"
            fillOpacity={0.5}
          />

        </RadarChart>

      </ResponsiveContainer>

    </div>
  )
}