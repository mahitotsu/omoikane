/**
 * AI Agent推奨エンジン v2.0
 * 
 * 成熟度評価・コンテキスト・依存関係分析を統合した
 * 高度な推奨アクション生成システム
 */

import type {
    Actor,
    BusinessRequirementDefinition,
    UseCase,
} from '../../types/index.js';
import type {
    ProjectContext
} from './context-model.js';
import type {
    GraphAnalysisResult
} from './dependency-graph-model.js';
import type {
    MaturityLevel,
    ProjectMaturityAssessment
} from './maturity-model.js';

/**
 * 推奨の優先度
 */
export enum RecommendationPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * 推奨のカテゴリー
 */
export enum RecommendationCategory {
  STRUCTURE = 'structure',
  DETAIL = 'detail',
  TRACEABILITY = 'traceability',
  TESTABILITY = 'testability',
  MAINTAINABILITY = 'maintainability',
  ARCHITECTURE = 'architecture',
  QUALITY = 'quality',
}

/**
 * 実行可能なアクション
 */
export interface ExecutableAction {
  /** アクションID */
  id: string;
  
  /** アクション名 */
  name: string;
  
  /** 実行コマンド（AIが実行できる形式） */
  command?: string;
  
  /** パラメータ */
  parameters?: Record<string, unknown>;
  
  /** 期待される結果 */
  expectedOutcome: string;
}

/**
 * 構造化推奨
 */
export interface StructuredRecommendation {
  /** 推奨ID */
  id: string;
  
  /** タイトル */
  title: string;
  
  /** 優先度 */
  priority: RecommendationPriority;
  
  /** カテゴリー */
  category: RecommendationCategory;
  
  /** 問題の説明 */
  problem: string;
  
  /** 影響範囲 */
  impact: {
    scope: 'element' | 'module' | 'project';
    affectedElements: string[];
    severity: 'high' | 'medium' | 'low';
  };
  
  /** 解決策 */
  solution: {
    description: string;
    steps: string[];
    executables?: ExecutableAction[];
  };
  
  /** 期待される効果 */
  benefits: string[];
  
  /** 推定工数 */
  effort: {
    hours: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  
  /** 前提条件 */
  prerequisites?: string[];
  
  /** リスク */
  risks?: string[];
  
  /** 関連リソース */
  references?: Array<{
    title: string;
    url?: string;
  }>;
  
  /** 根拠 */
  rationale: {
    maturityGap?: string;
    contextReason?: string;
    dependencyIssue?: string;
    bestPractice?: string;
  };
}

/**
 * 推奨バンドル（関連する推奨のグループ）
 */
export interface RecommendationBundle {
  /** バンドルID */
  id: string;
  
  /** バンドル名 */
  name: string;
  
  /** 説明 */
  description: string;
  
  /** バンドルに含まれる推奨 */
  recommendations: StructuredRecommendation[];
  
  /** 実行順序 */
  executionOrder: string[];
  
  /** 総工数見積もり */
  totalEffort: number;
  
  /** 期待される成熟度向上 */
  expectedMaturityImprovement: {
    currentLevel: MaturityLevel;
    targetLevel: MaturityLevel;
  };
}

/**
 * AIエージェント推奨結果
 */
export interface AIAgentRecommendations {
  /** 生成日時 */
  timestamp: string;
  
  /** プロジェクトコンテキスト */
  context?: ProjectContext;
  
  /** 全推奨リスト */
  recommendations: StructuredRecommendation[];
  
  /** 優先推奨（Top N） */
  topPriority: StructuredRecommendation[];
  
  /** 推奨バンドル */
  bundles: RecommendationBundle[];
  
  /** クイックウィン（すぐに実行できる改善） */
  quickWins: StructuredRecommendation[];
  
  /** 長期戦略推奨 */
  longTermStrategy: StructuredRecommendation[];
  
  /** サマリー */
  summary: {
    totalRecommendations: number;
    criticalCount: number;
    highPriorityCount: number;
    estimatedTotalHours: number;
    expectedMaturityIncrease: number;
  };
}

/**
 * 推奨生成オプション
 */
export interface RecommendationOptions {
  /** 推奨の最大数 */
  maxRecommendations?: number;
  
  /** 最小優先度 */
  minPriority?: RecommendationPriority;
  
  /** カテゴリーフィルター */
  categories?: RecommendationCategory[];
  
  /** 実行可能なアクションのみ */
  executableOnly?: boolean;
  
  /** 工数上限（時間） */
  maxEffortHours?: number;
  
  /** バンドル生成を有効化 */
  generateBundles?: boolean;
}

/**
 * テンプレート型推奨（v2）
 */
export interface AIRecommendationTemplate {
  /** テンプレートID */
  id: string;
  
  /** 適用条件 */
  condition: (data: {
    maturity?: ProjectMaturityAssessment;
    context?: ProjectContext;
    graph?: GraphAnalysisResult;
    requirements?: BusinessRequirementDefinition[];
    actors?: Actor[];
    useCases?: UseCase[];
  }) => boolean;
  
  /** 推奨生成関数 */
  generate: (data: {
    maturity?: ProjectMaturityAssessment;
    context?: ProjectContext;
    graph?: GraphAnalysisResult;
    requirements?: BusinessRequirementDefinition[];
    actors?: Actor[];
    useCases?: UseCase[];
  }) => StructuredRecommendation[];
}

/**
 * 推奨の実行結果
 */
export interface RecommendationExecutionResult {
  /** 推奨ID */
  recommendationId: string;
  
  /** 実行ステータス */
  status: 'success' | 'partial' | 'failed';
  
  /** 実行されたアクション */
  executedActions: string[];
  
  /** 実際の工数（時間） */
  actualEffort: number;
  
  /** 成熟度の変化 */
  maturityChange?: {
    before: MaturityLevel;
    after: MaturityLevel;
  };
  
  /** 実行ログ */
  log: string[];
  
  /** エラー */
  errors?: string[];
}

/**
 * AI学習用フィードバック
 */
export interface RecommendationFeedback {
  /** 推奨ID */
  recommendationId: string;
  
  /** 有用性評価（1-5） */
  usefulness: number;
  
  /** 実行難易度（1-5） */
  difficulty: number;
  
  /** 効果評価（1-5） */
  effectiveness: number;
  
  /** コメント */
  comments?: string;
  
  /** 実行した/しない理由 */
  decision: 'executed' | 'deferred' | 'rejected';
  
  /** フィードバック日時 */
  timestamp: string;
}

/**
 * 推奨トレンド分析
 */
export interface RecommendationTrends {
  /** 期間 */
  period: {
    start: string;
    end: string;
  };
  
  /** 生成された推奨総数 */
  totalGenerated: number;
  
  /** 実行された推奨数 */
  totalExecuted: number;
  
  /** 実行率 */
  executionRate: number;
  
  /** カテゴリー別統計 */
  byCategory: Map<RecommendationCategory, {
    generated: number;
    executed: number;
    avgEffectiveness: number;
  }>;
  
  /** 優先度別統計 */
  byPriority: Map<RecommendationPriority, {
    generated: number;
    executed: number;
  }>;
  
  /** 平均実行時間 */
  avgExecutionTime: number;
  
  /** トップ推奨テンプレート */
  topTemplates: Array<{
    templateId: string;
    usageCount: number;
    avgEffectiveness: number;
  }>;
}
