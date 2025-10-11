#!/usr/bin/env bun
/**
 * @fileoverview 型安全参照の自動生成スクリプト
 *
 * **目的:**
 * インスタンスプロジェクトのソースコードから各種ドキュメント（Actor、UseCase、Screen等）を検出し、
 * 型安全な参照関数を含む`typed-references.ts`ファイルを自動生成します。
 *
 * **主要機能:**
 * 1. 型検出システム: `type`フィールドによるドキュメント種別の自動識別
 * 2. ID収集: 各ドキュメントのIDを収集してユニオン型を生成
 * 3. 参照関数生成: IDE補完が効く型安全な参照関数を生成
 * 4. 統計情報: 検出されたドキュメント数の集計
 *
 * **検出対象:**
 * - Actor (type: 'actor')
 * - UseCase (type: 'usecase')
 * - Screen (type: 'screen')
 * - ValidationRule (type: 'validation-rule')
 * - ScreenFlow (type: 'screen-flow')
 * - BusinessRequirement (type: 'business-requirement')
 *   - ネストされた業務要件項目（BusinessGoal、Stakeholder、SuccessMetric等）も抽出
 *
 * **実行方法:**
 * ```bash
 * bun run generate-references
 * ```
 *
 * **生成ファイル:**
 * - `src/typed-references.ts`: 型安全な参照システム
 *
 * **設計原則:**
 * - ゼロコンフィグ: 設定ファイル不要、`type`フィールドで自動検出
 * - 型安全: 存在しないIDの参照はコンパイルエラーになる
 * - IDE補完: KnownXXXId型により補完が効く
 * - メンテナンス性: 手動編集不要、再実行で常に最新状態
 *
 * @module scripts/generate-typed-references
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// ============================================================================
// 型定義
// ============================================================================

/**
 * アクター情報
 *
 * 検出されたアクターのIDとファイルパスを保持します。
 */
interface ActorInfo {
  /** アクターID */
  id: string;
  /** 定義ファイルの絶対パス */
  file: string;
}

/**
 * ユースケース情報
 *
 * 検出されたユースケースのIDとファイルパスを保持します。
 */
interface UseCaseInfo {
  /** ユースケースID */
  id: string;
  /** 定義ファイルの絶対パス */
  file: string;
}

/**
 * 画面情報
 *
 * 検出された画面のIDとファイルパスを保持します。
 */
interface ScreenInfo {
  /** 画面ID */
  id: string;
  /** 定義ファイルの絶対パス */
  file: string;
  /** 画面内で定義されているアクションIDのリスト */
  actionIds: string[];
}

/**
 * バリデーションルール情報
 *
 * 検出されたバリデーションルールのIDとファイルパスを保持します。
 */
interface ValidationRuleInfo {
  /** バリデーションルールID */
  id: string;
  /** 定義ファイルの絶対パス */
  file: string;
}

/**
 * 画面遷移フロー情報
 *
 * 検出された画面遷移フローのIDとファイルパスを保持します。
 */
interface ScreenFlowInfo {
  /** 画面遷移フローID */
  id: string;
  /** 定義ファイルの絶対パス */
  file: string;
}

/**
 * 業務要件情報
 *
 * 検出された業務要件定義のIDとファイルパス、
 * さらにネストされた業務要件項目（BusinessGoal、Stakeholder等）のIDを保持します。
 */
