/**
 * @fileoverview 成熟度評価エンジン
 *
 * 目的: 定義された基準に基づいてプロジェクトの成熟度レベル(1-5)を評価する
 * エントリーポイント: assessUseCaseMaturity, assessActorMaturity, assessProjectMaturity
 *
 * アルゴリズム:
 * 1. 要素タイプの基準を取得
 * 2. 各基準を評価 → 満たす/満たさない
 * 3. レベルを計算: 全ての必須基準を満たす最高レベル
 * 4. ディメンション、次のステップ、工数見積を含む評価結果を構築
 *
 * 評価ロジックの特徴:
 * - uc-repeatable-steps-quality: 全ステップの品質を評価（action, expectedResult 各5文字以上）
 * - ステップ数は評価対象外: ドメイン特性に応じた柔軟な評価
 * - 詳細な設計判断: docs/maturity-criteria-evolution.md を参照
 *
 * 拡張ポイント:
 * - 新しい要素タイプを追加: maturity-criteria.ts の getCriteriaByElementType を更新
 * - 新しい基準を追加: UseCaseMaturityCriteria/ActorMaturityCriteria 配列に追加
 * - レベルロジックを変更: buildElementAssessment 関数を修正
 * - 新しいディメンションを追加: maturity-model.ts の MaturityDimension enum を更新
 */

import { normalizeActorRef } from '../../types/functional/actor.js';
import type { Actor, BusinessRequirementDefinition, UseCase } from '../../types/index.js';
import {
    getCriteriaByDimension,
    getCriteriaByElementType,
    getCriteriaByLevel,
} from './maturity-criteria.js';
import {
    CriterionEvaluation,
    DimensionMaturity,
    ElementMaturityAssessment,
    MaturityCriterion,
    MaturityDimension,
    MaturityLevel,
    NextStep,
    ProjectMaturityAssessment,
} from './maturity-model.js';

// ============================================================================
// 公開API - 要素評価
// ============================================================================

/**
 * ユースケースの成熟度レベルを評価
 * @param useCase - 評価対象のユースケース
 * @returns レベル、ディメンション、次のステップを含む評価結果
 */
export function assessUseCaseMaturity(useCase: UseCase): ElementMaturityAssessment {
  const criteria = getCriteriaByElementType('usecase');
  const evaluations = criteria.map(criterion => evaluateUseCaseCriterion(useCase, criterion));

  return buildElementAssessment(useCase.id, 'usecase', criteria, evaluations);
}

/**
 * アクターの成熟度レベルを評価
 * @param actor - 評価対象のアクター
 * @param useCases - 全ユースケース（カバレッジ確認に必要）
 * @returns レベル、ディメンション、次のステップを含む評価結果
 *
 * 注意: useCases は 'actor-managed-usecase-coverage' 基準に必要
 */
export function assessActorMaturity(
  actor: Actor,
  useCases: UseCase[] = []
): ElementMaturityAssessment {
  const criteria = getCriteriaByElementType('actor');
  const evaluations = criteria.map(criterion => evaluateActorCriterion(actor, criterion, useCases));

  return buildElementAssessment(actor.id, 'actor', criteria, evaluations);
}

/**
 * 業務要件の成熟度レベルを評価
 * @param requirement - 評価対象の業務要件
 * @returns レベル、ディメンション、次のステップを含む評価結果
 */
export function assessBusinessRequirementMaturity(
  requirement: BusinessRequirementDefinition
): ElementMaturityAssessment {
  const criteria = getCriteriaByElementType('business-requirement');
  const evaluations = criteria.map(criterion =>
    evaluateBusinessRequirementCriterion(requirement, criterion)
  );

  return buildElementAssessment(requirement.id, 'business-requirement', criteria, evaluations);
}

// ============================================================================
// 公開API - プロジェクト評価
// ============================================================================

/**
 * プロジェクト全体の成熟度を評価
 * @param requirements - 業務要件（現在は最初の1つを使用）
 * @param actors - 全アクター
 * @param useCases - 全ユースケース
 * @returns プロジェクト評価（レベル、要素内訳、ディメンション、推奨事項）
 *
 * アルゴリズム:
 * 1. 各要素を個別に評価
 * 2. プロジェクトレベル = 全要素レベルの最小値（最弱リンクの原則）
 * 3. レベル分布のヒストグラムを計算
 * 4. 全要素のディメンションスコアを集約
 * 5. 強み（上位ディメンション）と改善領域（下位ディメンション）を特定
 * 6. 優先順位付けされた推奨アクションを生成
 *
 * 拡張: 複数の業務要件をサポートする場合は brAssessment ロジックを修正
 */
