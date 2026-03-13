// Mock data store with localStorage persistence
import { encrypt, decrypt } from './utils/cipher';

const STORAGE_KEY = 'open_voice_posts';
const CATEGORIES_KEY = 'open_voice_categories';
const UPVOTED_KEY = 'open_voice_upvoted'; // 공감 중복 방지 (평문 저장, 민감정보 없음)
const CLIENT_ID_KEY = 'open_voice_client_id'; // 기기별 공통되는 난수 ID

const DEFAULT_CATEGORIES = ['조직문화', '복지', '업무환경', '기타'];

const initialPosts = [
  {
    id: 1,
    category: '조직문화',
    content: '팀 간 협업을 위한 정기적인 교류 미팅이 있었으면 합니다. 현재 부서 간 소통이 너무 단절되어 있어 효율적인 업무 처리가 어렵습니다.',
    status: 'completed',
    upvotes: 48,
    official_reply: '안녕하세요. 좋은 의견 감사합니다. 매월 셋째 주 금요일에 "부서 교류의 날"을 운영하기로 결정했습니다. 3월부터 시작됩니다!',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 2,
    category: '복지',
    content: '재택근무 장비 지원 제도를 개선해 주세요. 외부 모니터나 키보드 등 필수 장비에 대한 지원이 필요합니다.',
    status: 'in_progress',
    upvotes: 72,
    official_reply: '현재 협력 업체와 계약을 협의 중에 있습니다. 4월 중으로 장비 대여 프로그램을 시작할 예정입니다.',
    created_at: '2024-02-01T10:30:00Z',
  },
  {
    id: 3,
    category: '업무환경',
    content: '사무실 내 집중 업무 공간(Focus Zone)을 만들어 주세요. 전화 통화나 회의가 많아 집중하기 어렵습니다.',
    status: 'reviewing',
    upvotes: 61,
    official_reply: null,
    created_at: '2024-02-10T14:00:00Z',
  },
  {
    id: 4,
    category: '복지',
    content: '점심시간을 1시간 30분으로 늘려주시면 감사하겠습니다. 현재 1시간은 식사 후 휴식을 취하기에 턱없이 부족합니다.',
    status: 'received',
    upvotes: 35,
    official_reply: null,
    created_at: '2024-02-20T11:00:00Z',
  },
  {
    id: 5,
    category: '기타',
    content: '사내 도서관 또는 도서 구매 지원 제도를 도입해 주세요. 업무 관련 서적이나 자기 개발 도서 구매 비용을 지원해 주시면 좋겠습니다.',
    status: 'received',
    upvotes: 22,
    official_reply: null,
    created_at: '2024-02-25T15:30:00Z',
  },
];

// ─── Posts ────────────────────────────────────────────────────────────
export function loadPosts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // 1) 복호화 시도 (암호화된 데이터)
      const decrypted = decrypt(stored);
      if (decrypted) return decrypted;
      // 2) 평문 JSON fallback (이전 데이터 마이그레이션)
      const legacy = JSON.parse(stored);
      if (Array.isArray(legacy)) {
        savePosts(legacy); // 즉시 암호화해서 재저장
        return legacy;
      }
    }
  } catch { /* ignore */ }
  savePosts(initialPosts);
  return initialPosts;
}

export function savePosts(posts) {
  const cipher = encrypt(posts);
  if (cipher) localStorage.setItem(STORAGE_KEY, cipher);
}

// ─── 고유 클라이언트 식별자 (작성자 해시) ──────────────────────────────
function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      // 아주 강력한 암호화는 아니더라도 동일 기기를 식별할 수 있는 수준의 난수 생성
      id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return 'unknown_user';
  }
}

export function addPost(post) {
  const posts = loadPosts();
  const authorHash = getClientId(); // 작성자 고유 해시 추출

  const newPost = {
    id: Date.now(),
    status: 'received',
    upvotes: 0,
    official_reply: null,
    comments: [],
    author_hash: authorHash, // 추가됨
    created_at: new Date().toISOString(),
    ...post,
  };
  const updated = [newPost, ...posts];
  savePosts(updated);
  return updated;
}

// ─── 공감 중복 방지 ───────────────────────────────────────────────────
function loadUpvoted() {
  try { return JSON.parse(localStorage.getItem(UPVOTED_KEY) || '[]'); } catch { return []; }
}
function saveUpvoted(ids) {
  localStorage.setItem(UPVOTED_KEY, JSON.stringify(ids));
}
export function hasUpvoted(id) {
  return loadUpvoted().includes(id);
}

