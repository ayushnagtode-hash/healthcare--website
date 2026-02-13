
export interface PotentialCondition {
  name: string;
  likelihood: number; // 0 to 1
  reason: string;
}

export interface AnalysisResult {
  primaryCondition: string;
  correlationReport: PotentialCondition[];
  severity: 'Low' | 'Moderate' | 'High' | 'Emergency';
  recommendations: string[];
  disclaimer: string;
  summary: string;
}

export interface SymptomReport {
  id: string;
  timestamp: number;
  symptoms: string;
  imageUrl?: string;
  analysis?: AnalysisResult;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  NEW_SCAN = 'NEW_SCAN',
  HISTORY = 'HISTORY',
  DETAILS = 'DETAILS'
}
