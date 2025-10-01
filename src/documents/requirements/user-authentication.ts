import type { Actor, UseCase } from '../../types/typed-references';
import { typedActorRef } from '../../types/typed-references';

/**
 * ユーザー認証関連ユースケース
 * ログイン、ログアウト、パスワードリセットなどの認証機能
 */

// セキュリティサービスアクター
export const securityService: Actor = {
  id: 'security-service',
  type: 'actor',
  owner: 'security-architect',
  name: 'セキュリティサービス',
  description: '認証、認可、セキュリティ監視を担当するサービス',
  role: 'external',
  responsibilities: [
    'ユーザー認証の実行',
    'セッション管理',
    '不正アクセス検知',
    'パスワード強度チェック',
    'アカウントロック管理',
    'セキュリティログ記録'
  ]
};

// SMS通知サービスアクター
export const smsService: Actor = {
  id: 'sms-service',
  type: 'actor',
  owner: 'system-architect',
  name: 'SMS通知サービス',
  description: 'SMS（ショートメッセージ）による通知を担当する外部サービス',
  role: 'external',
  responsibilities: [
    'SMS認証コード送信',
    '緊急通知SMS送信',
    'SMS配信状況管理',
    '国際SMS対応',
    'SMS送信失敗時の再送処理'
  ]
};

