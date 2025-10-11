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
// 用語の統一性評価（動的検出版）
// ============================================================================

/**
 * Levenshtein距離を計算（Unicode対応）
 *
 * **用途:**
 * 類似する用語を検出するために、2つの文字列の編集距離を計算します。
 * 日本語などのマルチバイト文字にも対応しています。
 *
 * @param str1 - 比較する文字列1
 * @param str2 - 比較する文字列2
 * @returns 編集距離（0に近いほど類似）
 */
function levenshteinDistance(str1: string, str2: string): number {
  // 文字配列に変換（マルチバイト文字対応）
  const chars1 = Array.from(str1);
  const chars2 = Array.from(str2);
  const len1 = chars1.length;
  const len2 = chars2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = chars1[i - 1] === chars2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 削除
        matrix[i][j - 1] + 1, // 挿入
        matrix[i - 1][j - 1] + cost // 置換
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * 類似度を計算（0.0-1.0）
 *
 * @param str1 - 比較する文字列1
 * @param str2 - 比較する文字列2
 * @returns 類似度（1.0に近いほど類似）
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1.0 : 1.0 - distance / maxLen;
}

/**
 * テキストからトークン（単語）を抽出
 *
 * **処理内容:**
 * - 漢字: 1文字以上の連続（名詞として扱う）
 * - カタカナ: 2文字以上の連続（複合語を考慮）
 * - ひらがな: 助詞・助動詞なので除外
 * - 英語: 3文字以上の連続するアルファベット
 * - 記号・数字は除外
 *
 * **例:**
 * - "ユーザー管理" → ["ユーザー", "管理"]
 * - "利用者の一覧" → ["利用", "者", "一覧"]
 * - "サーバー設定" → ["サーバー", "設定"]
 *
 * @param text - 抽出元のテキスト
 * @returns トークンの配列
 */
function extractTokens(text: string): string[] {
  const tokens: string[] = [];

  // 漢字トークン（1文字以上）
  const kanjiTokens = text.match(/[\u4E00-\u9FFF]+/g) || [];
  tokens.push(...kanjiTokens);

  // カタカナトークン（2文字以上）
  const katakanaTokens = text.match(/[\u30A0-\u30FF]{2,}/g) || [];
  tokens.push(...katakanaTokens);

  // 英語トークン（3文字以上のアルファベット）
  const englishTokens = text.match(/[a-zA-Z]{3,}/gi) || [];
  tokens.push(...englishTokens);

  return tokens;
}

/**
 * 用語の統一性を評価（動的検出版）
 *
 * **改善内容:**
 * - プロジェクト内の用語を動的に抽出
 * - カスタム用語ペアを優先（意味的に類似する用語を指定可能）
 * - Levenshtein距離で表記ゆれを自動検出（補助的）
 * - IDと表示テキストを分離して評価
 *
 * **アルゴリズム:**
 * 1. カスタム用語ペアをチェック（優先）
 * 2. 表示テキスト（name, description）からトークンを抽出
 * 3. トークンの出現頻度をカウント
 * 4. 類似度が高い（≥0.70）トークンペアを検出（補助的）
 * 5. 両方が使用されている場合のみ混在と判定
 *
 * **使用例（カスタム用語ペア指定）:**
 * ```typescript
 * const customPairs = [
 *   { term1: 'ユーザー', term2: '利用者' },  // 意味的に類似
 *   { term1: '予約', term2: 'ブッキング' },  // 日本語とカタカナの混在
 *   { term1: '顧客', term2: 'カスタマー' },
 * ];
 *
 * const result = assessTerminologyConsistency(elements, customPairs);
 * ```
 *
 * **例（正常）:**
 * ```typescript
 * { id: 'user-registration', name: 'ユーザー登録' } // ✅ OK (IDは評価対象外)
 * ```
 *
 * **例（混在検出）:**
 * ```typescript
 * // カスタム用語ペアで指定された場合
 * { name: 'ユーザー管理' }    // ユーザー
 * { name: '利用者一覧' }      // 利用者
 * // → カスタムペアで指定されているため混在と判定
 *
 * // 表記ゆれの自動検出
 * { name: 'サーバー設定' }    // サーバー
 * { name: 'サーバ管理' }      // サーバ（長音記号の有無）
 * // → 類似度が高いため混在と判定
 * ```
 *
 * @param elements - 評価対象の要素
 * @param customTermPairs - カスタム用語ペア（オプション）
 * @returns 用語の統一性評価結果
 */
