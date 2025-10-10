/**
 * @fileoverview カバレッジ分析エンジン（Coverage Analysis Engine）
 *
 * **目的:**
 * ビジネス要求定義の各要素（ゴール、スコープ、ステークホルダーなど）が
 * ユースケースで適切に使用されているかを分析し、トレーサビリティを保証します。
 *
 * **分析対象（7つの要素タイプ）:**
 * 1. ビジネスゴール（Business Goals）
 * 2. スコープ項目（Scope Items）- inScope配列
 * 3. ステークホルダー（Stakeholders）
 * 4. 成功指標（Success Metrics）
 * 5. 前提条件（Assumptions）
 * 6. 制約条件（Constraints）
 * 7. ビジネスルール（Business Rules）
 *
 * **分析内容:**
 * - 各要素がどのユースケースで使用されているか（usedBy配列）
 * - カバレッジ率（covered / total）
 * - 未使用要素のリスト（uncovered）
 * - 孤立要素の検出（orphanedElements）- アクターが使用されていない場合
 *
 * **参照の検証:**
 * - Ref<T>形式（{id: string}）と文字列ID両方に対応
 * - useCase.businessRequirementCoverageから参照を取得
 * - ビジネスルールはcoverageとuseCase.businessRules両方をチェック
 *
 * **出力:**
 * - CoverageReport: 各要素タイプのカバレッジ情報
 * - 要素ごとのusedBy情報（どのユースケースが使用しているか）
 * - 孤立要素のリストと改善提案
 *
 * **拡張ポイント:**
 * - 新しい要素タイプを追加する場合: analyze〇〇Coverage関数を追加し、analyzeCoverageで呼び出す
 * - カバレッジ計算方法を変更する場合: covered / total の計算式を調整
 * - 孤立要素の判定基準を変更する場合: findOrphanedElements関数を修正
 *
 * @module quality/coverage-analyzer
 */

import type * as Business from '../types/business/index.js';
import type * as Functional from '../types/functional/index.js';

import type { CoverageDetail, CoverageReport, ElementCoverage, OrphanedElement } from './types.js';

// ============================================================================
// 型エイリアス
// ============================================================================

type Actor = Functional.Actor;
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
type UseCase = Functional.UseCase;

// ============================================================================
// 公開API: カバレッジ分析の実行
// ============================================================================

