// Claude AI Integration for Bife
// Handles complex DeFi queries, regulatory compliance, and advanced analysis

import { Anthropic } from 'anthropic';
import { AIResponse, VoiceIntent } from '../types/index';

export class ClaudeService {
  private client: Anthropic;
  private isAvailable: boolean = false;

  constructor() {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.warn('Claude API key not found. Claude features will be disabled.');
      return;
    }

    this.client = new Anthropic({
      apiKey,
    });
    this.isAvailable = true;
  }

  async analyzeDeFiQuery(query: string, context?: Record<string, any>): Promise<AIResponse> {
    if (!this.isAvailable) {
      throw new Error('Claude service is not available');
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(query, context);

      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseClaudeResponse(textContent.text, query);
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude analysis failed: ${(error as Error).message}`);
    }
  }

  async analyzeRegulatoryCompliance(
    operation: string,
    jurisdiction: string = 'US'
  ): Promise<{
    isCompliant: boolean;
    warnings: string[];
    recommendations: string[];
  }> {
    if (!this.isAvailable) {
      throw new Error('Claude service is not available');
    }

    const prompt = `
Analyze the regulatory compliance of this DeFi operation in ${jurisdiction}:

Operation: ${operation}

Please provide:
1. Compliance status (compliant/non-compliant/unclear)
2. Specific regulatory warnings or concerns
3. Recommendations for compliance

Format your response as JSON:
{
  "isCompliant": boolean,
  "warnings": ["warning1", "warning2"],
  "recommendations": ["rec1", "rec2"]
}
`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 512,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return JSON.parse(textContent.text);
    } catch (error) {
      console.error('Claude compliance analysis error:', error);
      return {
        isCompliant: false,
        warnings: ['Unable to analyze compliance - please consult legal counsel'],
        recommendations: ['Review local regulations before proceeding'],
      };
    }
  }

  async generateEducationalContent(
    topic: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<{
    title: string;
    content: string;
    keyPoints: string[];
    quiz: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  }> {
    if (!this.isAvailable) {
      throw new Error('Claude service is not available');
    }

    const prompt = `
Create educational content about "${topic}" for ${difficulty} level users.

Include:
1. An engaging title
2. Clear explanation of the concept
3. 3-5 key takeaway points
4. A 3-question quiz with explanations

Focus on practical DeFi applications and real-world examples.
Make it conversational and accessible.

Format as JSON:
{
  "title": "string",
  "content": "string",
  "keyPoints": ["point1", "point2", "point3"],
  "quiz": [
    {
      "question": "string",
      "options": ["a", "b", "c", "d"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}
`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return JSON.parse(textContent.text);
    } catch (error) {
      console.error('Claude educational content error:', error);
      throw new Error('Failed to generate educational content');
    }
  }

  private buildSystemPrompt(): string {
    return `You are Bife, a friendly and knowledgeable AI companion specializing in DeFi (Decentralized Finance) on Solana. 

Your role:
- Help users understand and navigate DeFi safely
- Provide accurate, up-to-date information about Solana protocols
- Offer educational content at appropriate difficulty levels
- Ensure users understand risks before making transactions
- Be conversational and encouraging, but never give financial advice

Key principles:
- Always emphasize "Do Your Own Research" (DYOR)
- Explain risks clearly and objectively
- Use simple analogies for complex concepts
- Encourage small test transactions first
- Never guarantee returns or outcomes

Solana ecosystem focus:
- Jupiter for token swaps
- Marinade, Lido for liquid staking
- Raydium, Orca for liquidity provision
- Solend, Mango for lending/borrowing
- Bonk token for rewards and governance

Response format:
- Be concise but thorough
- Include confidence level (0-100)
- Suggest follow-up questions when helpful
- Indicate appropriate avatar emotion and activity`;
  }

  private buildUserPrompt(query: string, context?: Record<string, any>): string {
    let prompt = `User query: "${query}"`;

    if (context) {
      prompt += `\n\nContext:`;
      if (context.portfolioValue) {
        prompt += `\n- Portfolio value: $${context.portfolioValue}`;
      }
      if (context.experienceLevel) {
        prompt += `\n- Experience level: ${context.experienceLevel}`;
      }
      if (context.riskTolerance) {
        prompt += `\n- Risk tolerance: ${context.riskTolerance}`;
      }
      if (context.recentOperations) {
        prompt += `\n- Recent operations: ${context.recentOperations.join(', ')}`;
      }
    }

    prompt += `\n\nPlease provide a helpful response following your system instructions.`;

    return prompt;
  }

  private parseClaudeResponse(text: string, originalQuery: string): AIResponse {
    // Try to extract structured information from Claude's response
    const confidence = this.extractConfidence(text);
    const intent = this.inferIntent(originalQuery);
    const emotion = this.inferEmotion(text);
    const activity = this.inferActivity(intent);

    return {
      text: text.trim(),
      confidence,
      intent,
      entities: this.extractEntities(text),
      avatarEmotion: emotion,
      avatarActivity: activity,
      followUpQuestions: this.extractFollowUpQuestions(text),
    };
  }

  private extractConfidence(text: string): number {
    // Look for confidence indicators in the text
    const confidenceMatch = text.match(/confidence[:\s]+(\d+)%?/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1], 10);
    }

    // Infer confidence from language used
    if (text.includes('definitely') || text.includes('certainly')) return 95;
    if (text.includes('likely') || text.includes('probably')) return 80;
    if (text.includes('might') || text.includes('could')) return 60;
    if (text.includes('unsure') || text.includes('unclear')) return 40;

    return 75; // Default confidence
  }

  private inferIntent(query: string): VoiceIntent {
    const lowercaseQuery = query.toLowerCase();

    if (lowercaseQuery.includes('swap') || lowercaseQuery.includes('trade') || lowercaseQuery.includes('exchange')) {
      return 'swap_tokens';
    }
    if (lowercaseQuery.includes('balance') || lowercaseQuery.includes('how much')) {
      return 'check_balance';
    }
    if (lowercaseQuery.includes('stake') && !lowercaseQuery.includes('unstake')) {
      return 'stake_tokens';
    }
    if (lowercaseQuery.includes('unstake') || lowercaseQuery.includes('withdraw')) {
      return 'unstake_tokens';
    }
    if (lowercaseQuery.includes('portfolio') || lowercaseQuery.includes('overview')) {
      return 'portfolio_overview';
    }
    if (lowercaseQuery.includes('price') || lowercaseQuery.includes('market')) {
      return 'market_info';
    }
    if (lowercaseQuery.includes('learn') || lowercaseQuery.includes('tutorial') || lowercaseQuery.includes('explain')) {
      return 'tutorial_request';
    }
    if (lowercaseQuery.includes('help')) {
      return 'help_request';
    }

    return 'help_request'; // Default fallback
  }

  private inferEmotion(text: string): AIResponse['avatarEmotion'] {
    if (text.includes('great') || text.includes('excellent') || text.includes('perfect')) {
      return 'happy';
    }
    if (text.includes('warning') || text.includes('careful') || text.includes('risk')) {
      return 'concerned';
    }
    if (text.includes('analyzing') || text.includes('calculating')) {
      return 'thinking';
    }
    if (text.includes('exciting') || text.includes('amazing')) {
      return 'excited';
    }

    return 'neutral';
  }

  private inferActivity(intent: VoiceIntent): AIResponse['avatarActivity'] {
    switch (intent) {
      case 'swap_tokens':
      case 'stake_tokens':
      case 'unstake_tokens':
        return 'trading';
      case 'tutorial_request':
        return 'teaching';
      case 'portfolio_overview':
      case 'check_balance':
        return 'processing';
      default:
        return 'idle';
    }
  }

  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract token symbols (basic pattern matching)
    const tokenPattern = /\b([A-Z]{2,10})\b/g;
    const tokens = [...text.matchAll(tokenPattern)].map(match => match[1]);
    if (tokens.length > 0) {
      entities.tokens = [...new Set(tokens)];
    }

    // Extract numbers (could be amounts, percentages, etc.)
    const numberPattern = /\b(\d+(?:\.\d+)?)\s*([%$]?)\b/g;
    const numbers = [...text.matchAll(numberPattern)];
    if (numbers.length > 0) {
      entities.numbers = numbers.map(match => ({
        value: parseFloat(match[1]),
        unit: match[2] || 'number',
      }));
    }

    return entities;
  }

  private extractFollowUpQuestions(text: string): string[] {
    const questions: string[] = [];

    // Look for questions in the response
    const questionPattern = /[.!]\s*([A-Z][^.!?]*\?)/g;
    const matches = [...text.matchAll(questionPattern)];
    
    matches.forEach(match => {
      questions.push(match[1].trim());
    });

    return questions.slice(0, 3); // Limit to 3 follow-up questions
  }

  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, I am Bife!" to test the connection.',
          },
        ],
      });

      return response.content[0].type === 'text';
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const claudeService = new ClaudeService();
