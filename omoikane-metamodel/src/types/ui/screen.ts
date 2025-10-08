/**
 * @fileoverview 画面定義
 * 
 * **目的:**
 * ユーザーインターフェースの画面構造を定義します。
 * 入力フィールド、表示項目、アクション等を含む画面の完全な定義を提供します。
 * 
 * **主要機能:**
 * 1. 画面タイプの分類（フォーム、一覧、詳細等）
 * 2. 入力フィールドの定義（インライン定義）
 * 3. 表示項目の定義
 * 4. 画面アクション（ボタン等）の定義
 * 5. バリデーションルールとの関連付け（参照）
 * 
 * **設計原則:**
 * - 凝集度: 入力フィールドは画面定義内にインライン定義
 * - 再利用: バリデーションルールは参照で再利用
 * - 段階的詳細化: 最小限から詳細まで段階的に定義可能
 * 
 * **使用例:**
 * ```typescript
 * const reservationFormScreen: Screen = {
 *   id: 'reservation-form-screen',
 *   name: '予約フォーム画面',
 *   description: '来店予約の入力フォーム',
 *   screenType: 'form',
 *   inputFields: [
 *     {
 *       id: 'email',
 *       name: 'email',
 *       label: 'メールアドレス',
 *       fieldType: 'email',
 *       required: true,
 *       validationRules: [{ id: 'validation-email-format' }]
 *     }
 *   ],
 *   actions: [
 *     {
 *       id: 'submit',
 *       label: '予約を確定する',
 *       actionType: 'submit',
 *       isPrimary: true
 *     }
 *   ]
 * };
 * ```
 * 
 * @module types/ui/screen
 */

import type { BusinessRule } from '../business/requirements.js';
import type { DocumentBase } from '../foundation/identifiable.js';
import type { Ref } from '../foundation/reference.js';
import type { ValidationRule } from './validation-rule.js';

/**
 * 画面タイプ
 */
export type ScreenType =
  | 'form' // 入力フォーム
  | 'list' // 一覧画面
  | 'detail' // 詳細表示
  | 'confirmation' // 確認画面
  | 'dashboard' // ダッシュボード
  | 'dialog'; // ダイアログ

/**
 * フィールドタイプ
 * 
 * HTML5の標準的な入力タイプに対応します。
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'hidden';

/**
 * 選択肢
 * 
 * select, radio, checkboxタイプのフィールドで使用します。
 */
export type SelectOption = {
  /** 選択肢の値 */
  value: string;

  /** 選択肢の表示ラベル */
  label: string;

  /** 選択不可にするか */
  disabled?: boolean;
};

/**
 * 入力フィールド
 * 
 * 画面内の入力フィールドを定義します。
 * 画面定義内にインライン定義されます。
 * 
 * **設計判断:**
 * - 入力フィールドは画面に属するため、画面定義内に配置
 * - 型定義は共通化し、インスタンスは画面ごとに定義
 * - バリデーションルールは参照で再利用
 */
export type InputField = {
  /** フィールドID（画面内で一意） */
  id: string;

  /** フィールド名（HTML name属性） */
  name: string;

  /** 表示ラベル */
  label: string;

  /** フィールドタイプ */
  fieldType: FieldType;

  /** 必須入力か */
  required: boolean;

  /** プレースホルダー */
  placeholder?: string;

  /** ヘルプテキスト */
  helpText?: string;

  /**
   * バリデーションルール（参照）
   * 
   * 複数画面で再利用可能なバリデーションルールを参照します。
   */
  validationRules?: Ref<ValidationRule>[];

  /** デフォルト値 */
  defaultValue?: string;

  /** 選択肢（select, radio, checkboxの場合） */
  options?: SelectOption[];

  /** 読み取り専用か */
  readonly?: boolean;

  /** 非表示か */
  hidden?: boolean;
};

/**
 * 表示フィールドのデータ型
 */
export type DisplayFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'list'
  | 'object'
  | 'link';

/**
 * 表示フィールド
 * 
 * 確認画面や詳細画面で使用する表示専用のフィールドです。
 */
export type DisplayField = {
  /** フィールドID */
  id: string;

  /** フィールド名 */
  name: string;

  /** 表示ラベル */
  label: string;

  /** データ型 */
  dataType: DisplayFieldType;

  /** 表示フォーマット（例: "YYYY-MM-DD", "#,##0"） */
  format?: string;

  /** リンク先（dataType='link'の場合） */
  linkTo?: string;
};

/**
 * 画面アクションのタイプ
 */
export type ScreenActionType =
  | 'submit' // 送信
  | 'cancel' // キャンセル
  | 'navigate' // 画面遷移
  | 'delete' // 削除
  | 'download' // ダウンロード
  | 'custom'; // カスタムアクション

/**
 * 画面アクション
 * 
 * ボタンやリンク等、ユーザーが実行できるアクションを定義します。
 */
export type ScreenAction = {
  /** アクションID */
  id: string;

  /** ボタンラベル */
  label: string;

  /** アクションタイプ */
  actionType: ScreenActionType;

  /** 遷移先画面 */
  targetScreen?: Ref<Screen>;

  /** 確認メッセージ表示が必要か */
  confirmationRequired?: boolean;

  /** 確認メッセージ */
  confirmationMessage?: string;

  /** プライマリボタンか（主要アクション） */
  isPrimary?: boolean;
};

/**
 * 画面定義
 * 
 * ユーザーインターフェースの画面構造を定義します。
 * 
 * **設計原則:**
 * - 凝集度: 入力フィールドは画面定義内に配置
 * - 再利用: バリデーションルールは参照
 * - トレーサビリティ: ビジネスルールとの関連付け
 * 
 * **関連性:**
 * - UseCaseStep.screen で参照される
 * - ScreenFlow で画面遷移を定義
 */
export type Screen = DocumentBase & {
  /** 文書型識別子（固定値: 'screen'） */
  type?: 'screen';
  
  /** 画面タイプ */
  screenType: ScreenType;

  /** 入力フィールド（インライン定義） */
  inputFields?: InputField[];

  /** 表示項目 */
  displayFields?: DisplayField[];

  /** アクション（ボタン等） */
  actions?: ScreenAction[];

  /**
   * 関連するビジネスルール
   * 
   * この画面で適用されるビジネスルールを関連付けます。
   */
  businessRules?: Ref<BusinessRule>[];

  /**
   * アクセス権限
   * 
   * この画面にアクセスするために必要な権限を指定します。
   */
  requiredPermissions?: string[];
};
