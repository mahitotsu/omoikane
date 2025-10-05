/**
 * 成熟度評価基準定義
 * 
 * 各成熟度レベルに到達するために必要な基準を定義
 * レベル別・ディメンション別に体系化
 */

import {
    MaturityCriterion,
    MaturityDimension,
    MaturityLevel,
} from './maturity-model.js';

/**
 * ユースケース用の成熟度基準
 */
export const UseCaseMaturityCriteria: MaturityCriterion[] = [
  // ===== レベル1: INITIAL =====
  {
    id: 'uc-initial-basic-info',
    name: '基本情報の存在',
    description: 'ID、名前、説明が定義されている',
    level: MaturityLevel.INITIAL,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'id, name, description が存在し空でない',
    weight: 1.0,
  },
  {
    id: 'uc-initial-actors',
    name: 'アクター定義',
    description: 'プライマリアクターが指定されている',
    level: MaturityLevel.INITIAL,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'actors.primary が存在する',
    weight: 1.0,
  },
  {
    id: 'uc-initial-flow',
    name: '基本フロー',
    description: 'メインフローが定義されている',
    level: MaturityLevel.INITIAL,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'mainFlow に少なくとも1ステップ存在',
    weight: 1.0,
  },

  // ===== レベル2: REPEATABLE =====
  {
    id: 'uc-repeatable-description',
    name: '十分な説明',
    description: '説明が50文字以上で具体的に記述されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: 'description.length >= 50',
    weight: 0.8,
  },
  {
    id: 'uc-repeatable-preconditions',
    name: '事前条件の定義',
    description: '事前条件が明確に定義されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'preconditions.length >= 1',
    weight: 0.9,
  },
  {
    id: 'uc-repeatable-postconditions',
    name: '事後条件の定義',
    description: '事後条件が明確に定義されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'postconditions.length >= 1',
    weight: 0.9,
  },
  {
    id: 'uc-repeatable-flow-detail',
    name: 'フローの詳細化',
    description: 'メインフローが複数ステップで構成されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: 'mainFlow.length >= 3',
    weight: 0.7,
  },
  {
    id: 'uc-repeatable-priority',
    name: '優先度の設定',
    description: '優先度が適切に設定されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'priority が定義されている',
    weight: 0.6,
  },

  // ===== レベル3: DEFINED =====
  {
    id: 'uc-defined-step-detail',
    name: 'ステップの詳細化',
    description: '各ステップにstepId、actor、action、expectedResultが定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: '全ステップが完全な構造を持つ',
    weight: 0.9,
  },
  {
    id: 'uc-defined-alternative-flows',
    name: '代替フローの定義',
    description: '例外シナリオが代替フローとして定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'alternativeFlows.length >= 1',
    weight: 0.7,
  },
  {
    id: 'uc-defined-business-coverage',
    name: '業務要件とのリンク',
    description: '業務要件カバレッジが定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.TRACEABILITY,
    required: true,
    condition: 'businessRequirementCoverage が存在',
    weight: 0.8,
  },
  {
    id: 'uc-defined-acceptance-criteria',
    name: '受け入れ基準',
    description: '受け入れ基準が明確に定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.TESTABILITY,
    required: false,
    condition: 'acceptanceCriteria.length >= 1',
    weight: 0.7,
  },
  {
    id: 'uc-defined-complexity',
    name: '複雑度の評価',
    description: 'ユースケースの複雑度が評価されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.MAINTAINABILITY,
    required: false,
    condition: 'complexity が定義されている',
    weight: 0.5,
  },

  // ===== レベル4: MANAGED =====
  {
    id: 'uc-managed-effort',
    name: '工数見積もり',
    description: '実装工数が見積もられている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.MAINTAINABILITY,
    required: false,
    condition: 'estimatedEffort が定義されている',
    weight: 0.6,
  },
  {
    id: 'uc-managed-data-requirements',
    name: 'データ要件',
    description: '必要なデータ要件が明確化されている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'dataRequirements.length >= 1',
    weight: 0.7,
  },
  {
    id: 'uc-managed-performance',
    name: 'パフォーマンス要件',
    description: 'パフォーマンス要件が定義されている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'performanceRequirements.length >= 1',
    weight: 0.6,
  },
  {
    id: 'uc-managed-security',
    name: 'セキュリティ要件',
    description: 'セキュリティポリシーが関連付けられている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.TRACEABILITY,
    required: false,
    condition: 'securityPolicies.length >= 1',
    weight: 0.7,
  },
  {
    id: 'uc-managed-business-rules',
    name: 'ビジネスルール',
    description: 'ビジネスルールが明示的に関連付けられている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.TRACEABILITY,
    required: false,
    condition: 'businessRules.length >= 1',
    weight: 0.7,
  },

  // ===== レベル5: OPTIMIZED =====
  {
    id: 'uc-optimized-ui-requirements',
    name: 'UI要件',
    description: 'UI/UX要件が詳細に定義されている',
    level: MaturityLevel.OPTIMIZED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'uiRequirements.length >= 1',
    weight: 0.5,
  },
  {
    id: 'uc-optimized-error-handling',
    name: 'エラーハンドリング',
    description: 'ステップごとのエラーハンドリングが定義されている',
    level: MaturityLevel.OPTIMIZED,
    dimension: MaturityDimension.TESTABILITY,
    required: false,
    condition: 'mainFlow の各ステップに errorHandling が存在',
    weight: 0.6,
  },
  {
    id: 'uc-optimized-validation',
    name: 'バリデーションルール',
    description: 'ステップごとのバリデーションルールが定義されている',
    level: MaturityLevel.OPTIMIZED,
    dimension: MaturityDimension.TESTABILITY,
    required: false,
    condition: 'mainFlow の各ステップに validationRules が存在',
    weight: 0.6,
  },
  {
    id: 'uc-optimized-business-value',
    name: 'ビジネス価値',
    description: 'ビジネス価値が明確に記述されている',
    level: MaturityLevel.OPTIMIZED,
    dimension: MaturityDimension.TRACEABILITY,
    required: false,
    condition: 'businessValue が具体的に記述されている',
    weight: 0.5,
  },
];

