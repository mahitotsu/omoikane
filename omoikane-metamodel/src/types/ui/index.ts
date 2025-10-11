/**
 * @fileoverview UI Layer - ユーザーインターフェース層
 *
 * **目的:**
 * 画面定義、画面遷移、バリデーションルールなどのUI要素を提供します。
 *
 * **主要な型:**
 * - ValidationRule: バリデーションルール（複数画面で再利用可能）
 * - Screen: 画面定義（入力フィールド、表示項目、アクション含む）
 * - ScreenFlow: 画面遷移フロー
 * - InputField: 入力フィールド
 * - DisplayField: 表示フィールド
 * - ScreenAction: 画面アクション
 *
 * **レイヤー構成における位置:**
 * ```
 * ┌─────────────────────────────────────────┐
 * │         Cross-Cutting Layer             │
 * ├─────────────────────────────────────────┤
 * │         UI Layer                        │ ← ここ
 * ├─────────────────────────────────────────┤
 * │         Functional Layer                │
 * ├─────────────────────────────────────────┤
 * │         Business Layer                  │
 * ├─────────────────────────────────────────┤
 * │         Foundation Layer                │
 * └─────────────────────────────────────────┘
 * ```
 *
 * **依存関係:**
 * - Foundation Layer: Ref<T>, DocumentBase
 * - Business Layer: BusinessRule
 * - Functional Layer: UseCase（ScreenFlowで参照）
 *
 * **使用例:**
 * ```typescript
 * import { Screen, ValidationRule, ScreenFlow } from './types/ui/index.js';
 *
 * // バリデーションルール定義
 * const emailValidation: ValidationRule = {
 *   id: 'validation-email-format',
 *   name: 'メールアドレス形式検証',
 *   ruleType: 'email',
 *   errorMessage: '有効なメールアドレスを入力してください',
 * };
 *
 * // 画面定義
 * const formScreen: Screen = {
 *   id: 'form-screen',
 *   name: 'フォーム画面',
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
 *   ]
 * };
 * ```
 *
 * @module types/ui
 */

// ============================================================================
// バリデーションルール
// ============================================================================

export type { ValidationRule, ValidationRuleType, ValidationTrigger } from './validation-rule.js';

// ============================================================================
// 画面定義
// ============================================================================

export type {
    DisplayField,
    DisplayFieldType,
    FieldType,
    InputField,
    Screen,
    ScreenAction,
    ScreenActionType,
    ScreenType,
    SelectOption
} from './screen.js';

// ============================================================================
// 画面遷移
// ============================================================================

export type { ScreenActionRef, ScreenFlow, ScreenTransition } from './screen-flow.js';

export {
    deriveEndScreens,
    deriveScreenFlowMetadata,
    deriveScreens,
    deriveStartScreens
} from './screen-flow-utils.js';
export type { ScreenFlowMetadata } from './screen-flow-utils.js';

