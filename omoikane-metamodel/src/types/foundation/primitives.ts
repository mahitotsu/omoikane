/**
 * @fileoverview 基本的な型定義（プリミティブ）（Foundation Primitives）
 *
 * **目的:**
 * 全てのレイヤーから参照可能な基礎的な型を定義します。
 * プロジェクト全体で共通利用される汎用的なデータ型を提供します。
 *
 * **型定義:**
 * 1. PriorityLevel: 優先度レベル（high, medium, low）
 * 2. Metadata: メタデータ（作成・更新履歴）
 * 3. DateRange: 日付範囲
 * 4. QualityLevel: 品質レベル（good, warning, critical）
 * 5. SeverityLevel: 深刻度レベル（critical, warning, info）
 *
 * **設計原則:**
 * - 汎用性: 特定のドメインに依存しない
 * - シンプル性: 最小限の構造
 * - 拡張性: カスタムメタデータで拡張可能
 *
 * **使用例:**
 * ```typescript
 * const metadata: Metadata = {
 *   createdAt: '2024-01-01T00:00:00Z',
 *   createdBy: 'user@example.com',
 *   version: '1.0.0',
 *   tags: ['v1', 'production']
 * };
 *
 * const priority: PriorityLevel = 'high';
 * const quality: QualityLevel = 'good';
 * ```
 *
 * @module types/foundation/primitives
 */

/**
 * 優先度レベル
 *
 * **用途:**
 * タスク、要件、推奨アクションなどの優先度を表現します。
 *
 * **レベル定義:**
 * - high: 高優先度（即座に対応が必要）
 * - medium: 中優先度（計画的に対応）
 * - low: 低優先度（余裕があれば対応）
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * メタデータ
 *
 * **用途:**
 * 文書やデータの作成・更新履歴、バージョン情報を記録します。
 *
 * **構成:**
 * - createdAt: 作成日時（ISO 8601形式）
 * - createdBy: 作成者（メールアドレスやユーザーID）
 * - updatedAt: 最終更新日時（ISO 8601形式）
 * - updatedBy: 最終更新者（メールアドレスやユーザーID）
 * - version: バージョン（セマンティックバージョニング推奨）
 * - tags: タグ（分類、検索用）
 * - custom: カスタムメタデータ（任意のキー・バリュー）
 *
 * **使用例:**
 * ```typescript
 * const metadata: Metadata = {
 *   createdAt: '2024-01-01T00:00:00Z',
 *   createdBy: 'alice@example.com',
 *   updatedAt: '2024-01-15T10:30:00Z',
 *   updatedBy: 'bob@example.com',
 *   version: '1.2.0',
 *   tags: ['stable', 'production'],
 *   custom: { department: 'engineering', project: 'omoikane' }
 * };
 * ```
 */
export interface Metadata {
  /** 作成日時 */
  createdAt?: string;

  /** 作成者 */
  createdBy?: string;

  /** 最終更新日時 */
  updatedAt?: string;

  /** 最終更新者 */
  updatedBy?: string;

  /** バージョン */
  version?: string;

  /** タグ */
  tags?: string[];

  /** カスタムメタデータ */
  custom?: Record<string, unknown>;
}

/**
 * 日付範囲
 *
 * **用途:**
 * 開始日と終了日（オプション）で期間を表現します。
 *
 * **構成:**
 * - start: 開始日（ISO 8601形式、必須）
 * - end: 終了日（ISO 8601形式、オプション、未定の場合は省略可）
 *
 * **使用例:**
 * ```typescript
 * const projectPeriod: DateRange = {
 *   start: '2024-01-01',
 *   end: '2024-12-31'
 * };
 *
 * const ongoingProject: DateRange = {
 *   start: '2024-01-01'
 *   // endを省略 = 進行中
 * };
 * ```
 */
export interface DateRange {
  start: string;
  end?: string;
}

/**
 * 品質レベル
 *
 * **用途:**
 * データや文書の品質状態を3段階で表現します。
 *
 * **レベル定義:**
 * - good: 良好（基準を満たしている）
 * - warning: 警告（改善が望ましい）
 * - critical: 致命的（即座に対応が必要）
 */
export type QualityLevel = 'good' | 'warning' | 'critical';

/**
 * 深刻度レベル
 *
 * **用途:**
 * 問題や通知の深刻度を3段階で表現します。
 *
 * **レベル定義:**
 * - critical: 致命的（システムやビジネスに重大な影響）
 * - warning: 警告（注意が必要、影響は中程度）
 * - info: 情報（参考情報、影響は軽微）
 */
export type SeverityLevel = 'critical' | 'warning' | 'info';
