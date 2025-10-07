/**
 * @fileoverview ユースケースとアクターの関係性分析ユーティリティ
 * 
 * **目的:**
 * ユースケースとアクターの関係性を分析し、プロジェクトの構造を可視化します。
 * N:N関係の管理、協調関係の特定、複雑度の分析などを提供します。
 * 
 * **主要機能:**
 * 1. ActorUseCaseRelationship: アクターとユースケースの関係
 * 2. RelationshipAnalysis: 関係性分析結果
 * 3. RelationshipAnalyzer: 関係性分析クラス
 *    - addActor(): アクターを追加
 *    - addUseCase(): ユースケースを追加
 *    - analyze(): 関係性を分析
 *    - getUseCasesForActor(): アクターが関わるユースケースを取得
 *    - getActorsForUseCase(): ユースケースに関わるアクターを取得
 *    - getActorCollaborations(): アクター間の協調関係を分析
 *    - generateReport(): レポート生成
 * 
 * **分析内容:**
 * - アクター → ユースケースのマッピング
 * - ユースケース → アクターのマッピング
 * - 複数のユースケースに関わるアクター（multiRoleActors）
 * - 複数のアクターが関わるユースケース（complexUseCases）
 * - アクター間の協調関係（同じユースケースに参加）
 * 
 * **使用例:**
 * ```typescript
 * const analyzer = new RelationshipAnalyzer();
 * 
 * // データを追加
 * analyzer.addActor({ id: 'actor-001', name: '購入者', role: 'primary', responsibilities: [] });
 * analyzer.addActor({ id: 'actor-002', name: '管理者', role: 'secondary', responsibilities: [] });
 * 
 * analyzer.addUseCase({
 *   id: 'uc-001',
 *   name: 'ログイン',
 *   actors: { primary: 'actor-001' },
 *   // ... その他のフィールド
 * });
 * 
 * // 分析実行
 * const analysis = analyzer.analyze();
 * console.log(`総アクター数: ${analysis.totalActors}`);
 * console.log(`複雑なユースケース: ${analysis.complexUseCases.length}個`);
 * 
 * // レポート生成
 * const report = analyzer.generateReport();
 * console.log(report);
 * ```
 * 
 * @module types/relationship-analyzer
 */

import type { Ref } from './foundation/index.js';
import type * as Functional from './functional/index.js';

// ============================================================================
// 型エイリアス
// ============================================================================

type Actor = Functional.Actor;
type UseCase = Functional.UseCase;
type ActorRef = Ref<Actor>;

/**
 * 新型・旧型両対応のための型定義
 * 
 * **目的:**
 * 様々な形式のアクター・ユースケースデータに対応します。
 * 後方互換性を保ちながら、新しい型定義にも対応します。
 */
type AnyActor = Actor | { id: string; name: string };
type AnyUseCase = UseCase | {
  id: string;
  name: string;
  actors: {
    primary: string | ActorRef | { id: string };
    secondary?: (string | ActorRef | { id: string })[];
  };
};

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * ユニオン型から actorId を取得するヘルパー関数
 * 
 * **目的:**
 * 様々な形式のアクター参照（文字列、Ref<Actor>、{id: string}）から
 * 統一的にIDを取得します。
 * 
 * **パラメータ:**
 * @param actor - アクター参照（string | Ref<Actor> | {id: string}）
 * 
 * **戻り値:**
 * @returns アクターID（取得できない場合は空文字列）
 * 
 * **使用例:**
 * ```typescript
 * const id1 = getActorId('actor-001'); // 'actor-001'
 * const id2 = getActorId({ id: 'actor-002', displayName: '管理者' }); // 'actor-002'
 * const id3 = getActorId({ id: 'actor-003' }); // 'actor-003'
 * ```
 */
function getActorId(actor: string | ActorRef | { id: string }): string {
  if (typeof actor === 'string') return actor;
  if ('id' in actor) return actor.id;
  return '';
}

// ============================================================================
// 関係性型定義
// ============================================================================