// ユーザーログインユースケース
export const userLogin: UseCase = {
  id: 'user-login',
  type: 'usecase',
  owner: 'business-analyst',
  name: 'ユーザーログイン',
  description: '登録済みユーザーがシステムにログインする',
  actors: {
    primary: typedActorRef('customer'),
    secondary: [
      typedActorRef('database-system'),
      typedActorRef('security-service'),
      typedActorRef('validation-service')
    ]
  },
  preconditions: [
    'ユーザーアカウントが作成済み',
    'アカウントがアクティブ状態',
    'ブラウザでJavaScriptが有効'
  ],
  postconditions: [
    'ユーザーがログイン状態になる',
    'セッションが確立される',
    'ユーザー専用ページへアクセス可能',
    'セキュリティログが記録される'
  ],
  mainFlow: [
    {      actor: typedActorRef('customer'),
      action: 'トップページまたは商品ページで「ログイン」ボタンをクリック',
      expectedResult: 'ログイン画面が表示される',
      notes: 'ログイン画面への遷移'
    },
    {      actor: typedActorRef('customer'),
      action: 'メールアドレスとパスワードを入力し、「ログイン」ボタンをクリック',
      expectedResult: '入力された認証情報がサーバーに送信される',
      notes: '認証情報の入力'
    },
    {      actor: typedActorRef('validation-service'),
      action: '入力値の形式チェック（メールアドレス形式、パスワード長など）を実行',
      expectedResult: '入力値が正しい形式であることが確認される',
      notes: '入力値バリデーション'
    },
    {      actor: typedActorRef('security-service'),
      action: 'データベースの認証情報と照合し、パスワードハッシュを検証',
      expectedResult: '認証が成功または失敗の結果が返される',
      notes: '認証処理の実行'
    },
    {      actor: typedActorRef('security-service'),
      action: '認証成功時にセッショントークンを生成し、セッション情報をデータベースに保存',
      expectedResult: 'セキュアなセッションが確立される',
      notes: 'セッション確立'
    },
    {      actor: typedActorRef('customer'),
      action: 'ログイン成功画面を確認し、元のページまたはマイページに遷移',
      expectedResult: 'ログイン状態でサイト内を利用できるようになる',
      notes: 'ログイン完了'
    }
  ],
  alternativeFlows: [
    {
      id: 'invalid-credentials',
      name: '認証情報不正',
      condition: 'メールアドレスまたはパスワードが間違っている',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: '認証失敗をログに記録し、試行回数をカウント',
          expectedResult: '認証失敗が安全に処理され、セキュリティログが更新される'
        },
        {          actor: typedActorRef('customer'),
          action: 'エラーメッセージを確認し、正しい認証情報を再入力',
          expectedResult: '「メールアドレスまたはパスワードが正しくありません」というメッセージが表示'
        },
        {          actor: typedActorRef('security-service'),
          action: '連続失敗回数が閾値（3回）に近づいた場合は警告を表示',
          expectedResult: 'アカウントロック直前であることが警告される'
        }
      ],
      returnToStepId: 'execute-search'
    },
    {
      id: 'account-locked',
      name: 'アカウントロック',
      condition: '連続ログイン失敗によりアカウントがロックされている',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: 'アカウントロック状態を確認し、ロック解除時刻を算出',
          expectedResult: 'ロック状態とロック解除予定時刻が明確になる'
        },
        {          actor: typedActorRef('email-service'),
          action: 'アカウントロック通知メールを送信（不正アクセス対策の説明付き）',
          expectedResult: '本人にセキュリティ対策が通知される'
        },
        {          actor: typedActorRef('customer'),
          action: 'パスワードリセット手続きまたは時間経過後の再試行を選択',
          expectedResult: 'アカウント復旧手順が明確に案内される'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    },
    {
      id: 'suspicious-login',
      name: '不審なログイン',
      condition: '普段と異なるデバイス・IPアドレスからのアクセス',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: 'デバイス・地理的位置・アクセス時間の異常を検知',
          expectedResult: '不審なアクセスパターンが特定される'
        },
        {          actor: typedActorRef('sms-service'),
          action: '登録済み電話番号にSMS認証コードを送信',
          expectedResult: '追加認証のためのSMSが送信される'
        },
        {          actor: typedActorRef('customer'),
          action: 'SMS認証コードを入力して本人確認を完了',
          expectedResult: '追加認証により安全にログインが完了される'
        },
        {          actor: typedActorRef('email-service'),
          action: '新しいデバイスからのログイン通知メールを送信',
          expectedResult: '本人に新デバイスでのアクセスが通知される'
        }
      ],
      returnToStepId: 'filter-results'
    },
    {
      id: 'session-conflict',
      name: 'セッション競合',
      condition: '同一アカウントが上限を超える数のデバイスでログイン試行',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: '既存セッション数を確認し、上限超過を検知',
          expectedResult: 'セッション数の制限が適切に管理される'
        },
        {          actor: typedActorRef('customer'),
          action: '既存セッションの終了または新しいログインの拒否を選択',
          expectedResult: 'セッション管理画面で既存ログインの状況が確認できる'
        },
        {          actor: typedActorRef('security-service'),
          action: '選択されたセッションを終了し、新しいセッションを開始',
          expectedResult: 'セッション数の制限内で適切にログインが管理される'
        }
      ],
      returnToStepId: 'generate-recommendations'
    },
    {
      id: 'maintenance-mode',
      name: 'メンテナンスモード',
      condition: 'システムメンテナンス中のためログイン機能が制限されている',
      steps: [
        {          actor: typedActorRef('database-system'),
          action: 'メンテナンス状態を確認し、終了予定時刻を取得',
          expectedResult: 'メンテナンス情報が正確に取得される'
        },
        {          actor: typedActorRef('customer'),
          action: 'メンテナンス情報を確認し、復旧後の再アクセスを計画',
          expectedResult: 'メンテナンス終了予定時刻と代替手段が案内される'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    }
  ],
  businessValue: 'ユーザーの継続利用促進とセキュアな認証基盤の提供',
  priority: 'high',
  
  // 詳細仕様
  complexity: 'medium',
  estimatedEffort: '5-8人日',
  acceptanceCriteria: [
    'ログイン処理は3秒以内に完了する',
    '認証失敗時は適切なエラーメッセージが表示される',
    'セッションは24時間有効',
    '連続3回失敗でアカウントロック',
    'パスワードはハッシュ化して保存',
    'ログイン状態はページ遷移で維持される'
  ],
  businessRules: [
    'パスワードは最小8文字以上',
    'アカウントロックは30分後に自動解除',
    'セッションタイムアウトは24時間',
    '同一アカウントの同時ログインは3セッションまで',
    'ログイン履歴は90日間保持',
    'セキュリティログは1年間保持'
  ],
  dataRequirements: [
    'ユーザー認証情報（メールアドレス、パスワードハッシュ）',
    'セッション情報（セッションID、有効期限、IPアドレス）',
    'ログイン履歴（ログイン日時、IPアドレス、ユーザーエージェント）',
    'アカウント状態（アクティブ・ロック・停止）',
    'セキュリティログ（認証試行、成功・失敗、異常アクセス）'
  ],
  securityRequirements: [
    'パスワードはbcryptでハッシュ化',
    'セッショントークンは暗号学的に安全な乱数',
    'SSL/TLS通信の強制',
    'CSRF対策トークンの実装',
    'ブルートフォース攻撃対策',
    'セッションハイジャック対策'
  ],
  performanceRequirements: [
    'ログイン処理応答時間: 3秒以内',
    '同時ログイン処理: 1000ユーザー対応',
    'セッション検証: 100ms以内',
    'パスワードハッシュ検証: 500ms以内'
  ],
  uiRequirements: [
    '「パスワードを表示」切り替えボタン',
    '「ログイン状態を保持」チェックボックス',
    'パスワードリセットへの明確なリンク',
    'ソーシャルログインオプション（将来拡張）',
    'モバイル端末での操作性確保',
    '入力エラー時のリアルタイム表示'
  ]
};

