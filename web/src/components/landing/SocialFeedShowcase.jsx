import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageSquare, Share2, Play, Volume2, ShieldCheck, PawPrint } from 'lucide-react'
import { fadeUpSmall, stagger, viewportOnce } from './motionPresets'

function Avatar({ seed, size = 36 }) {
  return (
    <img
      src={`https://i.pravatar.cc/150?img=${seed}`}
      alt=""
      width={size}
      height={size}
      className="rounded-full object-cover border border-white shadow-sm flex-shrink-0"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  )
}

function EngagementBar({ likes, comments }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(likes)
  return (
    <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-5 text-stone-400 text-xs font-bold">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => {
          setLiked((v) => !v)
          setCount((c) => (liked ? c - 1 : c + 1))
        }}
        className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
      >
        <motion.span animate={liked ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.3 }}>
          <Heart size={14} className={liked ? 'fill-red-500' : ''} />
        </motion.span>
        {count}
      </motion.button>
      <span className="flex items-center gap-1.5 hover:text-stone-700 transition-colors cursor-default">
        <MessageSquare size={14} /> {comments}
      </span>
      <span className="flex items-center gap-1.5 hover:text-stone-700 transition-colors cursor-default ml-auto">
        <Share2 size={14} />
      </span>
    </div>
  )
}

