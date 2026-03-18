import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import type { NotificationMetadata } from './types/notification.types';

const TEMPLATES: Record<
  NotificationType,
  { title: string; body: string }
> = {
  QUEUE_7D_REMINDER: {
    title: '곧 구매 순번이 다가옵니다',
    body: '{facilityName} {unitCode} 자리가 약 7일 이내 구매 가능 상태가 될 예정입니다.',
  },
  QUEUE_1D_REMINDER: {
    title: '내일 구매 기회가 열릴 예정입니다',
    body: '{facilityName} {unitCode} 자리가 내일 구매 가능 상태가 될 예정입니다.',
  },
  QUEUE_ACTIVE_NOW: {
    title: '지금 구매 가능합니다',
    body: '{facilityName} {unitCode} 자리를 지금부터 24시간 동안 계약할 수 있습니다.',
  },
  QUEUE_EXPIRE_SOON: {
    title: '구매 기회가 곧 만료됩니다',
    body: '{facilityName} {unitCode} 자리 구매 기회가 곧 만료됩니다. 계약을 서두르세요.',
  },
  CONTRACT_COMPLETED: {
    title: '계약이 완료되었습니다',
    body: '{facilityName} {unitCode} 계약이 정상 완료되었습니다.',
  },
  RESALE_APPROVED: {
    title: '재판매 신청이 승인되었습니다',
    body: '{facilityName} {unitCode} 재판매 신청이 승인되어 목록에 노출됩니다.',
  },
  RESALE_REJECTED: {
    title: '재판매 신청이 반려되었습니다',
    body: '{facilityName} {unitCode} 재판매 신청이 반려되었습니다. 사유: {reason}',
  },
  QUEUE_CANCELLED: {
    title: '대기열이 취소되었습니다',
    body: '{facilityName} {unitCode} 대기열이 관리자에 의해 취소되었습니다.',
  },
  ADMIN_NOTICE: {
    title: '알림',
    body: '{body}',
  },
};

function replaceVars(text: string, meta?: NotificationMetadata): string {
  if (!meta) return text;
  return Object.entries(meta).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), v ?? ''),
    text,
  );
}

@Injectable()
export class NotificationTemplateService {
  build(type: NotificationType, metadata?: NotificationMetadata): { title: string; body: string } {
    const t = TEMPLATES[type];
    if (!t) return { title: '알림', body: '' };
    return {
      title: replaceVars(t.title, metadata),
      body: replaceVars(t.body, metadata),
    };
  }
}
