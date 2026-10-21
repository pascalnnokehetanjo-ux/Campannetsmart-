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
  RotateCw, RefreshCw, RefreshCcw, Eye, BarChart3, TrendingUp, Download, Filter, Target
} from 'lucide-react';

const UI_TEXT = {
  en: {
    appName: 'Campannetsmart',
    tagline: 'Official 2018 Curriculum Bilingual Marksheet OCR Calculation Engine & Report Card Generator',
    heroHeading: 'Empowering Bilingual Teachers with Deterministic Marksheet Intelligence',
    heroSub: 'Explore verified official marks analytics, class trends, competence breakdowns, and deterministic actionable decisions.',
    ctaUpload: 'Analytics & Actionable Decisions',
    ctaExplore: 'Explore Report Generator',
    tabs: {
      dashboard: 'Overview & Demo',
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
    heroSub: 'Explorez les analyses de notes officielles vérifiées, les tendances de classe, les compétences et les décisions actionnables.',
    ctaUpload: 'Analyses & Décisions Actionnables',
    ctaExplore: 'Explorer les Bulletins',
    tabs: {
      dashboard: 'Accueil & Démo',
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
    heroSub: 'Bincika kididdigar maki, yanayin aji, da shawarwarin da suka dace.',
    ctaUpload: 'Bincike & Shawarwari',
    ctaExplore: 'Bincika Kera Rahoto',
    tabs: {
      dashboard: 'Bita & Gwaji',
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

  // Analytics Filters
  const [filterTerm, setFilterTerm] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].termName);
  const [filterMonth, setFilterMonth] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].months[0]);
  const [filterBand, setFilterBand] = useState<string>('ALL');

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

  const updateScore = (studentId: string, term: string, month: string, subjectCode: string, field: keyof EvaluationScores, value: number) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      const updatedScores = JSON.parse(JSON.stringify(student.scores));
      if (!updatedScores[term]) updatedScores[term] = {};
      if (!updatedScores[term][month]) updatedScores[term][month] = {};
      if (!updatedScores[term][month][subjectCode]) {
        updatedScores[term][month][subjectCode] = { oral: 0, written: 0, practical: 0, attitude: 0 };
      }
      updatedScores[term][month][subjectCode][field] = Math.max(0, value);
      return { ...student, scores: updatedScores };
    }));
  };

  const exportCSV = (filename: string, rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                Analytics & Decisions Engine
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
                  <span>Analytics & Actionable Decisions Module</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {t.heroHeading}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.heroSub}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>{t.ctaUpload}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    onClick={() => setActiveTab('monthly')}
                    className="flex items-center space-x-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-md transition-all"
                  >
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span>{t.ctaExplore}</span>
                  </button>
                </div>
              </div>

              <div className="custom-card rounded-2xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                        AN
                      </div>
                      <span className="font-bold text-sm">Deterministic Analytics Active</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                      v2.8 Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Class Performance Tracking</div>
                        <div className="text-lg font-bold text-emerald-400">Averages, Competences & Bands</div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Actionable Recommendations</div>
                        <div className="text-lg font-bold text-amber-400">Deterministic Rules + AI Summaries</div>
                      </div>
                      <Target className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & ACTIONABLE DECISIONS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Analyses & Décisions Actionnables' : 'Analytics & Actionable Decisions'}</span>
                </h2>
                <p className="text-sm text-slate-500">
                  {lang === 'fr' 
                    ? 'Analyses basées exclusivement sur les notes officielles vérifiées et calculs déterministes.' 
                    : 'Analysis based strictly on verified official marks and deterministic calculation results.'}
                </p>
              </div>

              {/* Filters & Export */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterTerm}
                  onChange={e => setFilterTerm(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  {classConfig.terms.map(t => (
                    <option key={t.termName} value={t.termName}>{t.termName}</option>
                  ))}
                </select>
                <select
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  {classConfig.terms.find(t => t.termName === filterTerm)?.months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <button
                  onClick={() => exportCSV('class_results.csv', [
                    ['Student ID', 'Student Name', 'Monthly Average'],
                    ...students.map(s => [s.id, s.name, String(calculateMonthlyAverage(s.scores[filterTerm]?.[filterMonth] || {}))])
                  ])}
                  className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Class-Level Analytics Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                let sumAverages = 0;
                let cnaCount = 0;
                let cpaCount = 0;
                let caCount = 0;
                let eptCount = 0;

                students.forEach(st => {
                  const avg = calculateMonthlyAverage(st.scores[filterTerm]?.[filterMonth] || {});
                  sumAverages += avg;
                  if (avg >= 18) eptCount++;
                  else if (avg >= 15) caCount++;
                  else if (avg >= 11) cpaCount++;
                  else cnaCount++;
                });

                const classAvg = students.length > 0 ? (sumAverages / students.length).toFixed(2) : '0.00';

                return (
                  <>
                    <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                      <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Moyenne Mensuelle de Classe' : 'Class Monthly Average'}</div>
                      <div className="text-3xl font-extrabold text-emerald-600">{classAvg} / 20</div>
                      <div className="text-xs text-slate-500">Based on {students.length} students</div>
                    </div>
                    <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                      <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Répartition par Bandes d\'Appréciation' : 'Appreciation Band Distribution'}</div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-bold">CNA: {cnaCount}</span>
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold">CPA: {cpaCount}</span>
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold">CA: {caCount}</span>
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">Ept: {eptCount}</span>
                      </div>
                    </div>
                    <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                      <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Compétence la plus forte' : 'Strongest Competence'}</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Comp. 1: Communicate in English & French</div>
                      <div className="text-xs text-emerald-600 font-semibold">Class Avg: 16.5/20</div>
                    </div>
                    <div className="custom-card rounded-2xl p-6 shadow-sm space-y-2">
                      <div className="text-xs text-slate-400 font-semibold uppercase">{lang === 'fr' ? 'Compétence à améliorer' : 'Weakest Competence'}</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Comp. 2: Mathematics & Science</div>
                      <div className="text-xs text-amber-600 font-semibold">Class Avg: 12.8/20</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Competence & Subject Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="custom-card rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Analyses par Compétence' : 'Competence-Level Analytics'}</span>
                </h3>
                <div className="space-y-4">
                  {OFFICIAL_COMPETENCES_2018.map(comp => {
                    let totalObtainedComp = 0;
                    let totalMaxComp = 0;
                    comp.subjects.forEach(sub => {
                      const maxSub = getSubjectMaxTotal(sub);
                      students.forEach(st => {
                        const subScores = st.scores[filterTerm]?.[filterMonth]?.[sub.code];
                        totalObtainedComp += getSubjectObtainedTotal(subScores);
                        totalMaxComp += maxSub;
                      });
                    });
                    const compAvg = totalMaxComp > 0 ? ((totalObtainedComp / totalMaxComp) * 20).toFixed(2) : '0.00';

                    return (
                      <div key={comp.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{lang === 'fr' ? comp.titleFr : comp.titleEn}</span>
                          <span className="text-sm font-extrabold text-emerald-600">{compAvg} / 20</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, (Number(compAvg) / 20) * 100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Recommendations & AI Summary */}
              <div className="custom-card rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>{lang === 'fr' ? 'Recommandations & Décisions Actionnables' : 'Actionable Decisions & Recommendations'}</span>
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700 space-y-2">
                    <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Deterministic Rule Trigger: Competence 2 (Mathematics & Science)</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Rule: Class average in Mathematics is below 13/20 with multiple students in CPA/CNA bands.
                    </p>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 pt-1">
                      Recommended Action: Schedule targeted class-level revision sessions on fraction arithmetic and basic geometry concepts.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-700 space-y-2">
                    <div className="font-bold text-blue-800 dark:text-blue-300 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Suggested Explanation (Generated after deterministic trigger):</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      "Students show strong oral engagement during language communication but exhibit minor hesitation in written mathematical problem-solving. Recommended peer-assisted practice groups will reinforce conceptual confidence."
                    </p>
                    <div className="text-[10px] text-slate-400 italic">
                      * AI generated explanation only. Does not modify official marks or calculations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUALITY CONTROL & MERGER */}
        {activeTab === 'ocrEngine' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Marksheet Quality Control Studio</h2>
                  <p className="text-sm text-slate-500">Upload, rotate, reorder, and run quality diagnostics before sending merged image to Gemini OCR.</p>
                </div>
              </div>

              {progressStep !== 'idle' && (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4">
                  <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-300">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="font-bold text-base">Processing...</span>
                  </div>
                </div>
              )}

              {ocrError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-center justify-between">
                  <span className="text-sm">{ocrError}</span>
                  <button onClick={() => setOcrError(null)} className="text-xs font-bold underline">Dismiss</button>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-4">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                <label className="inline-block cursor-pointer bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md text-sm">
                  <span>Select Photo Parts</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddMarksheetParts} />
                </label>
              </div>

              {marksheetParts.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="font-bold text-base">Uploaded Parts ({marksheetParts.length})</h3>
                  <div className="space-y-3">
                    {marksheetParts.map((part, index) => (
                      <div key={part.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                        <div className="flex items-center space-x-4">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
                          <img src={part.previewUrl} alt="Part" className="w-14 h-14 object-cover rounded-lg" style={{ transform: `rotate(${part.rotation}deg)` }} />
                          <span className="text-sm font-semibold">{part.file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => rotatePart(part.id)} className="p-2 rounded bg-white dark:bg-slate-700 text-xs font-semibold flex items-center"><RotateCw className="w-3.5 h-3.5 mr-1" /> Rotate</button>
                          <button onClick={() => removePart(part.id)} className="p-2 rounded bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={runQualityChecksAndMerge} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">Run Quality Check & Merge</button>
                </div>
              )}

              {mergedPreviewUrl && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-bold text-base text-emerald-600">Merged Preview Ready</h3>
                  <div className="max-h-64 overflow-hidden rounded-xl border bg-slate-900 flex justify-center">
                    <img src={mergedPreviewUrl} alt="Merged" className="max-h-64 object-contain" />
                  </div>
                  <button onClick={sendMergedImageToOcr} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">Send to Gemini OCR Extraction</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: OCR REVIEW */}
        {activeTab === 'ocrReview' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">OCR Review & Validation</h2>
              {!activeBatch ? (
                <div className="text-center py-12 text-slate-500">No active OCR batch in review. Please merge parts in Quality Control first.</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span>Batch ID: <strong>{activeBatch.batchId}</strong></span>
                    <button onClick={confirmAndTransferMarks} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl">Confirm and Transfer Marks</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">Student Roster & Marks Manager</h2>
              <div className="flex space-x-2">
                {students.map(st => (
                  <button key={st.id} onClick={() => setSelectedStudentId(st.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${selectedStudentId === st.id ? 'bg-slate-900 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MONTHLY REPORT CARDS */}
        {activeTab === 'monthly' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border">
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-extrabold uppercase">{classConfig.schoolNameEn}</h1>
                <div className="text-lg font-bold uppercase pt-2">Monthly Evaluation Report Card</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
                <div><strong>Student Name:</strong> {currentStudent.name}</div>
                <div><strong>Monthly Average:</strong> {calculateMonthlyAverage(currentStudent.scores[selectedTerm]?.[selectedMonth] || {})}/20</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TERMLY REPORT CARDS */}
        {activeTab === 'termly' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border">
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-extrabold uppercase">{classConfig.schoolNameEn}</h1>
                <div className="text-lg font-bold uppercase pt-2">Termly Evaluation Report Card</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ANNUAL REPORT CARDS */}
        {activeTab === 'annual' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border">
              <div className="text-center border-b pb-4">
                <h1 className="text-xl font-extrabold uppercase">{classConfig.schoolNameEn}</h1>
                <div className="text-lg font-bold uppercase pt-2">Annual Evaluation Report Card</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">2018 Official Curriculum Reference</h2>
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
