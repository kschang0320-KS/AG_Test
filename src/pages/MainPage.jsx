import { useState } from 'react';
import { Plus, ArrowUpDown, Megaphone, Edit3, ArrowLeft, ChevronRight, TrendingUp } from 'lucide-react';
import PostCard from '../components/PostCard';
import NewPostModal from '../components/NewPostModal';
import { addPost, getCategoryPalette, getCategoryMeta, getCategoryIcon, toggleUpvote } from '../store';

const SORT_OPTIONS = [
  { key: 'upvotes', label: '공감순' },
  { key: 'latest', label: '최신순' },
];

// ─── 카테고리 카드 (2x2 그리드) ────────────────────────────────────
function CategoryCard({ name, posts, categories, onClick }) {
  const palette = getCategoryPalette(categories, name);
  const meta = getCategoryMeta(name);
  const icon = getCategoryIcon(name);
  const catPosts = posts.filter(p => p.category === name);
  const completed = catPosts.filter(p => p.status === 'completed').length;
  const inProgress = catPosts.filter(p => p.status === 'reviewing' || p.status === 'in_progress').length;

  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-4 text-left border hover:shadow-lg active:scale-[0.98] transition-all duration-150 group w-full"
      style={{ backgroundColor: palette.light, borderColor: palette.border }}
    >
      {/* 이모지 + 화살표 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <ChevronRight size={15} style={{ color: palette.accent }} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
      {/* 카테고리명 */}
      <p className="text-base font-extrabold mb-0.5" style={{ color: palette.accent }}>{name}</p>
      {/* 설명 */}
      <p className="text-[11px] leading-relaxed mb-3" style={{ color: palette.textColor, opacity: 0.7 }}>{meta.desc}</p>
      {/* 통계 */}
      <div className="flex items-center gap-2 pt-2.5 border-t" style={{ borderColor: palette.border }}>
        <span className="text-xs font-bold" style={{ color: palette.accent }}>{catPosts.length}건</span>
        {inProgress > 0 && <span className="text-[10px] text-amber-600 font-medium">· 처리중 {inProgress}</span>}
        {completed > 0 && <span className="text-[10px] text-emerald-600 font-medium">· 해결 {completed}</span>}
        {catPosts.length === 0 && <span className="text-[10px] opacity-40" style={{ color: palette.textColor }}>의견 없음</span>}
      </div>
    </button>
  );
}

// ─── 홈 화면: 카테고리 허브 (2x2 그리드) ─────────────────────────────
function CategoryHub({ posts, categories, onSelectCategory, onWrite }) {
  const total = posts.length;
  const received = posts.filter(p => p.status === 'received').length;
  const inProgress = posts.filter(p => p.status === 'reviewing' || p.status === 'in_progress').length;
  const completed = posts.filter(p => p.status === 'completed').length;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* 접수 현황 */}
      <div className="mb-3 mt-5 flex items-center gap-2">
        <div className="w-0.5 h-3.5 bg-blue-700 rounded-full" />
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">본부 전체 접수 현황</p>
      </div>

      <div className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-4 divide-x divide-gray-100 py-3">
          {[
            { label: '전체', status: null, value: total, color: '#2563EB' },
            { label: '접수됨', status: 'received', value: received, color: '#94A3B8' },
            { label: '처리 중', status: 'in_progress', value: inProgress, color: '#D97706' },
            { label: '해결 완료', status: 'completed', value: completed, color: '#059669' },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => onSelectCategory(null, s.status)}
              className="text-center px-1 hover:bg-gray-50 transition-colors rounded-lg py-1"
            >
              <p className="text-xl sm:text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 2x2 그리드 */}
      <div className="mb-3 flex items-center gap-2">
        <div className="w-0.5 h-3.5 bg-blue-700 rounded-full" />
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">카테고리 선택</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {categories.map(cat => (
          <CategoryCard
            key={cat}
            name={cat}
            posts={posts}
            categories={categories}
            onClick={() => onSelectCategory(cat)}
          />
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onWrite}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-blue-700 hover:bg-blue-800
          active:scale-[0.99] text-white rounded-xl transition-all duration-150"
      >
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <Edit3 size={16} />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-bold">익명 의견 작성하기</p>
          <p className="text-xs text-blue-200 mt-0.5">개인정보 없이 안전하게 전달됩니다</p>
        </div>
        <Plus size={18} className="opacity-60" />
      </button>
      <p className="text-center text-[10px] text-gray-400 mt-4">
        모든 의견은 완전 익명으로 처리됩니다
      </p>
    </div>
  );
}

