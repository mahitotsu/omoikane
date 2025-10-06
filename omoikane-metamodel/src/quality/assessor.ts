/**
 * @fileoverview 品質評価エンジン（Quality Assessment Engine）
 * 
 * **目的:**
 * メタモデル要素（ビジネス要求、アクター、ユースケース）の品質を4つの観点から総合的に評価し、
 * 具体的な問題点と改善提案を提供します。
 * 
 * **評価観点（4次元）:**
 * 1. 完全性（Completeness）: 必須フィールドの存在、要素数の充実度（重み: 30%）
 * 2. 一貫性（Consistency）: IDの重複、参照整合性（重み: 30%）
 * 3. 妥当性（Validity）: 説明の充実度、ステップ数の適切性（重み: 20%）
 * 4. 追跡可能性（Traceability）: カバレッジ、孤立要素の有無（重み: 20%）
 * 
 * **スコアリング:**
 * - 100点満点から減点方式で算出
 * - good: 80点以上、warning: 60-79点、critical: 59点以下
 * - 重み付き平均で総合スコアを算出
 * 
 * **出力:**
 * - 総合スコアと各観点別スコア
 * - カバレッジ分析結果（coverage-analyzer.tsより取得）
 * - 問題リスト（severity, category, 影響、改善提案を含む）
 * 
 * **拡張ポイント:**
 * - 新しい評価観点を追加する場合: assess〇〇関数を追加し、calculateOverallScoreの重みを調整
 * - 減点ルールを調整する場合: 各assess関数内のdeductions値を変更
 * - スコア閾値を変更する場合: levelの判定条件を調整
 * 
 * @module quality/assessor
 */

import type * as Business from '../types/business/index.js';
import type * as Functional from '../types/functional/index.js';

import type { QualityAssessmentResult, QualityIssue, QualityScore } from './types.js';

import { analyzeCoverage } from './coverage-analyzer.js';

// ============================================================================
// 型エイリアス
// ============================================================================

type Actor = Functional.Actor;
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
type UseCase = Functional.UseCase;

// ============================================================================
// 公開API: 品質評価の実行
// ============================================================================

/**
 * メタモデル要素の品質を総合的に評価します。
 * 
 * **評価フロー:**
 * 1. カバレッジ分析を実行（coverage-analyzer.tsを呼び出し）
 * 2. 4つの観点で評価を実行（完全性、一貫性、妥当性、追跡可能性）
 * 3. 各評価で問題を検出し、issuesリストに追加
 * 4. 重み付き平均で総合スコアを算出
 * 
 * @param businessRequirements - ビジネス要求定義（ゴール、スコープ、ステークホルダーなど）
 * @param actors - アクターリスト（システム利用者）
 * @param useCases - ユースケースリスト（システム機能）
 * @returns 総合品質評価結果（スコア、カバレッジ、問題リスト）
 * 
 * **使用例:**
 * ```typescript
 * const result = assessQuality(businessReq, actors, useCases);
 * if (result.overallScore.level === 'critical') {
 *   console.error('重大な品質問題があります:', result.issues);
 * }
 * ```
 * 
 * **注意:**
 * - 問題リストは評価順（完全性 → 一貫性 → 妥当性 → 追跡可能性）に蓄積されます
 * - カバレッジが低い場合、追跡可能性スコアが大幅に減点されます
 */
