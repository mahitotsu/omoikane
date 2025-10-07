/**
 * @fileoverview ユースケース型定義（Functional Use Case）
 * 
 * **目的:**
 * システムとアクターの相互作用を記述するユースケースの型を定義します。
 * 段階的詳細化に対応し、基本情報と詳細情報を分離した柔軟な構造を提供します。
 * 
 * **型定義:**
 * 1. UseCaseComplexity: ユースケースの複雑度（simple, medium, complex）
 * 2. FlowProbability: 代替フローの発生確率（high, medium, low）
 * 3. FlowImpact: 代替フローの影響度（critical, major, minor）
 * 4. UseCaseStep: ユースケースのステップ（アクション、結果、詳細情報）
 * 5. AlternativeFlow: 代替フロー（例外処理の流れ）
 * 6. UseCaseActors: ユースケース内のアクター情報（主・副アクター）
 * 7. UseCase: ユースケース本体（メインフロー、代替フロー、要件）
 * 
 * **段階的詳細化の設計:**
 * - 基本フィールド（必須）: id, name, actors, preconditions, postconditions, mainFlow
 * - 詳細化フィールド（オプション）: complexity, estimatedEffort, acceptanceCriteria, 各種要件
 * - 初期段階では基本情報のみを記述し、後で詳細化可能
 * 
 * **使用例:**
 * ```typescript
 * // シンプルなユースケース（基本情報のみ）
 * const simpleUseCase: UseCase = {
 *   id: 'uc-001',
 *   name: 'ログイン',
 *   actors: {
 *     primary: typedActorRef('actor-001') // 購入者
 *   },
 *   preconditions: ['ユーザーが登録済みである'],
 *   postconditions: ['ユーザーがログイン状態になる'],
 *   mainFlow: [
 *     {
 *       actor: typedActorRef('actor-001'),
 *       action: 'ログイン画面を開く',
 *       expectedResult: 'ログインフォームが表示される'
 *     },
 *     {
 *       actor: typedActorRef('actor-001'),
 *       action: 'メールアドレスとパスワードを入力する',
 *       expectedResult: '入力内容が受け付けられる'
 *     },
 *     {
 *       actor: typedActorRef('actor-001'),
 *       action: 'ログインボタンをクリックする',
 *       expectedResult: 'ホーム画面に遷移する'
 *     }
 *   ],
 *   priority: 'high'
 * };
 * 
 * // 詳細化されたユースケース
 * const detailedUseCase: UseCase = {
 *   ...simpleUseCase,
 *   complexity: 'medium',
 *   estimatedEffort: '3人日',
 *   acceptanceCriteria: [
 *     '正しい認証情報でログインできる',
 *     '誤った認証情報でエラーメッセージが表示される'
 *   ],
 *   alternativeFlows: [
 *     {
 *       id: 'alt-001',
 *       name: 'パスワード誤り',
 *       condition: 'パスワードが誤っている',
 *       steps: [
 *         {
 *           actor: typedActorRef('system'),
 *           action: 'エラーメッセージを表示する',
 *           expectedResult: 'ユーザーに誤りが通知される'
 *         }
 *       ],
 *       probability: 'high',
 *       impact: 'minor'
 *     }
 *   ],
 *   securityRequirements: [
 *     'パスワードは暗号化して送信する',
 *     'ログイン失敗は記録する'
 *   ]
 * };
 * ```
 * 
 * @module types/functional/use-case
 */

import type { BusinessRequirementCoverage, BusinessRule, SecurityPolicy } from '../business/index.js';
import type { PriorityLevel, Ref, TraceableDocument } from '../foundation/index.js';
import type { ActorReference } from './actor.js';

// ============================================================================
// 列挙型定義
// ============================================================================

/**
 * ユースケースの複雑度
 * 
 * **複雑度定義:**
 * - simple: シンプル
 *   ステップ数が少ない（1-5ステップ程度）
 *   代替フローが少ない
 *   例: ログアウト、プロフィール閲覧
 * 
 * - medium: 中程度
 *   ステップ数が中程度（6-15ステップ程度）
 *   代替フローが複数ある
 *   例: ログイン、商品検索、注文履歴閲覧
 * 
 * - complex: 複雑
 *   ステップ数が多い（16ステップ以上）
 *   代替フローが多数ある
 *   複数のシステムやアクターが関与
 *   例: 商品購入、決済処理、在庫管理
 * 
 * **使用例:**
 * ```typescript
 * const complexity: UseCaseComplexity = 'medium';
 * ```
 */
