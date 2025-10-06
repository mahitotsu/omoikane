/**
 * @fileoverview コンテキスト対応評価モデル（Context-Aware Evaluation Model）
 * 
 * **目的:**
 * プロジェクトのドメイン、開発ステージ、チーム規模、クリティカリティなどの
 * コンテキスト情報をモデル化し、評価基準の動的調整を支援します。
 * 
 * **主要な型定義:**
 * 1. ProjectDomain: プロジェクトドメイン（9種類）
 * 2. DevelopmentStage: 開発ステージ（6種類）
 * 3. TeamSize: チーム規模（4種類）
 * 4. ProjectCriticality: プロジェクト重要度（5種類）
 * 5. ProjectContext: 統合コンテキスト情報
 * 6. ContextualEvaluationRule: コンテキスト対応評価ルール
 * 7. ContextApplicationResult: コンテキスト適用結果
 * 
 * **コンテキストの使用目的:**
 * - 評価基準の重み付け調整
 * - 推奨事項の優先順位付け
 * - アラート閾値の動的調整
 * - レポート内容のカスタマイズ
 * 
 * **拡張ポイント:**
 * - 新しいドメインを追加: ProjectDomainに列挙値を追加
 * - 新しいステージを追加: DevelopmentStageに列挙値を追加
 * - カスタムコンテキスト次元を追加: ProjectContextに新フィールド追加
 * 
 * @module quality/maturity/context-model
 */

import { MaturityDimension } from './maturity-model.js';

// ============================================================================
// プロジェクトドメイン（Project Domain）
// ============================================================================

/**
 * プロジェクトドメイン
 * 
 * **用途:**
 * プロジェクトが属する業界・分野を定義し、ドメイン固有の評価基準を適用します。
 * 
 * **各ドメインの特性:**
 * - ECOMMERCE: トランザクション整合性、在庫管理、決済セキュリティ
 * - FINANCE: 規制遵守、監査証跡、トレーサビリティ、正確性
 * - HEALTHCARE: 患者安全、プライバシー保護、規制遵守、監査証跡
 * - MANUFACTURING: 品質管理、トレーサビリティ、安全基準
 * - EDUCATION: アクセシビリティ、使いやすさ、コンテンツ管理
 * - ENTERTAINMENT: パフォーマンス、UX、スケーラビリティ
 * - IOT: 組み込み制約、リアルタイム性、省電力、通信効率
 * - DATA_ANALYTICS: データ品質、分析精度、スケーラビリティ
 * - GENERAL: 汎用的な評価基準
 * 
 * **拡張方法:**
 * 新しいドメインを追加する場合は、ここに列挙値を追加し、
 * context-engine.tsのBUILT_IN_RULESに対応するルールを追加します。
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

// ============================================================================
// 開発ステージ（Development Stage）
// ============================================================================

/**
 * 開発ステージ
 * 
 * **用途:**
 * プロジェクトの開発段階を定義し、ステージに応じた評価基準を適用します。
 * 
 * **各ステージの特性:**
 * - POC: 実証実験、最小限の文書化、柔軟性重視
 * - MVP: 市場検証、基本的な文書化、スピード重視
 * - EARLY_DEVELOPMENT: 初期開発、構造整備、設計の確立
 * - ACTIVE_DEVELOPMENT: 本格開発、完全な文書化、品質重視
 * - MAINTENANCE: 保守運用、安定性重視、変更管理
 * - LEGACY_MIGRATION: レガシー移行、トレーサビリティ重視、段階的移行
 * 
 * **拡張方法:**
 * 新しいステージを追加する場合は、ここに列挙値を追加し、
 * context-engine.tsのBUILT_IN_RULESに対応するルールを追加します。
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

// ============================================================================
// チーム規模（Team Size）
// ============================================================================

/**
 * チーム規模
 * 
 * **用途:**
 * チームの人数規模を定義し、規模に応じた評価基準を適用します。
 * 
 * **各規模の特性:**
 * - SOLO: 個人開発、柔軟性重視、最小限の文書化
 * - SMALL: 小規模チーム（2-5人）、コミュニケーション容易、軽量な文書化
 * - MEDIUM: 中規模チーム（6-15人）、役割分担、標準的な文書化
 * - LARGE: 大規模チーム（16人以上）、厳格な文書化、プロセス重視
 * 
 * **拡張方法:**
 * 新しい規模を追加する場合は、ここに列挙値を追加し、
 * context-engine.tsのBUILT_IN_RULESに対応するルールを追加します。
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

// ============================================================================
// プロジェクトクリティカリティ（Project Criticality）
// ============================================================================

/**
 * プロジェクトの重要度
 * 
 * **用途:**
 * プロジェクトのビジネス上の重要度を定義し、重要度に応じた評価基準を適用します。
 * 
 * **各重要度の特性:**
 * - EXPERIMENTAL: 実験的、最小限の要件、高い柔軟性
 * - LOW: 低重要度、基本的な要件、適度な柔軟性
 * - MEDIUM: 中重要度、標準的な要件、バランス
 * - HIGH: 高重要度、厳格な要件、品質重視
 * - MISSION_CRITICAL: ミッションクリティカル、最高水準の要件、可用性・信頼性最優先
 * 
 * **拡張方法:**
 * 新しい重要度を追加する場合は、ここに列挙値を追加し、
 * context-engine.tsのBUILT_IN_RULESに対応するルールを追加します。
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

// ============================================================================
// プロジェクトコンテキスト（Project Context）
// ============================================================================

/**
 * プロジェクトコンテキスト
 * 
 * **用途:**
 * プロジェクトの包括的なコンテキスト情報を保持し、評価基準の動的調整に使用します。
 * 
 * **構成:**
 * - projectName: プロジェクト名（オプション）
 * - domain: プロジェクトドメイン（必須）
 * - stage: 開発ステージ（必須）
 * - teamSize: チーム規模（必須）
 * - criticality: プロジェクト重要度（必須）
 * - tags: カスタムタグ（オプション、推論に使用）
 * 
 * **使用例:**
 * ```typescript
 * const context: ProjectContext = {
 *   projectName: 'Omoikane EC Site',
 *   domain: ProjectDomain.ECOMMERCE,
 *   stage: DevelopmentStage.ACTIVE_DEVELOPMENT,
 *   teamSize: TeamSize.MEDIUM,
 *   criticality: ProjectCriticality.HIGH,
 *   tags: ['b2c', 'mobile', 'international']
 * };
 * ```
 * 
 * **拡張方法:**
 * 新しいコンテキスト次元を追加する場合は、ここにフィールドを追加し、
 * context-engine.tsでその次元を処理するロジックを追加します。
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

// ============================================================================
// ディメンション重み調整（Dimension Weight Adjustment）
// ============================================================================

/**
 * ディメンション重み調整
 * 
 * **用途:**
 * 成熟度評価の各次元の重み係数を調整します。
 * 
 * **重み係数の意味:**
 * - 1.0: 標準の重要度
 * - 1.5: 1.5倍の重要度（強調）
 * - 0.5: 0.5倍の重要度（緩和）
 * 
 * **使用例:**
 * ```typescript
 * const adjustment: DimensionWeightAdjustment = {
 *   dimension: MaturityDimension.TRACEABILITY,
 *   weight: 1.5,
 *   rationale: '金融規制対応のためトレーサビリティが最重要'
 * };
 * ```
 */