export function toggleUpvote(id) {
  const posts = loadPosts();
  let upvotedList = loadUpvoted();
  let isNowUpvoted = false;

  const updated = posts.map(p => {
    if (p.id === id) {
      if (upvotedList.includes(id)) {
        // 이미 공감한 경우 -> 취소
        upvotedList = upvotedList.filter(vId => vId !== id);
        return { ...p, upvotes: p.upvotes - 1 };
      } else {
        // 공감하지 않은 경우 -> 추가
        upvotedList.push(id);
        isNowUpvoted = true;
        return { ...p, upvotes: p.upvotes + 1 };
      }
    }
    return p;
  });

  savePosts(updated);
  saveUpvoted(upvotedList);
  return { updatedPosts: updated, isNowUpvoted };
}

export function updatePostStatus(id, status, official_reply) {
  const posts = loadPosts();
  const updated = posts.map(p =>
    p.id === id ? { ...p, status, official_reply: official_reply ?? p.official_reply } : p
  );
  savePosts(updated);
  return updated;
}

// ─── 댓글 ────────────────────────────────────────────────────────────
export function addComment(postId, content) {
  const posts = loadPosts();
  const comment = {
    id: Date.now(),
    content,
    created_at: new Date().toISOString(),
  };
  const updated = posts.map(p =>
    p.id === postId
      ? { ...p, comments: [...(p.comments || []), comment] }
      : p
  );
  savePosts(updated);
  return updated;
}