interface BusinessRequirementInfo {
  /** 業務要件定義ID */
  id: string;
  /** 定義ファイルの絶対パス */
  file: string;
  /** ビジネスゴールのIDリスト */
  businessGoalIds: string[];
  /** スコープ項目のIDリスト */
  scopeItemIds: string[];
  /** ステークホルダーのIDリスト */
  stakeholderIds: string[];
  /** 成功指標のIDリスト */
  successMetricIds: string[];
  /** 前提条件のIDリスト */
  assumptionIds: string[];
  /** 制約条件のIDリスト */
  constraintIds: string[];
  /** セキュリティポリシーのIDリスト */
  securityPolicyIds: string[];
  /** ビジネスルールのIDリスト */
  businessRuleIds: string[];
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * ディレクトリ内の全TypeScriptファイルを再帰的に取得
 *
 * **処理内容:**
 * 1. 指定ディレクトリ内のエントリを取得
 * 2. ディレクトリの場合は再帰的に探索
 * 3. .tsファイルの場合は結果に追加
 * 4. パスの長い順→アルファベット順でソート
 *
 * **ソート理由:**
 * より具体的なファイル（パスが長い）から処理することで、
 * 詳細な定義を優先的に検出できます。
 *
 * @param dir - 検索対象ディレクトリの絶対パス
 * @returns TypeScriptファイルの絶対パスの配列
 */
function getAllTsFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // ディレクトリの場合は再帰的に探索
      results.push(...getAllTsFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      // .tsファイルの場合は結果に追加
      results.push(fullPath);
    }
  }

  // パスの長い順→アルファベット順でソート
  return results.sort((a, b) => {
    const lengthDiff = b.length - a.length;
    if (lengthDiff !== 0) {
      return lengthDiff;
    }
    return a.localeCompare(b);
  });
}

/**
 * 文字列配列からTypeScriptユニオン型リテラルを生成
 *
 * **処理内容:**
 * - 空配列の場合は`never`型を返す
 * - 各文字列をシングルクォートで囲み、改行区切りで結合
 * - エスケープ処理: バックスラッシュとシングルクォートを適切にエスケープ
 *
 * **生成例:**
 * ```typescript
 * ['actor-1', 'actor-2'] → "'actor-1'\n  | 'actor-2'"
 * [] → "never"
 * ```
 *
 * @param values - 文字列の配列
 * @returns TypeScriptユニオン型リテラル文字列
 */