export interface DimensionWeightAdjustment {
  /** 評価軸 */
  dimension: MaturityDimension;
  
  /** 重み係数（1.0が標準、1.5なら1.5倍の重要度） */
  weight: number;
  
  /** 調整理由 */
  rationale: string;
}

// ============================================================================
// コンテキスト別評価ルール（Contextual Evaluation Rule）
// ============================================================================

/**
 * コンテキスト別の評価ルール
 * 
 * **用途:**
 * プロジェクトコンテキストに応じて評価基準を動的に調整するルールを定義します。
 * 
 * **構成:**
 * - id: ルール一意識別子
 * - name: ルール名
 * - condition: 適用条件（ProjectContextを受け取り、booleanを返す）
 * - dimensionWeights: 次元重み調整の配列
 * - relaxedRequirements: 緩和する基準ID（オプション）
 * - stricterRequirements: 厳格化する基準ID（オプション）
 * - recommendedFocus: 推奨フォーカス（オプション）
 * - description: ルール説明（オプション）
 * 
 * **使用例:**
 * ```typescript
 * const rule: ContextualEvaluationRule = {
 *   id: 'domain-finance-strict',
 *   name: '金融ドメイン: 厳格な要件',
 *   condition: (ctx) => ctx.domain === ProjectDomain.FINANCE,
 *   dimensionWeights: [
 *     { dimension: MaturityDimension.TRACEABILITY, weight: 1.5, rationale: '規制対応' }
 *   ],
 *   recommendedFocus: ['audit_trail', 'compliance', 'accuracy'],
 *   description: '金融規制に準拠した厳格な評価基準'
 * };
 * ```
 * 
 * **拡張方法:**
 * - 新しいルールをBUILT_IN_RULESに追加
 * - conditionで複雑な条件を記述可能（複数次元の組み合わせ）
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
