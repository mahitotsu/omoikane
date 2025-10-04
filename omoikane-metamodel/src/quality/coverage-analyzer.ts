/**
 * カバレッジ分析エンジン
 * 業務要件定義とユースケースの対応関係を分析
 */

import type { Actor, BusinessRequirementDefinition, UseCase } from '../types/delivery-elements.js';

import type { CoverageDetail, CoverageReport, ElementCoverage, OrphanedElement } from './types.js';

/**
 * カバレッジ分析を実行
 */
export function analyzeCoverage(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[]
): CoverageReport {
  return {
    businessGoals: analyzeBusinessGoalsCoverage(businessRequirements, useCases),
    scopeItems: analyzeScopeItemsCoverage(businessRequirements, useCases),
    stakeholders: analyzeStakeholdersCoverage(businessRequirements, useCases),
    successMetrics: analyzeSuccessMetricsCoverage(businessRequirements, useCases),
    assumptions: analyzeAssumptionsCoverage(businessRequirements, useCases),
    constraints: analyzeConstraintsCoverage(businessRequirements, useCases),
    businessRules: analyzeBusinessRulesCoverage(businessRequirements, useCases),
    orphanedElements: findOrphanedElements(businessRequirements, actors, useCases),
  };
}

/**
 * ビジネスゴールのカバレッジを分析
 */
function analyzeBusinessGoalsCoverage(
  businessRequirements: BusinessRequirementDefinition,
  useCases: UseCase[]
): ElementCoverage {
  const businessGoals = businessRequirements.businessGoals || [];
  const details: CoverageDetail[] = [];

  for (const goal of businessGoals) {
    const usedBy: string[] = [];

    for (const useCase of useCases) {
      const coverage = useCase.businessRequirementCoverage;
      if (
        coverage?.businessGoals?.some(bgRef =>
          typeof bgRef === 'object' && 'id' in bgRef ? bgRef.id === goal.id : bgRef === goal.id
        )
      ) {
        usedBy.push(useCase.id);
      }
    }

    details.push({
      element: {
        type: 'businessGoal',
        id: goal.id,
        description: goal.description,
      },
      usedBy,
      isCovered: usedBy.length > 0,
    });
  }

  const covered = details.filter(d => d.isCovered).length;
  const total = details.length;

  return {
    total,
    covered,
    coverage: total > 0 ? covered / total : 1,
    uncovered: details.filter(d => !d.isCovered).map(d => d.element),
    details,
  };
}

/**
 * スコープ項目のカバレッジを分析
 */
function analyzeScopeItemsCoverage(
  businessRequirements: BusinessRequirementDefinition,
  useCases: UseCase[]
): ElementCoverage {
  const scopeItems = businessRequirements.scope?.inScope || [];
  const details: CoverageDetail[] = [];

  for (const item of scopeItems) {
    const usedBy: string[] = [];

    for (const useCase of useCases) {
      const coverage = useCase.businessRequirementCoverage;
      if (
        coverage?.scopeItems?.some(siRef =>
          typeof siRef === 'object' && 'id' in siRef ? siRef.id === item.id : siRef === item.id
        )
      ) {
        usedBy.push(useCase.id);
      }
    }

    details.push({
      element: {
        type: 'scopeItem',
        id: item.id,
        description: item.description,
      },
      usedBy,
      isCovered: usedBy.length > 0,
    });
  }

  const covered = details.filter(d => d.isCovered).length;
  const total = details.length;

  return {
    total,
    covered,
    coverage: total > 0 ? covered / total : 1,
    uncovered: details.filter(d => !d.isCovered).map(d => d.element),
    details,
  };
}

/**
 * ステークホルダーのカバレッジを分析
 */
function analyzeStakeholdersCoverage(
  businessRequirements: BusinessRequirementDefinition,
  useCases: UseCase[]
): ElementCoverage {
  const stakeholders = businessRequirements.stakeholders || [];
  const details: CoverageDetail[] = [];

  for (const stakeholder of stakeholders) {
    const usedBy: string[] = [];

    for (const useCase of useCases) {
      const coverage = useCase.businessRequirementCoverage;
      if (
        coverage?.stakeholders?.some(shRef =>
          typeof shRef === 'object' && 'id' in shRef
            ? shRef.id === stakeholder.id
            : shRef === stakeholder.id
        )
      ) {
        usedBy.push(useCase.id);
      }
    }

    details.push({
      element: {
        type: 'stakeholder',
        id: stakeholder.id,
        description: stakeholder.description,
      },
      usedBy,
      isCovered: usedBy.length > 0,
    });
  }

  const covered = details.filter(d => d.isCovered).length;
  const total = details.length;

  return {
    total,
    covered,
    coverage: total > 0 ? covered / total : 1,
    uncovered: details.filter(d => !d.isCovered).map(d => d.element),
    details,
  };
}

/**
 * 成功指標のカバレッジを分析
 */
