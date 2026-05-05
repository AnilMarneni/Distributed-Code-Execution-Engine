import { Kafka, Consumer, Producer, Partitioners } from 'kafkajs';
import dotenv from 'dotenv';
import { JobPayload, JobResult, EvaluationPayload } from '@engine/common';

dotenv.config();

class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private isProducerConnected: boolean = false;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
    this.kafka = new Kafka({
      clientId: 'scheduler-service',
      brokers: brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: 'scheduler-group' });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner
    });
  }

  async connect(onMessage: (job: JobPayload) => Promise<void>) {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'job_submissions', fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ message }) => {
          if (message.value) {
            const job = JSON.parse(message.value.toString()) as JobPayload;
            console.log(`Received job: ${job.jobId}`);
            await onMessage(job);
          }
        },
      });

      console.log('Successfully connected to Kafka Consumer');
    } catch (error) {
      console.error('Error connecting to Kafka Consumer:', error);
    }
  }

  async connectProducer() {
    try {
      await this.producer.connect();
      this.isProducerConnected = true;
      console.log('Successfully connected to Kafka Producer (Scheduler)');
    } catch (error) {
      console.error('Error connecting to Kafka Producer (Scheduler):', error);
    }
  }


  async sendRawResult(result: EvaluationPayload) {
    if (!this.isProducerConnected) {
      await this.connectProducer();
    }
    await this.producer.send({
      topic: 'raw_results',
      messages: [{ value: JSON.stringify(result) }]
    });
  }

  async sendResult(result: JobResult) {
    if (!this.isProducerConnected) {
      await this.connectProducer();
    }

    try {
      await this.producer.send({
        topic: 'job_results',
        messages: [
          { value: JSON.stringify(result) },
        ],
      });
      return true;
    } catch (error) {
      console.error('Error sending result to Kafka:', error);
      return false;
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }
}

export const kafkaService = new KafkaService();