/**
 * ビジネス要求定義とユースケースのカバレッジを総合的に分析します。
 *
 * **分析フロー:**
 * 1. 7つの要素タイプごとにカバレッジを分析
 * 2. 各要素がどのユースケースで使用されているかを追跡
 * 3. 孤立要素（未使用のアクター）を検出
 * 4. カバレッジレポートを生成
 *
 * **カバレッジの定義:**
 * - カバレッジ率 = 使用されている要素数 / 全要素数
 * - 1つでもユースケースで使用されていればカバーされたと判定
 * - 使用されていない要素はuncoveredに含まれる
 *
 * @param businessRequirements - ビジネス要求定義（分析対象の要素を含む）
 * @param actors - アクターリスト（孤立検出の対象）
 * @param useCases - ユースケースリスト（参照元）
 * @returns カバレッジレポート（7つの要素タイプ + 孤立要素）
 *
 * **使用例:**
 * ```typescript
 * const coverage = analyzeCoverage(businessReq, actors, useCases);
 * console.log(`ビジネスゴールのカバレッジ: ${coverage.businessGoals.coverage * 100}%`);
 * console.log(`未使用のゴール: ${coverage.businessGoals.uncovered.length}件`);
 * ```
 *
 * **注意:**
 * - 要素が未定義の場合、カバレッジ率は1.0（100%）になります（0除算回避）
 * - ビジネスルールはuseCase.businessRequirementCoverageとuseCase.businessRules両方をチェック
 *
 * **拡張ポイント:**
 * - 新しい要素タイプを追加する場合: analyze〇〇Coverage関数を作成し、ここで呼び出す
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

// ============================================================================
// 内部分析関数: ビジネスゴール（Business Goals）
// ============================================================================

/**
 * ビジネスゴールのカバレッジを分析します。
 *
 * **分析ロジック:**
 * 1. businessRequirements.businessGoals配列を取得
 * 2. 各ゴールについて、全ユースケースをスキャン
 * 3. useCase.businessRequirementCoverage.businessGoalsに含まれているか確認
 * 4. 使用しているユースケースIDをusedBy配列に追加
 * 5. カバレッジ率を計算（covered / total）
 *
 * **参照形式:**
 * - Ref<BusinessGoal>形式: {id: string}
 * - 文字列ID形式: "BG001"など
 * - 両方に対応
 *
 * @param businessRequirements - ビジネス要求定義
 * @param useCases - ユースケースリスト
 * @returns ビジネスゴールのカバレッジ情報
 *
 * **拡張ポイント:**
 * - カバレッジ判定基準を変更する場合: isCovered判定条件を修正
 * - 重み付けを追加する場合: 優先度の高いゴールに係数をかける
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

// ============================================================================
// 内部分析関数: スコープ項目（Scope Items）
// ============================================================================

/**
 * スコープ項目（inScope）のカバレッジを分析します。
 *
 * **分析ロジック:**
 * 1. businessRequirements.scope.inScope配列を取得
 * 2. 各項目について、全ユースケースをスキャン
 * 3. useCase.businessRequirementCoverage.scopeItemsに含まれているか確認
 * 4. 使用しているユースケースIDをusedBy配列に追加
 * 5. カバレッジ率を計算（covered / total）
 *
 * **注意:**
 * - outOfScopeは分析対象外（意図的にスコープ外とされた項目）
 * - inScopeの項目は全てユースケースで実現されるべき
 *
 * @param businessRequirements - ビジネス要求定義
 * @param useCases - ユースケースリスト
 * @returns スコープ項目のカバレッジ情報
 *
 * **拡張ポイント:**
 * - outOfScopeも監視する場合: 別の関数を作成（警告レベルを下げる）
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

// ============================================================================
// 内部分析関数: ステークホルダー（Stakeholders）
// ============================================================================

/**
 * ステークホルダーのカバレッジを分析します。
 *
 * **分析ロジック:**
 * 1. businessRequirements.stakeholders配列を取得
 * 2. 各ステークホルダーについて、全ユースケースをスキャン
 * 3. useCase.businessRequirementCoverage.stakeholdersに含まれているか確認
 * 4. 使用しているユースケースIDをusedBy配列に追加
 * 5. カバレッジ率を計算（covered / total）
 *
 * **ステークホルダーの重要性:**
 * - 全てのステークホルダーは何らかのユースケースで言及されるべき
 * - 未使用のステークホルダーは削除するか、関連ユースケースを作成
 *
 * @param businessRequirements - ビジネス要求定義
 * @param useCases - ユースケースリスト
 * @returns ステークホルダーのカバレッジ情報
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

// ============================================================================
// 内部分析関数: 成功指標（Success Metrics）
// ============================================================================

/**
 * 成功指標のカバレッジを分析します。
 *
 * **分析ロジック:**
 * 1. businessRequirements.successMetrics配列を取得
 * 2. 各指標について、全ユースケースをスキャン
 * 3. useCase.businessRequirementCoverage.successMetricsに含まれているか確認
 * 4. 使用しているユースケースIDをusedBy配列に追加
 * 5. カバレッジ率を計算（covered / total）
 *
 * **成功指標の重要性:**
 * - 各成功指標は、それを達成するためのユースケースと紐づくべき
 * - 未使用の指標は測定不可能なため、削除または関連ユースケースを作成
 *
 * @param businessRequirements - ビジネス要求定義
 * @param useCases - ユースケースリスト
 * @returns 成功指標のカバレッジ情報
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

// ============================================================================
// 内部分析関数: 前提条件（Assumptions）
// ============================================================================

/**
 * 前提条件のカバレッジを分析します。
 *
 * **分析ロジック:**
 * 1. businessRequirements.assumptions配列を取得
 * 2. 各前提条件について、全ユースケースをスキャン
 * 3. useCase.businessRequirementCoverage.assumptionsに含まれているか確認
 * 4. 使用しているユースケースIDをusedBy配列に追加
 * 5. カバレッジ率を計算（covered / total）
 *
 * **前提条件の性質:**
 * - 前提条件は複数のユースケースで共有されることが多い
 * - 未使用の前提条件は削除候補（実際には不要な仮定）
 *
 * @param businessRequirements - ビジネス要求定義
 * @param useCases - ユースケースリスト
 * @returns 前提条件のカバレッジ情報
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

// ============================================================================
// 内部分析関数: 制約条件（Constraints）
// ============================================================================

/**
 * 制約条件のカバレッジを分析します。
 *
 * **分析ロジック:**
 * 1. businessRequirements.constraints配列を取得
 * 2. 各制約条件について、全ユースケースをスキャン
 * 3. useCase.businessRequirementCoverage.constraintsに含まれているか確認
 * 4. 使用しているユースケースIDをusedBy配列に追加
 * 5. カバレッジ率を計算（covered / total）
 *
 * **制約条件の性質:**
 * - 制約条件は技術的制約、ビジネス制約、法的制約など
 * - 未使用の制約は実装時に考慮されない可能性があるため、カバレッジが重要
 *
 * @param businessRequirements - ビジネス要求定義
 * @param useCases - ユースケースリスト
 * @returns 制約条件のカバレッジ情報
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

// ============================================================================
// 内部分析関数: ビジネスルール（Business Rules）
// ============================================================================

/**
 * ビジネスルールのカバレッジを分析します。
 *
 * **分析ロジック:**
 * 1. businessRequirements.businessRules配列を取得
 * 2. 各ルールについて、全ユースケースをスキャン
 * 3. 2箇所をチェック:
 *    - useCase.businessRequirementCoverage.businessRules（推奨）
 *    - useCase.businessRules（直接参照、後方互換）
 * 4. どちらかに含まれていればカバーされたと判定
 * 5. 使用しているユースケースIDをusedBy配列に追加
 * 6. カバレッジ率を計算（covered / total）
 *
 * **注意:**
 * - ビジネスルールは2箇所で参照される可能性があるため両方をチェック
 * - 重複してカウントしないように注意（同じユースケースIDは1回だけ追加）
 *
 * **ビジネスルールの重要性:**
 * - ビジネスルールは業務ロジックの核心
 * - 未使用のルールは実装されない可能性があるため、カバレッジが最重要
 *
 * @param businessRequirements - ビジネス要求定義
 * @param useCases - ユースケースリスト
 * @returns ビジネスルールのカバレッジ情報
 *
 * **拡張ポイント:**
 * - 参照箇所を追加する場合: isReferencedの判定条件に追加
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

// ============================================================================
// 内部分析関数: 孤立要素の検出（Orphaned Elements）
// ============================================================================

/**
 * 孤立した要素（どのユースケースからも使用されていない要素）を検出します。
 *
 * **検出対象:**
 * - アクター: どのユースケースのprimaryまたはsecondaryにも含まれていない
 *
 * **検出ロジック:**
 * 1. 全アクターをスキャン
 * 2. 各アクターについて、全ユースケースをチェック
 * 3. useCase.actors.primary または useCase.actors.secondary に含まれているか確認
 * 4. どちらにも含まれていなければ孤立要素として報告
 * 5. 改善提案を生成
 *
 * **参照形式:**
 * - Ref<Actor>形式: {id: string}
 * - 文字列ID形式: "ACT001"など
 * - 両方に対応
 *
 * **改善提案:**
 * - 主体となるユースケースを作成
 * - 既存のユースケースに補助アクターとして追加
 *
 * @param businessRequirements - ビジネス要求定義（現在は未使用、将来の拡張用）
 * @param actors - アクターリスト
 * @param useCases - ユースケースリスト
 * @returns 孤立要素のリスト（改善提案を含む）
 *
 * **注意:**
 * - 現在はアクターのみを検出対象としています
 * - 他の要素（ビジネスゴールなど）は各analyze〇〇Coverage関数のuncoveredで確認可能
 *
 * **拡張ポイント:**
 * - 他の要素タイプを孤立検出対象に追加する場合: ここに同様のロジックを追加
 * - 孤立の定義を厳密化する場合: 「2回以上使用されていない」など条件を変更
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

      // 新型では Ref<Actor> = {id: string} または 文字列
      const primaryId =
        typeof primary === 'string'
          ? primary
          : typeof primary === 'object' && 'id' in primary
            ? primary.id
            : '';
      const secondaryIds = secondary.map(s =>
        typeof s === 'string' ? s : typeof s === 'object' && 'id' in s ? s.id : ''
      );

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
