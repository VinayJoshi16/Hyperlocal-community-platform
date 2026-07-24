import { motion } from 'framer-motion'
import { fadeUp, fadeUpSmall, stagger, viewportOnce } from './motionPresets'

const quotes = [
  {
    quote:
      'The water-tanker notice used to travel by three WhatsApp groups and a security guard. Now it just shows up, and everyone actually sees it.',
    name: 'Meera Iyer',
    role: 'RWA Secretary, Koramangala',
    avatar: 22,
  },
  {
    quote:
      'I sell tiffins out of my kitchen. My radius is four buildings — that is the whole business. NeighbourHub is the only app that understands that.',
    name: 'Sunita Rao',
    role: 'Home business owner, Indiranagar',
    avatar: 45,
  },
  {
    quote:
      'We found the lost dog in under two hours because the post only went to people who could actually see him.',
    name: 'Arjun Mehta',
    role: 'Resident, Whitefield',
    avatar: 14,
  },
]

export default function Testimonials() {
  return (
    <section id="stories" className="bg-white py-24 md:py-28 px-6 border-y border-[#E7E5E4] w-full">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-xl mb-16"
        >
          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
            From the neighborhood
          </span>
          <h2 className="mt-3 text-3xl md:text-[34px] font-extrabold text-[#1C1917] tracking-tight">
            What actually changes on the ground
          </h2>
        </motion.div>

        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {quotes.map((q) => (
            <motion.figure
              key={q.name}
              variants={fadeUpSmall}
              className="text-left flex flex-col justify-between h-full"
            >
              <blockquote className="font-display italic text-[19px] leading-[1.45] text-[#1C1917]">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-stone-100 flex items-center gap-3">
                <img
                  src={`https://i.pravatar.cc/150?img=${q.avatar}`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <p className="text-xs font-bold text-[#1C1917]">{q.name}</p>
                  <p className="text-[11px] text-[#78716C] font-semibold">{q.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
