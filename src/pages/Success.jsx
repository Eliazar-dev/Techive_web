import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import confetti from 'canvas-confetti'

export default function Success({ message = "Welcome to Techive!", subtext = "Your account is ready", redirectPath = '/' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(3)
  
  // Get redirect path from navigation state or use prop
  const actualRedirectPath = location.state?.redirectPath || redirectPath

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#06c3ff', '#7c5cff', '#a855f7']
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#06c3ff', '#7c5cff', '#a855f7']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate(actualRedirectPath)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate, actualRedirectPath])

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 text-white">
      <div className="text-center animate-fade-up">
        {/* Animated Checkmark */}
        <div className="mb-8 inline-flex">
          <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#10b981" className="animate-pop" />
            <path 
              d="M8 12L11 15L16 9" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-draw"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: 'draw 0.6s ease-out 0.3s forwards'
              }}
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-extrabold mb-4 animate-pop">{message}</h1>
        <p className="text-xl text-zinc-300 mb-8">{subtext}</p>

        {/* Redirect Countdown */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-sm">Redirecting in {countdown}...</span>
        </div>

        {/* Manual Redirect Button */}
        <button 
          onClick={() => navigate(actualRedirectPath)}
          className="mt-6 text-sm text-zinc-400 hover:text-white underline"
        >
          Go now
        </button>
      </div>

      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.5s ease-out forwards;
        }
        .animate-draw {
          animation: draw 0.6s ease-out 0.3s forwards;
        }
      `}</style>
    </div>
  )
}
