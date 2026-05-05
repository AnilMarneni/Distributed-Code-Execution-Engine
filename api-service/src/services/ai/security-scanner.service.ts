import { logger } from '../../utils/logger';

export interface SecurityAnalysis {
  isSafe: boolean;
  reason?: string;
  riskScore: number; // 0 to 1
}

class AISecurityScanner {
  /**
   * Analyzes source code for security risks before execution.
   * In a real production environment, this would call a fine-tuned LLM.
   */
  async analyze(code: string, language: string): Promise<SecurityAnalysis> {
    logger.info(`AI Security Scanner: Analyzing ${language} code...`);

    // Simulated LLM logic (using heuristic patterns for demonstration)
    const dangerousPatterns = [
      { regex: /socket\(/i, reason: 'Network socket creation detected' },
      { regex: /fork\(/i, reason: 'Process forking detected' },
      { regex: /system\(/i, reason: 'System command execution detected' },
      { regex: /\/etc\/shadow/i, reason: 'Sensitive file access attempt' },
      { regex: /rm\s+-rf/i, reason: 'Dangerous file deletion pattern' }
    ];

    let riskScore = 0;
    const detectedRisks: string[] = [];

    for (const pattern of dangerousPatterns) {
      if (pattern.regex.test(code)) {
        riskScore += 0.3;
        detectedRisks.push(pattern.reason);
      }
    }

    // Cap risk score at 1.0
    riskScore = Math.min(riskScore, 1.0);

    const isSafe = riskScore < 0.5;

    if (!isSafe) {
      logger.warn(`AI Security Scanner: REJECTED code. Risk Score: ${riskScore}. Reasons: ${detectedRisks.join(', ')}`);
    } else if (riskScore > 0) {
      logger.warn(`AI Security Scanner: Flagged suspicious patterns but allowed. Risk Score: ${riskScore}`);
    } else {
      logger.info('AI Security Scanner: Code passed security scan.');
    }

    return {
      isSafe,
      reason: detectedRisks.length > 0 ? detectedRisks.join(', ') : undefined,
      riskScore
    };
  }
}

export const aiSecurityScanner = new AISecurityScanner();
