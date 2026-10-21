import { CompetenceConfig, EvaluationScores, Student } from '../types';
import { OFFICIAL_COMPETENCES_2018 } from '../data/curriculum';

export function getSubjectMaxTotal(subject: { maxOral: number; maxWritten: number; maxPractical: number; maxAttitude: number }): number {
  return subject.maxOral + subject.maxWritten + subject.maxPractical + subject.maxAttitude;
}

export function getAllCompetencesMaxTotal(competences: CompetenceConfig[] = OFFICIAL_COMPETENCES_2018): number {
  let total = 0;
  for (const comp of competences) {
    for (const sub of comp.subjects) {
      total += getSubjectMaxTotal(sub);
    }
  }
  return total;
}

export function getSubjectObtainedTotal(scores?: EvaluationScores): number {
  if (!scores) return 0;
  return (scores.oral || 0) + (scores.written || 0) + (scores.practical || 0) + (scores.attitude || 0);
}

export function getAppreciation(markOutOf20: number, lang: 'en' | 'fr'): { text: string; grade: string; color: string } {
  if (markOutOf20 >= 18) {
    return {
      text: lang === 'en' ? 'Expert (Ept)' : 'Expert (Ept)',
      grade: 'A+',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
    };
  } else if (markOutOf20 >= 15) {
    return {
      text: lang === 'en' ? 'Competences Acquired (CA)' : 'Compétences Acquises (CA)',
      grade: 'A',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
    };
  } else if (markOutOf20 >= 11) {
    return {
      text: lang === 'en' ? 'Competences in the Process of Acquisition (CPA)' : 'Compétences en Voie d\'Acquisition (CPA)',
      grade: 'B',
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
    };
  } else {
    return {
      text: lang === 'en' ? 'Competences Not Acquired (CNA)' : 'Compétences Non Acquises (CNA)',
      grade: 'C',
      color: 'text-red-600 bg-red-50 dark:bg-red-950/30'
    };
  }
}

/**
 * Calculates student's average per month:
 * (20 * sum of scores obtained by student per subject/sub competences) / sum of maximum marks of all the 6 competences
 */
export function calculateMonthlyAverage(studentScoresForMonth: Record<string, EvaluationScores>, competences: CompetenceConfig[] = OFFICIAL_COMPETENCES_2018): number {
  let totalObtained = 0;
  for (const comp of competences) {
    for (const sub of comp.subjects) {
      const subScores = studentScoresForMonth[sub.code];
      totalObtained += getSubjectObtainedTotal(subScores);
    }
  }
  const maxTotalAll = getAllCompetencesMaxTotal(competences);
  if (maxTotalAll === 0) return 0;
  const avg = (20 * totalObtained) / maxTotalAll;
  return Number(Math.min(20, Math.max(0, avg)).toFixed(2));
}

export function calculateTermAverage(student: Student, termName: string, months: string[]): number {
  const termScores = student.scores[termName];
  if (!termScores || months.length === 0) return 0;

  let sumAverages = 0;
  let count = 0;
  for (const month of months) {
    const monthScores = termScores[month] || {};
    const avg = calculateMonthlyAverage(monthScores);
    sumAverages += avg;
    count++;
  }
  if (count === 0) return 0;
  return Number((sumAverages / count).toFixed(2));
}

export function calculateAnnualAverage(student: Student, termNames: string[], classConfigTerms: { termName: string; months: string[] }[]): number {
  let sumTermAverages = 0;
  let termCount = 0;
  for (const termInfo of classConfigTerms) {
    const avg = calculateTermAverage(student, termInfo.termName, termInfo.months);
    sumTermAverages += avg;
    termCount++;
  }
  if (termCount === 0) return 0;
  return Number((sumTermAverages / 3).toFixed(2)); // Always divided by 3 terms in the academic year
}
