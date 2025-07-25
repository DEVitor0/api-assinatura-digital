import * as amqp from "amqplib";

type RabbitConnection = {
  createChannel(): Promise<amqp.Channel>;
  close(): Promise<void>;
};

let connection: RabbitConnection | null = null;

let channel: amqp.Channel | null = null;

export async function connectRabbitMQ(): Promise<void> {
  connection = (await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost")) as any;
  
  if (!connection) {
    throw new Error("RabbitMQ connection is not initialized.");
  }
  channel = await connection.createChannel();
}

export function getRabbitChannel(): amqp.Channel {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized. Call connectRabbitMQ() first.");
  }
  return channel;
}