export function assessProjectMaturity(
  requirements: BusinessRequirementDefinition[],
  actors: Actor[],
  useCases: UseCase[]
): ProjectMaturityAssessment {
  const timestamp = new Date().toISOString();

  // 全要素を評価
  const actorAssessments: ElementMaturityAssessment[] = actors.map(actor =>
    assessActorMaturity(actor, useCases)
  );

  const useCaseAssessments: ElementMaturityAssessment[] = useCases.map(uc =>
    assessUseCaseMaturity(uc)
  );

  const brAssessment =
    requirements.length > 0 ? assessBusinessRequirementMaturity(requirements[0]) : undefined;

  const allAssessments = [
    ...actorAssessments,
    ...useCaseAssessments,
    ...(brAssessment ? [brAssessment] : []),
  ];

  // プロジェクトレベル = 全要素の最小レベル（最弱リンク）
  const allLevels = allAssessments.map(a => a.overallLevel);
  const projectLevel = Math.min(...allLevels) as MaturityLevel;

  // レベル分布を計算
  const distribution: { [key in MaturityLevel]: number } = {
    [MaturityLevel.INITIAL]: 0,
    [MaturityLevel.REPEATABLE]: 0,
    [MaturityLevel.DEFINED]: 0,
    [MaturityLevel.MANAGED]: 0,
    [MaturityLevel.OPTIMIZED]: 0,
  };

  allLevels.forEach(level => {
    distribution[level]++;
  });

  // ディメンションスコアを集約
  const overallDimensions = calculateOverallDimensions(allAssessments);

  // 強み（高スコア）と改善領域（低スコア）を特定
  const strengths = identifyStrengths(overallDimensions);
  const improvementAreas = identifyImprovementAreas(overallDimensions);

  // 優先順位付けされた推奨事項を生成
  const recommendedActions = generateProjectRecommendations(
    allAssessments,
    overallDimensions,
    projectLevel
  );

  return {
    timestamp,
    projectLevel,
    elements: {
      businessRequirements: brAssessment,
      actors: actorAssessments,
      useCases: useCaseAssessments,
    },
    overallDimensions,
    strengths,
    improvementAreas,
    recommendedActions,
    distribution,
  };
}

// ============================================================================
// 内部関数 - 基準評価ロジック
// ============================================================================

/**
 * ユースケース基準を評価
 * @param useCase - 確認対象のユースケース
 * @param criterion - 評価する基準
 * @returns 満足フラグ、スコア、根拠を含む評価結果
 *
 * 拡張ポイント: 新しいユースケース基準を追加する際は、ここに新しい基準IDのcaseを追加
 * 各caseは以下を設定する必要がある:
 * 1. satisfied = true/false
 * 2. evidence = 説明メッセージ（推奨事項で使用される）
 */
