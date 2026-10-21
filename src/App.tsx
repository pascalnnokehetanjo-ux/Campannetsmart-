import React, { useState } from 'react';
import { 
  Language, ReportLanguage, Student, ClassConfig, EvaluationScores,
  MarksheetBatch, ExtractedStudentRecord, CellReviewStatus
} from './types';
import { OFFICIAL_COMPETENCES_2018, DEFAULT_CLASS_CONFIG, INITIAL_STUDENTS } from './data/curriculum';
import { 
  calculateMonthlyAverage, calculateTermAverage, calculateAnnualAverage, 
  getAppreciation, getSubjectMaxTotal, getSubjectObtainedTotal, getAllCompetencesMaxTotal 
} from './utils/calculator';
import { 
  BookOpen, Calculator, FileText, Upload, Users, Award, Globe, Sun, Moon, 
  CheckCircle2, ArrowRight, Printer, Sparkles, AlertCircle, HelpCircle, ShieldCheck,
  MoveUp, MoveDown, Trash2, Layers, Image as ImageIcon, Check, X, Edit3, Lock, Unlock, History, AlertTriangle,
  RotateCw, RefreshCw, RefreshCcw, Eye, BarChart3, TrendingUp, Download, Filter, Target,
  GraduationCap, MessageSquare, Send, CheckSquare
} from 'lucide-react';

const UI_TEXT = {
  en: {
    appName: 'Campannetsmart',
    tagline: 'Official 2018 Curriculum Bilingual Marksheet OCR Calculation Engine & Report Card Generator',
    heroHeading: 'Empowering Bilingual Teachers with Deterministic Marksheet Intelligence',
    heroSub: 'Pilot School Readiness Hub: Onboarding wizard, teacher training guide, OCR accuracy metrics, feedback form, and admin dashboard.',
    ctaUpload: 'Pilot Readiness Hub',
    ctaExplore: 'Explore Report Generator',
    tabs: {
      dashboard: 'Overview & Demo',
      pilotHub: 'Pilot Hub & Onboarding',
      analytics: 'Analytics & Decisions',
      ocrEngine: 'Quality Control & Merger',
      ocrReview: 'OCR Review & Validation',
      roster: 'Roster & Marks',
      monthly: 'Monthly Reports',
      termly: 'Termly Reports',
      annual: 'Annual Reports',
      curriculum: '2018 Curriculum'
    },
    featuresTitle: 'Why Teachers & Schools Choose Campannetsmart',
    featuresSub: 'Engineered specifically for bilingual primary and secondary education systems adhering strictly to official ministerial evaluation standards.',
    footerText: 'Campannetsmart Engine • Built strictly with deterministic mathematical formulas. AI never determines student marks.',
    printReport: 'Print Official Report Card',
    selectStudent: 'Select Student',
    selectTerm: 'Select Term',
    selectMonth: 'Select Month',
    reportLang: 'Report Language Version',
  },
  fr: {
    appName: 'Campannetsmart',
    tagline: 'Moteur de Calcul OCR de Notes Bilingue & Générateur de Bulletins (Programme Officiel 2018)',
    heroHeading: 'Révolutionnez l\'Évaluation Scolaire Bilingue avec une Précision Mathématique',
    heroSub: 'Hub de préparation au pilotage : Assistant d\'intégration, guide de formation, métriques OCR, formulaire de feedback et tableau de bord admin.',
    ctaUpload: 'Hub Pilote & Intégration',
    ctaExplore: 'Explorer les Bulletins',
    tabs: {
      dashboard: 'Accueil & Démo',
      pilotHub: 'Hub Pilote & Intégration',
      analytics: 'Analyses & Décisions',
      ocrEngine: 'Contrôle Qualité & Fusion',
      ocrReview: 'Révision OCR & Validation',
      roster: 'Élèves & Notes',
      monthly: 'Bulletins Mensuels',
      termly: 'Bulletins Trimestriels',
      annual: 'Bulletins Annuels',
      curriculum: 'Curriculum 2018'
    },
    featuresTitle: 'Pourquoi les Enseignants et Écoles Choisissent Campannetsmart',
    featuresSub: 'Conçu spécifiquement pour l\'enseignement bilingue primaire et secondaire selon les normes ministérielles officielles 2018.',
    footerText: 'Moteur Campannetsmart • Calculs mathématiques strictement déterministes. L\'IA ne détermine jamais les notes.',
    printReport: 'Imprimer le Bulletin Officiel',
    selectStudent: 'Sélectionner l\'Élève',
    selectTerm: 'Sélectionner le Trimestre',
    selectMonth: 'Sélectionner le Mois',
    reportLang: 'Version Linguistique du Bulletin',
  },
  ha: {
    appName: 'Campannetsmart',
    tagline: 'Injin Lissafin Takardun Sakamako da Kera Rahoton Dalibai ta Harsunan Biyu',
    heroHeading: 'Karfin Koyo da Lissafi Na Musamman Ga Malamai da Makarantu',
    heroSub: 'Shirye-shiryen makaranta don gwaji: jagorar koyarwa, kididdigar OCR, da fom din ra\'ayi.',
    ctaUpload: 'Hub Din Gwaji',
    ctaExplore: 'Bincika Kera Rahoto',
    tabs: {
      dashboard: 'Bita & Gwaji',
      pilotHub: 'Hub Din Gwaji',
      analytics: 'Bincike & Shawarwari',
      ocrEngine: 'Inganci & Haɗawa',
      ocrReview: 'Bita da Tabbatarwa',
      roster: 'Dalibai da Maki',
      monthly: 'Rahoton Wata',
      termly: 'Rahoton Zango',
      annual: 'Rahoton Shekara',
      curriculum: 'Tsarin 2018'
    },
    featuresTitle: 'Me Yasa Malamai Ke Son Campannetsmart',
    featuresSub: 'An tsara shi musamman don tsarin karatun bilingual da ke bin ka\'idojin gwamnati na hukuma.',
    footerText: 'Campannetsmart Engine • Lissafi ne mai inganci ba tare da kuskure ba.',
    printReport: 'Bugawa Rahoton Aji',
    selectStudent: 'Zabi Dalibi',
    selectTerm: 'Zabi Zango',
    selectMonth: 'Zabi Wata',
    reportLang: 'Harshen Rahoto',
  }
};