/**
 * アクター・ユースケース関係マップ
 * 
 * **目的:**
 * アクターとユースケースの1対1の関係を表現します。
 * 
 * **フィールド:**
 * - actorId: アクターID
 * - useCaseId: ユースケースID
 * - role: アクターの役割（primary: 主要、secondary: 副次）
 * 
 * **使用例:**
 * ```typescript
 * const relationship: ActorUseCaseRelationship = {
 *   actorId: 'actor-001',
 *   useCaseId: 'uc-001',
 *   role: 'primary'
 * };
 * ```
 */
export interface ActorUseCaseRelationship {
  /** アクターID */
  actorId: string;
  
  /** ユースケースID */
  useCaseId: string;
  
  /** アクターの役割（primary: 主要アクター、secondary: 副次アクター） */
  role: 'primary' | 'secondary';
}

/**
 * 関係性分析結果
 * 
 * **目的:**
 * ユースケースとアクターの関係性を多角的に分析した結果を保持します。
 * 
 * **フィールド:**
 * - totalActors: 総アクター数
 * - totalUseCases: 総ユースケース数
 * - relationships: 全ての関係性のリスト
 * - actorUseCaseMap: アクターID → ユースケースID[]のマッピング
 * - useCaseActorMap: ユースケースID → アクターID[]のマッピング
 * - multiRoleActors: 複数のユースケースに関わるアクター（キーパーソン）
 * - complexUseCases: 複数のアクターが関わるユースケース（複雑なユースケース）
 * 
 * **使用例:**
 * ```typescript
 * const analysis: RelationshipAnalysis = analyzer.analyze();
 * 
 * // 統計情報
 * console.log(`総アクター数: ${analysis.totalActors}`);
 * console.log(`総ユースケース数: ${analysis.totalUseCases}`);
 * 
 * // キーパーソン特定
 * console.log(`キーパーソン: ${analysis.multiRoleActors.length}人`);
 * 
 * // 複雑なユースケース特定
 * console.log(`複雑なユースケース: ${analysis.complexUseCases.length}個`);
 * 
 * // アクターが関わるユースケース一覧
 * const useCases = analysis.actorUseCaseMap.get('actor-001') || [];
 * console.log(`アクター001は${useCases.length}個のユースケースに関与`);
 * ```
 */
export interface RelationshipAnalysis {
  /** 総アクター数 */
  totalActors: number;
  
  /** 総ユースケース数 */
  totalUseCases: number;
  
  /** 全ての関係性のリスト */
  relationships: ActorUseCaseRelationship[];
  
  /** アクターID → ユースケースID[]のマッピング */
  actorUseCaseMap: Map<string, string[]>;
  
  /** ユースケースID → アクターID[]のマッピング */
  useCaseActorMap: Map<string, string[]>;
  
  /** 複数のユースケースに関わるアクター（キーパーソン） */
  multiRoleActors: string[];
  
  /** 複数のアクターが関わるユースケース（複雑なユースケース） */
  complexUseCases: string[];
}

// ============================================================================
// 関係性分析クラス
// ============================================================================

/**
 * RelationshipAnalyzer
 * 
 * **目的:**
 * ユースケースとアクターの関係性を分析するクラスです。
 * アクターとユースケースを登録し、様々な角度から関係性を分析できます。
 * 
 * **使用方法:**
 * 1. インスタンス生成
 * 2. addActor()でアクターを追加
 * 3. addUseCase()でユースケースを追加
 * 4. analyze()で関係性を分析
 * 5. generateReport()でレポート生成
 * 
 * **使用例:**
 * ```typescript
 * const analyzer = new RelationshipAnalyzer();
 * 
 * // アクターを追加
 * analyzer.addActor({
 *   id: 'actor-001',
 *   name: '購入者',
 *   role: 'primary',
 *   responsibilities: ['商品を購入する']
 * });
 * 
 * // ユースケースを追加
 * analyzer.addUseCase({
 *   id: 'uc-001',
 *   name: 'ログイン',
 *   actors: { primary: 'actor-001' },
 *   // ... その他のフィールド
 * });
 * 
 * // 分析実行
 * const analysis = analyzer.analyze();
 * 
 * // レポート生成
 * const report = analyzer.generateReport();
 * console.log(report);
 * ```
 */
export class RelationshipAnalyzer {
  /** アクターのマップ（ID → Actor） */
  private actors: Map<string, AnyActor> = new Map();
  
