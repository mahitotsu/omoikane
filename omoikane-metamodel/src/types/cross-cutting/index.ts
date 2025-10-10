/**
 * @fileoverview Cross-Cutting レイヤー統合エクスポート
 *
 * **目的:**
 * 複数のレイヤーにまたがる横断的関心事に関する型定義を統合してエクスポートします。
 * トレーサビリティ管理など、プロジェクト全体に影響する機能を提供します。
 *
 * **提供機能:**
 * 1. RelationType: 関係タイプ列挙型
 * 2. DocumentRelationship: 文書間の関係
 * 3. TraceabilityMatrix: トレーサビリティマトリクス
 * 4. TraceabilityValidation: トレーサビリティ検証結果
 * 5. TraceabilityIssue: トレーサビリティの問題
 * 6. TraceabilityAnalysis: トレーサビリティ分析結果
 *
 * **モジュール構成:**
 * - traceability.ts: トレーサビリティ管理型
 *
 * **使用例:**
 * ```typescript
 * import {
 *   RelationType,
 *   DocumentRelationship,
 *   TraceabilityMatrix
 * } from './cross-cutting/index.js';
 *
 * const relationship: DocumentRelationship = {
 *   type: RelationType.IMPLEMENTS,
 *   source: { id: 'uc-001', displayName: 'ログイン' },
 *   target: { id: 'req-001', displayName: 'ユーザー認証要件' }
 * };
 *
 * const matrix: TraceabilityMatrix = {
 *   id: 'tm-001',
 *   name: 'プロジェクトトレーサビリティ',
 *   relationships: [relationship]
 * };
 * ```
 *
 * @module types/cross-cutting
 */

export { RelationType } from './traceability.js';

export type {
  DocumentRelationship,
  TraceabilityAnalysis,
  TraceabilityIssue,
  TraceabilityMatrix,
  TraceabilityValidation,
} from './traceability.js';
