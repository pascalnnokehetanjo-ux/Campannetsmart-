export type Language = 'en' | 'fr' | 'ha';
export type ReportLanguage = 'en' | 'fr'; // Official report cards must be separately English or French

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
