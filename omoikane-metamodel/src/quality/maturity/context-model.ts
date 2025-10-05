/**
 * コンテキスト対応評価モデル
 * 
 * プロジェクトのドメイン・開発段階・チーム規模などのコンテキストに基づいて
 * 評価基準の重みを動的に調整する
 */

import { MaturityDimension } from './maturity-model.js';

/**
 * プロジェクトドメイン
 */
export enum ProjectDomain {
  /** Eコマース */
  ECOMMERCE = 'ecommerce',
  
  /** 金融 */
  FINANCE = 'finance',
  
  /** 医療 */
  HEALTHCARE = 'healthcare',
  
  /** 製造 */
  MANUFACTURING = 'manufacturing',
  
  /** 教育 */
  EDUCATION = 'education',
  
  /** エンターテインメント */
  ENTERTAINMENT = 'entertainment',
  
  /** IoT・組み込み */
  IOT = 'iot',
  
  /** データ分析・AI */
  DATA_ANALYTICS = 'data_analytics',
  
  /** 汎用・その他 */
  GENERAL = 'general',
}

/**
 * 開発ステージ
 */
export enum DevelopmentStage {
  /** 概念実証（PoC） */
  POC = 'poc',
  
  /** MVP（Minimum Viable Product） */
  MVP = 'mvp',
  
  /** 初期開発 */
  EARLY_DEVELOPMENT = 'early_development',
  
  /** 本格開発 */
  ACTIVE_DEVELOPMENT = 'active_development',
  
  /** 保守運用 */
  MAINTENANCE = 'maintenance',
  
  /** レガシー移行 */
  LEGACY_MIGRATION = 'legacy_migration',
}

/**
 * チーム規模
 */
export enum TeamSize {
  /** 個人開発 */
  SOLO = 'solo',
  
  /** 小規模チーム（2-5人） */
  SMALL = 'small',
  
  /** 中規模チーム（6-15人） */
  MEDIUM = 'medium',
  
  /** 大規模チーム（16人以上） */
  LARGE = 'large',
}

/**
 * プロジェクトの重要度
 */
export enum ProjectCriticality {
  /** 実験的 */
  EXPERIMENTAL = 'experimental',
  
  /** 低重要度 */
  LOW = 'low',
  
  /** 中重要度 */
  MEDIUM = 'medium',
  
  /** 高重要度 */
  HIGH = 'high',
  
  /** ミッションクリティカル */
  MISSION_CRITICAL = 'mission_critical',
}

/**
 * プロジェクトコンテキスト
 */
export interface ProjectContext {
  /** プロジェクト名 */
  projectName?: string;
  
  /** ドメイン */
  domain: ProjectDomain;
  
  /** 開発ステージ */
  stage: DevelopmentStage;
  
  /** チーム規模 */
  teamSize: TeamSize;
  
  /** 重要度 */
  criticality: ProjectCriticality;
  
  /** カスタムタグ */
  tags?: string[];
}

/**
 * ディメンション重み調整
 */
export interface DimensionWeightAdjustment {
  /** 評価軸 */
  dimension: MaturityDimension;
  
  /** 重み係数（1.0が標準、1.5なら1.5倍の重要度） */
  weight: number;
  
  /** 調整理由 */
  rationale: string;
}

/**
 * コンテキスト別の評価ルール
 */
export interface ContextualEvaluationRule {
  /** ルールID */
  id: string;
  
  /** ルール名 */
  name: string;
  
  /** 適用条件 */
  condition: (context: ProjectContext) => boolean;
  
  /** ディメンション重み調整 */
  dimensionWeights: DimensionWeightAdjustment[];
  
  /** 必須基準の緩和（基準IDのリスト） */
  relaxedRequirements?: string[];
  
  /** 追加の必須基準（基準IDのリスト） */
  additionalRequirements?: string[];
  
  /** 説明 */
  description: string;
}

/**
 * コンテキスト適用結果
 */
export interface ContextApplicationResult {
  /** 適用されたコンテキスト */
  context: ProjectContext;
  
  /** 適用されたルール */
  appliedRules: ContextualEvaluationRule[];
  
  /** 最終的なディメンション重み */
  finalDimensionWeights: Map<MaturityDimension, number>;
  
  /** 適用された調整の説明 */
  adjustmentSummary: string[];
}

/**
 * ドメイン別の推奨コンテキスト
 */
export const DomainRecommendedFocus: Record<
  ProjectDomain,
  {
    dimensions: MaturityDimension[];
    description: string;
  }
