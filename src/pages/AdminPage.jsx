import { useState, useEffect } from 'react';
import { Shield, Loader2, Send, ClipboardList, Search, Plus, Trash2, Tag, ChevronDown, ChevronUp, Download, X, Lock } from 'lucide-react';
import ProgressStepper from '../components/ProgressStepper';
import { STATUS_STEPS, updatePostStatus, getCategoryPalette, getCategoryIcon,
         addCategory, removeCategory, saveCategories,
         getAdminSettings, saveAdminSettings } from '../store';
import { hashSHA256 } from '../utils/cipher';

const STATUS_META = {
  received:    { label: '접수됨', cls: 'bg-slate-100 text-slate-600' },
  reviewing:   { label: '검토중', cls: 'bg-amber-100 text-amber-700' },
  in_progress: { label: '실행중', cls: 'bg-blue-100 text-blue-700' },
  completed:   { label: '완료',   cls: 'bg-emerald-100 text-emerald-700' },
};

// ─── VOC 카드 (관리자용) ────────────────────────────────────────────
function AdminPostCard({ post, categories, onEdit, isEditing, editing, setEditing, onSave, saving }) {
  const meta = STATUS_META[post.status];
  const palette = getCategoryPalette(categories, post.category);
  const icon = getCategoryIcon(post.category);

  return (
    <div className={`bg-white rounded-xl border transition-all ${isEditing ? 'border-blue-300 shadow-md' : 'border-gray-200'}`}
      style={isEditing ? {} : { borderLeftWidth: '3px', borderLeftColor: palette.accent }}>
      <div className="px-4 pt-4 pb-0">
        <ProgressStepper status={isEditing ? editing.status : post.status} />
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border"
            style={{ backgroundColor: palette.light, color: palette.textColor, borderColor: palette.border }}>
            <span>{icon}</span>{post.category}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${meta.cls}`}>{meta.label}</span>
          <span className="ml-auto text-xs text-gray-400">공감 {post.upvotes}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>

        {isEditing ? (
          <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">진행 상태 변경</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {STATUS_STEPS.map(step => (
                  <button key={step.key}
                    onClick={() => setEditing(e => ({ ...e, status: step.key }))}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all
                      ${editing.status === step.key
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}>
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wide">공식 답변 (선택)</label>
              <textarea value={editing.reply}
                onChange={e => setEditing(prev => ({ ...prev, reply: e.target.value }))}
                placeholder="공식 답변을 입력하세요..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                취소
              </button>
              <button onClick={onSave} disabled={saving}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {saving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            {post.official_reply && (
              <p className="text-xs text-gray-400 italic truncate flex-1 mr-3">💬 {post.official_reply}</p>
            )}
            <button onClick={onEdit}
              className="ml-auto flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-xs font-semibold transition-colors">
              <ClipboardList size={12} /> 상태 관리
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 카테고리 관리 패널 ─────────────────────────────────────────────
function CategoryManager({ categories, setCategories }) {
  const [open, setOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // 삭제 확인 중인 카테고리 이름

  const handleAdd = () => {
    const name = newCat.trim();
    if (!name) return;
    if (categories.includes(name)) { setError('이미 존재하는 카테고리입니다.'); return; }
    if (name.length > 12) { setError('카테고리 이름은 12자 이하로 입력해주세요.'); return; }
    const updated = addCategory(name);
    setCategories(updated);
    setNewCat('');
    setError('');
  };

  const handleRemove = (name) => {
    const updated = removeCategory(name);
    setCategories(updated);
    setConfirmDelete(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-orange-600" />
          <span className="text-sm font-bold text-gray-700">카테고리 관리</span>
          <span className="text-xs text-gray-400">({categories.length}개)</span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3">
          {/* 현재 카테고리 목록 */}
          <div className="space-y-1.5">
            {categories.map(cat => {
              const palette = getCategoryPalette(categories, cat);
              const icon = getCategoryIcon(cat);
              const isConfirming = confirmDelete === cat;
              return (
                <div key={cat}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors
                    ${isConfirming ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: palette.accent }} />
                    <span className="text-sm font-semibold text-gray-800 flex flex-row items-center gap-1.5 whitespace-nowrap">
                      <span>{icon}</span>
                      <span>{cat}</span>
                    </span>
                  </div>
                  {isConfirming ? (
                    /* 삭제 확인 인라인 UI */
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-red-600 font-medium">삭제할까요?</span>
                      <button onClick={() => handleRemove(cat)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 transition-colors">
                        삭제
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] font-bold hover:bg-gray-300 transition-colors">
                        취소
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(cat)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 새 카테고리 추가 */}
          <div className="pt-2 border-t border-gray-100">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">새 카테고리 추가</label>
            <div className="flex gap-2">
              <input
                value={newCat}
                onChange={e => { setNewCat(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="카테고리 이름 (최대 12자)"
                maxLength={12}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={handleAdd}
                className="flex items-center gap-1 px-3 py-2 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors flex-shrink-0">
                <Plus size={13} /> 추가
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CSV 다운로드 로직 ────────────────────────────────────────────────
function downloadCSV(posts, selectedCats, allCategories) {
  const headers = ['ID', '작성자고유값', '카테고리', '상태', '공감수', '댓글수', '작성일(KST)', '내용', '공식답변'];
  const rows = posts.map(p => {
    const statusLabel = STATUS_META[p.status]?.label || p.status;
    const date = new Date(p.created_at).toLocaleString('ko-KR');
    // 쉼표나 줄바꿈이 있는 텍스트는 따옴표로 감싸기
    const escape = (text) => text ? `"${String(text).replace(/"/g, '""')}"` : '';
    const commentCount = p.comments?.length || 0;
    const authorHash = p.author_hash || '익명(수집전)'; // 이전 데이터 대비 fallback
    return [
      p.id,
      escape(authorHash),
      escape(p.category),
      escape(statusLabel),
      p.upvotes,
      commentCount,
      escape(date),
      escape(p.content),
      escape(p.official_reply)
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // UTF-8 BOM for Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // 파일명 동적 생성
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let fileNameCategory = '전체카테고리';
  if (selectedCats && selectedCats.length > 0 && selectedCats.length < allCategories.length) {
    if (selectedCats.length === 1) {
      fileNameCategory = selectedCats[0];
    } else {
      fileNameCategory = `${selectedCats[0]}등_${selectedCats.length}개`;
    }
  }

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Voice_Export_${dateStr}_${fileNameCategory}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── CSV 추출 모달 컴포넌트 ─────────────────────────────────────────────
function ExportModal({ categories, posts, onClose }) {
  // 기본적으로 '전체' 포함 모든 카테고리 선택 상태 유지
  const [selectedCats, setSelectedCats] = useState([...categories]);

  const toggleCategory = (cat) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const toggleAll = () => {
    if (selectedCats.length === categories.length) {
      setSelectedCats([]);
    } else {
      setSelectedCats([...categories]);
    }
  };

  const handleExport = () => {
    const filteredPosts = posts.filter(p => selectedCats.includes(p.category));
    downloadCSV(filteredPosts, selectedCats, categories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Download size={16} className="text-emerald-600" /> 데이터 추출 옵션
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-500 mb-3">추출할 포함 카테고리를 선택하세요.</p>
          <div className="space-y-2 mb-5 max-h-[30vh] overflow-y-auto px-1">
            <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 pb-3">
              <input type="checkbox"
                checked={selectedCats.length === categories.length}
                onChange={toggleAll}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span className="text-sm font-bold text-gray-800">전체 선택</span>
            </label>
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                <span className="text-sm text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={selectedCats.length === 0}
            className="w-full py-2.5 bg-emerald-600 disabled:bg-gray-300 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {selectedCats.length}개 카테고리 추출
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 관리자 환경설정 모달 ─────────────────────────────────────────────
function AdminSettingsModal({ onClose }) {
  const settings = getAdminSettings();
  const [pwd, setPwd] = useState(''); // 변경할 비밀번호
  const [email1, setEmail1] = useState(settings.adminEmail || '');
  const [email2, setEmail2] = useState(settings.adminBackupEmail || '');
  const [slack, setSlack] = useState(settings.slackWebhook || '');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = () => {
    const payload = {
      adminEmail: email1.trim(),
      adminBackupEmail: email2.trim(),
      slackWebhook: slack.trim()
    };
    if (pwd.trim()) {
      payload.adminPwdHash = hashSHA256(pwd.trim());
    }
    saveAdminSettings(payload);
    setSavedMsg('설정이 안전하게 저장되었습니다.');
    setTimeout(() => setSavedMsg(''), 3000);
    // 비밀번호까지 변경했다면, 다음 접속 시 바뀐 비밀번호를 요구함 (현재 세션은 유지)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Lock size={16} className="text-blue-600" /> 관리자 환경설정
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">비밀번호 변경 (선택)</label>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
              placeholder="새로운 비밀번호 입력 (변경 시에만)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-400 mt-1">입력 시 기존 암호를 덮어쓰고 새로운 해시로 즉시 교체됩니다.</p>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">수신용 메인 메일 (EmailJS 연동용)</label>
            <input type="email" value={email1} onChange={e => setEmail1(e.target.value)}
              placeholder="admin@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">수신용 백업 메일 (EmailJS 연동용)</label>
            <input type="email" value={email2} onChange={e => setEmail2(e.target.value)}
              placeholder="backup@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            <p className="text-[10px] text-gray-400 mt-1">메인 메일과 함께 동시에 알림이 발송됩니다.</p>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Slack Webhook URL</label>
            <input type="url" value={slack} onChange={e => setSlack(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>

          {savedMsg && <p className="text-xs text-blue-600 font-bold bg-blue-50 p-2 rounded-lg text-center">{savedMsg}</p>}
          
          <button onClick={handleSave}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors mt-2">
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 관리자 로그인 패널 ─────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin(id, password)) {
      setError('');
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Lock size={24} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-6">관리자 로그인</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">아이디</label>
            <input type="text" value={id} onChange={e => setId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Admin ID" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">비밀번호</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          <button type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-2">
            접속하기
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── 메인 AdminPage ─────────────────────────────────────────────────
export default function AdminPage({
  posts, setPosts,
  categories, setCategories,
  showExportModal, setShowExportModal,
  showSettingsModal, setShowSettingsModal
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('open_voice_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (inputId, inputPwd) => {
    const settings = getAdminSettings();
    const envId = import.meta.env.VITE_ADMIN_ID || 'admin';
    const activeHash = settings.adminPwdHash; // storage 우선 (없으면 fallback env hash 반환됨)
    
    if (inputId === envId && hashSHA256(inputPwd) === activeHash) {
      sessionStorage.setItem('open_voice_admin_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const filtered = posts
    .filter(p => p.content.includes(search) || p.category.includes(search))
    .sort((a, b) => {
      const aScore = a.upvotes + (a.comments?.length || 0);
      const bScore = b.upvotes + (b.comments?.length || 0);
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.created_at) - new Date(a.created_at); // 점수가 같으면 최신순
    });

  const openEdit = (post) => {
    setEditing({ postId: post.id, status: post.status, reply: post.official_reply || '' });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setPosts(updatePostStatus(editing.postId, editing.status, editing.reply || null));
      setEditing(null);
      setSaving(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10 mt-6">
      {showExportModal && (
        <ExportModal categories={categories} posts={posts} onClose={() => setShowExportModal(false)} />
      )}
      {showSettingsModal && (
        <AdminSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* 카테고리 관리 */}
      <CategoryManager categories={categories} setCategories={setCategories} />

      {/* VOC 검색 */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="내용 또는 카테고리로 검색..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <p className="text-xs text-gray-400 mb-3">{filtered.length}건</p>

      <div className="space-y-3">
        {filtered.map(post => (
          <AdminPostCard
            key={post.id}
            post={post}
            categories={categories}
            isEditing={editing?.postId === post.id}
            editing={editing}
            setEditing={setEditing}
            onEdit={() => openEdit(post)}
            onSave={handleSave}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
}
