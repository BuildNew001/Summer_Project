import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Clock, Code2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  Accepted: { icon: <CheckCircle2 />, color: 'text-green-400' },
  'Wrong Answer': { icon: <XCircle />, color: 'text-red-400' },
  'Time Limit Exceeded': { icon: <Clock />, color: 'text-yellow-400' },
  'Compilation Error': { icon: <AlertCircle />, color: 'text-orange-400' },
  Pending: { icon: <Clock className="animate-pulse" />, color: 'text-gray-400' },
};

const RecentSubmissions = ({ submissions }) => {
  const recent = submissions.slice(0, 7);

  if (!recent || recent.length === 0) {
    return null; 
  }

  return (
    <div>
      <ul className="divide-y divide-white/10">
        {recent.map((sub) => {
          const { icon, color } = statusConfig[sub.status] || { icon: <AlertCircle />, color: 'text-gray-400' };
          return (
            <li key={sub._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <Link to={`/problems/${sub.problem?._id}`} className="text-lg font-bold text-white hover:text-cyan-400 transition-colors">
                  {sub.problem?.title || 'Problem not found'}
                </Link>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-400">
                    <span className={`flex items-center gap-2 font-semibold ${color}`}>
                        {React.cloneElement(icon, { className: 'w-4 h-4' })}
                        {sub.status}
                    </span>
                    <span className="flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        {sub.language}
                    </span>
                </div>
              </div>
              <div className="text-sm text-gray-500 font-mono self-start sm:self-center shrink-0">
                {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentSubmissions;