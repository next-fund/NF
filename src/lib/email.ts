// ============================================================
//  EMAILJS NOTIFICATIONS (FREE TIER)
//  -----------------------------------------------------------
//  Sends transactional emails entirely from the browser using
//  EmailJS — no backend / paid plan required.
//
//  SETUP (https://www.emailjs.com — free):
//   1. Create an account and add an Email Service (e.g. Gmail).
//      Copy its SERVICE ID.
//   2. Create ONE Email Template and copy its TEMPLATE ID.
//      In the template, use these variables:
//        {{to_email}}   - recipient address  (set "To Email" = {{to_email}})
//        {{to_name}}    - recipient name
//        {{subject}}    - email subject       (set "Subject" = {{subject}})
//        {{title}}      - heading line
//        {{message}}    - main body text
//        {{amount}}     - amount in USDT
//        {{status}}     - approved / rejected / credited
//   3. Account → General → copy your PUBLIC KEY.
//   4. Paste all three values below.
// ============================================================

export const EMAILJS_CONFIG = {
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
};

export const isEmailConfigured =
  !EMAILJS_CONFIG.serviceId.startsWith('YOUR_') &&
  !EMAILJS_CONFIG.templateId.startsWith('YOUR_') &&
  !EMAILJS_CONFIG.publicKey.startsWith('YOUR_');

export interface EmailParams {
  to_email: string;
  to_name?: string;
  subject: string;
  title: string;
  message: string;
  amount?: string;
  status?: string;
}

// Fire-and-forget email send via the EmailJS REST API (browser-friendly).
export async function sendNotificationEmail(params: EmailParams): Promise<void> {
  if (!isEmailConfigured) {
    console.info('[email] EmailJS not configured — skipping notification:', params.subject);
    return;
  }
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          to_name: params.to_name || params.to_email,
          ...params,
        },
      }),
    });
    if (!res.ok) {
      console.warn('[email] EmailJS send failed:', res.status, await res.text());
    }
  } catch (e) {
    console.warn('[email] EmailJS send error:', e);
  }
}

// --- Ready-made notification builders -----------------------------------

export function transactionResolvedEmail(opts: {
  email: string;
  name?: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  approved: boolean;
}) {
  const verb = opts.type === 'deposit' ? 'Deposit' : 'Withdrawal';
  const status = opts.approved ? 'approved' : 'rejected';
  return sendNotificationEmail({
    to_email: opts.email,
    to_name: opts.name,
    status,
    amount: `${opts.amount.toFixed(2)} USDT`,
    subject: `Your ${verb.toLowerCase()} was ${status}`,
    title: `${verb} ${status}`,
    message: opts.approved
      ? `Good news! Your ${verb.toLowerCase()} of ${opts.amount.toFixed(2)} USDT has been approved and your balance has been updated.`
      : `Your ${verb.toLowerCase()} request of ${opts.amount.toFixed(2)} USDT was rejected. Please review the details and try again, or contact support.`,
  });
}

export function dailyReturnEmail(opts: {
  email: string;
  name?: string;
  packageName: string;
  amount: number;
}) {
  return sendNotificationEmail({
    to_email: opts.email,
    to_name: opts.name,
    status: 'credited',
    amount: `${opts.amount.toFixed(2)} USDT`,
    subject: `You earned ${opts.amount.toFixed(2)} USDT from ${opts.packageName}`,
    title: 'Daily return credited',
    message: `Your ${opts.packageName} package just paid a daily return of ${opts.amount.toFixed(2)} USDT, which has been added to your balance. Keep growing!`,
  });
}
