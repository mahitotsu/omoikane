/**
 * @fileoverview AI Agent向け推奨アクション生成エンジン（Recommendation Engine）
 *
 * **目的:**
 * 品質評価結果から具体的な改善アクションを生成し、AIエージェントが実行可能な形式で提供します。
 *
 * **主要機能:**
 * 1. generateRecommendations: 総合推奨アクション生成
 * 2. generateCompletenessRecommendations: 完全性に関する推奨
 * 3. generateConsistencyRecommendations: 一貫性に関する推奨
 * 4. generateValidityRecommendations: 妥当性に関する推奨
 * 5. generateTraceabilityRecommendations: 追跡可能性に関する推奨
 *
 * **推奨アクションの構造:**
 * - priority: 優先度（high, medium, low）
 * - actionType: アクションタイプ（add_*, fix_*, improve_*）
 * - action: アクション名
 * - rationale: 根拠・理由
 * - affectedElements: 影響を受ける要素
 * - template: テンプレート（実行支援）
 *
 * **優先度付けアルゴリズム:**
 * - high: 3点
 * - medium: 2点
 * - low: 1点
 * （降順ソート）
 *
 * **拡張ポイント:**
 * - 新しいカテゴリーの推奨を追加
 * - テンプレートをカスタマイズ
 * - 優先度計算ロジックを改善
 *
 * @module quality/recommendation-engine
 */

import type * as Business from '../types/business/index.js';
import type * as Functional from '../types/functional/index.js';

import type { QualityAssessmentResult, Recommendation } from './types.js';

// 型エイリアス
type Actor = Functional.Actor;
type BusinessRequirementDefinition = Business.BusinessRequirementDefinition;
type UseCase = Functional.UseCase;

// ============================================================================
// 公開API（Public API）
// ============================================================================

/**
 * 推奨アクションを生成
 *
 * **処理フロー:**
 * 1. 完全性の問題から推奨アクションを生成
 * 2. 一貫性の問題から推奨アクションを生成
 * 3. 妥当性の問題から推奨アクションを生成
 * 4. 追跡可能性の問題から推奨アクションを生成
 * 5. 優先度でソート（high → medium → low）
 *
 * **推奨アクションのカテゴリー:**
 * - completeness: 欠落要素の追加、不完全な定義の補完
 * - consistency: 不整合の修正、命名規則の統一
 * - validity: 妥当性の検証、制約の追加
 * - traceability: 関連付けの追加、トレース情報の補完
 *
 * **使用例:**
 * ```typescript
 * const recommendations = generateRecommendations(
 *   qualityResult,
 *   businessRequirements,
 *   actors,
 *   useCases
 * );
 * recommendations.forEach(rec => {
 *   console.log(`[${rec.priority}] ${rec.action}`);
 *   console.log(`  理由: ${rec.rationale}`);
 * });
 * ```
 *
 * @param qualityResult 品質評価結果
 * @param businessRequirements ビジネス要件定義
 * @param actors アクター一覧
 * @param useCases ユースケース一覧
 * @returns 推奨アクションの配列（優先度順）
 */
