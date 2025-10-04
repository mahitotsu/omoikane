/**
 * セキュリティ要件（ポリシー）とユースケースの関連付けを評価するユーティリティ
 */

import type { SecurityPolicy, SecurityPolicyRef, UseCase } from '../types/delivery-elements.js';

export type AnyUseCase = UseCase<
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

export interface SecurityPolicyCoverageEntry<
  Policy extends SecurityPolicy = SecurityPolicy,
  U extends AnyUseCase = AnyUseCase,
> {
  readonly policy: Policy;
  readonly coveredByUseCases: U[];
  readonly uncovered: boolean;
}

export interface SecurityPolicySummary<
  Policy extends SecurityPolicy = SecurityPolicy,
  U extends AnyUseCase = AnyUseCase,
> {
  readonly policies: readonly Policy[];
  readonly coverage: readonly SecurityPolicyCoverageEntry<Policy, U>[];
  readonly uncoveredPolicies: readonly SecurityPolicyCoverageEntry<Policy, U>[];
}

export function buildSecurityPolicyCoverage<Policy extends SecurityPolicy, U extends AnyUseCase>(
  securityPolicies: readonly Policy[],
  useCases: readonly U[]
): SecurityPolicyCoverageEntry<Policy, U>[] {
  return securityPolicies.map(policy => {
    const coveredByUseCases = useCases.filter(useCase =>
      (useCase.securityPolicies ?? []).some(policyRef => matchesPolicy(policyRef, policy))
    );

    return {
      policy,
      coveredByUseCases,
      uncovered: coveredByUseCases.length === 0,
    };
  });
}

export function summarizeSecurityPolicies<Policy extends SecurityPolicy, U extends AnyUseCase>(
  securityPolicies: readonly Policy[],
  useCases: readonly U[]
): SecurityPolicySummary<Policy, U> {
  const coverage = buildSecurityPolicyCoverage(securityPolicies, useCases);
  const uncoveredPolicies = coverage.filter(entry => entry.uncovered);

  return {
    policies: securityPolicies,
    coverage,
    uncoveredPolicies,
  };
}

export interface SecurityPolicyStats {
  readonly totalPolicies: number;
  readonly totalCoveredPolicies: number;
  readonly totalUncoveredPolicies: number;
  readonly coverageRatio: number;
}

export function calculateSecurityPolicyStats<Policy extends SecurityPolicy, U extends AnyUseCase>(
  coverage: readonly SecurityPolicyCoverageEntry<Policy, U>[]
): SecurityPolicyStats {
  const totalPolicies = coverage.length;
  const totalCoveredPolicies = coverage.filter(entry => !entry.uncovered).length;
  const totalUncoveredPolicies = totalPolicies - totalCoveredPolicies;
  const coverageRatio = totalPolicies === 0 ? 1 : totalCoveredPolicies / totalPolicies;

  return {
    totalPolicies,
    totalCoveredPolicies,
    totalUncoveredPolicies,
    coverageRatio,
  };
}

export function collectSecurityPolicyIds(
  policyRefs: readonly SecurityPolicyRef[] | undefined
): string[] {
  return (policyRefs ?? []).map(ref => ref.id);
}

function matchesPolicy(policyRef: SecurityPolicyRef | undefined, policy: SecurityPolicy): boolean {
  return Boolean(policyRef && policyRef.id === policy.id);
}
