import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2, Languages, ShieldAlert, SmilePlus, Lightbulb,
  ShieldCheck, Search, Images, Zap, Check, X,
} from 'lucide-react'
import { fadeUpSmall, stagger, viewportOnce } from './motionPresets'

/* ── Individual live demos ─────────────────────────────────────────────── */

function TextEnhanceDemo() {
  const pairs = [
    ['gng to socty mtng 6pm', 'Heading to the society meeting at 6 PM.'],
    ['ppl bring chairs pls', 'Please bring your own chairs, everyone!'],
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % pairs.length), 3400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-mono text-stone-400 line-through decoration-stone-300">{pairs[i][0]}</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-[11.5px] font-semibold text-[#1C1917]"
        >
          {pairs[i][1]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function TranslateDemo() {
  const langs = [
    { code: 'EN', text: 'Water supply resumes at 6 PM.' },
    { code: 'हि', text: 'जल आपूर्ति शाम 6 बजे फिर शुरू होगी।' },
    { code: 'मर', text: 'पाणीपुरवठा संध्याकाळी ६ वाजता सुरू होईल.' },
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % langs.length), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 h-6 rounded bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
        {langs[i].code}
      </span>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          className="text-[11px] font-semibold text-[#1C1917] truncate"
        >
          {langs[i].text}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function SpamDemo() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-bold text-stone-400">
        <span>Trust score</span>
        <span className="text-emerald-600">96 / 100</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={{ width: '0%' }}
          whileInView={{ width: '96%' }}
          viewport={viewportOnce}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600">
        <Check size={11} /> Clean — auto-approved
      </span>
    </div>
  )
}

function SentimentDemo() {
  const [i, setI] = useState(0)
  const states = [
    { emoji: '😊', label: 'Positive', color: 'bg-emerald-500', w: '82%' },
    { emoji: '😐', label: 'Neutral', color: 'bg-amber-400', w: '48%' },
    { emoji: '😟', label: 'Concerned', color: 'bg-red-400', w: '22%' },
  ]
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % states.length), 2400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-3">
      <motion.span key={i} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-xl leading-none">
        {states[i].emoji}
      </motion.span>
      <div className="flex-1">
        <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${states[i].color}`}
            animate={{ width: states[i].w }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-1 text-[10.5px] font-bold text-stone-400">{states[i].label} tone detected</p>
      </div>
    </div>
  )
}

function SuggestDemo() {
  const chips = ['🎉 Diwali Celebration', '📢 Notice', '🧹 Clean-up Drive']
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c, i) => (
        <motion.span
          key={c}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ delay: i * 0.15 + 0.1, duration: 0.4 }}
          className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10.5px] font-bold border border-blue-100"
        >
          {c}
        </motion.span>
      ))}
    </div>
  )
}

function ModerationDemo() {
  const [flagged, setFlagged] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setFlagged((v) => !v), 2800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-2.5">
      <AnimatePresence mode="wait">
        {flagged ? (
          <motion.span
            key="flagged"
            initial={{ opacity: 0, rotate: -6, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -6, scale: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 text-[10.5px] font-extrabold uppercase tracking-wide"
          >
            <X size={11} /> Flagged
          </motion.span>
        ) : (
          <motion.span
            key="approved"
            initial={{ opacity: 0, rotate: -6, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -6, scale: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10.5px] font-extrabold uppercase tracking-wide"
          >
            <Check size={11} /> Approved
          </motion.span>
        )}
      </AnimatePresence>
      <span className="text-[10.5px] font-semibold text-stone-400">every post, before it's live</span>
    </div>
  )
}

function SearchDemo() {
  const queries = ['plumber near gate 2', 'diwali events this week', 'lost pets']
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % queries.length), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-stone-50 border border-stone-100">
      <Search size={12} className="text-stone-400 flex-shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-[11px] font-semibold text-stone-500 truncate"
        >
          {queries[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function MediaDemo() {
  const types = [
    { icon: Images, label: 'Photo album' },
    { icon: Zap, label: 'Short video' },
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % types.length), 2200)
    return () => clearInterval(t)
  }, [])
  const T = types[i].icon
  return (
    <div className="flex items-center gap-2">
      <motion.span
        key={i}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center"
      >
        <T size={13} className="text-indigo-600" />
      </motion.span>
      <span className="text-[11px] font-semibold text-stone-500">{types[i].label} — auto-optimized</span>
    </div>
  )
}

function RealtimeDemo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-violet-400"
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
      </span>
      <span className="text-[11px] font-semibold text-stone-500">
        Processed in <b className="text-[#1C1917]">0.8s</b>
      </span>
    </div>
  )
}

/* ── Feature registry ──────────────────────────────────────────────────── */

const features = [
  { icon: Wand2, tile: 'bg-violet-50', tone: 'text-violet-600', title: 'AI Text Enhancement', body: 'Turns rushed typing into a clean, readable notice — tone and meaning untouched.', Demo: TextEnhanceDemo },
  { icon: Languages, tile: 'bg-cyan-50', tone: 'text-cyan-600', title: 'AI Translation', body: 'Every post readable in the language your neighbor actually speaks at home.', Demo: TranslateDemo },
  { icon: ShieldAlert, tile: 'bg-rose-50', tone: 'text-rose-600', title: 'Spam Detection', body: 'Promotional spam and scraper bots get caught before they ever reach the feed.', Demo: SpamDemo },
  { icon: SmilePlus, tile: 'bg-amber-50', tone: 'text-amber-600', title: 'Sentiment Analysis', body: 'Flags rising frustration in a thread so RWA admins can step in early.', Demo: SentimentDemo },
  { icon: Lightbulb, tile: 'bg-blue-50', tone: 'text-blue-600', title: 'Smart Content Suggestions', body: 'Suggests the right category and title while a resident is still typing.', Demo: SuggestDemo },
  { icon: ShieldCheck, tile: 'bg-emerald-50', tone: 'text-emerald-600', title: 'AI Content Moderation', body: 'Every image and caption screened against community guidelines pre-publish.', Demo: ModerationDemo },
  { icon: Search, tile: 'bg-stone-100', tone: 'text-stone-600', title: 'Intelligent Search', body: 'Search by meaning, not just keywords — "plumber near gate 2" just works.', Demo: SearchDemo },
  { icon: Images, tile: 'bg-indigo-50', tone: 'text-indigo-600', title: 'Image & Video Posts', body: 'Photos, short clips, and multi-image albums, compressed and delivered fast.', Demo: MediaDemo },
  { icon: Zap, tile: 'bg-violet-50', tone: 'text-violet-600', title: 'Real-time AI Processing', body: 'Moderation, translation, and tagging all resolve in under a second per post.', Demo: RealtimeDemo },
]

export default function AIFeaturesShowcase() {
  return (
    <section className="bg-[#FAFAF9] py-24 md:py-28 px-6 w-full">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <motion.div
          variants={fadeUpSmall}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-xl mb-16"
        >
          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
            Powered by AI
          </span>
          <h2 className="mt-3 text-3xl md:text-[34px] font-extrabold text-[#1C1917] tracking-tight">
            The intelligence working behind every post
          </h2>
          <p className="mt-3 text-[15px] text-[#78716C] leading-relaxed font-medium max-w-lg">
            Free-tier AI models quietly clean up, translate, screen, and route content —
            so the feed stays fast, safe, and legible for four hundred neighbors at once.
          </p>
        </motion.div>

        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUpSmall}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group p-5 bg-white border border-[#E7E5E4] rounded-2xl shadow-sm hover:shadow-[0_16px_32px_-14px_rgba(28,25,23,0.14)] hover:border-stone-300 transition-shadow duration-300 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.05 }}
                  className={`w-10 h-10 rounded-xl ${f.tile} flex items-center justify-center flex-shrink-0`}
                >
                  <f.icon size={18} className={f.tone} strokeWidth={2} />
                </motion.div>
                <div>
                  <h3 className="text-[13px] font-extrabold text-[#1C1917] leading-tight">{f.title}</h3>
                </div>
              </div>
              <p className="text-[12px] text-[#78716C] leading-relaxed font-medium mb-4">{f.body}</p>
              <div className="mt-auto pt-3.5 border-t border-stone-100">
                <f.Demo />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
