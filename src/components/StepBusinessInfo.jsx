import React, { useState } from 'react';
import { Building2, Phone, Mail, Globe, Clock, MapPin, Plus, X, AlertCircle } from 'lucide-react';
import { GBP_CATEGORIES } from '../data/categories';

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StepBusinessInfo({ formData, updateFormData, onNext }) {
  const [newService, setNewService] = useState('');

  const handleDayToggle = (day) => {
    const currentDays = formData.openDays || [];
    if (currentDays.includes(day)) {
      updateFormData({ openDays: currentDays.filter(d => d !== day) });
    } else {
      updateFormData({ openDays: [...currentDays, day] });
    }
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newService.trim()) return;
    const currentServices = formData.services || [];
    if (!currentServices.includes(newService.trim())) {
      updateFormData({ services: [...currentServices, newService.trim()] });
    }
    setNewService('');
  };

  const handleRemoveService = (serviceToRemove) => {
    updateFormData({
      services: (formData.services || []).filter(s => s !== serviceToRemove)
    });
  };

  return (
    <div className="space-y-6">
      {/* Business Identity */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Building2 className="text-blue-600 w-5 h-5" />
          1. बिज़नेस की पहचान (Business Identity)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              बिज़नेस / दुकान का आधिकारिक नाम <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => updateFormData({ businessName: e.target.value })}
              placeholder="उदा: Chandra Auto Spares & Garage"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 inline" />
              ध्यान रखें: वही नाम लिखें जो आपकी दुकान के साइनबोर्ड/बोर्ड पर लिखा है।
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              प्राइमरी कैटेगरी (Primary Category) <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.primaryCategory}
              onChange={(e) => updateFormData({ primaryCategory: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {GBP_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              सेकेंडरी कैटेगरी (Secondary Category - Optional)
            </label>
            <input
              type="text"
              value={formData.secondaryCategory}
              onChange={(e) => updateFormData({ secondaryCategory: e.target.value })}
              placeholder="उदा: Used Car Dealer, Oil Change Service"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Contact & Address */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <MapPin className="text-emerald-600 w-5 h-5" />
          2. संपर्क और दुकान का पता (Address & Contact)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              फोन नंबर (Phone Number) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => updateFormData({ contactNumber: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ईमेल (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="contact@business.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              वेबसाइट या सोशल मीडिया लिंक (Website/URL)
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                placeholder="https://mybusiness.com (अगर नहीं है तो खाली छोड़ें)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              दुकान/मकान नंबर व सड़क का नाम (Street Address) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => updateFormData({ addressLine1: e.target.value })}
              placeholder="Shop No. 12, Ground Floor, Near Main Chowk"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              शहर (City) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="उदा: New Delhi, Jaipur, Mumbai"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              पिनकोड (Pincode) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => updateFormData({ pincode: e.target.value })}
              placeholder="उदा: 110001"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Timings & Services */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="text-purple-600 w-5 h-5" />
          3. खुलने का समय और सेवाएँ (Timings & Services)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              दुकान किन दिनों खुली रहती है? (Open Days)
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => {
                const isOpen = (formData.openDays || []).includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isOpen
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">खुलने का समय (Opening Time)</label>
              <input
                type="time"
                value={formData.openingTime}
                onChange={(e) => updateFormData({ openingTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">बंद होने का समय (Closing Time)</label>
              <input
                type="time"
                value={formData.closingTime}
                onChange={(e) => updateFormData({ closingTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              मुख्य सेवाएं / प्रोडक्ट्स (Services Offered)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.services || []).map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full border border-slate-200"
                >
                  {srv}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(srv)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddService} className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="नयी सेवा लिखें (उदा: Home Delivery, AC Repair)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 border border-purple-200 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> जोड़ें
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          type="button"
          className="px-8 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 transition-colors shadow-md text-sm flex items-center gap-2"
        >
          अगला कदम: मैप व सड़क (Road) लोकेशन सेट करें →
        </button>
      </div>
    </div>
  );
}
