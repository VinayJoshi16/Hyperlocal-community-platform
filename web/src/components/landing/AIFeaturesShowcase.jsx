import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2, Languages, ShieldAlert, SmilePlus, Lightbulb,
  ShieldCheck, Search, Images, Zap, Check, X, Sparkles
} from 'lucide-react'
import { fadeUpSmall, viewportOnce } from './motionPresets'

/* ── Individual premium live demos ───────────────────────────────────────── */

function TextEnhanceDemo() {
  const pairs = [
    ['gng to socty mtng 6pm', 'Heading to the society meeting at 6 PM.'],
    ['ppl bring chairs pls', 'Please bring your own chairs, everyone!'],
    ['watr leak in B-block fix asap', 'Water leakage detected in B-block. Needs immediate attention.'],
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % pairs.length), 3800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 space-y-2.5 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Raw Input</span>
        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-widest flex items-center gap-1">
          <Sparkles size={8} /> AI Enhanced
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-mono text-stone-400 line-through bg-stone-100 px-2.5 py-1.5 rounded">
          {pairs[i][0]}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.3 }}
            className="text-[11.5px] font-semibold text-[#1C1917] bg-white border border-stone-150 px-3 py-2 rounded-lg shadow-sm"
          >
            {pairs[i][1]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

function TranslateDemo() {
  const langs = [
    { code: 'EN', lang: 'English', text: 'Water supply resumes at 6 PM.' },
    { code: 'हि', lang: 'Hindi', text: 'जल आपूर्ति शाम 6 बजे शुरू होगी।' },
    { code: 'मर', lang: 'Marathi', text: 'पाणीपुरवठा संध्याकाळी ६ वाजता सुरू होईल.' },
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % langs.length), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 flex flex-col justify-between h-24 shadow-inner">
      <div className="flex justify-between items-center text-[9px] font-bold text-stone-400 uppercase tracking-wider">
        <span>Translation Active</span>
        <span className="text-cyan-600">{langs[i].lang}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-8 h-6 rounded-md bg-cyan-100 text-cyan-700 font-extrabold flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">
          {langs[i].code}
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-bold text-[#1C1917] truncate flex-1"
          >
            {langs[i].text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

function SpamDemo() {
  const [score, setScore] = useState(96)
  useEffect(() => {
    const t = setInterval(() => {
      setScore((s) => (s === 96 ? 98 : 96))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 space-y-2.5 shadow-inner">
      <div className="flex items-center justify-between text-[9px] font-bold text-stone-400 uppercase tracking-wider">
        <span>Spam Filter Integrity</span>
        <span className="text-emerald-600 font-extrabold">{score}% Trust Score</span>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden shadow-inner">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            animate={{ width: `${score}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <Check size={11} className="stroke-[3]" /> Clean — auto-approved
          </span>
          <span className="text-[9px] font-mono text-stone-400">Rules Passed</span>
        </div>
      </div>
    </div>
  )
}

function SentimentDemo() {
  const [i, setI] = useState(0)
  const states = [
    { emoji: '😊', label: 'Positive', barColor: 'from-emerald-400 to-emerald-500', w: '88%' },
    { emoji: '😐', label: 'Neutral', barColor: 'from-amber-300 to-amber-400', w: '52%' },
    { emoji: '😟', label: 'Concerned', barColor: 'from-red-400 to-red-500', w: '18%' },
  ]
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % states.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 flex items-center gap-3 shadow-inner h-24">
      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center flex-shrink-0">
        <motion.span 
          key={i} 
          initial={{ scale: 0.5, rotate: -15 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="text-2xl leading-none"
        >
          {states[i].emoji}
        </motion.span>
      </div>
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${states[i].barColor}`}
            animate={{ width: states[i].w }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          {states[i].label} Tone
        </p>
      </div>
    </div>
  )
}

function SuggestDemo() {
  const categories = [
    ['🎉 Diwali', '📢 Notice', '🧹 Clean-up'],
    ['🐈 Lost Pet', '📦 Delivery', '💡 General'],
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % categories.length), 3400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 space-y-2 shadow-inner h-24 flex flex-col justify-center">
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Suggested Tags</span>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {categories[i].map((c, idx) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -4 }}
              transition={{ delay: idx * 0.1, duration: 0.25 }}
              className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-150 shadow-sm"
            >
              {c}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ModerationDemo() {
  const [flagged, setFlagged] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setFlagged((v) => !v), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 flex items-center justify-between h-24 shadow-inner">
      <div className="flex flex-col justify-center">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Gateway Status</span>
        <span className="text-[10px] text-[#78716C] font-semibold mt-0.5 font-sans">Automated screening</span>
      </div>
      <AnimatePresence mode="wait">
        {flagged ? (
          <motion.span
            key="flagged"
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[10.5px] font-extrabold uppercase tracking-wider shadow-sm"
          >
            <X size={12} className="stroke-[3]" /> Flagged
          </motion.span>
        ) : (
          <motion.span
            key="approved"
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10.5px] font-extrabold uppercase tracking-wider shadow-sm"
          >
            <Check size={12} className="stroke-[3]" /> Approved
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchDemo() {
  const queries = ['plumber near B-block', 'parking rule update', 'lost keycard']
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % queries.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 space-y-2 shadow-inner">
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Semantic Search</span>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-stone-200 shadow-sm">
        <Search size={12} className="text-[#2563EB] flex-shrink-0" />
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="text-[11px] font-bold text-stone-600 truncate"
          >
            {queries[i]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

function MediaDemo() {
  const [optimizing, setOptimizing] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setOptimizing((o) => !o), 2400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 flex items-center justify-between h-24 shadow-inner">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Images size={14} className="text-indigo-600" />
        </div>
        <div>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Media Engine</span>
          <span className="text-[10px] font-bold text-stone-600">Video & Image uploads</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {optimizing ? (
          <motion.span
            key="opt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded"
          >
            Optimizing...
          </motion.span>
        ) : (
          <motion.span
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded"
          >
            Optimized
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function RealtimeDemo() {
  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 flex items-center justify-between h-24 shadow-inner">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-violet-400"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
        </span>
        <div>
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Pipeline Speed</span>
          <span className="text-[10px] font-bold text-[#1C1917]">Processed in <b className="text-violet-600">0.8s</b></span>
        </div>
      </div>
      <Zap size={15} className="text-violet-500 fill-violet-50" />
    </div>
  )
}

/* ── Grouped Features Data ───────────────────────────────────────────────── */

const categories = [
  {
    id: 'content',
    label: 'Writing & Translation',
    description: 'Tools that keep communications clean, clear, and readable across all language groups.',
    color: 'from-violet-500 to-indigo-600',
    icon: Wand2,
    features: [
      {
        icon: Wand2,
        tile: 'bg-violet-50 border-violet-100',
        tone: 'text-violet-600',
        title: 'AI Text Enhancement',
        tagline: 'Converts typos and shorthand to polite, structured updates.',
        body: 'Automatically cleans up spelling errors, improves formatting, and transforms quick notes into polite and legible community bulletins without changing original meanings.',
        Demo: TextEnhanceDemo
      },
      {
        icon: Languages,
        tile: 'bg-cyan-50 border-cyan-100',
        tone: 'text-cyan-600',
        title: 'Instant AI Translation',
        tagline: 'Bridges neighbor language gaps instantly.',
        body: 'Translates feed bulletins and chat logs into multiple community languages on-the-fly, ensuring no neighbor is left out of critical announcements.',
        Demo: TranslateDemo
      },
      {
        icon: Lightbulb,
        tile: 'bg-blue-50 border-blue-100',
        tone: 'text-blue-600',
        title: 'Smart Categorization',
        tagline: 'Understands and tags posts dynamically.',
        body: 'Analyzes post text as residents write, recommending the most relevant category tags (e.g. notices, events, services) to catalog posts accurately.',
        Demo: SuggestDemo
      }
    ]
  },
  {
    id: 'safety',
    label: 'Safety & Moderation',
    description: '24/7 protection keeping your feed constructive, safe, and spam-free.',
    color: 'from-emerald-500 to-teal-600',
    icon: ShieldCheck,
    features: [
      {
        icon: ShieldAlert,
        tile: 'bg-rose-50 border-rose-100',
        tone: 'text-rose-600',
        title: 'Anti-Spam Shield',
        tagline: 'Keeps commercial spam and scrapers out.',
        body: 'Applies real-time spam diagnostics to flag bot activity, scraper links, and commercial advertising before they disturb the community feed.',
        Demo: SpamDemo
      },
      {
        icon: ShieldCheck,
        tile: 'bg-emerald-50 border-emerald-100',
        tone: 'text-emerald-600',
        title: 'Automated Moderation',
        tagline: 'Real-time media and text safety screening.',
        body: 'Reviews text content and image attachments against configured community guidelines pre-publish to shield kids and residents from abuse.',
        Demo: ModerationDemo
      },
      {
        icon: SmilePlus,
        tile: 'bg-amber-50 border-amber-100',
        tone: 'text-amber-600',
        title: 'Sentiment Monitoring',
        tagline: 'Flags hostile discussions before they grow.',
        body: 'Monitors long comment sections for sudden spikes in hostile or aggressive vocabulary, letting administrators step in early to resolve issues.',
        Demo: SentimentDemo
      }
    ]
  },
  {
    id: 'platform',
    label: 'Search & Performance',
    description: 'Behind-the-scenes engineering delivering high speeds and smart lookups.',
    color: 'from-blue-500 to-cyan-600',
    icon: Zap,
    features: [
      {
        icon: Search,
        tile: 'bg-stone-100 border-stone-200',
        tone: 'text-stone-600',
        title: 'Intelligent Search',
        tagline: 'Find information by meaning, not just words.',
        body: 'Understands query intent rather than matching strings. Searching for "leaking pipe" automatically suggests posts containing "plumbing repairs".',
        Demo: SearchDemo
      },
      {
        icon: Images,
        tile: 'bg-indigo-50 border-indigo-100',
        tone: 'text-indigo-600',
        title: 'Media Optimization',
        tagline: 'Fast loading formats for every device.',
        body: 'Compresses uploaded photos and video attachments automatically into highly optimized WebP and AVIF formats, ensuring instant loads on slow networks.',
        Demo: MediaDemo
      },
      {
        icon: Zap,
        tile: 'bg-violet-50 border-violet-100',
        tone: 'text-violet-600',
        title: 'Sub-Second Speeds',
        tagline: 'Parallel pipelines optimize in real-time.',
        body: 'Executes parallel translation, moderation, and tag assignment pipelines in under a second per post to keep app navigation snappy.',
        Demo: RealtimeDemo
      }
    ]
  }
]

export default function AIFeaturesShowcase() {
  const [activeCategoryId, setActiveCategoryId] = useState('content')
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)

  const activeCategory = categories.find((c) => c.id === activeCategoryId)
  const activeFeature = activeCategory.features[activeFeatureIndex]

  // Reset active feature index when changing category manually
  const handleCategoryChange = (id) => {
    setActiveCategoryId(id)
    setActiveFeatureIndex(0)
    // Momentarily pause autoplay to prevent instant jumping
    setIsAutoplayPaused(true)
    setTimeout(() => setIsAutoplayPaused(false), 4000)
  }

  const handleFeatureChange = (index) => {
    setActiveFeatureIndex(index)
    setIsAutoplayPaused(true)
    setTimeout(() => setIsAutoplayPaused(false), 4000)
  }

  // 2-Second Autoplay Cycle
  useEffect(() => {
    if (isAutoplayPaused) return

    const interval = setInterval(() => {
      const catIndex = categories.findIndex((c) => c.id === activeCategoryId)
      const nextFeatureIndex = activeFeatureIndex + 1

      if (nextFeatureIndex < activeCategory.features.length) {
        // Advance to next feature in the same category
        setActiveFeatureIndex(nextFeatureIndex)
      } else {
        // Wrap to the next category
        const nextCatIndex = (catIndex + 1) % categories.length
        const nextCat = categories[nextCatIndex]
        setActiveCategoryId(nextCat.id)
        setActiveFeatureIndex(0)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [activeCategoryId, activeFeatureIndex, isAutoplayPaused, activeCategory.features.length])

  // Get active color accents for glowing points
  const getGlowStyles = (catId) => {
    switch (catId) {
      case 'content':
        return {
          shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.14)]',
          border: 'border-violet-300',
          dot: 'bg-violet-500',
          bgGlow: 'bg-violet-500/5'
        }
      case 'safety':
        return {
          shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.14)]',
          border: 'border-emerald-300',
          dot: 'bg-emerald-500',
          bgGlow: 'bg-emerald-500/5'
        }
      case 'platform':
        return {
          shadow: 'shadow-[0_0_20px_rgba(37,99,235,0.14)]',
          border: 'border-blue-300',
          dot: 'bg-blue-500',
          bgGlow: 'bg-blue-500/5'
        }
      default:
        return {}
    }
  }

  const activeGlow = getGlowStyles(activeCategoryId)

  return (
    <section 
      className="relative bg-[#FAFAF9] py-24 md:py-28 px-6 w-full overflow-hidden"
      onMouseEnter={() => setIsAutoplayPaused(true)}
      onMouseLeave={() => setIsAutoplayPaused(false)}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-150 text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider mb-4">
            <Sparkles size={11} className="fill-blue-50" /> Community Intelligence Suite
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1C1917] tracking-tight bg-gradient-to-r from-stone-900 via-stone-800 to-stone-700 bg-clip-text text-transparent">
            Core Platform Features
          </h2>
          <p className="mt-3 text-[14px] text-[#78716C] leading-relaxed font-semibold">
            Hover over this section to pause autoplay, or click to explore the smart tools running behind your neighborhood feed.
          </p>
        </div>

        {/* 1. Category Switcher (Tabs) */}
        <div className="flex justify-center p-1 bg-stone-200/60 rounded-xl max-w-lg mx-auto mb-10 border border-stone-200/40 relative z-10">
          {categories.map((cat) => {
            const CatIcon = cat.icon
            const isCatActive = cat.id === activeCategoryId
            const catGlow = getGlowStyles(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-bold transition-all relative ${
                  isCatActive ? 'text-stone-900' : 'text-[#78716C] hover:text-stone-900'
                }`}
              >
                {isCatActive && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className={`absolute inset-0 bg-white rounded-lg border border-stone-200/50 ${catGlow.shadow}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <CatIcon size={14} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{cat.label}</span>
                {isCatActive && (
                  <span className={`relative z-10 w-1.5 h-1.5 rounded-full ${catGlow.dot} animate-pulse`} />
                )}
              </button>
            )
          })}
        </div>

        {/* 2. Main Feature Explorer Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[460px]">
          {/* Sub-Feature selector list */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
            <span className="text-[10px] font-extrabold text-[#78716C] uppercase tracking-wider px-2 block mb-1">
              Select Feature to View
            </span>
            {activeCategory.features.map((feat, index) => {
              const FeatIcon = feat.icon
              const isFeatActive = index === activeFeatureIndex
              return (
                <button
                  key={feat.title}
                  onClick={() => handleFeatureChange(index)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                    isFeatActive
                      ? `bg-white ${activeGlow.border} ${activeGlow.shadow} translate-x-1`
                      : 'bg-transparent border-transparent hover:bg-white/40 hover:border-stone-200/40'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm transition-colors relative ${
                      isFeatActive ? feat.tile : 'bg-stone-100 border-stone-200 text-stone-500'
                    }`}
                  >
                    <FeatIcon size={16} className={isFeatActive ? feat.tone : 'text-stone-500'} strokeWidth={2.2} />
                    {isFeatActive && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeGlow.dot}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${activeGlow.dot}`} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-extrabold text-[#1C1917] tracking-tight">{feat.title}</h4>
                      {isFeatActive && (
                        <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest animate-pulse">Active</span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-[#78716C] leading-snug font-semibold mt-0.5 truncate">
                      {feat.tagline}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Large Showcase Panel */}
          <div className="lg:col-span-7 flex">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategoryId}-${activeFeatureIndex}`}
                initial={{ opacity: 0, scale: 0.98, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -10 }}
                transition={{ duration: 0.25 }}
                className={`w-full bg-white border p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${activeGlow.border} ${activeGlow.shadow}`}
              >
                {/* Embedded Ambient Glow Behind Card */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] pointer-events-none transition-colors duration-300 ${activeGlow.bgGlow}`} />

                <div className="relative z-10">
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${activeFeature.tile}`}>
                      <activeFeature.icon size={20} className={activeFeature.tone} strokeWidth={2.2} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider block">
                        {activeCategory.label}
                      </span>
                      <h3 className="text-lg font-black text-[#1C1917] tracking-tight mt-0.5">
                        {activeFeature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#78716C] leading-relaxed font-semibold mb-8">
                    {activeFeature.body}
                  </p>
                </div>

                <div className="border-t border-dashed border-stone-200/80 pt-6 relative z-10">
                  <div className="text-[10px] font-extrabold text-[#78716C] uppercase tracking-wider mb-3">
                    Live Demo Simulation
                  </div>
                  <activeFeature.Demo />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