/**
 * アクター用の成熟度基準
 */
export const ActorMaturityCriteria: MaturityCriterion[] = [
  // ===== レベル1: INITIAL =====
  {
    id: 'actor-initial-basic-info',
    name: '基本情報の存在',
    description: 'ID、名前が定義されている',
    level: MaturityLevel.INITIAL,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'id, name が存在し空でない',
    weight: 1.0,
  },

  // ===== レベル2: REPEATABLE =====
  {
    id: 'actor-repeatable-description',
    name: '説明の存在',
    description: 'アクターの説明が記述されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: 'description が存在し空でない',
    weight: 0.9,
  },
  {
    id: 'actor-repeatable-role',
    name: '役割の定義',
    description: 'アクターの役割が定義されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'role が定義されている',
    weight: 0.8,
  },

  // ===== レベル3: DEFINED =====
  {
    id: 'actor-defined-responsibilities',
    name: '責務の明確化',
    description: '責務が具体的にリストアップされている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: 'responsibilities.length >= 2',
    weight: 0.8,
  },
  {
    id: 'actor-defined-description-detail',
    name: '詳細な説明',
    description: '説明が30文字以上で具体的に記述されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: 'description.length >= 30',
    weight: 0.6,
  },

  // ===== レベル4: MANAGED =====
  {
    id: 'actor-managed-usecase-coverage',
    name: 'ユースケースカバレッジ',
    description: '少なくとも1つのユースケースで使用されている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.TRACEABILITY,
    required: true,
    condition: 'いずれかのユースケースで参照されている',
    weight: 0.9,
  },

  // ===== レベル5: OPTIMIZED =====
  {
    id: 'actor-optimized-goals',
    name: 'ゴールの定義',
    description: 'アクターのゴールが明確に定義されている',
    level: MaturityLevel.OPTIMIZED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'goals.length >= 1',
    weight: 0.5,
  },
];

/**
 * 業務要件定義用の成熟度基準
 */
