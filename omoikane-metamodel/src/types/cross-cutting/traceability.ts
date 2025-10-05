/**
 * トレーサビリティ管理
 * 文書間の関係性を追跡するための型定義
 */

import type { Ref } from '../foundation/index.js';

/**
 * 関係タイプ
 * 文書間の関係性の種類を定義
 */
export enum RelationType {
  /** 実装する（ユースケース → 要件） */
  IMPLEMENTS = 'implements',
  
  /** 依存する */
  DEPENDS_ON = 'depends-on',
  
  /** 派生する */
  DERIVED_FROM = 'derived-from',
  
  /** 参照する */
  REFERENCES = 'references',
  
  /** 検証する */
  VERIFIES = 'verifies',
  
  /** 置換する */
  SUPERSEDES = 'supersedes',
  
  /** 関連する */
  RELATES_TO = 'relates-to',
}

/**
 * 型付き文書関係
 * 2つの文書間の明示的な関係を表現
 * 
 * @template TSource - 関係元の文書型
 * @template TTarget - 関係先の文書型
 */
export interface DocumentRelationship<TSource = unknown, TTarget = unknown> {
  /** 関係タイプ */
  type: RelationType;
  
  /** 関係元文書への参照 */
  source: Ref<TSource>;
  
  /** 関係先文書への参照 */
  target: Ref<TTarget>;
  
  /** 関係の説明 */
  description?: string;
  
  /** 関係の強度（オプション） */
  strength?: 'strong' | 'weak';
}

/**
 * トレーサビリティマトリックス
 * 複数の文書間の関係性を一覧管理
 */
export interface TraceabilityMatrix {
  /** マトリックスID */
  id: string;
  
  /** マトリックス名 */
  name: string;
  
  /** 説明 */
  description?: string;
  
  /** 関係のリスト */
  relationships: DocumentRelationship[];
  
  /** 作成日時 */
  createdAt?: string;
  
  /** 最終更新日時 */
  updatedAt?: string;
}

/**
 * トレーサビリティ検証結果
 */
export interface TraceabilityValidation {
  /** 検証対象の文書ID */
  documentId: string;
  
  /** 検証が成功したか */
  isValid: boolean;
  
  /** 問題のリスト */
  issues: TraceabilityIssue[];
}

/**
 * トレーサビリティの問題
 */
export interface TraceabilityIssue {
  /** 問題のタイプ */
  type: 'missing-reference' | 'broken-link' | 'circular-dependency' | 'orphaned-document';
  
  /** 問題の説明 */
  message: string;
  
  /** 関連する参照（ある場合） */
  reference?: Ref<unknown>;
}

/**
 * トレーサビリティ分析結果
 * 文書間の関係性の統計情報
 */
export interface TraceabilityAnalysis {
  /** 総文書数 */
  totalDocuments: number;
  
  /** 総関係数 */
  totalRelationships: number;
  
  /** 関係タイプ別の統計 */
  relationshipsByType: Record<RelationType, number>;
  
  /** 孤立文書のリスト */
  orphanedDocuments: Ref<unknown>[];
  
  /** カバレッジパーセンテージ */
  coveragePercentage: number;
}
