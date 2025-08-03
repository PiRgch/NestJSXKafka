import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'order-service',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'order-service-group',
    },
    producer: {
      allowAutoTopicCreation: true,
    },
  },
};

export const KAFKA_TOPICS = {
  ORDER_EVENTS: 'order.events',
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
} as const;