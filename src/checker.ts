import "dotenv/config";
import minimist from "minimist";
import { parseDate, ParsedDate } from "./parser";
import { checkAvailability } from "./scraper";
import { sendNotification } from "./notifier";

const USAGE = `
사용법:
  npx ts-node src/checker.ts --name <숙소명> --checkin <날짜> --checkout <날짜> [--guests <인원>] [--notify] [--to <이메일>]

옵션:
  --name      숙소명 (필수)              예: "쏠비치 삼척"
  --checkin   체크인 날짜 (필수)         예: 2026-07-18 / 0718 / 7월18일 / 7-18
  --checkout  체크아웃 날짜 (필수)       예: 2026-07-19 / 0719 / 7월19일 / 7-19
  --guests    인원 수 (기본값: 2)        예: 2
  --notify    예약 가능 시 이메일 발송
  --to        수신 이메일 (생략 시 NOTIFY_EMAIL 환경변수 사용)

예시:
  npx ts-node src/checker.ts --name "쏠비치 삼척" --checkin 0718 --checkout 0719 --guests 2
  npx ts-node src/checker.ts --name "쏠비치 삼척" --checkin 0718 --checkout 0719 --notify
  npx ts-node src/checker.ts --name "쏠비치 삼척" --checkin 0718 --checkout 0719 --notify --to me@gmail.com
`;

async function main() {
  const argv = minimist(process.argv.slice(2), {
    string: ["name", "checkin", "checkout", "to"],
    boolean: ["headless", "notify"],
    default: { guests: 2, headless: false, notify: false },
  });

  // 필수 인수 검증
  const missing: string[] = [];
  if (!argv.name) missing.push("--name");
  if (!argv.checkin) missing.push("--checkin");
  if (!argv.checkout) missing.push("--checkout");

  if (missing.length > 0) {
    console.error(`오류: 필수 인수가 없습니다: ${missing.join(", ")}`);
    console.log(USAGE);
    process.exit(1);
  }

  // 날짜 파싱
  let checkIn: ParsedDate;
  let checkOut: ParsedDate;

  try {
    checkIn = parseDate(String(argv.checkin));
  } catch (e: unknown) {
    console.error(`체크인 날짜 오류: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  try {
    checkOut = parseDate(String(argv.checkout));
  } catch (e: unknown) {
    console.error(`체크아웃 날짜 오류: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  // 날짜 순서 검증
  const inTs = new Date(checkIn.year, checkIn.month - 1, checkIn.day).getTime();
  const outTs = new Date(checkOut.year, checkOut.month - 1, checkOut.day).getTime();
  if (outTs <= inTs) {
    console.error("오류: 체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.");
    process.exit(1);
  }

  const guests = Math.max(1, Math.floor(argv.guests));

  console.log(`\n검색 조건`);
  console.log(`  숙소  : ${argv.name}`);
  console.log(
    `  체크인 : ${checkIn.year}-${String(checkIn.month).padStart(2, "0")}-${String(checkIn.day).padStart(2, "0")}`
  );
  console.log(
    `  체크아웃: ${checkOut.year}-${String(checkOut.month).padStart(2, "0")}-${String(checkOut.day).padStart(2, "0")}`
  );
  console.log(`  인원  : ${guests}명\n`);

  const result = await checkAvailability({
    name: argv.name,
    checkIn,
    checkOut,
    guests,
    headless: argv.headless,
  });

  if (argv.notify && result?.available) {
    const to = argv.to || process.env.NOTIFY_EMAIL;
    if (!to) {
      console.warn(
        "[알림] 수신 이메일이 없습니다. --to 옵션 또는 NOTIFY_EMAIL 환경변수를 설정하세요."
      );
    } else {
      await sendNotification(result, {
        to,
        hotelName: argv.name,
        checkin: `${checkIn.year}-${String(checkIn.month).padStart(2, "0")}-${String(checkIn.day).padStart(2, "0")}`,
        checkout: `${checkOut.year}-${String(checkOut.month).padStart(2, "0")}-${String(checkOut.day).padStart(2, "0")}`,
        guests,
      });
    }
  }
}

main();
