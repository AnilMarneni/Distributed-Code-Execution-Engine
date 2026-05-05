import { Kafka, Producer, Consumer } from 'kafkajs';

class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'evaluation-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'evaluation-group' });
  }

  async connect() {
    await this.producer.connect();
    await this.consumer.connect();
    console.log('Evaluation Service: Connected to Kafka');
  }

  async subscribe(topic: string, callback: (message: any) => Promise<void>) {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const payload = JSON.parse(message.value.toString());
          await callback(payload);
        }
      }
    });
  }

  async sendResult(result: any) {
    await this.producer.send({
      topic: 'job_results',
      messages: [{ value: JSON.stringify(result) }]
    });
  }
}

export const kafkaService = new KafkaService();