// パスワードリセットユースケース
export const passwordReset: UseCase = {
  id: 'password-reset',
  type: 'usecase',
  owner: 'business-analyst',
  name: 'パスワードリセット',
  description: 'ユーザーが忘れたパスワードを安全にリセットする',
  actors: {
    primary: typedActorRef('customer'),
    secondary: [
      typedActorRef('database-system'),
      typedActorRef('email-service'),
      typedActorRef('security-service'),
      typedActorRef('validation-service')
    ]
  },
  preconditions: [
    'ユーザーアカウントが存在する',
    'メールアドレスが有効',
    'アカウントが停止状態でない'
  ],
  postconditions: [
    'パスワードが新しいパスワードに更新される',
    'リセットトークンが無効化される',
    'パスワード変更通知メールが送信される',
    'セキュリティログが記録される'
  ],
  mainFlow: [
    {      actor: typedActorRef('customer'),
      action: 'ログイン画面で「パスワードを忘れた方」リンクをクリック',
      expectedResult: 'パスワードリセット申請画面が表示される',
      notes: 'パスワードリセット開始'
    },
    {      actor: typedActorRef('customer'),
      action: '登録済みメールアドレスを入力し、「リセット申請」ボタンをクリック',
      expectedResult: 'メールアドレスがサーバーに送信される',
      notes: 'メールアドレス入力'
    },
    {      actor: typedActorRef('security-service'),
      action: 'メールアドレスの存在確認とリセットトークンの生成（有効期限30分）',
      expectedResult: 'セキュアなリセットトークンが生成される',
      notes: 'リセットトークン生成'
    },
    {      actor: typedActorRef('email-service'),
      action: 'パスワードリセット用のリンクを含むメールを送信',
      expectedResult: 'ユーザーがパスワードリセットメールを受信する',
      notes: 'リセットメール送信'
    },
    {      actor: typedActorRef('customer'),
      action: 'メール内のリセットリンクをクリックして、新しいパスワード設定画面にアクセス',
      expectedResult: 'パスワード設定画面が表示される',
      notes: 'リセットリンクアクセス'
    },
    {      actor: typedActorRef('customer'),
      action: '新しいパスワードを2回入力し、「パスワード更新」ボタンをクリック',
      expectedResult: '新しいパスワードがサーバーに送信される',
      notes: '新パスワード設定'
    },
    {      actor: typedActorRef('security-service'),
      action: 'パスワードをハッシュ化してデータベースを更新し、リセットトークンを無効化',
      expectedResult: 'パスワードが安全に更新される',
      notes: 'パスワード更新処理'
    },
    {      actor: typedActorRef('customer'),
      action: 'パスワード更新完了画面を確認し、新しいパスワードでログイン',
      expectedResult: '新しいパスワードでシステムにアクセスできる',
      notes: 'パスワードリセット完了'
    }
  ],
  alternativeFlows: [
    {
      id: 'email-not-found',
      name: 'メールアドレス未登録',
      condition: '入力されたメールアドレスがシステムに存在しない',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: 'セキュリティのため、存在しないメールアドレスでも成功メッセージを表示',
          expectedResult: '攻撃者にアカウント存在情報を与えない'
        },
        {          actor: typedActorRef('customer'),
          action: 'メール受信を待つが、実際にはメールは送信されない',
          expectedResult: 'アカウント列挙攻撃を防止'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    },
    {
      id: 'token-expired',
      name: 'リセットトークン期限切れ',
      condition: 'リセットリンクをクリックしたが、トークンの有効期限（30分）が切れている',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: 'トークンの有効期限をチェックし、期限切れエラーを返す',
          expectedResult: 'セキュリティを保持してトークンを無効化'
        },
        {          actor: typedActorRef('customer'),
          action: '期限切れメッセージを確認し、新しいリセット申請を実行',
          expectedResult: '新しいパスワードリセット手続きを開始'
        }
      ],
      returnToStepId: 'enter-search-keyword'
    }
  ],
  businessValue: 'ユーザビリティ向上とアカウント復旧によるユーザー離脱防止',
  priority: 'high',
  
  // 詳細仕様
  complexity: 'medium',
  estimatedEffort: '6-10人日',
  acceptanceCriteria: [
    'リセットメールは5分以内に送信される',
    'リセットトークンは30分で自動失効',
    '新しいパスワードは強度チェックをパスする',
    'リセット完了後は全セッションが無効化される',
    'パスワード変更履歴が記録される'
  ],
  businessRules: [
    'リセット申請は1時間に3回まで',
    'リセットトークンは1回のみ使用可能',
    'パスワードは過去5回分と同じものは使用不可',
    'リセット完了時に通知メールを送信',
    'セキュリティログに変更履歴を記録'
  ],
  dataRequirements: [
    'パスワードリセットトークン（トークン、有効期限、使用状態）',
    'パスワード履歴（ユーザーID、パスワードハッシュ、変更日時）',
    'リセット申請ログ（申請日時、IPアドレス、メールアドレス）'
  ],
  securityRequirements: [
    'リセットトークンは暗号学的に安全な乱数',
    'トークンはHTTPS経由でのみ送信',
    'パスワードリセット申請のレート制限',
    'リセット完了時の全セッション無効化',
    'パスワード強度ポリシーの強制'
  ],
  performanceRequirements: [
    'リセット申請処理: 3秒以内',
    'メール送信: 5分以内',
    'パスワード更新: 2秒以内',
    'トークン検証: 100ms以内'
  ],
  uiRequirements: [
    'パスワード強度インジケーター',
    'パスワード確認入力の一致チェック',
    'リアルタイムバリデーション表示',
    'セキュリティに関する注意事項表示',
    'モバイル端末での操作性確保'
  ]
};

