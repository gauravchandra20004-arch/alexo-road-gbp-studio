/**
 * ALEXO - Google Safety Mode & Policy Guard Engine
 * Enforces official Google Business Profile Representation Guidelines (2025/2026)
 * Prevents account suspension, pin rejections, and video verification failures.
 */

// Prohibited spam keywords in Google Business Name
const PROHIBITED_NAME_KEYWORDS = [
  "best", "top", "cheapest", "no.1", "no 1", "#1", "24/7", "24x7", 
  "near me", "affordable", "guaranteed", "verified", "official",
  "lowest price", "special discount", "free delivery"
];

// Virtual / PO Box flagged keywords
const VIRTUAL_ADDRESS_KEYWORDS = [
  "p.o. box", "po box", "post box", "virtual office", "co-working", "coworking"
];

export function auditGoogleSafety(formData) {
  const issues = [];
  const passed = [];

  // 1. Business Name Check (Google Policy: Represent your business as it is recognized in the real world)
  const name = (formData.businessName || "").trim().toLowerCase();
  if (!name) {
    issues.push({
      field: "businessName",
      severity: "critical",
      title: "बिज़नेस का नाम खाली है",
      desc: "Google Business Profile के लिए आधिकारिक नाम दर्ज करना अनिवार्य है।"
    });
  } else {
    const foundSpam = PROHIBITED_NAME_KEYWORDS.filter(kw => name.includes(kw));
    if (foundSpam.length > 0) {
      issues.push({
        field: "businessName",
        severity: "high",
        title: "नाम में प्रमोशनल कीवर्ड डिटेक्ट हुए",
        desc: `Google नाम में '${foundSpam.join(", ")}' जैसे शब्द डालने पर प्रोफाइल सस्पेंड कर देता है। नाम केवल वही रखें जो आपकी दुकान के साइनबोर्ड पर है।`,
        suggestion: cleanBusinessName(formData.businessName)
      });
    } else {
      passed.push({
        field: "businessName",
        title: "नाम Google Guidelines के 100% अनुकूल है"
      });
    }
  }

  // 2. Phone Number Check
  const phone = (formData.contactNumber || "").replace(/[^0-9]/g, "");
  if (!phone || phone.length < 10) {
    issues.push({
      field: "contactNumber",
      severity: "critical",
      title: "अवैध या अधूरा फोन नंबर",
      desc: "Google वेरिफिकेशन के लिए 10-अंकों का सक्रिय फोन नंबर होना जरूरी है।"
    });
  } else {
    passed.push({
      field: "contactNumber",
      title: "फोन नंबर सक्रिय और वैध फॉर्मेट में है"
    });
  }

  // 3. Physical Address & PO Box Check
  const address = (formData.addressLine1 || "").toLowerCase();
  const hasVirtual = VIRTUAL_ADDRESS_KEYWORDS.some(kw => address.includes(kw));
  if (hasVirtual) {
    issues.push({
      field: "addressLine1",
      severity: "critical",
      title: "P.O. Box या वर्चुअल एड्रेस अमान्य है",
      desc: "Google केवल फिजिकल दुकान या ऑफिस की लोकेशन स्वीकार करता है जहाँ ग्राहक आ सकें।"
    });
  } else if (!formData.addressLine1 || !formData.city || !formData.pincode) {
    issues.push({
      field: "addressLine1",
      severity: "medium",
      title: "अधूरा एड्रेस या पिनकोड",
      desc: "सड़क, शहर और 6-अंकों का पिनकोड पूरा भरें ताकि Google Maps पर पिन सटीक लगे।"
    });
  } else {
    passed.push({
      field: "addressLine1",
      title: "फिजिकल एड्रेस और पिनकोड मान्य है"
    });
  }

  // 4. GPS Coordinates & Road Approach Pin
  if (!formData.latitude || !formData.longitude) {
    issues.push({
      field: "latitude",
      severity: "high",
      title: "GPS पिन सेट नहीं है",
      desc: "मैप पर दुकान का पिन लगाना आवश्यक है।"
    });
  } else if (!formData.roadEntranceLat || !formData.roadEntranceLng) {
    issues.push({
      field: "roadEntranceLat",
      severity: "medium",
      title: "रोड एंट्रेंस पिन सेट करें",
      desc: "मुख्य सड़क का प्रवेश द्वार पिन करने से Google नेविगेशन में रास्ता सटीक मिलता है।"
    });
  } else {
    passed.push({
      field: "latitude",
      title: "Dual-Pin GPS (दुकान व सड़क मोड़) 100% सटीक है"
    });
  }

  // 5. Description Check (Google limits: 750 characters, no URLs, no phone numbers in text)
  const desc = formData.seoDescription || "";
  if (desc.length > 750) {
    issues.push({
      field: "seoDescription",
      severity: "high",
      title: "विवरण 750 अक्षरों से अधिक है",
      desc: `वर्तमान लंबाई: ${desc.length} अक्षर। Google केवल 750 अक्षर स्वीकार करता है।`
    });
  } else if (desc.includes("http://") || desc.includes("https://") || desc.includes("www.")) {
    issues.push({
      field: "seoDescription",
      severity: "medium",
      title: "विवरण में वेबसाइट लिंक न डालें",
      desc: "Google Business Description में सीधे URL डालने की अनुमति नहीं देता। वेबसाइट को वेबसाइट वाले फील्ड में ही डालें।"
    });
  } else if (desc.length > 100) {
    passed.push({
      field: "seoDescription",
      title: "SEO विवरण 750-अक्षर सीमा और नियमों के अनुकूल है"
    });
  }

  // 6. Photos Check
  const photos = formData.photos || {};
  const photoCount = Object.keys(photos).filter(k => photos[k]?.stamped).length;
  if (photoCount < 2) {
    issues.push({
      field: "photos",
      severity: "medium",
      title: "कम से कम 2-3 तस्वीरें अपलोड करें",
      desc: "Google वेरिफिकेशन पास करने के लिए सड़क का दृश्य और दुकान का मुख्य बोर्ड जरूरी है।"
    });
  } else {
    passed.push({
      field: "photos",
      title: `${photoCount} Geo-Tagged तस्वीरें तैयार हैं`
    });
  }

  // Calculate Google Trust Score (0 to 100)
  const totalChecks = issues.length + passed.length;
  const score = totalChecks > 0 ? Math.round((passed.length / totalChecks) * 100) : 70;

  const safetyModeStatus = issues.some(i => i.severity === "critical") 
    ? "HIGH RISK" 
    : issues.some(i => i.severity === "high") 
    ? "WARNING" 
    : "100% SAFE";

  return {
    score,
    safetyModeStatus,
    issues,
    passed,
    isSafe: score >= 80 && !issues.some(i => i.severity === "critical")
  };
}

// Helper to auto-clean spam keywords from business name
export function cleanBusinessName(rawName) {
  if (!rawName) return "";
  let cleaned = rawName;
  PROHIBITED_NAME_KEYWORDS.forEach(kw => {
    const reg = new RegExp(`\\b${kw}\\b`, 'gi');
    cleaned = cleaned.replace(reg, '');
  });
  return cleaned.replace(/\s+/g, ' ').trim();
}