function evaluateUseCaseCriterion(
  useCase: UseCase,
  criterion: MaturityCriterion
): CriterionEvaluation {
  let satisfied = false;
  let evidence = '';

  switch (criterion.id) {
    // レベル1: INITIAL
    case 'uc-initial-basic-info':
      satisfied = !!(useCase.id && useCase.name && useCase.description);
      evidence = satisfied ? 'ID、名前、説明が全て定義されている' : '基本情報が不足';
      break;

    case 'uc-initial-actors':
      satisfied = !!useCase.actors?.primary;
      evidence = satisfied ? 'プライマリアクターが定義されている' : 'プライマリアクター未定義';
      break;

    case 'uc-initial-flow':
      satisfied = (useCase.mainFlow?.length ?? 0) >= 1;
      evidence = satisfied
        ? `メインフロー ${useCase.mainFlow?.length ?? 0} ステップ`
        : 'メインフローが未定義';
      break;

    // レベル2: REPEATABLE
    case 'uc-repeatable-description':
      satisfied = (useCase.description?.length ?? 0) >= 50;
      evidence = `説明文字数: ${useCase.description?.length ?? 0}文字`;
      break;

    case 'uc-repeatable-preconditions':
      satisfied = (useCase.preconditions?.length ?? 0) >= 1;
      evidence = satisfied ? `事前条件 ${useCase.preconditions?.length ?? 0}個` : '事前条件未定義';
      break;

    case 'uc-repeatable-postconditions':
      satisfied = (useCase.postconditions?.length ?? 0) >= 1;
      evidence = satisfied ? `事後条件 ${useCase.postconditions?.length ?? 0}個` : '事後条件未定義';
      break;

    case 'uc-repeatable-steps-quality': {
      const hasQualitySteps =
        useCase.mainFlow?.every(
          step =>
            step.stepId &&
            step.actor &&
            step.action &&
            step.expectedResult &&
            (step.action?.length ?? 0) >= 5 &&
            (step.expectedResult?.length ?? 0) >= 5
        ) ?? false;
      const stepCount = useCase.mainFlow?.length ?? 0;
      satisfied = hasQualitySteps && stepCount > 0;
      evidence = satisfied
        ? `全${stepCount}ステップが具体的な内容を持つ`
        : `一部ステップの品質不足（action/expectedResultが5文字未満）`;
      break;
    }

    case 'uc-repeatable-priority':
      satisfied = !!useCase.priority;
      evidence = satisfied ? `優先度: ${useCase.priority}` : '優先度未設定';
      break;

    // レベル3: DEFINED
    case 'uc-defined-step-detail': {
      const hasCompleteSteps =
        useCase.mainFlow?.every(
          step => step.stepId && step.actor && step.action && step.expectedResult
        ) ?? false;
      satisfied = hasCompleteSteps && (useCase.mainFlow?.length ?? 0) > 0;
      evidence = satisfied ? '全ステップが完全な構造を持つ' : '一部ステップに不足あり';
      break;
    }

    case 'uc-defined-alternative-flows':
      satisfied = (useCase.alternativeFlows?.length ?? 0) >= 1;
      evidence = satisfied
        ? `代替フロー ${useCase.alternativeFlows?.length ?? 0}個`
        : '代替フロー未定義';
      break;

    case 'uc-defined-business-coverage':
      satisfied = !!useCase.businessRequirementCoverage;
      evidence = satisfied ? '業務要件カバレッジが定義されている' : 'カバレッジ未定義';
      break;

    case 'uc-defined-prerequisite-usecases':
      satisfied = (useCase.prerequisiteUseCases?.length ?? 0) >= 1;
      evidence = satisfied
        ? `前提ユースケース ${useCase.prerequisiteUseCases?.length ?? 0}個`
        : '前提ユースケース未定義';
      break;

    case 'uc-defined-acceptance-criteria':
      satisfied = (useCase.acceptanceCriteria?.length ?? 0) >= 1;
      evidence = satisfied
        ? `受け入れ基準 ${useCase.acceptanceCriteria?.length ?? 0}個`
        : '受け入れ基準未定義';
      break;

    case 'uc-defined-complexity':
      satisfied = !!useCase.complexity;
      evidence = satisfied ? `複雑度: ${useCase.complexity}` : '複雑度未評価';
      break;

    // レベル4: MANAGED
    case 'uc-managed-effort':
      satisfied = !!useCase.estimatedEffort;
      evidence = satisfied ? `見積工数: ${useCase.estimatedEffort}` : '工数未見積';
      break;

    case 'uc-managed-data-requirements':
      satisfied = (useCase.dataRequirements?.length ?? 0) >= 1;
      evidence = satisfied
        ? `データ要件 ${useCase.dataRequirements?.length ?? 0}個`
        : 'データ要件未定義';
      break;

    case 'uc-managed-performance':
      satisfied = (useCase.performanceRequirements?.length ?? 0) >= 1;
      evidence = satisfied
        ? `性能要件 ${useCase.performanceRequirements?.length ?? 0}個`
        : '性能要件未定義';
      break;

    case 'uc-managed-security':
      satisfied = (useCase.securityPolicies?.length ?? 0) >= 1;
      evidence = satisfied
        ? `セキュリティポリシー ${useCase.securityPolicies?.length ?? 0}個`
        : 'セキュリティポリシー未定義';
      break;

    case 'uc-managed-business-rules':
      satisfied = (useCase.businessRules?.length ?? 0) >= 1;
      evidence = satisfied
        ? `ビジネスルール ${useCase.businessRules?.length ?? 0}個`
        : 'ビジネスルール未定義';
      break;

    // レベル5: OPTIMIZED
    case 'uc-optimized-ui-requirements':
      satisfied = (useCase.uiRequirements?.length ?? 0) >= 1;
      evidence = satisfied ? `UI要件 ${useCase.uiRequirements?.length ?? 0}個` : 'UI要件未定義';
      break;

    case 'uc-optimized-error-handling': {
      const hasErrorHandling =
        useCase.mainFlow?.every(step => step.errorHandling && step.errorHandling.length > 0) ??
        false;
      satisfied = hasErrorHandling && (useCase.mainFlow?.length ?? 0) > 0;
      evidence = satisfied ? '全ステップにエラーハンドリングあり' : 'エラーハンドリング不足';
      break;
    }

    case 'uc-optimized-validation': {
      const hasValidation =
        useCase.mainFlow?.every(step => step.validationRules && step.validationRules.length > 0) ??
        false;
      satisfied = hasValidation && (useCase.mainFlow?.length ?? 0) > 0;
      evidence = satisfied ? '全ステップにバリデーションあり' : 'バリデーション不足';
      break;
    }

    case 'uc-optimized-business-value':
      satisfied = !!useCase.businessValue && useCase.businessValue.length >= 20;
      evidence = satisfied ? 'ビジネス価値が明確' : 'ビジネス価値の記述不足';
      break;

    default:
      satisfied = false;
      evidence = '評価ロジック未実装';
  }

  return {
    criterion,
    satisfied,
    score: satisfied ? 1.0 : 0.0,
    evidence,
  };
}

