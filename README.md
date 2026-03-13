# Cyber보안사업본부 신문고 (Open-Voice)

Cyber보안사업본부 부서원들의 의견을 익명으로 안전하게 수집하고 관리하기 위해 제작된 웹 애플리케이션 리포지토리입니다.

## 🚀 주요 기능

- **익명 의견 등록**: 사번이나 이름 입력 없이 온전히 익명으로 의견을 제안
- **작성자 고유 해시 식별**: 기기별 난수를 이용해 개인정보 수집 없이 반복적인 도배 시도 파악 방지
- **AI 문체 자동 변환**: 특정 개인의 말투를 숨기기 위해 AI가 문체를 표준어로 다듬어 익명성 강화 (현재 시뮬레이션 로직)
- **보안 데이터 저장**: 의견 내용은 브라우저 스토리지 내 AES-256 방식으로 안전하게 암호화 보관
- **공감 및 댓글**: 구성원의 게시물에 서로 익명으로 공감(Upvote)하거나 응원의 댓글 기록 가능 (UI 즉각 반영 및 중복 클릭 방지)
- **관리자 전용 대시보드 (Admin)**: 수집된 의견 상태 변경 및 공식 답변 등록 지원
- **데이터 백업 (CSV Export)**: 전체 또는 특정 카테고리만 지정해 파일명 동적 생성 및 작성자 고유값이 포함된 CSV 형식 추출
- **업무 메신저 연동 (Webhook)**: 신규 의견 등록 시 담당자 Slack 또는 Email로 즉시 알림 전송

## 🛠 기술 스택

- **Frontend**: React (Vite 환경) + Tailwind CSS
- **Icon**: Lucide React
- **Cryptography**: CryptoJS

## 📦 설치 및 실행 방법

1. **의존성 모듈 설치**
   ```bash
   npm install
   ```

2. **개발 모드 로컬 서버 실행**
   ```bash
   npm run dev
   ```
   - 서비스 접속: `http://localhost:5173`
   - 관리자 접속: `http://localhost:5173/admin`

3. **환경변수 설정**
   루트 디렉토리에 `.env` 파일을 생성하고 다음 값을 추가하세요 (`.env.example` 참고).
   ```env
   VITE_WEBHOOK_URL=https://hooks.slack.com/services/... (발급받은 웹훅 주소)
   ```

## 🔄 GitHub 연동 및 형상 관리 가이드

이 프로젝트는 현재 로컬 디렉토리에 `.git` 저장소로 기초 스냅샷(`Initial commit`)이 생성되어 있습니다.
원격 저장소(GitHub, GitLab 등)와 연동하여 버전 관리를 이어가려면 다음 단계를 수행하세요.

1. **원격 저장소(Remote Repository) 연결**
   GitHub에서 새 빈 Repository를 생성한 뒤, 아래 명령어로 연결합니다.
   ```bash
   git remote add origin https://github.com/[kschang0320-KS]/[KSChang].git
   ```

2. **현재 브랜치명 변경 및 첫 푸시**
   ```bash
   git branch -M main
   git push -u origin main
   ```

3. **이후 소스코드 업데이트 시 (Add, Commit, Push)**
   로컬에서 기능 추가나 버그 수정을 완료한 후, 변경된 파일을 커밋하고 원격지에 반영합니다.
   ```bash
   git add .
   git commit -m "feat: [수정된 내용 요약]"
   git push origin main
   ```

**⚠️ 주의사항**: 보안상 `.env` 파일은 절대 Git에 커밋되어선 안 됩니다. `.gitignore`에 이미 지정되어 있으나 원격지에 push하기 전 민감 정보 유무를 다시 한 번 점검하세요.

## ☁️ 클라우드 배포 아키텍처 (Next Step)

본 애플리케이션의 1차 개발은 마무리되었으나, 실제 운영망 또는 외부 클라우드(AWS, GCP 등)에 배포하여 여러 직원이 공동으로 사용할 경우 **프론트엔드와 독립된 데이터베이스 아키텍처 분리**가 필요합니다.

공인 IP 할당, DNS(도메인) 구성 및 Nginx를 활용한 배포 아키텍처 전략에 대한 자세한 가이드는 별도의 문서를 참고해주세요.
👉 [클라우드 배포 및 아키텍처 가이드 읽기](./cloud_deployment_guide.md)
