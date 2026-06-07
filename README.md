# 네이버 호텔 예약 가능 여부 확인기

네이버 호텔(hotels.naver.com)에서 원하는 숙소의 예약 가능 여부와 최저가를 자동으로 확인합니다.
Claude 등 MCP 클라이언트에서 자연어로 호출할 수 있습니다.

---

## 기능

- 숙소명, 체크인/체크아웃 날짜, 인원 수 입력으로 예약 가능 여부 확인
- 예약 가능 시 최저가 표시
- 다양한 날짜 입력 형식 지원 (`0718`, `7월18일`, `2026-07-18` 등)
- 예약 가능 시 이메일 알림 발송 (Gmail SMTP)
- Claude 등 MCP 클라이언트에서 도구로 직접 호출 가능

---

## 사전 준비

- Node.js 18 이상
- Playwright 브라우저 설치

```bash
npx playwright install chromium
```

---

## 설치

```bash
git clone https://github.com/ssol-park/booking-checker-mcp.git
cd booking-checker-mcp
npm install
```

---

## MCP 서버 (Claude 연동)

Claude Desktop 또는 Claude Code에서 자연어로 예약 가능 여부를 확인할 수 있습니다.

**`~/.mcp.json` 설정**

```json
{
  "mcpServers": {
    "naver-booking": {
      "command": "npx",
      "args": ["ts-node", "/Users/yourname/booking-checker-mcp/src/server.ts"]
    }
  }
}
```

> `/Users/yourname/booking-checker-mcp` 부분을 실제 clone한 경로로 변경하세요.

---

## 사용법

자연어로 질의하면 내부적으로 필요한 옵션을 조합하여 실행됩니다.

**프롬프트 예시**

```
[숙소명] 7월 18일 체크인 19일 체크아웃 2명 예약 가능한지 확인해줘
[숙소명] 2026-07-18 ~ 2026-07-19 예약 되는지 봐줘
[숙소명] 7월 18~19일 4명으로 예약 가능한지 확인해줘
[숙소명] 7월 18~19일 예약 가능하면 이메일로 알려줘
[숙소명] 7월 18~19일 예약 가능하면 me@gmail.com 으로 알려줘
[숙소명] 7월 18~19일 결과가 어떻든 이메일로 알려줘
[숙소명] 7월 18~19일 예약 가능한지 브라우저 창 없이 확인해줘
```

---

## 이메일 알림 설정

Gmail App Password를 이용한 SMTP 발송 방식입니다.

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
NOTIFY_EMAIL=recipient@gmail.com
```

| 변수 | 설명 |
|------|------|
| `GMAIL_USER` | 발신 Gmail 계정 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 ([설정 방법](https://myaccount.google.com/apppasswords)) |
| `NOTIFY_EMAIL` | 기본 수신 이메일 (`to` 미지정 시 참조) |

> 수신 이메일을 특정할 수 없는 경우 경고 로그만 출력하고 계속 진행합니다.

---

## 기술 스택

- **TypeScript** + **Node.js**
- **Playwright** — 브라우저 자동화
- **@modelcontextprotocol/sdk** — MCP 서버
- **Zod** — 입력값 검증
- **nodemailer** — Gmail SMTP 이메일 발송
