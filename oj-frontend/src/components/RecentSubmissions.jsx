import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Clock, Code2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
const statusConfig = {
 Accepted: { icon: <CheckCircle2 />, color: 'text-green-400' },
 'Wrong Answer': { icon: <XCircle />, color: 'text-red-500' },
 'Time Limit Exceeded': { icon: <Clock />, color: 'text-yellow-400' },
 'Compilation Error': { icon: <AlertCircle />, color: 'text-orange-400' },
 Pending: { icon: <Clock className="animate-pulse" />, color: 'text-gray-400' },
};

const RecentSubmissions = ({ submissions }) => {
 const recent = submissions.filter(sub => sub.problem).slice(0, 7);

 if (!recent || recent.length === 0) {
 return null;
 }

 return (
 <div>
 <ul className="divide-y divide-white/10">
 {recent.map(sub => {
 let statusInfo;
 if (sub.status?.startsWith('Wrong Answer')) {
 statusInfo = statusConfig['Wrong Answer'];
 } else {
 statusInfo = statusConfig[sub.status] || {
 icon: <AlertCircle />,
 color: 'text-gray-400'
 };
 }
 const { icon, color } = statusInfo;
 return (
 <li
 key={sub._id}
 className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center"
 >
 <div className="flex-1">
 <Link
 to={`/problems/${sub.problem._id}`}
 className="text-lg font-bold text-white transition-colors hover:text-cyan-400"
 >
 {sub.problem.title}
 </Link>
 <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
 <span
 className={`flex items-center gap-2 font-semibold ${color}`}
 >
 {React.cloneElement(icon, { className: 'h-4 w-4' })}
 {sub.status}
 </span>
 <span className="flex items-center gap-2">
 <Code2 className="h-4 w-4" />
 {sub.language}
 </span>
 </div>
 </div>
 <div className="shrink-0 self-start font-mono text-sm text-gray-500 sm:self-center">
 {formatDistanceToNow(new Date(sub.createdAt), {
 addSuffix: true,
 })}
 </div>
 </li>
 );
 })}
 </ul>
 </div>
 );
};

export default RecentSubmissions;