/**
 * アクター基準を評価
 * @param actor - 確認対象のアクター
 * @param criterion - 評価する基準
 * @param useCases - 全ユースケース（カバレッジ確認用）
 * @returns 評価結果
 *
 * 拡張ポイント: 新しいアクター基準を追加する際は、ここに新しい基準IDのcaseを追加
 */
function evaluateActorCriterion(
  actor: Actor,
  criterion: MaturityCriterion,
  useCases: UseCase[] = []
): CriterionEvaluation {
  let satisfied = false;
  let evidence = '';

  switch (criterion.id) {
    // レベル1: INITIAL
    case 'actor-initial-basic-info':
      satisfied = !!(actor.id && actor.name);
      evidence = satisfied ? 'ID、名前が定義されている' : '基本情報が不足';
      break;

    // レベル2: REPEATABLE
    case 'actor-repeatable-description':
      satisfied = !!actor.description && actor.description.length > 0;
      evidence = satisfied ? `説明: ${actor.description?.length ?? 0}文字` : '説明未定義';
      break;

    case 'actor-repeatable-role':
      satisfied = !!actor.role;
      evidence = satisfied ? `役割: ${actor.role}` : '役割未定義';
      break;

    // レベル3: DEFINED
    case 'actor-defined-responsibilities':
      satisfied = (actor.responsibilities?.length ?? 0) >= 2;
      evidence = satisfied ? `責務 ${actor.responsibilities?.length ?? 0}個` : '責務不足';
      break;

    case 'actor-defined-description-detail':
      satisfied = (actor.description?.length ?? 0) >= 30;
      evidence = `説明文字数: ${actor.description?.length ?? 0}文字`;
      break;

    // レベル4: MANAGED
    case 'actor-managed-usecase-coverage': {
      // アクターがユースケースで実際に参照されているか確認（プライマリまたはセカンダリ）
      const usedInUseCases = useCases.filter(uc => {
        // primary は ActorReference 型なので normalizeActorRef で ID に変換して比較
        const primaryActorId = uc.actors?.primary ? normalizeActorRef(uc.actors.primary) : null;
        const primaryMatch = primaryActorId === actor.id;

        // secondary は ActorReference[] 型なので各要素を normalizeActorRef で ID に変換
        const secondaryActorIds = uc.actors?.secondary?.map(normalizeActorRef) ?? [];
        const secondaryMatch = secondaryActorIds.includes(actor.id);

        return primaryMatch || secondaryMatch;
      });
      satisfied = usedInUseCases.length > 0;
      evidence = satisfied
        ? `${usedInUseCases.length}個のユースケースで使用されている: ${usedInUseCases.map(uc => uc.id).join(', ')}`
        : 'どのユースケースからも参照されていない';
      break;
    }

    case 'actor-managed-description-quality':
      satisfied = (actor.description?.length ?? 0) >= 50;
      evidence = `説明文字数: ${actor.description?.length ?? 0}文字 (50文字以上必要)`;
      break;

    // レベル5: OPTIMIZED
    case 'actor-optimized-goals':
      satisfied = (actor.goals?.length ?? 0) >= 1;
      evidence = satisfied ? `ゴール ${actor.goals?.length ?? 0}個` : 'ゴール未定義';
      break;

    case 'actor-optimized-comprehensive-description':
      satisfied = (actor.description?.length ?? 0) >= 80;
      evidence = `説明文字数: ${actor.description?.length ?? 0}文字 (80文字以上必要)`;
      break;

    default:
      satisfied = false;
      evidence = '評価ロジック未実装';
  }

  return {
    criterion,
    satisfied,
    score: satisfied ? 1.0 : 0.0,
    evidence,
  };
}

