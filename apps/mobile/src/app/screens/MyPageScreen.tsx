import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { useMe } from '../hooks/useMe';
import { Loading } from '../components/Loading';

export default function MyPageScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { data: me, isLoading } = useMe();

  if (isLoading) return <Loading />;

  return (
    <Layout scroll padded safe>
      <View style={styles.section}>
        <Text style={styles.label}>내 정보</Text>
        <Text style={styles.value}>이름: {me?.name ?? user?.login_id ?? '-'}</Text>
        <Text style={styles.value}>아이디: {user?.login_id ?? '-'}</Text>
      </View>
      <Button title="내 계약" variant="outline" onPress={() => navigation.getParent()?.navigate('Contract' as never)} style={styles.btn} />
      <Button title="내 대기열" variant="outline" onPress={() => navigation.getParent()?.navigate('Queue' as never)} style={styles.btn} />
      <Button title="로그아웃" variant="ghost" onPress={() => logout()} style={styles.btn} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  label: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  value: { fontSize: 16, marginBottom: 4 },
  btn: { marginTop: 12 },
});