// ─── Categories (동적 관리) ────────────────────────────────────────────
export function loadCategories() {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      const decrypted = decrypt(stored);
      if (decrypted) return decrypted;
      // 이전 평문 데이터 마이그레이션
      const legacy = JSON.parse(stored);
      if (Array.isArray(legacy)) {
        saveCategories(legacy);
        return legacy;
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories) {
  const cipher = encrypt(categories);
  if (cipher) localStorage.setItem(CATEGORIES_KEY, cipher);
}

export function addCategory(name) {
  const cats = loadCategories();
  if (cats.includes(name.trim())) return cats;
  const updated = [...cats, name.trim()];
  saveCategories(updated);
  return updated;
}

export function removeCategory(name) {
  const cats = loadCategories();
  const updated = cats.filter(c => c !== name);
  saveCategories(updated);
  return updated;
}

// ─── Constants ────────────────────────────────────────────────────────
export const STATUS_STEPS = [
  { key: 'received', label: '접수됨' },
  { key: 'reviewing', label: '검토중' },
  { key: 'in_progress', label: '실행중' },
  { key: 'completed', label: '완료' },
];

// 카테고리별 색상 팔레트 (고정 순환)
const PALETTE = [
  { accent: '#4F46E5', light: '#EEF2FF', border: '#C7D2FE', text: '#4338CA', dot: 'bg-indigo-500' },  // indigo
  { accent: '#0891B2', light: '#ECFEFF', border: '#A5F3FC', text: '#0E7490', dot: 'bg-cyan-500' },     // cyan
  { accent: '#059669', light: '#ECFDF5', border: '#A7F3D0', text: '#047857', dot: 'bg-emerald-500' },  // emerald
  { accent: '#D97706', light: '#FFFBEB', border: '#FDE68A', text: '#B45309', dot: 'bg-amber-500' },    // amber
  { accent: '#DC2626', light: '#FEF2F2', border: '#FECACA', text: '#B91C1C', dot: 'bg-red-500' },      // red
  { accent: '#7C3AED', light: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', dot: 'bg-violet-500' },   // violet
  { accent: '#DB2777', light: '#FDF2F8', border: '#F9A8D4', text: '#BE185D', dot: 'bg-pink-500' },     // pink
  { accent: '#475569', light: '#F8FAFC', border: '#CBD5E1', text: '#334155', dot: 'bg-slate-500' },    // slate
];

export const CATEGORY_ICONS = {
  '조직문화': '🤝', '복지': '🌿', '업무환경': '🖥️', '기타': '💡',
};

// 키워드 → 이모지 자동 매핑 테이블
const ICON_KEYWORDS = [
  { keywords: ['보안', '사이버', '정보보호', '해킹', '취약', 'security'], emoji: '🔒' },
  { keywords: ['교육', '훈련', '학습', '연수', '스터디', '강의'], emoji: '📚' },
  { keywords: ['급여', '임금', '연봉', '월급', '수당', '인센티브', '보수'], emoji: '💰' },
  { keywords: ['회식', '식사', '점심', '저녁', '간식', '음식'], emoji: '🍽️' },
  { keywords: ['휴가', '연차', '휴일', '휴식', '쉬는'], emoji: '🏖️' },
  { keywords: ['회의', '미팅', '소통', '커뮤니케이션', '협업', '협력'], emoji: '💬' },
  { keywords: ['조직', '문화', '분위기', '팀워크', '관계', '사내'], emoji: '🤝' },
  { keywords: ['복지', '혜택', '지원', '지급', '제공'], emoji: '🌿' },
  { keywords: ['환경', '사무실', '공간', '시설', '장비', '기자재', '도구'], emoji: '🏢' },
  { keywords: ['성과', '평가', '인사', '승진', '인정', '피드백'], emoji: '📊' },
  { keywords: ['건강', '의료', '검진', '헬스', '운동', '심리'], emoji: '💊' },
  { keywords: ['출퇴근', '재택', '원격', '유연', '근무', '시간'], emoji: '🕐' },
  { keywords: ['장비', '노트북', '컴퓨터', 'PC', '모니터', '키보드'], emoji: '💻' },
  { keywords: ['복장', '옷', '드레스코드', '유니폼', '복장'], emoji: '👔' },
  { keywords: ['아이디어', '제안', '개선', '혁신', '프로세스'], emoji: '💡' },
  { keywords: ['안전', '위험', '사고', '재해'], emoji: '⚠️' },
  { keywords: ['채용', '인원', '인력', '팀', '부서'], emoji: '👥' },
  { keywords: ['소통', '공지', '알림', '정보', '투명'], emoji: '📢' },
  { keywords: ['기타', '기타', '일반', '기타'], emoji: '📌' },
];

export function getCategoryIcon(name) {
  if (CATEGORY_ICONS[name]) return CATEGORY_ICONS[name];
  // 키워드 자동 매핑
  const lower = name.toLowerCase();
  for (const { keywords, emoji } of ICON_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) return emoji;
  }
  return '📌';
}

export function getCategoryPalette(categories, name) {
  const idx = categories.indexOf(name);
  // 삭제된 카테고리거나 목록에 없는 경우 마지막 팔레트(slate)로 안전하게 처리
  if (idx === -1) return PALETTE[PALETTE.length - 1];
  return PALETTE[idx % PALETTE.length];
}


export const CATEGORIES = DEFAULT_CATEGORIES;
export const CATEGORY_COLORS = {
  '조직문화': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  '복지': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  '업무환경': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '기타': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export function getCategoryColorClass(categories, name) {
  const idx = categories.indexOf(name);
  const p = PALETTE[idx % PALETTE.length];
  return { accent: p.accent, light: p.light, border: p.border, textColor: p.text };
}

export const CATEGORY_META = {
  '조직문화': { desc: '소통, 협업, 조직 문화 개선 제안' },
  '복지': { desc: '복리후생, 근무 조건, 사내 지원' },
  '업무환경': { desc: '사무환경, 장비, 공간 개선 요청' },
  '기타': { desc: '그 외 다양한 제안 및 건의사항' },
};

// 키워드 → 자동 설명 테이블
const DESC_KEYWORDS = [
  { keywords: ['보안', '사이버', '정보보호', '해킹', 'security'], desc: '정보보안 및 사이버 위협 관련 건의' },
  { keywords: ['교육', '훈련', '학습', '연수', '스터디'], desc: '교육·학습·역량 개발 관련 제안' },
  { keywords: ['급여', '임금', '연봉', '월급', '수당', '인센티브'], desc: '급여·보상 체계 관련 건의' },
  { keywords: ['회식', '식사', '점심', '저녁', '음식', '간식'], desc: '식사·회식 문화 관련 제안' },
  { keywords: ['휴가', '연차', '휴일', '휴식'], desc: '휴가·휴일 제도 관련 건의' },
  { keywords: ['회의', '미팅', '소통', '협업', '협력'], desc: '회의·협업 문화 개선 제안' },
  { keywords: ['조직', '문화', '분위기', '팀워크'], desc: '조직문화·분위기 개선 제안' },
  { keywords: ['복지', '혜택', '지원'], desc: '복리후생·지원 제도 관련 건의' },
  { keywords: ['공간', '시설', '장비', '환경', '사무실'], desc: '업무공간·시설·장비 관련 요청' },
  { keywords: ['성과', '평가', '인사', '승진'], desc: '성과평가·인사 제도 관련 건의' },
  { keywords: ['건강', '의료', '검진', '헬스'], desc: '건강·의료 복지 관련 제안' },
  { keywords: ['재택', '원격', '유연', '근무'], desc: '근무 형태·시간 관련 건의' },
  { keywords: ['안전', '위험', '재해'], desc: '안전·보건 관련 건의사항' },
  { keywords: ['채용', '인력', '팀', '부서'], desc: '인력·조직 구성 관련 제안' },
];

export function getCategoryMeta(name) {
  if (CATEGORY_META[name]) return CATEGORY_META[name];
  // 키워드 기반 자동 설명 생성
  const lower = name.toLowerCase();
  for (const { keywords, desc } of DESC_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) return { desc };
  }
  return { desc: `${name} 관련 의견 및 건의사항` };
}
