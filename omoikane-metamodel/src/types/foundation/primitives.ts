/**
 * 基本的な型定義（プリミティブ）
 * 全てのレイヤーから参照可能な基礎的な型
 */

/**
 * 優先度レベル
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * メタデータ
 * 文書の作成・更新履歴を記録
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
 */
export interface DateRange {
  start: string;
  end?: string;
}

/**
 * 品質レベル
 */
export type QualityLevel = 'good' | 'warning' | 'critical';

/**
 * 深刻度レベル
 */
export type SeverityLevel = 'critical' | 'warning' | 'info';
