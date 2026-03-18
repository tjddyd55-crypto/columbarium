import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  IPushProvider,
  PushPayload,
  PushSendResult,
} from './push.provider.interface';

/**
 * FCM Push Provider (placeholder).
 * 실제 연동 시 firebase-admin SDK 사용, env에서 credential 로딩.
 */
@Injectable()
export class FcmPushProvider implements IPushProvider {
  constructor(private readonly config: ConfigService) {}

  async sendToUser(_userId: bigint, payload: PushPayload): Promise<PushSendResult> {
    // 실제 구현: UserDevice에서 토큰 조회 후 sendToTokens 호출
    return this.sendToTokens([], payload);
  }

  async sendToTokens(
    tokens: string[],
    payload: PushPayload,
  ): Promise<PushSendResult> {
    const key = this.config.get<string>('FCM_SERVER_KEY');
    if (!tokens.length) {
      return { success: true };
    }
    if (!key) {
      return {
        success: false,
        errorCode: 'PUSH_PROVIDER_ERROR',
        errorMessage: 'FCM_SERVER_KEY not configured',
      };
    }
    // TODO: firebase-admin messaging().sendEachForMulticast()
    // 현재는 로그만 남기고 성공 처리 (placeholder)
    return {
      success: true,
      messageId: `fcm-${Date.now()}`,
    };
  }
}