export type UseCaseComplexity = 'simple' | 'medium' | 'complex';

/**
 * 代替フローの発生確率
 * 
 * **確率定義:**
 * - high: 高確率（頻繁に発生する、50%以上）
 * - medium: 中確率（たまに発生する、10-50%）
 * - low: 低確率（稀に発生する、10%未満）
 * 
 * **使用例:**
 * ```typescript
 * const probability: FlowProbability = 'high';
 * ```
 */
export type FlowProbability = 'high' | 'medium' | 'low';

/**
 * 代替フローの影響度
 * 
 * **影響度定義:**
 * - critical: 致命的（システムやビジネスに重大な影響）
 * - major: 大きい（機能に重大な影響、対応必須）
 * - minor: 小さい（影響は軽微、対応は任意）
 * 
 * **使用例:**
 * ```typescript
 * const impact: FlowImpact = 'major';
 * ```
 */
export type FlowImpact = 'critical' | 'major' | 'minor';

// ============================================================================
// ユースケースステップ
// ============================================================================

/**
 * ユースケースのステップ
 * 
 * **目的:**
 * ユースケースの実行ステップを記述します。
 * 段階的詳細化に対応し、基本情報と詳細情報を分離しています。
 * 
 * **基本フィールド（必須）:**
 * - actor: ステップを実行するアクター
 * - action: アクションの説明
 * - expectedResult: 期待される結果
 * 
 * **詳細化フィールド（オプション）:**
 * - stepId: ステップID（代替フローの戻り先指定に使用）
 * - stepNumber: ステップ番号（自動計算される）
 * - inputData: 入力データ
 * - validationRules: バリデーションルール
 * - errorHandling: エラーハンドリング
 * - performanceRequirement: パフォーマンス要件
 * - notes: 補足メモ
 * 
 * **使用例:**
 * ```typescript
 * // 基本的なステップ
 * const step1: UseCaseStep = {
 *   actor: typedActorRef('actor-001'),
 *   action: 'ログイン画面を開く',
 *   expectedResult: 'ログインフォームが表示される'
 * };
 * 
 * // 詳細化されたステップ
 * const step2: UseCaseStep = {
 *   stepId: 'step-login',
 *   actor: typedActorRef('actor-001'),
 *   action: 'メールアドレスとパスワードを入力する',
 *   expectedResult: '入力内容が受け付けられる',
 *   inputData: ['メールアドレス', 'パスワード'],
 *   validationRules: [
 *     'メールアドレスは正しい形式である',
 *     'パスワードは8文字以上である'
 *   ],
 *   errorHandling: [
 *     '形式が誤っている場合はエラーメッセージを表示する'
 *   ],
 *   performanceRequirement: '入力検証は200ms以内に完了する',
 *   notes: 'パスワードはマスク表示する'
 * };
 * ```
 */
export interface UseCaseStep {
  /** ステップID（オプション、戻り先参照に使用） */
  stepId?: string;
  
  /** ステップ番号（実行時に自動計算） */
  readonly stepNumber?: number;
  
  /** アクター（ステップを実行する主体） */
  actor: ActorReference;
  
  /** アクションの説明（アクターが実行する操作） */
  action: string;
  
  /** 期待される結果（アクション後のシステム状態や出力） */
  expectedResult: string;
  
  /** 補足メモ（UI仕様、注意事項など） */
  notes?: string;
  
  // 詳細化フィールド（オプション）
  
  /** 入力データ（ステップで必要なデータ項目） */
  inputData?: string[];
  
  /** バリデーションルール（入力データの検証ルール） */
  validationRules?: string[];
  
  /** エラーハンドリング（エラー発生時の処理） */
  errorHandling?: string[];
  
  /** パフォーマンス要件（応答時間、スループットなど） */
  performanceRequirement?: string;
}

// ============================================================================
// 代替フロー
// ============================================================================

