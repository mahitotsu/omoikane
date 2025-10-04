#!/usr/bin/env bun
/**
 * 型安全参照の自動生成スクリプト
 * 定義済みのアクター・ユースケース・業務要件から型定義を生成
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

interface ActorInfo {
  id: string;
  file: string;
}

interface UseCaseInfo {
  id: string;
  file: string;
}

interface BusinessRequirementInfo {
  id: string;
  file: string;
  businessGoalIds: string[];
  scopeItemIds: string[];
  stakeholderIds: string[];
  successMetricIds: string[];
  assumptionIds: string[];
  constraintIds: string[];
  securityPolicyIds: string[];
}

function getAllTsFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...getAllTsFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      results.push(fullPath);
    }
  }

  return results.sort((a, b) => {
    const lengthDiff = b.length - a.length;
    if (lengthDiff !== 0) {
      return lengthDiff;
    }
    return a.localeCompare(b);
  });
}

function toUnionLiteral(values: string[]): string {
  if (values.length === 0) {
    return 'never';
  }
  return values
    .map(value => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`)
    .join('\n  | ');
}

async function extractElements(): Promise<{
  actors: ActorInfo[];
  useCases: UseCaseInfo[];
  businessRequirements: BusinessRequirementInfo[];
}> {
  const actors: ActorInfo[] = [];
  const useCases: UseCaseInfo[] = [];
  const businessRequirements: BusinessRequirementInfo[] = [];

  const sourceDir = path.join(process.cwd(), 'src');
  if (!existsSync(sourceDir)) {
    console.warn(`⚠️  src ディレクトリが見つかりません: ${sourceDir}`);
    return { actors, useCases, businessRequirements };
  }

  const files = getAllTsFiles(sourceDir);
  const moduleCache = new Map<string, Record<string, unknown>>();

  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(path.resolve(file)).href;
      const imported = (await import(moduleUrl)) as Record<string, unknown>;
      moduleCache.set(file, imported);
    } catch (error) {
      console.warn(`⚠️  モジュールの解析に失敗しました: ${file}`, error);
    }
  }

  for (const [file, exported] of moduleCache) {
    for (const value of Object.values(exported)) {
      if (!value || typeof value !== 'object' || !('type' in value)) continue;
      const typedValue = value as { type?: string; id?: string };
      if (typedValue.type !== 'business-requirement' || !typedValue.id) {
        continue;
      }

      if (businessRequirements.find(req => req.id === typedValue.id)) {
        continue;
      }

      const definition = value as {
        businessGoals?: { id?: string }[];
        scope?: { inScope?: { id?: string }[] };
        stakeholders?: { id?: string }[];
        successMetrics?: { id?: string }[];
        assumptions?: { id?: string }[];
        constraints?: { id?: string }[];
        securityPolicies?: { id?: string }[];
      };

      businessRequirements.push({
        id: typedValue.id,
        file,
        businessGoalIds: (definition.businessGoals ?? [])
          .map(item => item?.id)
          .filter((value): value is string => Boolean(value)),
        scopeItemIds: (definition.scope?.inScope ?? [])
          .map(item => item?.id)
          .filter((value): value is string => Boolean(value)),
        stakeholderIds: (definition.stakeholders ?? [])
          .map(item => item?.id)
          .filter((value): value is string => Boolean(value)),
        successMetricIds: (definition.successMetrics ?? [])
          .map(item => item?.id)
          .filter((value): value is string => Boolean(value)),
        assumptionIds: (definition.assumptions ?? [])
          .map(item => item?.id)
          .filter((value): value is string => Boolean(value)),
        constraintIds: (definition.constraints ?? [])
          .map(item => item?.id)
          .filter((value): value is string => Boolean(value)),
        securityPolicyIds: (definition.securityPolicies ?? [])
          .map(item => item?.id)
          .filter((value): value is string => Boolean(value)),
      });
    }
  }

  for (const [file, exported] of moduleCache) {
    for (const value of Object.values(exported)) {
      if (!value || typeof value !== 'object' || !('type' in value)) continue;
      const typedValue = value as { type?: string; id?: string };
      if (typedValue.type !== 'actor' || !typedValue.id) {
        continue;
      }

      if (!actors.find(actor => actor.id === typedValue.id)) {
        actors.push({ id: typedValue.id, file });
      }
    }
  }

  for (const [file, exported] of moduleCache) {
    for (const value of Object.values(exported)) {
      if (!value || typeof value !== 'object' || !('type' in value)) continue;
      const typedValue = value as { type?: string; id?: string };
      if (typedValue.type !== 'usecase' || !typedValue.id) {
        continue;
      }

      if (!useCases.find(useCase => useCase.id === typedValue.id)) {
        useCases.push({ id: typedValue.id, file });
      }
    }
  }

  return { actors, useCases, businessRequirements };
}

function sanitizePackageSegment(segment: string): string {
  const parts = segment.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length === 0) {
    return 'Project';
  }
  const relevantParts = parts.length > 1 ? [parts[parts.length - 1]] : parts;
  return relevantParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function escapeForSingleQuote(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function generateTypedReferences() {
  console.log('🔄 型安全参照を自動生成中...');

  const { actors, useCases, businessRequirements } = await extractElements();

  console.log(`📊 検出された業務要件定義: ${businessRequirements.length}個`);
  businessRequirements.forEach(r => console.log(`  - ${r.id} (${path.basename(r.file)})`));

  console.log(`📊 検出されたアクター: ${actors.length}個`);
  actors.forEach(a => console.log(`  - ${a.id} (${path.basename(a.file)})`));

  console.log(`📊 検出されたユースケース: ${useCases.length}個`);
  useCases.forEach(u => console.log(`  - ${u.id} (${path.basename(u.file)})`));

  const knownBusinessRequirementIds = [...new Set(businessRequirements.map(r => r.id))].sort();
  const knownBusinessGoalIds = [
    ...new Set(businessRequirements.flatMap(r => r.businessGoalIds)),
  ].sort();
  const knownScopeItemIds = [...new Set(businessRequirements.flatMap(r => r.scopeItemIds))].sort();
  const knownStakeholderIds = [
    ...new Set(businessRequirements.flatMap(r => r.stakeholderIds)),
  ].sort();
  const knownSuccessMetricIds = [
    ...new Set(businessRequirements.flatMap(r => r.successMetricIds)),
  ].sort();
  const knownAssumptionIds = [
    ...new Set(businessRequirements.flatMap(r => r.assumptionIds)),
  ].sort();
  const knownConstraintIds = [
    ...new Set(businessRequirements.flatMap(r => r.constraintIds)),
  ].sort();
  const knownSecurityPolicyIds = [
    ...new Set(businessRequirements.flatMap(r => r.securityPolicyIds)),
  ].sort();

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let prefix = 'Project';
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { name?: string };
      if (pkg.name) {
        const segments = pkg.name.split('/').filter(Boolean);
        if (segments.length > 0) {
          prefix = sanitizePackageSegment(segments[segments.length - 1]);
        }
      }
    } catch (error) {
      console.warn('⚠️  package.json の読み込みに失敗しました', error);
    }
  }

  const camelPrefix = prefix.charAt(0).toLowerCase() + prefix.slice(1);

  const uniqueSourceFiles = [
    ...new Set([
      ...actors.map(a => a.file),
      ...useCases.map(u => u.file),
      ...businessRequirements.map(r => r.file),
    ]),
  ].sort();
  const serializedSourceFiles = uniqueSourceFiles
    .map(file => `'${escapeForSingleQuote(file)}'`)
    .join(', ');

  const template = `/**
 * 型安全なアクター・ユースケース参照システム
 * IDE補完とコンパイル時型チェックを提供
 *
 * ⚠️ このファイルは自動生成されます
 * 手動編集は scripts/generate-typed-references.ts で行ってください
 *
 * 最終更新: ${new Date().toISOString()}
 */

