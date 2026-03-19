import { describe, it, expect } from 'vitest';
import { inferFloorLabel, inferLineLabel, listUniqueFloors } from './sectionFloorGrouping';
import type { SectionRow } from './api';

function sec(id: string, name: string): SectionRow {
  return {
    id,
    facilityId: '1',
    name,
    rows: 1,
    cols: 1,
    seatCount: 1,
    createdAt: '',
  };
}

describe('sectionFloorGrouping', () => {
  it('parses 1층 A', () => {
    expect(inferFloorLabel('1층 A')).toBe('1층');
    expect(inferLineLabel('1층 A')).toBe('A');
  });

  it('single name uses 전체 floor', () => {
    expect(inferFloorLabel('B')).toBe('전체');
    expect(inferLineLabel('B')).toBe('B');
  });

  it('lists unique floors', () => {
    const sections = [sec('1', '1층 A'), sec('2', '2층 A'), sec('3', 'B')];
    expect(listUniqueFloors(sections)).toEqual(['1층', '2층', '전체']);
  });
});
