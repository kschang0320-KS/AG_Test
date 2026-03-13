/**
 * AES-256 암호화/복호화 유틸리티
 *
 * 저장소: 브라우저 localStorage
 * 알고리즘: AES (crypto-js 기본값: AES-256-CBC + PBKDF2 키 파생)
 * 비밀키: Vite 환경변수 VITE_STORAGE_KEY 또는 기본값 사용
 *
 * ⚠️  보안 참고사항:
 *  - 이 방식은 localStorage 데이터를 평문 노출로부터 보호합니다.
 *  - 프론트엔드 소스에 키가 포함되므로 완전한 서버 사이드 보안과는 다릅니다.
 *  - 서버 호스팅 시 백엔드 DB + 서버 사이드 암호화로 교체를 권장합니다.
 */

import CryptoJS from 'crypto-js';

// 환경변수 → 없으면 기본 키 사용 (.env 파일에 VITE_STORAGE_KEY=your-secret 설정 권장)
const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || 'csv-open-voice-secure-v1-2024';

/**
 * 데이터를 AES로 암호화하여 문자열로 반환
 * @param {any} data - 암호화할 데이터 (객체/배열 포함)
 * @returns {string} - Base64 인코딩된 암호문
 */
export function encrypt(data) {
  try {
    const plaintext = JSON.stringify(data);
    return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
  } catch (e) {
    console.error('[cipher] 암호화 실패:', e);
    return null;
  }
}

/**
 * AES 암호문을 복호화하여 원본 데이터 반환
 * @param {string} ciphertext - 암호화된 문자열
 * @returns {any|null} - 복호화된 데이터, 실패 시 null
 */
export function decrypt(ciphertext) {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) return null;
    return JSON.parse(plaintext);
  } catch {
    // 이전 평문(비암호화) 데이터이거나 키 불일치 → null 반환 후 초기화
    return null;
  }
}