import type {
  Actor,
  AssumptionRef,
  BusinessGoalRef,
  BusinessRequirementCoverage,
  BusinessRequirementDefinitionRef,
  BusinessScopeRef,
  ConstraintRef,
  SecurityPolicyRef,
  StakeholderRef,
  SuccessMetricRef,
  UseCase,
} from 'omoikane-metamodel';

export type KnownBusinessRequirementId = ${toUnionLiteral(knownBusinessRequirementIds)};

export type KnownBusinessGoalId = ${toUnionLiteral(knownBusinessGoalIds)};

export type KnownScopeItemId = ${toUnionLiteral(knownScopeItemIds)};

export type KnownStakeholderId = ${toUnionLiteral(knownStakeholderIds)};

export type KnownSuccessMetricId = ${toUnionLiteral(knownSuccessMetricIds)};

export type KnownAssumptionId = ${toUnionLiteral(knownAssumptionIds)};

export type KnownConstraintId = ${toUnionLiteral(knownConstraintIds)};

export type KnownSecurityPolicyId = ${toUnionLiteral(knownSecurityPolicyIds)};

export type KnownActorId = ${toUnionLiteral(actors.map(a => a.id))};

export type KnownUseCaseId = ${toUnionLiteral(useCases.map(u => u.id))};

export function businessRequirementRef<T extends KnownBusinessRequirementId>(
  requirementId: T
): BusinessRequirementDefinitionRef<T> {
  return { requirementId, type: 'business-requirement-ref' };
}

export function businessGoalRef<T extends KnownBusinessGoalId>(id: T): BusinessGoalRef<T> {
  return { id, type: 'business-goal-ref' };
}

