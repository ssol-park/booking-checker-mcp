# 네이버 예약 가용성 체커

## 프로젝트 개요

네이버 예약 기준으로 원하는 숙소와 날짜를 입력하면, 예약 가능한 숙소가 있는지 자동으로 확인하고 이메일로 알림을 보내주는 프로그램.

---

## 요구사항

- 숙소명과 숙박 기간을 입력받아 해당 일자의 예약 가능 여부 확인
- 예약 가능 시 **이메일 알림** 발송
- Mac / Windows 스케줄러에 등록해서 **주기적 자동 실행**

---

## 기술 스택 결정

### 크롤링 방식

| 방식 | 결정 | 이유 |
|------|------|------|
| 네이버 공식 API | ❌ | 숙박 가용성 조회 공개 API 없음 |
| Claude API + MCP | ❌ | 유료 (토큰당 비용 발생) |
| Gemini API + browser-use | 보류 | 무료 티어 있으나 API 의존 |
| **순수 Playwright** | ✅ | 완전 무료, 특정 페이지 반복 체크에 최적 |

### 최종 구성

```
Python + Playwright
├── 브라우저 자동화 (헤드리스)
├── 네이버 예약 페이지 접속 및 날짜 선택
├── 예약 가능 여부 파싱
├── 가능 시 이메일 발송 (smtplib, 무료)
└── 스케줄 등록
    ├── Mac: cron 또는 launchd
    └── Windows: 작업 스케줄러
```

---

## 핵심 기술 이슈

- `booking.naver.com`은 **JavaScript 렌더링 필수** (React 앱)
- 단순 HTTP 요청(requests, curl)으로는 접근 불가
- 실제 브라우저를 띄우는 **Playwright만 정상 접근 가능**

---

## 직접 접근 시도 결과

### 시도 1: WebSearch로 네이버 예약 URL 탐색
- **방법**: `네이버 예약 쏠비치 삼척 booking.naver.com` 검색
- **결과**: ❌ 직접적인 네이버 예약 URL 없음
- **원인**: 검색 결과가 Hotels.com, Expedia 등 서드파티 사이트만 노출됨. 네이버 예약 직접 링크는 검색엔진에 노출되지 않음

### 시도 2: booking.naver.com 직접 HTTP 요청
- **방법**: `https://booking.naver.com/booking/6/bizes/search?startDate=2026-07-18&endDate=2026-07-19&keyword=쏠비치+삼척` 직접 fetch
- **결과**: ❌ `Claude Code is unable to fetch from booking.naver.com`
- **원인**:
  - 네이버 예약은 **React 기반 SPA**로 JavaScript 실행 없이는 콘텐츠 미렌더링
  - 단순 HTTP GET 요청으로는 빈 HTML 껍데기만 반환
  - 봇 차단 정책 (User-Agent 필터링, IP 제한 등) 적용 가능성
  - 실제 브라우저 엔진(Chromium 등)을 통한 접근만 정상 동작

### 시도 3: 소노호텔앤리조트 공식 홈페이지 fetch
- **방법**: `https://www.sonohotelsresorts.com/solbeach_sc` fetch
- **결과**: ❌ 예약 링크 없음
- **원인**: 공식 홈페이지도 CSS/JS 코드만 응답, 네이버 예약으로 연결되는 링크 미포함

### 결론
> 네이버 예약 페이지는 **JavaScript 렌더링이 필수**이므로, 실제 브라우저를 자동화하는 **Playwright** 없이는 어떤 방식으로도 접근 불가.

---

## 테스트 케이스

- 숙소: 쏠비치 삼척 (강원도 삼척)
- 날짜: 2026년 7월 18일 (1박)

---

## 구현 예정

- [ ] 네이버 예약 페이지 구조 분석
- [ ] Playwright 크롤링 스크립트 작성
- [ ] 이메일 알림 모듈 작성
- [ ] CLI 인터페이스 (숙소명, 날짜 입력)
- [ ] Mac cron 등록 가이드
- [ ] Windows 작업 스케줄러 등록 가이드
