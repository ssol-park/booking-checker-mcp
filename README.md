# 네이버 호텔 예약 가능 여부 확인기

네이버 호텔(hotels.naver.com)에서 원하는 숙소의 예약 가능 여부와 최저가를 자동으로 확인합니다.
CLI와 MCP 서버 두 가지 방식으로 사용할 수 있습니다.

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
git clone https://github.com/<your-username>/hotel-availability-checker.git
cd hotel-availability-checker
npm install
```

---

## 사용법

### CLI

```bash
npx ts-node src/checker.ts --name <숙소명> --checkin <날짜> --checkout <날짜> [--guests <인원>] [--headless]
```

| 옵션 | 설명 | 기본값 | 예시 |
|------|------|--------|------|
| `--name` | 숙소명 (필수) | - | `"쏠비치 삼척"` |
| `--checkin` | 체크인 날짜 (필수) | - | `0718` |
| `--checkout` | 체크아웃 날짜 (필수) | - | `0719` |
| `--guests` | 인원 수 | `2` | `4` |
| `--headless` | 브라우저 창 숨김 | `false` | - |

**예시**

```bash
npx ts-node src/checker.ts --name "쏠비치 삼척" --checkin 0719 --checkout 0721 --guests 4 --headless
```

---

### MCP 서버

Claude Desktop 등 MCP 클라이언트에서 `check_booking` 도구로 호출할 수 있습니다.

**`~/.mcp.json` 설정**

```json
{
  "mcpServers": {
    "naver-booking": {
      "command": "npx",
      "args": ["ts-node", "/절대경로/hotel-availability-checker/src/server.ts"]
    }
  }
}
```

**도구 파라미터**

| 파라미터 | 타입 | 설명 | 기본값 |
|----------|------|------|--------|
| `name` | string | 숙소명 | - |
| `checkin` | string | 체크인 날짜 | - |
| `checkout` | string | 체크아웃 날짜 | - |
| `guests` | number | 인원 수 | `2` |
| `headless` | boolean | 브라우저 창 숨김 | `false` |

---

## 날짜 입력 형식

| 형식 | 예시 |
|------|------|
| `YYYY-MM-DD` | `2026-07-18` |
| `YYYY/MM/DD` | `2026/07/18` |
| `MM-DD` | `07-18` |
| `MMDD` | `0718` |
| `M월DD일` | `7월18일` |
| `M월 DD일` | `7월 18일` |
| `YYYY년 M월 DD일` | `2026년 7월 18일` |

---

## 기술 스택

- **TypeScript** + **Node.js**
- **Playwright** — 브라우저 자동화
- **@modelcontextprotocol/sdk** — MCP 서버
- **Zod** — 입력값 검증
