/**
 * @fileoverview 画面遷移定義
 *
 * **目的:**
 * 画面間の遷移フローを定義します。
 * 複数の画面がどのように連携し、ユーザーがどのような順序で画面を遷移するかを表現します。
 *
 * **主要機能:**
 * 1. 画面遷移の定義（from → to）
 * 2. 遷移トリガーの指定（画面アクションへの参照）
 * 3. 遷移条件の記述
 * 4. ユースケースとの関連付け（必須）
 *
 * **設計原則:**
 * - transitionsのみが真実の源（screens等は自動導出）
 * - 全ての画面フローは必ずユースケースに紐づく
 * - 型安全な画面アクション参照（ScreenActionRef）
 *
 * **使用例:**
 * ```typescript
 * import { typedScreenRef, typedScreenActionRef, typedUseCaseRef } from './typed-references.js';
 *
 * const reservationFlow: ScreenFlow = {
 *   id: 'reservation-booking-flow',
 *   name: '予約登録フロー',
 *   type: 'screen-flow',
 *   description: '来店予約の画面遷移フロー',
 *   transitions: [
 *     {
 *       from: typedScreenRef('reservation-form-screen'),
 *       to: typedScreenRef('reservation-confirm-screen'),
 *       trigger: typedScreenActionRef('reservation-form-screen', 'submit'),
 *       condition: 'バリデーションが全て通過'
 *     },
 *     {
 *       from: typedScreenRef('reservation-confirm-screen'),
 *       to: typedScreenRef('reservation-complete-screen'),
 *       trigger: typedScreenActionRef('reservation-confirm-screen', 'confirm')
 *     }
 *   ],
 *   relatedUseCase: typedUseCaseRef('reservation-booking')  // 必須
 * };
 *
 * // 画面リスト等は自動導出
 * import { deriveScreenFlowMetadata } from './screen-flow-utils.js';
 * const metadata = deriveScreenFlowMetadata(reservationFlow);
 * // metadata.screens: ['reservation-form-screen', 'reservation-confirm-screen', 'reservation-complete-screen']
 * // metadata.startScreens: ['reservation-form-screen']
 * // metadata.endScreens: ['reservation-complete-screen']
 * ```
 *
 * @module types/ui/screen-flow
 */

import type { DocumentBase } from '../foundation/identifiable.js';
import type { Ref } from '../foundation/reference.js';
import type { UseCase } from '../functional/use-case.js';
import type { Screen } from './screen.js';

/**
 * 画面アクションへの参照
 *
 * 画面IDとその画面内のアクションIDの組み合わせで、
 * 特定の画面の特定のアクションを一意に参照します。
 *
 * **設計判断:**
 * - アクションは画面に属する概念であり、画面内でローカルに定義
 * - 異なる画面で同じアクション名（例: 'submit', 'cancel'）を使用可能
 * - 画面IDとアクションIDの組み合わせで型安全な参照を実現
 *
 * **使用例:**
 * ```typescript
 * // typed-references.ts で自動生成される型安全な参照関数を使用
 * trigger: typedScreenActionRef('account-list-screen', 'delete')
 * ```
 */
export type ScreenActionRef = {
  /** 画面ID */
  screenId: string;

  /** 画面内のアクションID */
  actionId: string;
};

/**
 * 画面遷移
 *
 * 2つの画面間の遷移を定義します。
 *
 * **型安全性:**
 * - trigger: 画面IDとアクションIDの組み合わせで参照
 * - typed-references.ts で生成される型安全な参照関数を使用
 * - コンパイル時に画面とアクションの存在をチェック
 */
export type ScreenTransition = {
  /** 遷移元画面 */
  from: Ref<Screen>;

  /** 遷移先画面 */
  to: Ref<Screen>;

  /**
   * トリガー（画面アクションへの参照）
   *
   * 遷移を引き起こす画面アクションを、画面IDとアクションIDで指定します。
   *
   * **型安全な使用例:**
   * ```typescript
   * // typedScreenActionRef を使用（IDE補完が効く）
   * trigger: typedScreenActionRef('account-list-screen', 'delete')
   * trigger: typedScreenActionRef('form-screen', 'submit')
   * trigger: typedScreenActionRef('confirm-screen', 'cancel')
   * ```
   */
  trigger: ScreenActionRef;

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

  /**
   * ラベル（任意）
   *
   * 画面遷移図での表示用ラベルです。
   */
  label?: string;
};

/**
 * 画面遷移フロー
 *
 * 複数の画面とその遷移関係を定義します。
 * ユースケースの実現に必要な画面遷移の全体像を表現します。
 *
 * **設計原則:**
 * - 単一の真実の源: transitionsのみが画面遷移の定義
 * - DRY原則: screens, startScreen, endScreensは自動導出（screen-flow-utils.tsを参照）
 * - トレーサビリティ: 全ての画面フローは必ずユースケースに紐づく（必須）
 *
 * **導出可能な情報:**
 * - screens: transitionsから全画面IDを抽出
 * - startScreens: 入次数が0の画面（遷移の起点）
 * - endScreens: 出次数が0の画面（遷移の終点）
 *
 * **ユーティリティ関数:**
 * ```typescript
 * import { deriveScreenFlowMetadata } from 'omoikane-metamodel';
 *
 * const metadata = deriveScreenFlowMetadata(flow);
 * // metadata.screens: string[]
 * // metadata.startScreens: string[]
 * // metadata.endScreens: string[]
 * ```
 *
 * **命名規則:**
 * - ID: `{usecase-id}-flow` の形式を推奨
 * - 例: ユースケースID `user-registration` → フローID `user-registration-flow`
 */
export type ScreenFlow = DocumentBase & {
  /** 文書型識別子（固定値: 'screen-flow'） */
  type?: 'screen-flow';

  /**
   * 画面遷移
   *
   * 画面間の遷移関係を定義します。
   * これが唯一の真実の源（Single Source of Truth）です。
   *
   * **導出情報:**
   * - 含まれる画面: transitionsから全画面を抽出
   * - 開始画面: 入次数が0の画面
   * - 終了画面: 出次数が0の画面
   */
  transitions: ScreenTransition[];

  /**
   * 関連するユースケース（必須）
   *
   * この画面遷移フローが実現するユースケースを関連付けます。
   *
   * **設計判断:**
   * すべての画面フローは必ずビジネス目的（ユースケース）と紐づけます。
   * これにより以下のメリットが得られます：
   * - トレーサビリティ: 画面フローの存在理由が明確
   * - 変更影響分析: ユースケース変更時の影響範囲を特定可能
   * - 不要な画面の防止: ビジネス価値のない画面フローの作成を抑制
   *
   * **例:**
   * ```typescript
   * relatedUseCase: typedUseCaseRef('user-registration')
   * ```
   */
  relatedUseCase: Ref<UseCase>;
};