export function assessQuality(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[]
): QualityAssessmentResult {
  const coverage = analyzeCoverage(businessRequirements, actors, useCases);
  const issues: QualityIssue[] = [];

  // 完全性の評価（必須フィールド、要素数の充実度）
  const completeness = assessCompleteness(businessRequirements, actors, useCases, issues);

  // 一貫性の評価（IDの重複、参照整合性）
  const consistency = assessConsistency(businessRequirements, actors, useCases, issues);

  // 妥当性の評価（説明の充実度、ステップ数の適切性）
  const validity = assessValidity(businessRequirements, actors, useCases, issues);

  // 追跡可能性の評価（カバレッジ、孤立要素）
  const traceability = assessTraceability(businessRequirements, actors, useCases, issues, coverage);

  // 全体スコアの計算（重み付き平均）
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

// ============================================================================
// 内部評価関数: 完全性（Completeness）
// ============================================================================

/**
 * 完全性（Completeness）を評価します。
 * 
 * **評価内容:**
 * - 必須フィールドの存在チェック（ビジネスゴール、スコープ、ステークホルダー）
 * - 要素数のチェック（アクター、ユースケースが定義されているか）
 * - 各要素の詳細度チェック（説明、前提条件、基本フローなど）
 * 
 * **減点ルール:**
 * - ビジネスゴール未定義: -20点（critical）
 * - スコープ未定義: -15点（warning）
 * - ステークホルダー未定義: -10点（warning）
 * - アクター未定義: -20点（critical）
 * - ユースケース未定義: -25点（critical）
 * - ユースケース説明不足: -2点/件（warning）
 * - 前提条件未定義: -1点/件（info）
 * - 基本フロー未定義: -5点/件（critical）
 * 
 * **閾値:**
 * - good: 80点以上、warning: 60-79点、critical: 59点以下
 * 
 * @param businessRequirements - ビジネス要求定義
 * @param actors - アクターリスト
 * @param useCases - ユースケースリスト
 * @param issues - 問題リスト（この関数内で追加）
 * @returns 完全性スコア
 * 
 * **拡張ポイント:**
 * - 新しい必須フィールドを追加する場合: ここに同様のチェックを追加
 * - 減点値を調整する場合: deductions += の値を変更
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

// ============================================================================
// 内部評価関数: 一貫性（Consistency）
// ============================================================================

/**
 * 一貫性（Consistency）を評価します。
 * 
 * **評価内容:**
 * - IDの一意性チェック（ビジネスゴール、アクター、ユースケースのID重複）
 * - 参照整合性チェック（ユースケースの主要アクターが存在するか）
 * 
 * **減点ルール:**
 * - ビジネスゴールID重複: -10点/件（critical）
 * - アクターID重複: -10点/件（critical）
 * - ユースケースID重複: -10点/件（critical）
 * - 主要アクター未定義: -8点/件（critical）
 * 
 * **閾値:**
 * - good: 90点以上、warning: 70-89点、critical: 69点以下
 * 
 * @param businessRequirements - ビジネス要求定義
 * @param actors - アクターリスト
 * @param useCases - ユースケースリスト
 * @param issues - 問題リスト（この関数内で追加）
 * @returns 一貫性スコア
 * 
 * **注意:**
 * - 参照はRef<Actor>形式（{id: string}）または文字列IDの両方に対応
 * - ID重複は重大な問題として扱われます（トレーサビリティが崩壊）
 * 
 * **拡張ポイント:**
 * - 新しい参照整合性チェックを追加する場合: ここに同様のチェックを追加
 * - 副アクターの整合性も確認する場合: secondary配列を検証
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

// ============================================================================
// 内部評価関数: 妥当性（Validity）
// ============================================================================

/**
 * 妥当性（Validity）を評価します。
 * 
 * **評価内容:**
 * - ビジネスゴールの説明の充実度（10文字以上）
 * - アクターの説明の充実度（5文字以上）
 * - ユースケースのステップ数の適切性（2-20ステップが理想）
 * 
 * **減点ルール:**
 * - ビジネスゴール説明不足: -3点/件（warning）
 * - アクター説明不足: -2点/件（info）
 * - ユースケースが長すぎる（20ステップ超）: -4点/件（warning）
 * - ユースケースが短すぎる（2ステップ未満）: -3点/件（warning）
 * 
 * **閾値:**
 * - good: 85点以上、warning: 65-84点、critical: 64点以下
 * 
 * @param businessRequirements - ビジネス要求定義
 * @param actors - アクターリスト
 * @param useCases - ユースケースリスト
 * @param issues - 問題リスト（この関数内で追加）
 * @returns 妥当性スコア
 * 
 * **拡張ポイント:**
 * - 説明の最小文字数を変更する場合: length判定の値を変更
 * - ステップ数の適正範囲を変更する場合: 2-20の閾値を調整
 * - 新しい妥当性ルールを追加する場合: ここに同様のチェックを追加
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

// ============================================================================
// 内部評価関数: 追跡可能性（Traceability）
// ============================================================================

/**
 * 追跡可能性（Traceability）を評価します。
 * 
 * **評価内容:**
 * - カバレッジ分析（ビジネス要求がユースケースで使用されているか）
 * - 孤立要素の検出（どのユースケースからも参照されない要素）
 * 
 * **減点ルール:**
 * - カバレッジ80%未満: -15点 × (1 - カバレッジ率) / 要素タイプ（warning）
 * - 孤立要素: -5点/件（warning）
 * 
 * **対象要素:**
 * - ビジネスゴール、スコープ項目、ステークホルダー、成功指標
 * - 前提条件、制約条件、ビジネスルール
 * 
 * **閾値:**
 * - good: 85点以上、warning: 60-84点、critical: 59点以下
 * 
 * @param businessRequirements - ビジネス要求定義
 * @param actors - アクターリスト
 * @param useCases - ユースケースリスト
 * @param issues - 問題リスト（この関数内で追加）
 * @param coverage - カバレッジ分析結果（coverage-analyzer.tsより取得）
 * @returns 追跡可能性スコア
 * 
 * **注意:**
 * - カバレッジが低いと大幅に減点されます（トレーサビリティの根幹）
 * - 孤立要素は削除するか、使用するユースケースを作成する必要があります
 * 
 * **拡張ポイント:**
 * - カバレッジ閾値を変更する場合: 0.8の値を調整
 * - 新しい要素タイプを追加する場合: coverageTypesに追加
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

// ============================================================================
// 内部ユーティリティ: スコア計算
// ============================================================================

/**
 * 各観点のスコアから総合スコアを算出します。
 * 
 * **計算方法:**
 * - 重み付き平均で算出
 * - 完全性（30%）と一貫性（30%）を重視
 * - 妥当性（20%）と追跡可能性（20%）は補助的
 * 
 * **重み設定の理由:**
 * - 完全性: 必須要素が欠けていると作業不可能なため高優先度
 * - 一貫性: IDの重複や参照エラーはトレーサビリティ崩壊の原因
 * - 妥当性: 品質は重要だが、存在しないよりはマシ
 * - 追跡可能性: カバレッジは重要だが、他の問題が解決されてから改善可能
 * 
 * **閾値:**
 * - good: 80点以上、warning: 60-79点、critical: 59点以下
 * 
 * @param completeness - 完全性スコア
 * @param consistency - 一貫性スコア
 * @param validity - 妥当性スコア
 * @param traceability - 追跡可能性スコア
 * @returns 総合スコア（0-100点）
 * 
 * **拡張ポイント:**
 * - 重みを変更する場合: weightsオブジェクトの値を調整（合計1.0になるように）
 * - 新しい評価観点を追加する場合: weightsに新しいキーを追加し、計算式に含める
 */
function calculateOverallScore(
  completeness: QualityScore,
  consistency: QualityScore,
  validity: QualityScore,
  traceability: QualityScore
): QualityScore {
  // 重み付き平均（完全性と一貫性を重視）
  const weights = {
    completeness: 0.3,  // 30%: 必須要素の存在
    consistency: 0.3,   // 30%: ID整合性、参照整合性
    validity: 0.2,      // 20%: 説明の充実度、ステップ数の適切性
    traceability: 0.2,  // 20%: カバレッジ、孤立要素
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
