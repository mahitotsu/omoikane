/**
 * 品質評価エンジン
 * メタモデル要素の品質を総合的に評価
 */

import type { Actor, BusinessRequirementDefinition, UseCase } from '../types/delivery-elements.js';

import type { QualityAssessmentResult, QualityIssue, QualityScore } from './types.js';

import { analyzeCoverage } from './coverage-analyzer.js';

/**
 * 品質評価を実行
 */
export function assessQuality(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[]
): QualityAssessmentResult {
  const coverage = analyzeCoverage(businessRequirements, actors, useCases);
  const issues: QualityIssue[] = [];

  // 完全性の評価
  const completeness = assessCompleteness(businessRequirements, actors, useCases, issues);

  // 一貫性の評価
  const consistency = assessConsistency(businessRequirements, actors, useCases, issues);

  // 妥当性の評価
  const validity = assessValidity(businessRequirements, actors, useCases, issues);

  // 追跡可能性の評価
  const traceability = assessTraceability(businessRequirements, actors, useCases, issues, coverage);

  // 全体スコアの計算
  const overallScore = calculateOverallScore(completeness, consistency, validity, traceability);

  return {
    overallScore,
    scores: {
      completeness,
      consistency,
      validity,
      traceability,
    },
    coverage,
    issues,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 完全性の評価
 */
function assessCompleteness(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[],
  issues: QualityIssue[]
): QualityScore {
  let score = 100;
  let deductions = 0;

  // 必須フィールドの存在チェック
  if (!businessRequirements.businessGoals || businessRequirements.businessGoals.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'completeness',
      elementType: 'businessRequirements',
      elementId: 'businessGoals',
      description: 'ビジネスゴールが定義されていません',
      impact: 'システムの目的が不明確になります',
      suggestion: 'ビジネスゴールを定義してください',
    });
    deductions += 20;
  }

  if (
    !businessRequirements.scope ||
    !businessRequirements.scope.inScope ||
    businessRequirements.scope.inScope.length === 0
  ) {
    issues.push({
      severity: 'warning',
      category: 'completeness',
      elementType: 'businessRequirements',
      elementId: 'scope',
      description: 'スコープが定義されていません',
      impact: 'システムの範囲が不明確になります',
      suggestion: 'スコープ内項目を定義してください',
    });
    deductions += 15;
  }

  if (!businessRequirements.stakeholders || businessRequirements.stakeholders.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'completeness',
      elementType: 'businessRequirements',
      elementId: 'stakeholders',
      description: 'ステークホルダーが定義されていません',
      impact: '関係者が不明確になります',
      suggestion: 'ステークホルダーを定義してください',
    });
    deductions += 10;
  }

  // アクターの完全性チェック
  if (actors.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'completeness',
      elementType: 'actors',
      elementId: 'all',
      description: 'アクターが定義されていません',
      impact: 'システムの利用者が不明確になります',
      suggestion: 'アクターを定義してください',
    });
    deductions += 20;
  }

  // ユースケースの完全性チェック
  if (useCases.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'completeness',
      elementType: 'useCases',
      elementId: 'all',
      description: 'ユースケースが定義されていません',
      impact: 'システムの機能が不明確になります',
      suggestion: 'ユースケースを定義してください',
    });
    deductions += 25;
  }

  // 各ユースケースの必須フィールドチェック
  for (const useCase of useCases) {
    if (!useCase.description || useCase.description.trim() === '') {
      issues.push({
        severity: 'warning',
        category: 'completeness',
        elementType: 'useCase',
        elementId: useCase.id,
        description: `ユースケース「${useCase.id}」の説明が不足しています`,
        impact: 'ユースケースの目的が不明確になります',
        suggestion: '詳細な説明を追加してください',
      });
      deductions += 2;
    }

    if (!useCase.preconditions || useCase.preconditions.length === 0) {
      issues.push({
        severity: 'info',
        category: 'completeness',
        elementType: 'useCase',
        elementId: useCase.id,
        description: `ユースケース「${useCase.id}」の前提条件が定義されていません`,
        impact: '実行条件が不明確になります',
        suggestion: '前提条件を定義してください',
      });
      deductions += 1;
    }

    if (!useCase.mainFlow || useCase.mainFlow.length === 0) {
      issues.push({
        severity: 'critical',
        category: 'completeness',
        elementType: 'useCase',
        elementId: useCase.id,
        description: `ユースケース「${useCase.id}」の基本フローが定義されていません`,
        impact: 'ユースケースの手順が不明確になります',
        suggestion: '基本フローを定義してください',
      });
      deductions += 5;
    }
  }

  score = Math.max(0, score - deductions);

  return {
    value: score,
    level: score >= 80 ? 'good' : score >= 60 ? 'warning' : 'critical',
    details: `完全性スコア: ${score}/100 (減点: ${deductions})`,
  };
}

