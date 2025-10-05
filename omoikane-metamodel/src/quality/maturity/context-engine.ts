/**
 * コンテキスト対応評価エンジン
 * 
 * プロジェクトコンテキストに基づいて評価ルールを動的に適用
 */

import type {
    ContextApplicationResult,
    ContextualEvaluationRule,
    ProjectContext
} from './context-model.js';
import {
    CriticalityRecommendedFocus,
    DevelopmentStage,
    DomainRecommendedFocus,
    ProjectCriticality,
    ProjectDomain,
    StageRecommendedFocus,
    TeamSize,
    TeamSizeRecommendedFocus,
} from './context-model.js';
import { MaturityDimension } from './maturity-model.js';

/**
 * 組み込みコンテキストルール
 */
const BUILT_IN_RULES: ContextualEvaluationRule[] = [
  // ドメイン別ルール
  {
    id: 'domain-finance-strict',
    name: '金融ドメイン: 厳格な要件',
    condition: (ctx) => ctx.domain === ProjectDomain.FINANCE,
    dimensionWeights: [
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 1.5,
        rationale: '金融規制対応のためトレーサビリティが最重要',
      },
      {
        dimension: MaturityDimension.DETAIL,
        weight: 1.3,
        rationale: '詳細な仕様書が監査で必要',
      },
    ],
    description: '金融ドメインでは規制対応のため高い成熟度が必要',
  },
  {
    id: 'domain-healthcare-comprehensive',
    name: '医療ドメイン: 包括的要件',
    condition: (ctx) => ctx.domain === ProjectDomain.HEALTHCARE,
    dimensionWeights: [
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 1.5,
        rationale: '医療安全のため全変更を追跡',
      },
      {
        dimension: MaturityDimension.TESTABILITY,
        weight: 1.4,
        rationale: '患者安全のため徹底的なテストが必要',
      },
      {
        dimension: MaturityDimension.DETAIL,
        weight: 1.3,
        rationale: '医療機器規制対応',
      },
    ],
    description: '医療ドメインでは安全性とコンプライアンスが最重要',
  },
  {
    id: 'domain-ecommerce-agile',
    name: 'Eコマースドメイン: アジャイル対応',
    condition: (ctx) => ctx.domain === ProjectDomain.ECOMMERCE,
    dimensionWeights: [
      {
        dimension: MaturityDimension.TESTABILITY,
        weight: 1.3,
        rationale: '頻繁な変更に対応するため自動テストが重要',
      },
      {
        dimension: MaturityDimension.MAINTAINABILITY,
        weight: 1.2,
        rationale: '迅速な機能追加のため保守性が重要',
      },
    ],
    description: 'Eコマースでは変更の迅速性が重要',
  },
  
  // ステージ別ルール
  {
    id: 'stage-poc-relaxed',
    name: 'PoCステージ: 緩和された要件',
    condition: (ctx) => ctx.stage === DevelopmentStage.POC,
    dimensionWeights: [
      {
        dimension: MaturityDimension.STRUCTURE,
        weight: 1.2,
        rationale: 'PoCでは基本構造のみ重視',
      },
      {
        dimension: MaturityDimension.DETAIL,
        weight: 0.5,
        rationale: '詳細は後回しで可',
      },
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 0.5,
        rationale: 'トレーサビリティは最小限で可',
      },
      {
        dimension: MaturityDimension.TESTABILITY,
        weight: 0.3,
        rationale: 'テスト容易性は不要',
      },
      {
        dimension: MaturityDimension.MAINTAINABILITY,
        weight: 0.3,
        rationale: '保守性は不要',
      },
    ],
    relaxedRequirements: [
      'uc-repeatable-preconditions',
      'uc-repeatable-postconditions',
      'uc-defined-alternative-flows',
      'uc-defined-acceptance-criteria',
    ],
    description: 'PoCでは実験的な性質を考慮し要件を緩和',
  },
  {
    id: 'stage-maintenance-strict',
    name: '保守運用ステージ: 厳格な保守性要件',
    condition: (ctx) => ctx.stage === DevelopmentStage.MAINTENANCE,
    dimensionWeights: [
      {
        dimension: MaturityDimension.MAINTAINABILITY,
        weight: 1.5,
        rationale: '保守運用では保守性が最重要',
      },
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 1.4,
        rationale: '変更履歴の追跡が重要',
      },
      {
        dimension: MaturityDimension.TESTABILITY,
        weight: 1.3,
        rationale: '回帰テストのため',
      },
    ],
    description: '保守運用では安定性と追跡性が最重要',
  },
  
  // チーム規模別ルール
  {
    id: 'team-solo-pragmatic',
    name: '個人開発: 実用的要件',
    condition: (ctx) => ctx.teamSize === TeamSize.SOLO,
    dimensionWeights: [
      {
        dimension: MaturityDimension.STRUCTURE,
        weight: 1.2,
        rationale: '将来の自分のため構造を重視',
      },
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 0.7,
        rationale: 'トレーサビリティは軽量でも可',
      },
    ],
    description: '個人開発では実用性を重視',
  },
  {
    id: 'team-large-comprehensive',
    name: '大規模チーム: 包括的要件',
    condition: (ctx) => ctx.teamSize === TeamSize.LARGE,
    dimensionWeights: [
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 1.4,
        rationale: 'チーム間連携のためトレーサビリティが重要',
      },
      {
        dimension: MaturityDimension.DETAIL,
        weight: 1.3,
        rationale: 'コミュニケーションコストを下げるため詳細度が重要',
      },
      {
        dimension: MaturityDimension.TESTABILITY,
        weight: 1.2,
        rationale: '大規模チームではテスト自動化が必須',
      },
    ],
    description: '大規模チームでは全ディメンションの高品質が必要',
  },
  
  // 重要度別ルール
  {
    id: 'criticality-mission-critical',
    name: 'ミッションクリティカル: 最高水準',
    condition: (ctx) => ctx.criticality === ProjectCriticality.MISSION_CRITICAL,
    dimensionWeights: [
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 1.5,
        rationale: '全変更の完全な追跡が必須',
      },
      {
        dimension: MaturityDimension.TESTABILITY,
        weight: 1.5,
        rationale: '徹底的なテストが必須',
      },
      {
        dimension: MaturityDimension.DETAIL,
        weight: 1.4,
        rationale: '完全な仕様書が必須',
      },
      {
        dimension: MaturityDimension.STRUCTURE,
        weight: 1.3,
        rationale: '完璧な構造が必須',
      },
      {
        dimension: MaturityDimension.MAINTAINABILITY,
        weight: 1.3,
        rationale: '長期保守を見据えた設計が必須',
      },
    ],
    additionalRequirements: [
      'uc-defined-alternative-flows',
      'uc-defined-acceptance-criteria',
      'uc-managed-performance',
      'uc-managed-security',
    ],
    description: 'ミッションクリティカルでは最高レベルの成熟度が必須',
  },
  {
    id: 'criticality-experimental',
    name: '実験的: 柔軟な要件',
    condition: (ctx) => ctx.criticality === ProjectCriticality.EXPERIMENTAL,
    dimensionWeights: [
      {
        dimension: MaturityDimension.DETAIL,
        weight: 0.6,
        rationale: '実験では詳細よりスピード',
      },
      {
        dimension: MaturityDimension.TRACEABILITY,
        weight: 0.6,
        rationale: 'トレーサビリティは最小限',
      },
      {
        dimension: MaturityDimension.TESTABILITY,
        weight: 0.5,
        rationale: 'テストは最小限',
      },
      {
        dimension: MaturityDimension.MAINTAINABILITY,
        weight: 0.5,
        rationale: '保守性は不要',
      },
    ],
    relaxedRequirements: [
      'uc-repeatable-preconditions',
      'uc-repeatable-postconditions',
      'uc-defined-acceptance-criteria',
      'uc-defined-business-coverage',
    ],
    description: '実験的プロジェクトでは柔軟性を優先',
  },
];

