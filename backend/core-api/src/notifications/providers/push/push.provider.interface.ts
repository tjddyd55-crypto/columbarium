/**
 * Push 알림 발송 인터페이스.
 * FCM 등 구체 구현은 adapter로 주입.
 */
export interface PushPayload {
  title: string;
  body: string;
  data?: {
    type: string;
    relatedId?: string;
    screen?: string;
    unitId?: string;
    facilityId?: string;
    [key: string]: string | undefined;
  };
}

export interface PushSendResult {
  success: boolean;
  messageId?: string;
  invalidTokens?: string[];
  errorCode?: string;
  errorMessage?: string;
}

export interface IPushProvider {
  /**
   * 사용자 ID 기준 등록된 디바이스 토큰들로 발송.
   */
  sendToUser(userId: bigint, payload: PushPayload): Promise<PushSendResult>;

  /**
   * 토큰 배열로 직접 발송 (디스패처에서 디바이스 조회 후 호출).
   */
  sendToTokens(tokens: string[], payload: PushPayload): Promise<PushSendResult>;
}