/**
 * 一貫性の評価
 */
function assessConsistency(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[],
  issues: QualityIssue[]
): QualityScore {
  let score = 100;
  let deductions = 0;

  // ID の重複チェック
  const businessGoalIds = new Set<string>();
  for (const goal of businessRequirements.businessGoals || []) {
    if (businessGoalIds.has(goal.id)) {
      issues.push({
        severity: 'critical',
        category: 'consistency',
        elementType: 'businessGoal',
        elementId: goal.id,
        description: `ビジネスゴールID「${goal.id}」が重複しています`,
        impact: '要素の識別が曖昧になります',
        suggestion: '一意のIDを使用してください',
      });
      deductions += 10;
    }
    businessGoalIds.add(goal.id);
  }

  const actorIds = new Set<string>();
  for (const actor of actors) {
    if (actorIds.has(actor.id)) {
      issues.push({
        severity: 'critical',
        category: 'consistency',
        elementType: 'actor',
        elementId: actor.id,
        description: `アクターID「${actor.id}」が重複しています`,
        impact: 'アクターの識別が曖昧になります',
        suggestion: '一意のIDを使用してください',
      });
      deductions += 10;
    }
    actorIds.add(actor.id);
  }

  const useCaseIds = new Set<string>();
  for (const useCase of useCases) {
    if (useCaseIds.has(useCase.id)) {
      issues.push({
        severity: 'critical',
        category: 'consistency',
        elementType: 'useCase',
        elementId: useCase.id,
        description: `ユースケースID「${useCase.id}」が重複しています`,
        impact: 'ユースケースの識別が曖昧になります',
        suggestion: '一意のIDを使用してください',
      });
      deductions += 10;
    }
    useCaseIds.add(useCase.id);
  }

  // 参照整合性チェック
  for (const useCase of useCases) {
    const primaryActor = useCase.actors.primary;
    // 新型では primary は Ref<Actor> = {id: string} 形式
    const primaryActorId = typeof primaryActor === 'object' && primaryActor !== null && 'id' in primaryActor
      ? primaryActor.id
      : (typeof primaryActor === 'string' ? primaryActor : undefined);

    if (!primaryActorId || !actors.some(actor => actor.id === primaryActorId)) {
      issues.push({
        severity: 'critical',
        category: 'consistency',
        elementType: 'useCase',
        elementId: useCase.id,
        description: `ユースケース「${useCase.id}」の主要アクター「${primaryActorId}」が存在しません`,
        impact: 'ユースケースの実行者が不明になります',
        suggestion: 'アクターを定義するか、正しいIDを使用してください',
      });
      deductions += 8;
    }
  }

  score = Math.max(0, score - deductions);

  return {
    value: score,
    level: score >= 90 ? 'good' : score >= 70 ? 'warning' : 'critical',
    details: `一貫性スコア: ${score}/100 (減点: ${deductions})`,
  };
}

/**
 * 妥当性の評価
 */