/**
 * 業務要件基準を評価
 * @param requirement - 確認対象の業務要件
 * @param criterion - 評価する基準
 * @returns 評価結果
 *
 * 拡張ポイント: 新しい業務要件基準を追加する際は、ここに新しい基準IDのcaseを追加
 */
function evaluateBusinessRequirementCriterion(
  requirement: BusinessRequirementDefinition,
  criterion: MaturityCriterion
): CriterionEvaluation {
  let satisfied = false;
  let evidence = '';

  switch (criterion.id) {
    // レベル1: INITIAL
    case 'br-initial-basic-info':
      satisfied = !!(requirement.id && requirement.name);
      evidence = satisfied ? 'ID、名前が定義されている' : '基本情報が不足';
      break;

    // レベル2: REPEATABLE
    case 'br-repeatable-summary':
      satisfied = !!requirement.summary && requirement.summary.length > 0;
      evidence = satisfied ? `要約: ${requirement.summary.length}文字` : '要約未定義';
      break;

    case 'br-repeatable-goals':
      satisfied = (requirement.businessGoals?.length ?? 0) >= 1;
      evidence = satisfied
        ? `ビジネスゴール ${requirement.businessGoals?.length ?? 0}個`
        : 'ビジネスゴール未定義';
      break;

    case 'br-repeatable-scope':
      satisfied = (requirement.scope?.inScope?.length ?? 0) >= 1;
      evidence = satisfied
        ? `スコープ項目 ${requirement.scope?.inScope?.length ?? 0}個`
        : 'スコープ未定義';
      break;

    // レベル3: DEFINED
    case 'br-defined-stakeholders':
      satisfied = (requirement.stakeholders?.length ?? 0) >= 2;
      evidence = satisfied
        ? `ステークホルダー ${requirement.stakeholders?.length ?? 0}人`
        : 'ステークホルダー不足';
      break;

    case 'br-defined-metrics':
      satisfied = (requirement.successMetrics?.length ?? 0) >= 1;
      evidence = satisfied
        ? `成功指標 ${requirement.successMetrics?.length ?? 0}個`
        : '成功指標未定義';
      break;

    case 'br-defined-assumptions':
      satisfied = (requirement.assumptions?.length ?? 0) >= 1;
      evidence = satisfied
        ? `前提条件 ${requirement.assumptions?.length ?? 0}個`
        : '前提条件未定義';
      break;

    case 'br-defined-constraints':
      satisfied = (requirement.constraints?.length ?? 0) >= 1;
      evidence = satisfied
        ? `制約条件 ${requirement.constraints?.length ?? 0}個`
        : '制約条件未定義';
      break;

    // レベル4: MANAGED
    case 'br-managed-business-rules':
      satisfied = (requirement.businessRules?.length ?? 0) >= 3;
      evidence = satisfied
        ? `ビジネスルール ${requirement.businessRules?.length ?? 0}個`
        : 'ビジネスルール不足';
      break;

    case 'br-managed-security':
      satisfied = (requirement.securityPolicies?.length ?? 0) >= 1;
      evidence = satisfied
        ? `セキュリティポリシー ${requirement.securityPolicies?.length ?? 0}個`
        : 'セキュリティポリシー未定義';
      break;

    // レベル5: OPTIMIZED
    case 'br-optimized-coverage':
      // 注意: プロジェクト全体のコンテキスト（全ユースケース）が必要
      // TODO: 実際のカバレッジ計算を実装
      satisfied = false;
      evidence = 'カバレッジ計算は別途実装が必要';
      break;

    default:
      satisfied = false;
      evidence = '評価ロジック未実装';
  }

  return {
    criterion,
    satisfied,
    score: satisfied ? 1.0 : 0.0,
    evidence,
  };
}

// ============================================================================
// 内部関数 - 評価結果の構築
// ============================================================================

/**
 * 評価結果から要素評価を構築
 * @param elementId - 要素ID
 * @param elementType - 要素のタイプ
 * @param criteria - この要素タイプの全基準
 * @param evaluations - 各基準の評価結果
 * @returns レベル、ディメンション、次のステップを含む完全な評価
 *
 * アルゴリズム:
 * 1. 基準を満たす/満たさないに分割
 * 2. 全体レベルを決定: 全ての必須基準を満たす最高レベル
 * 3. 全体完成率を計算（重み付き平均）
 * 4. ディメンションスコアを計算
 * 5. 未達成基準に基づいて次のステップを生成
 * 6. 未達成基準数に基づいて工数を見積もり
 *
 * レベル決定ロジック:
 * - レベル1から開始、全ての必須基準が満たされているか確認
 * - 満たされていればは次のレベルへ
 * - 満たされていなければ停止し、前のレベルを返す
 * - これによりレベルのスキップを防ぐ
 */