// ユーザーログアウトユースケース
export const userLogout: UseCase = {
  id: 'user-logout',
  type: 'usecase',
  owner: 'business-analyst',
  name: 'ユーザーログアウト',
  description: 'ログイン中のユーザーが安全にシステムからログアウトする',
  actors: {
    primary: typedActorRef('customer'),
    secondary: [
      typedActorRef('database-system'),
      typedActorRef('security-service')
    ]
  },
  preconditions: [
    'ユーザーがログイン状態',
    '有効なセッションが存在'
  ],
  postconditions: [
    'ユーザーセッションが無効化される',
    'ログイン状態が解除される',
    'セキュリティログが記録される',
    'ページがゲスト状態に更新される'
  ],
  mainFlow: [
    {      actor: typedActorRef('customer'),
      action: 'ヘッダーまたはメニューの「ログアウト」ボタンをクリック',
      expectedResult: 'ログアウト処理が開始される',
      notes: 'ログアウト開始'
    },
    {      actor: typedActorRef('security-service'),
      action: '現在のセッションをデータベースから削除し、セッションを無効化',
      expectedResult: 'セッション情報が完全に削除される',
      notes: 'セッション無効化'
    },
    {      actor: typedActorRef('security-service'),
      action: 'ログアウトログを記録し、セキュリティ監査証跡を作成',
      expectedResult: 'ログアウト履歴が安全に記録される',
      notes: 'ログアウトログ記録'
    },
    {      actor: typedActorRef('customer'),
      action: 'ログアウト完了画面またはトップページが表示されることを確認',
      expectedResult: 'ゲスト状態でページが表示され、ログイン専用機能にアクセスできない',
      notes: 'ログアウト完了'
    }
  ],
  alternativeFlows: [
    {
      id: 'session-timeout',
      name: 'セッションタイムアウト',
      condition: 'セッションが自動的にタイムアウトした',
      steps: [
        {          actor: typedActorRef('security-service'),
          action: 'タイムアウトしたセッションを自動削除し、ログを記録',
          expectedResult: '期限切れセッションが安全に処理される'
        },
        {          actor: typedActorRef('customer'),
          action: 'セッション期限切れメッセージを確認',
          expectedResult: '「セッションが期限切れです。再度ログインしてください」というメッセージが表示'
        }
      ],
      returnToStepId: 'fetch-product-data'
    }
  ],
  businessValue: 'セキュリティ強化と適切なセッション管理',
  priority: 'medium',
  
  // 詳細仕様
  complexity: 'simple',
  estimatedEffort: '2-3人日',
  acceptanceCriteria: [
    'ログアウト処理は1秒以内に完了',
    'セッション無効化後はログイン必須ページにアクセス不可',
    'ブラウザの戻るボタンでもログイン状態に戻らない',
    'ログアウト後はショッピングカートが初期化される'
  ],
  businessRules: [
    'ログアウト時にショッピングカートは保持（ログイン時に復元）',
    'ログアウト履歴は90日間保持',
    'セッションタイムアウトは24時間',
    '複数デバイスでのログアウトは各デバイス個別'
  ],
  dataRequirements: [
    'セッション情報（セッションID、有効期限、ログアウト日時）',
    'ログアウトログ（ユーザーID、ログアウト日時、IPアドレス）'
  ],
  securityRequirements: [
    'セッション情報の完全削除',
    'クライアントサイドセッション情報のクリア',
    'セキュアなログアウト処理の実装'
  ],
  performanceRequirements: [
    'ログアウト処理: 1秒以内',
    'セッション削除: 500ms以内'
  ],
  uiRequirements: [
    'ログアウト確認ダイアログ（オプション）',
    'ログアウト完了メッセージ',
    'ログイン状態の視覚的表示更新'
  ]
};