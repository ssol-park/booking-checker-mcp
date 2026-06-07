import nodemailer from "nodemailer";
import { CheckResult } from "./scraper";

export interface NotifyOptions {
  to: string;
  hotelName: string;
  checkin: string;
  checkout: string;
  guests: number;
}

export async function sendNotification(result: CheckResult, options: NotifyOptions): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      "[알림] GMAIL_USER 또는 GMAIL_APP_PASSWORD 환경변수가 없어 이메일을 발송하지 않습니다."
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const priceStr = result.lowestPrice ? ` (최저가 ${result.lowestPrice})` : "";

  const body = [
    `숙소    : ${options.hotelName}`,
    `체크인  : ${options.checkin}`,
    `체크아웃: ${options.checkout}`,
    `인원    : ${options.guests}명`,
    `URL     : ${result.url}`,
    ``,
    `✅ 예약 가능한 객실이 있습니다!${priceStr}`,
  ].join("\n");

  await transporter.sendMail({
    from: user,
    to: options.to,
    subject: `✅ 예약 가능 알림 - ${options.hotelName}`,
    text: body,
  });

  console.log(`[알림] 이메일 발송 완료 → ${options.to}`);
}
