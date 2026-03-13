import { CheckCircle2, TrendingUp, Clock, Award } from 'lucide-react';
import { getCategoryPalette, getCategoryIcon } from '../store';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function TransparencyPage({ posts, categories }) {
  const cats = categories || ['조직문화', '복지', '업무환경', '기타'];
  const completed = posts.filter(p => p.status === 'completed').sort((a, b) => b.upvotes - a.upvotes);
  const totalUpvotes = completed.reduce((s, p) => s + p.upvotes, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      {/* 성과 통계 */}
      <div className="mt-5 mb-5 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Award size={14} className="text-emerald-600" />
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">해결 성과 요약</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{completed.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">해결된 VOC</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalUpvotes}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">총 공감 수</p>
          </div>
        </div>
      </div>

      {completed.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">아직 해결된 VOC가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map(post => {
            const palette = getCategoryPalette(cats, post.category);
            const icon = getCategoryIcon(post.category);
            return (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                style={{ borderLeftWidth: '3px', borderLeftColor: palette.accent }}>
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">해결 완료</span>
                  <span className="ml-auto text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} />{timeAgo(post.created_at)}
                  </span>
                </div>
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md border"
                      style={{ backgroundColor: palette.light, color: palette.textColor, borderColor: palette.border }}>
                      {icon} {post.category}
                    </span>
                    <div className="flex items-center gap-1 ml-auto text-blue-600">
                      <TrendingUp size={11} />
                      <span className="text-xs font-semibold">{post.upvotes}명 공감</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>
                  {post.official_reply && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-bold text-blue-700 mb-1.5 uppercase tracking-wide">공식 답변</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{post.official_reply}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
