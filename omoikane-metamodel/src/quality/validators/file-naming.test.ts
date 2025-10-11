/**
 * @fileoverview ファイル名命名規則評価のテスト
 */

import { describe, expect, test } from 'bun:test';
import { assessFileNaming } from './naming-consistency.js';

describe('assessFileNaming', () => {
  test('ケバブケースのファイルは100点', () => {
    const filePaths = [
      'src/requirements/reservation-booking.ts',
      'src/requirements/reservation-cancel.ts',
      'src/ui/screens/form-screen.ts',
    ];

    const result = assessFileNaming(filePaths);

    expect(result.score).toBe(100);
    expect(result.kebabCase).toEqual([
      'reservation-booking',
      'reservation-cancel',
      'form-screen',
    ]);
    expect(result.camelCase).toEqual([]);
    expect(result.pascalCase).toEqual([]);
  });

  test('キャメルケースのファイルは検出される', () => {
    const filePaths = [
      'src/requirements/reservationBooking.ts',
      'src/requirements/reservationCancel.ts',
      'src/requirements/reservation-update.ts', // 1つだけケバブケース
    ];

    const result = assessFileNaming(filePaths);

    expect(result.score).toBeCloseTo(33.33, 1); // 1/3がケバブケース
    expect(result.camelCase).toEqual([
      'reservationBooking',
      'reservationCancel',
    ]);
    expect(result.kebabCase).toEqual(['reservation-update']);
  });

  test('パスカルケースのファイルは検出される', () => {
    const filePaths = [
      'src/requirements/ReservationBooking.ts',
      'src/requirements/ReservationCancel.ts',
    ];

    const result = assessFileNaming(filePaths);

    expect(result.pascalCase).toEqual([
      'ReservationBooking',
      'ReservationCancel',
    ]);
    expect(result.score).toBe(0); // ケバブケースが0
  });

  test('特殊ファイル名は除外される', () => {
    const filePaths = [
      'src/index.ts',
      'src/typed-references.ts',
      'src/actors.ts',
      'src/requirements/business-requirements.ts',
      'src/ui/validation-rules.ts',
      'src/requirements/reservation-booking.ts', // 評価対象
    ];

    const result = assessFileNaming(filePaths);

    // index, typed-references, actors, business-requirements, validation-rules は除外
    expect(result.total).toBe(1);
    expect(result.kebabCase).toEqual(['reservation-booking']);
  });

  test('評価対象がない場合は100点', () => {
    const filePaths = [
      'src/index.ts',
      'src/typed-references.ts',
      'src/actors.ts',
    ];

    const result = assessFileNaming(filePaths);

    expect(result.total).toBe(0);
    expect(result.score).toBe(100);
  });

  test('空配列の場合は100点', () => {
    const result = assessFileNaming([]);

    expect(result.total).toBe(0);
    expect(result.score).toBe(100);
  });

  test('拡張子は除外される', () => {
    const filePaths = [
      'src/requirements/reservation-booking.ts',
      'src/requirements/reservation-cancel.js',
      'src/requirements/reservation-update.tsx',
    ];

    const result = assessFileNaming(filePaths);

    expect(result.kebabCase).toEqual([
      'reservation-booking',
      'reservation-cancel',
      'reservation-update',
    ]);
  });

  test('混在スタイルのファイルは不整合として検出される', () => {
    const filePaths = [
      'src/requirements/Reservation_Booking.ts', // パスカル+スネークの混在
      'src/requirements/reservation-cancel.ts',
    ];

    const result = assessFileNaming(filePaths);

    expect(result.inconsistent).toEqual(['Reservation_Booking']);
    expect(result.kebabCase).toEqual(['reservation-cancel']);
    expect(result.score).toBe(50); // 1/2がケバブケース
  });
});