/**
 * コンテキストを適用して評価ルールを取得
 */
export function applyContext(
  context: ProjectContext,
  customRules: ContextualEvaluationRule[] = []
): ContextApplicationResult {
  const allRules = [...BUILT_IN_RULES, ...customRules];
  
  // コンテキストに一致するルールを抽出
  const appliedRules = allRules.filter(rule => rule.condition(context));
  
  // ディメンション重みを集約
  const dimensionWeightsMap = new Map<MaturityDimension, number>();
  
  // デフォルト重み（1.0）で初期化
  Object.values(MaturityDimension).forEach(dimension => {
    dimensionWeightsMap.set(dimension, 1.0);
  });
  
  // 適用されたルールの重みを掛け算で適用
  const adjustmentSummary: string[] = [];
  appliedRules.forEach(rule => {
    adjustmentSummary.push(`✓ ${rule.name}: ${rule.description}`);
    
    rule.dimensionWeights.forEach(adjustment => {
      const currentWeight = dimensionWeightsMap.get(adjustment.dimension) ?? 1.0;
      const newWeight = currentWeight * adjustment.weight;
      dimensionWeightsMap.set(adjustment.dimension, newWeight);
      
      adjustmentSummary.push(
        `  - ${getDimensionName(adjustment.dimension)}: ${currentWeight.toFixed(2)}x → ${newWeight.toFixed(2)}x (${adjustment.rationale})`
      );
    });
  });
  
  // 重要度による全体的な係数を適用
  const criticalityFactor = CriticalityRecommendedFocus[context.criticality].strictness;
  adjustmentSummary.push(
    `\n⚖️  重要度による全体調整: ${criticalityFactor}x (${CriticalityRecommendedFocus[context.criticality].description})`
  );
  
  dimensionWeightsMap.forEach((weight, dimension) => {
    dimensionWeightsMap.set(dimension, weight * criticalityFactor);
  });
  
  return {
    context,
    appliedRules,
    finalDimensionWeights: dimensionWeightsMap,
    adjustmentSummary,
  };
}

/**
 * コンテキスト推論
 * プロジェクトの特性から推奨コンテキストを提案
 */
