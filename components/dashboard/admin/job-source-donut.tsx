"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { JobSourceSlice } from "@/types";

interface JobSourceDonutProps {
  data: JobSourceSlice[];
}

export function JobSourceDonut({ data }: JobSourceDonutProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={3}
            strokeWidth={2}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(15,23,42,.08)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="grid w-full grid-cols-2 gap-2">
        {data.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="truncate">{slice.name}</span>
            <span className="ml-auto font-semibold text-slate-900">{slice.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