interface MarksheetPart {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number;
}

type ProgressStep = 'idle' | 'uploading' | 'merging' | 'quality_check' | 'sending' | 'recognizing' | 'reviewing';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [classConfig, setClassConfig] = useState<ClassConfig>(DEFAULT_CLASS_CONFIG);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(INITIAL_STUDENTS[0].id);
  const [selectedTerm, setSelectedTerm] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].termName);
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].months[0]);
  const [reportLang, setReportLang] = useState<ReportLanguage>('en');

  // Pilot Hub Sub-tabs
  const [pilotSubTab, setPilotSubTab] = useState<'dashboard' | 'wizard' | 'training' | 'feedback'>('dashboard');

  // Onboarding Wizard Form State
  const [wizardSchoolName, setWizardSchoolName] = useState('École Bilingue Pilote Yaoundé');
  const [wizardSubdivision, setWizardSubdivision] = useState('Mfoundi / Yaoundé 1');
  const [wizardTeacherEmail, setWizardTeacherEmail] = useState('teacher.pilot@campannetsmart.cm');
  const [wizardSaved, setWizardSaved] = useState(false);

  // Pilot Feedback Form State
  const [feedbackCategory, setFeedbackCategory] = useState('ocr_accuracy');
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Multi-part marksheet quality control state
  const [marksheetParts, setMarksheetParts] = useState<MarksheetPart[]>([]);
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [mergedPreviewUrl, setMergedPreviewUrl] = useState<string | null>(null);

  // Active OCR Review Batch State
  const [activeBatch, setActiveBatch] = useState<MarksheetBatch | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState<boolean>(false);
  const [unlockReason, setUnlockReason] = useState<string>('');

  const t = UI_TEXT[lang];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAddMarksheetParts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProgressStep('uploading');
    const newParts: MarksheetPart[] = Array.from(files).map((file, idx) => ({
      id: `part_${Date.now()}_${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
      rotation: 0
    }));

    setTimeout(() => {
      setMarksheetParts(prev => [...prev, ...newParts]);
      setMergedPreviewUrl(null);
      setQualityWarnings([]);
      setProgressStep('idle');
    }, 400);
  };

  const movePartIndex = (index: number, direction: 'up' | 'down') => {
    const newParts = [...marksheetParts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newParts.length) return;
    const temp = newParts[index];
    newParts[index] = newParts[targetIndex];
    newParts[targetIndex] = temp;
    setMarksheetParts(newParts);
    setMergedPreviewUrl(null);
  };

  const removePart = (id: string) => {
    setMarksheetParts(prev => prev.filter(p => p.id !== id));
    setMergedPreviewUrl(null);
  };

  const rotatePart = (id: string) => {
    setMarksheetParts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, rotation: (p.rotation + 90) % 360 };
    }));
    setMergedPreviewUrl(null);
  };

  const replacePartFile = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMarksheetParts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, file, previewUrl: URL.createObjectURL(file), rotation: 0 };
    }));
    setMergedPreviewUrl(null);
  };

  const cancelAndReset = () => {
    setMarksheetParts([]);
    setMergedPreviewUrl(null);
    setQualityWarnings([]);
    setOcrError(null);
    setOcrSuccessMsg(null);
    setProgressStep('idle');
  };

  const runQualityChecksAndMerge = async () => {
    if (marksheetParts.length === 0) {
      setOcrError(lang === 'fr' ? 'Veuillez télécharger au moins une partie de note.' : 'Please upload at least one marksheet photo part.');
      return;
    }

    setOcrError(null);
    setOcrSuccessMsg(null);
    setProgressStep('merging');

    try {
      const loadedImages = await Promise.all(marksheetParts.map(part => {
        return new Promise<{ img: HTMLImageElement; rotation: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ img, rotation: part.rotation });
          img.onerror = reject;
          img.src = part.previewUrl;
        });
      }));

      setProgressStep('quality_check');

      const processedParts = loadedImages.map(({ img, rotation }) => {
        const isRotated = rotation === 90 || rotation === 270;
        const w = isRotated ? img.naturalHeight : img.naturalWidth;
        const h = isRotated ? img.naturalWidth : img.naturalHeight;
        return { img, rotation, w, h };
      });

      const maxWidth = Math.max(...processedParts.map(p => p.w));
      const totalHeight = processedParts.reduce((sum, p) => sum + p.h, 0);

      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not initialize canvas context.');

      let currentY = 0;
      for (const p of processedParts) {
        ctx.save();
        ctx.translate(0, currentY);
        if (p.rotation === 90) {
          ctx.translate(p.w, 0);
          ctx.rotate(Math.PI / 2);
        } else if (p.rotation === 180) {
          ctx.translate(p.w, p.h);
          ctx.rotate(Math.PI);
        } else if (p.rotation === 270) {
          ctx.translate(0, p.h);
          ctx.rotate((Math.PI * 3) / 2);
        }
        ctx.drawImage(p.img, 0, 0);
        ctx.restore();
        currentY += p.h;
      }

      const mergedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setMergedPreviewUrl(mergedDataUrl);

      const warnings: string[] = [];
      if (maxWidth < 800 || totalHeight < 1000) {
        warnings.push(lang === 'fr' ? 'Image de faible résolution. La précision OCR peut diminuer.' : 'Image resolution is low. OCR accuracy may reduce.');
      }

      setQualityWarnings(warnings);
      setProgressStep('idle');
      setOcrSuccessMsg(lang === 'fr' ? 'Fusion réussie ! Veuillez vérifier l\'aperçu ci-dessous avant l\'OCR.' : 'Successfully merged parts! Please review preview below before OCR.');
    } catch (err: any) {
      setOcrError(err.message || 'Failed to merge marksheet photo parts');
      setProgressStep('idle');
    }
  };

  const sendMergedImageToOcr = async () => {
    if (!mergedPreviewUrl) return;

    setProgressStep('sending');
    setOcrError(null);
    setOcrSuccessMsg(null);

    try {
      setProgressStep('recognizing');
      const base64String = mergedPreviewUrl.split(',')[1];

      const res = await fetch('/api/ocr-marksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String, mimeType: 'image/jpeg' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OCR extraction failed');

      if (data.success && data.data && data.data.students) {
        const batch: MarksheetBatch = {
          batchId: data.data.batchId || `BATCH_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          mergedImageUrl: mergedPreviewUrl,
          term: selectedTerm,
          month: selectedMonth,
          isLocked: false,
          students: data.data.students.map((st: any) => ({
            id: st.studentId,
            name: st.studentName,
            gender: 'M',
            dob: '01/01/2015',
            confidence: st.confidence || 0.92,
            scores: st.scores
          }))
        };

        setActiveBatch(batch);
        setProgressStep('reviewing');
        setOcrSuccessMsg(lang === 'fr' ? 'Extraction OCR réussie ! Redirection vers la révision.' : 'OCR extraction successful! Redirecting to review screen.');
        setTimeout(() => setActiveTab('ocrReview'), 600);
      } else {
        throw new Error('Incomplete data returned from OCR engine.');
      }
    } catch (err: any) {
      setOcrError(err.message || 'OCR recognition failed. Please check image quality and retry.');
      setProgressStep('idle');
    }
  };

  const updateCellStatus = (studentId: string, subjectCode: string, evalType: 'oral' | 'written' | 'practical' | 'attitude', status: CellReviewStatus, newVal?: number) => {
    if (!activeBatch || activeBatch.isLocked) return;

    setActiveBatch(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map(st => {
          if (st.id !== studentId) return st;
          const cell = st.scores[subjectCode]?.[evalType];
          if (!cell) return st;

          const previousVal = cell.value;
          const finalVal = newVal !== undefined ? newVal : cell.value;

          const updatedCell = {
            ...cell,
            value: finalVal,
            status,
            previousValue: previousVal !== finalVal ? previousVal : cell.previousValue,
            correctedBy: status === 'corrected' ? classConfig.teacherName : cell.correctedBy,
            auditTrail: [
              ...cell.auditTrail,
              {
                timestamp: new Date().toLocaleTimeString(),
                action: status === 'accepted' ? 'accepted' : status === 'corrected' ? 'corrected' : 'rejected',
                teacher: classConfig.teacherName,
                details: `Mark set to ${finalVal}/${cell.max} (Status: ${status})${previousVal !== finalVal ? ` [Changed from ${previousVal}]` : ''}`
              }
            ]
          };

          return {
            ...st,
            scores: {
              ...st.scores,
              [subjectCode]: {
                ...st.scores[subjectCode],
                [evalType]: updatedCell
              }
            }
          };
        })
      };
    });
  };

  const confirmAndTransferMarks = () => {
    if (!activeBatch) return;

    let hasUnresolved = false;
    activeBatch.students.forEach(st => {
      Object.keys(st.scores).forEach(subCode => {
        const subCells = st.scores[subCode];
        (['oral', 'written', 'practical', 'attitude'] as const).forEach(et => {
          const cell = subCells[et];
          if (cell && (cell.status === 'pending' || cell.status === 'rejected')) {
            hasUnresolved = true;
          }
        });
      });
    });

    if (hasUnresolved) {
      alert(lang === 'fr' ? 'Veuillez accepter ou corriger toutes les cellules avant de confirmer.' : 'Please accept or correct all extracted cells before confirming and transferring marks.');
      return;
    }

    setStudents(prev => prev.map(existingStudent => {
      const matchedExtracted = activeBatch.students.find(es => es.id === existingStudent.id);
      if (!matchedExtracted) return existingStudent;

      const studentScores = JSON.parse(JSON.stringify(existingStudent.scores));
      if (!studentScores[activeBatch.term]) studentScores[activeBatch.term] = {};
      if (!studentScores[activeBatch.term][activeBatch.month]) studentScores[activeBatch.term][activeBatch.month] = {};

      Object.keys(matchedExtracted.scores).forEach(subCode => {
        const cells = matchedExtracted.scores[subCode];
        studentScores[activeBatch.term][activeBatch.month][subCode] = {
          oral: cells.oral.status === 'accepted' || cells.oral.status === 'corrected' ? cells.oral.value : 0,
          written: cells.written.status === 'accepted' || cells.written.status === 'corrected' ? cells.written.value : 0,
          practical: cells.practical.status === 'accepted' || cells.practical.status === 'corrected' ? cells.practical.value : 0,
          attitude: cells.attitude.status === 'accepted' || cells.attitude.status === 'corrected' ? cells.attitude.value : 0
        };
      });

      return {
        ...existingStudent,
        scores: studentScores
      };
    }));

    activeBatch.students.forEach(extSt => {
      if (!students.some(s => s.id === extSt.id)) {
        const newStudentScores: any = {
          [activeBatch.term]: {
            [activeBatch.month]: {}
          }
        };
        Object.keys(extSt.scores).forEach(subCode => {
          const cells = extSt.scores[subCode];
          newStudentScores[activeBatch.term][activeBatch.month][subCode] = {
            oral: cells.oral.value,
            written: cells.written.value,
            practical: cells.practical.value,
            attitude: cells.attitude.value
          };
        });

        setStudents(prev => [
          ...prev,
          {
            id: extSt.id,
            name: extSt.name,
            gender: extSt.gender,
            dob: extSt.dob,
            scores: newStudentScores
          }
        ]);
      }
    });

    setActiveBatch(prev => prev ? { ...prev, isLocked: true, lockedAt: new Date().toLocaleString() } : null);
    alert(lang === 'fr' ? 'Notes validées, verrouillées et transférées avec succès vers les bulletins officiels !' : 'Marks successfully validated, locked, and transferred to official monthly report cards with full audit trail preserved.');
    setActiveTab('monthly');
  };

  const unlockBatchWithReason = () => {
    if (!activeBatch || !unlockReason.trim()) {
      alert(lang === 'fr' ? 'Veuillez fournir un motif de déverrouillage.' : 'Please provide a valid reason for unlocking this batch.');
      return;
    }
    setActiveBatch(prev => prev ? {
      ...prev,
      isLocked: false,
      unlockedBy: classConfig.teacherName,
      unlockReason: unlockReason.trim()
    } : null);
    setUnlockReason('');
    setUnlockModalOpen(false);
  };

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-950'}`}>
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              C
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                Pilot Readiness Hub
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              <Globe className="w-4 h-4 text-slate-500 ml-1" />
              {(['en', 'fr', 'ha'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    lang === l ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 py-2 border-t border-slate-100 dark:border-slate-700/50">
          {[
            { id: 'dashboard', label: t.tabs.dashboard, icon: BookOpen },
            { id: 'pilotHub', label: t.tabs.pilotHub, icon: GraduationCap },
            { id: 'analytics', label: t.tabs.analytics, icon: BarChart3 },
            { id: 'ocrEngine', label: t.tabs.ocrEngine, icon: Layers },
            { id: 'ocrReview', label: t.tabs.ocrReview, icon: CheckCircle2 },
            { id: 'roster', label: t.tabs.roster, icon: Users },
            { id: 'monthly', label: t.tabs.monthly, icon: FileText },
            { id: 'termly', label: t.tabs.termly, icon: Calculator },
            { id: 'annual', label: t.tabs.annual, icon: Award },
            { id: 'curriculum', label: t.tabs.curriculum, icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-School Pilot Readiness</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {t.heroHeading}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.heroSub}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('pilotHub')}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>{t.ctaUpload}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              <div className="custom-card rounded-2xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                        PR
                      </div>
                      <span className="font-bold text-sm">Pilot Readiness Active</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                      v2.9 Ready
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Onboarding & Training Guide</div>
                        <div className="text-lg font-bold text-emerald-400">Bilingual English & French</div>
                      </div>
                      <GraduationCap className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">OCR Accuracy Tracking</div>
                        <div className="text-lg font-bold text-amber-400">Correction & Acceptance Metrics</div>
                      </div>
                      <BarChart3 className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PILOT HUB & ONBOARDING */}
        {activeTab === 'pilotHub' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Hub Pilote & Intégration' : 'Pilot School Hub & Onboarding'}</span>
                </h2>
                <p className="text-sm text-slate-500">
                  {lang === 'fr' 
                    ? 'Tableau de bord administrateur, assistant d\'intégration, guide de formation et formulaire de feedback.' 
                    : 'Administrator dashboard, onboarding wizard, teacher training guide, and pilot feedback form.'}
                </p>
              </div>

              {/* Sub-tabs */}
              <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {[
                  { id: 'dashboard', label: lang === 'fr' ? 'Tableau de Bord' : 'Admin Dashboard' },
                  { id: 'wizard', label: lang === 'fr' ? 'Assistant d\'Intégration' : 'Onboarding Wizard' },
                  { id: 'training', label: lang === 'fr' ? 'Guide de Formation' : 'Teacher Guide' },
                  { id: 'feedback', label: lang === 'fr' ? 'Feedback Pilote' : 'Feedback Form' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setPilotSubTab(st.id as any)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      pilotSubTab === st.id ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tab 1: Admin Dashboard */}
            {pilotSubTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Enseignants Intégrés' : 'Teachers Onboarded'}</div>
                    <div className="text-3xl font-extrabold text-emerald-600">4 / 5</div>
                    <div className="text-xs text-slate-500">Active pilot faculty</div>
                  </div>
                  <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Élèves Inscrits' : 'Students Added'}</div>
                    <div className="text-3xl font-extrabold text-blue-600">{students.length}</div>
                    <div className="text-xs text-slate-500">Primary 5 Bilingual</div>
                  </div>
                  <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Notes Vérifiées' : 'Marks Verified'}</div>
                    <div className="text-3xl font-extrabold text-amber-600">100%</div>
                    <div className="text-xs text-slate-500">Locked & transferred</div>
                  </div>
                  <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Taux de Correction OCR' : 'OCR Correction Rate'}</div>
                    <div className="text-3xl font-extrabold text-indigo-600">4.2%</div>
                    <div className="text-xs text-slate-500">High extraction accuracy</div>
                  </div>
                </div>

                <div className="custom-card rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>{lang === 'fr' ? 'Métriques de Précision OCR' : 'OCR Accuracy Tracking Metrics'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                      <div className="text-slate-500 text-xs">{lang === 'fr' ? 'Photos Traitées' : 'Photos Processed'}</div>
                      <div className="text-2xl font-bold">12 Batches</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                      <div className="text-slate-500 text-xs">{lang === 'fr' ? 'Cellules Reconnues' : 'Cells Recognized'}</div>
                      <div className="text-2xl font-bold">1,440 Cells</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                      <div className="text-slate-500 text-xs">{lang === 'fr' ? 'Erreurs OCR Fréquentes' : 'Most Common OCR Errors'}</div>
                      <div className="text-sm font-semibold text-amber-600">Handwritten digit '7' vs '1'</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Onboarding Wizard */}
            {pilotSubTab === 'wizard' && (
              <div className="custom-card rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{lang === 'fr' ? 'Assistant d\'Intégration de l\'École Pilote' : 'Pilot School Onboarding Wizard'}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'fr' 
                      ? 'Configurez votre profil d\'école, classes, années académiques et invitez des enseignants en quelques minutes.' 
                      : 'Configure your school profile, classes, academic years, and invite teachers in minutes.'}
                  </p>
                </div>

                {wizardSaved && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{lang === 'fr' ? 'École configurée et enregistrée avec succès !' : 'School successfully configured and saved!'}</span>
                  </div>
                )}

                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="font-semibold">{lang === 'fr' ? 'Nom de l\'École' : 'School Name'}</label>
                    <input 
                      type="text" 
                      value={wizardSchoolName} 
                      onChange={e => setWizardSchoolName(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">{lang === 'fr' ? 'Subdivision / Ville' : 'Subdivision / City'}</label>
                    <input 
                      type="text" 
                      value={wizardSubdivision} 
                      onChange={e => setWizardSubdivision(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">{lang === 'fr' ? 'Email de l\'Enseignant / Inviter' : 'Teacher Email Invitation'}</label>
                    <input 
                      type="email" 
                      value={wizardTeacherEmail} 
                      onChange={e => setWizardTeacherEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setWizardSaved(true)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                    >
                      {lang === 'fr' ? 'Enregistrer et Lancer le Pilote' : 'Save & Launch Pilot Setup'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Teacher Training Guide */}
            {pilotSubTab === 'training' && (
              <div className="custom-card rounded-2xl p-8 max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{lang === 'fr' ? 'Guide de Formation des Enseignants' : 'Teacher Training & User Guide'}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'fr' 
                      ? 'Instructions pas à pas pour photographier les notes, fusionner, réviser et générer les bulletins.' 
                      : 'Step-by-step instructions for photographing marksheets, merging, reviewing OCR, and generating report cards.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {[
                    { title: '1. Photographing Marksheets', desc: 'Ensure good lighting and capture clear vertical photos of marksheet sections.' },
                    { title: '2. Uploading Multiple Parts', desc: 'Upload top and bottom parts of the same marksheet into the Quality Control studio.' },
                    { title: '3. Reordering & Merging', desc: 'Use Up/Down arrows to order parts and click Run Quality Check & Merge.' },
                    { title: '4. Reviewing OCR Proposals', desc: 'Inspect AI confidence scores and raw OCR values in the OCR Review screen.' },
                    { title: '5. Correcting Marks', desc: 'Explicitly accept or correct every cell before transferring marks.' },
                    { title: '6. Report Card Generation', desc: 'Instantaneous bilingual generation of monthly, termly, and annual report cards.' }
                  ].map((guide, gIdx) => (
                    <div key={gIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border space-y-1">
                      <div className="font-bold text-emerald-700 dark:text-emerald-300">{guide.title}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{guide.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 4: Pilot Feedback Form */}
            {pilotSubTab === 'feedback' && (
              <div className="custom-card rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{lang === 'fr' ? 'Formulaire de Feedback Pilote' : 'Pilot Feedback Form'}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'fr' 
                      ? 'Aidez-nous à améliorer la précision et l\'expérience utilisateur pendant le pilote.' 
                      : 'Help us improve extraction accuracy and user experience during the school pilot.'}
                  </p>
                </div>

                {feedbackSubmitted && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{lang === 'fr' ? 'Feedback soumis avec succès. Merci !' : 'Feedback submitted successfully. Thank you!'}</span>
                  </div>
                )}

                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="font-semibold">{lang === 'fr' ? 'Catégorie de Feedback' : 'Feedback Category'}</label>
                    <select
                      value={feedbackCategory}
                      onChange={e => setFeedbackCategory(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="ocr_accuracy">OCR Accuracy</option>
                      <option value="photo_quality">Photo Quality Issues</option>
                      <option value="missing_marks">Missing Marks</option>
                      <option value="student_matching">Student Matching</option>
                      <option value="report_readability">Report-Card Readability</option>
                      <option value="connectivity">Internet Connectivity</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold">{lang === 'fr' ? 'Évaluation Globale' : 'Overall Satisfaction Rating (1-5)'}</label>
                    <select
                      value={feedbackRating}
                      onChange={e => setFeedbackRating(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Satisfactory</option>
                      <option value="2">2 - Needs Improvement</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold">{lang === 'fr' ? 'Commentaires & Observations' : 'Comments & Observations'}</label>
                    <textarea
                      value={feedbackComments}
                      onChange={e => setFeedbackComments(e.target.value)}
                      placeholder="Share your experience with marksheet stitching or OCR recognition..."
                      className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900"
                      rows={4}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setFeedbackSubmitted(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                    >
                      <Send className="w-4 h-4" />
                      <span>{lang === 'fr' ? 'Soumettre le Feedback' : 'Submit Pilot Feedback'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Analytics & Actionable Decisions</h2>
          </div>
        )}

        {/* TAB 4: OCR QUALITY CONTROL & MERGER */}
        {activeTab === 'ocrEngine' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">Quality Control & Marksheet Merger</h2>
              <input type="file" accept="image/*" multiple onChange={handleAddMarksheetParts} />
              {marksheetParts.length > 0 && (
                <button onClick={runQualityChecksAndMerge} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl">Merge & Check Quality</button>
              )}
              {mergedPreviewUrl && (
                <button onClick={sendMergedImageToOcr} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl">Send to OCR</button>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: OCR REVIEW */}
        {activeTab === 'ocrReview' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">OCR Review & Validation</h2>
              {!activeBatch ? <p>No active batch.</p> : <button onClick={confirmAndTransferMarks} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl">Confirm & Transfer</button>}
            </div>
          </div>
        )}

        {/* TAB 6: ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">Student Roster</h2>
            </div>
          </div>
        )}

        {/* TAB 7: MONTHLY REPORT CARDS */}
        {activeTab === 'monthly' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border">
              <h2 className="text-xl font-bold">Monthly Report Card</h2>
            </div>
          </div>
        )}

        {/* TAB 8: TERMLY REPORT CARDS */}
        {activeTab === 'termly' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border">
              <h2 className="text-xl font-bold">Termly Report Card</h2>
            </div>
          </div>
        )}

        {/* TAB 9: ANNUAL REPORT CARDS */}
        {activeTab === 'annual' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border">
              <h2 className="text-xl font-bold">Annual Report Card</h2>
            </div>
          </div>
        )}

        {/* TAB 10: CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">2018 Curriculum</h2>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p>{t.footerText}</p>
          <p>© 2026 Campannetsmart Engine • Official Bilingual Primary & Secondary Evaluation System.</p>
        </div>
      </footer>
    </div>
  );
}
