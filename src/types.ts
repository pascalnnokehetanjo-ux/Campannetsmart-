export type Language = 'en' | 'fr' | 'ha';
export type ReportLanguage = 'en' | 'fr'; // Official report cards must be separately English or French

export type CellReviewStatus = 'pending' | 'accepted' | 'corrected' | 'rejected';

export interface EvaluatedCell {
  value: number;
  max: number;
  confidence: number;
  rawOcrText: string;
  status: CellReviewStatus;
  correctedBy?: string;
  previousValue?: number;
  auditTrail: {
    timestamp: string;
    action: 'extracted' | 'accepted' | 'corrected' | 'rejected';
    teacher: string;
    details: string;
  }[];
}

export interface StudentSubjectCells {
  oral: EvaluatedCell;
  written: EvaluatedCell;
  practical: EvaluatedCell;
  attitude: EvaluatedCell;
}

export interface ExtractedStudentRecord {
  id: string;
  name: string;
  gender: 'M' | 'F';
  dob: string;
  confidence: number;
  scores: Record<string, StudentSubjectCells>; // subjectCode -> SubjectCells
}

export interface MarksheetBatch {
  batchId: string;
  timestamp: string;
  mergedImageUrl: string;
  term: string;
  month: string;
  isLocked: boolean;
  lockedAt?: string;
  unlockedBy?: string;
  unlockReason?: string;
  students: ExtractedStudentRecord[];
}

export interface EvaluationScores {
  oral: number;
  written: number;
  practical: number;
  attitude: number;
}

export interface SubjectConfig {
  code: string;
  nameEn: string;
  nameFr: string;
  maxOral: number;
  maxWritten: number;
  maxPractical: number;
  maxAttitude: number;
}

export interface CompetenceConfig {
  id: number;
  titleEn: string;
  titleFr: string;
  subjects: SubjectConfig[];
}

export interface Student {
  id: string;
  name: string;
  gender: 'M' | 'F';
  dob: string;
  photoUrl?: string;
  // scores[term][month][subjectCode] = EvaluationScores
  scores: Record<string, Record<string, Record<string, EvaluationScores>>>;
}

export interface ClassConfig {
  className: string;
  academicYear: string;
  schoolNameEn: string;
  schoolNameFr: string;
  teacherName: string;
  headTeacherName: string;
  terms: {
    termName: string;
    months: string[];
  }[];
}