function PostHeader({ avatarSeed, name, badge, badgeTone, meta }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <Avatar seed={avatarSeed} />
      <div className="min-w-0">
        <h4 className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5 truncate">
          {name}
          {badge && (
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wide flex-shrink-0 ${badgeTone}`}>
              {badge}
            </span>
          )}
        </h4>
        <p className="text-[10px] text-[#78716C] font-medium truncate">{meta}</p>
      </div>
    </div>
  )
}

const cardBase =
  'bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.03)] text-left hover:shadow-[0_20px_40px_-16px_rgba(28,25,23,0.16)] transition-shadow duration-300'

function ImagePost() {
  return (
    <motion.div variants={fadeUpSmall} whileHover={{ y: -6 }} className={cardBase}>
      <PostHeader avatarSeed={47} name="Ananya Verma" meta="C Block • 40 min ago" />
      <p className="text-xs text-[#44403C] leading-relaxed mb-3">
        Diwali lights went up on the C Block balconies last night ✨ Society is glowing this week.
      </p>
      <div className="rounded-xl overflow-hidden border border-stone-200/60">
        <img
          src="https://picsum.photos/seed/nh-diwali-lights/640/480"
          alt="Diwali lights on balconies"
          className="w-full aspect-[4/3] object-cover saturate-[1.05]"
          loading="lazy"
        />
      </div>
      <EngagementBar likes={89} comments={21} />
    </motion.div>
  )
}

function VideoPost() {
  return (
    <motion.div variants={fadeUpSmall} whileHover={{ y: -6 }} className={`${cardBase} lg:col-span-2`}>
      <PostHeader avatarSeed={12} name="Rohit Malhotra" meta="Clubhouse • 2 hrs ago" />
      <p className="text-xs text-[#44403C] leading-relaxed mb-3">
        Quick tour of the new society gym before it opens Monday 🏋️ Equipment looks solid.
      </p>
      <div className="relative rounded-xl overflow-hidden border border-stone-200/60 group/video">
        <img
          src="https://picsum.photos/seed/nh-gym-tour/900/500"
          alt="Society gym preview"
          className="w-full aspect-video object-cover saturate-[1.05] brightness-[0.82]"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg cursor-pointer"
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-white/70"
              animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <Play size={20} className="text-[#1C1917] ml-0.5" fill="currentColor" />
          </motion.div>
        </div>
        <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold tabular-nums">
          0:38
        </span>
        <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
          <Volume2 size={12} className="text-white" />
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full w-[28%] bg-white/90" />
        </div>
      </div>
      <EngagementBar likes={156} comments={34} />
    </motion.div>
  )
}

function BusinessPost() {
  return (
    <motion.div
      variants={fadeUpSmall}
      whileHover={{ y: -6 }}
      className={`${cardBase} relative overflow-hidden border-l-2 border-l-[#F59E0B]`}
    >
      <div className="pl-1">
        <PostHeader
          avatarSeed={68}
          name="Oven Fresh Bakery"
          badge="Local Business"
          badgeTone="bg-amber-50 text-amber-700 border-amber-100"
          meta="0.3 km away • Active now"
        />
        <p className="text-xs text-[#44403C] leading-relaxed mb-3">
          Hey neighbors! Fresh batch is out of the oven. Mention{' '}
          <span className="font-bold text-[#F59E0B]">NEIGHBOUR15</span> for 15% off at the counter.
        </p>
        <div className="rounded-xl overflow-hidden border border-stone-200/60">
          <img
            src="/fresh_bakery_preview.png"
            alt="Fresh bakery items"
            className="w-full aspect-[4/3] object-cover"
            loading="lazy"
          />
        </div>
        <EngagementBar likes={65} comments={8} />
      </div>
    </motion.div>
  )
}

function LostFoundPost() {
  return (
    <motion.div variants={fadeUpSmall} whileHover={{ y: -6 }} className={cardBase}>
      <PostHeader
        avatarSeed={33}
        name="Karan Bedi"
        badge="Lost & Found"
        badgeTone="bg-violet-50 text-violet-700 border-violet-100"
        meta="Gate 2 • 6 hrs ago"
      />
      <p className="text-xs text-[#44403C] leading-relaxed mb-3 flex items-start gap-1.5">
        <PawPrint size={13} className="text-violet-500 mt-0.5 flex-shrink-0" />
        Have you seen Biscuit? Last seen near Gate 2, answers to his name, very friendly 🐾
      </p>
      <div className="rounded-xl overflow-hidden border border-stone-200/60">
        <img
          src="https://picsum.photos/seed/nh-lost-dog/640/480"
          alt="Lost dog Biscuit"
          className="w-full aspect-[4/3] object-cover saturate-[1.05]"
          loading="lazy"
        />
      </div>
      <EngagementBar likes={140} comments={46} />
    </motion.div>
  )
}

function CarouselPost() {
  const [active, setActive] = useState(0)
  const images = ['nh-plant-drive-1', 'nh-plant-drive-2']
  return (
    <motion.div variants={fadeUpSmall} whileHover={{ y: -6 }} className={`${cardBase} lg:col-span-2`}>
      <div className="flex items-center justify-between mb-3">
        <PostHeader avatarSeed={9} name="Priya Sharma" meta="East Lawn • 5 hrs ago" />
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0 -mt-6">
          18 attending
        </span>
      </div>
      <p className="text-xs text-[#44403C] leading-relaxed mb-3">
        Sunday society clean-up & tree plantation — saplings and tools provided, breakfast after!
      </p>
      <div className="relative rounded-xl overflow-hidden border border-stone-200/60">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          <img
            src="/gardening_event_preview.png"
            alt="Plantation drive"
            className="w-full flex-shrink-0 aspect-video object-cover"
            loading="lazy"
          />
          <img
            src={`https://picsum.photos/seed/${images[1]}/900/500`}
            alt="Plantation drive volunteers"
            className="w-full flex-shrink-0 aspect-video object-cover saturate-[1.05]"
            loading="lazy"
          />
        </div>
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${active === i ? 'bg-white w-4' : 'bg-white/50'}`}
              aria-label={`Show photo ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <EngagementBar likes={28} comments={14} />
    </motion.div>
  )
}

function EmergencyPost() {
  return (
    <motion.div variants={fadeUpSmall} whileHover={{ y: -6 }} className={`${cardBase} hover:border-red-200`}>
      <PostHeader
        avatarSeed={53}
        name="Rajesh Chawla"
        badge="RWA President"
        badgeTone="bg-red-50 text-red-700 border-red-100"
        meta="Bandra West • 2 hrs ago"
      />
      <h3 className="text-sm font-extrabold text-[#1C1917] flex items-center gap-1.5 mb-1">
        <ShieldCheck size={14} className="text-red-500" />
        Water pipeline maintenance tomorrow
      </h3>
      <p className="text-xs text-[#78716C] leading-relaxed">
        Water supply suspended tomorrow 9 AM–4 PM for repair works. Please store adequate water in advance.
      </p>
      <EngagementBar likes={42} comments={12} />
    </motion.div>
  )
}

export default function SocialFeedShowcase() {
  return (
    <section className="bg-white py-24 md:py-28 px-6 border-y border-[#E7E5E4] w-full">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <motion.div
          variants={fadeUpSmall}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-xl mb-16"
        >
          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
            See it in action
          </span>
          <h2 className="mt-3 text-3xl md:text-[34px] font-extrabold text-[#1C1917] tracking-tight">
            Photos, video, and everything in between
          </h2>
          <p className="mt-3 text-[15px] text-[#78716C] leading-relaxed font-medium max-w-lg">
            Every post type your neighbors actually use — real photos, short video, multi-image
            albums — with the same feed mechanics as a modern social app.
          </p>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 [grid-auto-flow:dense]"
        >
          <ImagePost />
          <VideoPost />
          <BusinessPost />
          <LostFoundPost />
          <CarouselPost />
          <EmergencyPost />
        </motion.div>
      </div>
    </section>
  )
}
