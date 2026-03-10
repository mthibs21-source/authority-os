"use client"

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts"

export default function ScoreCircle({value}:{value:number}){

  const data=[{name:"score",value}]

  return(

    <div style={{width:120,height:120}}>

      <ResponsiveContainer>

        <RadialBarChart
          innerRadius="80%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >

          <RadialBar
            dataKey="value"
            cornerRadius={10}
            fill="#eaff00"
          />

        </RadialBarChart>

      </ResponsiveContainer>

    </div>

  )
}