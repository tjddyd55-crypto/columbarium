import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../utils/theme';
import { UNIT_STATUS_COLORS, UNIT_STATUS_LABELS } from '../utils/constants';
import type { Unit } from '../types/api';

interface UnitGridProps {
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
  queueCountByUnitId?: Record<string, number>;
}

export function UnitGrid({ units, onSelectUnit, queueCountByUnitId = {} }: UnitGridProps) {
  if (!units.length) return null;

  const cellSize = 44;
  const gap = 6;
  const rows = Array.from(
    new Set(units.map((u) => u.rowCode)).values()
  ).sort();
  const cols = Array.from(
    new Set(units.map((u) => u.colNo)).values()
  ).sort((a, b) => a - b);

  const getUnit = (row: string, col: number) =>
    units.find((u) => u.rowCode === row && u.colNo === col);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row} style={styles.row}>
            {cols.map((col) => {
              const unit = getUnit(row, col);
              if (!unit) return <View key={`${row}-${col}`} style={[styles.cell, { width: cellSize, height: cellSize, margin: gap / 2 }]} />;
              const color = UNIT_STATUS_COLORS[unit.status] ?? theme.colors.gray[400];
              const label = UNIT_STATUS_LABELS[unit.status] ?? unit.status;
              const queueCount = queueCountByUnitId[unit.id];
              return (
                <TouchableOpacity
                  key={unit.id}
                  onPress={() => onSelectUnit(unit)}
                  activeOpacity={0.8}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      margin: gap / 2,
                      backgroundColor: color,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Text style={styles.cellCode} numberOfLines={1}>{unit.unitCode}</Text>
                  {queueCount != null && queueCount > 0 ? (
                    <Text style={styles.cellQueue}>{queueCount}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 400 },
  grid: { padding: theme.spacing.sm },
  row: { flexDirection: 'row', marginBottom: 2 },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellCode: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.white,
  },
  cellQueue: {
    fontSize: 8,
    color: theme.colors.white,
    marginTop: 0,
  },
});
