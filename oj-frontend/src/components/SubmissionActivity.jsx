import React, { useMemo } from 'react';
import ActivityCalendar from 'react-activity-calendar';

const getLevel = (count) => {
  if (count < 1) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
};

const SubmissionActivity = ({ submissions }) => {
  const { data, totalSolved, currentStreak, longestStreak } = useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return {
        data: [],
        totalSolved: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const acceptedSubs = submissions.filter((s) => s.verdict === 'Accepted');

    const dailyCounts = acceptedSubs.reduce((acc, sub) => {
      const date = new Date(sub.createdAt).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const activityData = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
      level: getLevel(count),
    }));

    const solvedProblems = new Map();
    acceptedSubs.forEach((sub) => {
      const problemId = sub.problem?._id;
      if (!problemId) return;
      const submissionDate = new Date(sub.createdAt);
      if (!solvedProblems.has(problemId) || submissionDate < solvedProblems.get(problemId)) {
        solvedProblems.set(problemId, submissionDate);
      }
    });

    const totalSolved = solvedProblems.size;

    const uniqueSolveDates = [...new Set([...solvedProblems.values()].map((d) => d.toISOString().slice(0, 10)))].sort();

    let currentStreak = 0;
    let longestStreak = 0;

    if (uniqueSolveDates.length > 0) {
      longestStreak = 1;
      let activeStreak = 1;

      for (let i = 1; i < uniqueSolveDates.length; i++) {
        const currentDate = new Date(uniqueSolveDates[i]);
        const prevDate = new Date(uniqueSolveDates[i - 1]);
        const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          activeStreak++;
        } else {
          longestStreak = Math.max(longestStreak, activeStreak);
          activeStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, activeStreak);

      const lastSolveDate = new Date(uniqueSolveDates[uniqueSolveDates.length - 1]);
      const todayDate = new Date(new Date().toISOString().slice(0, 10));
      const diffFromToday = Math.round((todayDate - lastSolveDate) / (1000 * 60 * 60 * 24));
      if (diffFromToday <= 1) {
        currentStreak = activeStreak;
      }
    }

    return { data: activityData, totalSolved, currentStreak, longestStreak };
  }, [submissions]);

  const explicitTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  // Custom tooltip formatter
  const renderTooltip = (props) =>
    props.count ? `${props.count} ${props.count === 1 ? 'problem' : 'problems'} solved on ${props.date}` : '';

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-green-400/10 to-green-100/10 p-6 border border-green-300/20 shadow-inner">
          <p className="text-5xl font-bold text-green-400 drop-shadow">{totalSolved}</p>
          <p className="text-sm text-gray-300 mt-1">Problems Solved</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-400/10 to-orange-100/10 p-6 border border-orange-300/20 shadow-inner">
          <p className="text-5xl font-bold text-orange-400 drop-shadow">{currentStreak} days</p>
          <p className="text-sm text-gray-300 mt-1">Current Streak</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-400/10 to-blue-100/10 p-6 border border-blue-300/20 shadow-inner">
          <p className="text-5xl font-bold text-blue-400 drop-shadow">{longestStreak} days</p>
          <p className="text-sm text-gray-300 mt-1">Longest Streak</p>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="rounded-xl border border-white/10 bg-[#0f172a]/60 shadow-xl p-6">
        {data.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold text-white mb-4">Daily Problem Solving Activity</h3>
            <ActivityCalendar
              data={data}
              theme={explicitTheme}
              showWeekdayLabels
              renderBlock={(block, attributes) => (
                <rect {...attributes} rx={3} ry={3} />
              )}
              transformCells={(cells) =>
                cells.map((cell) => ({
                  ...cell,
                  title: renderTooltip(cell),
                }))
              }
              blockSize={14}
              blockMargin={4}
              labels={{
                totalCount: '{{count}} problem{{plural}} solved',
                legend: {
                  less: 'Less',
                  more: 'More',
                },
              }}
            />

            {/* Legend */}
            <div className="flex justify-center items-center gap-6 mt-4 text-xs text-gray-400">
              <span>No submissions</span>
              <div className="flex space-x-2">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div key={level} className="flex items-center">
                    <div
                      className="w-4 h-4 mx-1"
                      style={{ backgroundColor: explicitTheme.dark[level] }}
                      title={`Level ${level}`}
                    />
                    {level === 4 ? '6+' : level * 2}
                  </div>
                ))}
              </div>
              <span>Submissions per day</span>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-10 italic animate-pulse">
            No activity to display. Keep solving!
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionActivity;