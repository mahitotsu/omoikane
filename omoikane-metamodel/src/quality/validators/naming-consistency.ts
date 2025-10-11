/**
 * @fileoverview 命名規約の一貫性評価
 *
 * **目的:**
 * プロジェクト全体の命名規約を評価し、一貫性のない命名を検出します。
 *
 * **評価対象:**
 * 1. ID命名規則（要素ID）
 * 2. stepId命名規則
 * 3. ファイル名命名規則
 * 4. 用語の統一性（ドメイン用語）
 *
 * **使用例:**
 * ```typescript
 * import { assessNamingConsistency } from './naming-consistency.js';
 *
 * const result = assessNamingConsistency(actors, useCases, businessRequirements);
 * console.log(`命名規約スコア: ${result.overallScore}/100`);
 * ```
 *
 * @module quality/validators/naming-consistency
 */

import type {
    Actor,
    BusinessRequirementDefinition,
    Screen,
    ScreenFlow,
    UseCase,
    ValidationRule,
} from '../../types/index.js';

// ============================================================================
// 型定義
// ============================================================================

/**
 * 命名スタイル
 */
export type NamingStyle =
  | 'kebab-case' // 推奨: 'reservation-booking'
  | 'camel-case' // 'reservationBooking'
  | 'snake-case' // 'reservation_booking'
  | 'pascal-case' // 'ReservationBooking'
  | 'inconsistent'; // 混在

/**
 * 命名スタイル検出結果
 */
export interface NamingStyleAnalysis {
  style: NamingStyle;
  examples: string[];
}

/**
 * ID命名規則の評価結果
 */
export interface IdNamingAssessment {
  total: number;
  kebabCase: string[];
  camelCase: string[];
  snakeCase: string[];
  pascalCase: string[];
  inconsistent: string[];
  score: number; // 0-100
}

/**
 * stepId命名規則の評価結果
 */
export interface StepIdNamingAssessment {
  totalUseCases: number;
  totalSteps: number;
  kebabCase: number;
  camelCase: number;
  numeric: number; // '1', '2' などの数字のみ
  inconsistent: number;
  inconsistentUseCases: Array<{
    useCaseId: string;
    useCaseName: string;
    stepIds: string[];
    detectedStyles: NamingStyle[];
  }>;
  score: number; // 0-100
}

/**
 * ファイル名命名規則の評価結果
 */
export interface FileNamingAssessment {
  total: number;
  kebabCase: string[];
  camelCase: string[];
  pascalCase: string[];
  inconsistent: string[];
  score: number; // 0-100
}

/**
 * 用語の統一性評価結果
 */
export interface TerminologyConsistency {
  totalTerms: number;
  mixedTerms: Array<{
    term1: string;
    term2: string;
    occurrences1: Array<{
      location: string;
      context: string;
    }>;
    occurrences2: Array<{
      location: string;
      context: string;
    }>;
    suggestedUnifiedTerm: string;
  }>;
  score: number; // 0-100
}

/**
 * 命名規約の一貫性評価結果
 */
export interface NamingConsistencyAssessment {
  overallScore: number; // 0-100
  idNaming: IdNamingAssessment;
  stepIdNaming: StepIdNamingAssessment;
  fileNaming: FileNamingAssessment;
  terminology: TerminologyConsistency;
  recommendations: Array<{
    category: 'id' | 'step-id' | 'file' | 'terminology';
    priority: 'high' | 'medium' | 'low';
    message: string;
    affectedElements: string[];
    suggestedAction: string;
  }>;
}

// ============================================================================
// 命名スタイル検出
// ============================================================================

/**
 * 文字列の命名スタイルを検出
 *
 * **アルゴリズム:**
 * 1. ハイフン区切り → kebab-case
 * 2. アンダースコア区切り → snake-case
 * 3. 大文字始まり+キャメル → PascalCase
 * 4. 小文字始まり+キャメル → camelCase
 * 5. 上記以外 → inconsistent
 *
 * @param name - 検証する文字列
 * @returns 命名スタイル
 */
export function detectNamingStyle(name: string): NamingStyle {
  if (!name || name.length === 0) {
    return 'inconsistent';
  }

  // kebab-case: 小文字とハイフンのみ
  if (/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    return 'kebab-case';
  }

  // snake_case: 小文字とアンダースコアのみ
  if (/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(name)) {
    return 'snake-case';
  }

  // PascalCase: 大文字始まり、キャメルケース
  if (/^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(name)) {
    return 'pascal-case';
  }

  // camelCase: 小文字始まり、キャメルケース
  if (/^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(name)) {
    return 'camel-case';
  }

  return 'inconsistent';
}

/**
 * 文字列をケバブケースに変換
 *
 * @param name - 変換する文字列
 * @returns ケバブケース文字列
 */
export function toKebabCase(name: string): string {
  return (
    name
      // PascalCase/camelCase → kebab-case
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // snake_case → kebab-case
      .replace(/_/g, '-')
      .toLowerCase()
  );
}

// ============================================================================
// ID命名規則の評価
// ============================================================================

/**
 * ID命名規則を評価
 *
 * **評価内容:**
 * - ケバブケースの使用率を計算
 * - スコア = ケバブケース率 × 100
 *
 * @param elements - 評価対象の要素
 * @returns ID命名規則の評価結果
 */
export function assessIdNaming(
  elements: Array<{ id: string; name?: string }>
): IdNamingAssessment {
  const kebabCase: string[] = [];
  const camelCase: string[] = [];
  const snakeCase: string[] = [];
  const pascalCase: string[] = [];
  const inconsistent: string[] = [];

  for (const element of elements) {
    const style = detectNamingStyle(element.id);
    switch (style) {
      case 'kebab-case':
        kebabCase.push(element.id);
        break;
      case 'camel-case':
        camelCase.push(element.id);
        break;
      case 'snake-case':
        snakeCase.push(element.id);
        break;
      case 'pascal-case':
        pascalCase.push(element.id);
        break;
      default:
        inconsistent.push(element.id);
    }
  }

  const total = elements.length;
  const score = total > 0 ? (kebabCase.length / total) * 100 : 100;

  return {
    total,
    kebabCase,
    camelCase,
    snakeCase,
    pascalCase,
    inconsistent,
    score,
  };
}

// ============================================================================
// stepId命名規則の評価
// ============================================================================

/**
 * stepId命名規則を評価
 *
 * **評価内容:**
 * - 各ユースケース内でstepIdの一貫性をチェック
 * - ユースケース内で複数のスタイルが混在する場合は警告
 *
 * @param useCases - ユースケース配列
 * @returns stepId命名規則の評価結果
 */
export function assessStepIdNaming(
  useCases: UseCase[]
): StepIdNamingAssessment {
  let totalSteps = 0;
  let kebabCase = 0;
  let camelCase = 0;
  let numeric = 0;
  let inconsistent = 0;

  const inconsistentUseCases: Array<{
    useCaseId: string;
    useCaseName: string;
    stepIds: string[];
    detectedStyles: NamingStyle[];
  }> = [];

  for (const useCase of useCases) {
    const allSteps = [
      ...useCase.mainFlow,
      ...(useCase.alternativeFlows?.flatMap((f) => f.steps || []) || []),
    ];

    const stepIds = allSteps.map((s) => s.stepId).filter((id): id is string => id !== undefined);
    const styles = new Set<NamingStyle>();

    for (const stepId of stepIds) {
      totalSteps++;

      // 数字のみの場合
      if (/^\d+$/.test(stepId)) {
        numeric++;
        styles.add('inconsistent'); // 数字のみは非推奨
        continue;
      }

      const style = detectNamingStyle(stepId);
      styles.add(style);

      switch (style) {
        case 'kebab-case':
          kebabCase++;
          break;
        case 'camel-case':
          camelCase++;
          break;
        default:
          inconsistent++;
      }
    }

    // ユースケース内でスタイルが混在している場合
    if (styles.size > 1) {
      inconsistentUseCases.push({
        useCaseId: useCase.id,
        useCaseName: useCase.name,
        stepIds,
        detectedStyles: Array.from(styles),
      });
    }
  }

  const score =
    totalSteps > 0
      ? ((kebabCase / totalSteps) * 100 - inconsistentUseCases.length * 5) // 混在ペナルティ
      : 100;

  return {
    totalUseCases: useCases.length,
    totalSteps,
    kebabCase,
    camelCase,
    numeric,
    inconsistent,
    inconsistentUseCases,
    score: Math.max(0, score),
  };
}

// ============================================================================
// ファイル名命名規則の評価（仮実装）
// ============================================================================

/**
 * ファイル名命名規則を評価
 *
 * **注意:**
 * この関数は要素のソースファイル情報を必要としますが、
 * 現在のメタモデルにはその情報がありません。
 * 将来的にファイルパス情報を追加する場合に備えて、インターフェースのみ提供します。
 *
 * @param _filePaths - ファイルパス配列（未実装）
 * @returns ファイル名命名規則の評価結果
 */
export function assessFileNaming(_filePaths: string[]): FileNamingAssessment {
  // TODO: ファイルパス情報が利用可能になった場合に実装
  return {
    total: 0,
    kebabCase: [],
    camelCase: [],
    pascalCase: [],
    inconsistent: [],
    score: 100, // デフォルトで満点（評価不可のため）
  };
}

// ============================================================================
// 用語の統一性評価（簡易版）
// ============================================================================

/**
 * 用語の統一性を評価
 *
 * **評価内容:**
 * - 類似する用語の混在を検出（例: 「予約」と「booking」）
 * - 名前、説明文から用語を抽出
 *
 * **簡易版:**
 * 現在は基本的な類似語のみ検出。将来的にはNLP技術を使用した高度な検出を実装可能。
 *
 * @param elements - 評価対象の要素
 * @returns 用語の統一性評価結果
 */
export function assessTerminologyConsistency(
  elements: Array<{ id: string; name?: string; description?: string }>
): TerminologyConsistency {
  // 簡易版: よく混在する用語ペアのリスト
  const commonMixedTerms = [
    { term1: '予約', term2: 'booking' },
    { term1: '顧客', term2: 'customer' },
    { term1: 'ユーザー', term2: 'user' },
    { term1: '登録', term2: 'registration' },
    { term1: '削除', term2: 'delete' },
  ];

  const mixedTerms: TerminologyConsistency['mixedTerms'] = [];

  for (const { term1, term2 } of commonMixedTerms) {
    const occurrences1: Array<{ location: string; context: string }> = [];
    const occurrences2: Array<{ location: string; context: string }> = [];

    for (const element of elements) {
      const textToCheck = [
        element.id,
        element.name || '',
        element.description || '',
      ].join(' ');

      if (textToCheck.includes(term1)) {
        occurrences1.push({
          location: element.id,
          context: element.name || element.id,
        });
      }

      if (textToCheck.toLowerCase().includes(term2.toLowerCase())) {
        occurrences2.push({
          location: element.id,
          context: element.name || element.id,
        });
      }
    }

    // 両方の用語が使用されている場合は混在と判定
    if (occurrences1.length > 0 && occurrences2.length > 0) {
      mixedTerms.push({
        term1,
        term2,
        occurrences1,
        occurrences2,
        suggestedUnifiedTerm:
          occurrences1.length >= occurrences2.length ? term1 : term2,
      });
    }
  }

  const score = mixedTerms.length === 0 ? 100 : Math.max(0, 100 - mixedTerms.length * 15);

  return {
    totalTerms: commonMixedTerms.length,
    mixedTerms,
    score,
  };
}

// ============================================================================
// 統合評価
// ============================================================================

/**
 * 命名規約の一貫性を総合評価
 *
 * **評価内容:**
 * 1. ID命名規則（40%）
 * 2. stepId命名規則（30%）
 * 3. ファイル名命名規則（10%）
 * 4. 用語の統一性（20%）
 *
 * **推奨事項生成:**
 * - スコアが80点未満の項目について具体的な推奨事項を生成
 *
 * @param actors - アクター配列
 * @param useCases - ユースケース配列
 * @param businessRequirements - 業務要件定義配列
 * @param screens - 画面配列（オプション）
 * @param validationRules - バリデーションルール配列（オプション）
 * @param screenFlows - 画面フロー配列（オプション）
 * @returns 命名規約の一貫性評価結果
 */
export function assessNamingConsistency(
  actors: Actor[],
  useCases: UseCase[],
  businessRequirements: BusinessRequirementDefinition[],
  screens?: Screen[],
  validationRules?: ValidationRule[],
  screenFlows?: ScreenFlow[]
): NamingConsistencyAssessment {
  // 全要素を統合
  const allElements = [
    ...actors,
    ...useCases,
    ...businessRequirements,
    ...(screens || []),
    ...(validationRules || []),
    ...(screenFlows || []),
  ];

  // 各評価を実行
  const idNaming = assessIdNaming(allElements);
  const stepIdNaming = assessStepIdNaming(useCases);
  const fileNaming = assessFileNaming([]); // 未実装
  const terminology = assessTerminologyConsistency(allElements);

  // 総合スコア計算（重み付け平均）
  const overallScore =
    idNaming.score * 0.4 +
    stepIdNaming.score * 0.3 +
    fileNaming.score * 0.1 +
    terminology.score * 0.2;

  // 推奨事項生成
  const recommendations: NamingConsistencyAssessment['recommendations'] = [];

  // ID命名規則の推奨
  if (idNaming.score < 80) {
    if (idNaming.camelCase.length > 0) {
      recommendations.push({
        category: 'id',
        priority: 'high',
        message: `ID命名規則: ${idNaming.camelCase.length}個の要素でキャメルケースが使用されています。ケバブケースに統一してください`,
        affectedElements: idNaming.camelCase,
        suggestedAction: `以下のIDをケバブケースに変更してください:\n${idNaming.camelCase.map((id) => `  - ${id} → ${toKebabCase(id)}`).join('\n')}`,
      });
    }

    if (idNaming.snakeCase.length > 0) {
      recommendations.push({
        category: 'id',
        priority: 'medium',
        message: `ID命名規則: ${idNaming.snakeCase.length}個の要素でスネークケースが使用されています。ケバブケースに統一してください`,
        affectedElements: idNaming.snakeCase,
        suggestedAction: `以下のIDをケバブケースに変更してください:\n${idNaming.snakeCase.map((id) => `  - ${id} → ${toKebabCase(id)}`).join('\n')}`,
      });
    }

    if (idNaming.pascalCase.length > 0) {
      recommendations.push({
        category: 'id',
        priority: 'high',
        message: `ID命名規則: ${idNaming.pascalCase.length}個の要素でパスカルケースが使用されています。ケバブケースに統一してください`,
        affectedElements: idNaming.pascalCase,
        suggestedAction: `以下のIDをケバブケースに変更してください:\n${idNaming.pascalCase.map((id) => `  - ${id} → ${toKebabCase(id)}`).join('\n')}`,
      });
    }
  }

  // stepId命名規則の推奨
  if (stepIdNaming.score < 80) {
    if (stepIdNaming.numeric > 0) {
      recommendations.push({
        category: 'step-id',
        priority: 'medium',
        message: `stepId命名規則: ${stepIdNaming.numeric}個のステップで数字のみが使用されています。意味のあるIDに変更してください`,
        affectedElements: [],
        suggestedAction:
          'stepIdは意味のあるケバブケース（例: select-datetime, confirm-booking）を使用してください',
      });
    }

    if (stepIdNaming.inconsistentUseCases.length > 0) {
      for (const uc of stepIdNaming.inconsistentUseCases) {
        recommendations.push({
          category: 'step-id',
          priority: 'high',
          message: `stepId命名規則: ユースケース「${uc.useCaseName}」内でstepIdのスタイルが混在しています`,
          affectedElements: [uc.useCaseId],
          suggestedAction: `ユースケース内でケバブケースに統一してください:\n${uc.stepIds.map((id) => `  - ${id}${detectNamingStyle(id) !== 'kebab-case' ? ` → ${toKebabCase(id)}` : ''}`).join('\n')}`,
        });
      }
    }
  }

  // 用語の統一性の推奨
  if (terminology.score < 80) {
    for (const mixed of terminology.mixedTerms) {
      recommendations.push({
        category: 'terminology',
        priority: 'medium',
        message: `用語の不統一: 「${mixed.term1}」(${mixed.occurrences1.length}箇所)と「${mixed.term2}」(${mixed.occurrences2.length}箇所)が混在しています`,
        affectedElements: [
          ...mixed.occurrences1.map((o) => o.location),
          ...mixed.occurrences2.map((o) => o.location),
        ],
        suggestedAction: `「${mixed.suggestedUnifiedTerm}」に統一することを推奨します`,
      });
    }
  }

  return {
    overallScore,
    idNaming,
    stepIdNaming,
    fileNaming,
    terminology,
    recommendations,
  };
}