  /** ユースケースのマップ（ID → UseCase） */
  /** ユースケースのマップ（ID → UseCase） */
  private useCases: Map<string, AnyUseCase> = new Map();

  /**
   * アクターを追加
   * 
   * **目的:**
   * 分析対象のアクターを登録します。
   * 
   * **パラメータ:**
   * @param actor - 追加するアクター
   * 
   * **使用例:**
   * ```typescript
   * analyzer.addActor({
   *   id: 'actor-001',
   *   name: '購入者',
   *   role: 'primary',
   *   responsibilities: ['商品を購入する', '注文履歴を確認する']
   * });
   * ```
   */
  addActor(actor: AnyActor): void {
    this.actors.set(actor.id, actor);
  }

  /**
   * ユースケースを追加
   * 
   * **目的:**
   * 分析対象のユースケースを登録します。
   * 
   * **パラメータ:**
   * @param useCase - 追加するユースケース
   * 
   * **使用例:**
   * ```typescript
   * analyzer.addUseCase({
   *   id: 'uc-001',
   *   name: 'ログイン',
   *   actors: {
   *     primary: 'actor-001',
   *     secondary: ['actor-002']
   *   },
   *   // ... その他のフィールド
   * });
   * ```
   */
  addUseCase(useCase: AnyUseCase): void {
    this.useCases.set(useCase.id, useCase);
  }

  /**
   * 関係性を分析
   * 
   * **目的:**
   * 登録されたアクターとユースケースの関係性を多角的に分析します。
   * 
   * **分析内容:**
   * 1. 全ての関係性を抽出（アクター × ユースケース × 役割）
   * 2. アクター → ユースケースのマッピング構築
   * 3. ユースケース → アクターのマッピング構築
   * 4. キーパーソンの特定（複数のユースケースに関わるアクター）
   * 5. 複雑なユースケースの特定（複数のアクターが関わるユースケース）
   * 
   * **戻り値:**
   * @returns 関係性分析結果
   * 
   * **使用例:**
   * ```typescript
   * const analysis = analyzer.analyze();
   * 
   * // 統計情報
   * console.log(`総アクター数: ${analysis.totalActors}`);
   * console.log(`総ユースケース数: ${analysis.totalUseCases}`);
   * console.log(`総関係性数: ${analysis.relationships.length}`);
   * 
   * // キーパーソン
   * console.log('キーパーソン:');
   * for (const actorId of analysis.multiRoleActors) {
   *   const useCases = analysis.actorUseCaseMap.get(actorId) || [];
   *   console.log(`  ${actorId}: ${useCases.length}個のユースケース`);
   * }
   * 
   * // 複雑なユースケース
   * console.log('複雑なユースケース:');
   * for (const useCaseId of analysis.complexUseCases) {
   *   const actors = analysis.useCaseActorMap.get(useCaseId) || [];
   *   console.log(`  ${useCaseId}: ${actors.length}人のアクター`);
   * }
   * ```
   */
  analyze(): RelationshipAnalysis {
    const relationships: ActorUseCaseRelationship[] = [];
    const actorUseCaseMap = new Map<string, string[]>();
    const useCaseActorMap = new Map<string, string[]>();

    // 各ユースケースから関係性を抽出
    for (const useCase of this.useCases.values()) {
      const useCaseActors: string[] = [];

      // プライマリアクター
      const primaryActorId = getActorId(useCase.actors.primary);
      relationships.push({
        actorId: primaryActorId,
        useCaseId: useCase.id,
        role: 'primary',
      });
      useCaseActors.push(primaryActorId);

      // セカンダリアクター
      if (useCase.actors.secondary) {
        for (const secondaryActor of useCase.actors.secondary) {
          const secondaryActorId = getActorId(secondaryActor);
          relationships.push({
            actorId: secondaryActorId,
            useCaseId: useCase.id,
            role: 'secondary',
          });
          useCaseActors.push(secondaryActorId);
        }
      }

      useCaseActorMap.set(useCase.id, useCaseActors);

      // アクター → ユースケースのマッピング更新
      for (const actorId of useCaseActors) {
        if (!actorUseCaseMap.has(actorId)) {
          actorUseCaseMap.set(actorId, []);
        }
        actorUseCaseMap.get(actorId)!.push(useCase.id);
      }
    }

    // 複数の役割を持つアクターを特定（キーパーソン）
    const multiRoleActors = Array.from(actorUseCaseMap.entries())
      .filter(([_, useCaseIds]) => useCaseIds.length > 1)
      .map(([actorId, _]) => actorId);

    // 複数のアクターが関わるユースケースを特定（複雑なユースケース）
    const complexUseCases = Array.from(useCaseActorMap.entries())
      .filter(([_, actorIds]) => actorIds.length > 1)
      .map(([useCaseId, _]) => useCaseId);

    return {
      totalActors: this.actors.size,
      totalUseCases: this.useCases.size,
      relationships,
      actorUseCaseMap,
      useCaseActorMap,
      multiRoleActors,
      complexUseCases,
    };
  }

