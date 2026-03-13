import { getAdminSettings } from '../store';
import emailjs from '@emailjs/browser';

/**
 * 이메일 알림 전송 (EmailJS 활용)
 */
async function sendEmailNotification(post, emailAddr) {
  if (!emailAddr) return;
  try {
    // EmailJS 테스트용 무료 설정 (실험/로컬용, 실제 운영 시 계정 발급 필요)
    // 환경변수 값이 없으면 임시 테스트 키로 Fallback
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_test_open_voice';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_open_voice';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_test';

    const templateParams = {
      to_email: emailAddr,
      category: post.category,
      content: post.content,
      date: new Date().toLocaleString()
    };

    // 테스트 키 방어 로직: 실제 키가 부여되지 않은 경우 콘솔로만 성공 시뮬레이션
    if (publicKey !== 'public_key_test') {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log(`[Notification] ✅ Email 발송 성공: ${emailAddr}`);
    } else {
      console.log(`[Notification/Mock] 📧 Email 발송 시뮬레이션 (키 미설정): ${emailAddr}\n`, templateParams);
    }
  } catch (err) {
    console.error(`[Notification] ❌ Email 발송 실패: ${emailAddr}`, err);
  }
}

/**
 * 슬랙 알림 전송
 */
async function sendSlackNotification(post, webhookUrl) {
  if (!webhookUrl) return;
  try {
    const payload = {
      text: `📢 *신규 익명 의견 접수*\n\n*🟢 카테고리*: ${post.category}\n*📝 내용*: ${post.content}\n\n👉 <http://localhost:5173/admin|관리자 대시보드에서 확인하기>`
    };

    // Slack 웹훅은 기본적으로 브라우저 CORS를 허용하지 않을 수 있으므로 no-cors 모드 전송 권장
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`[Notification] ✅ Slack 웹훅 전송 호출 완료 (no-cors 모드)`);
  } catch (err) {
    console.error('[Notification] ❌ Slack 전송 중 오류 발생:', err);
  }
}

/**
 * 새로운 VOC(의견) 등록 시 관리자(설정값 우선, 없으면 .env)에게 알림을 발송합니다.
 * @param {object} post - 작성된 게시물 객체 (카테고리, 내용 등 포함)
 */
export async function notifyAdminOnNewPost(post) {
  // 1. 관리자 런타임 환경설정 로드 (없으면 기본값 or 환경변수 fallbacks)
  const settings = getAdminSettings();
  
  const tasks = [];

  // 2. 이메일 (메인 / 백업 각각 발송)
  if (settings.adminEmail) {
    tasks.push(sendEmailNotification(post, settings.adminEmail));
  }
  if (settings.adminBackupEmail) {
    tasks.push(sendEmailNotification(post, settings.adminBackupEmail));
  }

  // 3. Slack Webhook 전송
  if (settings.slackWebhook) {
    tasks.push(sendSlackNotification(post, settings.slackWebhook));
  }

  // 병렬 실행 처리
  if (tasks.length > 0) {
    try {
      await Promise.allSettled(tasks);
    } catch (e) {
      console.error('Notification dispatch error', e);
    }
  } else {
    console.log('[Notification] ⚠️ 설정된 알림 수신처(Email, Slack)가 없습니다.');
  }
}
