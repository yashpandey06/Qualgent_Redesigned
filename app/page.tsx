"use client"

import React, { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  Zap,
  Eye,
  Users,
  ChevronDown,
  TestTube,
  Sparkles,
  CheckCircle,
  Menu,
  X,
  Send,
  Bot,
  MessageCircle,
  Minimize2,
  Mail,
  Linkedin,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { ParticleBackground } from "@/components/particle-background"
import { motion, useInView, AnimatePresence } from "framer-motion"
import CountUp from 'react-countup';
import WhyChooseQualgent from "@/components/why-choose-qualgent";
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  id,
}: { children: React.ReactNode; className?: string; delay?: number; id?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Add a utility to auto-link URLs and emails in chat messages
function renderMessageContent(text: string) {
  // Regex for URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // Regex for emails
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  // First, replace URLs with anchor tags
  let parts = text.split(urlRegex).map((part, i) => {
    if (urlRegex.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 break-all">{part}</a>;
    }
    return part;
  });
  // Then, replace emails with mailto links
  parts = parts.flatMap((part, i) => {
    if (typeof part === 'string' && emailRegex.test(part)) {
      return part.split(emailRegex).map((sub, j) => {
        if (emailRegex.test(sub)) {
          return <a key={i + '-' + j} href={`mailto:${sub}`} className="underline text-blue-400 break-all">{sub}</a>;
        }
        return sub;
      });
    }
    return part;
  });
  // Now, for each string part, parse markdown bold/italic
  function parseMarkdown(str: string) {
    // Bold (**text**)
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic (*text*)
    str = str.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return str;
  }
  // Map over parts and dangerouslySetInnerHTML for markdown
  return parts.map((part, i) => {
    if (typeof part === 'string') {
      return <span key={i} dangerouslySetInnerHTML={{ __html: parseMarkdown(part) }} />;
    }
    return part;
  });
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [chatQuery, setChatQuery] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [botMessages, setBotMessages] = useState<Array<{ text: string; isBot: boolean }>>([])
  const [isTyping, setIsTyping] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  // Calculator state with real-time updates
  const [numDevelopers, setNumDevelopers] = useState([5])
  const [appAge, setAppAge] = useState([1])
  const [testCoverage, setTestCoverage] = useState([80])
  const [numQATesters, setNumQATesters] = useState([1])
  const [qaTesterSalary, setQaTesterSalary] = useState([120000])
  const [numSDETs, setNumSDETs] = useState([1])
  const [sdetSalary, setSdetSalary] = useState([170000])
  const [testCadence, setTestCadence] = useState("daily")
  const [runType, setRunType] = useState("sequential")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const navigationItems = [
    { name: "Features", href: "features" },
    { name: "How It Works", href: "how-it-works" },
    { name: "Calculator", href: "calculator" },
    { name: "Contact", href: "contact" },
  ];

  // scrollToSection scrolls to the content section and applies header offset
  const scrollToSection = (id: string) => {
    let cleanId = id.replace(/^#/, "");
    const element = document.getElementById(cleanId);
    if (element) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.clientHeight : 80;
      const y = element.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setMobileMenuOpen(false);
    } else {
      console.warn(`Section with id '${cleanId}' not found.`);
    }
  };

  const simulateTyping = (message: string, callback: () => void) => {
    setIsTyping(true)
    setTimeout(
      () => {
        setBotMessages((prev) => [...prev, { text: message, isBot: true }])
        setIsTyping(false)
        callback()
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleChatQuery = async (query: string) => {
    if (!query.trim()) return;
    setBotMessages((prev) => [...prev, { text: query, isBot: false }]);
    setChatQuery(""); // Clear input after sending
    setIsTyping(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const result = await res.json();
      setIsTyping(false);
      if (result.type === 'scroll') {
        setTimeout(() => {
          const section = document.getElementById(result.data);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
        setBotMessages((prev) => [
          ...prev,
          { text: `I've scrolled to the relevant section for you!`, isBot: true },
        ]);
      } else {
        setBotMessages((prev) => [
          ...prev,
          { text: result.data, isBot: true },
        ]);
      }
    } catch (err: any) {
      setIsTyping(false);
      setBotMessages((prev) => [
        ...prev,
        { text: `Sorry, there was an error: ${err.message}`, isBot: true },
      ]);
    }
  };

  const faqData = [
    {
      question: "What types of devices do you support?",
      answer:
        "We support both iOS and Android devices, including the latest models. All tests run on real physical devices in our cloud infrastructure.",
    },
    {
      question: "How is this different from traditional QA testing?",
      answer:
        "Traditional QA tools like Appium, Cypress, Playwright or Selenium require brittle, script-based testing that doesn't scale. QualGent replaces that with vision-based autonomous AI agents that test your mobile app like real users — across native features, backend flows, and edge cases — with zero maintenance.",
    },
    {
      question: "What types of issues can you detect?",
      answer:
        "We detect UI issues, performance problems, and functional bugs across both iOS and Android platforms. Our AI tests on real devices to catch issues that might be missed in emulators.",
    },
    {
      question: "How long does it take to get results?",
      answer:
        "Tests run in parallel on multiple real devices, so you get results in minutes, not hours. No waiting for device availability.",
    },
    {
      question: "Can I integrate this with my CI/CD pipeline?",
      answer:
        "Yes! QualGent integrates seamlessly with your existing CI/CD pipeline. Run tests automatically on real devices with every build.",
    },
  ]

  // Real-time calculator with proper calculations
  const calculateCosts = () => {
    const testsPerDeveloper = 24
    const totalTests = numDevelopers[0] * testsPerDeveloper
    const testCreationHours = totalTests * 2
    const testMaintenanceHours = totalTests * 3 * appAge[0]
    const hourlyRate = 120

    const testCreationCost = testCreationHours * hourlyRate
    const testMaintenanceCost = testMaintenanceHours * hourlyRate
    const qaTeamCost = numQATesters[0] * qaTesterSalary[0] + numSDETs[0] * sdetSalary[0]
    const infrastructureCost = 108 * numDevelopers[0]
    const totalAnnualCost = testCreationCost + testMaintenanceCost + qaTeamCost + infrastructureCost

    const qualgentCost = totalAnnualCost * 0.35 // 65% savings
    const savings = totalAnnualCost - qualgentCost

    return {
      totalTests,
      testCreationCost,
      testMaintenanceCost,
      qaTeamCost,
      infrastructureCost,
      totalAnnualCost,
      qualgentCost,
      savings,
      savingsPercentage: Math.round((savings / totalAnnualCost) * 100),
    }
  }

  const costs = calculateCosts()

  // Add a mapping from suggestion text to section IDs
  const SUGGESTION_TO_SECTION_ID: Record<string, string> = {
    'Features': 'features',
    'How it works': 'how-it-works',
    'Contact': 'contact',
    'Demo': 'qualgent-in-action', // We'll add this id to the QualGent in Action section
  };

  // If user is authenticated, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-inter">
      <div className="pointer-events-none fixed inset-0 z-0">
        <ParticleBackground />
      </div>

      {/* Modern Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => scrollToSection("#hero")}
            >
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-xl shadow-lg flex items-center justify-center">
                <img src="/logo.png" alt="QualGent Logo" className="h-9 w-9 object-contain" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                QualGent
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 relative group"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 transition-all group-hover:w-full"></span>
                </motion.button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50 font-medium">
                    Log In
                  </Button>
                </motion.div>
              </Link>
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold shadow-lg">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gray-800/50"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="pt-4 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-gray-800/50">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 w-full"
            >
              <div className="flex justify-center w-full mb-6">
                <Badge
                  className="px-8 py-3 text-lg font-bold shadow-lg backdrop-blur-md flex items-center justify-center rounded-full border-none"
                  style={{
                    background: 'rgba(30,30,30,0.55)',
                    boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)',
                   
                    backgroundClip: 'padding-box',
                    borderRadius: '9999px',
                    borderImage: 'linear-gradient(90deg, #f97316, #fde047) 1',
                    width: 'fit-content',
                    minWidth: '0',
                    maxWidth: '100%',
                  }}
                >
                  <span className="mr-3 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
                  </span>
                  <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">AI-Powered Testing Revolution</span>
                </Badge>
              </div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Test your app with
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent">
                  natural language
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                No more complicated test scripts. Just tell QualGent what to test in plain English. Our AI handles the rest with 99.9% accuracy.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(251, 146, 60, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold px-8 py-4 text-lg shadow-xl"
                  >
                    Start Testing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl"
                >
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Backed by logos placeholder */}
            <div className="flex flex-col items-center justify-center gap-4 pt-12 w-full">
              <div className="text-lg sm:text-xl font-bold text-white tracking-wide mb-2 " style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)' }}>Backed by</div>
              <div className="w-full flex flex-wrap items-center justify-center gap-10 min-h-[60px] py-2">
                <a href="https://www.ycombinator.com/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <img src="/yc-logo.png" alt="Y Combinator" className="h-10 w-auto object-contain" style={{ minWidth: 40, opacity: 1, filter: 'none' }} />
                </a>
                <a href="https://www.leoniscap.com/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <img src="/leonis-logo.png" alt="Leonis Capital" className="h-10 w-auto object-contain" style={{ minWidth: 80, opacity: 1, filter: 'none' }} />
                </a>
                <a href="https://www.aminocapital.com/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <img src="/amino-logo.png" alt="Amino Capital" className="h-10 w-auto object-contain" style={{ minWidth: 40, opacity: 1, filter: 'none' }} />
                </a>
              </div>
            </div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 pt-8 w-full max-w-md mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-400">
                  <CountUp end={99.9} duration={2} decimals={1} suffix="%" enableScrollSpy scrollSpyOnce />
                </div>
                <div className="text-gray-400 text-sm">Accuracy</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-orange-400">
                  <CountUp end={10} duration={2} suffix="x" enableScrollSpy scrollSpyOnce />
                </div>
                <div className="text-gray-400 text-sm">Faster</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-gray-400 text-sm">Monitoring</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <motion.div
        className="mt-20 text-center font-sora"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        <motion.h2
          className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent font-sora"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          QualGent in Action
        </motion.h2>
        <motion.p
          className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-sora"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          Watch how our AI-powered testing platform transforms your mobile app testing workflow
        </motion.p>

        {/* Responsive Demo Video */}
        <motion.div
          className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-black p-2 sm:p-4 md:p-6 cursor-pointer group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          onClick={() => setVideoModalOpen(true)}
          tabIndex={0}
          role="button"
          aria-label="Open video demo fullscreen"
        >
          <video className="w-full h-auto aspect-video max-h-[60vw] sm:max-h-[400px] md:max-h-[500px] rounded-xl pointer-events-none" autoPlay loop muted playsInline>
            <source
              src="https://storage.googleapis.com/video-streaming-test-1/QualGentDemoVideo.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white/80 text-black px-6 py-2 rounded-full font-semibold text-lg shadow-lg">Play Fullscreen</span>
          </div>
        </motion.div>

        {/* Video Modal/Lightbox */}
        {videoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all">
            <div className="absolute top-4 right-4 z-[101]">
              <button
                onClick={() => setVideoModalOpen(false)}
                className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg focus:outline-none"
                aria-label="Close video modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative w-full max-w-5xl mx-auto p-2 sm:p-6 flex items-center justify-center">
              <video
                className="w-full h-auto aspect-video rounded-2xl border border-gray-700 shadow-2xl bg-black"
                autoPlay
                loop
                muted
                controls
                playsInline
                style={{ maxHeight: '80vh' }}
              >
                <source
                  src="https://storage.googleapis.com/video-streaming-test-1/QualGentDemoVideo.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-[99] cursor-pointer"
              onClick={() => setVideoModalOpen(false)}
              aria-label="Close video modal"
            />
          </div>
        )}

        {/* Call to Action Below Video */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.6 }}
        >
         
          
        </motion.div>
      </motion.div>

      {/* Phone Testing Scenarios Section */}
      <AnimatedSection className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-6">
              A new way of Quality Assurance testing
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Users trust your product — don't lose that with bugs. Our AI puts your app through real-world stress, so
              you don't have to.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Multi-lingual testing */}

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-8">
                <motion.div
                  className="relative w-full aspect-[9/19.5] max-w-[320px] mx-auto drop-shadow-2xl"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Modern Phone Frame */}
                  <div className="absolute inset-0 w-full h-full bg-black rounded-[2.5rem] shadow-2xl border-8 border-gray-900 ring-2 ring-gray-700">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20"></div>

                    {/* Screen Content */}
                    <div className="absolute top-2 left-2 right-2 bottom-2 overflow-hidden rounded-[2rem] bg-white flex flex-col">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 py-3 text-black text-sm bg-white relative z-10">
                        <span className="font-medium">1:15</span>
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <span className="text-xs ml-2">100%</span>
                          <div className="w-6 h-3 border border-black rounded-sm ml-1">
                            <div className="w-full h-full bg-green-500 rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                        <button className="p-2 text-gray-600">←</button>
                        <span className="text-sm font-medium">1/4</span>
                        <button className="p-2 text-gray-600">→</button>
                        <button className="p-2 text-gray-600">+</button>
                        <button className="ml-auto p-2 bg-gray-200 rounded-full text-gray-600">×</button>
                      </div>

                      {/* App Content: Only the video, edge-to-edge, no overflow */}
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white rounded-[2rem] overflow-hidden">
                        <video
                          className="w-full h-full object-cover rounded-[2rem]"
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          <source
                            src="https://storage.googleapis.com/video-streaming-test-1/trimmed-multi-lingual-video.mp4"
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
                  </div>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Multi-lingual testing</h3>
              <p className="text-gray-400 leading-relaxed">
                Our AI tests your app in any system-configured language — including right-to-left — so it works
                flawlessly worldwide.
              </p>
            </motion.div>

            {/* Systems Integration testing */}

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-8">
                <motion.div
                  className="relative w-full aspect-[9/19.5] max-w-[320px] mx-auto drop-shadow-2xl"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Modern Phone Frame */}
                  <div className="absolute inset-0 w-full h-full bg-black rounded-[2.5rem] shadow-2xl border-8 border-gray-900 ring-2 ring-gray-700">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20"></div>

                    {/* Screen Content */}
                    <div className="absolute top-2 left-2 right-2 bottom-2 overflow-hidden rounded-[2rem] bg-white flex flex-col">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 py-3 text-white text-sm relative z-10">
                        <span className="font-medium">9:17</span>
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          </div>
                          <span className="text-xs ml-2">100%</span>
                          <div className="w-6 h-3 border border-white rounded-sm ml-1">
                            <div className="w-full h-full bg-green-500 rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                      {/* Location Permission Dialog */}
                      <div className="flex items-center justify-center h-full p-6">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
                          <div className="mb-4">
                            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <Globe className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-sm text-gray-800 font-medium mb-2">
                              "AirCargo" Would Like to Access Your Location
                            </p>
                            <p className="text-xs text-gray-600">
                              Your location is used to show nearby parking options and provide directions.
                            </p>
                          </div>

                          <div className="mb-6">
                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"></div>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Precise</span>
                              <span>Approximate</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <button className="w-full py-3 text-blue-500 font-medium text-sm border-b border-gray-200">
                              Allow While Using App
                            </button>
                            <button className="w-full py-3 text-blue-500 font-medium text-sm border-b border-gray-200">
                              Allow Once
                            </button>
                            <button className="w-full py-3 text-red-500 font-medium text-sm">Don't Allow</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
                  </div>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Systems Integration testing</h3>
              <p className="text-gray-400 leading-relaxed">
                Test push notifications, permissions, multitasking, camera, GPS, network, Bluetooth, and multi-app
                interactions.
              </p>
            </motion.div>

            {/* True end-to-end testing */}

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-8">
                <motion.div
                  className="relative w-full aspect-[9/19.5] max-w-[320px] mx-auto drop-shadow-2xl"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Modern Phone Frame */}
                  <div className="absolute inset-0 w-full h-full bg-black rounded-[2.5rem] shadow-2xl border-8 border-gray-900 ring-2 ring-gray-700">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20"></div>

                    {/* Screen Content */}
                    <div className="absolute top-2 left-2 right-2 bottom-2 overflow-hidden rounded-[2rem] bg-white flex flex-col">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 py-3 text-black text-sm bg-white relative z-10">
                        <span className="font-medium">9:17</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">San Francisco</span>
                          <span className="text-xs text-gray-500">Apr 15 - 17 • 2 guests</span>
                          <div className="flex space-x-1 ml-auto">
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-black rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="w-6 h-3 border border-black rounded-sm ml-1">
                            <div className="w-full h-full bg-green-500 rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                        <button className="p-2 text-gray-600">←</button>
                        <div className="flex items-center space-x-4">
                          <button className="p-2 text-gray-600">⚙️</button>
                          <button className="p-2 text-gray-600">💬</button>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="p-4 h-full bg-white overflow-y-auto">
                        {/* Property Image */}
                        <div className="mb-4 relative">
                          <img
                            src="/placeholder.svg?height=200&width=300"
                            alt="Property"
                            className="w-full h-48 object-cover rounded-xl mb-3"
                          />
                          <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">
                            <span className="text-red-500">♥</span>
                          </div>
                          <div className="absolute top-3 left-3 bg-yellow-400 text-black px-2 py-1 rounded-lg text-xs font-medium">
                            🏆 Guest favorite
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="mb-4">
                          <h3 className="font-semibold text-lg text-black mb-1">Apartment in San Francisco</h3>
                          <p className="text-sm text-gray-600 mb-1">Garden apartment with Bay View</p>
                          <p className="text-xs text-gray-500">1 bedroom • 1 bed • 1 bath</p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          <span className="text-lg">⭐</span>
                          <span className="text-sm font-medium ml-1">4.98</span>
                          <span className="text-sm text-gray-500 ml-1">(121)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-lg font-bold text-black">$297</span>
                            <span className="text-sm text-gray-500"> total before taxes</span>
                          </div>
                        </div>

                        {/* Superhost Badge */}
                        <div className="bg-blue-50 rounded-xl p-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">🏆</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-black">Superhost</p>
                              <p className="text-xs text-gray-600">Superhosts are experienced, highly rated hosts.</p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Navigation */}
                        <div className="flex items-center justify-around py-4 border-t border-gray-200 mt-auto">
                          <div className="text-center">
                            <div className="text-red-500 mb-1">♥</div>
                            <span className="text-xs text-gray-600">Explore</span>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 mb-1">♥</div>
                            <span className="text-xs text-gray-600">Wishlists</span>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 mb-1">🏠</div>
                            <span className="text-xs text-gray-600">Trips</span>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 mb-1">💬</div>
                            <span className="text-xs text-gray-600">Messages</span>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 mb-1">👤</div>
                            <span className="text-xs text-gray-600">Profile</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
                  </div>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">True end-to-end testing</h3>
              <p className="text-gray-400 leading-relaxed">
                Test your full app flow end-to-end — OTP, payments, backend, database updates, multi-device flows, and
                more.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Modern AI Chat Assistant */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mb-4 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              style={{ width: '90vw', maxWidth: 480, height: '70vh', maxHeight: 600 }}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-full"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Bot className="h-4 w-4 text-black" />
                    </motion.div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">QualGent Assistant</h3>
                      <p className="text-gray-400 text-xs">Ask me anything!</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-white p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-2"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1 rounded-full flex-shrink-0">
                    <Bot className="h-3 w-3 text-black" />
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2 max-w-[200px]">
                    <p className="text-gray-300 text-xs">
                      Hi! I'm your QualGent assistant. I can help you navigate to features, pricing, demos, or contact
                      info. What would you like to know?
                    </p>
                  </div>
                </motion.div>

                {botMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start space-x-2 ${message.isBot ? "" : "flex-row-reverse space-x-reverse"}`}
                  >
                    {message.isBot ? (
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1 rounded-full flex-shrink-0">
                        <Bot className="h-3 w-3 text-black" />
                      </div>
                    ) : (
                      <div className="bg-blue-500 p-1 rounded-full flex-shrink-0">
                        <div className="h-3 w-3 bg-white rounded-full" />
                      </div>
                    )}
                    <div className={`rounded-lg p-2 max-w-[200px] ${message.isBot ? "bg-gray-800" : "bg-blue-500"}`}>
                      <p className="text-gray-300 text-xs break-words whitespace-pre-line" style={{ wordBreak: 'break-word' }}>{renderMessageContent(message.text)}</p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-2">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1 rounded-full flex-shrink-0">
                      <Bot className="h-3 w-3 text-black" />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-1 h-1 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0 }}
                        />
                        <motion.div
                          className="w-1 h-1 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1 h-1 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-2 border-t border-gray-800">
                <div className="flex space-x-2">
                  <Input
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="Ask about features, pricing, demo..."
                    className="bg-gray-800 border-gray-700 text-white text-sm flex-1 py-2 px-3"
                    onKeyPress={(e) => e.key === "Enter" && chatQuery && handleChatQuery(chatQuery)}
                  />
                  <motion.button
                    onClick={() => chatQuery && handleChatQuery(chatQuery)}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black p-2 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!chatQuery.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Features", "How it works", "Contact", "Demo"].map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => {
                        const sectionId = SUGGESTION_TO_SECTION_ID[suggestion];
                        if (sectionId) scrollToSection(sectionId);
                        handleChatQuery(suggestion);
                      }}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowChat(!showChat)}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black p-4 rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: showChat
              ? "0 0 0 0 rgba(251, 146, 60, 0.7)"
              : [
                  "0 0 0 0 rgba(251, 146, 60, 0.7)",
                  "0 0 0 10px rgba(251, 146, 60, 0)",
                  "0 0 0 0 rgba(251, 146, 60, 0.7)",
                ],
          }}
          transition={{
            boxShadow: { duration: 2, repeat: showChat ? 0 : Number.POSITIVE_INFINITY },
          }}
        >
          <AnimatePresence mode="wait">
            {showChat ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Features Section */}
      <div id="section-features" style={{ position: 'relative', top: '-80px' }} />
      <WhyChooseQualgent id="features" />

      {/* How It Works Section */}
      <div id="section-how-it-works" style={{ position: 'relative', top: '-80px' }} />
      <AnimatedSection id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three simple steps to revolutionize your app testing process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Write tests in plain English",
                description:
                  "Describe what you want to test in natural language. No coding or complex scripts required.",
                color: "bg-gradient-to-r from-blue-600 to-purple-600",
              },
              {
                step: "2",
                title: "AI tests on real devices",
                description:
                  "Our AI runs your tests on real iOS and Android devices in our secure cloud infrastructure.",
                color: "bg-gradient-to-r from-purple-600 to-pink-600",
              },
              {
                step: "3",
                title: "Get detailed insights",
                description:
                  "Receive comprehensive reports with screenshots, videos, performance metrics, and actionable insights.",
                color: "bg-gradient-to-r from-green-600 to-blue-600",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                className="text-center relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={`w-16 h-16 ${step.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl`}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.step}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>

                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-12 h-0.5 bg-gradient-to-r from-gray-600 to-transparent transform translate-x-6"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Calculator Section with Real-time Updates */}
      <AnimatedSection id="calculator" className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-6">
            Calculate Your QA Costs
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Calculate your potential savings with QualGent's AI-powered testing solution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator Form */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="relative rounded-2xl border border-neutral-800 transition-colors duration-200 p-0 bg-neutral-950/80 shadow-lg hover:border-orange-400 hover:bg-orange-950/20 p-4">
                <CardContent className="p-0 space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Cost Calculator</h3>
                    <p className="text-gray-400">Calculate the true cost of maintaining an in-house QA team</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        label: "Number of Developers",
                        value: numDevelopers,
                        setter: setNumDevelopers,
                        max: 20,
                        min: 1,
                      },
                      { label: "App Age (years)", value: appAge, setter: setAppAge, max: 10, min: 1 },
                      {
                        label: "Desired Test Coverage (%)",
                        value: testCoverage,
                        setter: setTestCoverage,
                        max: 100,
                        min: 10,
                        step: 5,
                      },
                      { label: "Number of QA Testers", value: numQATesters, setter: setNumQATesters, max: 10, min: 1 },
                      {
                        label: "QA Tester Salary ($/year)",
                        value: qaTesterSalary,
                        setter: setQaTesterSalary,
                        max: 200000,
                        min: 50000,
                        step: 5000,
                      },
                      { label: "Number of SDETs", value: numSDETs, setter: setNumSDETs, max: 10, min: 1 },
                      {
                        label: "SDET Salary ($/year)",
                        value: sdetSalary,
                        setter: setSdetSalary,
                        max: 250000,
                        min: 100000,
                        step: 5000,
                      },
                    ].map((field, index) => (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-300">{field.label}</Label>
                          <div className="flex items-center space-x-3">
                            <motion.span
                              className="text-sm text-white font-medium"
                              key={field.value[0]}
                              initial={{ scale: 1.2, color: "#f97316" }}
                              animate={{ scale: 1, color: "#ffffff" }}
                              transition={{ duration: 0.3 }}
                            >
                              {field.label.includes("Salary") ? `$${field.value[0].toLocaleString()}` : field.value[0]}
                            </motion.span>
                            <Input
                              type="number"
                              value={field.value[0]}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || field.min
                                const clampedValue = Math.max(field.min, Math.min(field.max, value))
                                field.setter([clampedValue])
                              }}
                              min={field.min}
                              max={field.max}
                              step={field.step || 1}
                              className="w-20 h-8 text-sm bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                        </div>
                        <Slider
                          value={field.value}
                          onValueChange={field.setter}
                          max={field.max}
                          min={field.min}
                          step={field.step || 1}
                          className="w-full"
                          trackClassName="bg-gray-700"
                          rangeClassName="bg-gradient-to-r from-orange-500 to-yellow-500"
                          thumbClassName="border-orange-500 bg-orange-500 hover:bg-orange-600 focus:ring-orange-500"
                        />
                      </motion.div>
                    ))}

<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  <div className="space-y-4">
    <Label className="text-sm font-medium text-gray-300">Test Run Cadence</Label>
    <RadioGroup
      value={testCadence}
      onValueChange={setTestCadence}
      className="flex flex-col space-y-2"
    >
      {["daily", "weekly", "monthly"].map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem
            value={option}
            id={option}
            className="h-4 w-4 border-gray-600 text-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
          />
          <Label htmlFor={option} className="text-gray-300 capitalize cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>

  <div className="space-y-4">
    <Label className="text-sm font-medium text-gray-300">Run Type</Label>
    <RadioGroup
      value={runType}
      onValueChange={setRunType}
      className="flex flex-col space-y-2"
    >
      {["sequential", "parallel"].map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem
            value={option}
            id={option}
            className="h-4 w-4 border-gray-600 text-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
          />
          <Label htmlFor={option} className="text-gray-300 capitalize cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
</div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results with Real-time Updates */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="relative rounded-2xl border border-neutral-800 transition-colors duration-200 p-8 bg-neutral-950/80 shadow-lg">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-semibold text-white mb-6">Save with QualGent</h3>
                  <div className="space-y-4 mb-6">
                    <motion.div
                      className="text-4xl font-bold text-green-400"
                      key={costs.savingsPercentage}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {costs.savingsPercentage}% Savings
                    </motion.div>
                    <motion.div
                      className="text-2xl font-semibold text-white"
                      key={costs.savings}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ${costs.savings.toLocaleString()} per year
                    </motion.div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Most customers save over 60% on testing costs while improving quality and speed.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold text-lg px-8 py-4">
                      Book a Demo
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>

              <Card className="relative rounded-2xl border border-neutral-800 transition-colors duration-200 p-8 bg-neutral-950/80 shadow-lg">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold text-white mb-6">Cost Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Total Tests Required", value: costs.totalTests },
                      { label: "Test Creation Cost", value: `$${costs.testCreationCost.toLocaleString()}` },
                      { label: "Test Maintenance Cost", value: `$${costs.testMaintenanceCost.toLocaleString()}` },
                      { label: "QA Team Cost", value: `$${costs.qaTeamCost.toLocaleString()}` },
                      { label: "Infrastructure Cost", value: `$${costs.infrastructureCost.toLocaleString()}` },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <span className="text-gray-400">{item.label}</span>
                        <motion.span
                          className="font-medium text-white"
                          key={item.value}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.value}
                        </motion.span>
                      </motion.div>
                    ))}
                    <div className="pt-4">
                      <motion.div className="flex justify-between text-xl font-bold" whileHover={{ scale: 1.02 }}>
                        <span className="text-white">Total Annual Cost</span>
                        <motion.span
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent"
                          key={costs.totalAnnualCost}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          ${costs.totalAnnualCost.toLocaleString()}
                        </motion.span>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Founders Section */}
      <AnimatedSection id="founders" className="py-20 mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-6">
              Meet The Founders 
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our founders shipped mobile software to billions of users at Google, bringing deep expertise in quality at scale.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Founder 1 */}
            <motion.div
              className="relative rounded-2xl border border-neutral-800 transition-colors duration-200 p-8 bg-neutral-950/80 shadow-lg flex flex-col items-center hover:border-orange-400 hover:bg-orange-950/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-orange-500/30 to-yellow-500/30 flex items-center justify-center mb-6 overflow-hidden">
                <img 
                  src="/shivam-founder.png" 
                  alt="Shivam Agrawal" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-white mb-1">Shivam Agrawal</h3>
                <p className="text-gray-400 mb-4">CEO & Co-founder</p>
                <a
                  href="https://www.linkedin.com/in/shivam-agrawal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-base font-medium"
                >
                  <Linkedin className="h-5 w-5" /> LinkedIn
                </a>
              </div>
            </motion.div>
            {/* Founder 2 */}
            <motion.div
              className="relative rounded-2xl border border-neutral-800 transition-colors duration-200 p-8 bg-neutral-950/80 shadow-lg flex flex-col items-center hover:border-orange-400 hover:bg-orange-950/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-orange-500/30 to-yellow-500/30 flex items-center justify-center mb-6 overflow-hidden">
                <img 
                  src="/aaron-founder.png" 
                  alt="Aaron Yu" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-white mb-1">Aaron Yu</h3>
                <p className="text-gray-400 mb-4">CTO & Co-founder</p>
                <a
                  href="https://www.linkedin.com/in/aaron-y-a12518ab/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-base font-medium"
                >
                  <Linkedin className="h-5 w-5" /> LinkedIn
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Built by Alums Section */}
      <AnimatedSection id="alums" className="py-10 mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-400 mb-2">Built by Alums of</h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-16">
            <div className="h-16 flex items-center group transition-all">
              <img
                src="/google.png"
                alt="Google"
                className="h-12 w-auto grayscale group-hover:grayscale-0 group-hover:opacity-100 opacity-80 transition-all duration-300"
                style={{ filter: 'grayscale(100%)', transition: 'filter 0.3s, opacity 0.3s' }}
                onMouseOver={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                onMouseOut={e => e.currentTarget.style.filter = 'grayscale(100%)'}
              />
            </div>
            <div className="h-16 flex items-center group transition-all">
              <img
                src="/yc-logo.png"
                alt="Y Combinator"
                className="h-10 w-auto grayscale group-hover:grayscale-0 group-hover:opacity-100 opacity-80 transition-all duration-300"
                style={{ filter: 'grayscale(100%)', transition: 'filter 0.3s, opacity 0.3s' }}
                onMouseOver={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                onMouseOut={e => e.currentTarget.style.filter = 'grayscale(100%)'}
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <div id="section-faq" style={{ position: 'relative', top: '-80px' }} />
      <AnimatedSection id="faq" className="py-20 mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-400">Everything you need to know about QualGent</p>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative rounded-2xl border border-neutral-800 transition-colors duration-200 p-0 bg-neutral-950/80 shadow-lg hover:border-orange-400 hover:bg-orange-950/20">
                  <CardContent className="p-0">
                    <motion.button
                      className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-gray-800/50 transition-colors rounded-lg"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      whileHover={{ x: 5 }}
                    >
                      <span className="font-medium text-white text-lg">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 ml-4"
                      >
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </motion.div>
                    </motion.button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: openFaq === index ? "auto" : 0,
                        opacity: openFaq === index ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <div id="section-contact" style={{ position: 'relative', top: '-80px' }} />
      <AnimatedSection id="contact" className="py-20 bg-gray-900/30 mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-6">
              Ready to Transform Your Testing?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of developers who trust QualGent for their mobile app testing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(251, 146, 60, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold px-8 py-4 text-lg shadow-xl"
                >
                  Get Started Now
                </Button>
              </motion.div>
              {/* <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="text-gray-300 hover:text-white border-gray-700 px-8 py-4 text-lg bg-transparent"
                >
                  Contact Sales
                </Button>
              </motion.div> */}
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Link href="mailto:sales@qualgent.ai" className="text-gray-300 hover:text-white transition-colors">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>sales@qualgent.ai</span>
                </div>
              </Link>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  href="https://www.linkedin.com/company/qualgent/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="https://qualgent.com" className="text-gray-300 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} QualGent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
