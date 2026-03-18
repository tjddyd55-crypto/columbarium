import { Injectable } from '@nestjs/common';
import type { IEmailProvider, EmailSendResult } from './email.provider.interface';

@Injectable()
export class MockEmailProvider implements IEmailProvider {
  async send(
    _email: string,
    _subject: string,
    _body: string,
  ): Promise<EmailSendResult> {
    return {
      success: true,
      messageId: `mock-email-${Date.now()}`,
    };
  }
}
