import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'Contract'>;

export default function ContractScreen() {
  const { params } = useRoute<Route>();
  const user = useAuthStore((s) => s.user);

  return (
    <Layout scroll padded safe>
      <Text style={styles.section}>회원 정보</Text>
      <Text style={styles.row}>이름: {user?.name ?? '-'}</Text>
      <Text style={styles.row}>아이디: {user?.login_id ?? '-'}</Text>
      <Text style={styles.section}>계약 정보</Text>
      <Text style={styles.row}>칸 ID: {params.unitId}</Text>
      <Text style={styles.row}>대기열 ID: {params.queueEntryId}</Text>
      <Text style={styles.hint}>계약서 확인 및 전자서명은 추후 연동됩니다.</Text>
      <Button title="계약 진행 (이미 완료 시 목록에서 확인)" onPress={() => {}} style={styles.btn} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  row: { fontSize: 15, marginBottom: 4 },
  hint: { fontSize: 13, color: '#64748b', marginTop: 16 },
  btn: { marginTop: 24 },
});
