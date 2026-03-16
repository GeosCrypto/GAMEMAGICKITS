'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  closesAt: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

export default function CountdownTimer({ closesAt }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(closesAt));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(closesAt)), 1000);
    return () => clearInterval(id);
  }, [closesAt]);

  if (time.expired) {
    return <span className="text-red-400 font-medium">Closed</span>;
  }

  const isUrgent = time.days === 0 && time.hours < 1;
  const color = isUrgent ? 'text-red-400' : 'text-green-400';

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`flex items-center gap-1 font-mono text-sm ${color}`}>
      {time.days > 0 && (
        <>
          <span className="bg-gray-800 px-2 py-0.5 rounded">{time.days}d</span>
          <span className="text-gray-600">:</span>
        </>
      )}
      <span className="bg-gray-800 px-2 py-0.5 rounded">{pad(time.hours)}h</span>
      <span className="text-gray-600">:</span>
      <span className="bg-gray-800 px-2 py-0.5 rounded">{pad(time.minutes)}m</span>
      <span className="text-gray-600">:</span>
      <span className="bg-gray-800 px-2 py-0.5 rounded">{pad(time.seconds)}s</span>
    </div>
  );
}
