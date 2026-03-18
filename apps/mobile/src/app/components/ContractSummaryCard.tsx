import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { theme } from '../utils/theme';
import type { Contract } from '../types/api';

interface ContractSummaryCardProps {
  contract: Contract;
  onPress?: () => void;
}

export function ContractSummaryCard({ contract, onPress }: ContractSummaryCardProps) {
  return (
    <Card onPress={onPress}>
      <Text style={styles.contractNo}>{contract.contractNo}</Text>
      <Text style={styles.facility}>{contract.facilityName}</Text>
      <Text style={styles.unit}>칸 {contract.unitCode}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>계약금액</Text>
        <Text style={styles.price}>{contract.finalPrice?.toLocaleString?.() ?? contract.finalPrice}원</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>기간</Text>
        <Text style={styles.value}>{contract.startDate} ~ {contract.endDate}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  contractNo: { fontSize: theme.fontSize.sm, color: theme.colors.gray[500], marginBottom: theme.spacing.xs },
  facility: { fontSize: theme.fontSize.lg, fontWeight: '600', marginBottom: theme.spacing.xs },
  unit: { fontSize: theme.fontSize.sm, color: theme.colors.gray[600], marginBottom: theme.spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs },
  label: { fontSize: theme.fontSize.sm, color: theme.colors.gray[500] },
  value: { fontSize: theme.fontSize.sm },
  price: { fontSize: theme.fontSize.base, fontWeight: '700', color: theme.colors.primary },
});
