/**
 * EC サイト - ユーザー登録ユースケース定義
 */

import type { Actor, UseCase } from '../../types/delivery-elements';
import { typedActorRef } from '../../types/typed-references';

// アクター定義
export const customer: Actor = {
  id: 'customer',
  type: 'actor',
  owner: 'business-analyst',
  name: '顧客',
  description: 'ECサイトで商品を購入する一般ユーザー',
  role: 'primary',
  responsibilities: [
    '商品の閲覧・検索',
    'アカウント登録・管理',
    '注文・決済',
    'レビュー投稿'
  ]
};

export const emailService: Actor = {
  id: 'email-service',
  type: 'actor',
  owner: 'system-architect',
  name: 'メール配信サービス',
  description: '確認メールや通知メールを送信する外部システム',
  role: 'external',
  responsibilities: [
    'ユーザー確認メール送信',
    '通知メール配信',
    'メール配信ログ記録',
    'メール配信エラーハンドリング'
  ]
};

export const databaseSystem: Actor = {
  id: 'database-system',
  type: 'actor',
  owner: 'system-architect',
  name: 'データベースシステム',
  description: 'ユーザー情報やアプリケーションデータを永続化する内部システム',
  role: 'external',
  responsibilities: [
    'ユーザーデータ永続化',
    'データ整合性保証',
    'トランザクション管理',
    'データバックアップ'
  ]
};

export const validationService: Actor = {
  id: 'validation-service',
  type: 'actor',
  owner: 'system-architect', 
  name: 'バリデーションサービス',
  description: '入力データの検証とビジネスルールチェックを行う内部システム',
  role: 'external',
  responsibilities: [
    'メールアドレス形式チェック',
    'パスワード強度チェック',
    '重複チェック',
    'ビジネスルール検証'
  ]
};

