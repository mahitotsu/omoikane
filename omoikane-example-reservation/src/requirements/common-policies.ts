/**
 * 共通ポリシー定義
 */

export const validReservationReferencePrecondition =
  '有効な予約番号と登録済みの連絡先情報を来店者が保持している';

export const historyReviewBusinessRule = '履歴の確認・既読化は予約履歴確認ユースケースで実施する';

export const manualNotificationBusinessRule =
  '来店者への通知は自動送信せず、必要に応じて手動連絡手順に従う';

export const staffReservationDetailPrecondition =
  '店舗スタッフが予約検索ユースケースなどで対象予約の詳細画面を開いている';

export const visitorSingleReservationBusinessRule = '予約は来店者本人1名分のみを対象とする';

export const reservationCancellationHistoryBusinessRule =
  '枠解放（予約取消）は履歴に記録され、履歴確認ユースケースで確認未済／済の状態を更新する';
