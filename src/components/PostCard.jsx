import { useState } from 'react';
import { ThumbsUp, MessageSquare, Calendar, ChevronDown, ChevronUp, ShieldCheck, Send } from 'lucide-react';
import ProgressStepper from './ProgressStepper';
import { getCategoryPalette, getCategoryIcon, hasUpvoted } from '../store';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const isSameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isSameDay) return `오늘 ${timeStr}`;
  if (isYesterday) return `어제 ${timeStr}`;
  return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())} ${timeStr}`;
}

export default function PostCard({ post, onUpvote, onComment, categories }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [upvoted, setUpvoted] = useState(hasUpvoted(post.id));

  const cats = categories || ['조직문화', '복지', '업무환경', '기타'];
  const palette = getCategoryPalette(cats, post.category);
  const icon = getCategoryIcon(post.category);

  const handleUpvote = () => {
    setUpvoted(!upvoted); // 토글 방식으로 변경
    onUpvote(post.id);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
      style={{ borderLeftWidth: '3px', borderLeftColor: palette.accent }}>
      {/* Progress stepper */}
      <div className="px-4 pt-4 pb-0">
        <ProgressStepper status={post.status} />
      </div>

      <div className="px-4 pb-4 pt-2">
        {/* Category + date */}
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border"
            style={{ backgroundColor: palette.light, color: palette.textColor, borderColor: palette.border }}>
            <span className="text-[11px]">{icon}</span>
            {post.category}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-[10px]">
            <Calendar size={10} />
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{post.content}</p>

        {/* Official reply */}
        {post.official_reply && (
          <div className={`mt-3 rounded-lg p-3 border transition-colors ${expanded ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-700">공식 답변</span>
              </div>
              {expanded ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />}
            </button>
            {expanded && (
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">{post.official_reply}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
                ${upvoted 
                  ? 'bg-blue-600 border-blue-600 text-white opacity-90 hover:bg-blue-700 active:scale-95' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 active:scale-95'}`}
            >
              <ThumbsUp size={13} className={upvoted ? "fill-white" : ""} />
              {upvoted ? '공감 완료' : '공감'} {post.upvotes}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold
                ${showComments ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}
            >
              <MessageSquare size={13} />
              댓글 {(post.comments || []).length}
            </button>
          </div>
          {post.official_reply && !expanded && (
            <button onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-blue-600 transition-colors">
              <ShieldCheck size={11} />
              <span>답변 보기</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 댓글 섹션 ── */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
          <div className="space-y-2 mb-3">
            {(post.comments || []).length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-2">아직 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>
            ) : (
              (post.comments || []).map(comment => (
                <div key={comment.id} className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-700 text-left">
                  <p className="leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(comment.created_at)}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              rows={1}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && newComment.trim()) {
                  e.preventDefault();
                  onComment(post.id, newComment.trim());
                  setNewComment('');
                }
              }}
              placeholder="동료의 의견에 힘을 실어주세요 (익명)"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
            />
            <button
              disabled={!newComment.trim()}
              onClick={() => {
                onComment(post.id, newComment.trim());
                setNewComment('');
              }}
              className="w-8 h-8 flex items-center justify-center bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed
                text-white rounded-lg transition-colors flex-shrink-0"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
