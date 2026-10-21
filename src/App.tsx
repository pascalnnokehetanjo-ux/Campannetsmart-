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
  MoveUp, MoveDown, Trash2, Layers, Image as ImageIcon, Check, X, Edit3, Lock, Unlock, History, AlertTriangle
} from 'lucide-react';

const UI_TEXT = {
  en: {
    appName: 'Campannetsmart',
    tagline: 'Official 2018 Curriculum Bilingual Marksheet OCR Calculation Engine & Report Card Generator',
    heroHeading: 'Empowering Bilingual Teachers with Deterministic Marksheet Intelligence',
    heroSub: 'Upload multiple marksheet photo parts, rearrange and merge them, review OCR extractions with cell-by-cell validation, and lock batches for official report cards.',
    ctaUpload: 'Multi-Part Marksheet Stitcher',
    ctaExplore: 'Explore Report Generator',
    tabs: {
      dashboard: 'Overview & Demo',
      ocrEngine: 'Multi-Part Marksheet OCR & Merger',
      ocrReview: 'OCR Review & Validation',
      roster: 'Roster & Marks',
      monthly: 'Monthly Reports',
      termly: 'Termly Reports',
      annual: 'Annual Reports',
      curriculum: '2018 Curriculum'
    },
    featuresTitle: 'Why Teachers & Schools Choose Campannetsmart',
    featuresSub: 'Engineered specifically for bilingual primary and secondary education systems adhering strictly to official ministerial evaluation standards.',
    pricingTitle: 'Simple, Transparent Educator Pricing',
    pricingSub: 'Empower every teacher in your institution with instant OCR calculations and bilingual report generation.',
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
    heroSub: 'Téléchargez plusieurs parties de notes, fusionnez-les, révisez les extractions OCR avec validation cellule par cellule et verrouillez les lots pour les bulletins.',
    ctaUpload: 'Fusionneur de Notes Multi-Parties',
    ctaExplore: 'Explorer les Bulletins',
    tabs: {
      dashboard: 'Accueil & Démo',
      ocrEngine: 'Fusion & OCR Notes',
      ocrReview: 'Révision OCR & Validation',
      roster: 'Élèves & Notes',
      monthly: 'Bulletins Mensuels',
      termly: 'Bulletins Trimestriels',
      annual: 'Bulletins Annuels',
      curriculum: 'Curriculum 2018'
    },
    featuresTitle: 'Pourquoi les Enseignants et Écoles Choisissent Campannetsmart',
    featuresSub: 'Conçu spécifiquement pour l\'enseignement bilingue primaire et secondaire selon les normes ministérielles officielles 2018.',
    pricingTitle: 'Tarification Simple et Transparente',
    pricingSub: 'Équipez chaque enseignant avec le calcul automatique et des bulletins professionnels bilingues.',
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
    heroSub: 'Sanya sassa daban-daban na hotunan sakamako, haɗa su, duba da tabbatar da kowace lamba kafin amincewa da rahoton aji.',
    ctaUpload: 'Haɗa da Kera Sakamako',
    ctaExplore: 'Bincika Kera Rahoto',
    tabs: {
      dashboard: 'Bita & Gwaji',
      ocrEngine: 'Haɗa & OCR Sakamako',
      ocrReview: 'Bita da Tabbatarwa',
      roster: 'Dalibai da Maki',
      monthly: 'Rahoton Wata',
      termly: 'Rahoton Zango',
      annual: 'Rahoton Shekara',
      curriculum: 'Tsarin 2018'
    },
    featuresTitle: 'Me Yasa Malamai Ke Son Campannetsmart',
    featuresSub: 'An tsara shi musamman don tsarin karatun bilingual da ke bin ka\'idojin gwamnati na hukuma.',
    pricingTitle: 'Farashin Da Ya Dace da Kowace Makaranta',
    pricingSub: 'Bada damar kowane malami ya yi lissafi da buga rahotanni cikin sauqi.',
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
}

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

  // Multi-part marksheet state
  const [marksheetParts, setMarksheetParts] = useState<MarksheetPart[]>([]);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
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

    const newParts: MarksheetPart[] = Array.from(files).map((file, idx) => ({
      id: `part_${Date.now()}_${idx}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setMarksheetParts(prev => [...prev, ...newParts]);
    setMergedPreviewUrl(null);
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

  const mergeAndExtractMarksheet = async () => {
    if (marksheetParts.length === 0) {
      setOcrError('Please upload at least one marksheet photo part.');
      return;
    }

    setIsProcessingOcr(true);
    setOcrError(null);
    setOcrSuccessMsg(null);

    try {
      const loadedImages = await Promise.all(marksheetParts.map(part => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = part.previewUrl;
        });
      }));

      const maxWidth = Math.max(...loadedImages.map(img => img.naturalWidth || img.width));
      const totalHeight = loadedImages.reduce((sum, img) => sum + (img.naturalHeight || img.height), 0);

      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not initialize canvas context for merging.');

      let currentY = 0;
      for (const img of loadedImages) {
        ctx.drawImage(img, 0, currentY);
        currentY += (img.naturalHeight || img.height);
      }

      const mergedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setMergedPreviewUrl(mergedDataUrl);

      const base64String = mergedDataUrl.split(',')[1];

      const res = await fetch('/api/ocr-marksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String, mimeType: 'image/jpeg' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OCR extraction failed');

      if (data.success && data.data && data.data.students) {
        // Initialize batch with review items
        const batch: MarksheetBatch = {
          batchId: data.data.batchId || `BATCH_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          mergedImageUrl: mergedDataUrl,
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
        setOcrSuccessMsg(`Successfully stitched ${marksheetParts.length} parts and extracted OCR scores. Please review and validate cells below.`);
        setActiveTab('ocrReview');
      }
    } catch (err: any) {
      setOcrError(err.message || 'Failed to merge and process marksheet photos');
    } finally {
      setIsProcessingOcr(false);
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

    // 1. Validate that no cells are pending or rejected without review
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
      alert('Please accept or correct all extracted cells before confirming and transferring marks.');
      return;
    }

    // 2. Transfer only accepted or corrected marks into official student store
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

    // If new student not in roster, add them
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

    // 3. Lock batch
    setActiveBatch(prev => prev ? { ...prev, isLocked: true, lockedAt: new Date().toLocaleString() } : null);
    alert('Marks successfully validated, locked, and transferred to official monthly report cards with full audit trail preserved.');
    setActiveTab('monthly');
  };

  const unlockBatchWithReason = () => {
    if (!activeBatch || !unlockReason.trim()) {
      alert('Please provide a valid reason for unlocking this batch.');
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
                OCR Verification & Locking Engine
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
                {tab.id === 'ocrReview' && activeBatch && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: DASHBOARD & OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>OCR Verification & Mark-Locking Workflow</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {t.heroHeading}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.heroSub}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('ocrEngine')}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <Layers className="w-5 h-5" />
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
                <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cell-by-Cell Verification</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Batch Locking & Audit Trail</span>
                  </div>
                </div>
              </div>

              <div className="custom-card rounded-2xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                        V
                      </div>
                      <span className="font-bold text-sm">Verification Engine Active</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                      v2.6 Secured
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">OCR Review Queue</div>
                        <div className="text-lg font-bold text-emerald-400">{activeBatch ? `${activeBatch.students.length} Students Pending` : 'No Active Batch'}</div>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Batch Locking Status</div>
                        <div className="text-lg font-bold text-amber-400">{activeBatch?.isLocked ? 'Locked & Secured' : 'Editable / Unlocked'}</div>
                      </div>
                      {activeBatch?.isLocked ? <Lock className="w-8 h-8 text-amber-400" /> : <Unlock className="w-8 h-8 text-blue-400" />}
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between text-xs text-slate-400">
                    <span>Audit Trail Preserved</span>
                    <span className="text-emerald-400 font-medium">100% Deterministic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-PART MARKSHEET OCR & MERGER */}
        {activeTab === 'ocrEngine' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Multi-Part Marksheet Photo Merger & OCR</h2>
                  <p className="text-sm text-slate-500">Upload multiple photos of the same marksheet, rearrange them, merge them, and send to OCR review queue.</p>
                </div>
              </div>

              {ocrError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{ocrError}</span>
                </div>
              )}

              {ocrSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{ocrSuccessMsg}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-4 hover:border-emerald-500 transition-colors">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <Upload className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">Upload Marksheet Photo Parts</h3>
                  <p className="text-xs text-slate-500">Select one or multiple photos (e.g., Part 1 and Part 2 of the same marksheet)</p>
                </div>
                <div>
                  <label className="inline-block cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all text-sm">
                    <span>Select Photo Parts</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      className="hidden" 
                      onChange={handleAddMarksheetParts}
                    />
                  </label>
                </div>
              </div>

              {marksheetParts.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                      <span>Uploaded Parts ({marksheetParts.length}) — Rearrange Order</span>
                    </h3>
                    <button
                      onClick={() => { setMarksheetParts([]); setMergedPreviewUrl(null); }}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Clear All Parts
                    </button>
                  </div>

                  <div className="space-y-3">
                    {marksheetParts.map((part, index) => (
                      <div key={part.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-4">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <img src={part.previewUrl} alt={`Part ${index + 1}`} className="w-14 h-14 object-cover rounded-lg border border-slate-300 dark:border-slate-600" />
                          <div>
                            <div className="text-sm font-semibold truncate max-w-xs">{part.file.name}</div>
                            <div className="text-xs text-slate-400">{(part.file.size / 1024).toFixed(1)} KB</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => movePartIndex(index, 'up')}
                            disabled={index === 0}
                            className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 transition-colors"
                            title="Move Up"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => movePartIndex(index, 'down')}
                            disabled={index === marksheetParts.length - 1}
                            className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 transition-colors"
                            title="Move Down"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removePart(part.id)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={mergeAndExtractMarksheet}
                      disabled={isProcessingOcr || marksheetParts.length === 0}
                      className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-600/25 disabled:opacity-50 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>{isProcessingOcr ? 'Stitching & Extracting OCR...' : 'Merge & Send to OCR Review'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OCR REVIEW & VALIDATION */}
        {activeTab === 'ocrReview' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <span>OCR Review & Cell-by-Cell Validation</span>
                  {activeBatch?.isLocked && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Batch Locked</span>
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-500">Review AI extracted scores, verify against confidence and max marks, and explicitly accept or correct every cell.</p>
              </div>

              <div className="flex items-center space-x-3">
                {activeBatch?.isLocked ? (
                  <button
                    onClick={() => setUnlockModalOpen(true)}
                    className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md transition-all"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Batch</span>
                  </button>
                ) : (
                  <button
                    onClick={confirmAndTransferMarks}
                    disabled={!activeBatch}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm and Transfer Marks</span>
                  </button>
                )}
              </div>
            </div>

            {!activeBatch ? (
              <div className="custom-card rounded-2xl p-12 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-bold">No Active OCR Batch in Review</h3>
                <p className="text-sm text-slate-500">Please upload and merge marksheet photo parts in the OCR Engine tab first.</p>
                <button
                  onClick={() => setActiveTab('ocrEngine')}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow"
                >
                  Go to OCR Engine
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Batch Info Card */}
                <div className="custom-card rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Batch ID</div>
                    <div className="font-bold font-mono text-emerald-600">{activeBatch.batchId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Extraction Timestamp</div>
                    <div className="font-semibold">{activeBatch.timestamp}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Term & Month</div>
                    <div className="font-semibold">{activeBatch.term} / {activeBatch.month}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Batch Status</div>
                    <div className="font-bold flex items-center space-x-1.5">
                      {activeBatch.isLocked ? (
                        <span className="text-amber-600 flex items-center"><Lock className="w-4 h-4 mr-1" /> Locked</span>
                      ) : (
                        <span className="text-emerald-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Ready for Verification</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Merged Marksheet Reference Image */}
                <div className="custom-card rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-base flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                    <span>Merged Marksheet Source Image</span>
                  </h3>
                  <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden max-h-72 bg-slate-900 flex justify-center">
                    <img src={activeBatch.mergedImageUrl} alt="Merged Marksheet Source" className="object-contain max-h-72" />
                  </div>
                </div>

                {/* Review Table per Student */}
                <div className="space-y-6">
                  {activeBatch.students.map((st, stIdx) => (
                    <div key={st.id} className="custom-card rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                            {stIdx + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-lg">{st.name} <span className="text-xs font-mono text-slate-400">({st.id})</span></h3>
                            <div className="text-xs text-slate-500">OCR Confidence: <span className="font-bold text-emerald-600">{(st.confidence * 100).toFixed(1)}%</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Subjects & Cells Review */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs border border-slate-200 dark:border-slate-700">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                              <th className="p-3">Subject / Sub-Competence</th>
                              <th className="p-3 text-center">Oral (Max)</th>
                              <th className="p-3 text-center">Written (Max)</th>
                              <th className="p-3 text-center">Practical (Max)</th>
                              <th className="p-3 text-center">Attitude (Max)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {OFFICIAL_COMPETENCES_2018.map(comp => (
                              <React.Fragment key={comp.id}>
                                <tr className="bg-slate-50 dark:bg-slate-800/40">
                                  <td colSpan={5} className="p-2.5 font-bold text-[11px] uppercase text-emerald-700 dark:text-emerald-300">
                                    {lang === 'fr' ? comp.titleFr : comp.titleEn}
                                  </td>
                                </tr>
                                {comp.subjects.map(sub => {
                                  const cellData = st.scores[sub.code] || {
                                    oral: { value: 0, max: sub.maxOral, confidence: 0.9, rawOcrText: '0', status: 'pending', auditTrail: [] },
                                    written: { value: 0, max: sub.maxWritten, confidence: 0.9, rawOcrText: '0', status: 'pending', auditTrail: [] },
                                    practical: { value: 0, max: sub.maxPractical, confidence: 0.9, rawOcrText: '0', status: 'pending', auditTrail: [] },
                                    attitude: { value: 0, max: sub.maxAttitude, confidence: 0.9, rawOcrText: '0', status: 'pending', auditTrail: [] }
                                  };

                                  return (
                                    <tr key={sub.code} className="hover:bg-slate-50/50">
                                      <td className="p-3 font-medium">
                                        <div>{lang === 'fr' ? sub.nameFr : sub.nameEn}</div>
                                        <div className="text-[10px] text-slate-400">Code: {sub.code}</div>
                                      </td>
                                      {(['oral', 'written', 'practical', 'attitude'] as const).map(et => {
                                        const cell = cellData[et] || { value: 0, max: 10, confidence: 0.9, rawOcrText: '0', status: 'pending', auditTrail: [] };
                                        const isError = cell.value > cell.max || cell.value < 0 || isNaN(cell.value);

                                        return (
                                          <td key={et} className="p-3 text-center">
                                            <div className="space-y-1.5 flex flex-col items-center">
                                              <div className="flex items-center space-x-1">
                                                <input
                                                  type="number"
                                                  min={0}
                                                  max={cell.max}
                                                  disabled={activeBatch.isLocked}
                                                  value={cell.value}
                                                  onChange={e => updateCellStatus(st.id, sub.code, et, 'corrected', parseFloat(e.target.value) || 0)}
                                                  className={`w-16 text-center rounded-lg py-1 text-xs font-bold border ${
                                                    isError ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                                  }`}
                                                />
                                                <span className="text-[10px] text-slate-400">/ {cell.max}</span>
                                              </div>

                                              <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                                                <span>Raw: <strong className="font-mono">{cell.rawOcrText}</strong></span>
                                                <span>({(cell.confidence * 100).toFixed(0)}%)</span>
                                              </div>

                                              {/* Accept / Correct / Reject Controls */}
                                              {!activeBatch.isLocked && (
                                                <div className="flex items-center space-x-1 pt-1">
                                                  <button
                                                    onClick={() => updateCellStatus(st.id, sub.code, et, 'accepted')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                                      cell.status === 'accepted' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 hover:bg-emerald-100'
                                                    }`}
                                                    title="Accept OCR Mark"
                                                  >
                                                    Accept
                                                  </button>
                                                  <button
                                                    onClick={() => updateCellStatus(st.id, sub.code, et, 'corrected')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                                                      cell.status === 'corrected' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 hover:bg-amber-100'
                                                    }`}
                                                    title="Mark Corrected"
                                                  >
                                                    Correct
                                                  </button>
                                                </div>
                                              )}

                                              {/* Status Badge */}
                                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                                cell.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                                cell.status === 'corrected' ? 'bg-amber-100 text-amber-800' :
                                                cell.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-slate-100 text-slate-600'
                                              }`}>
                                                {cell.status}
                                              </span>
                                            </div>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unlock Modal */}
            {unlockModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="custom-card rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl bg-white dark:bg-slate-800">
                  <div className="flex items-center space-x-3 text-amber-600">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-lg font-bold">Unlock Batch Authorization</h3>
                  </div>
                  <p className="text-xs text-slate-500">Unlocking this batch allows modifying locked official marks. Please provide a mandatory reason for audit logging.</p>
                  <textarea
                    value={unlockReason}
                    onChange={e => setUnlockReason(e.target.value)}
                    placeholder="Enter reason for unlocking (e.g. Correcting teacher transcription error in Math)..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-900"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setUnlockModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={unlockBatchWithReason}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700"
                    >
                      Authorize Unlock
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ROSTER & MARKS MANAGER */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Student Roster & Marks Manager</h2>
                <p className="text-sm text-slate-500">Configure student scores for Oral, Written, Practical, and Attitude per subject.</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {classConfig.terms.map(t => (
                    <option key={t.termName} value={t.termName}>{t.termName}</option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {classConfig.terms.find(t => t.termName === selectedTerm)?.months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex overflow-x-auto space-x-2 pb-2">
              {students.map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedStudentId === st.id 
                      ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm' 
                      : 'custom-card hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st.name} ({st.id})
                </button>
              ))}
            </div>

            <div className="custom-card rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Editing Marks for: {currentStudent.name}</h3>
                  <p className="text-xs text-slate-500">Term: {selectedTerm} | Month: {selectedMonth}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Monthly Computed Average</div>
                  <div className="text-xl font-extrabold text-emerald-600">
                    {calculateMonthlyAverage(currentStudent.scores[selectedTerm]?.[selectedMonth] || {})}/20
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      <th className="p-4">Competence & Subject</th>
                      <th className="p-4 text-center">Oral (Max)</th>
                      <th className="p-4 text-center">Written (Max)</th>
                      <th className="p-4 text-center">Practical (Max)</th>
                      <th className="p-4 text-center">Attitude (Max)</th>
                      <th className="p-4 text-center">Total Obtained</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {OFFICIAL_COMPETENCES_2018.map(comp => (
                      <React.Fragment key={comp.id}>
                        <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                          <td colSpan={6} className="p-3 font-bold text-xs uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">
                            {lang === 'fr' ? comp.titleFr : comp.titleEn}
                          </td>
                        </tr>
                        {comp.subjects.map(sub => {
                          const subScores = currentStudent.scores[selectedTerm]?.[selectedMonth]?.[sub.code] || { oral: 0, written: 0, practical: 0, attitude: 0 };
                          const obtained = getSubjectObtainedTotal(subScores);
                          const maxSub = getSubjectMaxTotal(sub);
                          return (
                            <tr key={sub.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="p-4 font-medium">
                                <div>{lang === 'fr' ? sub.nameFr : sub.nameEn}</div>
                                <div className="text-xs text-slate-400 font-mono">Code: {sub.code}</div>
                              </td>
                              <td className="p-4 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={sub.maxOral}
                                  value={subScores.oral}
                                  onChange={e => updateScore(currentStudent.id, selectedTerm, selectedMonth, sub.code, 'oral', parseFloat(e.target.value) || 0)}
                                  className="w-16 text-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-1 text-sm font-semibold"
                                />
                                <div className="text-[10px] text-slate-400 mt-1">/ {sub.maxOral}</div>
                              </td>
                              <td className="p-4 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={sub.maxWritten}
                                  value={subScores.written}
                                  onChange={e => updateScore(currentStudent.id, selectedTerm, selectedMonth, sub.code, 'written', parseFloat(e.target.value) || 0)}
                                  className="w-16 text-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-1 text-sm font-semibold"
                                />
                                <div className="text-[10px] text-slate-400 mt-1">/ {sub.maxWritten}</div>
                              </td>
                              <td className="p-4 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={sub.maxPractical}
                                  value={subScores.practical}
                                  onChange={e => updateScore(currentStudent.id, selectedTerm, selectedMonth, sub.code, 'practical', parseFloat(e.target.value) || 0)}
                                  className="w-16 text-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-1 text-sm font-semibold"
                                />
                                <div className="text-[10px] text-slate-400 mt-1">/ {sub.maxPractical}</div>
                              </td>
                              <td className="p-4 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={sub.maxAttitude}
                                  value={subScores.attitude}
                                  onChange={e => updateScore(currentStudent.id, selectedTerm, selectedMonth, sub.code, 'attitude', parseFloat(e.target.value) || 0)}
                                  className="w-16 text-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-1 text-sm font-semibold"
                                />
                                <div className="text-[10px] text-slate-400 mt-1">/ {sub.maxAttitude}</div>
                              </td>
                              <td className="p-4 text-center font-bold text-emerald-600">
                                {obtained} / {maxSub}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MONTHLY REPORT CARDS */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 no-print">
              <div className="flex items-center space-x-3">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {classConfig.terms.map(t => (
                    <option key={t.termName} value={t.termName}>{t.termName}</option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {classConfig.terms.find(t => t.termName === selectedTerm)?.months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg text-xs font-semibold">
                  <span className="px-2">{t.reportLang}:</span>
                  {(['en', 'fr'] as ReportLanguage[]).map(rl => (
                    <button
                      key={rl}
                      onClick={() => setReportLang(rl)}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        reportLang === rl ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {rl.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printReport}</span>
                </button>
              </div>
            </div>

            <div className="custom-card rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 report-page bg-white text-slate-900 border-2 border-slate-300">
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  REPUBLIC OF CAMEROON • REPUBLIQUE DU CAMEROUN
                </div>
                <h1 className="text-xl font-extrabold uppercase">
                  {reportLang === 'fr' ? classConfig.schoolNameFr : classConfig.schoolNameEn}
                </h1>
                <div className="text-sm font-semibold text-emerald-700">
                  {classConfig.className} • Academic Year / Année Scolaire: {classConfig.academicYear}
                </div>
                <div className="text-lg font-bold pt-2 uppercase bg-slate-100 py-1 rounded">
                  {reportLang === 'fr' ? 'BULLETIN MENSUEL D\'ÉVALUATION' : 'MONTHLY EVALUATION REPORT CARD'}
                  <div className="text-xs font-normal text-slate-600">{selectedMonth}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Nom de l\'Élève / Student Name:' : 'Student Name:'}</span> {currentStudent.name}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Matricule / ID:' : 'Student ID:'}</span> {currentStudent.id}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Trimestre / Term:' : 'Term:'}</span> {selectedTerm}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Enseignant / Teacher:' : 'Teacher:'}</span> {classConfig.teacherName}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2.5 border-r border-slate-300">{reportLang === 'fr' ? 'Compétence & Matière' : 'Competence & Subject'}</th>
                      <th className="p-2 text-center border-r border-slate-300">Oral</th>
                      <th className="p-2 text-center border-r border-slate-300">Written / Écrit</th>
                      <th className="p-2 text-center border-r border-slate-300">Practical / Pratique</th>
                      <th className="p-2 text-center border-r border-slate-300">Attitude</th>
                      <th className="p-2 text-center border-r border-slate-300">Total / {getAllCompetencesMaxTotal()}</th>
                      <th className="p-2 text-center">{reportLang === 'fr' ? 'Appréciation / Note' : 'Appreciation / Grade'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {OFFICIAL_COMPETENCES_2018.map(comp => (
                      <React.Fragment key={comp.id}>
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={7} className="p-2 text-emerald-900">
                            {reportLang === 'fr' ? comp.titleFr : comp.titleEn}
                          </td>
                        </tr>
                        {comp.subjects.map(sub => {
                          const subScores = currentStudent.scores[selectedTerm]?.[selectedMonth]?.[sub.code] || { oral: 0, written: 0, practical: 0, attitude: 0 };
                          const obtained = getSubjectObtainedTotal(subScores);
                          const maxSub = getSubjectMaxTotal(sub);
                          const subAvg = (obtained / maxSub) * 20;
                          const app = getAppreciation(subAvg, reportLang);
                          return (
                            <tr key={sub.code} className="hover:bg-slate-50">
                              <td className="p-2 border-r border-slate-300 font-medium">
                                {reportLang === 'fr' ? sub.nameFr : sub.nameEn}
                              </td>
                              <td className="p-2 text-center border-r border-slate-300">{subScores.oral} / {sub.maxOral}</td>
                              <td className="p-2 text-center border-r border-slate-300">{subScores.written} / {sub.maxWritten}</td>
                              <td className="p-2 text-center border-r border-slate-300">{subScores.practical} / {sub.maxPractical}</td>
                              <td className="p-2 text-center border-r border-slate-300">{subScores.attitude} / {sub.maxAttitude}</td>
                              <td className="p-2 text-center border-r border-slate-300 font-bold">{obtained} / {maxSub}</td>
                              <td className="p-2 text-center font-bold">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${app.color}`}>{app.grade} - {app.text}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {(() => {
                const monthScores = currentStudent.scores[selectedTerm]?.[selectedMonth] || {};
                const monthlyAvg = calculateMonthlyAverage(monthScores);
                const overallApp = getAppreciation(monthlyAvg, reportLang);
                return (
                  <div className="bg-slate-50 border-2 border-slate-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">{reportLang === 'fr' ? 'Moyenne Mensuelle / Monthly Average:' : 'Monthly Average:'}</div>
                      <div className="text-3xl font-extrabold text-emerald-700">{monthlyAvg} / 20</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xs text-slate-500 font-semibold">{reportLang === 'fr' ? 'Appréciation Générale / Overall Appreciation:' : 'Overall Appreciation:'}</div>
                      <div className="text-base font-bold text-slate-900">{overallApp.text} (Grade: {overallApp.grade})</div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 pt-8 text-xs font-semibold text-center">
                <div>
                  <p>{reportLang === 'fr' ? 'Signature de l\'Enseignant' : 'Teacher\'s Signature'}</p>
                  <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p>{reportLang === 'fr' ? 'Visa du Directeur / Parent' : 'Head Teacher / Parent Signature'}</p>
                  <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TERMLY REPORT CARDS */}
        {activeTab === 'termly' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 no-print">
              <div className="flex items-center space-x-3">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {classConfig.terms.map(t => (
                    <option key={t.termName} value={t.termName}>{t.termName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg text-xs font-semibold">
                  <span className="px-2">{t.reportLang}:</span>
                  {(['en', 'fr'] as ReportLanguage[]).map(rl => (
                    <button
                      key={rl}
                      onClick={() => setReportLang(rl)}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        reportLang === rl ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {rl.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printReport}</span>
                </button>
              </div>
            </div>

            <div className="custom-card rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 report-page bg-white text-slate-900 border-2 border-slate-300">
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  REPUBLIC OF CAMEROON • REPUBLIQUE DU CAMEROUN
                </div>
                <h1 className="text-xl font-extrabold uppercase">
                  {reportLang === 'fr' ? classConfig.schoolNameFr : classConfig.schoolNameEn}
                </h1>
                <div className="text-sm font-semibold text-emerald-700">
                  {classConfig.className} • Academic Year / Année Scolaire: {classConfig.academicYear}
                </div>
                <div className="text-lg font-bold pt-2 uppercase bg-slate-100 py-1 rounded">
                  {reportLang === 'fr' ? 'BULLETIN TRIMESTRIEL OFFICIEL' : 'OFFICIAL TERMLY REPORT CARD'}
                  <div className="text-xs font-normal text-slate-600">{selectedTerm}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Nom de l\'Élève:' : 'Student Name:'}</span> {currentStudent.name}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Matricule:' : 'Student ID:'}</span> {currentStudent.id}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Trimestre:' : 'Term:'}</span> {selectedTerm}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Moyenne Trimestrielle:' : 'Termly Average:'}</span>{' '}
                  <span className="text-emerald-700 font-extrabold">
                    {calculateTermAverage(currentStudent, selectedTerm, classConfig.terms.find(t => t.termName === selectedTerm)?.months || [])} / 20
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const termInfo = classConfig.terms.find(t => t.termName === selectedTerm);
                  const months = termInfo ? termInfo.months : [];
                  return (
                    <table className="w-full text-left border-collapse text-xs border border-slate-300">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                          <th className="p-2.5 border-r border-slate-300">{reportLang === 'fr' ? 'Compétence & Matière' : 'Competence & Subject'}</th>
                          {months.map(m => (
                            <th key={m} className="p-2 text-center border-r border-slate-300">{m.split('/')[0]} Total</th>
                          ))}
                          <th className="p-2 text-center border-r border-slate-300">{reportLang === 'fr' ? 'Total Horizontal' : 'Horizontal Total'}</th>
                          <th className="p-2 text-center">{reportLang === 'fr' ? 'Appréciation Trimestrielle' : 'Termly Appreciation'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {OFFICIAL_COMPETENCES_2018.map(comp => (
                          <React.Fragment key={comp.id}>
                            <tr className="bg-slate-100 font-bold">
                              <td colSpan={months.length + 3} className="p-2 text-emerald-900">
                                {reportLang === 'fr' ? comp.titleFr : comp.titleEn}
                              </td>
                            </tr>
                            {comp.subjects.map(sub => {
                              let subjectTermSum = 0;
                              return (
                                <tr key={sub.code} className="hover:bg-slate-50">
                                  <td className="p-2 border-r border-slate-300 font-medium">
                                    {reportLang === 'fr' ? sub.nameFr : sub.nameEn}
                                  </td>
                                  {months.map(m => {
                                    const subScores = currentStudent.scores[selectedTerm]?.[m]?.[sub.code];
                                    const obtained = getSubjectObtainedTotal(subScores);
                                    subjectTermSum += obtained;
                                    return (
                                      <td key={m} className="p-2 text-center border-r border-slate-300">
                                        {obtained} / {getSubjectMaxTotal(sub)}
                                      </td>
                                    );
                                  })}
                                  <td className="p-2 text-center border-r border-slate-300 font-bold text-emerald-700">
                                    {subjectTermSum} / {getSubjectMaxTotal(sub) * months.length}
                                  </td>
                                  <td className="p-2 text-center font-bold">
                                    {(() => {
                                      const maxTotal = getSubjectMaxTotal(sub) * months.length;
                                      const ratio = maxTotal > 0 ? subjectTermSum / maxTotal : 0;
                                      const app = getAppreciation(ratio * 20, reportLang);
                                      return <span className={`px-2 py-0.5 rounded text-[10px] ${app.color}`}>{app.grade} - {app.text}</span>;
                                    })()}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              {(() => {
                const termInfo = classConfig.terms.find(t => t.termName === selectedTerm);
                const termAvg = calculateTermAverage(currentStudent, selectedTerm, termInfo ? termInfo.months : []);
                const termApp = getAppreciation(termAvg, reportLang);
                return (
                  <div className="bg-slate-50 border-2 border-slate-300 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">{reportLang === 'fr' ? 'Moyenne Générale du Trimestre:' : 'Termly General Average:'}</div>
                      <div className="text-3xl font-extrabold text-emerald-700">{termAvg} / 20</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-semibold">{reportLang === 'fr' ? 'Appréciation du Trimestre:' : 'Term Appreciation:'}</div>
                      <div className="text-base font-bold text-slate-900">{termApp.text} (Grade: {termApp.grade})</div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 pt-8 text-xs font-semibold text-center">
                <div>
                  <p>{reportLang === 'fr' ? 'Signature du Maître' : 'Class Teacher\'s Signature'}</p>
                  <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p>{reportLang === 'fr' ? 'Visa du Directeur / Principal' : 'Head Teacher / Principal Signature'}</p>
                  <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ANNUAL REPORT CARDS */}
        {activeTab === 'annual' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 no-print">
              <div className="flex items-center space-x-3">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg text-xs font-semibold">
                  <span className="px-2">{t.reportLang}:</span>
                  {(['en', 'fr'] as ReportLanguage[]).map(rl => (
                    <button
                      key={rl}
                      onClick={() => setReportLang(rl)}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        reportLang === rl ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {rl.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printReport}</span>
                </button>
              </div>
            </div>

            <div className="custom-card rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 report-page bg-white text-slate-900 border-2 border-slate-300">
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  REPUBLIC OF CAMEROON • REPUBLIQUE DU CAMEROUN
                </div>
                <h1 className="text-xl font-extrabold uppercase">
                  {reportLang === 'fr' ? classConfig.schoolNameFr : classConfig.schoolNameEn}
                </h1>
                <div className="text-sm font-semibold text-emerald-700">
                  {classConfig.className} • Academic Year / Année Scolaire: {classConfig.academicYear}
                </div>
                <div className="text-lg font-bold pt-2 uppercase bg-slate-100 py-1 rounded">
                  {reportLang === 'fr' ? 'BULLETIN ANNUEL OFFICIEL (SCOLAIRE)' : 'OFFICIAL ANNUAL REPORT CARD'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Nom de l\'Élève:' : 'Student Name:'}</span> {currentStudent.name}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Matricule:' : 'Student ID:'}</span> {currentStudent.id}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Année Scolaire:' : 'Academic Year:'}</span> {classConfig.academicYear}
                </div>
                <div>
                  <span className="font-bold">{reportLang === 'fr' ? 'Moyenne Annuelle:' : 'Annual Average:'}</span>{' '}
                  <span className="text-emerald-700 font-extrabold">
                    {calculateAnnualAverage(currentStudent, classConfig.terms.map(t => t.termName), classConfig.terms)} / 20
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2.5 border-r border-slate-300">{reportLang === 'fr' ? 'Trimestre / Term' : 'Term / Trimestre'}</th>
                      <th className="p-2.5 text-center border-r border-slate-300">{reportLang === 'fr' ? 'Moyenne / 20' : 'Average / 20'}</th>
                      <th className="p-2.5 text-center border-r border-slate-300">{reportLang === 'fr' ? 'Grade' : 'Grade'}</th>
                      <th className="p-2.5 text-center">{reportLang === 'fr' ? 'Appréciation' : 'Appreciation'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {classConfig.terms.map((termInfo, idx) => {
                      const termAvg = calculateTermAverage(currentStudent, termInfo.termName, termInfo.months);
                      const app = getAppreciation(termAvg, reportLang);
                      return (
                        <tr key={termInfo.termName} className="hover:bg-slate-50">
                          <td className="p-3 border-r border-slate-300 font-bold">
                            {reportLang === 'fr' ? `Trimestre ${idx + 1}` : `Term ${idx + 1}`} ({termInfo.termName})
                          </td>
                          <td className="p-3 text-center border-r border-slate-300 font-extrabold text-emerald-700 text-sm">
                            {termAvg} / 20
                          </td>
                          <td className="p-3 text-center border-r border-slate-300 font-bold">
                            {app.grade}
                          </td>
                          <td className="p-3 text-center font-medium">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${app.color}`}>{app.text}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {(() => {
                const annualAvg = calculateAnnualAverage(currentStudent, classConfig.terms.map(t => t.termName), classConfig.terms);
                const annualApp = getAppreciation(annualAvg, reportLang);
                const isPromoted = annualAvg >= 10;
                return (
                  <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">{reportLang === 'fr' ? 'Moyenne Annuelle Générale:' : 'Annual General Average:'}</div>
                        <div className="text-4xl font-extrabold text-emerald-700">{annualAvg} / 20</div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="text-xs text-slate-500 font-semibold">{reportLang === 'fr' ? 'Décision du Conseil / Promotion:' : 'Class Council Decision / Promotion:'}</div>
                        <div className={`text-base font-extrabold px-3 py-1 rounded-lg ${isPromoted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {isPromoted 
                            ? (reportLang === 'fr' ? 'Admis(e) en classe supérieure / Promoted' : 'Promoted to Upper Class') 
                            : (reportLang === 'fr' ? 'Redouble la classe / Repeat Class' : 'Repeat Class')}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 border-t border-slate-200 pt-3">
                      <strong>{reportLang === 'fr' ? 'Appréciation Annuelle:' : 'Annual Appreciation:'}</strong> {annualApp.text} (Grade: {annualApp.grade})
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 pt-8 text-xs font-semibold text-center">
                <div>
                  <p>{reportLang === 'fr' ? 'L\'Enseignant Principal' : 'Class Teacher'}</p>
                  <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p>{reportLang === 'fr' ? 'Le Directeur / Principal' : 'Head Teacher / Principal'}</p>
                  <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p>{reportLang === 'fr' ? 'Signature des Parents' : 'Parent\'s Signature'}</p>
                  <div className="h-16 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: 2018 CURRICULUM REFERENCE */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">2018 Official Curriculum Reference</h2>
                  <p className="text-sm text-slate-500">Official ministerial competences, subjects, sub-competences and appreciation criteria.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-bold text-base flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Official Appreciation Criteria / Critères d'Appréciation</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="font-bold text-red-600">0.0 - 10.99/20 (0.0 - 0.5495/1)</div>
                    <div className="font-semibold">CNA - Competences Not Acquired</div>
                    <div className="text-xs text-slate-500">Compétences Non Acquises [Grade C]</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="font-bold text-amber-600">11 - 14.99/20 (0.55 - 0.7495/1)</div>
                    <div className="font-semibold">CPA - Competences in Process of Acquisition</div>
                    <div className="text-xs text-slate-500">Compétences en Voie d'Acquisition [Grade B]</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="font-bold text-blue-600">15 - 17.99/20 (0.75 - 0.8995/1)</div>
                    <div className="font-semibold">CA - Competences Acquired</div>
                    <div className="text-xs text-slate-500">Compétences Acquises [Grade A]</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="font-bold text-emerald-600">18 - 20.0/20 (0.9 - 1.0/1)</div>
                    <div className="font-semibold">Ept - Expert</div>
                    <div className="text-xs text-slate-500">Expert [Grade A+]</div>
                  </div>
                </div>
              </div>
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
