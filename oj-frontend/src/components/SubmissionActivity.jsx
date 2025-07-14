import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Target, Flame, Trophy, CalendarX } from 'lucide-react';

const HEATMAP_COLORS = [
  '#2d333b', // 0 submissions
  '#0e4429', // 1 submission
  '#006d32', // 2 submissions
  '#26a641', // 3 submissions
  '#39d353', // 4+ submissions
];

const StatCard = ({ icon, label, value, color }) => {
  const styles = {
    green: {
      wrapper: 'hover:border-green-400/50',
      iconBg: 'bg-green-500/10',
    },
    orange: {
      wrapper: 'hover:border-orange-400/50',
      iconBg: 'bg-orange-500/10',
    },
    blue: {
      wrapper: 'hover:border-blue-400/50',
      iconBg: 'bg-blue-500/10',
    },
  }[color];

  return (
    <div className={`bg-[#1c1c2e] rounded-xl p-6 flex items-center gap-6 border border-white/5 shadow-lg transition-all hover:bg-[#24243e] ${styles.wrapper}`}>
      <div className={`${styles.iconBg} p-3 rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
};

const SubmissionActivity = ({ submissions }) => {
  const {
    data,
    totalSolved,
    currentStreak,
    longestStreak,
    totalAcceptedSubmissions,
  } = useMemo(() => {
    if (!Array.isArray(submissions) || submissions.length === 0) {
      return {
        data: [],
        totalSolved: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalAcceptedSubmissions: 0,
      };
    }
    const dailyCounts = submissions.reduce((acc, sub) => {
      if (!sub.createdAt) return acc;
      const date = new Date(sub.createdAt).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const acceptedSubs = submissions.filter((s) => s.status === 'Accepted');
    const activityData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

const solvedProblems = new Map();
acceptedSubs.forEach((sub) => {
  const problemId = sub.problem?._id;
  const submissionDate = new Date(sub.createdAt);
  if (!problemId || isNaN(submissionDate)) return;
  if (!solvedProblems.has(problemId) || submissionDate < solvedProblems.get(problemId)) {
    solvedProblems.set(problemId, submissionDate);
  }
});
const totalSolved = solvedProblems.size;
const submissionDates = submissions.map((sub) =>
  new Date(sub.createdAt).toISOString().slice(0, 10)
);
const uniqueSubmissionDates = [...new Set(submissionDates)].sort();

let currentStreak = 0;
let longestStreak = 0;

if (uniqueSubmissionDates.length > 0) {
  longestStreak = 1;
  let activeStreak = 1;

  for (let i = 1; i < uniqueSubmissionDates.length; i++) {
    const currentDate = new Date(uniqueSubmissionDates[i]);
    const prevDate = new Date(uniqueSubmissionDates[i - 1]);
    const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      activeStreak++;
    } else {
      longestStreak = Math.max(longestStreak, activeStreak);
      activeStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, activeStreak);

  const lastSolveDate = new Date(uniqueSubmissionDates[uniqueSubmissionDates.length - 1]);
  const todayDate = new Date(new Date().toISOString().slice(0, 10));
  const diffFromToday = Math.round((todayDate - lastSolveDate) / (1000 * 60 * 60 * 24));
  if (diffFromToday <= 1) {
    currentStreak = activeStreak;
  }
}


    return {
      data: activityData,
      totalSolved,
      currentStreak,
      longestStreak,
      totalAcceptedSubmissions: acceptedSubs.length,
    };
  }, [submissions]);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={<Target className="w-8 h-8 text-green-400" />} label="Problems Solved" value={totalSolved} color="green" />
        <StatCard icon={<Flame className="w-8 h-8 text-orange-400" />} label="Current Streak" value={`${currentStreak} days`} color="orange" />
        <StatCard icon={<Trophy className="w-8 h-8 text-blue-400" />} label="Longest Streak" value={`${longestStreak} days`} color="blue" />
      </div>

      {/* Calendar Heatmap */}
      <div>
        {data.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                Daily Problem Solving
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 self-start md:self-center">
                <span className="text-gray-500">Less</span>
                <div className="flex items-center gap-1">
                  {HEATMAP_COLORS.map((color) => (
                    <div key={color} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span className="text-gray-500">More</span>
              </div>
            </div>
            <div className="rounded-xl bg-[#13131f] p-4 sm:p-6 shadow-inner shadow-cyan-800/10 ring-1 ring-white/5 animate-fade-in-up overflow-x-auto">
              <CalendarHeatmap
                startDate={new Date(new Date().setMonth(new Date().getMonth() - 8))}
                endDate={new Date()}
                values={data}
                classForValue={(value) => {
                  if (!value || value.count === 0) {
                    return 'color-empty';
                  }
                  const count = Math.min(value.count, 4);
                  return `color-scale-${count}`;
                }}
                tooltipDataAttrs={(value) => {
                  if (!value || !value.date) return null;
                  return {
                    'data-tooltip-id': 'heatmap-tooltip',
                    'data-tooltip-content': `${value.count || 0} submission${value.count > 1 ? 's' : ''} on ${new Date(value.date).toLocaleDateString()}`,
                  };
                }}
              />
              <ReactTooltip
                id="heatmap-tooltip"
                place="top"
                effect="solid"
                className="!bg-[#1f2937] !text-white !text-xs !rounded-md !shadow-xl px-2 py-1"
              />
              <style>{`
                @keyframes fade-in-up {
                  0% { opacity: 0; transform: translateY(10px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                  animation: fade-in-up 0.6s ease-out;
                }
                .react-calendar-heatmap {
                  font-size: 10px;
                }

                .react-calendar-heatmap .color-empty { fill: ${HEATMAP_COLORS[0]}; }
                .react-calendar-heatmap .color-scale-1 { fill: ${HEATMAP_COLORS[1]}; }
                .react-calendar-heatmap .color-scale-2 { fill: ${HEATMAP_COLORS[2]}; }
                .react-calendar-heatmap .color-scale-3 { fill: ${HEATMAP_COLORS[3]}; }
                .react-calendar-heatmap .color-scale-4 { fill: ${HEATMAP_COLORS[4]}; }

                .react-calendar-heatmap .react-calendar-heatmap-month-label,
                .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
                  font-size: 10px;
                  fill: #94a3b8;
                  font-weight: 500;
                }

                .react-calendar-heatmap rect {
                  rx: 4;
                  ry: 4;
                  transition: fill 0.3s ease, stroke 0.3s ease;
                  shape-rendering: geometricPrecision;
                }

                .react-calendar-heatmap rect:hover {
                  stroke: #ffffff40;
                  stroke-width: 1.2px;
                  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.08));
                  cursor: pointer;
                }
              `}</style>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarX className="w-16 h-16 text-gray-600/50 mb-4" />
            <h4 className="text-lg font-semibold text-gray-400">No Activity Yet</h4>
            <p className="text-sm text-gray-500 mt-1">Your submission activity will appear here once you solve some problems.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionActivity;