  /**
   * 特定のアクターが関わるユースケースを取得
   * 
   * **目的:**
   * 指定されたアクターが関与する全てのユースケースを取得します。
   * 
   * **パラメータ:**
   * @param actorId - アクターID
   * 
   * **戻り値:**
   * @returns アクターが関わるユースケースのリスト
   * 
   * **使用例:**
   * ```typescript
   * const useCases = analyzer.getUseCasesForActor('actor-001');
   * console.log(`アクター001は${useCases.length}個のユースケースに関与`);
   * for (const useCase of useCases) {
   *   console.log(`  - ${useCase.name}`);
   * }
   * ```
   */
  getUseCasesForActor(actorId: string): AnyUseCase[] {
    const analysis = this.analyze();
    const useCaseIds = analysis.actorUseCaseMap.get(actorId) || [];
    return useCaseIds.map(id => this.useCases.get(id)!).filter(Boolean);
  }

  /**
   * 特定のユースケースに関わるアクターを取得
   * 
   * **目的:**
   * 指定されたユースケースに関与する全てのアクターを取得します。
   * 
   * **パラメータ:**
   * @param useCaseId - ユースケースID
   * 
   * **戻り値:**
   * @returns ユースケースに関わるアクターのリスト
   * 
   * **使用例:**
   * ```typescript
   * const actors = analyzer.getActorsForUseCase('uc-001');
   * console.log(`uc-001には${actors.length}人のアクターが関与`);
   * for (const actor of actors) {
   *   console.log(`  - ${actor.name}`);
   * }
   * ```
   */
  getActorsForUseCase(useCaseId: string): AnyActor[] {
    const analysis = this.analyze();
    const actorIds = analysis.useCaseActorMap.get(useCaseId) || [];
    return actorIds.map(id => this.actors.get(id)!).filter(Boolean);
  }

  /**
   * アクター間の協調関係を分析
   * 
   * **目的:**
   * 同じユースケースに関わるアクター同士の協調関係を特定します。
   * チーム編成やコミュニケーション設計に役立ちます。
   * 
   * **分析方法:**
   * 同じユースケースに参加するアクター同士を協調関係として記録します。
   * 
   * **戻り値:**
   * @returns アクターID → 協調するアクターIDのSetのマッピング
   * 
   * **使用例:**
   * ```typescript
   * const collaborations = analyzer.getActorCollaborations();
   * 
   * console.log('アクター間協調関係:');
   * for (const [actorId, collaborators] of collaborations.entries()) {
   *   console.log(`${actorId}の協調相手:`);
   *   for (const collaboratorId of collaborators) {
   *     console.log(`  - ${collaboratorId}`);
   *   }
   * }
   * ```
   */
  getActorCollaborations(): Map<string, Set<string>> {
    const collaborations = new Map<string, Set<string>>();

    for (const useCase of this.useCases.values()) {
      const allActors = [useCase.actors.primary];
      if (useCase.actors.secondary) {
        allActors.push(...useCase.actors.secondary);
      }

      // 同じユースケースに関わるアクター同士を協調関係として記録
      for (let i = 0; i < allActors.length; i++) {
        for (let j = i + 1; j < allActors.length; j++) {
          const actorRef1 = allActors[i];
          const actorRef2 = allActors[j];

          if (!actorRef1 || !actorRef2) continue;

          const actor1 = getActorId(actorRef1);
          const actor2 = getActorId(actorRef2);

          if (!collaborations.has(actor1)) {
            collaborations.set(actor1, new Set());
          }
          if (!collaborations.has(actor2)) {
            collaborations.set(actor2, new Set());
          }

          collaborations.get(actor1)!.add(actor2);
          collaborations.get(actor2)!.add(actor1);
        }
      }
    }

    return collaborations;
  }