/**
 * 代替フロー
 * 
 * **目的:**
 * メインフローから分岐する例外的な処理の流れを記述します。
 * エラーハンドリング、特殊条件、例外ケースをカバーします。
 * 
 * **基本フィールド（必須）:**
 * - id: 代替フローID
 * - name: 代替フロー名
 * - condition: 発生条件
 * - steps: ステップ
 * 
 * **詳細化フィールド（オプション）:**
 * - returnToStepId: 戻り先ステップID（stepIdベースの戻り先指定）
 * - probability: 発生確率
 * - impact: 影響度
 * - mitigation: 緩和策
 * 
 * **使用例:**
 * ```typescript
 * // 基本的な代替フロー
 * const altFlow1: AlternativeFlow = {
 *   id: 'alt-001',
 *   name: 'パスワード誤り',
 *   condition: 'パスワードが誤っている',
 *   steps: [
 *     {
 *       actor: typedActorRef('system'),
 *       action: 'エラーメッセージを表示する',
 *       expectedResult: 'ユーザーに誤りが通知される'
 *     },
 *     {
 *       actor: typedActorRef('system'),
 *       action: 'ログイン試行回数をインクリメントする',
 *       expectedResult: '試行回数が記録される'
 *     }
 *   ]
 * };
 * 
 * // 詳細化された代替フロー
 * const altFlow2: AlternativeFlow = {
 *   id: 'alt-002',
 *   name: 'アカウントロック',
 *   condition: 'ログイン失敗が5回を超える',
 *   steps: [
 *     {
 *       actor: typedActorRef('system'),
 *       action: 'アカウントをロックする',
 *       expectedResult: 'アカウントがロック状態になる'
 *     },
 *     {
 *       actor: typedActorRef('system'),
 *       action: 'ロック通知メールを送信する',
 *       expectedResult: 'ユーザーにメールが届く'
 *     }
 *   ],
 *   probability: 'low',
 *   impact: 'major',
 *   mitigation: [
 *     'パスワードリセット機能を提供する',
 *     'サポートセンターの連絡先を表示する'
 *   ]
 * };
 * ```
 */
export interface AlternativeFlow {
  /** 代替フローID（一意識別子） */
  id: string;
  
  /** 代替フロー名（人間が読める名前） */
  name: string;
  
  /** 発生条件（代替フローが発生するトリガー条件） */
  condition: string;
  
  /** ステップ（代替フローの処理手順） */
  steps: UseCaseStep[];
  
  /** 戻り先ステップID（stepIdベースの戻り先指定、省略時はフロー終了） */
  returnToStepId?: string;
  
  // 詳細化フィールド（オプション）
  
  /** 発生確率（high, medium, low） */
  probability?: FlowProbability;
  
  /** 影響度（critical, major, minor） */
  impact?: FlowImpact;
  
  /** 緩和策（影響を軽減する対策） */
  mitigation?: string[];
}

// ============================================================================
// ユースケースアクター
// ============================================================================

/**
 * ユースケース内のアクター情報
 * 
 * **目的:**
 * ユースケースに関与する主アクターと副アクターを定義します。
 * 
 * **フィールド:**
 * - primary: 主アクター（ユースケースの主要な実行者、必須）
 * - secondary: 副アクター（主アクターを支援する関係者、オプション）
 * 
 * **使用例:**
 * ```typescript
 * // 主アクターのみ
 * const actors1: UseCaseActors = {
 *   primary: typedActorRef('actor-001') // 購入者
 * };
 * 
 * // 主アクターと副アクター
 * const actors2: UseCaseActors = {
 *   primary: typedActorRef('actor-001'), // 購入者
 *   secondary: ['actor-002', 'actor-003'] // 管理者、決済システム
 * };
 * 
 * // Ref<Actor>での指定
 * const actors3: UseCaseActors = {
 *   primary: { id: 'actor-001', displayName: '購入者' },
 *   secondary: [
 *     { id: 'actor-002', displayName: '管理者' },
 *     { id: 'actor-003', displayName: '決済システム' }
 *   ]
 * };
 * ```
 */
export interface UseCaseActors {
  /** 主アクター（ユースケースの主要な実行者） */
  primary: ActorReference;
  
  /** 副アクター（主アクターを支援する関係者、システム） */
  secondary?: ActorReference[];
}

// ============================================================================
// ユースケース本体
// ============================================================================

