import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Download, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Layers, 
  Navigation,
  Compass,
  MapPin,
  X,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { stampGeoDataOnImage } from '../utils/geoStamper';
import { playClickPop, playSuccessChime } from '../utils/audioFeedback';

const PHOTO_SLOTS = [
  {
    key: 'roadView',
    title: '1. रोड / सड़क का दृश्य (Road View / Street Approach)',
    tag: 'अति आवश्यक',
    tagColor: 'bg-red-100 text-red-700 border-red-200',
    description: 'सड़क से 30-50 मीटर दूर से ली गई फ़ोटो, जिसमें मुख्य सड़क और दुकान की ओर जाने वाला रास्ता दिखे।'
  },
  {
    key: 'storefront',
    title: '2. दुकान का बाहर से दृश्य (Storefront Exterior)',
    tag: 'वेरिफिकेशन के लिए ज़रूरी',
    tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'दुकान का पूरा अगला हिस्सा (Front) जिसमें बोर्ड और प्रवेश द्वार साफ दिखाई दे।'
  },
  {
    key: 'signboard',
    title: '3. साइनबोर्ड / नाम पट्टिका (Close-up Signboard)',
    tag: 'रैंकिंग बूस्ट',
    tagColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'बोर्ड का नज़दीक से साफ फ़ोटो, जिस पर दुकान का आधिकारिक नाम और फोन नंबर लिखा हो।'
  },
  {
    key: 'interior',
    title: '4. अंदर का दृश्य (Interior / Work Area)',
    tag: 'ग्राहक विश्वास',
    tagColor: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'दुकान या ऑफिस के अंदर का दृश्य (काउंटर, प्रोडक्ट्स या काम करने की जगह)।'
  }
];

const STAMP_MODELS = [
  {
    id: 'google_map_plate',
    name: 'Google Maps Pro Model',
    desc: 'Mini Road Map + 3D Road Arrow + Dual Name Plate (सबसे लोकप्रिय)',
    badge: 'Recommended',
    badgeColor: 'bg-blue-600 text-white'
  },
  {
    id: 'road_arrow_hud',
    name: 'Road Arrow Navigator Model',
    desc: 'बड़ा Directional Arrow + Highway Signboard स्टाइल',
    badge: 'Road Focus',
    badgeColor: 'bg-emerald-600 text-white'
  },
  {
    id: 'solocator_pro',
    name: 'Surveyor / Solocator Pro Model',
    desc: 'Multi-column Engineering Badge + Heading + Elevation',
    badge: 'Pro Audit',
    badgeColor: 'bg-amber-600 text-white'
  }
];

