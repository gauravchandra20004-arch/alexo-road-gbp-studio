import React, { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import Navbar, { STEPS } from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import FirebaseModal from './components/FirebaseModal';
import AdminPortal from './components/AdminPortal';
import PricingModal from './components/PricingModal';
import SafetyShieldModal from './components/SafetyShieldModal';
import PostGbpQrStudio from './components/PostGbpQrStudio';
import StepBusinessInfo from './components/StepBusinessInfo';
import StepMapLocation from './components/StepMapLocation';
import StepRoadPhotos from './components/StepRoadPhotos';
import StepSeoGenerator from './components/StepSeoGenerator';
import StepChecklist from './components/StepChecklist';
import StepSummaryExport from './components/StepSummaryExport';
import { INITIAL_FORM_DATA } from './data/categories';
import { isFirebaseReady } from './firebase/config';
import { getRechargeStatus } from './utils/rechargeStore';
import { auditGoogleSafety } from './utils/googleSafetyGuard';
import { playClickPop } from './utils/audioFeedback';

const STORAGE_KEY = 'gbp_road_app_data_v1';
const STEP_KEY = 'gbp_road_app_step_v1';

export default function App() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_FORM_DATA;
    } catch {
      return INITIAL_FORM_DATA;
    }
  });

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem(STEP_KEY);
      return savedStep ? parseInt(savedStep, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isQrStudioOpen, setIsQrStudioOpen] = useState(false);
  const [selectedPricingPlan, setSelectedPricingPlan] = useState('starter_shop');
  const [rechargeStatus, setRechargeStatus] = useState(() => getRechargeStatus());

  const workspaceRef = useRef(null);

  // Real-time Google Safety & Compliance Audit
  const safetyAudit = auditGoogleSafety(formData);

  // Refresh recharge status periodically or on mount
  useEffect(() => {
    setRechargeStatus(getRechargeStatus());
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.warn("Storage quota exceeded or disabled", e);
    }
  }, [formData]);

  useEffect(() => {
    try {
      localStorage.setItem(STEP_KEY, currentStep.toString());
    } catch (e) {
      console.warn(e);
    }
  }, [currentStep]);

  // Auto-sync customer lead & profile data to Master Backend Server (server/data/db.json)
  useEffect(() => {
    if (!formData.businessName && !formData.contactNumber) return;
    const timer = setTimeout(() => {
      try {
        const backendHost = window.location.hostname || 'localhost';
      fetch(`http://${backendHost}:5000/api/profiles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            clientUpdatedAt: new Date().toISOString(),
            isRecharged: rechargeStatus?.isRecharged || false
          })
        }).catch(err => console.debug("Sync ping skipped:", err));
      } catch {
        // silent
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, rechargeStatus]);

  const updateFormData = (patch) => {
    setFormData(prev => ({ ...prev, ...patch }));
  };

  const scrollToWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Strict Gating: Enforce recharge before accessing Step 2+
  const handleStepChange = (targetStep) => {
    playClickPop();
    if (!isRecharged && targetStep > 1) {
      setIsPricingModalOpen(true);
      return;
    }
    setCurrentStep(targetStep);
    scrollToWorkspace();
  };

  const nextStep = () => {
    playClickPop();
    if (!isRecharged && currentStep >= 1) {
      setIsPricingModalOpen(true);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
    scrollToWorkspace();
  };

  const prevStep = () => {
    playClickPop();
    setCurrentStep(prev => Math.max(prev - 1, 1));
    scrollToWorkspace();
  };

  const handleReset = () => {
    playClickPop();
    if (window.confirm("क्या आप सचमुच सारा डेटा रीसेट करके नयी शुरुआत करना चाहते हैं?")) {
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      scrollToWorkspace();
    }
  };

  const handleLoadDemo = () => {
    playClickPop();
    setFormData({
      businessName: "Chandra Auto Spares & Garage",
      primaryCategory: "Car repair and maintenance",
      secondaryCategory: "Auto parts store",
      contactNumber: "+91 98765 43210",
      email: "service@chandraauto.com",
      website: "https://chandraauto.example.com",
      addressLine1: "Plot 42, Main Road, Near Metro Pillar 128",
      addressLine2: "Opposite IOCL Petrol Pump",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110025",
      country: "India",
      openingTime: "09:00",
      closingTime: "20:30",
      openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      services: [
        "Car Mechanical Repair",
        "Engine Oil Change",
        "Wheel Alignment & Balancing",
        "Original Spare Parts",
        "Emergency Roadside Assistance"
      ],
      latitude: 28.5355,
      longitude: 77.2625,
      roadEntranceLat: 28.5358,
      roadEntranceLng: 77.2628,
      roadName: "Mathura Road (NH-19)",
      photos: {},
      seoDescription: "Welcome to Chandra Auto Spares & Garage, the top-rated car repair and maintenance service in New Delhi located conveniently at Mathura Road (NH-19). We specialize in Car Mechanical Repair, Engine Oil Change, Wheel Alignment & Balancing, and Original Spare Parts with 100% verified quality. If you are searching for the best car mechanic near me, visit us or call today for emergency assistance.",
      checklistCompleted: {
        name_match: true,
        road_visible: true,
        phone_active: true,
        address_proof: true
      }
    });
    alert("✨ डेमो डेटा सफलतापूर्वक लोड हो गया!");
    scrollToWorkspace();
  };

  const handleLoadProfile = (loadedProfile) => {
    setFormData(loadedProfile);
    setCurrentStep(1);
    scrollToWorkspace();
  };

  const handleRechargeSuccess = (plan) => {
    setRechargeStatus(getRechargeStatus());
  };

  const activeStepObj = STEPS.find(s => s.id === currentStep) || STEPS[0];
  const isRecharged = rechargeStatus?.isRecharged;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Ultra-Premium Glass Navbar */}
      <Navbar
        currentStep={currentStep}
        setStep={handleStepChange}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        onOpenFirebase={() => { playClickPop(); setIsFirebaseModalOpen(true); }}
        onOpenAdmin={() => { playClickPop(); setIsAdminModalOpen(true); }}
        onOpenPricing={() => { playClickPop(); setIsPricingModalOpen(true); }}
        onOpenSafety={() => { playClickPop(); setIsSafetyModalOpen(true); }}
        onOpenQrStudio={() => { playClickPop(); setIsQrStudioOpen(true); }}
        rechargeStatus={rechargeStatus}
        isFirebaseReady={isFirebaseReady}
        safetyScore={safetyAudit.score}
      />

      {/* Hero Section */}
      <HeroSection
        onStartCreating={() => {
          playClickPop();
          if (!isRecharged) {
            setIsPricingModalOpen(true);
          } else {
            setCurrentStep(1);
            scrollToWorkspace();
          }
        }}
        onLoadDemo={handleLoadDemo}
        onOpenAdmin={() => { playClickPop(); setIsAdminModalOpen(true); }}
        currentStep={currentStep}
        businessName={formData.businessName}
      />

      {/* Main Workspace Section */}
      <section ref={workspaceRef} className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-3 pb-32 md:pb-12">
        
        {/* Direct Fast Recharge Action Banner if not recharged */}
        {!isRecharged && (
          <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 border border-amber-400">
            <div className="flex items-center gap-2.5 text-xs font-bold text-center sm:text-left">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping shrink-0" />
              <span>
                ⚡ <strong>डायरेक्ट फास्ट रिचार्ज (1-Click Direct Pay):</strong> कोई भी प्लान चुनें और तुरंत एक्टिवेट करें:
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedPricingPlan('starter_shop');
                  setIsPricingModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-xl text-xs font-black shadow-md transition-transform active:scale-95 flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>₹499 स्टार्टर (1-Click)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPricingPlan('pro_business');
                  setIsPricingModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-white text-blue-900 hover:bg-slate-100 rounded-xl text-xs font-black shadow-md transition-transform active:scale-95 flex items-center gap-1"
              >
                <span>₹899 प्रो (5 Shops)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPricingPlan('agency_highest');
                  setIsPricingModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-amber-300 rounded-xl text-xs font-black shadow-md transition-transform active:scale-95"
              >
                <span>₹1499 VIP</span>
              </button>
            </div>
          </div>
        )}

        {/* Workspace Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden transition-all">
          
          {/* Workspace Header / Progress Bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white shadow-xs">
                  Step 0{currentStep}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {activeStepObj.label}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentStep === 1 && "अपनी दुकान या बिज़नेस की आधिकारिक जानकारी और संपर्क सूत्र भरें।"}
                {currentStep === 2 && "मैप पर दुकान का पिन और सड़क से आने वाले मुख्य रास्ते (Road Entrance) का पिन सेट करें।"}
                {currentStep === 3 && "Google वेरिफिकेशन के लिए सड़क का दृश्य और स्टोरफ़्रंट फ़ोटो पर ऑटो Geo-Tag स्टैम्प लगाएं।"}
                {currentStep === 4 && "Google 3-Pack में रैंक करने के लिए 750 अक्षरों का AI Local SEO विवरण तैयार करें।"}
                {currentStep === 5 && "Google Video Verification और दिशानिर्देशों के अनुसार 100% ऑडिट स्कोर चेक करें।"}
                {currentStep === 6 && "प्रोफाइल की पूरी समरी देखें, 1-क्लिक में Google पर सबमिट करें या डेटा बैकअप डाउनलोड करें।"}
              </p>
            </div>

            {/* Visual Step Progress Dots & Safety Mode Status */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => { playClickPop(); setIsSafetyModalOpen(true); }}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black shadow-2xs transition-all active:scale-95"
                title="Google Safety Mode शील्ड खोलें"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Safety: {safetyAudit.score}%</span>
              </button>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      s.id === currentStep
                        ? 'w-6 bg-blue-600'
                        : s.id < currentStep
                        ? 'w-2 bg-emerald-500'
                        : 'w-2 bg-slate-200'
                    }`}
                    title={s.label}
                  />
                ))}
                <span className="text-[11px] font-black text-slate-600 ml-1">
                  {currentStep}/6
                </span>
              </div>
            </div>
          </div>

          {/* Form Step Body */}
          <div className="p-5 sm:p-8">
            {currentStep === 1 && (
              <StepBusinessInfo
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
              />
            )}

            {currentStep === 2 && (
              <StepMapLocation
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {currentStep === 3 && (
              <StepRoadPhotos
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
                isRecharged={isRecharged}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}

            {currentStep === 4 && (
              <StepSeoGenerator
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {currentStep === 5 && (
              <StepChecklist
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
                setStep={handleStepChange}
              />
            )}

            {currentStep === 6 && (
              <StepSummaryExport
                formData={formData}
                onPrev={prevStep}
                onReset={handleReset}
                onImportJson={handleLoadProfile}
                isRecharged={isRecharged}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}
          </div>

        </div>

      </section>

      {/* Ultra-Premium Footer */}
      <Footer
        onOpenFirebase={() => { playClickPop(); setIsFirebaseModalOpen(true); }}
        onOpenAdmin={() => { playClickPop(); setIsAdminModalOpen(true); }}
        isFirebaseReady={isFirebaseReady}
      />

      {/* Google Safety Mode & Anti-Suspension Shield Modal */}
      <SafetyShieldModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        formData={formData}
        updateFormData={updateFormData}
      />

      {/* Post-GBP Launch QR Studio Modal (5-Star Reviews, Navigation & Standee Cards) */}
      <PostGbpQrStudio
        isOpen={isQrStudioOpen}
        onClose={() => setIsQrStudioOpen(false)}
        formData={formData}
      />

      {/* Pricing & Recharge Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onRechargeSuccess={handleRechargeSuccess}
        formData={formData}
        initialPlanId={selectedPricingPlan}
      />

      {/* Firebase Cloud Manager Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        currentFormData={formData}
        onLoadProfile={handleLoadProfile}
      />

      {/* Admin Master Backend Vault Modal */}
      <AdminPortal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoadProfile={handleLoadProfile}
      />

      {/* Mobile Bottom Navigation Bar with Blur Glass */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 z-40 px-2 py-1.5 flex justify-around shadow-2xl">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => handleStepChange(step.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-all ${
                isActive 
                  ? 'text-blue-600 bg-blue-50/80 scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{step.short || step.label.slice(0, 7)}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
