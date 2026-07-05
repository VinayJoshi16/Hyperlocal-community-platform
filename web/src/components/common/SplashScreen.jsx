export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">

      {/* Logo mark */}
      <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center
                      justify-center text-white text-lg font-bold shadow-soft">
        NH
      </div>

      {/* App name */}
      <p className="text-stone-500 text-sm font-medium tracking-wide">
        NeighbourHub
      </p>

      {/* Staggered loading dots */}
      <div className="flex items-center gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

    </div>
  )
}