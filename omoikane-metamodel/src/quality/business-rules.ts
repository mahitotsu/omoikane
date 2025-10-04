/**
 * ビジネスルールとユースケースの関連付けを評価するユーティリティ
 */

import type { BusinessRule, BusinessRuleRef, UseCase } from '../types/delivery-elements.js';

type BusinessRuleUseCase = UseCase<
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
>;

export interface BusinessRuleCoverageEntry<
  Rule extends BusinessRule = BusinessRule,
  U extends BusinessRuleUseCase = BusinessRuleUseCase,
> {
  readonly rule: Rule;
  readonly coveredByUseCases: U[];
  readonly uncovered: boolean;
}

export interface BusinessRuleSummary<
  Rule extends BusinessRule = BusinessRule,
  U extends BusinessRuleUseCase = BusinessRuleUseCase,
> {
  readonly rules: readonly Rule[];
  readonly coverage: readonly BusinessRuleCoverageEntry<Rule, U>[];
  readonly uncoveredRules: readonly BusinessRuleCoverageEntry<Rule, U>[];
}

export function buildBusinessRuleCoverage<Rule extends BusinessRule, U extends BusinessRuleUseCase>(
  businessRules: readonly Rule[],
  useCases: readonly U[]
): BusinessRuleCoverageEntry<Rule, U>[] {
  return businessRules.map(rule => {
    const coveredByUseCases = useCases.filter(useCase =>
      hasBusinessRuleReference(useCase.businessRules ?? [], rule) ||
      hasBusinessRuleReference(useCase.businessRequirementCoverage?.businessRules ?? [], rule)
    );

    return {
      rule,
      coveredByUseCases,
      uncovered: coveredByUseCases.length === 0,
    };
  });
}

export function summarizeBusinessRules<Rule extends BusinessRule, U extends BusinessRuleUseCase>(
  businessRules: readonly Rule[],
  useCases: readonly U[]
): BusinessRuleSummary<Rule, U> {
  const coverage = buildBusinessRuleCoverage(businessRules, useCases);
  const uncoveredRules = coverage.filter(entry => entry.uncovered);

  return {
    rules: businessRules,
    coverage,
    uncoveredRules,
  };
}

export interface BusinessRuleStats {
  readonly totalRules: number;
  readonly totalCoveredRules: number;
  readonly totalUncoveredRules: number;
  readonly coverageRatio: number;
}

export function calculateBusinessRuleStats<Rule extends BusinessRule, U extends BusinessRuleUseCase>(
  coverage: readonly BusinessRuleCoverageEntry<Rule, U>[]
): BusinessRuleStats {
  const totalRules = coverage.length;
  const totalCoveredRules = coverage.filter(entry => !entry.uncovered).length;
  const totalUncoveredRules = totalRules - totalCoveredRules;
  const coverageRatio = totalRules === 0 ? 1 : totalCoveredRules / totalRules;

  return {
    totalRules,
    totalCoveredRules,
    totalUncoveredRules,
    coverageRatio,
  };
}

export function collectBusinessRuleIds(
  ruleRefs: readonly (BusinessRuleRef | string)[] | undefined
): string[] {
  return (ruleRefs ?? [])
    .map(ref => (typeof ref === 'string' ? ref : ref.id))
    .filter((id): id is string => Boolean(id));
}

function hasBusinessRuleReference(
  refs: readonly (BusinessRuleRef | string)[] | undefined,
  rule: BusinessRule
): boolean {
  return (refs ?? []).some(ref => {
    if (typeof ref === 'string') {
      return ref === rule.id;
    }
    return ref.id === rule.id;
  });
}
