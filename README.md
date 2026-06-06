# 네이버 호텔 예약 가능 여부 확인기

네이버 호텔(hotels.naver.com)에서 원하는 숙소의 예약 가능 여부와 최저가를 자동으로 확인합니다.
Claude 등 MCP 클라이언트에서 자연어로 호출할 수 있습니다.

---

## 기능

- 숙소명, 체크인/체크아웃 날짜, 인원 수 입력으로 예약 가능 여부 확인
- 예약 가능 시 최저가 표시
- 다양한 날짜 입력 형식 지원 (`0718`, `7월18일`, `2026-07-18` 등)
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

## 사용법

Claude Desktop 등 MCP 클라이언트에서 `check_booking` 도구로 호출할 수 있습니다.

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

**프롬프트 예시**

```
[숙소명] 7월 19일 체크인 21일 체크아웃 4명 예약 가능한지 확인해줘
[숙소명] 2026-08-01 ~ 2026-08-03 2명 예약 되는지 봐줘
```

---

## 기술 스택

- **TypeScript** + **Node.js**
- **Playwright** — 브라우저 자동화
- **@modelcontextprotocol/sdk** — MCP 서버
- **Zod** — 입력값 검증