export default function StepRoadPhotos({ formData, updateFormData, onNext, onPrev, isRecharged, onOpenPricing }) {
  const [selectedModel, setSelectedModel] = useState('google_map_plate');
  const [processingKey, setProcessingKey] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Live Phone Camera Viewfinder states
  const [cameraActiveKey, setCameraActiveKey] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Apply stamp function
  const applyStamp = async (key, rawDataUrl, filename = 'photo.jpg') => {
    setProcessingKey(key);
    try {
      const stampedUrl = await stampGeoDataOnImage({
        imageSrc: rawDataUrl,
        businessName: formData.businessName || 'Business Location',
        address: [formData.addressLine1, formData.city].filter(Boolean).join(', '),
        roadName: formData.roadName || 'Main Road',
        lat: formData.latitude || 28.6139,
        lng: formData.longitude || 77.2090,
        model: selectedModel,
        distanceMeters: 45
      });

      updateFormData({
        photos: {
          ...(formData.photos || {}),
          [key]: {
            raw: rawDataUrl,
            stamped: stampedUrl,
            name: filename,
            model: selectedModel,
            timestamp: new Date().toISOString()
          }
        }
      });
      playSuccessChime();
    } catch (err) {
      console.error("Stamping failed:", err);
    } finally {
      setProcessingKey(null);
    }
  };

  const handleFileUpload = (key, file) => {
    if (!file) return;
    playClickPop();
    const reader = new FileReader();
    reader.onload = (e) => {
      applyStamp(key, e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Re-stamp all existing photos when user changes the model
  const handleModelChange = async (newModel) => {
    setSelectedModel(newModel);
    playClickPop();
    const photos = formData.photos || {};
    for (const key of Object.keys(photos)) {
      if (photos[key]?.raw) {
        await applyStamp(key, photos[key].raw, photos[key].name || `${key}.jpg`);
      }
    }
  };

  // Start Live Phone Camera with Viewfinder HUD
  const startCamera = async (slotKey) => {
    playClickPop();
    setCameraActiveKey(slotKey);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera error:", err);
      alert("कैमरा चालू नहीं हो सका। कृपया फ़ोटो अपलोड विकल्प का उपयोग करें।");
      setCameraActiveKey(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActiveKey(null);
  };

  const captureCameraPhoto = () => {
    playClickPop();
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const slotKey = cameraActiveKey;
    stopCamera();
    applyStamp(slotKey, dataUrl, `${slotKey}_captured.jpg`);
  };

  const handleDownload = (photoObj, filenamePrefix) => {
    if (!photoObj || !photoObj.stamped) return;
    if (!isRecharged) {
      alert("⚠️ कृपया ध्यान दें: Geo-Tagged तस्वीरें डाउनलोड करने के लिए रिचार्ज आवश्यक है। कृपया अपना प्लान चुनें!");
      if (onOpenPricing) onOpenPricing();
      return;
    }
    playClickPop();
    const link = document.createElement('a');
    link.href = photoObj.stamped;
    const sanitizedName = (formData.businessName || 'gbp').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${sanitizedName}_${filenamePrefix}_${selectedModel}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs mb-2 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> Road Map + Direction Arrow + Name Plate
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Camera className="text-blue-600 w-6 h-6" />
              रोड पिक्चर व Name Plate डिज़ाइन स्टूडियो
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Google Maps पर फोटो में **Mini Road Map**, **Direction Arrow (Airo)** और **आधिकारिक Name Plate** होने से Google इसे तुरंत 100% वेरिफाइड स्टोरफ़्रंट मानता है।
            </p>
          </div>
        </div>

        {/* Name Plate Design Model Selector (जैसे दूसरे प्रीमियम ऐप्स में होता है) */}
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            नेम प्लेट डिज़ाइन मॉडल चुनें (Select Design Model):
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STAMP_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleModelChange(m.id)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-md shadow-blue-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-xs text-slate-900">{m.name}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? 'text-blue-700' : 'text-slate-400'}>
                      {isSelected ? '✓ एक्टिव मॉडल' : 'चुनें'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Auto Stamp</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Photo Upload / Camera Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PHOTO_SLOTS.map((slot) => {
          const photoData = formData.photos?.[slot.key];
          const isProcessing = processingKey === slot.key;

          return (
            <div
              key={slot.key}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-extrabold text-sm text-slate-900">{slot.title}</h4>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${slot.tagColor} shrink-0`}>
                    {slot.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {slot.description}
                </p>

                {/* Upload or Preview Box */}
                {photoData ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group">
                    <img
                      src={photoData.stamped}
                      alt={slot.title}
                      className="w-full h-48 object-cover opacity-95 group-hover:opacity-85 transition-opacity"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(photoData.stamped)}
                        className="px-3.5 py-2 bg-white/95 hover:bg-white text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" /> बड़ी देखें
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(photoData, slot.key)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" /> डाउनलोड करें
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] flex items-center justify-between border border-white/10">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> {selectedModel === 'google_map_plate' ? 'Road Map + Arrow Stamped' : 'Geo-Tagged'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera(slot.key)}
                          className="text-amber-300 hover:text-white font-bold text-xs"
                        >
                          कैमरा
                        </button>
                        <label className="cursor-pointer text-blue-300 hover:text-white font-bold text-xs flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> बदलें
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(slot.key, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isProcessing}
                        onChange={(e) => handleFileUpload(slot.key, e.target.files?.[0])}
                      />
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
                          <span className="text-xs font-bold text-blue-600">Road Map व Name Plate स्टैम्प लग रहा है...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 flex items-center justify-center transition-transform mb-2">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black text-slate-800 mb-0.5">
                            फ़ोटो अपलोड करें (Upload Photo)
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            (Mini Map + Direction Arrow + Name Plate स्टैम्प अपने आप लग जाएगा)
                          </span>
                        </>
                      )}
                    </label>

                    {/* Dedicated Phone Camera Button */}
                    <button
                      type="button"
                      onClick={() => startCamera(slot.key)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>फोन कैमरे से लाइव रोड पिक्चर लें (Camera AR Viewfinder)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Phone Camera Viewfinder Modal */}
      {cameraActiveKey && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4">
          {/* Top Camera Bar */}
          <div className="w-full max-w-lg flex items-center justify-between text-white py-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-bold text-xs font-mono">LIVE ROAD AR VIEW</span>
            </div>
            <button
              onClick={stopCamera}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Video View with AR Target & Road Direction Arrow */}
          <div className="relative w-full max-w-lg flex-1 rounded-3xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* AR Crosshair & Road Horizon Guide */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-36 border-2 border-dashed border-blue-400/80 rounded-2xl flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-300 bg-black/60 px-2 py-0.5 rounded">
                  दुकान / रोड एंट्रेंस यहाँ रखें
                </span>
              </div>
            </div>

            {/* Simulated Live AR Nameplate overlay in Camera */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 flex items-center justify-between pointer-events-none">
              <div className="text-left">
                <span className="text-[10px] text-amber-400 font-bold block">
                  🛣️ {formData.roadName || "Main Road"}
                </span>
                <span className="text-xs font-black text-white">
                  {formData.businessName || "My Business"}
                </span>
                <span className="text-[9px] text-blue-300 font-mono block">
                  GPS: {formData.latitude || "28.6139"}, {formData.longitude || "77.2090"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600/80 flex items-center justify-center text-white font-bold text-sm">
                ➜
              </div>
            </div>
          </div>

          {/* Shutter Button */}
          <div className="py-4">
            <button
              type="button"
              onClick={captureCameraPhoto}
              className="w-20 h-20 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 shadow-2xl flex items-center justify-center transform active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}

      {/* Large Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[92vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl p-2 border border-slate-800">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[82vh] object-contain rounded-2xl mx-auto" />
            <div className="flex justify-between items-center px-4 py-3 text-white text-xs">
              <span className="font-bold text-blue-400">
                ✓ Road Map + Direction Arrow + Official Name Plate Stamped
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          type="button"
          className="px-6 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors text-sm"
        >
          ← वापस जाएं (Map Pin)
        </button>
        <button
          onClick={onNext}
          type="button"
          className="px-6 py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 transition-colors text-sm shadow-md flex items-center gap-2"
        >
          अगला कदम: AI Local SEO डिस्क्रिप्शन बनाएं →
        </button>
      </div>
    </div>
  );
}
