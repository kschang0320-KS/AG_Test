import { useState } from 'react';
import { X, Lock, Wand2, ArrowLeft, Send, ShieldCheck, Eye } from 'lucide-react';
import { getCategoryPalette, getCategoryIcon } from '../store';
import { anonymizeText } from '../utils/anonymize';
import { notifyAdminOnNewPost } from '../utils/notification';

// ─── 익명 신뢰 배지 ──────────────────────────────────────────────────
function AnonymousBadge() {
  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
      <ShieldCheck size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-blue-800">완전 익명 보장</p>
        <p className="text-[10px] text-blue-600 mt-0.5 leading-relaxed">
          IP · MAC · 쿠키 등 어떠한 식별 정보도 수집하지 않습니다.<br />
          관리자를 포함한 누구도 작성자를 확인할 수 없습니다.
        </p>
      </div>
    </div>
  );
}

// ─── STEP 1: 작성 화면 ───────────────────────────────────────────────
function WriteStep({ cats, category, setCategory, content, setContent, onNext, onClose }) {
  const isValid = content.trim().length >= 10;

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">새 의견 작성</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">작성 후 AI가 자동으로 익명화합니다</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <X size={15} className="text-gray-500" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
        <AnonymousBadge />

        {/* 카테고리 */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 mb-2 block tracking-widest uppercase">카테고리</label>
          <div className="grid grid-cols-2 gap-2">
            {cats.map(cat => {
              const palette = getCategoryPalette(cats, cat);
              const icon = getCategoryIcon(cat);
              const selected = category === cat;
              return (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all
                    ${selected ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                  style={selected ? { backgroundColor: palette.accent } : {}}>
                  <span className="text-base leading-none">{icon}</span>
                  <span className="text-xs font-semibold">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 mb-2 block tracking-widest uppercase">내용</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`평소 말투 그대로 편하게 작성하세요.\n\n제출 버튼을 누르면 AI가 자동으로 중립적인 문체로 바꿔서 누가 작성했는지 알기 어렵게 만들어드립니다.`}
            rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              resize-none transition leading-relaxed"
          />
          <p className={`text-[10px] mt-1 text-right ${content.trim().length > 0 && content.trim().length < 10 ? 'text-red-400' : 'text-gray-400'}`}>
            {content.length}자
          </p>
        </div>

        {/* AI 변환 안내 */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <Wand2 size={13} className="text-amber-600 flex-shrink-0" />
          <p className="text-[11px] text-amber-700">
            <span className="font-bold">제출 시 자동 변환</span> — 말투·어휘를 표준 문어체로 정제해 작성자 특정을 방지합니다
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <button onClick={onNext} disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-700 hover:bg-blue-800
            disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-colors text-sm">
          <Wand2 size={14} />
          {isValid ? 'AI 익명화 미리보기' : `최소 10자 이상 입력해주세요 (현재 ${content.trim().length}자)`}
        </button>
      </div>
    </>
  );
}

// ─── STEP 2: AI 변환 미리보기 ────────────────────────────────────────
function PreviewStep({ original, transformed, category, onBack, onSubmit, submitting }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-700 font-semibold transition-colors">
          <ArrowLeft size={13} /> 다시 작성
        </button>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
          <Wand2 size={12} className="text-emerald-600" />
          <span className="text-[11px] font-bold text-emerald-700">AI 익명화 완료</span>
        </div>
        <div className="w-16" /> {/* balance */}
      </div>

      <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[65vh]">
        {/* 변환 결과 */}
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
              <Eye size={12} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">원본 (저장되지 않음)</span>
            </div>
            <p className="px-4 py-3 text-xs text-gray-400 leading-relaxed line-through decoration-gray-300">{original}</p>
          </div>

          <div className="rounded-xl border-2 border-blue-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200">
              <Wand2 size={12} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">AI 익명화 버전 (실제 저장)</span>
            </div>
            <p className="px-4 py-3 text-sm text-gray-700 leading-relaxed font-medium">{transformed}</p>
          </div>
        </div>

        {/* 익명 보장 체크리스트 */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">익명 보장 체크리스트</p>
          {[
            'IP · MAC · 쿠키 등 식별 정보 수집 없음',
            '1인칭 표현 · 개인 어투 자동 제거',
            '표준 문어체로 문장 구조 통일',
            '관리자 포함 누구도 작성자 확인 불가',
          ].map(item => (
            <div key={item} className="flex items-center gap-2">
              <ShieldCheck size={11} className="text-emerald-500 flex-shrink-0" />
              <span className="text-[11px] text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <button onClick={onSubmit} disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-700 hover:bg-blue-800
            disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm">
          <Send size={14} />
          {submitting ? '제출 중...' : '익명으로 제출하기'}
        </button>
      </div>
    </>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────
export default function NewPostModal({ onClose, onSubmit, initialCategory, categories }) {
  const cats = categories || ['조직문화', '복지', '업무환경', '기타'];
  const [step, setStep] = useState('write'); // 'write' | 'preview'
  const [category, setCategory] = useState(initialCategory || cats[0]);
  const [content, setContent] = useState('');
  const [transformed, setTransformed] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    const result = anonymizeText(content.trim());
    setTransformed(result);
    setStep('preview');
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const postData = { category, content: transformed };
      onSubmit(postData);
      notifyAdminOnNewPost(postData);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col">
        {/* 모바일 드래그 핸들 */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {step === 'write' ? (
          <WriteStep
            cats={cats} category={category} setCategory={setCategory}
            content={content} setContent={setContent}
            onNext={handleNext} onClose={onClose}
          />
        ) : (
          <PreviewStep
            original={content.trim()}
            transformed={transformed}
            category={category}
            onBack={() => setStep('write')}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
