import React, { useState } from 'react';
import { 
  Language, ReportLanguage, Student, ClassConfig, EvaluationScores 
} from './types';
import { OFFICIAL_COMPETENCES_2018, DEFAULT_CLASS_CONFIG, INITIAL_STUDENTS } from './data/curriculum';
import { 
  calculateMonthlyAverage, calculateTermAverage, calculateAnnualAverage, 
  getAppreciation, getSubjectMaxTotal, getSubjectObtainedTotal, getAllCompetencesMaxTotal 
} from './utils/calculator';
import { 
  BookOpen, Calculator, FileText, Upload, Users, Award, Globe, Sun, Moon, 
  CheckCircle2, ArrowRight, Printer, Sparkles, AlertCircle, HelpCircle, ShieldCheck
} from 'lucide-react';

// Translations for UI navigation & labels (English, French, Hausa)
const UI_TEXT = {
  en: {
    appName: 'Campannetsmart',
    tagline: 'Official 2018 Curriculum Bilingual Marksheet OCR Calculation Engine & Report Card Generator',
    heroHeading: 'Empowering Bilingual Teachers with Deterministic Marksheet Intelligence',
    heroSub: 'Eliminate manual math fatigue and evaluation errors. Campannetsmart instantly converts marksheet photos into official 2018 curriculum monthly, termly, and annual student report cards in separate English and French versions.',
    ctaUpload: 'Upload Marksheet Photo',
    ctaExplore: 'Explore Report Generator',
    tabs: {
      dashboard: 'Overview & Demo',
      ocrEngine: 'Marksheet OCR Engine',
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
    heroSub: 'Éliminez les erreurs de calcul manuel. Campannetsmart convertit instantanément les photos de notes en bulletins officiels mensuels, trimestriels et annuels en versions anglaise et française séparées.',
    ctaUpload: 'Télécharger Photo de Note',
    ctaExplore: 'Explorer les Bulletins',
    tabs: {
      dashboard: 'Accueil & Démo',
      ocrEngine: 'Moteur OCR Notes',
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
    heroSub: 'Cire wahalar lissafin hannu. Campannetsmart yana canza hotunan takardun sakamako zuwa rahotannin watanni, zangon karatu, da shekara a cikin Ingilishi da Faransanci daban-daban.',
    ctaUpload: 'Sanya Hoton Sakamako',
    ctaExplore: 'Bincika Kera Rahoto',
    tabs: {
      dashboard: 'Bita & Gwaji',
      ocrEngine: 'Injin OCR',
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

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [classConfig, setClassConfig] = useState<ClassConfig>(DEFAULT_CLASS_CONFIG);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  // Selected states for report cards and roster editor
  const [selectedStudentId, setSelectedStudentId] = useState<string>(INITIAL_STUDENTS[0].id);
  const [selectedTerm, setSelectedTerm] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].termName);
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_CLASS_CONFIG.terms[0].months[0]);
  const [reportLang, setReportLang] = useState<ReportLanguage>('en');

  // OCR state
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  const t = UI_TEXT[lang];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFileUploadForOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    setOcrError(null);
    setOcrSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ocr-marksheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String, mimeType: file.type })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'OCR processing failed');

        if (data.success && data.data && data.data.students) {
          // Merge or add parsed students
          const newStudents: Student[] = data.data.students.map((parsed: any, idx: number) => ({
            id: parsed.studentId || `EXT_${Date.now()}_${idx}`,
            name: parsed.studentName || `Student ${idx + 1}`,
            gender: 'M',
            dob: '01/01/2015',
            scores: {
              [selectedTerm]: {
                [selectedMonth]: parsed.scores || {}
              }
            }
          }));

          setStudents(prev => [...prev, ...newStudents]);
          setOcrSuccessMsg(`Successfully extracted ${newStudents.length} student marksheet records via AI OCR! Deterministic calculations updated.`);
          setActiveTab('roster');
        }
      } catch (err: any) {
        setOcrError(err.message || 'Failed to parse marksheet image');
      } finally {
        setIsProcessingOcr(false);
      }
    };
    reader.onerror = () => {
      setOcrError('Failed to read image file');
      setIsProcessingOcr(false);
    };
    reader.readAsDataURL(file);
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
      {/* Top Header */}
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
                2018 Curriculum Engine
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
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

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 py-2 border-t border-slate-100 dark:border-slate-700/50">
          {[
            { id: 'dashboard', label: t.tabs.dashboard, icon: BookOpen },
            { id: 'ocrEngine', label: t.tabs.ocrEngine, icon: Upload },
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: DASHBOARD & OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-16">
            {/* Hero Section (2-column design, powerful heading, paragraph, image demo, CTA button) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Official 2018 Bilingual Curriculum Standard</span>
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
                    <Upload className="w-5 h-5" />
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
                    <span>Strictly Deterministic Math</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bilingual (En / Fr)</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Graphic Card */}
              <div className="custom-card rounded-2xl p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950">
                        C1
                      </div>
                      <span className="font-bold text-sm">Competence Engine Active</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                      v2.4 Ready
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Total Competences Evaluated</div>
                        <div className="text-lg font-bold text-emerald-400">6 Core Competences</div>
                      </div>
                      <Award className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Subjects & Sub-Competences</div>
                        <div className="text-lg font-bold text-amber-400">10 Subjects (Oral, Written, Practical, Attitude)</div>
                      </div>
                      <BookOpen className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Appreciation Scale & Grading</div>
                        <div className="text-sm font-semibold text-slate-200">CNA (C) to Expert / A+</div>
                      </div>
                      <Calculator className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between text-xs text-slate-400">
                    <span>Sample Roster Loaded: 2 Students</span>
                    <span className="text-emerald-400 font-medium">Ready for Print</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Benefits Section */}
            <div className="space-y-12 pt-12 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">{t.featuresTitle}</h2>
                <p className="text-slate-600 dark:text-slate-400">{t.featuresSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Upload,
                    title: 'Marksheet OCR Photo Recognition',
                    desc: 'Upload hand-written or printed teacher marksheets. Gemini multimodal AI accurately extracts student scores into structured grades without altering calculations.'
                  },
                  {
                    icon: Calculator,
                    title: 'Deterministic Calculation Engine',
                    desc: 'Monthly sums, termly vertical/horizontal totals, and annual averages are computed using exact ministerial formulas. Zero AI hallucinations in math.'
                  },
                  {
                    icon: FileText,
                    title: 'Separate Bilingual Report Cards',
                    desc: 'Instant generation of Monthly, Termly, and Annual student report cards in dedicated English and French versions adhering to official 2018 terminology.'
                  }
                ].map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="custom-card rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold">{feat.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-12 pt-12 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">{t.pricingTitle}</h2>
                <p className="text-slate-600 dark:text-slate-400">{t.pricingSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="custom-card rounded-2xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                      Free Teacher Demo
                    </span>
                    <h3 className="text-3xl font-extrabold">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Perfect for individual teachers testing the bilingual OCR calculation engine.</p>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Up to 30 student rosters</span></li>
                      <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Monthly & Termly Report Cards</span></li>
                      <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Bilingual English & French</span></li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setActiveTab('ocrEngine')}
                    className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Start Free Demo
                  </button>
                </div>

                <div className="custom-card rounded-2xl p-8 shadow-xl space-y-6 flex flex-col justify-between border-emerald-500 dark:border-emerald-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                    POPULAR
                  </div>
                  <div className="space-y-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 font-semibold text-emerald-700 dark:text-emerald-300">
                      School Enterprise
                    </span>
                    <h3 className="text-3xl font-extrabold">$49 <span className="text-sm font-normal text-slate-500">/ term per school</span></h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">For bilingual primary and secondary schools needing cloud storage and multi-teacher access.</p>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Unlimited student rosters & classes</span></li>
                      <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Annual report cards & archive</span></li>
                      <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Priority AI Marksheet OCR processing</span></li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setActiveTab('ocrEngine')}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition-colors"
                  >
                    Upgrade School Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OCR MARKSHEET PHOTO ENGINE */}
        {activeTab === 'ocrEngine' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="custom-card rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Marksheet Photo OCR Engine</h2>
                  <p className="text-sm text-slate-500">Upload hand-written or printed teacher marksheets for instant AI extraction into structured scores.</p>
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

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center space-y-4 hover:border-emerald-500 transition-colors">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Drop your marksheet photo here, or browse</h3>
                  <p className="text-xs text-slate-500">Supports PNG, JPG, WEBP up to 50MB</p>
                </div>
                <div>
                  <label className="inline-block cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all">
                    <span>{isProcessingOcr ? 'Processing OCR...' : 'Select Marksheet Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUploadForOcr}
                      disabled={isProcessingOcr}
                    />
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="font-semibold flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>How Campannetsmart OCR Works:</span>
                </div>
                <p>1. The OCR engine scans student names, subject scores (Oral, Written, Practical, Attitude).</p>
                <p>2. Data is securely ingested into your active class roster.</p>
                <p>3. <strong>Strict rule:</strong> AI never computes averages or grades. All mathematical calculations are 100% deterministic in code.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROSTER & MARKS MANAGER */}
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

            {/* Student Tabs */}
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

            {/* Marks Entry Table */}
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

        {/* TAB 4: MONTHLY REPORT CARDS */}
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

            {/* Official Monthly Report Card Printable View */}
            <div className="custom-card rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 report-page bg-white text-slate-900 border-2 border-slate-300">
              {/* Header */}
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

              {/* Student Bio Info */}
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

              {/* Scores Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2.5 border-r border-slate-300">{reportLang === 'fr' ? 'Compétence & Matière' : 'Competence & Subject'}</th>
                      <th className="p-2 text-center border-r border-slate-300">Oral</th>
                      <th className="p-2 text-center border-r border-slate-300">Written / Écrit</th>
                      <th className="p-2 text-center border-r border-slate-300">Practical / Pratique</th>
                      <th className="p-2 text-center border-r border-slate-300">Attitude</th>
                      <th className="p-2 text-center border-r border-slate-300">Total / {(() => {
                        let maxAll = 0;
                        OFFICIAL_COMPETENCES_2018.forEach(c => c.subjects.forEach(s => maxAll += getSubjectMaxTotal(s)));
                        return maxAll;
                      })()}</th>
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

              {/* Summary & Appreciation Box */}
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

              {/* Signatures */}
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

        {/* TAB 5: TERMLY REPORT CARDS */}
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

            {/* Official Termly Report Card Printable View */}
            <div className="custom-card rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 report-page bg-white text-slate-900 border-2 border-slate-300">
              {/* Header */}
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

              {/* Student Bio Info */}
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

              {/* Termly Horizontal & Vertical Totals Table */}
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

              {/* Termly Average Summary */}
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

              {/* Signatures */}
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

        {/* TAB 6: ANNUAL REPORT CARDS */}
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

            {/* Official Annual Report Card Printable View */}
            <div className="custom-card rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 report-page bg-white text-slate-900 border-2 border-slate-300">
              {/* Header */}
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

              {/* Student Bio Info */}
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

              {/* Annual Termly Summary Table */}
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

              {/* Annual General Average & Promotion Decision */}
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

              {/* Signatures */}
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

        {/* TAB 7: 2018 CURRICULUM REFERENCE */}
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

              {/* Appreciation Criteria Legend */}
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

              {/* 6 Competences Glossary */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Official 6 Competences & 10 Subjects</h3>
                <div className="space-y-4">
                  {OFFICIAL_COMPETENCES_2018.map(comp => (
                    <div key={comp.id} className="custom-card rounded-xl p-5 space-y-3 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 text-base">
                        {lang === 'fr' ? comp.titleFr : comp.titleEn}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {comp.subjects.map(sub => (
                          <div key={sub.code} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-xs space-y-1">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{lang === 'fr' ? sub.nameFr : sub.nameEn}</div>
                            <div className="text-slate-500 flex justify-between">
                              <span>Code: {sub.code}</span>
                              <span>Max: {getSubjectMaxTotal(sub)} marks (Oral:{sub.maxOral}, Written:{sub.maxWritten}, Practical:{sub.maxPractical}, Attitude:{sub.maxAttitude})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p>{t.footerText}</p>
          <p>© 2026 Campannetsmart Engine • Official Bilingual Primary & Secondary Evaluation System.</p>
        </div>
      </footer>
    </div>
  );
}
