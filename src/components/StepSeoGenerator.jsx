import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Wand2, Tag, ShieldCheck } from 'lucide-react';

export default function StepSeoGenerator({ formData, updateFormData, onNext, onPrev }) {
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState('seo'); // 'seo', 'professional', 'direct'

  const businessName = formData.businessName || 'Your Business Name';
  const category = formData.primaryCategory || 'Services';
  const city = formData.city || 'your area';
  const roadName = formData.roadName || 'Main Road';
  const servicesList = (formData.services || []).join(', ');

  // Template generator function
  const generateDescription = (tone) => {
    if (tone === 'seo') {
      return `Welcome to ${businessName}, the leading ${category.toLowerCase()} in ${city} located conveniently at ${roadName}. We specialize in high-quality ${servicesList || 'professional services'} with trusted customer satisfaction. If you are searching for the best ${category.toLowerCase()} near me or top-rated ${category.toLowerCase()} in ${city}, our experienced team is here to assist you. Visit us at our location or call today for fast, reliable, and verified service.`;
    } else if (tone === 'professional') {
      return `${businessName} is your premier destination for ${category.toLowerCase()} in ${city}. Situated right on ${roadName}, we provide comprehensive solutions including ${servicesList || 'tailored services'}. Committed to excellence, integrity, and timely delivery, we have served hundreds of happy customers across the region. Contact us or visit our storefront for personalized support.`;
    } else {
      return `Looking for reliable ${category.toLowerCase()} in ${city}? ${businessName} on ${roadName} provides top-notch ${servicesList || 'services'} at transparent prices. Easy road access, quick turnaround, and verified quality. Contact us today or visit our store.`;
    }
  };

  const handleGenerate = (tone = selectedTone) => {
    const desc = generateDescription(tone);
    updateFormData({ seoDescription: desc });
  };

  // Initial load auto-generate if empty
  useEffect(() => {
    if (!formData.seoDescription) {
      handleGenerate('seo');
    }
  }, []);

  const handleCopy = () => {
    if (!formData.seoDescription) return;
    navigator.clipboard.writeText(formData.seoDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = (formData.seoDescription || '').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Wand2 className="text-purple-600 w-6 h-6" />
          AI Local SEO डिस्क्रिप्शन व कीवर्ड जनरेटर
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Google Business Profile में 750 अक्षरों का विवरण (Description) लिखने का विकल्प होता है। सही कीवर्ड डालने से आपकी दुकान Google सर्च और मैप्स पर सबसे ऊपर आती है।
        </p>
      </div>

      {/* Tone Selection & Generator Buttons */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSelectedTone('seo'); handleGenerate('seo'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTone === 'seo'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🚀 High SEO Ranking (Google 3-Pack)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedTone('professional'); handleGenerate('professional'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTone === 'professional'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              👔 प्रोफेशनल व भरोसेमंद (Corporate)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedTone('direct'); handleGenerate('direct'); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTone === 'direct'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ⚡ शॉर्ट व डायरेक्ट (Quick & Clear)
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate(selectedTone)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold border border-purple-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> दोबारा बनाएं (Regenerate)
          </button>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={7}
            value={formData.seoDescription || ''}
            onChange={(e) => updateFormData({ seoDescription: e.target.value })}
            placeholder="यहाँ आपका Google Business Profile डिस्क्रिप्शन तैयार होगा..."
            className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed text-slate-800"
          />
          <div className="flex justify-between items-center text-xs mt-1 text-slate-500 px-1">
            <span>
              Google Limit: <strong className={charCount > 750 ? 'text-red-500' : 'text-slate-800'}>{charCount}</strong> / 750 अक्षर
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> कॉपी हो गया!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> टेक्स्ट कॉपी करें
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suggested High-ranking Local Keywords */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-blue-600" />
          आपकी प्रोफाइल के लिए अनुशंसित Google Search Keywords (Tags):
        </h4>

        <div className="flex flex-wrap gap-2">
          {[
            `Best ${category} in ${city}`,
            `${category} near me`,
            `${businessName} ${city}`,
            `${category} on ${roadName}`,
            `Verified ${category} near ${roadName}`,
            `Affordable ${category} ${city}`,
            `Top rated ${category} shop`
          ].map((kw, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200"
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          type="button"
          className="px-6 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors text-sm"
        >
          ← वापस जाएं (Road Photos)
        </button>
        <button
          onClick={onNext}
          type="button"
          className="px-6 py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 transition-colors text-sm shadow-md flex items-center gap-2"
        >
          अगला कदम: वेरिफिकेशन चेकलिस्ट व स्कोर →
        </button>
      </div>
    </div>
  );
}
