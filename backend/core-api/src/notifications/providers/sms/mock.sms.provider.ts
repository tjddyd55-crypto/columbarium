import { Injectable } from '@nestjs/common';
import type { ISmsProvider, SmsSendResult } from './sms.provider.interface';

@Injectable()
export class MockSmsProvider implements ISmsProvider {
  async send(phone: string, message: string): Promise<SmsSendResult> {
    // 로그만 남기고 성공 처리. 추후 한국 SMS 업체 연동 시 교체.
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}`,
    };
  }
}
