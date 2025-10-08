/**
 * @fileoverview バリデーションルール定義
 * 
 * **目的:**
 * 画面入力のバリデーションルールを定義します。
 * 複数画面で再利用可能な独立した型として設計されています。
 * 
 * **主要機能:**
 * 1. 標準的なバリデーションルール（必須、長さ、パターン等）
 * 2. ビジネスルールとの連携
 * 3. サーバーサイド検証の指定
 * 
 * **使用例:**
 * ```typescript
 * const emailValidation: ValidationRule = {
 *   id: 'validation-email-format',
 *   name: 'メールアドレス形式検証',
 *   description: '有効なメールアドレス形式であることを検証',
 *   ruleType: 'email',
 *   errorMessage: '有効なメールアドレスを入力してください',
 * };
 * ```
 * 
 * @module types/ui/validation-rule
 */

import type { BusinessRule } from '../business/requirements.js';
import type { DocumentBase } from '../foundation/identifiable.js';
import type { Ref } from '../foundation/reference.js';

/**
 * バリデーションルールの種類
 */
export type ValidationRuleType =
  | 'required' // 必須入力
  | 'minLength' // 最小文字数
  | 'maxLength' // 最大文字数
  | 'pattern' // 正規表現パターン
  | 'min' // 最小値（数値）
  | 'max' // 最大値（数値）
  | 'email' // メールアドレス形式
  | 'tel' // 電話番号形式
  | 'url' // URL形式
  | 'date' // 日付形式
  | 'custom' // カスタムルール
  | 'businessRule'; // ビジネスルール連携

/**
 * バリデーショントリガーイベント
 * 
 * いつバリデーションを実行するかを指定します。
 */
export type ValidationTrigger =
  | 'blur' // フォーカス離脱時
  | 'change' // 値変更時
  | 'submit' // フォーム送信時
  | 'mount'; // マウント時（初期表示時）

/**
 * バリデーションルール
 * 
 * 画面入力のバリデーションルールを定義します。
 * 複数の画面・フィールドで再利用可能です。
 * 
 * **設計原則:**
 * - 独立性: 画面定義から独立し、再利用可能
 * - ビジネスルール連携: 必要に応じてビジネスルールと関連付け
 * - サーバー検証: クライアント側だけでなくサーバー側検証も考慮
 */
export type ValidationRule = DocumentBase & {
  /** 文書型識別子（固定値: 'validation-rule'） */
  type?: 'validation-rule';
  
  /** ルールの種類 */
  ruleType: ValidationRuleType;

  /**
   * ルールのパラメータ
   * 
   * 例:
   * - minLength: { length: 5 }
   * - pattern: { pattern: "^[0-9]+$" }
   * - min: { value: 0 }
   * - max: { value: 100 }
   */
  parameters?: Record<string, unknown>;

  /** エラーメッセージ */
  errorMessage: string;

  /** 警告レベルのメッセージ（任意） */
  warningMessage?: string;

  /**
   * 関連するビジネスルール（任意）
   * 
   * バリデーションルールがビジネスルールに基づく場合に設定します。
   * 例: 予約可能期間の制限、重複予約チェック等
   */
  relatedBusinessRule?: Ref<BusinessRule>;

  /**
   * サーバーサイド検証も必要か
   * 
   * true の場合、クライアント側だけでなくサーバー側でも検証を行います。
   * セキュリティ上重要な検証や、データベース参照が必要な検証に設定します。
   */
  requiresServerValidation?: boolean;

  /**
   * バリデーション実行タイミング
   * 
   * いつバリデーションを実行するかを指定します。
   * 複数指定可能です。
   * 
   * 例:
   * - ['blur', 'submit']: フォーカス離脱時とフォーム送信時
   * - ['change']: 値変更ごとにリアルタイム検証
   */
  validateOn?: ValidationTrigger[];
};
