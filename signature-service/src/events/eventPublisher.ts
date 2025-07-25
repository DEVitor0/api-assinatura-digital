import { getRabbitChannel } from "../services/rabbit/rabbit";

export interface SignatureConfirmedEvent {
  type: "assinatura_confirmada";
  payload: {
    documentId: string;
    userId: string;
    sessionId: string;
    timestamp: string;
  };
}

export type EventTypes = SignatureConfirmedEvent;

export async function publishEvent(event: EventTypes) {
  const channel = getRabbitChannel();
  const queue = event.type;

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(event.payload)), {
    persistent: true,
  });
}
