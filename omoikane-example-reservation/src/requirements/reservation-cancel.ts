/**
 * 来店予約管理システム - 予約取消ユースケース
 */

import {
  ReservationUseCase,
  assumptionRef,
  businessGoalRef,
  businessRequirementRef,
  businessScopeRef,
  constraintRef,
  reservationBusinessRequirementCoverage,
  stakeholderRef,
  successMetricRef,
  typedActorRef,
} from '../typed-references.js';

export const reservationCancel: ReservationUseCase = {
  id: 'reservation-cancel',
  type: 'usecase',
  owner: 'customer-experience',
  name: '予約取消',
  description: '来店者が確定済み予約を取消し、枠を解放する',
  actors: {
    primary: typedActorRef('visitor'),
    secondary: [typedActorRef('store-staff')],
  },
  businessRequirementCoverage: reservationBusinessRequirementCoverage({
    requirement: businessRequirementRef('reservation-business-requirements'),
    businessGoals: [businessGoalRef('goal-visitor-self-service-flexibility')],
    scopeItems: [businessScopeRef('scope-visitor-self-service-management')],
    stakeholders: [
      stakeholderRef('stakeholder-visitor'),
      stakeholderRef('stakeholder-store-staff'),
    ],
    successMetrics: [
      successMetricRef('metric-manual-adjustment-time'),
      successMetricRef('metric-slot-utilization'),
    ],
    assumptions: [assumptionRef('assumption-manual-communications')],
    constraints: [
      constraintRef('constraint-operation-hours-visitor'),
      constraintRef('constraint-privacy-minimization'),
      constraintRef('constraint-visitor-own-reservation-only'),
    ],
  }),
  preconditions: [
    '有効な予約番号と登録済みの連絡先情報を来店者が保持している',
    '予約ステータスが「来店済み」や「キャンセル済み」ではない',
  ],
  postconditions: [
    '対象予約のステータスが「キャンセル済み」に更新されている',
    '解放された枠が空き状況に反映され他の来店者が利用可能になる',
    '店舗スタッフの業務リストと担当者割り当てが更新される',
    'キャンセルによる枠リリースが履歴に未確認状態で記録されている',
  ],
  mainFlow: [
    {
      stepId: 'open-lookup',
      actor: typedActorRef('visitor'),
      action: '予約照会ページで予約番号と連絡先を入力し対象予約を表示する',
      expectedResult: '本人と一致する予約のみが照会される',
    },
    {
      stepId: 'review-policy',
      actor: typedActorRef('visitor'),
      action: 'キャンセルポリシーと取消による影響（キャンセル料など）を確認する',
      expectedResult: '取消条件と費用が明示される',
    },
    {
      stepId: 'confirm-cancel',
      actor: typedActorRef('visitor'),
      action: '取消理由を入力しキャンセルを確定する',
      expectedResult:
        'システムが予約ステータスをキャンセル済みに更新し、枠リリースを未確認記録として履歴に追加した上で確認画面を表示する',
    },
  ],
  alternativeFlows: [
    {
      id: 'cancel-cutoff-exceeded',
      name: 'キャンセル可能時間を超過',
      condition: '予約開始まで12時間を切っている場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: '照会ページでオンラインキャンセル不可のメッセージと連絡窓口を確認する',
          expectedResult: '直前キャンセルの対応方法が明示される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '電話やチャットでのキャンセル相談を受け最終判断を行う',
          expectedResult: '特例対応の要否が決定し記録される',
        },
      ],
      returnToStepId: 'open-lookup',
    },
    {
      id: 'already-checked-in',
      name: '来店済み予約のキャンセル',
      condition: '予約が既に来店済みとして処理されている場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: 'キャンセル不可のメッセージを確認する',
          expectedResult: 'キャンセル手続きが行えない理由が明示される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '状況を確認し必要に応じて返金やクレーム対応を記録する',
          expectedResult: 'アフターケアのタスクが設定される',
        },
      ],
      returnToStepId: 'open-lookup',
    },
    {
      id: 'contact-mismatch',
      name: '照合に失敗',
      condition: '入力した連絡先が予約情報と一致しない場合',
      steps: [
        {
          actor: typedActorRef('visitor'),
          action: '照合エラーを確認し入力内容を修正する',
          expectedResult: '誤った入力が明示され再入力が促される',
        },
        {
          actor: typedActorRef('store-staff'),
          action: '本人確認のため追加情報の提供を依頼する',
          expectedResult: '不正アクセスを防止したまま本人確認手続きが整う',
        },
      ],
      returnToStepId: 'open-lookup',
    },
  ],
  securityRequirements: [
    '予約番号と連絡先情報の照合によって本人のみがキャンセル操作を行える',
    'キャンセル処理は監査ログに記録される',
    'スタッフは管理画面から全キャンセル履歴を閲覧できる',
    'ロック・リリース履歴は権限者のみが参照し確認状態を更新できる',
  ],
  businessRules: [
    'オンラインでのキャンセルは利用予定日時の12時間前まで可能',
    'キャンセル完了後は予約番号が無効化される',
    'キャンセル理由は必須入力で統計分析に活用される',
    'キャンセル時の枠リリースは履歴に記録され確認未済／済で管理される',
    '履歴の確認・既読化は予約履歴確認ユースケースで実施する',
  ],
  priority: 'medium',
};