function buildElementAssessment(
  elementId: string,
  elementType: 'business-requirement' | 'actor' | 'usecase',
  criteria: MaturityCriterion[],
  evaluations: CriterionEvaluation[]
): ElementMaturityAssessment {
  const satisfiedCriteria = evaluations.filter(e => e.satisfied).map(e => e.criterion);

  const unsatisfiedCriteria = evaluations.filter(e => !e.satisfied).map(e => e.criterion);

  // 成熟度レベルを決定（全ての必須基準を満たす最高レベル）
  let overallLevel = MaturityLevel.INITIAL;

  // レベル1から5まで順次確認
  for (let level = MaturityLevel.INITIAL; level <= MaturityLevel.OPTIMIZED; level++) {
    const levelCriteria = getCriteriaByLevel(elementType, level);
    const requiredCriteria = levelCriteria.filter(c => c.required);
    const allRequiredSatisfied = requiredCriteria.every(rc =>
      satisfiedCriteria.some(sc => sc.id === rc.id)
    );

    if (allRequiredSatisfied) {
      overallLevel = level;
    } else {
      break; // 必須基準が満たされていない最初のレベルで停止
    }
  }

  // 全体完成率を計算（重み付き、0-1スケール）
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const satisfiedWeight = satisfiedCriteria.reduce((sum, c) => sum + c.weight, 0);
  const overallCompletionRate = totalWeight > 0 ? satisfiedWeight / totalWeight : 0;

  // ディメンション別スコアを計算
  const dimensions = calculateDimensionMaturity(elementType, evaluations);

  // 実行可能な次のステップを生成
  const nextSteps = generateNextSteps(elementType, overallLevel, unsatisfiedCriteria, dimensions);

  // 工数見積もり（時間）
  const estimatedEffort = estimateEffort(unsatisfiedCriteria.length);

  return {
    elementId,
    elementType,
    overallLevel,
    overallCompletionRate,
    dimensions,
    satisfiedCriteria,
    unsatisfiedCriteria,
    nextSteps,
    estimatedEffort,
  };
}

/**
 * ディメンション別の成熟度を計算
 * @param elementType - 要素のタイプ
 * @param evaluations - この要素の全評価
 * @returns ディメンションスコアの配列
 *
 * アルゴリズム:
 * 1. 各ディメンション（全5ディメンション）について
 * 2. ディメンションで評価をフィルタ
 * 3. 完成率 = 満たされた重み / 合計重み を計算
 * 4. 現在のレベル = 満たされた最大レベル を決定
 * 5. 次のレベルに不足している基準を見つける
 */
function calculateDimensionMaturity(
  elementType: 'business-requirement' | 'actor' | 'usecase',
  evaluations: CriterionEvaluation[]
): DimensionMaturity[] {
  const dimensions: MaturityDimension[] = [
    MaturityDimension.STRUCTURE,
    MaturityDimension.DETAIL,
    MaturityDimension.TRACEABILITY,
    MaturityDimension.TESTABILITY,
    MaturityDimension.MAINTAINABILITY,
  ];

  return dimensions.map(dimension => {
    const dimensionCriteria = getCriteriaByDimension(elementType, dimension);
    const dimensionEvaluations = evaluations.filter(e => e.criterion.dimension === dimension);

    // 完成率を計算（重み付き）
    const totalWeight = dimensionCriteria.reduce((sum, c) => sum + c.weight, 0);
    const satisfiedWeight = dimensionEvaluations
      .filter(e => e.satisfied)
      .reduce((sum, e) => sum + e.criterion.weight, 0);
    const completionRate = totalWeight > 0 ? satisfiedWeight / totalWeight : 0;

    // 現在のレベルを決定（満たされた最大レベル）
    const satisfiedLevels = dimensionEvaluations
      .filter(e => e.satisfied)
      .map(e => e.criterion.level);
    const currentLevel =
      satisfiedLevels.length > 0
        ? (Math.max(...satisfiedLevels) as MaturityLevel)
        : MaturityLevel.INITIAL;

    // 次のレベルに不足している基準を見つける
    const nextLevel = Math.min(currentLevel + 1, MaturityLevel.OPTIMIZED) as MaturityLevel;
    const missingCriteria = dimensionCriteria.filter(
      c =>
        c.level === nextLevel && !dimensionEvaluations.find(e => e.criterion.id === c.id)?.satisfied
    );

    return {
      dimension,
      currentLevel,
      completionRate,
      evaluations: dimensionEvaluations,
      missingCriteria,
    };
  });
}