/**
 * ユースケース
 * 
 * **目的:**
 * システムとアクターの相互作用を記述します。
 * 段階的詳細化に対応し、基本情報と詳細情報を分離しています。
 * 
 * **基本フィールド（必須）:**
 * - id: ユースケースID
 * - name: ユースケース名
 * - actors: アクター情報（主・副アクター）
 * - preconditions: 事前条件
 * - postconditions: 事後条件
 * - mainFlow: メインフロー
 * - priority: 優先度
 * 
 * **詳細化フィールド（オプション）:**
 * - alternativeFlows: 代替フロー
 * - complexity: 複雑度
 * - estimatedEffort: 見積もり工数
 * - acceptanceCriteria: 受入基準
 * - businessRules: 関連ビジネスルール
 * - businessValue: ビジネス価値
 * - dataRequirements: データ要件
 * - securityRequirements: セキュリティ要件
 * - securityPolicies: 関連セキュリティポリシー
 * - performanceRequirements: パフォーマンス要件
 * - uiRequirements: UI要件
 * - businessRequirementCoverage: 業務要件カバレッジ
 * 
 * **段階的詳細化の例:**
 * ```typescript
 * // Phase 1: 基本情報のみ
 * const phase1: UseCase = {
 *   id: 'uc-001',
 *   name: 'ログイン',
 *   actors: { primary: typedActorRef('actor-001') },
 *   preconditions: ['ユーザーが登録済みである'],
 *   postconditions: ['ユーザーがログイン状態になる'],
 *   mainFlow: [
 *     {
 *       actor: typedActorRef('actor-001'),
 *       action: 'ログイン画面を開く',
 *       expectedResult: 'ログインフォームが表示される'
 *     }
 *   ],
 *   priority: 'high'
 * };
 * 
 * // Phase 2: 代替フロー追加
 * const phase2: UseCase = {
 *   ...phase1,
 *   alternativeFlows: [
 *     {
 *       id: 'alt-001',
 *       name: 'パスワード誤り',
 *       condition: 'パスワードが誤っている',
 *       steps: [...]
 *     }
 *   ]
 * };
 * 
 * // Phase 3: 詳細要件追加
 * const phase3: UseCase = {
 *   ...phase2,
 *   complexity: 'medium',
 *   estimatedEffort: '3人日',
 *   acceptanceCriteria: [
 *     '正しい認証情報でログインできる',
 *     '誤った認証情報でエラーメッセージが表示される'
 *   ],
 *   securityRequirements: [
 *     'パスワードは暗号化して送信する',
 *     'ログイン失敗は記録する'
 *   ],
 *   performanceRequirements: [
 *     '認証処理は2秒以内に完了する'
 *   ]
 * };
 * ```
 * 
 * **TraceableDocumentからの継承:**
 * - relatedDocuments: 関連文書（要件、テストケースなど）
 * - traceabilityNote: トレーサビリティのメモ
 * - description: ユースケースの説明
 * - metadata: メタデータ
 */
export interface UseCase extends TraceableDocument {
  /** アクター（主・副アクター） */
  actors: UseCaseActors;
  
  /** 業務要件カバレッジ（ビジネスゴール、ルールとの対応） */
  businessRequirementCoverage?: BusinessRequirementCoverage;
  
  /** 事前条件（ユースケース実行前に満たすべき条件） */
  preconditions: string[];
  
  /** 事後条件（ユースケース実行後に成立する条件） */
  postconditions: string[];
  
  /** メインフロー（正常系の処理手順） */
  mainFlow: UseCaseStep[];
  
  /** 代替フロー（例外系の処理手順） */
  alternativeFlows?: AlternativeFlow[];
  
  /** 優先度（high, medium, low） */
  priority: PriorityLevel;
  
  // 詳細化フィールド（オプション）
  
  /** 複雑度（simple, medium, complex） */
  complexity?: UseCaseComplexity;
  
  /** 見積もり工数（例: 3人日、1週間） */
  estimatedEffort?: string;
  
  /** 受入基準（ユースケースの完了判定基準） */
  acceptanceCriteria?: string[];
  
  /** 関連ビジネスルール（適用されるビジネスルールへの参照） */
  businessRules?: Ref<BusinessRule>[];
  
  /** ビジネス価値（このユースケースがもたらす価値） */
  businessValue?: string;
  
  /** データ要件（必要なデータ項目、データ構造） */
  dataRequirements?: string[];
  
  /** セキュリティ要件（認証、認可、暗号化など） */
  securityRequirements?: string[];
  
  /** 関連セキュリティポリシー（適用されるポリシーへの参照） */
  securityPolicies?: Ref<SecurityPolicy>[];
  
  /** パフォーマンス要件（応答時間、スループット、同時接続数など） */
  performanceRequirements?: string[];
  
  /** UI要件（画面レイアウト、UX、アクセシビリティなど） */
  uiRequirements?: string[];
}
