import { Kafka, Producer, Partitioners, Consumer } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private isConnected: boolean = false;
  private isConsumerConnected: boolean = false;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
    this.kafka = new Kafka({
      clientId: 'api-service',
      brokers: brokers,
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner
    });
    this.consumer = this.kafka.consumer({ groupId: 'api-group' });
  }

  async connect() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('Successfully connected to Kafka Producer');
    } catch (error) {
      console.error('Error connecting to Kafka Producer:', error);
    }
  }

  async connectConsumer(onMessage: (topic: string, message: any) => Promise<void>) {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'job_results', fromBeginning: true });
      
      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (message.value) {
            const payload = JSON.parse(message.value.toString());
            await onMessage(topic, payload);
          }
        },
      });
      this.isConsumerConnected = true;
      console.log('Successfully connected to Kafka Consumer (API)');
    } catch (error) {
      console.error('Error connecting to Kafka Consumer (API):', error);
    }
  }

  async sendMessage(topic: string, message: any) {
    if (!this.isConnected) {
      console.warn('Kafka producer not connected. Attempting to connect...');
      await this.connect();
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          { value: JSON.stringify(message) },
        ],
      });
      return true;
    } catch (error) {
      console.error('Error sending message to Kafka:', error);
      return false;
    }
  }

  async disconnect() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    this.isConnected = false;
    this.isConsumerConnected = false;
  }
}

export const kafkaService = new KafkaService();