export const BusinessRequirementMaturityCriteria: MaturityCriterion[] = [
  // ===== レベル1: INITIAL =====
  {
    id: 'br-initial-basic-info',
    name: '基本情報の存在',
    description: 'ID、名前が定義されている',
    level: MaturityLevel.INITIAL,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'id, name が存在し空でない',
    weight: 1.0,
  },

  // ===== レベル2: REPEATABLE =====
  {
    id: 'br-repeatable-summary',
    name: '要約の存在',
    description: '要約が記述されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: 'summary が存在し空でない',
    weight: 0.9,
  },
  {
    id: 'br-repeatable-goals',
    name: 'ビジネスゴール',
    description: 'ビジネスゴールが定義されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'businessGoals.length >= 1',
    weight: 1.0,
  },
  {
    id: 'br-repeatable-scope',
    name: 'スコープ定義',
    description: 'スコープが定義されている',
    level: MaturityLevel.REPEATABLE,
    dimension: MaturityDimension.STRUCTURE,
    required: true,
    condition: 'scope.inScope.length >= 1',
    weight: 0.9,
  },

  // ===== レベル3: DEFINED =====
  {
    id: 'br-defined-stakeholders',
    name: 'ステークホルダー',
    description: 'ステークホルダーが明確に定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: true,
    condition: 'stakeholders.length >= 2',
    weight: 0.8,
  },
  {
    id: 'br-defined-metrics',
    name: '成功指標',
    description: '成功指標が定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'successMetrics.length >= 1',
    weight: 0.7,
  },
  {
    id: 'br-defined-assumptions',
    name: '前提条件',
    description: '前提条件が明確に定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'assumptions.length >= 1',
    weight: 0.6,
  },
  {
    id: 'br-defined-constraints',
    name: '制約条件',
    description: '制約条件が明確に定義されている',
    level: MaturityLevel.DEFINED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'constraints.length >= 1',
    weight: 0.6,
  },

  // ===== レベル4: MANAGED =====
  {
    id: 'br-managed-business-rules',
    name: 'ビジネスルール',
    description: 'ビジネスルールが体系的に定義されている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'businessRules.length >= 3',
    weight: 0.7,
  },
  {
    id: 'br-managed-security',
    name: 'セキュリティポリシー',
    description: 'セキュリティポリシーが定義されている',
    level: MaturityLevel.MANAGED,
    dimension: MaturityDimension.DETAIL,
    required: false,
    condition: 'securityPolicies.length >= 1',
    weight: 0.7,
  },

  // ===== レベル5: OPTIMIZED =====
  {
    id: 'br-optimized-coverage',
    name: '完全なカバレッジ',
    description: '全てのビジネスゴール・ルールがユースケースでカバーされている',
    level: MaturityLevel.OPTIMIZED,
    dimension: MaturityDimension.TRACEABILITY,
    required: false,
    condition: 'カバレッジ率 100%',
    weight: 0.8,
  },
];

/**
 * レベル別の基準を取得
 */
export function getCriteriaByLevel(
  elementType: 'business-requirement' | 'actor' | 'usecase',
  level: MaturityLevel
): MaturityCriterion[] {
  const allCriteria = getCriteriaByElementType(elementType);
  return allCriteria.filter(c => c.level === level);
}

/**
 * ディメンション別の基準を取得
 */
export function getCriteriaByDimension(
  elementType: 'business-requirement' | 'actor' | 'usecase',
  dimension: MaturityDimension
): MaturityCriterion[] {
  const allCriteria = getCriteriaByElementType(elementType);
  return allCriteria.filter(c => c.dimension === dimension);
}

/**
 * 要素タイプ別の全基準を取得
 */
export function getCriteriaByElementType(
  elementType: 'business-requirement' | 'actor' | 'usecase'
): MaturityCriterion[] {
  switch (elementType) {
    case 'business-requirement':
      return BusinessRequirementMaturityCriteria;
    case 'actor':
      return ActorMaturityCriteria;
    case 'usecase':
      return UseCaseMaturityCriteria;
    default:
      return [];
  }
}

/**
 * 必須基準のみを取得
 */
export function getRequiredCriteria(
  elementType: 'business-requirement' | 'actor' | 'usecase'
): MaturityCriterion[] {
  const allCriteria = getCriteriaByElementType(elementType);
  return allCriteria.filter(c => c.required);
}