// ============================================================================
// 内部関数 - プロジェクトレベル集約
// ============================================================================

/**
 * 全要素にわたるディメンション成熟度を計算
 * @param assessments - 全要素の評価
 * @returns 集約されたディメンションスコア
 *
 * アルゴリズム:
 * 1. 各ディメンションについて
 * 2. 全要素からディメンションデータを収集
 * 3. 平均完成率を計算
 * 4. 最小レベルを決定（最弱の要素）
 * 5. 要素全体の不足基準を収集
 */
function calculateOverallDimensions(assessments: ElementMaturityAssessment[]): DimensionMaturity[] {
  const dimensions: MaturityDimension[] = [
    MaturityDimension.STRUCTURE,
    MaturityDimension.DETAIL,
    MaturityDimension.TRACEABILITY,
    MaturityDimension.TESTABILITY,
    MaturityDimension.MAINTAINABILITY,
  ];

  return dimensions.map(dimension => {
    const dimensionAssessments = assessments.flatMap(a =>
      a.dimensions.filter(d => d.dimension === dimension)
    );

    if (dimensionAssessments.length === 0) {
      return {
        dimension,
        currentLevel: MaturityLevel.INITIAL,
        completionRate: 0,
        evaluations: [],
        missingCriteria: [],
      };
    }

    // 全要素の平均完成率
    const avgCompletionRate =
      dimensionAssessments.reduce((sum, d) => sum + d.completionRate, 0) /
      dimensionAssessments.length;

    // 最小レベル（最弱の要素がプロジェクトレベルを決定）
    const minLevel = Math.min(...dimensionAssessments.map(d => d.currentLevel)) as MaturityLevel;

    const allEvaluations = dimensionAssessments.flatMap(d => d.evaluations);
    const allMissingCriteria = dimensionAssessments.flatMap(d => d.missingCriteria);

    return {
      dimension,
      currentLevel: minLevel,
      completionRate: avgCompletionRate,
      evaluations: allEvaluations,
      missingCriteria: allMissingCriteria,
    };
  });
}

/**
 * プロジェクトの強みを特定（高得点ディメンション）
 * @param dimensions - ディメンションスコア
 * @returns 強みの説明の配列
 *
 * 閾値: 80%完成率
 */
function identifyStrengths(dimensions: DimensionMaturity[]): string[] {
  const strengths: string[] = [];

  dimensions.forEach(dim => {
    if (dim.completionRate >= 0.8) {
      const dimensionName = getDimensionName(dim.dimension);
      strengths.push(
        `${dimensionName}が高い成熟度に達している (${(dim.completionRate * 100).toFixed(0)}%)`
      );
    }
  });

  return strengths;
}

/**
 * 改善領域を特定（低得点ディメンション）
 * @param dimensions - ディメンションスコア
 * @returns 改善領域の説明の配列
 *
 * 閾値: 60%完成率未満
 */
function identifyImprovementAreas(dimensions: DimensionMaturity[]): string[] {
  const areas: string[] = [];

  dimensions.forEach(dim => {
    if (dim.completionRate < 0.6) {
      const dimensionName = getDimensionName(dim.dimension);
      areas.push(`${dimensionName}の強化が必要 (現在${(dim.completionRate * 100).toFixed(0)}%)`);
    }
  });

  return areas;
}

// ============================================================================
// 内部関数 - 推奨事項生成
// ============================================================================

/**
 * 要素改善の次のステップを生成
 * @param elementType - 要素のタイプ
 * @param currentLevel - 現在の成熟度レベル
 * @param unsatisfiedCriteria - まだ満たされていない基準
 * @param dimensions - ディメンションスコア
 * @returns 優先順位付けされた実行可能なステップのリスト
 *
 * 優先順位付け:
 * 1. 次のレベルに必要な必須基準（高優先度）
 * 2. 重みの高いオプション基準（中優先度）
 * 3. 下位レベルの未達成基準（低優先度）
 */
