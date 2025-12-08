// models/Message.js
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

let MessageSchema = models.Message ? models.Message.schema : null;

if (!MessageSchema) {
  MessageSchema = new Schema(
    {
      conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
      readAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

  // Index for faster queries
  MessageSchema.index({ conversationId: 1, createdAt: -1 });
  MessageSchema.index({ sender: 1 });
}

const Message = models.Message || model('Message', MessageSchema);

export default Message;