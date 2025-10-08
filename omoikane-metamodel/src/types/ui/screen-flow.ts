/**
 * @fileoverview 画面遷移定義
 * 
 * **目的:**
 * 画面間の遷移フローを定義します。
 * 複数の画面がどのように連携し、ユーザーがどのような順序で画面を遷移するかを表現します。
 * 
 * **主要機能:**
 * 1. 画面遷移の定義（from → to）
 * 2. 遷移トリガーの指定（ボタンクリック、送信等）
 * 3. 遷移条件の記述
 * 4. ユースケースとの関連付け
 * 
 * **使用例:**
 * ```typescript
 * const reservationFlow: ScreenFlow = {
 *   id: 'reservation-booking-flow',
 *   name: '予約登録フロー',
 *   description: '来店予約の画面遷移フロー',
 *   screens: [
 *     { id: 'reservation-form-screen' },
 *     { id: 'reservation-confirm-screen' },
 *     { id: 'reservation-complete-screen' }
 *   ],
 *   transitions: [
 *     {
 *       from: { id: 'reservation-form-screen' },
 *       to: { id: 'reservation-confirm-screen' },
 *       trigger: 'submit',
 *       condition: 'バリデーションが全て通過'
 *     },
 *     {
 *       from: { id: 'reservation-confirm-screen' },
 *       to: { id: 'reservation-complete-screen' },
 *       trigger: 'click-button-confirm'
 *     }
 *   ],
 *   startScreen: { id: 'reservation-form-screen' },
 *   endScreens: [{ id: 'reservation-complete-screen' }],
 *   relatedUseCase: { id: 'reservation-booking' }
 * };
 * ```
 * 
 * @module types/ui/screen-flow
 */

import type { DocumentBase } from '../foundation/identifiable.js';
import type { Ref } from '../foundation/reference.js';
import type { UseCase } from '../functional/use-case.js';
import type { Screen } from './screen.js';

/**
 * 画面遷移
 * 
 * 2つの画面間の遷移を定義します。
 */
export type ScreenTransition = {
  /** 遷移元画面 */
  from: Ref<Screen>;

  /** 遷移先画面 */
  to: Ref<Screen>;

  /**
   * トリガー
   * 
   * 遷移を引き起こす操作を記述します。
   * 
   * 例:
   * - 'submit': フォーム送信
   * - 'cancel': キャンセルボタン
   * - 'click-button-confirm': 確認ボタンクリック
   * - 'click-link-detail': 詳細リンククリック
   */
  trigger: string;

  /**
   * 遷移条件（任意）
   * 
   * 遷移が実行される条件を記述します。
   * 
   * 例:
   * - 'バリデーションが全て通過'
   * - '在庫が存在する'
   * - 'ユーザーがログイン済み'
   */
  condition?: string;
};

/**
 * 画面遷移フロー
 * 
 * 複数の画面とその遷移関係を定義します。
 * ユースケースの実現に必要な画面遷移の全体像を表現します。
 * 
 * **設計原則:**
 * - 完全性: フロー内の全画面と全遷移を定義
 * - トレーサビリティ: ユースケースとの対応関係を明示
 * - 可視化: 開始画面と終了画面を明確に
 */
export type ScreenFlow = DocumentBase & {
  /** 文書型識別子（固定値: 'screen-flow'） */
  type?: 'screen-flow';
  
  /**
   * 含まれる画面
   * 
   * このフロー内で使用される全ての画面のリストです。
   */
  screens: Ref<Screen>[];

  /**
   * 画面遷移
   * 
   * 画面間の遷移関係を定義します。
   */
  transitions: ScreenTransition[];

  /**
   * 開始画面
   * 
   * フローの起点となる画面を指定します。
   */
  startScreen?: Ref<Screen>;

  /**
   * 終了画面
   * 
   * フローの終点となる画面を指定します。
   * 複数の終了パターンがある場合は配列で指定します。
   */
  endScreens?: Ref<Screen>[];

  /**
   * 関連するユースケース
   * 
   * この画面遷移フローが実現するユースケースを関連付けます。
   */
  relatedUseCase?: Ref<UseCase>;
};
