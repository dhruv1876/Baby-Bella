import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Users, 
  Timer, 
  PlayCircle, 
  ArrowRight, 
  Lock, 
  Check,
  Clock, 
  Play,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

// --- Local Assets ---
import bannerImg from './assets/images/banner3.png';
import video5 from './assets/videos/video5.mp4';
import video7 from './assets/videos/video7.mp4';

// --- Types ---
interface VideoItem {
  url?: string;
  title: string;
  time?: string;
  locked?: boolean;
  subtitle?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function App() {
  const [showingFirst, setShowingFirst] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [price, setPrice] = useState(899);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [telegramLink, setTelegramLink] = useState("");
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // --- 1. SMOOTH DYNAMIC TEXT ANIMATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      setShowingFirst(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. PERSISTENT TIMER ---
  useEffect(() => {
    const KEY = 'stitch_offer_expires_v3';
    const MIN_MS = 30 * 60 * 1000;
    const MAX_MS = 90 * 60 * 1000;

    const getExpiry = () => {
      const v = sessionStorage.getItem(KEY);
      if (v && Number(v) > Date.now()) return Number(v);
      const newExpiry = Date.now() + Math.floor(Math.random() * (MAX_MS - MIN_MS + 1)) + MIN_MS;
      sessionStorage.setItem(KEY, String(newExpiry));
      return newExpiry;
    };

    const expiresAt = getExpiry();
    const tick = () => {
      const rem = Math.max(0, expiresAt - Date.now());
      setTimeLeft(rem);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- 3. PRICE COUNTDOWN ---
  useEffect(() => {
    const start = 899;
    const end = 199;
    const duration = 2000;
    const startTime = Date.now();

    const tick = () => {
      const now = Date.now();
      const p = Math.min((now - startTime) / duration, 1);
      const eased = p * (2 - p); // easeOutQuad
      const current = Math.round(start + (end - start) * eased);
      setPrice(Math.max(current, end));
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  // --- 4. RAZORPAY INTEGRATION ---
  const handlePayment = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRedirecting(true);

    try {
      const response = await fetch('/api/create-order', { method: 'POST' });
      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || "Failed to create order");
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: "INR",
        name: "Baby Bella Private Group",
        description: "Private Telegram Access",
        order_id: order.id,
        handler: async function (response: any) {
          console.log("Payment response received:", response);
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const result = await verifyRes.json();
          console.log("Verification result:", result);
          
          if (result.success) {
            setTelegramLink(result.telegram_link);
            setPaymentSuccess(true);
            setIsRedirecting(false);
            
            // Attempt auto-redirect
            setTimeout(() => {
              window.location.href = result.telegram_link;
            }, 1000);
          } else {
            alert("Payment verification failed. Please contact support.");
            setIsRedirecting(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#D4AF37"
        },
        modal: {
          ondismiss: function() {
            setIsRedirecting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
      setIsRedirecting(false);
    }
  };

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return { 
      h: String(hrs).padStart(2, '0'), 
      m: String(mins).padStart(2, '0'), 
      s: String(secs).padStart(2, '0') 
    };
  };

  const timer = formatTime(timeLeft);

  const videos: VideoItem[] = [
    { url: video5, title: 'Full Video in Group', time: '39 min' },
    { url: video7, title: 'Full Video in Group', time: '47 min' },
    { locked: true, title: 'Join Private Group', subtitle: 'To Watch All' },
    { locked: true, title: 'Unlock Content', subtitle: '200+ Photos/Videos' }
  ];

  const handleVideoClick = (index: number) => {
    if (videos[index].locked) return;
    
    if (activeVideo === index) {
      videoRefs.current[index]?.pause();
      setActiveVideo(null);
    } else {
      // Pause others
      videoRefs.current.forEach((v, i) => {
        if (i !== index) v?.pause();
      });
      videoRefs.current[index]?.play();
      setActiveVideo(index);
    }
  };

  return (
    <div className="relative min-h-screen pb-48 bg-[#050505] text-white font-sans selection:bg-premium-gold/30">
      {/* Cinematic Noise Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.05] bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_200_200%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22noiseFilter%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.65%22_numOctaves=%223%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>

      <main className="max-w-md mx-auto relative z-10">
        {/* Banner Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative group"
        >
          <img 
            src={bannerImg} 
            alt="Cover" 
            className="w-full h-auto object-contain shadow-2xl rounded-b-[2rem]"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute top-2 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Online</span>
          </div>

          <div className="absolute bottom-0 right-2 transform translate-y-1/2 z-20">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md border border-green-500/30 rounded-full shadow-lg">
              <Video className="text-green-400 w-2.5 h-2.5" />
              <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest leading-none">
                Private Chat & Video Call
              </span>
            </div>
          </div>
        </motion.div>

        {/* Profile Info */}
        <div className="px-5 mt-7 mb-4 flex justify-between items-start">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold text-white leading-none tracking-tight">Baby Bella</h1>
              <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            </div>
            
            <div className="h-5 mt-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {showingFirst ? (
                  <motion.p 
                    key="text1"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="absolute top-0 left-0 w-full text-xs font-medium text-gray-400 whitespace-nowrap"
                  >
                    Exclusive Content & Private Access
                  </motion.p>
                ) : (
                  <motion.p 
                    key="text2"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="absolute top-0 left-0 w-full text-xs font-medium whitespace-nowrap"
                  >
                    <span className="text-green-400 font-bold">200+ Photos/Videos</span> <span className="text-gray-400">Inside</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-md backdrop-blur-md whitespace-nowrap">
              <Users className="text-green-400 w-2.5 h-2.5" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wide leading-none">6,387+ Joined</span>
            </div>
            <p className="text-[9px] text-gray-500 mt-1 font-medium">Private Group</p>
          </div>
        </div>

        {/* Timer Strip */}
        <div className="mx-4 mb-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-between shadow-[0_0_20px_rgba(255,0,51,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_linear_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-pulse">
                <Timer className="text-red-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">Special Price Ends In</p>
                <p className="text-xs text-white">Save 83% • <span className="line-through text-gray-500">₹899</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 relative z-10">
              <div className="flex flex-col items-center gap-0.5">
                <div className="bg-black/40 rounded px-2 py-1 border border-red-500/20 shadow-inner font-mono text-lg font-bold text-white leading-none">{timer.h}</div>
                <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Hrs</span>
              </div>
              <span className="text-xs text-red-500 font-bold -mt-3 animate-pulse">:</span>
              <div className="flex flex-col items-center gap-0.5">
                <div className="bg-black/40 rounded px-2 py-1 border border-red-500/20 shadow-inner font-mono text-lg font-bold text-white leading-none">{timer.m}</div>
                <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Min</span>
              </div>
              <span className="text-xs text-red-500 font-bold -mt-3 animate-pulse">:</span>
              <div className="flex flex-col items-center gap-0.5">
                <div className="bg-black/40 rounded px-2 py-1 border border-red-500/20 text-red-500 shadow-inner font-mono text-lg font-bold leading-none">{timer.s}</div>
                <span className="text-[7px] font-bold text-red-500/70 uppercase tracking-wider">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Previews */}
        <div className="px-0">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PlayCircle className="text-[#D4AF37] w-4 h-4" /> Previews
            </h2>
            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">Swipe <ChevronRight className="w-2 h-2" /></span>
          </div>
          
          <div className="flex overflow-x-auto gap-3 px-5 pb-4 scrollbar-hide snap-x snap-mandatory">
            {videos.map((vid, i) => (
              <div 
                key={i}
                onClick={() => handleVideoClick(i)}
                className="relative flex-shrink-0 w-[38%] aspect-[9/16] rounded-xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 snap-center group shadow-lg cursor-pointer"
              >
                {vid.locked ? (
                  <>
                    <div className="absolute inset-0 bg-gray-800">
                      <img 
                        src="https://babybella.netlify.app/pvt/blurred.jpg" 
                        className="w-full h-full object-cover opacity-50 filter blur-lg scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-2 backdrop-blur-[1px]">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2">
                        <Lock className="text-white w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold text-white leading-tight">{vid.title}</p>
                      <p className="text-[8px] text-[#D4AF37] mt-0.5 font-bold uppercase tracking-wide">{vid.subtitle}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <video 
                      ref={el => videoRefs.current[i] = el}
                      src={`${vid.url}#t=0.1`} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" 
                      muted 
                      playsInline 
                      loop
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition ${activeVideo === i ? 'opacity-0' : 'opacity-100'}`}>
                      <Play className="text-white w-3 h-3 fill-white ml-0.5" />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[10px] font-bold text-white truncate">{vid.title}</p>
                      <p className="text-[9px] text-gray-400 flex items-center gap-1"><Clock className="w-2 h-2" /> {vid.time}</p>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-white border border-white/10">HD</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pt-10 bg-gradient-to-t from-[#050505] via-[#050505]/98 to-transparent">
        <div onClick={handlePayment} className="block w-full max-w-md mx-auto relative group cursor-pointer">
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#D4AF37]/40 via-red-500/40 to-[#D4AF37]/40 blur-sm opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          
          <button className={`relative w-full h-[72px] rounded-2xl flex items-center justify-between px-5 border overflow-hidden shadow-2xl transition-all duration-300 ${isRedirecting ? 'bg-green-600 border-green-500 scale-95' : 'bg-[#0f0f0f] border-white/10'}`}>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
            
            {isRedirecting ? (
              <div className="w-full flex flex-col items-center justify-center leading-tight">
                <span className="text-white/90 text-[10px] font-medium tracking-wide uppercase mb-0.5">Please Wait...</span>
                <div className="flex items-center gap-1.5">
                  <Lock className="text-white w-3.5 h-3.5" />
                  <span className="text-white font-bold text-sm tracking-wide">Redirecting to Payment Page</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start z-10">
                  <span className="text-sm text-white font-extrabold uppercase tracking-wide leading-tight mb-0.5 drop-shadow-md">Join Private Telegram Group</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-gray-500 line-through text-xs font-medium">₹899</span>
                    <span className="text-lg font-black bg-gradient-to-b from-yellow-200 to-[#D4AF37] bg-clip-text text-transparent drop-shadow-sm">₹{price}</span>
                    <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">83% OFF</span>
                  </div>
                </div>
                
                <div className="z-10 pl-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-200 to-[#D4AF37] text-black flex items-center justify-center shadow-[0_4px_10px_rgba(212,175,55,0.4)] animate-[bounceX_1s_infinite]">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </>
            )}
          </button>
        </div>

        <div className="flex justify-center items-center mt-3 mb-1">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-4 w-auto" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-4 w-auto" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-3 w-auto" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3 w-auto" referrerPolicy="no-referrer" />
          </div>
        </div>
        
        <p className="text-[10px] text-gray-500 mt-2 flex items-center justify-center gap-1.5 opacity-80">
          <Lock className="w-2.5 h-2.5" />
          Payments processed via manager <span className="text-gray-300 font-bold">Futurehometech</span>
          <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/20" />
        </p>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl"
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                <Check className="h-10 w-10" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Payment Successful!</h2>
            <p className="mb-8 text-zinc-400">
              You're all set! Click the button below to join the private Telegram group.
            </p>
            <a 
              href={telegramLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Join Private Telegram <ArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-4 text-xs text-zinc-500">
              If the button doesn't work, please check your internet connection.
            </p>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounceX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