export function inferContext(
  projectName?: string,
  tags?: string[]
): Partial<ProjectContext> {
  const inferred: Partial<ProjectContext> = {};
  
  // プロジェクト名やタグからドメインを推論
  const nameAndTags = [projectName?.toLowerCase() ?? '', ...(tags ?? [])].join(' ');
  
  if (nameAndTags.includes('shop') || nameAndTags.includes('cart') || nameAndTags.includes('ecommerce')) {
    inferred.domain = ProjectDomain.ECOMMERCE;
  } else if (nameAndTags.includes('bank') || nameAndTags.includes('finance') || nameAndTags.includes('payment')) {
    inferred.domain = ProjectDomain.FINANCE;
  } else if (nameAndTags.includes('health') || nameAndTags.includes('medical') || nameAndTags.includes('hospital')) {
    inferred.domain = ProjectDomain.HEALTHCARE;
  } else if (nameAndTags.includes('iot') || nameAndTags.includes('device') || nameAndTags.includes('sensor')) {
    inferred.domain = ProjectDomain.IOT;
  } else if (nameAndTags.includes('analytics') || nameAndTags.includes('data') || nameAndTags.includes('ml')) {
    inferred.domain = ProjectDomain.DATA_ANALYTICS;
  }
  
  // ステージを推論
  if (nameAndTags.includes('poc') || nameAndTags.includes('prototype')) {
    inferred.stage = DevelopmentStage.POC;
  } else if (nameAndTags.includes('mvp')) {
    inferred.stage = DevelopmentStage.MVP;
  } else if (nameAndTags.includes('legacy') || nameAndTags.includes('migration')) {
    inferred.stage = DevelopmentStage.LEGACY_MIGRATION;
  }
  
  return inferred;
}

/**
 * コンテキストに基づいた推奨アクションを生成
 */
export function generateContextualRecommendations(
  context: ProjectContext,
  applicationResult: ContextApplicationResult
): string[] {
  const recommendations: string[] = [];
  
  // ドメイン別の推奨
  const domainFocus = DomainRecommendedFocus[context.domain];
  recommendations.push(
    `🎯 ${context.domain}ドメイン: ${domainFocus.description}`
  );
  
  // ステージ別の推奨
  const stageFocus = StageRecommendedFocus[context.stage];
  recommendations.push(
    `📅 ${context.stage}ステージ: ${stageFocus.description}`
  );
  recommendations.push(
    `   推奨最低レベル: レベル${stageFocus.minLevel}`
  );
  
  // チーム規模別の推奨
  const teamFocus = TeamSizeRecommendedFocus[context.teamSize];
  recommendations.push(
    `👥 ${context.teamSize}チーム: ${teamFocus.description}`
  );
  
  // 重要度別の推奨
  const criticalityFocus = CriticalityRecommendedFocus[context.criticality];
  recommendations.push(
    `⚠️  ${context.criticality}重要度: ${criticalityFocus.description}`
  );
  
  return recommendations;
}

/**
 * ディメンション名を取得
 */
function getDimensionName(dimension: MaturityDimension): string {
  const names: { [key in MaturityDimension]: string } = {
    [MaturityDimension.STRUCTURE]: '構造の完全性',
    [MaturityDimension.DETAIL]: '詳細度',
    [MaturityDimension.TRACEABILITY]: 'トレーサビリティ',
    [MaturityDimension.TESTABILITY]: 'テスト容易性',
    [MaturityDimension.MAINTAINABILITY]: '保守性',
  };
  return names[dimension];
}

/**
 * コンテキスト情報を含む評価サマリーを生成
 */
export function generateContextSummary(
  context: ProjectContext,
  applicationResult: ContextApplicationResult
): string {
  const lines: string[] = [];
  
  lines.push('📋 プロジェクトコンテキスト');
  lines.push('=' .repeat(60));
  
  if (context.projectName) {
    lines.push(`プロジェクト名: ${context.projectName}`);
  }
  lines.push(`ドメイン: ${context.domain}`);
  lines.push(`開発ステージ: ${context.stage}`);
  lines.push(`チーム規模: ${context.teamSize}`);
  lines.push(`重要度: ${context.criticality}`);
  
  if (context.tags && context.tags.length > 0) {
    lines.push(`タグ: ${context.tags.join(', ')}`);
  }
  
  lines.push('');
  lines.push('🔧 適用された評価ルール');
  lines.push('=' .repeat(60));
  lines.push(...applicationResult.adjustmentSummary);
  
  lines.push('');
  lines.push('📊 最終ディメンション重み係数');
  lines.push('=' .repeat(60));
  
  Object.values(MaturityDimension).forEach(dimension => {
    const weight = applicationResult.finalDimensionWeights.get(dimension) ?? 1.0;
    const bar = '█'.repeat(Math.round(weight * 10));
    lines.push(`${getDimensionName(dimension).padEnd(20)}: ${bar} ${weight.toFixed(2)}x`);
  });
  
  lines.push('');
  lines.push('💡 推奨事項');
  lines.push('=' .repeat(60));
  const recommendations = generateContextualRecommendations(context, applicationResult);
  lines.push(...recommendations);
  
  return lines.join('\n');
}
