export interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

const CURRENT_YEAR = new Date().getFullYear();

/**
 * 다양한 날짜 형식을 ParsedDate로 정규화
 *
 * 지원 형식:
 *   YYYY-MM-DD     2026-07-18
 *   YYYY/MM/DD     2026/07/18
 *   MM-DD, M-DD    07-18, 7-18
 *   MMDD           0718
 *   M월 DD일        7월 18일
 *   M월DD일         7월18일
 *   M월 DD         7월 18
 */
export function parseDate(input: string): ParsedDate {
  const raw = input.trim();

  // 1. YYYY-MM-DD 또는 YYYY/MM/DD
  const fullDate = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (fullDate) {
    return validated(parseInt(fullDate[1]), parseInt(fullDate[2]), parseInt(fullDate[3]));
  }

  // 2. MM-DD 또는 M-DD (연도 없음)
  const monthDay = raw.match(/^(\d{1,2})[-/](\d{1,2})$/);
  if (monthDay) {
    return validated(CURRENT_YEAR, parseInt(monthDay[1]), parseInt(monthDay[2]));
  }

  // 3. MMDD (4자리 숫자)
  const mmdd = raw.match(/^(\d{4})$/);
  if (mmdd) {
    const month = parseInt(raw.slice(0, 2));
    const day = parseInt(raw.slice(2, 4));
    return validated(CURRENT_YEAR, month, day);
  }

  // 4. 한글 형식: M월 DD일, M월DD일, M월 DD
  const korean = raw.match(/^(\d{1,2})월\s*(\d{1,2})일?$/);
  if (korean) {
    return validated(CURRENT_YEAR, parseInt(korean[1]), parseInt(korean[2]));
  }

  // 5. 한글 형식 (연도 포함): YYYY년 M월 DD일
  const koreanFull = raw.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일?$/);
  if (koreanFull) {
    return validated(parseInt(koreanFull[1]), parseInt(koreanFull[2]), parseInt(koreanFull[3]));
  }

  throw new Error(
    `날짜 형식을 인식할 수 없습니다: "${raw}"\n` +
      `지원 형식: 2026-07-18 / 07-18 / 0718 / 7월18일 / 7월 18`
  );
}

function validated(year: number, month: number, day: number): ParsedDate {
  if (month < 1 || month > 12) {
    throw new Error(`유효하지 않은 월: ${month} (1~12 사이여야 합니다)`);
  }
  if (day < 1 || day > 31) {
    throw new Error(`유효하지 않은 일: ${day} (1~31 사이여야 합니다)`);
  }
  return { year, month, day };
}
