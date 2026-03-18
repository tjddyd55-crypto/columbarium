/**
 * SMS 발송 인터페이스.
 * 한국 SMS 공급사 교체 시 adapter만 교체.
 */
export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface ISmsProvider {
  send(phone: string, message: string): Promise<SmsSendResult>;
}
