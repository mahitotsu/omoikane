/**
 * ユースケースとアクターの関係性分析ユーティリティ
 */

import type { Actor, ActorRef, UseCase } from './delivery-elements';

// ユニオン型から actorId を取得するヘルパー関数
function getActorId(actor: string | ActorRef): string {
  return typeof actor === 'string' ? actor : actor.actorId;
}

// アクター・ユースケース関係マップ
export interface ActorUseCaseRelationship {
  actorId: string;
  useCaseId: string;
  role: 'primary' | 'secondary';
}

// 関係性分析結果
export interface RelationshipAnalysis {
  totalActors: number;
  totalUseCases: number;
  relationships: ActorUseCaseRelationship[];
  actorUseCaseMap: Map<string, string[]>; // アクターID -> ユースケースID[]
  useCaseActorMap: Map<string, string[]>; // ユースケースID -> アクターID[]
  multiRoleActors: string[]; // 複数のユースケースに関わるアクター
  complexUseCases: string[]; // 複数のアクターが関わるユースケース
}

export class RelationshipAnalyzer {
  private actors: Map<string, Actor> = new Map();
  private useCases: Map<string, UseCase> = new Map();

  // アクターを追加
  addActor(actor: Actor): void {
    this.actors.set(actor.id, actor);
  }

  // ユースケースを追加
  addUseCase(useCase: UseCase): void {
    this.useCases.set(useCase.id, useCase);
  }

  // 関係性を分析
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

      // アクター -> ユースケースのマッピング更新
      for (const actorId of useCaseActors) {
        if (!actorUseCaseMap.has(actorId)) {
          actorUseCaseMap.set(actorId, []);
        }
        actorUseCaseMap.get(actorId)!.push(useCase.id);
      }
    }

    // 複数の役割を持つアクターを特定
    const multiRoleActors = Array.from(actorUseCaseMap.entries())
      .filter(([_, useCaseIds]) => useCaseIds.length > 1)
      .map(([actorId, _]) => actorId);

    // 複数のアクターが関わるユースケースを特定
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

  // 特定のアクターが関わるユースケースを取得
  getUseCasesForActor(actorId: string): UseCase[] {
    const analysis = this.analyze();
    const useCaseIds = analysis.actorUseCaseMap.get(actorId) || [];
    return useCaseIds.map(id => this.useCases.get(id)!).filter(Boolean);
  }

  // 特定のユースケースに関わるアクターを取得
  getActorsForUseCase(useCaseId: string): Actor[] {
    const analysis = this.analyze();
    const actorIds = analysis.useCaseActorMap.get(useCaseId) || [];
    return actorIds.map(id => this.actors.get(id)!).filter(Boolean);
  }

  // アクター間の協調関係を分析（同じユースケースに関わるアクター）
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

  // レポート生成
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