function toUnionLiteral(values: string[]): string {
  if (values.length === 0) {
    return 'never';
  }
  return values
    .map(value => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`)
    .join('\n  | ');
}

// ============================================================================
// 要素抽出メイン関数
// ============================================================================

/**
 * ソースコードから全てのドキュメント要素を抽出
 *
 * **処理フロー:**
 * 1. `src/`ディレクトリ内の全TypeScriptファイルを取得
 * 2. 各ファイルを動的インポートしてモジュールキャッシュに格納
 * 3. エクスポートされた値を走査し、`type`フィールドで種別を判定
 * 4. 各種ドキュメント（Actor、UseCase等）を検出・収集
 * 5. BusinessRequirementから入れ子の項目（BusinessGoal等）を抽出
 *
 * **型検出システム:**
 * 各ドキュメントの`type`フィールドを検査して種別を判定します：
 * - type: 'actor' → Actor
 * - type: 'usecase' → UseCase
 * - type: 'screen' → Screen
 * - type: 'validation-rule' → ValidationRule
 * - type: 'screen-flow' → ScreenFlow
 * - type: 'business-requirement' → BusinessRequirement
 *
 * **重複回避:**
 * 同じIDのドキュメントが複数回検出された場合は、最初の1つのみを保持します。
 *
 * **エラーハンドリング:**
 * - `src/`ディレクトリが存在しない場合: 警告を出力して空の結果を返す
 * - モジュール解析に失敗した場合: 警告を出力して次のファイルに進む
 *
 * @returns 検出された全ドキュメント情報
 */
async function extractElements(): Promise<{
  actors: ActorInfo[];
  useCases: UseCaseInfo[];
  screens: ScreenInfo[];
  validationRules: ValidationRuleInfo[];
  screenFlows: ScreenFlowInfo[];
  businessRequirements: BusinessRequirementInfo[];
}> {
  const actors: ActorInfo[] = [];
  const useCases: UseCaseInfo[] = [];
  const screens: ScreenInfo[] = [];
  const validationRules: ValidationRuleInfo[] = [];
  const screenFlows: ScreenFlowInfo[] = [];
  const businessRequirements: BusinessRequirementInfo[] = [];

  // srcディレクトリの存在確認
  const sourceDir = path.join(process.cwd(), 'src');
  if (!existsSync(sourceDir)) {
    console.warn(`⚠️  src ディレクトリが見つかりません: ${sourceDir}`);
    return { actors, useCases, screens, validationRules, screenFlows, businessRequirements };
  }

  // 全TypeScriptファイルを取得
  const files = getAllTsFiles(sourceDir);
  const moduleCache = new Map<string, Record<string, unknown>>();

  // 各ファイルを動的インポート
  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(path.resolve(file)).href;
      const imported = (await import(moduleUrl)) as Record<string, unknown>;
      moduleCache.set(file, imported);
    } catch (error) {
      console.warn(`⚠️  モジュールの解析に失敗しました: ${file}`, error);
    }
  }

  // ================================================================
  // BusinessRequirementDefinition の抽出（最初に実行）
  // ================================================================
  //
  // BusinessRequirementには多数の入れ子項目（BusinessGoal、Stakeholder等）が
  // 含まれるため、最初に処理して全てのIDを抽出します。
  for (const [file, exported] of moduleCache) {
    for (const value of Object.values(exported)) {
      // type フィールドを確認
      if (!value || typeof value !== 'object' || !('type' in value)) continue;
      const typedValue = value as { type?: string; id?: string };
      if (typedValue.type !== 'business-requirement' || !typedValue.id) {
        continue;
      }

      // 重複チェック
      if (businessRequirements.find(req => req.id === typedValue.id)) {
        continue;
      }

      // BusinessRequirementDefinitionの構造を定義
      const definition = value as {
        businessGoals?: { id?: string }[];
        scope?: { inScope?: { id?: string }[] };
        stakeholders?: { id?: string }[];
        successMetrics?: { id?: string }[];
        assumptions?: { id?: string }[];
        constraints?: { id?: string }[];
        securityPolicies?: { id?: string }[];
        businessRules?: { id?: string }[];
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
        businessRuleIds: (definition.businessRules ?? [])
          .map((item): string | undefined => item?.id)
          .filter((value): value is string => Boolean(value)),
      });
    }
  }

  // Actor の抽出
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

  // UseCase の抽出
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

  // Screen の抽出
  for (const [file, exported] of moduleCache) {
    for (const value of Object.values(exported)) {
      if (!value || typeof value !== 'object' || !('type' in value)) continue;
      const typedValue = value as { type?: string; id?: string };
      if (typedValue.type !== 'screen' || !typedValue.id) {
        continue;
      }

      if (!screens.find(screen => screen.id === typedValue.id)) {
        // アクションIDを抽出
        const screenDef = value as { actions?: { id?: string }[] };
        const actionIds = (screenDef.actions ?? [])
          .map(action => action?.id)
          .filter((id): id is string => Boolean(id));
        
        screens.push({ id: typedValue.id, file, actionIds });
      }
    }
  }

  // ValidationRule の抽出
  for (const [file, exported] of moduleCache) {
    for (const value of Object.values(exported)) {
      if (!value || typeof value !== 'object' || !('type' in value)) continue;
      const typedValue = value as { type?: string; id?: string };
      if (typedValue.type !== 'validation-rule' || !typedValue.id) {
        continue;
      }

      if (!validationRules.find(rule => rule.id === typedValue.id)) {
        validationRules.push({ id: typedValue.id, file });
      }
    }
  }

  // ScreenFlow の抽出
  for (const [file, exported] of moduleCache) {
    for (const value of Object.values(exported)) {
      if (!value || typeof value !== 'object' || !('type' in value)) continue;
      const typedValue = value as { type?: string; id?: string };
      if (typedValue.type !== 'screen-flow' || !typedValue.id) {
        continue;
      }

      if (!screenFlows.find(flow => flow.id === typedValue.id)) {
        screenFlows.push({ id: typedValue.id, file });
      }
    }
  }

  return { actors, useCases, screens, validationRules, screenFlows, businessRequirements };
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

  const { actors, useCases, screens, validationRules, screenFlows, businessRequirements } =
    await extractElements();

  console.log(`📊 検出された業務要件定義: ${businessRequirements.length}個`);
  businessRequirements.forEach(r => console.log(`  - ${r.id} (${path.basename(r.file)})`));

  console.log(`📊 検出されたアクター: ${actors.length}個`);
  actors.forEach(a => console.log(`  - ${a.id} (${path.basename(a.file)})`));

  console.log(`📊 検出されたユースケース: ${useCases.length}個`);
  useCases.forEach(u => console.log(`  - ${u.id} (${path.basename(u.file)})`));

  console.log(`📊 検出された画面: ${screens.length}個`);
  screens.forEach(s => console.log(`  - ${s.id} (${path.basename(s.file)})`));

  console.log(`📊 検出されたバリデーションルール: ${validationRules.length}個`);
  validationRules.forEach(v => console.log(`  - ${v.id} (${path.basename(v.file)})`));

  console.log(`📊 検出された画面遷移フロー: ${screenFlows.length}個`);
  screenFlows.forEach(f => console.log(`  - ${f.id} (${path.basename(f.file)})`));

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
  const knownBusinessRuleIds = [
    ...new Set(businessRequirements.flatMap(r => r.businessRuleIds)),
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
      ...screens.map(s => s.file),
      ...validationRules.map(v => v.file),
      ...screenFlows.map(f => f.file),
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
  BusinessRuleRef,
  SecurityPolicyRef,
  StakeholderRef,
  SuccessMetricRef,
  UseCase,
  Screen,
  ValidationRule,
  ScreenFlow,
  Ref,
} from 'omoikane-metamodel';

export type KnownBusinessRequirementId = ${toUnionLiteral(knownBusinessRequirementIds)};

export type KnownBusinessGoalId = ${toUnionLiteral(knownBusinessGoalIds)};

export type KnownScopeItemId = ${toUnionLiteral(knownScopeItemIds)};

export type KnownStakeholderId = ${toUnionLiteral(knownStakeholderIds)};

export type KnownSuccessMetricId = ${toUnionLiteral(knownSuccessMetricIds)};

export type KnownAssumptionId = ${toUnionLiteral(knownAssumptionIds)};

export type KnownConstraintId = ${toUnionLiteral(knownConstraintIds)};

export type KnownSecurityPolicyId = ${toUnionLiteral(knownSecurityPolicyIds)};

export type KnownBusinessRuleId = ${toUnionLiteral(knownBusinessRuleIds)};

export type KnownActorId = ${toUnionLiteral(actors.map(a => a.id))};

export type KnownUseCaseId = ${toUnionLiteral(useCases.map(u => u.id))};

export type KnownScreenId = ${toUnionLiteral(screens.map(s => s.id))};

export type KnownValidationRuleId = ${toUnionLiteral(validationRules.map(v => v.id))};

export type KnownScreenFlowId = ${toUnionLiteral(screenFlows.map(f => f.id))};

/**
 * 画面とアクションのマッピング
 * 
 * 各画面で定義されているアクションIDの型を定義します。
 * これにより、画面ごとに異なるアクション名を型安全に扱えます。
 */
export interface ScreenActionsMap {
${screens.map(screen => {
  if (screen.actionIds.length === 0) {
    return `  '${screen.id}': never;`;
  }
  const actionIds = screen.actionIds.map(id => `'${id}'`).join(' | ');
  return `  '${screen.id}': ${actionIds};`;
}).join('\n')}
}

export function businessRequirementRef<T extends KnownBusinessRequirementId>(
  id: T
): BusinessRequirementDefinitionRef<T> {
  return { id, type: 'business-requirement-ref' };
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

export function businessRuleRef<T extends KnownBusinessRuleId>(id: T): BusinessRuleRef<T> {
  return { id, type: 'business-rule-ref' };
}

/**
 * アクターへの型安全な参照
 * Ref<Actor>と互換性あり
 */
export function typedActorRef<T extends KnownActorId>(id: T): Ref<Actor> & { id: T } {
  return { id };
}

/**
 * ユースケースへの型安全な参照
 * Ref<UseCase>と互換性あり
 */
export function typedUseCaseRef<T extends KnownUseCaseId>(id: T): Ref<UseCase> & { id: T } {
  return { id };
}

export function typedScreenRef<T extends KnownScreenId>(id: T): Ref<Screen> {
  return { id };
}

/**
 * 画面アクションへの型安全な参照
 * 
 * 画面IDとアクションIDの組み合わせで、特定の画面の特定のアクションを参照します。
 * IDEの補完が効き、存在しない画面やアクションを参照するとコンパイルエラーになります。
 * 
 * @param screenId - 画面ID（KnownScreenId型）
 * @param actionId - アクションID（その画面で定義されているアクションID）
 * @returns 画面アクション参照オブジェクト
 * 
 * @example
 * \`\`\`typescript
 * // 型安全な参照（IDE補完が効く）
 * const ref = typedScreenActionRef('account-list-screen', 'delete');
 * 
 * // コンパイルエラー: 存在しない画面
 * typedScreenActionRef('non-existent-screen', 'delete');
 * 
 * // コンパイルエラー: その画面に存在しないアクション
 * typedScreenActionRef('account-list-screen', 'submit');
 * \`\`\`
 */
export function typedScreenActionRef<
  S extends KnownScreenId,
  A extends ScreenActionsMap[S]
>(
  screenId: S,
  actionId: A
): { screenId: S; actionId: A } {
  return { screenId, actionId };
}

export function typedValidationRuleRef<T extends KnownValidationRuleId>(id: T): Ref<ValidationRule> {
  return { id };
}

export function typedScreenFlowRef<T extends KnownScreenFlowId>(id: T): Ref<ScreenFlow> {
  return { id };
}

export function ${camelPrefix}BusinessRequirementCoverage(
  coverage: ${prefix}BusinessRequirementCoverage
): ${prefix}BusinessRequirementCoverage {
  return coverage;
}

export type {
  Actor,
  BusinessRequirementCoverage,
  BusinessRuleRef,
  SecurityPolicyRef,
  UseCase,
} from 'omoikane-metamodel';

export type ${prefix}BusinessRequirementCoverage = BusinessRequirementCoverage;

export type ${prefix}UseCase = UseCase & {
  businessRequirementCoverage?: ${prefix}BusinessRequirementCoverage;
};

export const generatedStats = {
  actors: ${actors.length},
  useCases: ${useCases.length},
  screens: ${screens.length},
  validationRules: ${validationRules.length},
  screenFlows: ${screenFlows.length},
  businessRequirementIds: ${knownBusinessRequirementIds.length},
  businessGoals: ${knownBusinessGoalIds.length},
  scopeItems: ${knownScopeItemIds.length},
  stakeholders: ${knownStakeholderIds.length},
  successMetrics: ${knownSuccessMetricIds.length},
  assumptions: ${knownAssumptionIds.length},
  constraints: ${knownConstraintIds.length},
  securityPolicies: ${knownSecurityPolicyIds.length},
  businessRules: ${knownBusinessRuleIds.length},
  generatedAt: '${new Date().toISOString()}',
  sourceFiles: [${serializedSourceFiles}],
} as const;
`;

  const outputPath = path.join(process.cwd(), 'src/typed-references.ts');
  writeFileSync(outputPath, template);

  console.log(`✅ ${outputPath} を更新しました`);
  console.log(
    `📈 業務要件: ${knownBusinessRequirementIds.length}個, アクター: ${actors.length}個, ユースケース: ${useCases.length}個, 画面: ${screens.length}個, バリデーションルール: ${validationRules.length}個, 画面遷移: ${screenFlows.length}個`
  );
}

if (import.meta.main) {
  generateTypedReferences().catch(error => {
    console.error('❌ 型定義の生成に失敗しました', error);
    process.exit(1);
  });
}
