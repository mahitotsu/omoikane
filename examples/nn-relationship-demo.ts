/**
 * N:N関係のデモンストレーション
 * 複数のユースケースとアクターの関係性を分析
 */

// ユーザー登録関連
import { customer, emailService, userRegistration } from '../src/documents/requirements/user-registration';

// 商品管理関連  
import { admin, inventorySystem, productRegistration } from '../src/documents/requirements/product-management';

// 注文処理関連
import { orderProcessing, orderTracking, paymentService, shippingService } from '../src/documents/requirements/order-processing';

// 関係性分析ツール
import { RelationshipAnalyzer } from '../src/types/relationship-analyzer';

console.log('🔗 アクター・ユースケース N:N関係分析デモ');
console.log('='.repeat(50));

// 分析器を初期化
const analyzer = new RelationshipAnalyzer();

// 全アクターを追加
console.log('\n📥 アクターを登録中...');
analyzer.addActor(customer);
analyzer.addActor(emailService);
analyzer.addActor(admin);
analyzer.addActor(inventorySystem);
analyzer.addActor(paymentService);
analyzer.addActor(shippingService);

// 全ユースケースを追加
console.log('📥 ユースケースを登録中...');
analyzer.addUseCase(userRegistration);
analyzer.addUseCase(productRegistration);
analyzer.addUseCase(orderProcessing);
analyzer.addUseCase(orderTracking);

// 関係性分析を実行
console.log('\n🔍 関係性を分析中...\n');
const report = analyzer.generateReport();
console.log(report);

// 具体的な分析例
console.log('\n📋 具体的なクエリ例:');

// 顧客が関わるユースケース
const customerUseCases = analyzer.getUseCasesForActor('customer');
console.log(`\n🙋 顧客が関わるユースケース (${customerUseCases.length}個):`);
customerUseCases.forEach(uc => {
  console.log(`  • ${uc.name} (${uc.id})`);
});

// メール配信サービスが関わるユースケース  
const emailUseCases = analyzer.getUseCasesForActor('email-service');
console.log(`\n📧 メール配信サービスが関わるユースケース (${emailUseCases.length}個):`);
emailUseCases.forEach(uc => {
  console.log(`  • ${uc.name} (${uc.id})`);
});

// 注文処理に関わるアクター
const orderActors = analyzer.getActorsForUseCase('order-processing');
console.log(`\n🛒 注文処理に関わるアクター (${orderActors.length}人):`);
orderActors.forEach(actor => {
  console.log(`  • ${actor.name} (${actor.role})`);
});

console.log('\n✅ N:N関係の分析が完了しました！');
console.log('💡 この分析により、アクター間の依存関係や協調が必要な箇所が明確になります');