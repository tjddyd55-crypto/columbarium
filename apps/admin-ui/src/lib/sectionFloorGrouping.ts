import type { SectionRow } from './api';

/**
 * 구역명에서 층(라인 그룹) 추출.
 * 예: "1층 A" → "1층", "2F-B" → "2F", "A"만 있으면 → "전체"
 */
export function inferFloorLabel(sectionName: string): string {
  const t = sectionName.trim();
  const m = t.match(/^(.+?층)(?:[\s\-_/]+(.+))?$/);
  if (m) return m[1].trim();
  const m2 = t.match(/^(\d+F)(?:[\s\-_/]+(.+))?$/i);
  if (m2) return m2[1].toUpperCase();
  return '전체';
}

/** 같은 층 내에서 구역 표시용 라벨 (예: A라인) */
export function inferLineLabel(sectionName: string): string {
  const t = sectionName.trim();
  const m = t.match(/^(.+?층)(?:[\s\-_/]+(.+))?$/);
  if (m) return (m[2] ?? m[1]).trim();
  const m2 = t.match(/^(\d+F)(?:[\s\-_/]+(.+))?$/i);
  if (m2) return (m2[2] ?? m2[1]).trim();
  return t;
}

export function listUniqueFloors(sections: SectionRow[]): string[] {
  const set = new Set(sections.map((s) => inferFloorLabel(s.name)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
}

export function sectionsForFloor(sections: SectionRow[], floor: string): SectionRow[] {
  return sections.filter((s) => inferFloorLabel(s.name) === floor);
}
