import { CompetenceConfig, ClassConfig, Student } from '../types';

export const OFFICIAL_COMPETENCES_2018: CompetenceConfig[] = [
  {
    id: 1,
    titleEn: 'Competence 1: Communicate in English, French and one National language',
    titleFr: 'Compétence 1: Communiquer en anglais, en français et dans une langue nationale',
    subjects: [
      { code: '1A', nameEn: 'Communicate in English', nameFr: 'Communication en Anglais', maxOral: 5, maxWritten: 10, maxPractical: 3, maxAttitude: 2 },
      { code: '1B', nameEn: 'Communicate in French', nameFr: 'Communication en Français', maxOral: 5, maxWritten: 10, maxPractical: 3, maxAttitude: 2 },
      { code: '1C', nameEn: 'Communicate in one National language', nameFr: 'Communication en Langue Nationale', maxOral: 6, maxWritten: 8, maxPractical: 4, maxAttitude: 2 }
    ]
  },
  {
    id: 2,
    titleEn: 'Competence 2: Use Basic notions in Mathematics, Science and Technology',
    titleFr: 'Compétence 2: Utiliser les notions de base en Mathématiques, Sciences et Technologie',
    subjects: [
      { code: '2A', nameEn: 'Use Basic notions in Mathematics', nameFr: 'Notions de base en Mathématiques', maxOral: 5, maxWritten: 10, maxPractical: 3, maxAttitude: 2 },
      { code: '2B', nameEn: 'Use Basic notions in Science and Technology', nameFr: 'Notions de base en Sciences et Technologie', maxOral: 5, maxWritten: 10, maxPractical: 3, maxAttitude: 2 }
    ]
  },
  {
    id: 3,
    titleEn: 'Competence 3: Practice Social and Citizenship Values',
    titleFr: 'Compétence 3: Pratiquer les valeurs sociales et citoyennes',
    subjects: [
      { code: '3A', nameEn: 'Practice Social Values', nameFr: 'Pratique des Valeurs Sociales', maxOral: 5, maxWritten: 10, maxPractical: 3, maxAttitude: 2 },
      { code: '3B', nameEn: 'Practice Citizenship Values', nameFr: 'Pratique des Valeurs Citoyennes', maxOral: 5, maxWritten: 10, maxPractical: 3, maxAttitude: 2 }
    ]
  },
  {
    id: 4,
    titleEn: 'Competence 4: Demonstrate autonomy, spirit of initiative, creativity and Entrepreneurship Values',
    titleFr: 'Compétence 4: Démontrer de l\'autonomie, de l\'esprit d\'initiative, de la créativité et de l\'entrepreneuriat',
    subjects: [
      { code: '4A', nameEn: 'Vocational Studies & Practical Skills', nameFr: 'Études Professionnelles & Compétences Pratiques', maxOral: 4, maxWritten: 8, maxPractical: 6, maxAttitude: 2 },
      { code: '4B', nameEn: 'Autonomy, Initiative & Creativity', nameFr: 'Autonomie, Initiative & Créativité', maxOral: 5, maxWritten: 8, maxPractical: 5, maxAttitude: 2 }
    ]
  },
  {
    id: 5,
    titleEn: 'Competence 5: Use Basic concepts and tools in Information and Communication Technologies',
    titleFr: 'Compétence 5: Utiliser les concepts et outils de base des Technologies de l\'Information et de la Communication',
    subjects: [
      { code: '5', nameEn: 'Information and Communication Technology (ICT)', nameFr: 'Technologies de l\'Information et de la Communication (TIC)', maxOral: 5, maxWritten: 10, maxPractical: 3, maxAttitude: 2 }
    ]
  },
  {
    id: 6,
    titleEn: 'Competence 6: Practice Physical, Sports, and Artistic activities',
    titleFr: 'Compétence 6: Pratiquer des activités physiques, sportives et artistiques',
    subjects: [
      { code: '6A1', nameEn: 'Physical and Sports activities (Non-challenged)', nameFr: 'Activités Physiques et Sportives (Valides)', maxOral: 4, maxWritten: 4, maxPractical: 10, maxAttitude: 2 },
      { code: '6A2', nameEn: 'Physical and Sports activities (Challenged)', nameFr: 'Activités Physiques et Sportives (Adaptées)', maxOral: 4, maxWritten: 4, maxPractical: 10, maxAttitude: 2 },
      { code: '6B', nameEn: 'Artistic activities', nameFr: 'Activités Artistiques', maxOral: 4, maxWritten: 6, maxPractical: 8, maxAttitude: 2 }
    ]
  }
];

