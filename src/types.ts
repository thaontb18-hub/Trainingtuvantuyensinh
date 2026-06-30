export type PersonaRole = 'parent' | 'student';

export type DifficultyLevel = 'easy' | 'hard';

export interface AdmissionDocument {
  id: string;
  title: string;
  content: string;
  isTemplate?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user'; // bot is Gemini roleplay, user is consultant
  text: string;
  timestamp: string;
}

export interface SimulationConfig {
  role: PersonaRole;
  personality: string; // 'khó tính', 'cáu gắt', 'rụt rè', 'thực dụng', 'kiêu căng', 'tò mò'
  difficulty: DifficultyLevel;
  customPersonality?: string;
}

export interface ChatAnalysisTurn {
  turnIndex: number;
  question: string;
  answer: string;
  accuracyScore: number;
  persuasivenessScore: number;
  attitudeScore: number;
  errorsOrOmissions: string;
  modelAnswer: string;
  handlingTip: string;
}

export interface EvaluationReport {
  overallScore: number;
  metrics: {
    accuracy: number;       // Độ chính xác thông tin
    persuasiveness: number; // Độ thuyết phục
    attitude: number;       // Thái độ ứng xử của tư vấn viên
  };
  generalFeedback: string;
  analysis: ChatAnalysisTurn[];
}