function analyzeSuccessMetricsCoverage(
  businessRequirements: BusinessRequirementDefinition,
  useCases: UseCase[]
): ElementCoverage {
  const successMetrics = businessRequirements.successMetrics || [];
  const details: CoverageDetail[] = [];

  for (const metric of successMetrics) {
    const usedBy: string[] = [];

    for (const useCase of useCases) {
      const coverage = useCase.businessRequirementCoverage;
      if (
        coverage?.successMetrics?.some(smRef =>
          typeof smRef === 'object' && 'id' in smRef ? smRef.id === metric.id : smRef === metric.id
        )
      ) {
        usedBy.push(useCase.id);
      }
    }

    details.push({
      element: {
        type: 'successMetric',
        id: metric.id,
        description: metric.description,
      },
      usedBy,
      isCovered: usedBy.length > 0,
    });
  }

  const covered = details.filter(d => d.isCovered).length;
  const total = details.length;

  return {
    total,
    covered,
    coverage: total > 0 ? covered / total : 1,
    uncovered: details.filter(d => !d.isCovered).map(d => d.element),
    details,
  };
}

/**
 * 前提条件のカバレッジを分析
 */
function analyzeAssumptionsCoverage(
  businessRequirements: BusinessRequirementDefinition,
  useCases: UseCase[]
): ElementCoverage {
  const assumptions = businessRequirements.assumptions || [];
  const details: CoverageDetail[] = [];

  for (const assumption of assumptions) {
    const usedBy: string[] = [];

    for (const useCase of useCases) {
      const coverage = useCase.businessRequirementCoverage;
      if (
        coverage?.assumptions?.some(aRef =>
          typeof aRef === 'object' && 'id' in aRef
            ? aRef.id === assumption.id
            : aRef === assumption.id
        )
      ) {
        usedBy.push(useCase.id);
      }
    }

    details.push({
      element: {
        type: 'assumption',
        id: assumption.id,
        description: assumption.description,
      },
      usedBy,
      isCovered: usedBy.length > 0,
    });
  }

  const covered = details.filter(d => d.isCovered).length;
  const total = details.length;

  return {
    total,
    covered,
    coverage: total > 0 ? covered / total : 1,
    uncovered: details.filter(d => !d.isCovered).map(d => d.element),
    details,
  };
}

/**
 * 制約条件のカバレッジを分析
 */
function analyzeConstraintsCoverage(
  businessRequirements: BusinessRequirementDefinition,
  useCases: UseCase[]
): ElementCoverage {
  const constraints = businessRequirements.constraints || [];
  const details: CoverageDetail[] = [];

  for (const constraint of constraints) {
    const usedBy: string[] = [];

    for (const useCase of useCases) {
      const coverage = useCase.businessRequirementCoverage;
      if (
        coverage?.constraints?.some(cRef =>
          typeof cRef === 'object' && 'id' in cRef
            ? cRef.id === constraint.id
            : cRef === constraint.id
        )
      ) {
        usedBy.push(useCase.id);
      }
    }

    details.push({
      element: {
        type: 'constraint',
        id: constraint.id,
        description: constraint.description,
      },
      usedBy,
      isCovered: usedBy.length > 0,
    });
  }

  const covered = details.filter(d => d.isCovered).length;
  const total = details.length;

  return {
    total,
    covered,
    coverage: total > 0 ? covered / total : 1,
    uncovered: details.filter(d => !d.isCovered).map(d => d.element),
    details,
  };
}

/**
 * ビジネスルールのカバレッジを分析
 */
function analyzeBusinessRulesCoverage(
  businessRequirements: BusinessRequirementDefinition,
  useCases: UseCase[]
): ElementCoverage {
  const businessRules = businessRequirements.businessRules || [];
  const details: CoverageDetail[] = [];

  for (const rule of businessRules) {
    const usedBy: string[] = [];

    for (const useCase of useCases) {
      const coverage = useCase.businessRequirementCoverage;
      const coverageRuleRefs = coverage?.businessRules ?? [];
      const directRuleRefs = useCase.businessRules ?? [];

      const isReferenced = [...coverageRuleRefs, ...directRuleRefs].some(ruleRef => {
        if (!ruleRef) return false;
        if (typeof ruleRef === 'string') {
          return ruleRef === rule.id;
        }
        if ('id' in ruleRef) {
          return ruleRef.id === rule.id;
        }
        return false;
      });

      if (isReferenced) {
        usedBy.push(useCase.id);
      }
    }

    details.push({
      element: {
        type: 'businessRule',
        id: rule.id,
        description: rule.description,
      },
      usedBy,
      isCovered: usedBy.length > 0,
    });
  }

  const covered = details.filter(d => d.isCovered).length;
  const total = details.length;

  return {
    total,
    covered,
    coverage: total > 0 ? covered / total : 1,
    uncovered: details.filter(d => !d.isCovered).map(d => d.element),
    details,
  };
}

/**
 * 孤立した要素を発見
 */
function findOrphanedElements(
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[]
): OrphanedElement[] {
  const orphaned: OrphanedElement[] = [];

  // 使用されていないアクターを検出
  for (const actor of actors) {
    const isUsed = useCases.some(useCase => {
      const primary = useCase.actors.primary;
      const secondary = useCase.actors.secondary || [];

      const primaryId = typeof primary === 'string' ? primary : primary.actorId;
      const secondaryIds = secondary.map(s => (typeof s === 'string' ? s : s.actorId));

      return primaryId === actor.id || secondaryIds.includes(actor.id);
    });

    if (!isUsed) {
      orphaned.push({
        element: {
          type: 'actor',
          id: actor.id,
          name: actor.name,
          description: actor.description,
        },
        reason: 'このアクターを使用するユースケースが存在しません',
        suggestedUsage: [
          `${actor.name}が主体となるユースケースを作成する`,
          `既存のユースケースに${actor.name}を補助アクターとして追加する`,
        ],
      });
    }
  }

  return orphaned;
}
