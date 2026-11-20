import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  ExternalLink, 
  Info, 
  CheckCircle2, 
  Ruler, 
  Route, 
  Radio, 
  Crosshair, 
  Power, 
  AlertCircle,
  Wifi,
  LocateFixed
} from 'lucide-react';
import { calculateDistanceMeters, calculateCompassDirection } from '../utils/geoMath';
import { playClickPop, playSuccessChime } from '../utils/audioFeedback';

export default function StepMapLocation({ formData, updateFormData, onNext, onPrev }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const shopMarkerRef = useRef(null);
  const roadMarkerRef = useRef(null);
  const liveGpsMarkerRef = useRef(null);
  const liveAccuracyCircleRef = useRef(null);
  const watchIdRef = useRef(null);

  const [activePinType, setActivePinType] = useState('shop'); // 'shop' or 'road'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  // Live GPS Tracking & Notification State
  const [isLiveGpsOn, setIsLiveGpsOn] = useState(false);
  const [gpsNotification, setGpsNotification] = useState(null); // { type: 'success' | 'warning' | 'info', message, accuracy, time }
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsPermissionDenied, setGpsPermissionDenied] = useState(false);

  const shopLat = formData.latitude || 28.6139;
  const shopLng = formData.longitude || 77.2090;
  const roadLat = formData.roadEntranceLat || (shopLat + 0.0003);
  const roadLng = formData.roadEntranceLng || (shopLng + 0.0003);

  // Live JS Distance & Direction calculation
  const distanceMeters = calculateDistanceMeters(shopLat, shopLng, roadLat, roadLng);
  const roadDirection = calculateCompassDirection(roadLat, roadLng, shopLat, shopLng);

  // Radar Pulse Marker for Real-Time Live GPS
  const createLiveGpsIcon = () => {
    return L.divIcon({
      className: 'live-gps-radar-icon',
      html: `
        <div style="position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:30px; height:30px; border-radius:50%; background:rgba(37,99,235,0.4); animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:absolute; width:18px; height:18px; border-radius:50%; background:#2563eb; border:3px solid white; box-shadow:0 0 12px rgba(37,99,235,0.9);"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Toggle Real-Time Live GPS tracking
  const toggleLiveGps = () => {
    playClickPop();
    if (isLiveGpsOn) {
      // Turn OFF
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (liveGpsMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(liveGpsMarkerRef.current);
        liveGpsMarkerRef.current = null;
      }
      if (liveAccuracyCircleRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(liveAccuracyCircleRef.current);
        liveAccuracyCircleRef.current = null;
      }
      setIsLiveGpsOn(false);
      setGpsNotification({
        type: 'info',
        message: '⚪ लाइव GPS बंद कर दिया गया है। पिन को मैन्युअली मूव किया जा सकता है।',
        time: new Date().toLocaleTimeString()
      });
      return;
    }

    // Turn ON
    if (!navigator.geolocation) {
      alert("आपके डिवाइस / ब्राउज़र में GPS Geolocation सपोर्ट नहीं है।");
      return;
    }

    setGeoLocating(true);
    setGpsPermissionDenied(false);
    setGpsNotification({
      type: 'searching',
      message: '🛰️ सैटेलाइट सिग्नल खोज रहे हैं... कृपया लोकेशन परमिशन Allow करें...',
      time: new Date().toLocaleTimeString()
    });

    let isFirstFix = true;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy);

        setGeoLocating(false);
        setIsLiveGpsOn(true);
        setGpsAccuracy(accuracy);
        setGpsPermissionDenied(false);

        // Update form state with live GPS coordinates
        updateFormData({
          latitude: lat,
          longitude: lng,
          roadEntranceLat: parseFloat((lat + 0.0002).toFixed(6)),
          roadEntranceLng: parseFloat((lng + 0.0002).toFixed(6)),
        });

        // Set Live Notification Status
        setGpsNotification({
          type: 'active',
          message: `🟢 लाइव GPS ऑन है: लोकेशन सिग्नल लॉक (सटीकता: ±${accuracy}m)`,
          accuracy,
          coords: `${lat}, ${lng}`,
          time: new Date().toLocaleTimeString()
        });

        const map = mapInstanceRef.current;
        if (map) {
          // If first fix, play audio chime and zoom directly to street level
          if (isFirstFix) {
            playSuccessChime();
            map.flyTo([lat, lng], 18, { animate: true, duration: 1.5 });
            isFirstFix = false;
          }

          // Update Leaflet Shop Marker
          if (shopMarkerRef.current) {
            shopMarkerRef.current.setLatLng([lat, lng]);
          }

          // Update Live Radar Dot
          if (!liveGpsMarkerRef.current) {
            liveGpsMarkerRef.current = L.marker([lat, lng], {
              icon: createLiveGpsIcon(),
              zIndexOffset: 1000
            }).addTo(map);
          } else {
            liveGpsMarkerRef.current.setLatLng([lat, lng]);
          }

          // Update Live Accuracy Circle
          if (!liveAccuracyCircleRef.current) {
            liveAccuracyCircleRef.current = L.circle([lat, lng], {
              radius: accuracy,
              color: '#3b82f6',
              weight: 1.5,
              fillColor: '#60a5fa',
              fillOpacity: 0.15
            }).addTo(map);
          } else {
            liveAccuracyCircleRef.current.setLatLng([lat, lng]);
            liveAccuracyCircleRef.current.setRadius(accuracy);
          }
        }
      },
      (err) => {
        setGeoLocating(false);
        setIsLiveGpsOn(false);
        if (err.code === 1) {
          setGpsPermissionDenied(true);
          setGpsNotification({
            type: 'error',
            message: '⚠️ GPS परमिशन अस्वीकार की गई! कृपया ब्राउज़र या फ़ोन सेटिंग्स में Location Allow करें।',
            time: new Date().toLocaleTimeString()
          });
        } else {
          setGpsNotification({
            type: 'error',
            message: `⚠️ GPS सिग्नल नहीं मिला (${err.message})। कृपया खुली जगह में जाएं।`,
            time: new Date().toLocaleTimeString()
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000
      }
    );

    watchIdRef.current = id;
  };

  // Re-center map to live GPS
  const handleRecenterGps = () => {
    playClickPop();
    if (mapInstanceRef.current && shopLat && shopLng) {
      mapInstanceRef.current.flyTo([shopLat, shopLng], 18, { animate: true, duration: 1.2 });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Custom modern SVG icons for markers
  const createCustomIcon = (color, label) => {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:${color}; color:white; font-size:11px; font-weight:700; padding:3px 8px; border-radius:12px; white-space:nowrap; box-shadow:0 3px 6px rgba(0,0,0,0.3); border:2px solid white; margin-bottom:2px;">
            ${label}
          </div>
          <div style="width:28px; height:28px; background:${color}; border-radius:50% 50% 50% 0; transform: rotate(-45deg); display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
            <div style="width:10px; height:10px; background:white; border-radius:50%; transform: rotate(45deg);"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([shopLat, shopLng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Shop Marker
      const shopMarker = L.marker([shopLat, shopLng], {
        draggable: true,
        icon: createCustomIcon('#ef4444', '🏢 दुकान / शॉप')
      }).addTo(map);

      shopMarker.on('dragend', (e) => {
        playClickPop();
        const { lat, lng } = e.target.getLatLng();
        updateFormData({
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6))
        });
      });
      shopMarkerRef.current = shopMarker;

      // Road Entrance Marker
      const roadMarker = L.marker([roadLat, roadLng], {
        draggable: true,
        icon: createCustomIcon('#3b82f6', '🛣️ रोड एंट्रेंस')
      }).addTo(map);

      roadMarker.on('dragend', (e) => {
        playClickPop();
        const { lat, lng } = e.target.getLatLng();
        updateFormData({
          roadEntranceLat: parseFloat(lat.toFixed(6)),
          roadEntranceLng: parseFloat(lng.toFixed(6))
        });
      });
      roadMarkerRef.current = roadMarker;

      // Map Click event
      map.on('click', (e) => {
        playClickPop();
        const { lat, lng } = e.latlng;
        if (activePinType === 'shop') {
          shopMarker.setLatLng([lat, lng]);
          updateFormData({
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6))
          });
        } else {
          roadMarker.setLatLng([lat, lng]);
          updateFormData({
            roadEntranceLat: parseFloat(lat.toFixed(6)),
            roadEntranceLng: parseFloat(lng.toFixed(6))
          });
        }
      });

      mapInstanceRef.current = map;
    }

    // Fix map container size on render
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

  }, []);

  // Update markers when props change externally
  useEffect(() => {
    if (shopMarkerRef.current && mapInstanceRef.current) {
      shopMarkerRef.current.setLatLng([shopLat, shopLng]);
    }
    if (roadMarkerRef.current && mapInstanceRef.current) {
      roadMarkerRef.current.setLatLng([roadLat, roadLng]);
    }
  }, [shopLat, shopLng, roadLat, roadLng]);

  // Current Geolocation trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("आपके डिवाइस में Geolocation सपोर्ट नहीं है।");
      return;
    }
    setGeoLocating(true);
    playClickPop();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        updateFormData({
          latitude: lat,
          longitude: lng,
          roadEntranceLat: parseFloat((lat + 0.0002).toFixed(6)),
          roadEntranceLng: parseFloat((lng + 0.0002).toFixed(6)),
        });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
        }
        setGeoLocating(false);
      },
      (err) => {
        alert("GPS लोकेशन एक्सेस नहीं हो सकी: " + err.message);
        setGeoLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Search Address using Nominatim
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    playClickPop();
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        updateFormData({
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lon.toFixed(6)),
          roadEntranceLat: parseFloat((lat + 0.0002).toFixed(6)),
          roadEntranceLng: parseFloat((lon + 0.0002).toFixed(6)),
        });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lon], 17);
        }
      } else {
        alert("स्थान नहीं मिला, कृपया थोड़ा और विस्तार से लिखें (उदा: Connaught Place New Delhi)");
      }
    } catch {
      alert("सर्च करने में समस्या आई, कृपया इंटरनेट कनेक्शन जांचें।");
    } finally {
      setIsSearching(false);
    }
  };

  // Google Maps preview URL
  const googleMapsUrl = `https://www.google.com/maps?q=${shopLat},${shopLng}`;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-red-500 w-6 h-6" />
              दुकान व मुख्य सड़क (Road Entrance) का सटीक मैप पिन
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Google Maps पर सही रोड पिन लगाने से ग्राहक बिना भटके सीधे आपकी दुकान के सामने पहुँचते हैं।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live GPS ON / OFF Toggle Button */}
            <button
              onClick={toggleLiveGps}
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 ${
                isLiveGpsOn
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
              }`}
              title="लाइव GPS ऑन करें और रियल-टाइम लोकेशन ट्रैक करें"
            >
              <Radio className={`w-4 h-4 ${isLiveGpsOn ? 'animate-spin' : ''}`} />
              <span>{isLiveGpsOn ? '🟢 लाइव GPS ऑन है (Tracking ON)' : '🛰️ लाइव GPS ऑन करें (GPS ON)'}</span>
            </button>

            {/* Quick 1-Snap Detect Location */}
            <button
              onClick={handleDetectLocation}
              disabled={geoLocating}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 shadow-2xs"
              title="वर्तमान स्थिति का 1-क्लिक स्नैप लें"
            >
              <Navigation className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
              {geoLocating ? 'खोज रहे हैं...' : 'लोकेशन स्नैप'}
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Maps
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सड़क, मोहल्ला, शहर या लैंडमार्क सर्च करें (उदा: MG Road Bangalore)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {isSearching ? 'खोज रहे हैं...' : 'सर्च करें'}
          </button>
        </form>
      </div>

      {/* Pin Selector Toggle & Map */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5 pl-2">
            <Compass className="w-4 h-4 text-blue-600" />
            मैप पर क्लिक करके पिन सेट करें:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { playClickPop(); setActivePinType('shop'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePinType === 'shop'
                  ? 'bg-red-500 text-white shadow-sm ring-2 ring-red-300'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              🔴 दुकान का पिन सेट करें (Shop Pin)
            </button>
            <button
              type="button"
              onClick={() => { playClickPop(); setActivePinType('road'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePinType === 'road'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              🔵 मुख्य सड़क/प्रवेश द्वार (Road Entrance)
            </button>
          </div>
        </div>

        {/* Live JavaScript Distance & Road Entrance Calculation Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/80 rounded-xl border border-blue-200/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">रोड से दूरी (Live JS)</span>
              <span className="font-black text-slate-900 text-sm">{distanceMeters} मीटर</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">सड़क से दिशा</span>
              <span className="font-black text-slate-900 text-sm">{roadDirection}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Google Navigation</span>
              <span className="font-bold text-emerald-700 text-xs">100% सटीक अराइवल</span>
            </div>
          </div>
        </div>

        {/* Live GPS Notification Bar */}
        <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
          isLiveGpsOn
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
            : gpsNotification?.type === 'searching'
            ? 'bg-amber-50 border-amber-300 text-amber-950 animate-pulse'
            : gpsNotification?.type === 'error'
            ? 'bg-red-50 border-red-300 text-red-950'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isLiveGpsOn ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
            }`}>
              <Radio className={`w-4 h-4 ${isLiveGpsOn ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  {isLiveGpsOn
                    ? `🟢 लाइव GPS सक्रिय (Tracking ON)`
                    : (gpsNotification?.message || '⚪ लाइव GPS बंद है (अपनी असली दुकान की लोकेशन पाने के लिए ऑन करें)')}
                </span>
                {isLiveGpsOn && gpsAccuracy && (
                  <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                    सटीकता: ±{gpsAccuracy}m
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isLiveGpsOn
                  ? `सटीक GPS सिग्नल लॉक है • Lat: ${shopLat.toFixed(5)}, Lng: ${shopLng.toFixed(5)}`
                  : 'GPS ऑन करने से मैप सीधे आपकी दुकान के सामने ज़ूम हो जाएगा और पिन ऑटोमैटिक सेट होगा।'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {isLiveGpsOn && (
              <button
                type="button"
                onClick={handleRecenterGps}
                className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-300 text-xs flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="मैप को वर्तमान GPS पिन पर केंद्रित करें"
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                <span>री-सेंटर (Fly)</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleLiveGps}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                isLiveGpsOn
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {isLiveGpsOn ? 'GPS बंद करें' : 'GPS ऑन करें'}
            </button>
          </div>
        </div>

        {/* GPS Permission Warning Banner if denied */}
        {gpsPermissionDenied && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-black text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>डिवाइस लोकेशन परमिशन बंद है (Location Access Denied)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
              1. अपने फ़ोन/कंप्यूटर के नोटिफिकेशन बार में <strong>GPS (Location)</strong> ऑन करें।<br/>
              2. ब्राउज़र में URL बार के बाएं कोने पर 🔒 लॉक या सेटिंग्स आइकन पर क्लिक करके <strong>Location: Allow</strong> करें, फिर दोबारा "GPS ऑन करें" दबाएं।
            </p>
          </div>
        )}

        {/* Map Container */}
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Top Left Helper Pill */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-700 z-[1000] pointer-events-none">
            💡 आप दोनों पिन को ड्रैग (खींच) भी कर सकते हैं
          </div>

          {/* Top Right Live GPS Status Floating Pill */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLiveGps}
              className={`px-3 py-1.5 rounded-xl font-black text-xs shadow-md backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 ${
                isLiveGpsOn
                  ? 'bg-emerald-600/90 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                  : 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveGpsOn ? 'animate-pulse text-emerald-200' : 'text-slate-500'}`} />
              <span>{isLiveGpsOn ? `GPS ON (±${gpsAccuracy || 5}m)` : 'GPS Off'}</span>
            </button>

            {isLiveGpsOn && (
              <button
                type="button"
                onClick={handleRecenterGps}
                className="p-1.5 bg-white/90 hover:bg-white text-blue-600 rounded-xl shadow-md border border-slate-200 transition-all active:scale-95"
                title="वर्तमान स्थिति पर ज़ूम करें"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Coordinate details form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              दुकान Coordinates (Lat, Lng)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                value={shopLat}
                onChange={(e) => updateFormData({ latitude: parseFloat(e.target.value) || 0 })}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-slate-50"
              />
              <input
                type="number"
                step="0.000001"
                value={shopLng}
                onChange={(e) => updateFormData({ longitude: parseFloat(e.target.value) || 0 })}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              सड़क प्रवेश द्वार (Road Entrance Lat, Lng)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                value={roadLat}
                onChange={(e) => updateFormData({ roadEntranceLat: parseFloat(e.target.value) || 0 })}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-slate-50"
              />
              <input
                type="number"
                step="0.000001"
                value={roadLng}
                onChange={(e) => updateFormData({ roadEntranceLng: parseFloat(e.target.value) || 0 })}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              सड़क का नाम (Road Name)
            </label>
            <input
              type="text"
              value={formData.roadName || ''}
              onChange={(e) => updateFormData({ roadName: e.target.value })}
              placeholder="उदा: National Highway 24, Main Market Road"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Pro tip card */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-bold text-blue-950 mb-1">Google Maps Ranking Secret (Road Pinpoint):</p>
          जब आप Google Business Profile बनाते हैं, तो अगर आपकी दुकान किसी गली के अंदर है, तो Google Map पिन को मुख्य सड़क (Road Entrance) के बिल्कुल सामने रखने से ग्राहकों को नेविगेशन में "You have arrived" सही जगह पर सुनाई देता है।
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          type="button"
          className="px-6 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors text-sm"
        >
          ← वापस जाएं (Business Info)
        </button>
        <button
          onClick={onNext}
          type="button"
          className="px-6 py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 transition-colors text-sm shadow-md flex items-center gap-2"
        >
          अगला कदम: रोड व स्टोरफ़्रंट फ़ोटो जोड़ें →
        </button>
      </div>
    </div>
  );
}
