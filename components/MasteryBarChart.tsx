'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { SubSkillMastery } from '@/lib/types';

interface Props {
  subSkillMasteries: SubSkillMastery[];
}

export function MasteryBarChart({ subSkillMasteries }: Props) {
  const data = subSkillMasteries.map(item => ({
    name: item.subSkill.length > 22 ? item.subSkill.substring(0, 20) + '...' : item.subSkill,
    fullName: item.subSkill,
    score: item.score,
    status: item.status,
  }));

  const getBarColor = (score: number) => {
    if (score < 60) return '#ef4444'; // Red gap
    if (score < 80) return '#f59e0b'; // Amber developing
    return '#10b981'; // Emerald mastered
  };

  return (
    <div className="w-full h-72 sm:h-80 flex flex-col justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            width={120}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                    <p className="font-semibold text-white">{item.fullName}</p>
                    <p className="mt-1 font-bold" style={{ color: getBarColor(item.score) }}>
                      Score: {item.score}% ({item.status.toUpperCase()})
                    </p>
                    <p className="text-slate-400 text-[10px]">Threshold target is 60%+</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            x={60}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            label={{ value: '60% Gap Line', fill: '#f43f5e', fontSize: 10, position: 'top' }}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