> = {
  [ProjectDomain.ECOMMERCE]: {
    dimensions: [
      MaturityDimension.TESTABILITY,
      MaturityDimension.MAINTAINABILITY,
      MaturityDimension.DETAIL,
    ],
    description: 'Eコマースでは、頻繁な変更に対応するためテスト容易性と保守性が重要',
  },
  [ProjectDomain.FINANCE]: {
    dimensions: [
      MaturityDimension.TRACEABILITY,
      MaturityDimension.DETAIL,
      MaturityDimension.STRUCTURE,
    ],
    description: '金融では、規制対応のためトレーサビリティと詳細な仕様が必須',
  },
  [ProjectDomain.HEALTHCARE]: {
    dimensions: [
      MaturityDimension.TRACEABILITY,
      MaturityDimension.TESTABILITY,
      MaturityDimension.DETAIL,
    ],
    description: '医療では、安全性とコンプライアンスのため全ディメンションが重要',
  },
  [ProjectDomain.MANUFACTURING]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.TRACEABILITY,
      MaturityDimension.MAINTAINABILITY,
    ],
    description: '製造では、システムの安定性と長期保守性が重要',
  },
  [ProjectDomain.EDUCATION]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.DETAIL,
      MaturityDimension.MAINTAINABILITY,
    ],
    description: '教育では、明確な構造と保守のしやすさが重要',
  },
  [ProjectDomain.ENTERTAINMENT]: {
    dimensions: [
      MaturityDimension.MAINTAINABILITY,
      MaturityDimension.TESTABILITY,
      MaturityDimension.STRUCTURE,
    ],
    description: 'エンターテインメントでは、迅速な機能追加のため保守性が重要',
  },
  [ProjectDomain.IOT]: {
    dimensions: [
      MaturityDimension.TRACEABILITY,
      MaturityDimension.DETAIL,
      MaturityDimension.TESTABILITY,
    ],
    description: 'IoTでは、デバイス連携の追跡と詳細な仕様が重要',
  },
  [ProjectDomain.DATA_ANALYTICS]: {
    dimensions: [
      MaturityDimension.TRACEABILITY,
      MaturityDimension.DETAIL,
      MaturityDimension.STRUCTURE,
    ],
    description: 'データ分析では、データフローの追跡と詳細な定義が重要',
  },
  [ProjectDomain.GENERAL]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.DETAIL,
      MaturityDimension.MAINTAINABILITY,
    ],
    description: '汎用では、バランスの取れた全体的な品質が重要',
  },
};

/**
 * ステージ別の推奨コンテキスト
 */
export const StageRecommendedFocus: Record<
  DevelopmentStage,
  {
    dimensions: MaturityDimension[];
    minLevel: number;
    description: string;
  }
> = {
  [DevelopmentStage.POC]: {
    dimensions: [MaturityDimension.STRUCTURE],
    minLevel: 1,
    description: 'PoCでは基本構造の確立を優先、詳細は後回し可',
  },
  [DevelopmentStage.MVP]: {
    dimensions: [MaturityDimension.STRUCTURE, MaturityDimension.DETAIL],
    minLevel: 2,
    description: 'MVPでは構造と基本的な詳細度が必要',
  },
  [DevelopmentStage.EARLY_DEVELOPMENT]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.DETAIL,
      MaturityDimension.TRACEABILITY,
    ],
    minLevel: 2,
    description: '初期開発では、構造・詳細・トレーサビリティの確立が重要',
  },
  [DevelopmentStage.ACTIVE_DEVELOPMENT]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.DETAIL,
      MaturityDimension.TRACEABILITY,
      MaturityDimension.TESTABILITY,
    ],
    minLevel: 3,
    description: '本格開発では、テスト容易性を含む高い成熟度が必要',
  },
  [DevelopmentStage.MAINTENANCE]: {
    dimensions: [
      MaturityDimension.MAINTAINABILITY,
      MaturityDimension.TRACEABILITY,
      MaturityDimension.TESTABILITY,
    ],
    minLevel: 3,
    description: '保守運用では、保守性・トレーサビリティ・テスト容易性が最重要',
  },
  [DevelopmentStage.LEGACY_MIGRATION]: {
    dimensions: [
      MaturityDimension.TRACEABILITY,
      MaturityDimension.DETAIL,
      MaturityDimension.STRUCTURE,
    ],
    minLevel: 3,
    description: 'レガシー移行では、詳細な仕様とトレーサビリティが不可欠',
  },
};

/**
 * チーム規模別の推奨コンテキスト
 */
export const TeamSizeRecommendedFocus: Record<
  TeamSize,
  {
    dimensions: MaturityDimension[];
    description: string;
  }
> = {
  [TeamSize.SOLO]: {
    dimensions: [MaturityDimension.STRUCTURE, MaturityDimension.MAINTAINABILITY],
    description: '個人開発では、将来の自分のために明確な構造と保守性が重要',
  },
  [TeamSize.SMALL]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.DETAIL,
      MaturityDimension.MAINTAINABILITY,
    ],
    description: '小規模チームでは、コミュニケーション補助のため構造と詳細度が重要',
  },
  [TeamSize.MEDIUM]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.DETAIL,
      MaturityDimension.TRACEABILITY,
      MaturityDimension.MAINTAINABILITY,
    ],
    description: '中規模チームでは、チーム間連携のためトレーサビリティが追加で重要',
  },
  [TeamSize.LARGE]: {
    dimensions: [
      MaturityDimension.STRUCTURE,
      MaturityDimension.DETAIL,
      MaturityDimension.TRACEABILITY,
      MaturityDimension.TESTABILITY,
      MaturityDimension.MAINTAINABILITY,
    ],
    description: '大規模チームでは、全ディメンションの高い成熟度が必要',
  },
};

/**
 * 重要度別の推奨コンテキスト
 */
export const CriticalityRecommendedFocus: Record<
  ProjectCriticality,
  {
    minLevel: number;
    strictness: number;
    description: string;
  }
> = {
  [ProjectCriticality.EXPERIMENTAL]: {
    minLevel: 1,
    strictness: 0.5,
    description: '実験的プロジェクトでは、柔軟性を重視し厳密性は低め',
  },
  [ProjectCriticality.LOW]: {
    minLevel: 2,
    strictness: 0.7,
    description: '低重要度では、基本的な品質を確保',
  },
  [ProjectCriticality.MEDIUM]: {
    minLevel: 3,
    strictness: 1.0,
    description: '中重要度では、標準的な成熟度を要求',
  },
  [ProjectCriticality.HIGH]: {
    minLevel: 4,
    strictness: 1.3,
    description: '高重要度では、高い成熟度と厳密な評価が必要',
  },
  [ProjectCriticality.MISSION_CRITICAL]: {
    minLevel: 4,
    strictness: 1.5,
    description: 'ミッションクリティカルでは、最高レベルの成熟度が必須',
  },
};
