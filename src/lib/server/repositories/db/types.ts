import type {
	articles,
	categories,
	orderItems,
	orders,
	payments,
	printers,
	printJobs,
	tables,
	user
} from './schema';

export type UserRecord = typeof user.$inferSelect;
export type Role = UserRecord['role'];
export type PrinterRecord = typeof printers.$inferSelect;
export type PrinterModel = PrinterRecord['model'];
export type CategoryRecord = typeof categories.$inferSelect;
export type ArticleRecord = typeof articles.$inferSelect;
export type PrinterMode = ArticleRecord['printerMode'];
export type TableRecord = typeof tables.$inferSelect;
export type OrderRecord = typeof orders.$inferSelect;
export type OrderItemRecord = typeof orderItems.$inferSelect;
export type PaymentRecord = typeof payments.$inferSelect;
export type PaymentMethod = PaymentRecord['method'];
export type PrintJobRecord = typeof printJobs.$inferSelect;
export type PrintJobStatus = PrintJobRecord['status'];
