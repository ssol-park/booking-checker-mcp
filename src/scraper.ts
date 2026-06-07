import { chromium, Page } from "playwright";
import { ParsedDate } from "./parser";

export interface CheckOptions {
  name: string;
  checkIn: ParsedDate;
  checkOut: ParsedDate;
  guests: number;
  headless?: boolean;
}

export interface CheckResult {
  available: boolean;
  lowestPrice: string | null;
  url: string;
}

const fmt = (d: ParsedDate) =>
  `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

export async function checkAvailability(options: CheckOptions): Promise<CheckResult | null> {
  const browser = await chromium.launch({ headless: options.headless ?? false });
  const page = await browser.newPage();
  let hotelFound = false;

  try {
    // 1. 네이버 검색으로 hotels.naver.com 숙소 기본 URL 탐색
    const baseUrl = await findHotelBaseUrl(page, options.name);
    if (!baseUrl) {
      console.error(`❌ "${options.name}"의 네이버 호텔 페이지를 찾을 수 없습니다.`);
      return null;
    }
    hotelFound = true;

    // 2. 날짜/인원 파라미터 포함 URL로 직접 접근
    const url = buildHotelUrl(baseUrl, options);
    console.log(`호텔 페이지: ${url}`);

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // 3. 결과 파싱 및 출력
    const result = await parseResult(page, url);
    printResult(options, result);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n오류 발생: ${message}`);
    return null;
  } finally {
    const keepOpen = !(options.headless ?? false) && hotelFound;
    if (keepOpen) {
      console.log("\n브라우저가 열린 상태로 유지됩니다. 직접 닫아주세요.");
    } else {
      await browser.close();
    }
  }
}

// 네이버 검색 결과에서 hotels.naver.com 링크를 찾아 경로(pathname)만 반환
async function findHotelBaseUrl(page: Page, name: string): Promise<string | null> {
  console.log(`"${name}" 네이버 검색 중...`);
  await page.goto(`https://search.naver.com/search.naver?query=${encodeURIComponent(name)}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);

  const hotelLinks = await page.$$eval("a[href*='hotels.naver.com/accommodation']", (els) =>
    els.map((el) => (el as HTMLAnchorElement).href)
  );

  for (const href of hotelLinks) {
    // 로그인 리다이렉트 URL 제외
    if (href.includes("nidlogin")) continue;
    try {
      const parsed = new URL(href);
      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      continue;
    }
  }

  return null;
}

// 숙소 URL 패턴에 따라 적절한 파라미터명으로 URL 구성
// - domestic 패턴: dCheckIn, dCheckOut, dAdultCnt
// - 해외 호텔 패턴: checkIn, checkOut, adultCnt
function buildHotelUrl(baseUrl: string, options: CheckOptions): string {
  const isDomestic = baseUrl.includes("/domestic/");

  const params = isDomestic
    ? new URLSearchParams({
        dCheckIn: fmt(options.checkIn),
        dCheckOut: fmt(options.checkOut),
        dAdultCnt: String(options.guests),
      })
    : new URLSearchParams({
        checkIn: fmt(options.checkIn),
        checkOut: fmt(options.checkOut),
        adultCnt: String(options.guests),
        includeTax: "false",
      });

  return `${baseUrl}?${params}`;
}

async function parseResult(page: Page, url: string): Promise<CheckResult> {
  const bodyText = await page.innerText("body");

  // 가격 추출 (예: "704,360원~")
  const priceMatch = bodyText.match(/([\d,]+)원~/);
  const lowestPrice = priceMatch ? `${priceMatch[1]}원~` : null;

  const available =
    lowestPrice !== null || ["예약하기", "가격비교", "원/1박"].some((k) => bodyText.includes(k));

  return { available, lowestPrice, url };
}

function printResult(options: CheckOptions, result: CheckResult): void {
  const { checkIn, checkOut } = options;

  console.log("\n========== 결과 ==========");
  console.log(`숙소    : ${options.name}`);
  console.log(`체크인  : ${fmt(checkIn)}`);
  console.log(`체크아웃: ${fmt(checkOut)}`);
  console.log(`인원    : ${options.guests}명`);
  console.log(`URL     : ${result.url}`);

  if (result.available) {
    const priceStr = result.lowestPrice ? ` (최저가 ${result.lowestPrice})` : "";
    console.log(`\n✅ 예약 가능한 객실이 있습니다!${priceStr}`);
  } else {
    console.log("\n❌ 해당 조건의 예약 가능한 객실이 없습니다.");
  }
  console.log("===========================");
}
