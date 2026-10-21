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
  GraduationCap, MessageSquare, Send, CheckSquare, Info, RotateCcw
} from 'lucide-react';

const UI_TEXT = {
  en: {
    appName: 'Campannetsmart (DEMO)',
    tagline: 'Official 2018 Curriculum Bilingual Marksheet OCR Calculation Engine & Report Card Generator',
    heroHeading: 'Campannetsmart Demo — Bilingual Marksheet Intelligence',
    heroSub: 'Explore the interactive demo version. Upload mock marksheet parts, merge them, run OCR proposals, and generate bilingual report cards.',
    ctaUpload: 'Start Demo Walkthrough',
    ctaExplore: 'Explore Report Generator',
    demoBannerEn: 'DEMO VERSION — For testing and demonstration only. Do not enter real student data.',
    demoBannerFr: 'VERSION DÉMO — Pour les tests et démonstrations uniquement. Ne saisissez pas de données réelles d’élèves.',
    tabs: {
      dashboard: 'Demo Home',
      notice: 'Demo Notice & Guide',
      ocrEngine: '1. Upload & Merge',
      ocrReview: '2. OCR Review',
      roster: '3. Marks Manager',
      monthly: '4. Monthly Reports',
      termly: '5. Termly Reports',
      annual: '6. Annual Reports',
      curriculum: 'Curriculum 2018'
    },
    footerText: 'Campannetsmart Demo • Built strictly with deterministic mathematical formulas. AI never determines student marks.',
    printReport: 'Print Official Report Card',
    selectStudent: 'Select Student',
    selectTerm: 'Select Term',
    selectMonth: 'Select Month',
    reportLang: 'Report Language Version',
  },
  fr: {
    appName: 'Campannetsmart (DÉMO)',
    tagline: 'Moteur de Calcul OCR de Notes Bilingue & Générateur de Bulletins (Programme Officiel 2018)',
    heroHeading: 'Démo Campannetsmart — Intelligence Bilingue des Notes',
    heroSub: 'Explorez la version démo interactive. Téléchargez des parties fictives de notes, fusionnez-les et générez des bulletins bilingues.',
    ctaUpload: 'Démarrer la Visite Guidée',
    ctaExplore: 'Explorer les Bulletins',
    demoBannerEn: 'DEMO VERSION — For testing and demonstration only. Do not enter real student data.',
    demoBannerFr: 'VERSION DÉMO — Pour les tests et démonstrations uniquement. Ne saisissez pas de données réelles d’élèves.',
    tabs: {
      dashboard: 'Accueil Démo',
      notice: 'Avis Démo & Guide',
      ocrEngine: '1. Télécharger & Fusionner',
      ocrReview: '2. Révision OCR',
      roster: '3. Gestion des Notes',
      monthly: '4. Bulletins Mensuels',
      termly: '5. Bulletins Trimestriels',
      annual: '6. Bulletins Annuels',
      curriculum: 'Curriculum 2018'
    },
    footerText: 'Démo Campannetsmart • Calculs mathématiques strictement déterministes. L\'IA ne détermine jamais les notes.',
    printReport: 'Imprimer le Bulletin Officiel',
    selectStudent: 'Sélectionner l\'Élève',
    selectTerm: 'Sélectionner le Trimestre',
    selectMonth: 'Sélectionner le Mois',
    reportLang: 'Version Linguistique du Bulletin',
  },
  ha: {
    appName: 'Campannetsmart (DEMO)',
    tagline: 'Injin Lissafin Takardun Sakamako da Kera Rahoton Dalibai ta Harsunan Biyu',
    heroHeading: 'Gwajin Campannetsmart — Kwarewar Lissafi da Harsunan Biyu',
    heroSub: 'Gwada sigar gwaji ta musamman ba tare da ainihin bayanai ba.',
    ctaUpload: 'Fara Gwaji',
    ctaExplore: 'Bincika Kera Rahoto',
    demoBannerEn: 'DEMO VERSION — For testing and demonstration only. Do not enter real student data.',
    demoBannerFr: 'VERSION DÉMO — Pour les tests et démonstrations uniquement. Ne saisissez pas de données réelles d’élèves.',
    tabs: {
      dashboard: 'Gida',
      notice: 'Sanarwa',
      ocrEngine: '1. Sanya & Haɗa',
      ocrReview: '2. Bita',
      roster: '3. Maki',
      monthly: '4. Wata',
      termly: '5. Zango',
      annual: '6. Shekara',
      curriculum: 'Tsarin 2018'
    },
    footerText: 'Campannetsmart Demo • Lissafi ne mai inganci ba tare da kuskure ba.',
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

  const [classConfig, setClassConfig] = useState<ClassConfig>({
    ...DEFAULT_CLASS_CONFIG,
    schoolNameEn: 'Demo School / École Démo',
    schoolNameFr: 'École Démo / Demo School'
  });
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(INITIAL_STUDENTS[0].id);
  const [selectedTerm, setSelectedTerm] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].termName);
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].months[0]);
  const [reportLang, setReportLang] = useState<ReportLanguage>('en');

  const [marksheetParts, setMarksheetParts] = useState<MarksheetPart[]>([]);
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [mergedPreviewUrl, setMergedPreviewUrl] = useState<string | null>(null);

  const [activeBatch, setActiveBatch] = useState<MarksheetBatch | null>(null);

  const t = UI_TEXT[lang];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const resetDemoData = () => {
    if (window.confirm('Reset Demo Data? This will restore original sample roster and sample marks, and clear uploaded photos.')) {
      setStudents(INITIAL_STUDENTS);
      setMarksheetParts([]);
      setMergedPreviewUrl(null);
      setActiveBatch(null);
      setOcrError(null);
      setOcrSuccessMsg('Demo data successfully reset to initial sample state.');
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

  const runQualityChecksAndMerge = async () => {
    if (marksheetParts.length === 0) {
      setOcrError('Please upload at least one marksheet photo part.');
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

      setProgressStep('idle');
      setOcrSuccessMsg('Successfully merged demo parts! Ready for OCR extraction.');
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
          batchId: data.data.batchId || `DEMO_BATCH_${Date.now()}`,
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
            confidence: st.confidence || 0.95,
            scores: st.scores
          }))
        };

        setActiveBatch(batch);
        setProgressStep('reviewing');
        setOcrSuccessMsg('OCR proposals extracted successfully! Redirecting to review.');
        setTimeout(() => setActiveTab('ocrReview'), 600);
      } else {
        throw new Error('Incomplete data returned from OCR engine.');
      }
    } catch (err: any) {
      setOcrError(err.message || 'OCR recognition failed. Please retry.');
      setProgressStep('idle');
    }
  };

  const confirmAndTransferMarks = () => {
    if (!activeBatch) return;

    setStudents(prev => prev.map(existingStudent => {
      const matchedExtracted = activeBatch.students.find(es => es.id === existingStudent.id);
      if (!matchedExtracted) return existingStudent;

      const studentScores = JSON.parse(JSON.stringify(existingStudent.scores));
      if (!studentScores[activeBatch.term]) studentScores[activeBatch.term] = {};
      if (!studentScores[activeBatch.term][activeBatch.month]) studentScores[activeBatch.term][activeBatch.month] = {};

      Object.keys(matchedExtracted.scores).forEach(subCode => {
        const cells = matchedExtracted.scores[subCode];
        studentScores[activeBatch.term][activeBatch.month][subCode] = {
          oral: cells.oral.value,
          written: cells.written.value,
          practical: cells.practical.value,
          attitude: cells.attitude.value
        };
      });

      return {
        ...existingStudent,
        scores: studentScores
      };
    }));

    setActiveBatch(prev => prev ? { ...prev, isLocked: true, lockedAt: new Date().toLocaleString() } : null);
    alert('Demo marks successfully confirmed, locked, and transferred to monthly report cards!');
    setActiveTab('monthly');
  };

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-950'}`}>
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold uppercase tracking-wider flex flex-col sm:flex-row justify-center items-center gap-2 no-print shadow-inner z-50">
        <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px]">EN</span>
        <span>{t.demoBannerEn}</span>
        <span className="hidden sm:inline">|</span>
        <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px]">FR</span>
        <span>{t.demoBannerFr}</span>
        <button
          onClick={resetDemoData}
          className="ml-4 px-3 py-1 bg-slate-950 text-amber-300 hover:bg-slate-900 rounded text-[11px] font-extrabold flex items-center space-x-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              D
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                Demo Sandbox Environment
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
                    lang === l ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
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
            { id: 'notice', label: t.tabs.notice, icon: Info },
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
                    ? 'bg-amber-600 text-white shadow-sm' 
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
        {activeTab === 'dashboard' && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo Sandbox Version</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {t.heroHeading}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.heroSub}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('notice')}
                    className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-600/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <Info className="w-5 h-5" />
                    <span>{t.ctaUpload}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    onClick={() => setActiveTab('ocrEngine')}
                    className="flex items-center space-x-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-md transition-all"
                  >
                    <Layers className="w-5 h-5 text-amber-400" />
                    <span>Start Demo Workflow</span>
                  </button>
                </div>
              </div>

              <div className="custom-card rounded-2xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950">
                        SB
                      </div>
                      <span className="font-bold text-sm">Demo Sandbox Active</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                      Mock Data Only
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Sample School</div>
                        <div className="text-lg font-bold text-amber-400">Demo School / École Démo</div>
                      </div>
                      <ShieldCheck className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notice' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Demo Notice & Walkthrough Guide</h2>
                  <p className="text-sm text-slate-500">Important information regarding demo capabilities, OCR proposals, and the live production version.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-2">
                  <div className="font-bold text-amber-600">What this Demo Can Do</div>
                  <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Upload multiple marksheet photo parts.</li>
                    <li>Merge and reorder parts vertically.</li>
                    <li>Extract mock OCR proposals via Gemini.</li>
                    <li>Run 100% deterministic math calculations.</li>
                    <li>Generate separate English and French report cards.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-2">
                  <div className="font-bold text-emerald-600">Live Production Version</div>
                  <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Secure multi-school database accounts (Supabase).</li>
                    <li>Strict Row Level Security (RLS) tenant isolation.</li>
                    <li>Official teacher verification workflows and audit trails.</li>
                    <li>Permanent cloud storage for official school marksheets.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold text-base">Demo Walkthrough Steps:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border"><strong>Step 1:</strong> Upload marksheet parts in tab 1.</div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border"><strong>Step 2:</strong> Reorder and merge parts.</div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border"><strong>Step 3:</strong> Run OCR extraction proposals.</div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border"><strong>Step 4:</strong> Review extracted marks in tab 2.</div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border"><strong>Step 5:</strong> View Monthly Report Card in tab 4.</div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border"><strong>Step 6:</strong> Switch between English and French versions.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ocrEngine' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">1. Upload & Merge Marksheet Parts (Demo)</h2>
              <p className="text-sm text-slate-500">Upload multiple photos of the demo marksheet, reorder them, and merge them into a composite image.</p>

              {ocrError && <div className="p-4 rounded bg-red-50 text-red-700 text-sm">{ocrError}</div>}
              {ocrSuccessMsg && <div className="p-4 rounded bg-emerald-50 text-emerald-700 text-sm">{ocrSuccessMsg}</div>}

              <div className="border-2 border-dashed rounded-2xl p-8 text-center space-y-4">
                <Upload className="w-8 h-8 text-amber-600 mx-auto" />
                <label className="inline-block cursor-pointer bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold text-sm">
                  <span>Select Demo Photo Parts</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddMarksheetParts} />
                </label>
              </div>

              {marksheetParts.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-bold text-base">Uploaded Parts ({marksheetParts.length})</h3>
                  <div className="space-y-3">
                    {marksheetParts.map((part, index) => (
                      <div key={part.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                        <div className="flex items-center space-x-4">
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
                          <img src={part.previewUrl} alt="Part" className="w-14 h-14 object-cover rounded-lg" style={{ transform: `rotate(${part.rotation}deg)` }} />
                          <span className="text-sm font-semibold">{part.file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => rotatePart(part.id)} className="p-2 rounded bg-white dark:bg-slate-700 text-xs font-semibold flex items-center"><RotateCw className="w-3.5 h-3.5 mr-1" /> Rotate</button>
                          <button onClick={() => setMarksheetParts(prev => prev.filter(p => p.id !== part.id))} className="p-2 rounded bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={runQualityChecksAndMerge} className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl">Merge Demo Parts</button>
                </div>
              )}

              {mergedPreviewUrl && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-bold text-base text-amber-600">Merged Composite Preview Ready</h3>
                  <div className="max-h-64 overflow-hidden rounded-xl border bg-slate-900 flex justify-center">
                    <img src={mergedPreviewUrl} alt="Merged" className="max-h-64 object-contain" />
                  </div>
                  <button onClick={sendMergedImageToOcr} className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl">Send to OCR Proposal Engine</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ocrReview' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">2. OCR Proposals & Verification (Demo)</h2>
              {!activeBatch ? (
                <div className="text-center py-12 text-slate-500">No active demo OCR batch. Please upload and merge parts in Tab 1 first.</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                    <span>Demo Batch ID: <strong>{activeBatch.batchId}</strong></span>
                    <button onClick={confirmAndTransferMarks} className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow">Confirm Demo Marks</button>
                  </div>
                  <div className="space-y-4">
                    {activeBatch.students.map(st => (
                      <div key={st.id} className="p-4 rounded-xl border bg-white dark:bg-slate-800 space-y-2">
                        <div className="font-bold text-base">{st.name} ({st.id}) — Confidence: {(st.confidence * 100).toFixed(0)}%</div>
                        <div className="text-xs text-slate-500">Extracted scores ready for confirmation.</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold">3. Demo Student Roster & Marks Manager</h2>
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

        {activeTab === 'monthly' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-xl font-bold">4. Monthly Report Card (Demo)</h2>
              <button onClick={() => window.print()} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center"><Printer className="w-4 h-4 mr-1" /> Print Report</button>
            </div>
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border-2 border-amber-300">
              <div className="text-center border-b-2 pb-4">
                <div className="text-xs font-bold text-amber-600 uppercase">DEMO SCHOOL / ÉCOLE DÉMO</div>
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

        {activeTab === 'termly' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-xl font-bold">5. Termly Report Card (Demo)</h2>
              <button onClick={() => window.print()} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center"><Printer className="w-4 h-4 mr-1" /> Print Report</button>
            </div>
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border-2 border-amber-300">
              <div className="text-center border-b-2 pb-4">
                <div className="text-xs font-bold text-amber-600 uppercase">DEMO SCHOOL / ÉCOLE DÉMO</div>
                <h1 className="text-xl font-extrabold uppercase">{classConfig.schoolNameEn}</h1>
                <div className="text-lg font-bold uppercase pt-2">Official Termly Report Card</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'annual' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-xl font-bold">6. Annual Report Card (Demo)</h2>
              <button onClick={() => window.print()} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center"><Printer className="w-4 h-4 mr-1" /> Print Report</button>
            </div>
            <div className="custom-card rounded-2xl p-8 space-y-6 report-page bg-white text-slate-900 border-2 border-amber-300">
              <div className="text-center border-b-2 pb-4">
                <div className="text-xs font-bold text-amber-600 uppercase">DEMO SCHOOL / ÉCOLE DÉMO</div>
                <h1 className="text-xl font-extrabold uppercase">{classConfig.schoolNameEn}</h1>
                <div className="text-lg font-bold uppercase pt-2">Official Annual Report Card</div>
              </div>
            </div>
          </div>
        )}

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
          <p>© 2026 Campannetsmart Demo • For Testing and Demonstration Only.</p>
        </div>
      </footer>
    </div>
  );
}