export const DEFAULT_CLASS_CONFIG: ClassConfig = {
  className: 'Primary 5 Bilingual / CM1 Bilingue',
  academicYear: '2025 - 2026',
  schoolNameEn: 'Bilingual Excellence Primary School Yaoundé',
  schoolNameFr: 'École Primaire Bilingue d\'Excellence Yaoundé',
  teacherName: 'Mr. Nnoke Etanjo & Mme. Fouda Marie',
  headTeacherName: 'Dr. John Achu',
  terms: [
    { termName: 'Term 1 / Trimestre 1', months: ['September / Septembre', 'October / Octobre', 'November / Novembre'] },
    { termName: 'Term 2 / Trimestre 2', months: ['December / Décembre', 'January / Janvier', 'February / Février'] },
    { termName: 'Term 3 / Trimestre 3', months: ['March / Mars', 'April / Avril', 'May / Mai'] }
  ]
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'ST001',
    name: 'Amina Bello Njoya',
    gender: 'F',
    dob: '14/05/2015',
    scores: {
      'Term 1 / Trimestre 1': {
        'September / Septembre': {
          '1A': { oral: 4, written: 9, practical: 2, attitude: 2 },
          '1B': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '1C': { oral: 5, written: 7, practical: 3, attitude: 2 },
          '2A': { oral: 4, written: 9, practical: 3, attitude: 2 },
          '2B': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '3A': { oral: 4, written: 9, practical: 2, attitude: 2 },
          '3B': { oral: 5, written: 9, practical: 3, attitude: 2 },
          '4A': { oral: 3, written: 7, practical: 5, attitude: 2 },
          '4B': { oral: 4, written: 7, practical: 4, attitude: 2 },
          '5': { oral: 4, written: 9, practical: 3, attitude: 2 },
          '6A1': { oral: 3, written: 3, practical: 9, attitude: 2 },
          '6B': { oral: 3, written: 5, practical: 7, attitude: 2 }
        },
        'October / Octobre': {
          '1A': { oral: 5, written: 9, practical: 3, attitude: 2 },
          '1B': { oral: 4, written: 9, practical: 2, attitude: 2 },
          '1C': { oral: 5, written: 7, practical: 3, attitude: 2 },
          '2A': { oral: 5, written: 10, practical: 3, attitude: 2 },
          '2B': { oral: 4, written: 9, practical: 3, attitude: 2 },
          '3A': { oral: 5, written: 9, practical: 3, attitude: 2 },
          '3B': { oral: 5, written: 10, practical: 3, attitude: 2 },
          '4A': { oral: 4, written: 7, practical: 5, attitude: 2 },
          '4B': { oral: 4, written: 8, practical: 4, attitude: 2 },
          '5': { oral: 5, written: 9, practical: 3, attitude: 2 },
          '6A1': { oral: 4, written: 3, practical: 9, attitude: 2 },
          '6B': { oral: 4, written: 5, practical: 7, attitude: 2 }
        },
        'November / Novembre': {
          '1A': { oral: 5, written: 10, practical: 3, attitude: 2 },
          '1B': { oral: 5, written: 9, practical: 3, attitude: 2 },
          '1C': { oral: 5, written: 8, practical: 3, attitude: 2 },
          '2A': { oral: 5, written: 10, practical: 3, attitude: 2 },
          '2B': { oral: 5, written: 9, practical: 3, attitude: 2 },
          '3A': { oral: 5, written: 10, practical: 3, attitude: 2 },
          '3B': { oral: 5, written: 10, practical: 3, attitude: 2 },
          '4A': { oral: 4, written: 8, practical: 5, attitude: 2 },
          '4B': { oral: 4, written: 8, practical: 4, attitude: 2 },
          '5': { oral: 5, written: 10, practical: 3, attitude: 2 },
          '6A1': { oral: 4, written: 4, practical: 9, attitude: 2 },
          '6B': { oral: 4, written: 6, practical: 7, attitude: 2 }
        }
      }
    }
  },
  {
    id: 'ST002',
    name: 'Jean-Pierre Kamga',
    gender: 'M',
    dob: '22/11/2014',
    scores: {
      'Term 1 / Trimestre 1': {
        'September / Septembre': {
          '1A': { oral: 3, written: 7, practical: 2, attitude: 1 },
          '1B': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '1C': { oral: 4, written: 6, practical: 2, attitude: 1 },
          '2A': { oral: 3, written: 6, practical: 2, attitude: 1 },
          '2B': { oral: 3, written: 7, practical: 2, attitude: 1 },
          '3A': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '3B': { oral: 4, written: 7, practical: 2, attitude: 1 },
          '4A': { oral: 3, written: 6, practical: 4, attitude: 1 },
          '4B': { oral: 3, written: 6, practical: 3, attitude: 1 },
          '5': { oral: 3, written: 7, practical: 2, attitude: 1 },
          '6A1': { oral: 3, written: 3, practical: 8, attitude: 2 },
          '6B': { oral: 3, written: 4, practical: 6, attitude: 1 }
        },
        'October / Octobre': {
          '1A': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '1B': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '1C': { oral: 4, written: 7, practical: 2, attitude: 2 },
          '2A': { oral: 4, written: 7, practical: 2, attitude: 2 },
          '2B': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '3A': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '3B': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '4A': { oral: 3, written: 6, practical: 4, attitude: 2 },
          '4B': { oral: 3, written: 7, practical: 3, attitude: 2 },
          '5': { oral: 4, written: 8, practical: 2, attitude: 2 },
          '6A1': { oral: 3, written: 3, practical: 8, attitude: 2 },
          '6B': { oral: 3, written: 5, practical: 6, attitude: 2 }
        },
        'November / Novembre': {
          '1A': { oral: 4, written: 9, practical: 2, attitude: 2 },
          '1B': { oral: 4, written: 9, practical: 2, attitude: 2 },
          '1C': { oral: 4, written: 7, practical: 3, attitude: 2 },
          '2A': { oral: 4, written: 8, practical: 3, attitude: 2 },
          '2B': { oral: 4, written: 8, practical: 3, attitude: 2 },
          '3A': { oral: 4, written: 9, practical: 3, attitude: 2 },
          '3B': { oral: 4, written: 9, practical: 3, attitude: 2 },
          '4A': { oral: 4, written: 7, practical: 4, attitude: 2 },
          '4B': { oral: 4, written: 7, practical: 4, attitude: 2 },
          '5': { oral: 4, written: 9, practical: 3, attitude: 2 },
          '6A1': { oral: 4, written: 3, practical: 9, attitude: 2 },
          '6B': { oral: 3, written: 5, practical: 7, attitude: 2 }
        }
      }
    }
  }
];