export function businessScopeRef<T extends KnownScopeItemId>(id: T): BusinessScopeRef<T> {
  return { id, type: 'business-scope-ref' };
}

export function stakeholderRef<T extends KnownStakeholderId>(id: T): StakeholderRef<T> {
  return { id, type: 'stakeholder-ref' };
}

export function successMetricRef<T extends KnownSuccessMetricId>(id: T): SuccessMetricRef<T> {
  return { id, type: 'success-metric-ref' };
}

export function assumptionRef<T extends KnownAssumptionId>(id: T): AssumptionRef<T> {
  return { id, type: 'assumption-ref' };
}

export function constraintRef<T extends KnownConstraintId>(id: T): ConstraintRef<T> {
  return { id, type: 'constraint-ref' };
}

export function securityPolicyRef<T extends KnownSecurityPolicyId>(
  id: T
): SecurityPolicyRef<T> {
  return { id, type: 'security-policy-ref' };
}

export interface TypedActorRef<T extends KnownActorId = KnownActorId> {
  readonly actorId: T;
  readonly type: 'actor-ref';
}

export interface TypedUseCaseRef<T extends KnownUseCaseId = KnownUseCaseId> {
  readonly useCaseId: T;
  readonly type: 'usecase-ref';
}

export function typedActorRef<T extends KnownActorId>(actorId: T): TypedActorRef<T> {
  return { actorId, type: 'actor-ref' };
}

export function typedUseCaseRef<T extends KnownUseCaseId>(useCaseId: T): TypedUseCaseRef<T> {
  return { useCaseId, type: 'usecase-ref' };
}

export function ${camelPrefix}BusinessRequirementCoverage(
  coverage: ${prefix}BusinessRequirementCoverage
): ${prefix}BusinessRequirementCoverage {
  return coverage;
}

export interface EnhancedActorRef<T extends KnownActorId = KnownActorId> extends TypedActorRef<T> {
  resolve(): Actor | undefined;
}

export function createActorRef<T extends KnownActorId>(
  actorId: T,
  actorRegistry?: Map<string, Actor>
): EnhancedActorRef<T> {
  return {
    actorId,
    type: 'actor-ref',
    resolve(): Actor | undefined {
      return actorRegistry?.get(actorId);
    },
  };
}

export interface ActorDefinition<T extends KnownActorId> {
  actor: Actor;
  ref: TypedActorRef<T>;
}

export function defineActor<T extends KnownActorId>(
  id: T,
  definition: Omit<Actor, 'id'>
): ActorDefinition<T> {
  const actor: Actor = {
    id,
    ...definition,
  };

  const ref: TypedActorRef<T> = {
    actorId: id,
    type: 'actor-ref',
  };

  return { actor, ref };
}

export type { Actor, BusinessRequirementCoverage, SecurityPolicyRef, UseCase } from 'omoikane-metamodel';

export type ${prefix}BusinessRequirementCoverage = BusinessRequirementCoverage<
  KnownBusinessRequirementId,
  KnownBusinessGoalId,
  KnownScopeItemId,
  KnownStakeholderId,
  KnownSuccessMetricId,
  KnownAssumptionId,
  KnownConstraintId,
  KnownSecurityPolicyId
>;

export type ${prefix}UseCase = UseCase<
  KnownBusinessRequirementId,
  KnownBusinessGoalId,
  KnownScopeItemId,
  KnownStakeholderId,
  KnownSuccessMetricId,
  KnownAssumptionId,
  KnownConstraintId,
  KnownSecurityPolicyId
> & {
  businessRequirementCoverage: ${prefix}BusinessRequirementCoverage;
};

export const generatedStats = {
  actors: ${actors.length},
  useCases: ${useCases.length},
  businessRequirementIds: ${knownBusinessRequirementIds.length},
  businessGoals: ${knownBusinessGoalIds.length},
  scopeItems: ${knownScopeItemIds.length},
  stakeholders: ${knownStakeholderIds.length},
  successMetrics: ${knownSuccessMetricIds.length},
  assumptions: ${knownAssumptionIds.length},
  constraints: ${knownConstraintIds.length},
  securityPolicies: ${knownSecurityPolicyIds.length},
  generatedAt: '${new Date().toISOString()}',
  sourceFiles: [${serializedSourceFiles}],
} as const;
`;

  const outputPath = path.join(process.cwd(), 'src/typed-references.ts');
  writeFileSync(outputPath, template);

  console.log(`✅ ${outputPath} を更新しました`);
  console.log(
    `📈 業務要件: ${knownBusinessRequirementIds.length}個, アクター: ${actors.length}個, ユースケース: ${useCases.length}個`
  );
}

if (import.meta.main) {
  generateTypedReferences().catch(error => {
    console.error('❌ 型定義の生成に失敗しました', error);
    process.exit(1);
  });
}
