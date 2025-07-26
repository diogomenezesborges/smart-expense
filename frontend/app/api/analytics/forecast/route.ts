import { NextRequest, NextResponse } from 'next/server';
import { ForecastData } from '@/lib/services/analytics-service';

// Mock ML-based forecasting service
// In production, integrate with actual ML models (TensorFlow, scikit-learn, etc.)
export async function POST(request: NextRequest) {
  try {
    const { userId, months, type, scenario } = await request.json();

    if (!userId || !months || !type) {
      return NextResponse.json(
        { error: 'userId, months, and type are required' },
        { status: 400 }
      );
    }

    // Simulate ML model processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const forecast = await generateForecast(userId, months, type, scenario);

    return NextResponse.json({
      success: true,
      forecast,
      metadata: {
        modelVersion: '2.1.0',
        confidence: calculateOverallConfidence(forecast),
        generatedAt: new Date().toISOString(),
        scenario: scenario || 'conservative'
      }
    });
  } catch (error) {
    console.error('Forecast generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}

async function generateForecast(
  userId: string, 
  months: number, 
  type: string, 
  scenario: string = 'conservative'
): Promise<ForecastData[]> {
  // Mock historical data analysis
  const historicalData = await getHistoricalData(userId, type);
  
  // Apply scenario adjustments
  const scenarioMultipliers = {
    conservative: { growth: 0.8, volatility: 1.2 },
    optimistic: { growth: 1.3, volatility: 0.8 },
    pessimistic: { growth: 0.6, volatility: 1.5 }
  };
  
  const multiplier = scenarioMultipliers[scenario as keyof typeof scenarioMultipliers] || scenarioMultipliers.conservative;
  
  const forecast: ForecastData[] = [];
  let baseValue = historicalData.currentValue;
  
  for (let month = 1; month <= months; month++) {
    // Seasonal component (12-month cycle)
    const seasonalFactor = Math.sin((month - 1) * (2 * Math.PI / 12)) * historicalData.seasonality;
    
    // Trend component with scenario adjustment
    const trendGrowth = historicalData.trendGrowth * multiplier.growth;
    
    // Add controlled randomness for volatility
    const volatility = (Math.random() - 0.5) * historicalData.volatility * multiplier.volatility;
    
    // Economic cycle component (longer-term patterns)
    const cyclicalFactor = Math.cos((month - 1) * (2 * Math.PI / 60)) * (baseValue * 0.05);
    
    // Calculate predicted value
    const predicted = Math.max(0, 
      baseValue + 
      (trendGrowth * month) + 
      seasonalFactor + 
      volatility + 
      cyclicalFactor
    );
    
    // Confidence decreases over time and varies by scenario
    const baseConfidence = scenario === 'conservative' ? 0.95 : scenario === 'optimistic' ? 0.85 : 0.90;
    const timeDecay = Math.max(0.5, baseConfidence - (month * 0.03));
    const confidence = Math.round(timeDecay * 100) / 100;
    
    // Determine trend direction
    const previousValue = month === 1 ? baseValue : forecast[month - 2].predicted;
    const change = (predicted - previousValue) / previousValue;
    let trend: 'up' | 'down' | 'stable';
    
    if (change > 0.02) trend = 'up';
    else if (change < -0.02) trend = 'down';
    else trend = 'stable';
    
    // Influencing factors based on analysis
    const factors = generateFactors(type, month, scenario, trend);
    
    forecast.push({
      period: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      predicted: Math.round(predicted),
      confidence,
      trend,
      factors
    });
  }
  
  return forecast;
}

async function getHistoricalData(userId: string, type: string) {
  // Mock historical data - in production, fetch from database
  const baseValues = {
    cashflow: 2150,
    expenses: 3200,
    income: 4200
  };
  
  const trendGrowths = {
    cashflow: 45,    // Growing savings
    expenses: 25,    // Controlled expense growth
    income: 85       // Income growth
  };
  
  const seasonalities = {
    cashflow: 200,   // Holiday impact on net flow
    expenses: 350,   // Holiday spending spikes
    income: 150      // Bonus/seasonal income
  };
  
  const volatilities = {
    cashflow: 180,
    expenses: 220,
    income: 120
  };
  
  return {
    currentValue: baseValues[type as keyof typeof baseValues] || 2000,
    trendGrowth: trendGrowths[type as keyof typeof trendGrowths] || 30,
    seasonality: seasonalities[type as keyof typeof seasonalities] || 150,
    volatility: volatilities[type as keyof typeof volatilities] || 100
  };
}

function generateFactors(type: string, month: number, scenario: string, trend: string): string[] {
  const allFactors = {
    cashflow: [
      'historical_pattern',
      'income_growth_trend',
      'expense_optimization',
      'seasonal_adjustments',
      'goal_contributions',
      'market_conditions'
    ],
    expenses: [
      'inflation_impact',
      'lifestyle_changes',
      'seasonal_patterns',
      'subscription_growth',
      'price_volatility',
      'spending_habits'
    ],
    income: [
      'career_progression',
      'skill_development',
      'market_demand',
      'economic_indicators',
      'industry_trends',
      'performance_reviews'
    ]
  };
  
  const scenarioFactors = {
    conservative: ['risk_mitigation', 'stable_patterns'],
    optimistic: ['growth_opportunities', 'positive_trends'],
    pessimistic: ['economic_uncertainty', 'risk_factors']
  };
  
  const trendFactors = {
    up: ['growth_drivers', 'positive_momentum'],
    down: ['cost_pressures', 'market_headwinds'],
    stable: ['equilibrium_state', 'consistent_patterns']
  };
  
  // Select relevant factors
  const typeFactors = allFactors[type as keyof typeof allFactors] || allFactors.cashflow;
  const selectedFactors = typeFactors.slice(0, 3);
  
  // Add scenario and trend factors
  selectedFactors.push(...(scenarioFactors[scenario as keyof typeof scenarioFactors] || []));
  selectedFactors.push(...(trendFactors[trend as keyof typeof trendFactors] || []));
  
  return selectedFactors.slice(0, 4); // Limit to 4 factors for clarity
}

function calculateOverallConfidence(forecast: ForecastData[]): number {
  const avgConfidence = forecast.reduce((sum, item) => sum + item.confidence, 0) / forecast.length;
  return Math.round(avgConfidence * 100) / 100;
}