function generateNextSteps(
  elementType: 'business-requirement' | 'actor' | 'usecase',
  currentLevel: MaturityLevel,
  unsatisfiedCriteria: MaturityCriterion[],
  dimensions: DimensionMaturity[]
): NextStep[] {
  const steps: NextStep[] = [];

  // 高優先度: 次のレベルに必要な必須基準
  const nextLevel = Math.min(currentLevel + 1, MaturityLevel.OPTIMIZED) as MaturityLevel;
  const nextLevelRequired = unsatisfiedCriteria
    .filter(c => c.level === nextLevel && c.required)
    .sort((a, b) => b.weight - a.weight); // 重みの降順でソート

  nextLevelRequired.forEach(criterion => {
    steps.push({
      action: `${criterion.name}: ${criterion.description}`,
      priority: 'high',
      rationale: `レベル${nextLevel}達成に必須`,
      unlocksCriteria: [criterion.id],
      estimatedTime: 'small',
    });
  });

  // 中優先度: 弱いディメンションを改善
  const weakDimensions = dimensions
    .filter(d => d.completionRate < 0.7)
    .sort((a, b) => a.completionRate - b.completionRate);

  weakDimensions.slice(0, 2).forEach(dim => {
    const dimCriteria = unsatisfiedCriteria
      .filter(c => c.dimension === dim.dimension)
      .sort((a, b) => b.weight - a.weight)[0];

    if (dimCriteria) {
      steps.push({
        action: `${dimCriteria.name}: ${dimCriteria.description}`,
        priority: 'medium',
        rationale: `${getDimensionName(dim.dimension)}の強化`,
        unlocksCriteria: [dimCriteria.id],
        estimatedTime: 'medium',
      });
    }
  });

  return steps.slice(0, 5); // 上位5件に制限
}

/**
 * プロジェクト全体の推奨事項を生成
 * @param elementAssessments - 全要素の評価
 * @param dimensions - プロジェクト全体のディメンションスコア
 * @param projectLevel - プロジェクト全体の成熟度レベル
 * @returns 優先順位付けされたプロジェクトレベルのアクション
 *
 * 戦略:
 * 1. 最弱の要素を特定（最低レベル）
 * 2. プロジェクト全体の弱いディメンションに焦点を当てる
 * 3. 体系的な改善を提案
 */
function generateProjectRecommendations(
  elementAssessments: ElementMaturityAssessment[],
  dimensions: DimensionMaturity[],
  _projectLevel: MaturityLevel
): NextStep[] {
  const recommendations: NextStep[] = [];

  // 最低成熟度レベルの要素を特定
  const lowestLevel = Math.min(...elementAssessments.map(a => a.overallLevel));
  const lowestElements = elementAssessments.filter(a => a.overallLevel === lowestLevel);

  if (lowestElements.length > 0) {
    recommendations.push({
      action: `レベル${lowestLevel}の要素を優先的に改善 (${lowestElements.length}個)`,
      priority: 'high',
      rationale: 'プロジェクト全体のレベルを引き上げるため',
      unlocksCriteria: [],
      estimatedTime: 'large',
    });
  }

  // プロジェクト全体で最弱のディメンションを強化
  const weakestDimension = dimensions.sort((a, b) => a.completionRate - b.completionRate)[0];
  if (weakestDimension && weakestDimension.completionRate < 0.7) {
    recommendations.push({
      action: `プロジェクト全体で${getDimensionName(weakestDimension.dimension)}を強化`,
      priority: 'high',
      rationale: `現在の完成度: ${(weakestDimension.completionRate * 100).toFixed(0)}%`,
      unlocksCriteria: weakestDimension.missingCriteria.map(c => c.id),
      estimatedTime: 'large',
    });
  }

  return recommendations;
}

// ============================================================================
// 内部関数 - ユーティリティ関数
// ============================================================================

/**
 * 未達成基準を満たすのに必要な工数を見積もる
 * @param unsatisfiedCount - 未達成基準の数
 * @returns 人間が読める工数見積もり
 *
 * 閾値:
 * - 1-3: 小（1-2時間）
 * - 4-8: 中（半日）
 * - 9-15: 大（1-2日）
 * - 16+: 特大（3日以上）
 */
function estimateEffort(unsatisfiedCount: number): string {
  if (unsatisfiedCount <= 3) return '小 (1-2時間)';
  if (unsatisfiedCount <= 8) return '中 (半日)';
  if (unsatisfiedCount <= 15) return '大 (1-2日)';
  return '特大 (3日以上)';
}

/**
 * ディメンションの日本語名を取得
 * @param dimension - ディメンションのenum値
 * @returns 人間が読めるディメンション名（日本語）
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
