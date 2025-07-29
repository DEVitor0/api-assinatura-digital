import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  eventType: 'signature' | 'rejection' | 'failure';
  userId: string;
  documentId: string;
  message?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  eventType: { type: String, enum: ['signature', 'rejection', 'failure'], required: true },
  userId: { type: String, required: true },
  documentId: { type: String, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