export function generateRecommendations(
  qualityResult: QualityAssessmentResult,
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 完全性の問題に対する推奨アクション
  generateCompletenessRecommendations(
    qualityResult,
    businessRequirements,
    actors,
    useCases,
    recommendations
  );

  // 一貫性の問題に対する推奨アクション
  generateConsistencyRecommendations(qualityResult, recommendations);

  // 妥当性の問題に対する推奨アクション
  generateValidityRecommendations(qualityResult, recommendations);

  // 追跡可能性の問題に対する推奨アクション
  generateTraceabilityRecommendations(qualityResult, businessRequirements, recommendations);

  // 優先度でソート
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// ============================================================================
// 内部ヘルパー関数（Internal Helper Functions）
// ============================================================================

/**
 * 完全性に関する推奨アクション
 *
 * **目的:**
 * 欠落している要素や不完全な定義を特定し、補完のための推奨アクションを生成します。
 *
 * **チェック項目:**
 * - businessRequirements: ビジネスゴール、ステークホルダー、ビジネスルール
 * - actor: アクターの欠落
 * - useCase: 基本フロー、拡張フロー、例外フロー、前提条件、事後条件
 *
 * **アクションタイプ:**
 * - add_business_goal: ビジネスゴールを追加
 * - add_stakeholder: ステークホルダーを追加
 * - add_actor: アクターを追加
 * - add_basic_flow: 基本フローを追加
 * - add_precondition: 前提条件を追加
 * - add_postcondition: 事後条件を追加
 *
 * @param qualityResult 品質評価結果
 * @param businessRequirements ビジネス要件定義
 * @param actors アクター一覧
 * @param useCases ユースケース一覧
 * @param recommendations 推奨アクションを追加する配列
 */
function generateCompletenessRecommendations(
  qualityResult: QualityAssessmentResult,
  businessRequirements: BusinessRequirementDefinition,
  actors: Actor[],
  useCases: UseCase[],
  recommendations: Recommendation[]
): void {
  const completenessIssues = qualityResult.issues.filter(
    issue => issue.category === 'completeness'
  );

  for (const issue of completenessIssues) {
    switch (issue.elementType) {
      case 'businessRequirements':
        if (issue.elementId === 'businessGoals') {
          recommendations.push({
            priority: 'high',
            actionType: 'add_business_goal',
            action: 'ビジネスゴールを定義する',
            rationale: 'システムの目的を明確にするためにビジネスゴールの定義が必要です',
            affectedElements: ['businessRequirements'],
            template: {
              type: 'business_goal',
              content: {
                id: 'goal-[purpose]',
                description: 'システムが達成すべきビジネス目標を記述してください',
                measureableOutcome: '定量的な成果指標を含めてください',
              },
            },
          });
        }
        break;

      case 'actors':
        if (issue.elementId === 'all') {
          recommendations.push({
            priority: 'high',
            actionType: 'create_actor',
            action: 'システムのアクターを定義する',
            rationale: 'システムの利用者を明確にするためにアクターの定義が必要です',
            affectedElements: ['actors'],
            template: {
              type: 'actor',
              content: {
                id: 'actor-[role]',
                name: '[アクター名]',
                description: 'アクターの役割と責任を記述してください',
                goals: ['このアクターがシステムで達成したい目標'],
              },
            },
          });
        }
        break;

      case 'useCases':
        if (issue.elementId === 'all') {
          recommendations.push({
            priority: 'high',
            actionType: 'create_usecase',
            action: 'ユースケースを定義する',
            rationale: 'システムの機能を明確にするためにユースケースの定義が必要です',
            affectedElements: ['useCases'],
            template: {
              type: 'usecase',
              content: {
                id: 'usecase-[function]',
                name: '[ユースケース名]',
                description: 'ユースケースの目的と概要を記述してください',
                actors: {
                  primary: { id: 'actor-[main-user]' },
                },
                mainFlow: [
                  '1. [アクター]が[アクション]する',
                  '2. システムが[処理]を実行する',
                  '3. システムが[結果]を表示する',
                ],
              },
            },
          });
        }
        break;

      case 'useCase':
        if (issue.description.includes('説明が不足')) {
          recommendations.push({
            priority: 'medium',
            actionType: 'update_usecase_description',
            action: `ユースケース「${issue.elementId}」の説明を詳細化する`,
            rationale: 'ユースケースの目的と価値を明確にするために詳細な説明が必要です',
            affectedElements: [issue.elementId],
            template: {
              type: 'description',
              content: {
                description: 'このユースケースの目的、背景、ビジネス価値を詳しく記述してください',
              },
            },
          });
        }

        if (issue.description.includes('基本フローが定義されていません')) {
          recommendations.push({
            priority: 'high',
            actionType: 'add_main_flow',
            action: `ユースケース「${issue.elementId}」の基本フローを定義する`,
            rationale: 'ユースケースの実行手順を明確にするために基本フローが必要です',
            affectedElements: [issue.elementId],
            template: {
              type: 'main_flow',
              content: {
                mainFlow: [
                  '1. [前提条件の確認]',
                  '2. [主要なアクション]',
                  '3. [システムの応答]',
                  '4. [結果の確認]',
                ],
              },
            },
          });
        }
        break;
    }
  }
}

/**
 * 一貫性に関する推奨アクション
 */
function generateConsistencyRecommendations(
  qualityResult: QualityAssessmentResult,
  recommendations: Recommendation[]
): void {
  const consistencyIssues = qualityResult.issues.filter(issue => issue.category === 'consistency');

  for (const issue of consistencyIssues) {
    if (issue.description.includes('重複しています')) {
      recommendations.push({
        priority: 'high',
        actionType: 'fix_duplicate_id',
        action: `重複ID「${issue.elementId}」を修正する`,
        rationale: '要素の一意性を保つために重複IDの修正が必要です',
        affectedElements: [issue.elementId],
        template: {
          type: 'id_fix',
          content: {
            suggestion: `${issue.elementId}-v2 または ${issue.elementId}-[specific-context] のような一意のIDに変更してください`,
          },
        },
      });
    }

    if (issue.description.includes('が存在しません')) {
      recommendations.push({
        priority: 'high',
        actionType: 'fix_broken_reference',
        action: `不正な参照「${issue.elementId}」を修正する`,
        rationale: '参照整合性を保つために存在しない要素への参照を修正する必要があります',
        affectedElements: [issue.elementId],
        template: {
          type: 'reference_fix',
          content: {
            options: [
              '参照先の要素を新規作成する',
              '既存の正しい要素IDに変更する',
              '不要な参照を削除する',
            ],
          },
        },
      });
    }
  }
}

/**
 * 妥当性に関する推奨アクション
 */
function generateValidityRecommendations(
  qualityResult: QualityAssessmentResult,
  recommendations: Recommendation[]
): void {
  const validityIssues = qualityResult.issues.filter(issue => issue.category === 'validity');

  for (const issue of validityIssues) {
    if (issue.description.includes('説明が不十分')) {
      recommendations.push({
        priority: 'medium',
        actionType: 'improve_description',
        action: `${issue.elementType}「${issue.elementId}」の説明を改善する`,
        rationale: '要素の理解を容易にするためにより詳細な説明が必要です',
        affectedElements: [issue.elementId],
        template: {
          type: 'description_improvement',
          content: {
            guidelines: [
              '目的と背景を明確に記述する',
              '具体的な例や状況を含める',
              '関係者が理解しやすい言葉を使用する',
            ],
          },
        },
      });
    }

    if (issue.description.includes('長すぎます')) {
      recommendations.push({
        priority: 'medium',
        actionType: 'split_usecase',
        action: `ユースケース「${issue.elementId}」を分割する`,
        rationale: 'ユースケースの複雑性を軽減し理解しやすくするために分割が推奨されます',
        affectedElements: [issue.elementId],
        template: {
          type: 'usecase_split',
          content: {
            approach: [
              '論理的な境界で分割する',
              '各ユースケースが独立した価値を提供するようにする',
              '共通部分は包含関係で表現する',
            ],
          },
        },
      });
    }

    if (issue.description.includes('短すぎます')) {
      recommendations.push({
        priority: 'low',
        actionType: 'expand_usecase',
        action: `ユースケース「${issue.elementId}」を詳細化する`,
        rationale: 'ユースケースの価値を明確にするためにより詳細なステップが必要です',
        affectedElements: [issue.elementId],
        template: {
          type: 'usecase_expansion',
          content: {
            suggestions: [
              '前提条件の確認ステップを追加する',
              '例外的な分岐を考慮する',
              '結果の検証ステップを含める',
            ],
          },
        },
      });
    }
  }
}

/**
 * 追跡可能性に関する推奨アクション
 */
function generateTraceabilityRecommendations(
  qualityResult: QualityAssessmentResult,
  businessRequirements: BusinessRequirementDefinition,
  recommendations: Recommendation[]
): void {
  const traceabilityIssues = qualityResult.issues.filter(
    issue => issue.category === 'traceability'
  );

  for (const issue of traceabilityIssues) {
    if (issue.description.includes('カバレッジが低い')) {
      const elementType = issue.elementId;
      recommendations.push({
        priority: 'medium',
        actionType: 'improve_coverage',
        action: `${elementType}のカバレッジを改善する`,
        rationale: `未使用の${elementType}があることで要件の追跡可能性が低下しています`,
        affectedElements: ['coverage'],
        template: {
          type: 'coverage_improvement',
          content: {
            options: [
              `未使用の${elementType}を参照するユースケースを作成する`,
              `不要になった${elementType}を削除する`,
              `${elementType}とユースケースの関連性を見直す`,
            ],
          },
        },
      });
    }

    if (
      issue.elementType === 'actor' &&
      issue.description.includes('使用するユースケースが存在しません')
    ) {
      recommendations.push({
        priority: 'medium',
        actionType: 'create_usecase_for_actor',
        action: `アクター「${issue.elementId}」用のユースケースを作成する`,
        rationale: 'すべてのアクターがシステムを利用できるようにユースケースが必要です',
        affectedElements: [issue.elementId],
        template: {
          type: 'actor_usecase',
          content: {
            usecase: {
              id: `usecase-${issue.elementId}-[function]`,
              name: `${issue.elementId}の[機能名]`,
              actors: {
                primary: issue.elementId,
              },
              description: `${issue.elementId}がシステムで実現したい機能を定義してください`,
            },
          },
        },
      });
    }
  }
}
