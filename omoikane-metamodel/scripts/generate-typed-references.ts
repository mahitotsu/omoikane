#!/usr/bin/env bun
/**
 * 型安全参照の自動生成スクリプト
 * 定義済みのアクター・ユースケースから型定義を生成
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

interface ActorInfo {
  id: string;
  file: string;
}

interface UseCaseInfo {
  id: string;
  file: string;
}

async function extractActorsAndUseCases(): Promise<{
  actors: ActorInfo[];
  useCases: UseCaseInfo[];
}> {
  const actors: ActorInfo[] = [];
  const useCases: UseCaseInfo[] = [];

  // requirements/*.ts ファイルをスキャン
  const requirementsDir = path.join(process.cwd(), 'src/requirements');
  const files = readdirSync(requirementsDir).filter(f => f.endsWith('.ts'));

  for (const fileName of files) {
    const file = path.join(requirementsDir, fileName);
    const content = readFileSync(file, 'utf-8');

    // アクター定義を抽出（例: export const customer: Actor = { id: 'customer', ...）
    const actorMatches = content.matchAll(
      /export\s+const\s+\w+:\s*Actor\s*=\s*{[^}]*id:\s*['"`]([^'"`]+)['"`]/g
    );
    for (const match of actorMatches) {
      const actorId = match[1];
      if (actorId && !actors.find(a => a.id === actorId)) {
        actors.push({ id: actorId, file });
      }
    }

    // ユースケース定義を抽出（例: export const userRegistration: UseCase = { id: 'user-registration', ...）
    const useCaseMatches = content.matchAll(
      /export\s+const\s+\w+:\s*UseCase\s*=\s*{[^}]*id:\s*['"`]([^'"`]+)['"`]/g
    );
    for (const match of useCaseMatches) {
      const useCaseId = match[1];
      if (useCaseId && !useCases.find(u => u.id === useCaseId)) {
        useCases.push({ id: useCaseId, file });
      }
    }
  }

  return { actors, useCases };
}

async function generateTypedReferences() {
  console.log('🔄 型安全参照を自動生成中...');

  const { actors, useCases } = await extractActorsAndUseCases();

  console.log(`📊 検出されたアクター: ${actors.length}個`);
  actors.forEach(a => console.log(`  - ${a.id} (${path.basename(a.file)})`));

  console.log(`📊 検出されたユースケース: ${useCases.length}個`);
  useCases.forEach(u => console.log(`  - ${u.id} (${path.basename(u.file)})`));

  // 型定義テンプレート
  const template = `/**
 * 型安全なアクター・ユースケース参照システム
 * IDE補完とコンパイル時型チェックを提供
 * 
 * ⚠️ このファイルは自動生成されます
 * 手動編集は scripts/generate-typed-references.ts で行ってください
 * 
 * 最終更新: ${new Date().toISOString()}
 */

import type { Actor, DeliveryElement } from './delivery-elements';

// 既知のアクターIDの型定義（自動生成）
export type KnownActorId = ${actors.length > 0 ? actors.map(a => `'${a.id}'`).join('\n  | ') : 'never'};

// 既知のユースケースIDの型定義（自動生成）
export type KnownUseCaseId = ${useCases.length > 0 ? useCases.map(u => `'${u.id}'`).join('\n  | ') : 'never'};

/**
 * 型安全なアクター参照型
 */
export interface TypedActorRef<T extends KnownActorId = KnownActorId> {
  readonly actorId: T;
  readonly type: 'actor-ref';
}

/**
 * 型安全なユースケース参照型
 */
export interface TypedUseCaseRef<T extends KnownUseCaseId = KnownUseCaseId> {
  readonly useCaseId: T;
  readonly type: 'usecase-ref';
}

/**
 * 型安全なヘルパー関数 - IDE補完対応
 */
export function typedActorRef<T extends KnownActorId>(actorId: T): TypedActorRef<T> {
  return { actorId, type: 'actor-ref' };
}

export function typedUseCaseRef<T extends KnownUseCaseId>(useCaseId: T): TypedUseCaseRef<T> {
  return { useCaseId, type: 'usecase-ref' };
}

/**
 * アクター情報を含む強化された参照型
 */
export interface EnhancedActorRef<T extends KnownActorId = KnownActorId> extends TypedActorRef<T> {
  // 実行時にアクター情報を解決するためのヘルパー
  resolve(): Actor | undefined;
}

/**
 * 実行時アクター解決機能付きの参照作成
 */
export function createActorRef<T extends KnownActorId>(
  actorId: T,
  actorRegistry?: Map<string, Actor>
): EnhancedActorRef<T> {
  return {
    actorId,
    type: 'actor-ref',
    resolve(): Actor | undefined {
      return actorRegistry?.get(actorId);
    }
  };
}

/**
 * アクター定義とその型安全な参照作成を組み合わせたヘルパー
 */
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
    ...definition
  };

  const ref: TypedActorRef<T> = {
    actorId: id,
    type: 'actor-ref'
  };

  return { actor, ref };
}

// 型の再エクスポート（互換性のため）
export type { Actor, DeliveryElement, UseCase } from './delivery-elements';
export interface TypedUseCase extends Omit<DeliveryElement, 'type'> {
  readonly type: 'usecase';
  name: string;
  description: string;
  actors: {
    primary: TypedActorRef;
    secondary?: TypedActorRef[];
  };
  preconditions: string[];
  postconditions: string[];
  mainFlow: TypedUseCaseStep[];
  alternativeFlows?: TypedAlternativeFlow[];
  businessValue: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TypedUseCaseStep {
  stepNumber: number;
  actor: TypedActorRef;
  action: string;
  expectedResult: string;
  notes?: string;
}

export interface TypedAlternativeFlow {
  id: string;
  name: string;
  condition: string;
  steps: TypedUseCaseStep[];
  returnToStep?: number;
}

/**
 * 生成統計情報
 */
export const generatedStats = {
  actors: ${actors.length},
  useCases: ${useCases.length},
  generatedAt: '${new Date().toISOString()}',
  sourceFiles: [${[...new Set([...actors.map(a => a.file), ...useCases.map(u => u.file)])].map(f => `'${f}'`).join(', ')}]
} as const;
`;

  // ファイルに書き込み
  const outputPath = path.join(process.cwd(), 'src/typed-references.ts');
  writeFileSync(outputPath, template);

  console.log(`✅ ${outputPath} を更新しました`);
  console.log(`📈 アクター: ${actors.length}個, ユースケース: ${useCases.length}個`);
}

// スクリプト実行
if (import.meta.main) {
  generateTypedReferences().catch(console.error);
}
