/**
 * 이메일 발송 인터페이스.
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface IEmailProvider {
  send(email: string, subject: string, body: string): Promise<EmailSendResult>;
}
