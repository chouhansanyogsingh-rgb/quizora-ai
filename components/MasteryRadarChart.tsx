'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { SubSkillMastery } from '@/lib/types';

interface Props {
  subSkillMasteries: SubSkillMastery[];
}

export function MasteryRadarChart({ subSkillMasteries }: Props) {
  const data = subSkillMasteries.map(item => ({
    subject: item.subSkill.length > 20 ? item.subSkill.substring(0, 18) + '...' : item.subSkill,
    fullSubject: item.subSkill,
    mastery: item.score,
    threshold: 60,
  }));

  return (
    <div className="w-full h-72 sm:h-80 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            stroke="#334155"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                    <p className="font-semibold text-white">{item.fullSubject}</p>
                    <p className="text-indigo-400 font-bold mt-1">
                      Mastery: {item.mastery}%
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      {item.mastery < 60 ? '⚠️ Gap (<60%)' : item.mastery < 80 ? '⚡ Developing' : '✅ Mastered'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            name="Mastery %"
            dataKey="mastery"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