// ユースケース定義
export const userRegistration: UseCase = {
  id: 'user-registration',
  type: 'usecase',
  owner: 'business-analyst',
  name: 'ユーザー登録',
  description: '新規顧客がECサイトにアカウントを作成する',
  actors: {
    primary: typedActorRef('customer'),
    secondary: [
      typedActorRef('email-service'),
      typedActorRef('database-system'),
      typedActorRef('validation-service')
    ]
  },
  preconditions: [
    '顧客がECサイトにアクセスしている',
    'インターネット接続が安定している'
  ],
  postconditions: [
    '新しいユーザーアカウントが作成されている',
    '確認メールが送信されている',
    '顧客がログイン可能な状態になっている'
  ],
  mainFlow: [
    {
      stepNumber: 1,
      actor: typedActorRef('customer'),
      action: '新規登録ページにアクセスする',
      expectedResult: '登録フォームが表示される',
      performanceRequirement: '3秒以内にページ表示'
    },
    {
      stepNumber: 2,
      actor: typedActorRef('customer'),
      action: 'メールアドレス、パスワード、基本情報を入力する',
      expectedResult: '入力内容がリアルタイムでバリデーションされる',
      inputData: ['メールアドレス', 'パスワード', '氏名', '生年月日'],
      validationRules: [
        'メールアドレス形式チェック',
        'パスワード8文字以上、英数記号混合',
        '氏名必須入力',
        '生年月日18歳以上'
      ],
      errorHandling: ['入力エラー時は該当フィールドに赤枠表示', 'エラーメッセージをフィールド下に表示']
    },
    {
      stepNumber: 3,
      actor: typedActorRef('validation-service'),
      action: '入力データの詳細バリデーションを実行する',
      expectedResult: 'バリデーション結果を返す',
      validationRules: [
        'メールアドレス重複チェック',
        'パスワード強度チェック',
        'ビジネスルール適用'
      ],
      errorHandling: ['重複時はエラーメッセージ表示', 'DB接続エラー時はシステムエラー画面']
    },
    {
      stepNumber: 4,
      actor: typedActorRef('customer'),
      action: '利用規約に同意し、「登録」ボタンをクリックする',
      expectedResult: 'アカウント作成処理が開始される',
      validationRules: ['利用規約同意チェック必須'],
      errorHandling: ['未同意時は登録ボタン無効化']
    },
    {
      stepNumber: 5,
      actor: typedActorRef('database-system'),
      action: 'ユーザーデータを永続化する',
      expectedResult: 'ユーザーレコードが作成される',
      performanceRequirement: '1秒以内にDB登録完了',
      errorHandling: ['DB障害時はロールバック', '一意制約違反時はエラー返却']
    },
    {
      stepNumber: 6,
      actor: typedActorRef('email-service'),
      action: '確認メールを送信する',
      expectedResult: '顧客のメールアドレスに確認メールが届く',
      performanceRequirement: '5秒以内にメール送信',
      errorHandling: ['メール送信失敗時はリトライ機構作動', '3回失敗時は管理者通知']
    },
    {
      stepNumber: 7,
      actor: typedActorRef('customer'),
      action: 'メール内の確認リンクをクリックする',
      expectedResult: 'アカウントがアクティベートされる',
      validationRules: ['確認トークンの有効性チェック', '24時間以内の確認要求'],
      errorHandling: ['無効トークン時はエラーページ表示', '期限切れ時は再送信オプション提供']
    },
    {
      stepNumber: 8,
      actor: typedActorRef('customer'),
      action: '自動的にログインされる',
      expectedResult: 'ユーザーダッシュボードが表示される',
      performanceRequirement: '2秒以内にダッシュボード表示'
    }
  ],
  alternativeFlows: [
    {
      id: 'email-duplicate',
      name: 'メールアドレス重複エラー',
      condition: '入力されたメールアドレスが既に登録済み',
      steps: [
        {
          stepNumber: 1,
          actor: typedActorRef('validation-service'),
          action: 'メールアドレスの重複をデータベースで確認し、エラーを生成',
          expectedResult: '重複状態が安全に検知され、適切なエラーメッセージが作成される'
        },
        {
          stepNumber: 2,
          actor: typedActorRef('customer'),
          action: '重複エラーメッセージを確認し、ログインページへの誘導または別メールアドレス入力を選択',
          expectedResult: '「このメールアドレスは既に登録されています。ログインしますか？」の選択肢が表示される'
        },
        {
          stepNumber: 3,
          actor: typedActorRef('customer'),
          action: 'パスワード忘れの場合はパスワードリセット手続きを実行',
          expectedResult: 'パスワードリセットフローに適切に案内される'
        }
      ],
      returnToStep: 2
    },
    {
      id: 'password-strength-failure',
      name: 'パスワード強度不足',
      condition: '入力されたパスワードが強度要件を満たしていない',
      steps: [
        {
          stepNumber: 1,
          actor: typedActorRef('validation-service'),
          action: 'パスワード強度（長さ・複雑性・辞書攻撃耐性）を詳細チェック',
          expectedResult: '不足している要件が具体的に特定される'
        },
        {
          stepNumber: 2,
          actor: typedActorRef('customer'),
          action: 'パスワード強度インジケーターを参考に、要件を満たすパスワードを再入力',
          expectedResult: 'リアルタイムで強度が表示され、要件クリアまで案内される'
        },
        {
          stepNumber: 3,
          actor: typedActorRef('validation-service'),
          action: 'パスワード生成支援（安全なパスワードの提案）を提供',
          expectedResult: '強度要件を満たすパスワード例が提示される'
        }
      ],
      returnToStep: 3
    },
    {
      id: 'email-verification-timeout',
      name: 'メール認証タイムアウト',
      condition: 'メール認証の有効期限（24時間）が切れている',
      steps: [
        {
          stepNumber: 1,
          actor: typedActorRef('email-service'),
          action: '認証リンクの有効期限を確認し、期限切れを検知',
          expectedResult: 'タイムアウト状態が適切に判定される'
        },
        {
          stepNumber: 2,
          actor: typedActorRef('customer'),
          action: '認証メール再送信を要求し、新しい認証リンクで手続きを完了',
          expectedResult: '新しい認証メールが送信され、24時間の有効期限が設定される'
        },
        {
          stepNumber: 3,
          actor: typedActorRef('database-system'),
          action: '期限切れの認証トークンを無効化し、新しいトークンを生成',
          expectedResult: 'セキュリティが保持され、新しい認証フローが開始される'
        }
      ],
      returnToStep: 6
    },
    {
      id: 'email-delivery-failure',
      name: 'メール配信失敗',
      condition: '確認メールの送信が失敗または顧客に届かない',
      steps: [
        {
          stepNumber: 1,
          actor: typedActorRef('email-service'),
          action: 'メール送信エラー（無効アドレス・サーバー障害・スパムフィルター）を分析',
          expectedResult: '配信失敗の具体的な原因が特定される'
        },
        {
          stepNumber: 2,
          actor: typedActorRef('customer'),
          action: 'メールアドレスの修正または別の認証方法（SMS認証）を選択',
          expectedResult: '代替認証手段が利用可能になる'
        },
        {
          stepNumber: 3,
          actor: typedActorRef('email-service'),
          action: '修正されたメールアドレスに認証メールを再送信',
          expectedResult: '正しいメールアドレスに確実に配信される'
        }
      ],
      returnToStep: 5
    },
    {
      id: 'bot-registration-attempt',
      name: 'Bot登録の検知',
      condition: '自動化ツールやBotによる大量登録が検知された',
      steps: [
        {
          stepNumber: 1,
          actor: typedActorRef('validation-service'),
          action: 'CAPTCHA失敗・異常な登録速度・疑わしいIPアドレスを検知',
          expectedResult: 'Bot活動が適切に特定される'
        },
        {
          stepNumber: 2,
          actor: typedActorRef('customer'),
          action: '追加認証（高度CAPTCHA・電話番号認証）を実行',
          expectedResult: '人間による操作であることが確認される'
        },
        {
          stepNumber: 3,
          actor: typedActorRef('validation-service'),
          action: '認証成功後、通常の登録フローを継続',
          expectedResult: '正当なユーザーとして登録が完了される'
        }
      ],
      returnToStep: 4
    },
    {
      id: 'system-overload',
      name: 'システム高負荷',
      condition: '登録者数が急増してシステムに負荷がかかっている',
      steps: [
        {
          stepNumber: 1,
          actor: typedActorRef('database-system'),
          action: 'システム負荷を監視し、登録処理の優先度を調整',
          expectedResult: '高負荷状態でも安定した処理が継続される'
        },
        {
          stepNumber: 2,
          actor: typedActorRef('customer'),
          action: '処理遅延の案内を確認し、登録完了まで待機',
          expectedResult: '遅延はあるが確実に登録が処理される'
        },
        {
          stepNumber: 3,
          actor: typedActorRef('email-service'),
          action: '負荷軽減のため、確認メールの送信を段階的に実行',
          expectedResult: 'メール送信も遅延するが確実に配信される'
        }
      ],
      returnToStep: 5
    },
    {
      id: 'underage-user',
      name: '未成年ユーザー',
      condition: '年齢確認で未成年（18歳未満）であることが判明',
      steps: [
        {
          stepNumber: 1,
          actor: typedActorRef('validation-service'),
          action: '生年月日から年齢を計算し、未成年を検知',
          expectedResult: '法的制約に基づく処理が開始される'
        },
        {
          stepNumber: 2,
          actor: typedActorRef('customer'),
          action: '保護者同意書の提出または年齢制限商品の利用制限に同意',
          expectedResult: '未成年者向けの制限付きアカウントが提供される'
        },
        {
          stepNumber: 3,
          actor: typedActorRef('database-system'),
          action: 'アカウントに年齢制限フラグを設定し、制限付きで登録完了',
          expectedResult: '適切な制限下でサービス利用が可能になる'
        }
      ],
      returnToStep: 8
    }
  ],
  businessValue: '新規顧客の獲得により売上拡大とユーザーベース拡充を実現',
  priority: 'high',
  // 詳細化フィールド
  complexity: 'medium',
  estimatedEffort: '2-3スプリント（4-6週間）',
  acceptanceCriteria: [
    '新規ユーザーがメールアドレスとパスワードでアカウント作成できる',
    '確認メール送信と認証フローが正常に動作する',
    '重複メールアドレスは登録を拒否する',
    'パスワード強度チェックが機能する',
    '登録完了後に自動ログインされる'
  ],
  businessRules: [
    '1つのメールアドレスにつき1アカウントまで',
    '18歳未満は保護者同意が必要',
    'パスワードは8文字以上、英数記号混合必須',
    'メール認証は24時間以内に完了必要',
    '未認証アカウントは7日後に自動削除'
  ],
  dataRequirements: [
    'ユーザー基本情報（氏名、生年月日、性別）',
    'ログイン情報（メールアドレス、パスワードハッシュ）',
    'アカウント状態（仮登録、本登録、停止）',
    '登録日時、最終ログイン日時',
    'メール認証トークンと有効期限'
  ],
  securityRequirements: [
    'パスワードはハッシュ化して保存',
    'メール認証トークンは暗号化',
    'ブルートフォース攻撃対策（ログイン試行回数制限）',
    'SQLインジェクション対策',
    'XSS対策'
  ],
  performanceRequirements: [
    '登録処理は5秒以内に完了',
    'メール送信は5秒以内',
    '同時登録数100ユーザー/分まで対応',
    'ページ表示は3秒以内'
  ],
  uiRequirements: [
    'レスポンシブデザイン対応（スマホ、タブレット、PC）',
    'リアルタイムバリデーション表示',
    'エラーメッセージの多言語対応',
    'アクセシビリティ対応（WCAG 2.1 AA準拠）',
    'プログレスインジケーター表示'
  ]
};