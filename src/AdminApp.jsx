import { useState } from 'react';
import { Shield, MessageSquare, Lock, Download } from 'lucide-react';
import AdminPage from './pages/AdminPage';
import { loadPosts, loadCategories } from './store';
import './index.css';

export default function AdminApp() {
  const [posts, setPosts] = useState(() => loadPosts());
  const [categories, setCategories] = useState(() => loadCategories());
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
                <MessageSquare size={14} className="text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] text-gray-400 font-medium tracking-wide">Cyber보안사업본부</p>
                <p className="text-sm font-bold text-gray-900 -mt-0.5">신문고</p>
              </div>
            </div>
            
            <div className="flex flex-1 justify-end items-center">
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5">
                <Shield size={12} className="text-orange-600" />
                <span className="text-xs font-bold text-orange-700">관리자 모드</span>
              </div>
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
            </div>
          </div>
        </div>
      </header>

      {/* Admin Banner */}
      <div className="bg-orange-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-orange-300 mb-1.5 uppercase">Admin · Manage · Respond</p>
          <h1 className="text-xl font-bold">관리자 대시보드</h1>
          <p className="text-orange-200 text-xs mt-1 opacity-80">VOC 진행 상태를 업데이트하고 공식 답변을 작성하세요.</p>
        </div>
      </div>

      {/* Admin content */}
      <div className="max-w-2xl mx-auto">
        <div className="px-0 py-5">
          <AdminPage
            posts={posts}
            setPosts={setPosts}
            categories={categories}
            setCategories={setCategories}
            showExportModal={showExportModal}
            setShowExportModal={setShowExportModal}
            showSettingsModal={showSettingsModal}
            setShowSettingsModal={setShowSettingsModal}
            onBack={() => window.location.href = '/'}
          />
        </div>
      </div>
    </div>
  );
}
