import { useState } from 'react';
import { MessageSquare, CheckCircle2, Lock, Download } from 'lucide-react';
import MainPage from './pages/MainPage';
import TransparencyPage from './pages/TransparencyPage';
import AdminPage from './pages/AdminPage';
import { loadPosts, savePosts, loadCategories, saveCategories, toggleUpvote, addComment } from './store';
import { Shield } from 'lucide-react';
import './index.css';

const BASE_TABS = [
  { key: 'main', label: 'VOC 피드', icon: MessageSquare },
  { key: 'transparency', label: '해결 성과', icon: CheckCircle2 },
];

// 한국어 명언 — 접속할 때마다 랜덤 표시
const QUOTES = [
  { text: "작은 목소리 하나하나가 모여 조직을 바꿉니다." },
  { text: "변화는 언제나 한 사람의 용기 있는 한마디에서 시작됩니다." },
  { text: "구성원의 솔직한 의견이 더 나은 내일을 만드는 힘입니다." },
  { text: "말하지 않으면 아무것도 바뀌지 않습니다. 지금 목소리를 내세요." },
  { text: "작은 불편함을 함께 해결할 때, 큰 조직이 더 강해집니다." },
  { text: "좋은 조직은 구성원의 이야기에 귀 기울이는 문화에서 만들어집니다." },
  { text: "익명의 용기가 모여 투명한 조직 문화를 완성합니다." },
];
const QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];


export default function App() {
  const [posts, setPosts] = useState(() => loadPosts());
  const [categories, setCategories] = useState(() => loadCategories());
  
  // URL 경로가 /admin 으로 시작하는지 확인하여 관리자 모드 노출 여부 결정
  const [isAdminRoute] = useState(() => window.location.pathname.startsWith('/admin'));
  const [activeTab, setActiveTab] = useState(() => isAdminRoute ? 'admin' : 'main');

  const TABS = isAdminRoute 
    ? [...BASE_TABS, { key: 'admin', label: '관리자 모드', icon: Shield }]
    : BASE_TABS;

  // 관리자 전용 제어 모달 상태 (AdminPage에 prop로 전달)
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleUpvote = (id) => {
    const { updatedPosts } = toggleUpvote(id);
    setPosts(updatedPosts);
  };

  const handleComment = (id, content) => {
    setPosts(addComment(id, content));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── 헤더 ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button onClick={() => setActiveTab('main')} className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
                <MessageSquare size={14} className="text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] text-gray-400 font-medium tracking-wide">Cyber보안사업본부</p>
                <p className="text-sm font-bold text-gray-900 -mt-0.5">신문고</p>
              </div>
            </button>

            {/* Tabs & Admin Controls */}
            <div className="flex flex-1 justify-end">
              <nav className="flex items-center">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors
                        ${active ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Icon size={13} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* 관리자 탭 활성화 시 헤더 우측에 메뉴 표시 */}
              {activeTab === 'admin' && (
                <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 pl-2">
                  <button onClick={() => setShowSettingsModal(true)}
                    className="flex items-center justify-center p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-lg transition-colors"
                    title="환경 설정"
                  >
                    <Lock size={15} />
                  </button>
                  <button onClick={() => setShowExportModal(true)}
                    className="flex items-center justify-center p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                    title="CSV 다운로드"
                  >
                    <Download size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── 히어로 배너 ── */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-7 sm:py-9">
          {activeTab === 'main' ? (
            <>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-300 mb-2 uppercase">Anonymous · Transparent · Safe</p>
              <h1 className="text-xl sm:text-2xl font-bold mb-1.5 leading-snug">
                여러분의 목소리를 들려주세요
              </h1>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed opacity-70 mt-2 max-w-md italic">
                "{QUOTE.text}"
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-300 mb-2 uppercase">Results · Impact · Change</p>
              <h1 className="text-xl sm:text-2xl font-bold mb-1.5">함께 만들어온 변화</h1>
              <p className="text-blue-200 text-xs sm:text-sm opacity-75 mt-2">구성원의 목소리가 실제 변화를 이끌었습니다.</p>
            </>
          )}
        </div>
      </div>

      <main>
        {activeTab === 'main' && (
          <MainPage posts={posts} setPosts={setPosts} categories={categories} setCategories={setCategories} onUpvote={handleUpvote} onComment={handleComment} />
        )}
        {activeTab === 'transparency' && (
          <TransparencyPage posts={posts} categories={categories} />
        )}
        {activeTab === 'admin' && (
          <AdminPage 
            posts={posts} setPosts={setPosts} 
            categories={categories} setCategories={setCategories}
            showExportModal={showExportModal} setShowExportModal={setShowExportModal}
            showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal}
          />
        )}
      </main>
    </div>
  );
}
