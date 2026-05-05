import { Kafka, Admin } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

class LagMonitorService {
  private kafka: Kafka;
  private admin: Admin;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'lag-monitor',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    });
    this.admin = this.kafka.admin();
  }

  async getLag(groupId: string, topic: string): Promise<number> {
    await this.admin.connect();
    
    try {
      // 1. Get latest offsets for the topic
      const topicOffsets = await this.admin.fetchTopicOffsets(topic);
      
      // 2. Get consumer group offsets
      const groupOffsets = await this.admin.fetchOffsets({ groupId, topics: [topic] });
      
      let totalLag = 0;
      
      for (const partition of topicOffsets) {
        const groupPartition = groupOffsets[0].partitions.find(p => p.partition === partition.partition);
        if (groupPartition) {
          const lag = parseInt(partition.offset) - parseInt(groupPartition.offset);
          totalLag += Math.max(0, lag);
        }
      }
      
      return totalLag;
    } finally {
      await this.admin.disconnect();
    }
  }
}

export const lagMonitorService = new LagMonitorService();
