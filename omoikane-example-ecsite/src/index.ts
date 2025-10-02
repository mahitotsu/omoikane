/**
 * Omoikane Example EC Site
 * 
 * Omoikane Metamodelを使用したECサイト要件定義の実例
 */

// ユーザー管理関連のユースケース
export {
    customer, databaseSystem, emailService, userRegistration, validationService
} from './requirements/user-registration.js';

export {
    passwordReset, securityService,
    smsService,
    userLogin, userLogout
} from './requirements/user-authentication.js';

// 商品管理関連のユースケース  
export {
    cartManagement, cartService,
    productSearch, recommendationEngine
} from './requirements/product-browsing.js';

export {
    admin, imageService, inventorySystem, productRegistration
} from './requirements/product-management.js';

// 注文管理関連のユースケース
export {
    loyaltyService,
    orderProcessing, orderTracking, paymentService,
    shippingService, trackingService
} from './requirements/order-processing.js';

// メタモデルから必要な型を再エクスポート
export type {
    Actor, AlternativeFlow, UseCase,
    UseCaseStep
} from 'omoikane-metamodel';

// 型安全参照システム（ECサイト固有）
export { typedActorRef } from './typed-references.js';
// test change