export function assessTerminologyConsistency(
  elements: Array<{ id: string; name?: string; description?: string }>,
  customTermPairs?: Array<{ term1: string; term2: string }>
): TerminologyConsistency {
  // 表示テキストから全トークンを抽出
  const tokenOccurrences = new Map<
    string,
    Array<{ location: string; context: string }>
  >();

  for (const element of elements) {
    // IDは評価対象外（技術的な識別子として英語使用は正常）
    // name と description のみを評価対象とする
    const displayTexts = [element.name || '', element.description || ''].filter(
      (text) => text.length > 0
    );

    for (const text of displayTexts) {
      const tokens = extractTokens(text);
      for (const token of tokens) {
        if (!tokenOccurrences.has(token)) {
          tokenOccurrences.set(token, []);
        }
        tokenOccurrences.get(token)!.push({
          location: element.id,
          context: element.name || element.id,
        });
      }
    }
  }

  // トークンリストを取得（出現頻度1回以上）
  const frequentTokens = Array.from(tokenOccurrences.entries())
    .filter(([_, occurrences]) => occurrences.length >= 1)
    .map(([token]) => token);

  const mixedTerms: TerminologyConsistency['mixedTerms'] = [];
  const checkedPairs = new Set<string>();

  // カスタム用語ペアをチェック（優先）
  if (customTermPairs && customTermPairs.length > 0) {
    for (const { term1, term2 } of customTermPairs) {
      const occurrences1 = tokenOccurrences.get(term1) || [];
      const occurrences2 = tokenOccurrences.get(term2) || [];

      if (occurrences1.length > 0 && occurrences2.length > 0) {
        mixedTerms.push({
          term1,
          term2,
          occurrences1,
          occurrences2,
          suggestedUnifiedTerm:
            occurrences1.length >= occurrences2.length ? term1 : term2,
        });
        checkedPairs.add(`${term1}-${term2}`);
        checkedPairs.add(`${term2}-${term1}`);
      }
    }
  }

  // 表記ゆれの自動検出（補助的）
  // 類似度が高い（≥0.70）トークンペアを検出
  for (let i = 0; i < frequentTokens.length; i++) {
    for (let j = i + 1; j < frequentTokens.length; j++) {
      const token1 = frequentTokens[i];
      const token2 = frequentTokens[j];

      // 既にチェック済みのペアはスキップ
      const pairKey = `${token1}-${token2}`;
      if (checkedPairs.has(pairKey)) continue;

      // 同一トークンはスキップ
      if (token1 === token2) continue;

      // 部分文字列チェック（活用形を除外）
      // ただし、長さの差が小さい場合（≤2文字）は表記ゆれの可能性があるので検出対象とする
      const lengthDiff = Math.abs(
        Array.from(token1).length - Array.from(token2).length
      );
      if (lengthDiff > 2) {
        // 長さの差が大きい場合のみ部分文字列チェック
        if (token1.includes(token2) || token2.includes(token1)) {
          continue; // 活用形や複合語の関係と判断してスキップ
        }
      }

      // 類似度を計算（Levenshtein距離ベース）
      const similarity = calculateSimilarity(token1, token2);

      // 類似度が0.70以上の場合、表記ゆれと判定
      // （例: 「サーバー」vs「サーバ」、「データベース」vs「DB」等）
      if (similarity >= 0.70) {
        const occurrences1 = tokenOccurrences.get(token1)!;
        const occurrences2 = tokenOccurrences.get(token2)!;

        mixedTerms.push({
          term1: token1,
          term2: token2,
          occurrences1,
          occurrences2,
          suggestedUnifiedTerm:
            occurrences1.length >= occurrences2.length ? token1 : token2,
        });

        checkedPairs.add(pairKey);
        checkedPairs.add(`${token2}-${token1}`);
      }
    }
  }

  // スコア計算: 混在が少ないほど高スコア
  const score =
    mixedTerms.length === 0 ? 100 : Math.max(0, 100 - mixedTerms.length * 15);

  return {
    totalTerms: frequentTokens.length,
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
        message: `用語の不統一（表示テキスト内）: 「${mixed.term1}」(${mixed.occurrences1.length}箇所)と「${mixed.term2}」(${mixed.occurrences2.length}箇所)が混在しています`,
        affectedElements: [
          ...mixed.occurrences1.map((o) => o.location),
          ...mixed.occurrences2.map((o) => o.location),
        ],
        suggestedAction: `表示テキスト（name、description）内で「${mixed.suggestedUnifiedTerm}」に統一することを推奨します。\n注意: ID内で英語を使用するのは正常です（例: id='user-registration', name='ユーザー登録' は適切）`,
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
