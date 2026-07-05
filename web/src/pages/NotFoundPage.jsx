import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm animate-fadeIn">

        {/* Large faded 404 number as background element */}
        <p className="text-8xl font-bold text-stone-200 leading-none select-none">
          404
        </p>

        <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center
                        justify-center mx-auto mt-6 mb-4">
          <Home size={24} className="text-stone-400" />
        </div>

        <h1 className="text-xl font-semibold text-stone-800 mb-2">Page not found</h1>
        <p className="text-sm text-stone-400 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={15} /> Go back
          </button>
          <button onClick={() => navigate('/feed')} className="btn-primary">
            <Home size={15} /> Go to feed
          </button>
        </div>

      </div>
    </div>
  )
}