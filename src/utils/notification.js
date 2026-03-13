/**
 * 새 의견 등록 시 관리자 알림 발송 (Slack / Email 연동용)
 * 
 * ⚠️ 브라우저(프론트엔드)에서 직접 Slack 웹훅을 호출할 경우 CORS 정책으로 차단될 수 있습니다.
 *    현재는 프로토타입용으로 구현되었으며, 실제 운영 환경에서는
 *    프론트엔드 -> 자체 백엔드 API -> Slack Webhook 순으로 구조를 변경해야 합니다.
 */

export async function notifyAdminOnNewPost(post) {
  const webhookUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('[Notification] 🔔 새 의견 등록됨 (Slack 웹훅 미설정 상태)');
    console.log(`- 카테고리: ${post.category}\n- 내용: ${post.content}`);
    return;
  }

  try {
    const payload = {
      text: `📢 *신규 익명 의견 접수*\n\n*🟢 카테고리*: ${post.category}\n*📝 내용*: ${post.content}\n\n👉 <http://localhost:5173/admin|관리자 대시보드에서 확인하기>`
    };

    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', // 프론트엔드 호출 임시 허용용 (CORS Error 우회)
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('[Notification] ✅ 슬랙 알림 전송 요청 완료 (no-cors)');
  } catch (error) {
    console.error('[Notification] ❌ 웹훅 전송 실패:', error);
  }
}
