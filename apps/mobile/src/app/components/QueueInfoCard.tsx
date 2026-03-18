import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { theme } from '../utils/theme';
import type { QueueEntry } from '../types/api';

interface QueueInfoCardProps {
  entry: QueueEntry;
  onPress?: () => void;
}

const statusLabel: Record<string, string> = {
  WAITING: '대기 중',
  ACTIVE: '구매 가능',
  EXPIRED: '만료',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export function QueueInfoCard({ entry, onPress }: QueueInfoCardProps) {
  const isActive = entry.status === 'ACTIVE';
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.facility}>{entry.facilityName}</Text>
        <Badge
          label={statusLabel[entry.status] ?? entry.status}
          color={isActive ? theme.colors.success : theme.colors.secondary}
        />
      </View>
      <Text style={styles.unit}>칸번호 {entry.unitCode}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>내 순번</Text>
        <Text style={styles.value}>{entry.queuePosition}번</Text>
      </View>
      {entry.status === 'WAITING' && (
        <View style={styles.row}>
          <Text style={styles.label}>앞 대기</Text>
          <Text style={styles.value}>{entry.aheadCount}명</Text>
        </View>
      )}
      {entry.status === 'ACTIVE' && entry.expiresAt && (
        <View style={styles.row}>
          <Text style={styles.label}>만료 시각</Text>
          <Text style={[styles.value, styles.expires]}>{new Date(entry.expiresAt).toLocaleString('ko-KR')}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  facility: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.black },
  unit: { fontSize: theme.fontSize.sm, color: theme.colors.gray[600], marginBottom: theme.spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs },
  label: { fontSize: theme.fontSize.sm, color: theme.colors.gray[500] },
  value: { fontSize: theme.fontSize.sm, fontWeight: '600' },
  expires: { color: theme.colors.danger },
});
