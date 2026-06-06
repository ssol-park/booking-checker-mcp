import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { parseDate } from "./parser";
import { checkAvailability } from "./scraper";

const server = new McpServer({
  name: "naver-booking",
  version: "1.0.0",
});

server.tool(
  "check_booking",
  "네이버 예약 페이지에서 숙소의 예약 가능 여부를 확인합니다.",
  {
    name: z.string().describe("숙소명 (예: 쏠비치 삼척)"),
    checkin: z.string().describe("체크인 날짜 (예: 0718, 7월18일, 2026-07-18)"),
    checkout: z.string().describe("체크아웃 날짜"),
    guests: z.number().int().min(1).default(2).describe("인원 수 (기본값: 2)"),
    headless: z
      .boolean()
      .default(false)
      .describe("브라우저 창 숨김 여부 (기본값: false — 창 표시)"),
  },
  async ({ name, checkin, checkout, guests, headless }) => {
    const checkIn = parseDate(checkin);
    const checkOut = parseDate(checkout);

    const inTs = new Date(checkIn.year, checkIn.month - 1, checkIn.day).getTime();
    const outTs = new Date(checkOut.year, checkOut.month - 1, checkOut.day).getTime();
    if (outTs <= inTs) {
      return {
        content: [{ type: "text", text: "오류: 체크아웃 날짜는 체크인 날짜보다 이후여야 합니다." }],
      };
    }

    const lines: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args: unknown[]) => lines.push(args.join(" "));
    console.error = (...args: unknown[]) => lines.push("[오류] " + args.join(" "));

    try {
      await checkAvailability({ name, checkIn, checkOut, guests, headless });
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }

    return {
      content: [{ type: "text", text: lines.join("\n") }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
