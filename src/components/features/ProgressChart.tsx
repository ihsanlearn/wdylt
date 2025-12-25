"use client";

import React, { useMemo } from "react";
import { useLearningStore } from "@/lib/store";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, subWeeks } from "date-fns";

export function ProgressChart() {
  const entries = useLearningStore((state) => state.entries);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = useMemo(() => {
    // Only calculate if mounted to avoid hydration mismatch with dates
    if (!isMounted) return [];

    const end = new Date();
    const days = eachDayOfInterval({
      start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago + today
      end: end,
    });

    return days.map((day) => {
      const count = entries.filter((e) => isSameDay(new Date(e.date), day)).length;
      return {
        name: format(day, "EEE"), // Mon, Tue
        fullDate: format(day, "MMM dd"),
        count: count,
      };
    });
  }, [entries, isMounted]);

  if (!isMounted) {
     return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full animate-pulse bg-muted/20 rounded-md" />
            </CardContent>
        </Card>
     );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Learning Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar 
                dataKey="count" 
                fill="currentColor" 
                radius={[4, 4, 0, 0]} 
                className="fill-primary" 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
