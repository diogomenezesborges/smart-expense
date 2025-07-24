import { prisma } from '@/lib/database/client';
import { TransactionFlow, MajorCategory } from '@prisma/client';

interface CategorizationContext {
  description: string;
  amount: number;
  merchantName?: string;
  flow: TransactionFlow;
  date: Date;
  bankName?: string;
}

interface CategorizationResult {
  categoryId: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    categoryId: string;
    confidence: number;
    category: string;
    subCategory: string;
  }>;
}

interface CategoryRule {
  keywords: string[];
  categoryId: string;
  priority: number;
  flow?: TransactionFlow;
  isLearned?: boolean;
  confidence?: number;
  usageCount?: number;
  lastUsed?: Date;
}

interface FeedbackPattern {
  id: string;
  description: string;
  originalCategoryId: string;
  correctedCategoryId: string;
  keywords: string[];
  confidence: number;
  occurrences: number;
  createdAt: Date;
  lastUsed: Date;
}

export class AiCategorizationService {
  private categoryRules: CategoryRule[] = [];
  private feedbackPatterns: FeedbackPattern[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeRules();
    this.loadFeedbackPatterns();
  }

  private async initializeRules() {
    if (this.isInitialized) return;

    // Load all categories for rule generation
    const categories = await prisma.category.findMany();
    
    // Generate smart rules based on Portuguese expense patterns
    this.categoryRules = [
      // Income patterns
      { keywords: ['salario', 'ordenado', 'vencimento'], categoryId: this.findCategoryId(categories, 'ENTRADA', 'Salario', 'Salario Liq.'), priority: 10, flow: 'ENTRADA' },
      { keywords: ['subsidio', 'ferias'], categoryId: this.findCategoryId(categories, 'ENTRADA', 'Salario', 'Subs.Férias'), priority: 9, flow: 'ENTRADA' },
      { keywords: ['alimentacao'], categoryId: this.findCategoryId(categories, 'ENTRADA', 'Salario', 'Subs.Alimentação'), priority: 9, flow: 'ENTRADA' },
      { keywords: ['olx', 'venda'], categoryId: this.findCategoryId(categories, 'ENTRADA', 'Vendas Usados', 'Olx'), priority: 8, flow: 'ENTRADA' },
      { keywords: ['vinted'], categoryId: this.findCategoryId(categories, 'ENTRADA', 'Vendas Usados', 'Vinted'), priority: 8, flow: 'ENTRADA' },

      // Food expenses
      { keywords: ['continente', 'pingo doce', 'lidl', 'auchan', 'supermercado'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Alimentação', 'Supermercado'), priority: 10, flow: 'SAIDA' },
      { keywords: ['mcdonalds', 'burger king', 'kfc', 'pizza', 'take away', 'uber eats', 'glovo'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Alimentação', 'Take Away'), priority: 9, flow: 'SAIDA' },
      { keywords: ['padaria', 'pastelaria', 'cafe'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Alimentação', 'Padaria / Pastelaria'), priority: 8, flow: 'SAIDA' },
      { keywords: ['restaurante', 'refeicao', 'jantar'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Alimentação', 'Refeições fora de casa'), priority: 7, flow: 'SAIDA' },

      // Transportation
      { keywords: ['galp', 'bp', 'repsol', 'combustivel', 'gasolina', 'gasóleo'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Transportes', 'Carro Combustivel'), priority: 10, flow: 'SAIDA' },
      { keywords: ['via verde', 'portagem'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Transportes', 'Carro Via Verde'), priority: 10, flow: 'SAIDA' },
      { keywords: ['estacionamento', 'parquimetro'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Transportes', 'Estacionamento'), priority: 9, flow: 'SAIDA' },
      { keywords: ['metro', 'autocarro', 'comboio', 'cp'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Transportes', 'Transporte Público'), priority: 8, flow: 'SAIDA' },

      // Utilities
      { keywords: ['edp', 'electricidade'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Casa', 'Electricidade'), priority: 10, flow: 'SAIDA' },
      { keywords: ['agua', 'aguas'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Casa', 'Água'), priority: 10, flow: 'SAIDA' },
      { keywords: ['gas', 'gás'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Casa', 'Gás'), priority: 10, flow: 'SAIDA' },
      { keywords: ['meo', 'nos', 'vodafone', 'internet'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Casa', 'Internet'), priority: 9, flow: 'SAIDA' },

      // Subscriptions
      { keywords: ['spotify'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Subscrições', 'Spotify'), priority: 10, flow: 'SAIDA' },
      { keywords: ['amazon'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Subscrições', 'Amazon'), priority: 10, flow: 'SAIDA' },
      { keywords: ['google'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Subscrições', 'Google One'), priority: 9, flow: 'SAIDA' },
      { keywords: ['telemóvel', 'telemovel'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Subscrições', 'Telemóvel'), priority: 9, flow: 'SAIDA' },

      // Health & wellness
      { keywords: ['farmacia', 'medicamento'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Saúde', 'Medicamentos Adulto'), priority: 10, flow: 'SAIDA' },
      { keywords: ['dentista'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Saúde', 'Dentista Adulto'), priority: 10, flow: 'SAIDA' },
      { keywords: ['consulta', 'medico'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Saúde', 'Consultas Adulto'), priority: 9, flow: 'SAIDA' },
      { keywords: ['ginasio', 'fitness'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Desporto', 'Ginásio'), priority: 9, flow: 'SAIDA' },

      // Personal care
      { keywords: ['cabeleireiro'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Cuidados Pessoais', 'Cabeleireiro'), priority: 10, flow: 'SAIDA' },

      // Shopping
      { keywords: ['zara', 'hm', 'mango', 'roupa', 'vestuario'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Compras Gerais', 'Vestuário'), priority: 8, flow: 'SAIDA' },
      { keywords: ['ikea', 'conforama', 'decoracao'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Casa', 'Casa Decoração'), priority: 8, flow: 'SAIDA' },

      // Banking
      { keywords: ['multibanco', 'mb', 'levantamento'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Levantamento', 'Levantamento'), priority: 10, flow: 'SAIDA' },
      { keywords: ['comissao', 'taxa'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Comissões', 'Millenium'), priority: 9, flow: 'SAIDA' },

      // Pet expenses
      { keywords: ['veterinario', 'vet'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Axl', 'Veterinário'), priority: 10, flow: 'SAIDA' },
      { keywords: ['racao', 'ração'], categoryId: this.findCategoryId(categories, 'SAIDA', 'Axl', 'Ração'), priority: 10, flow: 'SAIDA' },
    ].filter(rule => rule.categoryId !== '') as CategoryRule[];

    this.isInitialized = true;
  }

  private async loadFeedbackPatterns() {
    try {
      // Load feedback patterns from audit log
      const corrections = await prisma.auditLog.findMany({
        where: {
          tableName: 'ai_categorization',
          action: 'CORRECTION',
        },
        orderBy: { timestamp: 'desc' },
        take: 1000, // Load recent corrections
      });

      // Group corrections by pattern to identify recurring patterns
      const patternMap = new Map<string, {
        corrections: any[];
        keywords: Set<string>;
        originalCategoryId: string;
        correctedCategoryId: string;
      }>();

      for (const correction of corrections) {
        const description = correction.newValues?.description || '';
        const normalizedDesc = this.normalizeText(description);
        const keywords = this.extractKeywords(normalizedDesc);
        const patternKey = keywords.slice(0, 3).join('_'); // Use first 3 keywords as pattern key

        if (!patternMap.has(patternKey)) {
          patternMap.set(patternKey, {
            corrections: [],
            keywords: new Set(keywords),
            originalCategoryId: correction.oldValues?.categoryId || '',
            correctedCategoryId: correction.newValues?.categoryId || '',
          });
        }

        const pattern = patternMap.get(patternKey)!;
        pattern.corrections.push(correction);
        keywords.forEach(keyword => pattern.keywords.add(keyword));
      }

      // Convert to feedback patterns
      this.feedbackPatterns = Array.from(patternMap.entries())
        .filter(([, pattern]) => pattern.corrections.length >= 2) // At least 2 occurrences
        .map(([patternKey, pattern]) => ({
          id: patternKey,
          description: pattern.corrections[0]?.newValues?.description || '',
          originalCategoryId: pattern.originalCategoryId,
          correctedCategoryId: pattern.correctedCategoryId,
          keywords: Array.from(pattern.keywords),
          confidence: Math.min(pattern.corrections.length * 0.2, 0.9),
          occurrences: pattern.corrections.length,
          createdAt: new Date(pattern.corrections[pattern.corrections.length - 1]?.timestamp),
          lastUsed: new Date(pattern.corrections[0]?.timestamp),
        }));

    } catch (error) {
      console.error('Error loading feedback patterns:', error);
      this.feedbackPatterns = [];
    }
  }

  private findCategoryId(categories: any[], flow: string, category: string, subCategory: string): string {
    const found = categories.find(c => 
      c.flow === flow && 
      c.category === category && 
      c.subCategory === subCategory
    );
    return found?.id || '';
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Replace non-alphanumeric with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  private extractKeywords(text: string): string[] {
    const normalized = this.normalizeText(text);
    const words = normalized.split(' ');
    
    // Filter meaningful keywords (length > 2, not common words)
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'de', 'da', 'do', 'em', 'com', 'para', 'por']);
    
    return words
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Take first 5 meaningful words
  }

  private calculateKeywordMatch(text: string, keywords: string[]): number {
    const normalizedText = this.normalizeText(text);
    let score = 0;
    
    for (const keyword of keywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      if (normalizedText.includes(normalizedKeyword)) {
        // Exact match gets higher score
        if (normalizedText === normalizedKeyword) {
          score += 10;
        } else if (normalizedText.startsWith(normalizedKeyword) || normalizedText.endsWith(normalizedKeyword)) {
          score += 7;
        } else {
          score += 5;
        }
      }
    }
    
    return score;
  }

  private async getHistoricalCategorization(context: CategorizationContext): Promise<{ categoryId: string; confidence: number } | null> {
    try {
      // Look for similar transactions by description
      const normalizedDescription = this.normalizeText(context.description);
      
      // Find transactions with similar descriptions that have been validated
      const similarTransactions = await prisma.transaction.findMany({
        where: {
          isValidated: true,
          flow: context.flow,
          description: {
            contains: normalizedDescription.split(' ')[0], // Use first word for similarity
            mode: 'insensitive',
          },
        },
        select: {
          categoryId: true,
          description: true,
        },
        take: 10,
      });

      if (similarTransactions.length === 0) return null;

      // Score transactions by description similarity
      const scored = similarTransactions.map(t => ({
        categoryId: t.categoryId,
        similarity: this.calculateTextSimilarity(normalizedDescription, this.normalizeText(t.description)),
      }));

      // Group by category and calculate confidence
      const categoryScores = scored.reduce((acc, item) => {
        if (!acc[item.categoryId]) {
          acc[item.categoryId] = { total: 0, count: 0 };
        }
        acc[item.categoryId].total += item.similarity;
        acc[item.categoryId].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      // Find the best category
      let bestCategory = '';
      let bestScore = 0;

      for (const [categoryId, score] of Object.entries(categoryScores)) {
        const avgScore = score.total / score.count;
        if (avgScore > bestScore && avgScore > 0.3) { // Minimum similarity threshold
          bestScore = avgScore;
          bestCategory = categoryId;
        }
      }

      if (bestCategory && bestScore > 0) {
        return {
          categoryId: bestCategory,
          confidence: Math.min(bestScore * 0.8, 0.9), // Historical matches get max 0.9 confidence
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting historical categorization:', error);
      return null;
    }
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 2);
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  }

  private checkFeedbackPatterns(context: CategorizationContext): { categoryId: string; confidence: number; reasoning: string } | null {
    const searchText = `${context.description} ${context.merchantName || ''}`;
    const keywords = this.extractKeywords(searchText);
    
    // Find matching feedback patterns
    const matches = this.feedbackPatterns
      .filter(pattern => {
        // Check if any pattern keywords match
        return pattern.keywords.some(keyword => 
          keywords.some(ctxKeyword => 
            this.normalizeText(keyword).includes(this.normalizeText(ctxKeyword)) ||
            this.normalizeText(ctxKeyword).includes(this.normalizeText(keyword))
          )
        );
      })
      .map(pattern => ({
        pattern,
        score: this.calculateKeywordMatch(searchText, pattern.keywords),
      }))
      .filter(match => match.score > 0)
      .sort((a, b) => (b.score * b.pattern.confidence) - (a.score * a.pattern.confidence));

    if (matches.length > 0) {
      const bestMatch = matches[0];
      return {
        categoryId: bestMatch.pattern.correctedCategoryId,
        confidence: Math.min(bestMatch.pattern.confidence * 0.9, 0.85), // Slightly lower than perfect confidence
        reasoning: `Based on user feedback pattern (${bestMatch.pattern.occurrences} corrections)`,
      };
    }

    return null;
  }

  async categorizeTransaction(context: CategorizationContext): Promise<CategorizationResult> {
    await this.initializeRules();

    const searchText = `${context.description} ${context.merchantName || ''}`;
    
    // Check feedback patterns first (highest priority)
    const feedbackMatch = this.checkFeedbackPatterns(context);
    
    // Try historical categorization
    const historicalMatch = await this.getHistoricalCategorization(context);
    
    // Try rule-based categorization
    const ruleMatches = this.categoryRules
      .filter(rule => !rule.flow || rule.flow === context.flow)
      .map(rule => ({
        ...rule,
        score: this.calculateKeywordMatch(searchText, rule.keywords),
      }))
      .filter(match => match.score > 0)
      .sort((a, b) => (b.score * b.priority) - (a.score * a.priority));

    // Determine best categorization
    let bestResult: { categoryId: string; confidence: number; reasoning: string };

    if (feedbackMatch && feedbackMatch.confidence > 0.5) {
      // Use feedback pattern if available (highest priority)
      bestResult = {
        categoryId: feedbackMatch.categoryId,
        confidence: feedbackMatch.confidence,
        reasoning: feedbackMatch.reasoning,
      };
    } else if (historicalMatch && historicalMatch.confidence > 0.6) {
      // Use historical match if confidence is high
      bestResult = {
        categoryId: historicalMatch.categoryId,
        confidence: historicalMatch.confidence,
        reasoning: 'Based on similar historical transactions',
      };
    } else if (ruleMatches.length > 0) {
      // Use rule-based match
      const bestMatch = ruleMatches[0];
      const confidence = Math.min((bestMatch.score * bestMatch.priority) / 100, 0.95);
      
      bestResult = {
        categoryId: bestMatch.categoryId,
        confidence,
        reasoning: `Matched keywords: ${bestMatch.keywords.join(', ')}`,
      };
    } else {
      // Fallback to unknown category
      const unknownCategory = await prisma.category.findFirst({
        where: {
          flow: context.flow,
          category: 'Desconhecido',
          subCategory: 'Desconhecido',
        },
      });

      bestResult = {
        categoryId: unknownCategory?.id || '',
        confidence: 0.1,
        reasoning: 'No matching patterns found, assigned to unknown category',
      };
    }

    // Generate alternatives
    const alternatives = await this.generateAlternatives(context, bestResult.categoryId, ruleMatches);

    return {
      categoryId: bestResult.categoryId,
      confidence: bestResult.confidence,
      reasoning: bestResult.reasoning,
      alternatives,
    };
  }

  private async generateAlternatives(
    context: CategorizationContext,
    selectedCategoryId: string,
    ruleMatches: any[]
  ): Promise<Array<{ categoryId: string; confidence: number; category: string; subCategory: string }>> {
    try {
      // Get top 3 rule matches that aren't the selected one
      const alternativeRules = ruleMatches
        .filter(match => match.categoryId !== selectedCategoryId)
        .slice(0, 3);

      // Get category details for alternatives
      const alternatives = await Promise.all(
        alternativeRules.map(async (match) => {
          const category = await prisma.category.findUnique({
            where: { id: match.categoryId },
          });

          if (!category) return null;

          return {
            categoryId: match.categoryId,
            confidence: Math.min((match.score * match.priority) / 100 * 0.8, 0.8), // Lower confidence for alternatives
            category: category.category,
            subCategory: category.subCategory,
          };
        })
      );

      return alternatives.filter(Boolean) as Array<{
        categoryId: string;
        confidence: number;
        category: string;
        subCategory: string;
      }>;
    } catch (error) {
      console.error('Error generating alternatives:', error);
      return [];
    }
  }

  // Learn from user corrections
  async learnFromCorrection(
    transactionId: string,
    originalCategoryId: string,
    correctedCategoryId: string,
    description: string
  ) {
    try {
      // Log the correction for future improvement
      await prisma.auditLog.create({
        data: {
          tableName: 'ai_categorization',
          recordId: transactionId,
          action: 'CORRECTION',
          oldValues: { categoryId: originalCategoryId },
          newValues: { 
            categoryId: correctedCategoryId,
            description,
            timestamp: new Date(),
          },
        },
      });

      // Immediate learning: update feedback patterns
      await this.updateFeedbackPatterns(description, originalCategoryId, correctedCategoryId);
      
      // Create or strengthen learned rules
      await this.createLearnedRule(description, correctedCategoryId);
      
    } catch (error) {
      console.error('Error learning from correction:', error);
    }
  }

  private async updateFeedbackPatterns(
    description: string,
    originalCategoryId: string,
    correctedCategoryId: string
  ) {
    const keywords = this.extractKeywords(description);
    const patternKey = keywords.slice(0, 3).join('_');
    
    // Find existing pattern or create new one
    const existingPatternIndex = this.feedbackPatterns.findIndex(p => p.id === patternKey);
    
    if (existingPatternIndex >= 0) {
      // Update existing pattern
      const pattern = this.feedbackPatterns[existingPatternIndex];
      pattern.occurrences += 1;
      pattern.confidence = Math.min(pattern.occurrences * 0.2, 0.9);
      pattern.lastUsed = new Date();
    } else {
      // Create new pattern
      this.feedbackPatterns.push({
        id: patternKey,
        description,
        originalCategoryId,
        correctedCategoryId,
        keywords,
        confidence: 0.2,
        occurrences: 1,
        createdAt: new Date(),
        lastUsed: new Date(),
      });
    }
  }

  private async createLearnedRule(description: string, categoryId: string) {
    const keywords = this.extractKeywords(description);
    const mainKeywords = keywords.slice(0, 2); // Use top 2 keywords
    
    if (mainKeywords.length === 0) return;
    
    // Check if similar learned rule already exists
    const existingRule = this.categoryRules.find(rule => 
      rule.isLearned && 
      rule.categoryId === categoryId &&
      rule.keywords.some(keyword => mainKeywords.includes(keyword))
    );
    
    if (existingRule) {
      // Strengthen existing rule
      existingRule.usageCount = (existingRule.usageCount || 0) + 1;
      existingRule.confidence = Math.min((existingRule.usageCount * 0.1) + 0.5, 0.8);
      existingRule.lastUsed = new Date();
    } else {
      // Create new learned rule
      this.categoryRules.push({
        keywords: mainKeywords,
        categoryId,
        priority: 8, // Medium priority for learned rules
        isLearned: true,
        confidence: 0.6,
        usageCount: 1,
        lastUsed: new Date(),
      });
    }
  }

  // Get categorization statistics
  async getCategorizationStats(days = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [total, aiGenerated, validated, corrections] = await Promise.all([
        prisma.transaction.count({
          where: { createdAt: { gte: since } },
        }),
        prisma.transaction.count({
          where: { 
            createdAt: { gte: since },
            isAiGenerated: true,
          },
        }),
        prisma.transaction.count({
          where: { 
            createdAt: { gte: since },
            isValidated: true,
          },
        }),
        prisma.auditLog.count({
          where: {
            tableName: 'ai_categorization',
            action: 'CORRECTION',
            timestamp: { gte: since },
          },
        }),
      ]);

      const aiAccuracy = aiGenerated > 0 ? ((aiGenerated - corrections) / aiGenerated) * 100 : 0;

      return {
        period: { days, since },
        totalTransactions: total,
        aiGeneratedTransactions: aiGenerated,
        validatedTransactions: validated,
        corrections,
        aiAccuracy: Math.round(aiAccuracy * 100) / 100,
        validationRate: total > 0 ? (validated / total) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting categorization stats:', error);
      throw error;
    }
  }

  // Get feedback learning insights
  async getFeedbackInsights() {
    try {
      return {
        totalPatterns: this.feedbackPatterns.length,
        highConfidencePatterns: this.feedbackPatterns.filter(p => p.confidence > 0.7).length,
        recentPatterns: this.feedbackPatterns.filter(p => 
          (Date.now() - p.lastUsed.getTime()) < (30 * 24 * 60 * 60 * 1000) // Last 30 days
        ).length,
        learnedRules: this.categoryRules.filter(r => r.isLearned).length,
        mostCorrectiveCategories: await this.getMostCorrectedCategories(),
      };
    } catch (error) {
      console.error('Error getting feedback insights:', error);
      return {
        totalPatterns: 0,
        highConfidencePatterns: 0,
        recentPatterns: 0,
        learnedRules: 0,
        mostCorrectiveCategories: [],
      };
    }
  }

  private async getMostCorrectedCategories(limit = 5) {
    try {
      // Get categories that are frequently corrected
      const corrections = await prisma.auditLog.findMany({
        where: {
          tableName: 'ai_categorization',
          action: 'CORRECTION',
          timestamp: {
            gte: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)), // Last 90 days
          },
        },
        select: {
          oldValues: true,
          newValues: true,
        },
      });

      const categoryCorrections = new Map<string, { 
        count: number; 
        fromCategory: string; 
        toCategory: string; 
      }>();

      for (const correction of corrections) {
        const oldCategoryId = correction.oldValues?.categoryId;
        const newCategoryId = correction.newValues?.categoryId;
        
        if (oldCategoryId && newCategoryId) {
          const key = `${oldCategoryId}->${newCategoryId}`;
          if (!categoryCorrections.has(key)) {
            categoryCorrections.set(key, {
              count: 0,
              fromCategory: oldCategoryId,
              toCategory: newCategoryId,
            });
          }
          categoryCorrections.get(key)!.count += 1;
        }
      }

      // Get category names
      const categoryIds = Array.from(categoryCorrections.values())
        .flatMap(c => [c.fromCategory, c.toCategory]);
      
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, category: true, subCategory: true },
      });

      const categoryMap = new Map(categories.map(c => [c.id, `${c.category} - ${c.subCategory}`]));

      return Array.from(categoryCorrections.entries())
        .map(([key, data]) => ({
          correctionPattern: key,
          count: data.count,
          fromCategory: categoryMap.get(data.fromCategory) || 'Unknown',
          toCategory: categoryMap.get(data.toCategory) || 'Unknown',
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting most corrected categories:', error);
      return [];
    }
  }

  // Reset learned patterns (for maintenance)
  async resetLearning(olderThanDays = 180) {
    try {
      const cutoffDate = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
      
      // Remove old feedback patterns
      this.feedbackPatterns = this.feedbackPatterns.filter(p => p.lastUsed > cutoffDate);
      
      // Remove old learned rules
      this.categoryRules = this.categoryRules.filter(r => 
        !r.isLearned || (r.lastUsed && r.lastUsed > cutoffDate)
      );

      return {
        message: 'Learning patterns reset successfully',
        remainingPatterns: this.feedbackPatterns.length,
        remainingLearnedRules: this.categoryRules.filter(r => r.isLearned).length,
      };
    } catch (error) {
      console.error('Error resetting learning:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiCategorizationService = new AiCategorizationService();