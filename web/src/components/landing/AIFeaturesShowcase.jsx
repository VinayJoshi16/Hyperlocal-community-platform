import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2, Languages, ShieldAlert, SmilePlus, Lightbulb,
  ShieldCheck, Search, Images, Zap, Check, X, ArrowRight, Sparkles
} from 'lucide-react'
import { fadeUpSmall, stagger, viewportOnce } from './motionPresets'

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
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 space-y-2.5 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Raw Input</span>
        <span className="text-[9px] font-bold text-violet-500 uppercase tracking-widest flex items-center gap-1">
          <Sparkles size={8} /> AI Enhanced
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-mono text-stone-400 line-through bg-stone-100 px-2 py-1 rounded">
          {pairs[i][0]}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.3 }}
            className="text-[11.5px] font-semibold text-[#1C1917] bg-white border border-stone-150 px-2.5 py-1.5 rounded-lg shadow-sm"
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
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 flex flex-col justify-between h-20 shadow-inner">
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
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 space-y-2.5 shadow-inner">
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
    { emoji: '😊', label: 'Positive', color: 'bg-emerald-500', barColor: 'from-emerald-400 to-emerald-500', w: '88%' },
    { emoji: '😐', label: 'Neutral', color: 'bg-amber-400', barColor: 'from-amber-300 to-amber-400', w: '52%' },
    { emoji: '😟', label: 'Concerned', color: 'bg-red-400', barColor: 'from-red-400 to-red-500', w: '18%' },
  ]
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % states.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 flex items-center gap-3 shadow-inner h-20">
      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center">
        <motion.span 
          key={i} 
          initial={{ scale: 0.5, rotate: -15 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="text-2xl leading-none"
        >
          {states[i].emoji}
        </motion.span>
      </div>
      <div className="flex-1 space-y-1.5">
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
    ['🚨 Urgent', '🔧 Plumbing', '🚗 Parking']
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % categories.length), 3400)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 space-y-2 shadow-inner">
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
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between h-20 shadow-inner">
      <div className="flex flex-col justify-center">
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Gateway Status</span>
        <span className="text-[10px] text-[#78716C] font-semibold mt-0.5">Automated screening</span>
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
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 space-y-2 shadow-inner">
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
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between h-20 shadow-inner">
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
            WebP/AVIF Ready
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function RealtimeDemo() {
  return (
    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between h-20 shadow-inner">
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
          <span className="text-[10px] font-bold text-stone-600">Processed in <b className="text-violet-600">0.8s</b></span>
        </div>
      </div>
      <Zap size={15} className="text-violet-500 fill-violet-50" />
    </div>
  )
}

/* ── Feature registry with Bento Grid configurations ─────────────────────── */

const features = [
  { 
    icon: Wand2, 
    tile: 'bg-violet-50 border-violet-100', 
    tone: 'text-violet-600', 
    title: 'AI Text Enhancement', 
    body: 'Cleans up rushed typos, corrects grammar, and formats messages into clean, readable announcements — preserving tone and original intent.', 
    Demo: TextEnhanceDemo,
    span: 'sm:col-span-2 lg:col-span-2'
  },
  { 
    icon: ShieldAlert, 
    tile: 'bg-rose-50 border-rose-100', 
    tone: 'text-rose-600', 
    title: 'Anti-Spam Shield', 
    body: 'Intercepts scraper bots, promotions, and repetitive posts before they ever hit the neighborhood feed.', 
    Demo: SpamDemo,
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    icon: Languages, 
    tile: 'bg-cyan-50 border-cyan-100', 
    tone: 'text-cyan-600', 
    title: 'Instant AI Translation', 
    body: 'Translates feed announcements and chat messages in real-time so every resident stays informed.', 
    Demo: TranslateDemo,
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    icon: Search, 
    tile: 'bg-stone-100 border-stone-200', 
    tone: 'text-stone-600', 
    title: 'Intelligent Search', 
    body: 'Queries posts by conceptual meaning rather than exact keywords. Search like a resident thinks.', 
    Demo: SearchDemo,
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    icon: ShieldCheck, 
    tile: 'bg-emerald-50 border-emerald-100', 
    tone: 'text-emerald-600', 
    title: 'Automated Moderation', 
    body: 'Screens text and media attachments against safety guidelines pre-publish to shield the community.', 
    Demo: ModerationDemo,
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    icon: SmilePlus, 
    tile: 'bg-amber-50 border-amber-100', 
    tone: 'text-amber-600', 
    title: 'Sentiment Analysis', 
    body: 'Monitors discussion threads for escalating hostility to help society administrators step in early.', 
    Demo: SentimentDemo,
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    icon: Lightbulb, 
    tile: 'bg-blue-50 border-blue-100', 
    tone: 'text-blue-600', 
    title: 'Smart Categorization', 
    body: 'Understands post content as residents type and suggests relevant tags, helping catalog information seamlessly.', 
    Demo: SuggestDemo,
    span: 'sm:col-span-2 lg:col-span-2'
  },
  { 
    icon: Images, 
    tile: 'bg-indigo-50 border-indigo-100', 
    tone: 'text-indigo-600', 
    title: 'Media Optimization', 
    body: 'Transcodes, compresses, and delivers image arrays and video clips for ultra-fast mobile loading.', 
    Demo: MediaDemo,
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    icon: Zap, 
    tile: 'bg-violet-50 border-violet-100', 
    tone: 'text-violet-600', 
    title: 'Real-time AI Processing', 
    body: 'Runs parsing, screening, translation, and tagging pipelines in under a second per post using highly optimized server resources.', 
    Demo: RealtimeDemo,
    span: 'sm:col-span-2 lg:col-span-2'
  },
]

export default function AIFeaturesShowcase() {
  return (
    <section className="relative bg-[#FAFAF9] py-24 md:py-28 px-6 w-full overflow-hidden">
      {/* Premium Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            variants={fadeUpSmall}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-150 text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider mb-3">
              <Sparkles size={11} className="fill-blue-50" /> AI-Powered Community Engine
            </div>
            <h2 className="text-3xl md:text-[38px] font-black text-[#1C1917] tracking-tight leading-[1.1] bg-gradient-to-r from-stone-900 via-stone-800 to-stone-700 bg-clip-text text-transparent">
              The intelligence working behind every post
            </h2>
            <p className="mt-4 text-[14.5px] text-[#78716C] leading-relaxed font-semibold">
              Free-tier AI modules quietly clean up, translate, screen, and tag content — keeping the community feed fast, legible, and safe for all neighbors at once.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <a 
              href="#journey" 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-stone-200/80 shadow-sm text-[12px] font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all group"
            >
              See how it works <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>

        {/* Dynamic Bento Grid Layout */}
        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUpSmall}
              whileHover={{ 
                y: -6,
                boxShadow: '0 20px 40px -15px rgba(28,25,23,0.12)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`group p-5 bg-gradient-to-b from-white to-stone-50/40 border border-stone-200 rounded-2xl flex flex-col justify-between ${f.span}`}
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.05 }}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${f.tile}`}
                  >
                    <f.icon size={18} className={f.tone} strokeWidth={2.2} />
                  </motion.div>
                  <h3 className="text-[14px] font-extrabold text-[#1C1917] tracking-tight">{f.title}</h3>
                </div>
                <p className="text-[12px] text-[#78716C] leading-relaxed font-semibold mb-6">{f.body}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-dashed border-stone-200/60">
                <f.Demo />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
