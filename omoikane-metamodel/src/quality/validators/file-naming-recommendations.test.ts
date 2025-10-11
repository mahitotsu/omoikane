/**
 * @fileoverview ファイル名推奨事項のテスト
 */

import { describe, expect, test } from 'bun:test';
import { assessNamingConsistency } from './naming-consistency.js';
import type {
  Actor,
  BusinessRequirementDefinition,
  UseCase,
} from '../../types/index.js';

describe('assessNamingConsistency - ファイル名推奨', () => {
  test('キャメルケースのファイル名で推奨事項が生成される', () => {
    const actors: Actor[] = [
      {
        id: 'customer',
        name: '顧客',
        type: 'actor',
        description: 'テスト',
        role: 'primary',
        responsibilities: ['テスト'],
      },
    ];
    const useCases: UseCase[] = [];
    const businessRequirements: BusinessRequirementDefinition[] = [];

    const filePaths = [
      'src/requirements/reservationBooking.ts',
      'src/requirements/reservationCancel.ts',
    ];

    const result = assessNamingConsistency(
      actors,
      useCases,
      businessRequirements,
      undefined,
      undefined,
      undefined,
      filePaths
    );

    // ファイル名スコアが低い
    expect(result.fileNaming.score).toBe(0);

    // 推奨事項が生成される
    const fileRecs = result.recommendations.filter(
      (r) => r.category === 'file'
    );
    expect(fileRecs.length).toBeGreaterThan(0);

    // キャメルケースの推奨が含まれる
    const camelCaseRec = fileRecs.find((r) =>
      r.message.includes('キャメルケース')
    );
    expect(camelCaseRec).toBeDefined();
    expect(camelCaseRec?.affectedElements).toEqual([
      'reservationBooking',
      'reservationCancel',
    ]);
    expect(camelCaseRec?.suggestedAction).toContain('reservation-booking.ts');
  });

  test('パスカルケースのファイル名で推奨事項が生成される', () => {
    const actors: Actor[] = [];
    const useCases: UseCase[] = [];
    const businessRequirements: BusinessRequirementDefinition[] = [];

    const filePaths = [
      'src/screens/FormScreen.ts',
      'src/screens/ConfirmScreen.ts',
    ];

    const result = assessNamingConsistency(
      actors,
      useCases,
      businessRequirements,
      undefined,
      undefined,
      undefined,
      filePaths
    );

    const fileRecs = result.recommendations.filter(
      (r) => r.category === 'file'
    );
    const pascalCaseRec = fileRecs.find((r) =>
      r.message.includes('パスカルケース')
    );

    expect(pascalCaseRec).toBeDefined();
    expect(pascalCaseRec?.affectedElements).toEqual([
      'FormScreen',
      'ConfirmScreen',
    ]);
  });

  test('ケバブケース100%の場合は推奨事項なし', () => {
    const actors: Actor[] = [];
    const useCases: UseCase[] = [];
    const businessRequirements: BusinessRequirementDefinition[] = [];

    const filePaths = [
      'src/requirements/reservation-booking.ts',
      'src/requirements/reservation-cancel.ts',
    ];

    const result = assessNamingConsistency(
      actors,
      useCases,
      businessRequirements,
      undefined,
      undefined,
      undefined,
      filePaths
    );

    expect(result.fileNaming.score).toBe(100);
    const fileRecs = result.recommendations.filter(
      (r) => r.category === 'file'
    );
    expect(fileRecs.length).toBe(0);
  });

  test('評価対象がない場合は推奨事項なし', () => {
    const actors: Actor[] = [];
    const useCases: UseCase[] = [];
    const businessRequirements: BusinessRequirementDefinition[] = [];

    const filePaths = ['src/index.ts', 'src/actors.ts']; // 除外対象のみ

    const result = assessNamingConsistency(
      actors,
      useCases,
      businessRequirements,
      undefined,
      undefined,
      undefined,
      filePaths
    );

    expect(result.fileNaming.score).toBe(100);
    const fileRecs = result.recommendations.filter(
      (r) => r.category === 'file'
    );
    expect(fileRecs.length).toBe(0);
  });
});
