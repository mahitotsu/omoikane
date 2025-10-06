/**
 * 成熟度評価ロジック
 * 
 * 定義された基準に基づいて要素とプロジェクトの成熟度を評価
 */

import type {
    Actor,
    BusinessRequirementDefinition,
    UseCase,
} from '../../types/index.js';
import {
    getCriteriaByDimension,
    getCriteriaByElementType,
    getCriteriaByLevel
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

/**
 * ユースケースの成熟度評価
 */
export function assessUseCaseMaturity(useCase: UseCase): ElementMaturityAssessment {
  const criteria = getCriteriaByElementType('usecase');
  const evaluations = criteria.map(criterion => 
    evaluateUseCaseCriterion(useCase, criterion)
  );
  
  return buildElementAssessment(
    useCase.id,
    'usecase',
    criteria,
    evaluations
  );
}

/**
 * アクターの成熟度評価
 */
export function assessActorMaturity(actor: Actor, useCases: UseCase[] = []): ElementMaturityAssessment {
  const criteria = getCriteriaByElementType('actor');
  const evaluations = criteria.map(criterion =>
    evaluateActorCriterion(actor, criterion, useCases)
  );
  
  return buildElementAssessment(
    actor.id,
    'actor',
    criteria,
    evaluations
  );
}

/**
 * 業務要件定義の成熟度評価
 */
export function assessBusinessRequirementMaturity(
  requirement: BusinessRequirementDefinition
): ElementMaturityAssessment {
  const criteria = getCriteriaByElementType('business-requirement');
  const evaluations = criteria.map(criterion =>
    evaluateBusinessRequirementCriterion(requirement, criterion)
  );
  
  return buildElementAssessment(
    requirement.id,
    'business-requirement',
    criteria,
    evaluations
  );
}

/**
 * プロジェクト全体の成熟度評価
 */
export function assessProjectMaturity(
  requirements: BusinessRequirementDefinition[],
  actors: Actor[],
  useCases: UseCase[]
): ProjectMaturityAssessment {
  const timestamp = new Date().toISOString();
  
  // 各要素の評価（アクター評価にはユースケース情報が必要）
  const actorAssessments: ElementMaturityAssessment[] = actors.map(actor => 
    assessActorMaturity(actor, useCases)
  );
  
  const useCaseAssessments: ElementMaturityAssessment[] = useCases.map(uc =>
    assessUseCaseMaturity(uc)
  );
  
  const brAssessment = requirements.length > 0 
    ? assessBusinessRequirementMaturity(requirements[0])
    : undefined;
  
  const allAssessments = [
    ...actorAssessments,
    ...useCaseAssessments,
    ...(brAssessment ? [brAssessment] : [])
  ];
  
  // 全体の成熟度レベルを計算（最も低い要素のレベル）
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
  
  // ディメンション別の全体評価
  const overallDimensions = calculateOverallDimensions(allAssessments);
  
  // 強み・改善領域を特定
  const strengths = identifyStrengths(overallDimensions);
  const improvementAreas = identifyImprovementAreas(overallDimensions);
  
  // 推奨アクションを生成
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

/**
 * ユースケースの基準評価
 */
function evaluateUseCaseCriterion(
  useCase: UseCase,
  criterion: MaturityCriterion
): CriterionEvaluation {
  let satisfied = false;
  let evidence = '';
  
  switch (criterion.id) {
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
      evidence = satisfied ? `メインフロー ${useCase.mainFlow?.length ?? 0} ステップ` : 'メインフローが未定義';
      break;
      
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
      
    case 'uc-repeatable-flow-detail':
      satisfied = (useCase.mainFlow?.length ?? 0) >= 3;
      evidence = `メインフロー ${useCase.mainFlow?.length ?? 0} ステップ`;
      break;
      
    case 'uc-repeatable-priority':
      satisfied = !!useCase.priority;
      evidence = satisfied ? `優先度: ${useCase.priority}` : '優先度未設定';
      break;
      
    case 'uc-defined-step-detail':
      const hasCompleteSteps = useCase.mainFlow?.every(step =>
        step.stepId && step.actor && step.action && step.expectedResult
      ) ?? false;
      satisfied = hasCompleteSteps && (useCase.mainFlow?.length ?? 0) > 0;
      evidence = satisfied ? '全ステップが完全な構造を持つ' : '一部ステップに不足あり';
      break;
      
    case 'uc-defined-alternative-flows':
      satisfied = (useCase.alternativeFlows?.length ?? 0) >= 1;
      evidence = satisfied ? `代替フロー ${useCase.alternativeFlows?.length ?? 0}個` : '代替フロー未定義';
      break;
      
    case 'uc-defined-business-coverage':
      satisfied = !!useCase.businessRequirementCoverage;
      evidence = satisfied ? '業務要件カバレッジが定義されている' : 'カバレッジ未定義';
      break;
      
    case 'uc-defined-acceptance-criteria':
      satisfied = (useCase.acceptanceCriteria?.length ?? 0) >= 1;
      evidence = satisfied ? `受け入れ基準 ${useCase.acceptanceCriteria?.length ?? 0}個` : '受け入れ基準未定義';
      break;
      
    case 'uc-defined-complexity':
      satisfied = !!useCase.complexity;
      evidence = satisfied ? `複雑度: ${useCase.complexity}` : '複雑度未評価';
      break;
      
    case 'uc-managed-effort':
      satisfied = !!useCase.estimatedEffort;
      evidence = satisfied ? `見積工数: ${useCase.estimatedEffort}` : '工数未見積';
      break;
      
    case 'uc-managed-data-requirements':
      satisfied = (useCase.dataRequirements?.length ?? 0) >= 1;
      evidence = satisfied ? `データ要件 ${useCase.dataRequirements?.length ?? 0}個` : 'データ要件未定義';
      break;
      
    case 'uc-managed-performance':
      satisfied = (useCase.performanceRequirements?.length ?? 0) >= 1;
      evidence = satisfied ? `性能要件 ${useCase.performanceRequirements?.length ?? 0}個` : '性能要件未定義';
      break;
      
    case 'uc-managed-security':
      satisfied = (useCase.securityPolicies?.length ?? 0) >= 1;
      evidence = satisfied ? `セキュリティポリシー ${useCase.securityPolicies?.length ?? 0}個` : 'セキュリティポリシー未定義';
      break;
      
    case 'uc-managed-business-rules':
      satisfied = (useCase.businessRules?.length ?? 0) >= 1;
      evidence = satisfied ? `ビジネスルール ${useCase.businessRules?.length ?? 0}個` : 'ビジネスルール未定義';
      break;
      
    case 'uc-optimized-ui-requirements':
      satisfied = (useCase.uiRequirements?.length ?? 0) >= 1;
      evidence = satisfied ? `UI要件 ${useCase.uiRequirements?.length ?? 0}個` : 'UI要件未定義';
      break;
      
    case 'uc-optimized-error-handling':
      const hasErrorHandling = useCase.mainFlow?.every(step =>
        step.errorHandling && step.errorHandling.length > 0
      ) ?? false;
      satisfied = hasErrorHandling && (useCase.mainFlow?.length ?? 0) > 0;
      evidence = satisfied ? '全ステップにエラーハンドリングあり' : 'エラーハンドリング不足';
      break;
      
    case 'uc-optimized-validation':
      const hasValidation = useCase.mainFlow?.every(step =>
        step.validationRules && step.validationRules.length > 0
      ) ?? false;
      satisfied = hasValidation && (useCase.mainFlow?.length ?? 0) > 0;
      evidence = satisfied ? '全ステップにバリデーションあり' : 'バリデーション不足';
      break;
      
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
 * アクターの基準評価
 */
function evaluateActorCriterion(
  actor: Actor,
  criterion: MaturityCriterion,
  useCases: UseCase[] = []
): CriterionEvaluation {
  let satisfied = false;
  let evidence = '';
  
  switch (criterion.id) {
    case 'actor-initial-basic-info':
      satisfied = !!(actor.id && actor.name);
      evidence = satisfied ? 'ID、名前が定義されている' : '基本情報が不足';
      break;
      
    case 'actor-repeatable-description':
      satisfied = !!actor.description && actor.description.length > 0;
      evidence = satisfied ? `説明: ${actor.description?.length ?? 0}文字` : '説明未定義';
      break;
      
    case 'actor-repeatable-role':
      satisfied = !!actor.role;
      evidence = satisfied ? `役割: ${actor.role}` : '役割未定義';
      break;
      
    case 'actor-defined-responsibilities':
      satisfied = (actor.responsibilities?.length ?? 0) >= 2;
      evidence = satisfied ? `責務 ${actor.responsibilities?.length ?? 0}個` : '責務不足';
      break;
      
    case 'actor-defined-description-detail':
      satisfied = (actor.description?.length ?? 0) >= 30;
      evidence = `説明文字数: ${actor.description?.length ?? 0}文字`;
      break;
      
    case 'actor-managed-usecase-coverage':
      // 実際にユースケースで参照されているか確認
      const usedInUseCases = useCases.filter(uc => {
        const primaryMatch = uc.actors?.primary === actor.id;
        const secondaryMatch = uc.actors?.secondary?.includes(actor.id) ?? false;
        return primaryMatch || secondaryMatch;
      });
      satisfied = usedInUseCases.length > 0;
      evidence = satisfied 
        ? `${usedInUseCases.length}個のユースケースで使用されている`
        : 'どのユースケースからも参照されていない';
      break;
      
    case 'actor-managed-description-quality':
      satisfied = (actor.description?.length ?? 0) >= 50;
      evidence = `説明文字数: ${actor.description?.length ?? 0}文字 (50文字以上必要)`;
      break;
      
    case 'actor-optimized-goals':
      // Actor型にgoalsプロパティがないため評価不可
      satisfied = false;
      evidence = 'ゴール未定義（Actor型に未実装）';
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
 * 業務要件定義の基準評価
 */
function evaluateBusinessRequirementCriterion(
  requirement: BusinessRequirementDefinition,
  criterion: MaturityCriterion
): CriterionEvaluation {
  let satisfied = false;
  let evidence = '';
  
  switch (criterion.id) {
    case 'br-initial-basic-info':
      satisfied = !!(requirement.id && requirement.name);
      evidence = satisfied ? 'ID、名前が定義されている' : '基本情報が不足';
      break;
      
    case 'br-repeatable-summary':
      satisfied = !!requirement.summary && requirement.summary.length > 0;
      evidence = satisfied ? `要約: ${requirement.summary.length}文字` : '要約未定義';
      break;
      
    case 'br-repeatable-goals':
      satisfied = (requirement.businessGoals?.length ?? 0) >= 1;
      evidence = satisfied ? `ビジネスゴール ${requirement.businessGoals?.length ?? 0}個` : 'ビジネスゴール未定義';
      break;
      
    case 'br-repeatable-scope':
      satisfied = (requirement.scope?.inScope?.length ?? 0) >= 1;
      evidence = satisfied ? `スコープ項目 ${requirement.scope?.inScope?.length ?? 0}個` : 'スコープ未定義';
      break;
      
    case 'br-defined-stakeholders':
      satisfied = (requirement.stakeholders?.length ?? 0) >= 2;
      evidence = satisfied ? `ステークホルダー ${requirement.stakeholders?.length ?? 0}人` : 'ステークホルダー不足';
      break;
      
    case 'br-defined-metrics':
      satisfied = (requirement.successMetrics?.length ?? 0) >= 1;
      evidence = satisfied ? `成功指標 ${requirement.successMetrics?.length ?? 0}個` : '成功指標未定義';
      break;
      
    case 'br-defined-assumptions':
      satisfied = (requirement.assumptions?.length ?? 0) >= 1;
      evidence = satisfied ? `前提条件 ${requirement.assumptions?.length ?? 0}個` : '前提条件未定義';
      break;
      
    case 'br-defined-constraints':
      satisfied = (requirement.constraints?.length ?? 0) >= 1;
      evidence = satisfied ? `制約条件 ${requirement.constraints?.length ?? 0}個` : '制約条件未定義';
      break;
      
    case 'br-managed-business-rules':
      satisfied = (requirement.businessRules?.length ?? 0) >= 3;
      evidence = satisfied ? `ビジネスルール ${requirement.businessRules?.length ?? 0}個` : 'ビジネスルール不足';
      break;
      
    case 'br-managed-security':
      satisfied = (requirement.securityPolicies?.length ?? 0) >= 1;
      evidence = satisfied ? `セキュリティポリシー ${requirement.securityPolicies?.length ?? 0}個` : 'セキュリティポリシー未定義';
      break;
      
    case 'br-optimized-coverage':
      // この評価はプロジェクト全体のコンテキストが必要
      satisfied = false; // TODO: 実際のカバレッジ計算
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

/**
 * 要素の評価結果を構築
 */
function buildElementAssessment(
  elementId: string,
  elementType: 'business-requirement' | 'actor' | 'usecase',
  criteria: MaturityCriterion[],
  evaluations: CriterionEvaluation[]
): ElementMaturityAssessment {
  const satisfiedCriteria = evaluations
    .filter(e => e.satisfied)
    .map(e => e.criterion);
    
  const unsatisfiedCriteria = evaluations
    .filter(e => !e.satisfied)
    .map(e => e.criterion);
  
  // 成熟度レベルを決定（満たした最高レベル）
  const achievedLevels = new Set(satisfiedCriteria.map(c => c.level));
  let overallLevel = MaturityLevel.INITIAL;
  
  // レベル1から順に必須基準が全て満たされているか確認
  for (let level = MaturityLevel.INITIAL; level <= MaturityLevel.OPTIMIZED; level++) {
    const levelCriteria = getCriteriaByLevel(elementType, level);
    const requiredCriteria = levelCriteria.filter(c => c.required);
    const allRequiredSatisfied = requiredCriteria.every(rc =>
      satisfiedCriteria.some(sc => sc.id === rc.id)
    );
    
    if (allRequiredSatisfied) {
      overallLevel = level;
    } else {
      break; // 必須基準が満たされていないレベルに到達したら終了
    }
  }
  
  // 完成率を計算（重み付き、0-1スケール）
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const satisfiedWeight = satisfiedCriteria.reduce((sum, c) => sum + c.weight, 0);
  const overallCompletionRate = totalWeight > 0 ? satisfiedWeight / totalWeight : 0;
  
  // ディメンション別の評価
  const dimensions = calculateDimensionMaturity(
    elementType,
    evaluations
  );
  
  // 次のステップを生成
  const nextSteps = generateNextSteps(
    elementType,
    overallLevel,
    unsatisfiedCriteria,
    dimensions
  );
  
  // 工数見積もり
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
    
    // 達成率を計算
    const totalWeight = dimensionCriteria.reduce((sum, c) => sum + c.weight, 0);
    const satisfiedWeight = dimensionEvaluations
      .filter(e => e.satisfied)
      .reduce((sum, e) => sum + e.criterion.weight, 0);
    const completionRate = totalWeight > 0 ? satisfiedWeight / totalWeight : 0;
    
    // 現在のレベルを決定（満たした最高レベル）
    const satisfiedLevels = dimensionEvaluations
      .filter(e => e.satisfied)
      .map(e => e.criterion.level);
    const currentLevel = satisfiedLevels.length > 0 
      ? Math.max(...satisfiedLevels) as MaturityLevel
      : MaturityLevel.INITIAL;
    
    // 次のレベルに必要な不足基準
    const nextLevel = Math.min(currentLevel + 1, MaturityLevel.OPTIMIZED) as MaturityLevel;
    const missingCriteria = dimensionCriteria.filter(c =>
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

/**
 * 全体のディメンション成熟度を計算
 */
function calculateOverallDimensions(
  assessments: ElementMaturityAssessment[]
): DimensionMaturity[] {
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
    
    const avgCompletionRate = dimensionAssessments.reduce((sum, d) => sum + d.completionRate, 0) 
      / dimensionAssessments.length;
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
 * 強みを特定
 */
function identifyStrengths(dimensions: DimensionMaturity[]): string[] {
  const strengths: string[] = [];
  
  dimensions.forEach(dim => {
    if (dim.completionRate >= 0.8) {
      const dimensionName = getDimensionName(dim.dimension);
      strengths.push(`${dimensionName}が高い成熟度に達している (${(dim.completionRate * 100).toFixed(0)}%)`);
    }
  });
  
  return strengths;
}

/**
 * 改善領域を特定
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

/**
 * 次のステップを生成
 */
function generateNextSteps(
  elementType: 'business-requirement' | 'actor' | 'usecase',
  currentLevel: MaturityLevel,
  unsatisfiedCriteria: MaturityCriterion[],
  dimensions: DimensionMaturity[]
): NextStep[] {
  const steps: NextStep[] = [];
  
  // 次のレベルに必要な必須基準を抽出
  const nextLevel = Math.min(currentLevel + 1, MaturityLevel.OPTIMIZED) as MaturityLevel;
  const nextLevelRequired = unsatisfiedCriteria
    .filter(c => c.level === nextLevel && c.required)
    .sort((a, b) => b.weight - a.weight);
  
  nextLevelRequired.forEach(criterion => {
    steps.push({
      action: `${criterion.name}: ${criterion.description}`,
      priority: 'high',
      rationale: `レベル${nextLevel}達成に必須`,
      unlocksCriteria: [criterion.id],
      estimatedTime: 'small',
    });
  });
  
  // 弱いディメンションの改善を提案
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
  
  return steps.slice(0, 5); // 上位5件まで
}

/**
 * プロジェクト全体の推奨アクションを生成
 */
function generateProjectRecommendations(
  elementAssessments: ElementMaturityAssessment[],
  dimensions: DimensionMaturity[],
  projectLevel: MaturityLevel
): NextStep[] {
  const recommendations: NextStep[] = [];
  
  // 最もレベルが低い要素を特定
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
  
  // 弱いディメンションの全体的な改善
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

/**
 * 工数見積もり
 */
function estimateEffort(unsatisfiedCount: number): string {
  if (unsatisfiedCount <= 3) return '小 (1-2時間)';
  if (unsatisfiedCount <= 8) return '中 (半日)';
  if (unsatisfiedCount <= 15) return '大 (1-2日)';
  return '特大 (3日以上)';
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