  /**
   * レポート生成
   * 
   * **目的:**
   * 関係性分析結果を人間が読みやすい形式のレポートとして生成します。
   * 
   * **レポート内容:**
   * 1. 概要統計（総アクター数、総ユースケース数、総関係性数）
   * 2. 複数のユースケースに関わるアクター（キーパーソン）
   * 3. 複数のアクターが関わるユースケース（複雑なユースケース）
   * 4. アクター間協調関係
   * 
   * **戻り値:**
   * @returns レポート文字列
   * 
   * **使用例:**
   * ```typescript
   * const report = analyzer.generateReport();
   * console.log(report);
   * 
   * // 出力例:
   * // === アクター・ユースケース関係性分析レポート ===
   * // 
   * // 📊 概要:
   * //   - 総アクター数: 5
   * //   - 総ユースケース数: 10
   * //   - 総関係性数: 15
   * // 
   * // 🔗 N:N関係の詳細:
   * // 
   * // 📋 複数のユースケースに関わるアクター:
   * //   • 購入者: 8個のユースケース
   * //     - ログイン (primary)
   * //     - 商品検索 (primary)
   * //     - 商品購入 (primary)
   * //     ...
   * // 
   * // 🎭 複数のアクターが関わるユースケース:
   * //   • 商品購入: 3人のアクター
   * //     - 購入者 (primary)
   * //     - 決済システム (secondary)
   * //     - 在庫システム (secondary)
   * // 
   * // 🤝 アクター間協調関係:
   * //   • 購入者:
   * //     - 決済システム
   * //     - 在庫システム
   * ```
   */
  generateReport(): string {
    const analysis = this.analyze();
    const collaborations = this.getActorCollaborations();

    let report = '=== アクター・ユースケース関係性分析レポート ===\n\n';

    report += `📊 概要:\n`;
    report += `  - 総アクター数: ${analysis.totalActors}\n`;
    report += `  - 総ユースケース数: ${analysis.totalUseCases}\n`;
    report += `  - 総関係性数: ${analysis.relationships.length}\n\n`;

    report += `🔗 N:N関係の詳細:\n`;

    report += `\n📋 複数のユースケースに関わるアクター:\n`;
    for (const actorId of analysis.multiRoleActors) {
      const actor = this.actors.get(actorId);
      const useCases = analysis.actorUseCaseMap.get(actorId) || [];
      report += `  • ${actor?.name || actorId}: ${useCases.length}個のユースケース\n`;
      for (const useCaseId of useCases) {
        const useCase = this.useCases.get(useCaseId);
        const role = analysis.relationships.find(
          r => r.actorId === actorId && r.useCaseId === useCaseId
        )?.role;
        report += `    - ${useCase?.name || useCaseId} (${role})\n`;
      }
    }

    report += `\n🎭 複数のアクターが関わるユースケース:\n`;
    for (const useCaseId of analysis.complexUseCases) {
      const useCase = this.useCases.get(useCaseId);
      const actors = analysis.useCaseActorMap.get(useCaseId) || [];
      report += `  • ${useCase?.name || useCaseId}: ${actors.length}人のアクター\n`;
      for (const actorId of actors) {
        const actor = this.actors.get(actorId);
        const role = analysis.relationships.find(
          r => r.actorId === actorId && r.useCaseId === useCaseId
        )?.role;
        report += `    - ${actor?.name || actorId} (${role})\n`;
      }
    }

    report += `\n🤝 アクター間協調関係:\n`;
    for (const [actorId, collaborators] of collaborations.entries()) {
      const actor = this.actors.get(actorId);
      if (collaborators.size > 0) {
        report += `  • ${actor?.name || actorId}:\n`;
        for (const collaboratorId of collaborators) {
          const collaborator = this.actors.get(collaboratorId);
          report += `    - ${collaborator?.name || collaboratorId}\n`;
        }
      }
    }

    return report;
  }
}