function assessValidity(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[],
  issues: QualityIssue[]
): QualityScore {
  let score = 100;
  let deductions = 0;

  // ビジネスゴールの妥当性チェック
  for (const goal of businessRequirements.businessGoals || []) {
    if (!goal.description || goal.description.trim().length < 10) {
      issues.push({
        severity: 'warning',
        category: 'validity',
        elementType: 'businessGoal',
        elementId: goal.id,
        description: `ビジネスゴール「${goal.id}」の説明が不十分です`,
        impact: 'ゴールの理解が困難になります',
        suggestion: 'より詳細な説明を追加してください',
      });
      deductions += 3;
    }
  }

  // アクターの妥当性チェック
  for (const actor of actors) {
    if (!actor.description || actor.description.trim().length < 5) {
      issues.push({
        severity: 'info',
        category: 'validity',
        elementType: 'actor',
        elementId: actor.id,
        description: `アクター「${actor.id}」の説明が不十分です`,
        impact: 'アクターの役割が不明確になります',
        suggestion: 'アクターの役割を明確に説明してください',
      });
      deductions += 2;
    }
  }

  // ユースケースのステップ数チェック
  for (const useCase of useCases) {
    if (useCase.mainFlow && useCase.mainFlow.length > 20) {
      issues.push({
        severity: 'warning',
        category: 'validity',
        elementType: 'useCase',
        elementId: useCase.id,
        description: `ユースケース「${useCase.id}」の基本フローが長すぎます（${useCase.mainFlow.length}ステップ）`,
        impact: 'ユースケースが複雑になり理解が困難になります',
        suggestion: 'ユースケースを分割することを検討してください',
      });
      deductions += 4;
    }

    if (useCase.mainFlow && useCase.mainFlow.length < 2) {
      issues.push({
        severity: 'warning',
        category: 'validity',
        elementType: 'useCase',
        elementId: useCase.id,
        description: `ユースケース「${useCase.id}」の基本フローが短すぎます（${useCase.mainFlow.length}ステップ）`,
        impact: 'ユースケースの価値が不明確になります',
        suggestion: 'より詳細なステップを追加してください',
      });
      deductions += 3;
    }
  }

  score = Math.max(0, score - deductions);

  return {
    value: score,
    level: score >= 85 ? 'good' : score >= 65 ? 'warning' : 'critical',
    details: `妥当性スコア: ${score}/100 (減点: ${deductions})`,
  };
}

/**
 * 追跡可能性の評価
 */
function assessTraceability(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[],
  issues: QualityIssue[],
  coverage: any
): QualityScore {
  let score = 100;
  let deductions = 0;

  // カバレッジが低い要素への減点
  const coverageTypes = [
    { type: 'ビジネスゴール', coverage: coverage.businessGoals },
    { type: 'スコープ項目', coverage: coverage.scopeItems },
    { type: 'ステークホルダー', coverage: coverage.stakeholders },
    { type: '成功指標', coverage: coverage.successMetrics },
    { type: '前提条件', coverage: coverage.assumptions },
    { type: '制約条件', coverage: coverage.constraints },
    { type: 'ビジネスルール', coverage: coverage.businessRules },
  ];

  for (const { type, coverage: cov } of coverageTypes) {
    if (cov.coverage < 0.8) {
      const uncoveredCount = cov.total - cov.covered;
      issues.push({
        severity: 'warning',
        category: 'traceability',
        elementType: 'coverage',
        elementId: type,
        description: `${type}のカバレッジが低いです（${Math.round(cov.coverage * 100)}%）`,
        impact: `${uncoveredCount}個の${type}がユースケースで使用されていません`,
        suggestion: `未使用の${type}を参照するユースケースを作成するか、不要な要素を削除してください`,
      });
      deductions += Math.round((1 - cov.coverage) * 15);
    }
  }

  // 孤立要素への減点
  for (const orphaned of coverage.orphanedElements) {
    issues.push({
      severity: 'warning',
      category: 'traceability',
      elementType: orphaned.element.type,
      elementId: orphaned.element.id,
      description: orphaned.reason,
      impact: '未使用の要素がモデルを複雑にしています',
      suggestion:
        orphaned.suggestedUsage[0] || '要素を削除するか、使用するユースケースを作成してください',
    });
    deductions += 5;
  }

  score = Math.max(0, score - deductions);

  return {
    value: score,
    level: score >= 85 ? 'good' : score >= 60 ? 'warning' : 'critical',
    details: `追跡可能性スコア: ${score}/100 (減点: ${deductions})`,
  };
}

/**
 * 全体スコアの計算
 */
function calculateOverallScore(
  completeness: QualityScore,
  consistency: QualityScore,
  validity: QualityScore,
  traceability: QualityScore
): QualityScore {
  // 重み付き平均（完全性と一貫性を重視）
  const weights = {
    completeness: 0.3,
    consistency: 0.3,
    validity: 0.2,
    traceability: 0.2,
  };

  const weightedScore =
    completeness.value * weights.completeness +
    consistency.value * weights.consistency +
    validity.value * weights.validity +
    traceability.value * weights.traceability;

  return {
    value: Math.round(weightedScore),
    level: weightedScore >= 80 ? 'good' : weightedScore >= 60 ? 'warning' : 'critical',
    details: `総合品質スコア: ${Math.round(weightedScore)}/100`,
  };
}