// ─── 카테고리 상세 뷰 ─────────────────────────────────────────────────
function CategoryView({ category, initialFilter, posts, categories, onBack, onUpvote, onComment, onWrite }) {
  const [sort, setSort] = useState('latest');
  const [filter, setFilter] = useState(initialFilter || null); // null, 'received', 'in_progress', 'completed'
  const palette = category ? getCategoryPalette(categories, category) : { accent: '#2563eb', light: '#eff6ff', border: '#bfdbfe', textColor: '#1e3a8a' };
  const icon = category ? getCategoryIcon(category) : <Megaphone size={18} />;

  const basePosts = category ? posts.filter(p => p.category === category) : posts;
  const filteredPosts = filter
    ? basePosts.filter(p => filter === 'in_progress' ? p.status === 'reviewing' || p.status === 'in_progress' : p.status === filter)
    : basePosts;

  const catPosts = filteredPosts.sort((a, b) => sort === 'upvotes' ? b.upvotes - a.upvotes : new Date(b.created_at) - new Date(a.created_at));

  const stats = {
    total: basePosts.length,
    received: basePosts.filter(p => p.status === 'received').length,
    inProgress: basePosts.filter(p => p.status === 'reviewing' || p.status === 'in_progress').length,
    completed: basePosts.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* 카테고리 헤더 */}
      <div className="mt-5 mb-5 bg-white border border-gray-200 rounded-xl overflow-hidden"
        style={{ borderTopWidth: '3px', borderTopColor: palette.accent }}>

        {/* 상단: 뒤로가기 + 제목 */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500
              hover:text-blue-700 bg-gray-100 hover:bg-blue-50 border border-gray-200 hover:border-blue-200
              rounded-lg px-3 py-2 transition-all duration-150 flex-shrink-0"
          >
            <ArrowLeft size={13} />
            <span>목록으로</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <p className="text-base font-bold text-gray-900">{category}</p>
          </div>
        </div>

        {/* 미니 통계 (클릭 시 필터링) */}
        <div className="grid grid-cols-4 divide-x divide-gray-100 py-3 bg-gray-50/50">
          {[
            { label: '전체', status: null, value: stats.total, color: palette.accent },
            { label: '접수됨', status: 'received', value: stats.received, color: '#94A3B8' },
            { label: '처리 중', status: 'in_progress', value: stats.inProgress, color: '#D97706' },
            { label: '해결 완료', status: 'completed', value: stats.completed, color: '#059669' },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setFilter(s.status)}
              className={`text-center px-1 rounded-lg py-1 transition-colors
                ${filter === s.status ? 'bg-black/5 ring-1 ring-black/10' : 'hover:bg-gray-100'}`}
            >
              <p className="text-xl font-bold" style={{ color: s.color, opacity: filter && filter !== s.status ? 0.4 : 1 }}>{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5" style={{ opacity: filter && filter !== s.status ? 0.6 : 1 }}>{s.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 정렬 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500">
          의견 {catPosts.length}건
        </p>
        <div className="flex gap-1.5">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                ${sort === opt.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
            >
              <ArrowUpDown size={10} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시물 목록 */}
      {catPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Megaphone size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-400">아직 이 카테고리에 의견이 없습니다</p>
          <button
            onClick={onWrite}
            className="mt-4 text-xs font-semibold text-blue-700 hover:underline"
          >
            + 첫 번째 의견 작성하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {catPosts.map(post => (
            <PostCard key={post.id} post={post} onUpvote={onUpvote} onComment={onComment} categories={categories} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onWrite}
        className="fixed bottom-6 right-4 sm:right-8 flex items-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800
          text-white font-semibold rounded-xl shadow-lg text-xs transition-all active:scale-95"
      >
        <Plus size={15} />
        익명 의견 작성
      </button>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────
export default function MainPage({ posts, setPosts, categories, setCategories, onComment }) {
  const [viewState, setViewState] = useState({ category: null, filter: null }); // { category: string|null, filter: string|null }
  const [showModal, setShowModal] = useState(false);

  const handleNewPost = (data) => {
    setPosts(addPost(data));
    setShowModal(false);
  };

  const handleUpvote = (id) => {
    const { updatedPosts } = toggleUpvote(id);
    setPosts(updatedPosts);
  };

  const handleSelectCategory = (cat, filter = null) => {
    setViewState({ category: cat, filter });
  };

  return (
    <>
      {viewState.category !== null || viewState.filter !== null ? (
        <CategoryView
          category={viewState.category}
          initialFilter={viewState.filter}
          posts={posts}
          categories={categories}
          onBack={() => setViewState({ category: null, filter: null })}
          onUpvote={handleUpvote}
          onComment={onComment}
          onWrite={() => setShowModal(true)}
        />
      ) : (
        <CategoryHub
          posts={posts}
          categories={categories}
          onSelectCategory={handleSelectCategory}
          onWrite={() => setShowModal(true)}
        />
      )}

      {showModal && (
        <NewPostModal
          initialCategory={viewState.category || categories[0]}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSubmit={handleNewPost}
        />
      )}
    </>
  );
}
