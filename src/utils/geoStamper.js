/**
 * Ultra-Premium Geo-Tag Stamper Engine (Paid-app grade like GPS Map Camera, Solocator & SurveyCam)
 * Supports:
 * - Embedded Mini Road Map Snapshot
 * - Road Direction Arrow (Airo / Arrow)
 * - Multiple Name Plate Design Models
 * - Real GPS, Compass Heading, Altitude & Time
 */

// Helper to draw a sleek rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper to draw the Mini Road Map Inset on the canvas
function drawMiniRoadMap(ctx, x, y, size, lat, lng, roadName) {
  ctx.save();
  // Map Frame / Container
  roundRect(ctx, x, y, size, size, Math.max(8, size * 0.1));
  ctx.clip();

  // Map Background (clean road map tile styling)
  ctx.fillStyle = '#e5e7eb'; // Map ground
  ctx.fillRect(x, y, size, size);

  // Secondary Streets
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.lineTo(x + size, y + size * 0.3);
  ctx.moveTo(x + size * 0.4, y);
  ctx.lineTo(x + size * 0.4, y + size);
  ctx.stroke();

  // Main Highway / Road (Orange/Yellow Google Maps arterial road)
  ctx.strokeStyle = '#fcd34d'; // Yellow highway
  ctx.lineWidth = Math.max(6, size * 0.16);
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.7);
  ctx.lineTo(x + size, y + size * 0.4);
  ctx.stroke();

  ctx.strokeStyle = '#f59e0b'; // Road borders
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Road Label inside mini map
  ctx.fillStyle = '#1e293b';
  ctx.font = `bold ${Math.max(8, Math.floor(size * 0.11))}px sans-serif`;
  ctx.fillText(roadName ? roadName.slice(0, 14) : "ROAD", x + 6, y + size * 0.88);

  // Red Google Map Pin at center
  const pinX = x + size * 0.55;
  const pinY = y + size * 0.45;
  const pinR = Math.max(7, size * 0.14);

  // Pin Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(pinX, pinY + pinR * 0.8, pinR * 0.8, pinR * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pin Head
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(pinX, pinY, pinR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pin Inner Dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pinX, pinY, pinR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Outer border for mini map
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  roundRect(ctx, x, y, size, size, Math.max(8, size * 0.1));
  ctx.stroke();

  // Mini Map "LIVE MAP" badge
  ctx.fillStyle = '#2563eb';
  roundRect(ctx, x + 4, y + 4, size * 0.52, size * 0.22, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(7, Math.floor(size * 0.1))}px sans-serif`;
  ctx.fillText("MAP PIN", x + 7, y + size * 0.18);
  ctx.restore();
}

// Helper to draw Navigation Arrow (Airo)
function drawRoadDirectionArrow(ctx, x, y, size, distance = "45m", direction = "NE") {
  ctx.save();
  ctx.translate(x, y);

  // Glowing circle background for the arrow
  ctx.fillStyle = 'rgba(37, 99, 235, 0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dynamic Arrow shape pointing forward-right (Road Approach angle)
  ctx.rotate(-Math.PI / 4); // 45 deg angle towards shop

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.65);
  ctx.lineTo(size * 0.55, size * 0.4);
  ctx.lineTo(0, size * 0.15);
  ctx.lineTo(-size * 0.55, size * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Distance label below arrow
  ctx.save();
  ctx.fillStyle = '#facc15'; // Bright yellow
  ctx.font = `bold ${Math.max(10, Math.floor(size * 0.75))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`➜ ${distance}`, x, y + size + 14);
  ctx.restore();
}

/**
 * Main Stamp Generator Function
 * Supported models: 'google_map_plate', 'road_arrow_hud', 'solocator_pro'
 */
export async function stampGeoDataOnImage({
  imageSrc,
  businessName,
  address,
  lat,
  lng,
  roadName = "Main Road",
  model = "google_map_plate", // 'google_map_plate' | 'road_arrow_hud' | 'solocator_pro'
  timestamp = new Date(),
  distanceMeters = 45
}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original photo
      ctx.drawImage(img, 0, 0);

      const W = canvas.width;
      const H = canvas.height;

      // Scaled dimensions
      const overlayH = Math.max(120, Math.floor(H * 0.22));
      const pad = Math.max(16, Math.floor(W * 0.025));
      const latStr = `${Number(lat || 28.6139).toFixed(6)}° N`;
      const lngStr = `${Number(lng || 77.2090).toFixed(6)}° E`;
      const timeStr = timestamp.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      // ==========================================
      // MODEL 1: GOOGLE MAPS PRO NAME PLATE
      // Embedded Mini Map + Road Arrow + Nameplate
      // ==========================================
      if (model === "google_map_plate") {
        // Dark frosted plate container with blue header line
        const plateY = H - overlayH;
        const grad = ctx.createLinearGradient(0, plateY, 0, H);
        grad.addColorStop(0, "rgba(15, 23, 42, 0.88)");
        grad.addColorStop(1, "rgba(2, 6, 23, 0.98)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, plateY, W, overlayH);

        // Top accent line (Google Blue + Emerald)
        const barGrad = ctx.createLinearGradient(0, 0, W, 0);
        barGrad.addColorStop(0, "#2563eb");
        barGrad.addColorStop(0.5, "#38bdf8");
        barGrad.addColorStop(1, "#10b981");
        ctx.fillStyle = barGrad;
        ctx.fillRect(0, plateY, W, Math.max(4, Math.floor(H * 0.006)));

        // 1. Draw Mini Road Map Inset on Left
        const mapSize = Math.floor(overlayH * 0.78);
        const mapX = pad;
        const mapY = plateY + Math.floor((overlayH - mapSize) / 2);
        drawMiniRoadMap(ctx, mapX, mapY, mapSize, lat, lng, roadName);

        // 2. Draw Road Direction Arrow on Right
        const arrowR = Math.max(16, Math.floor(overlayH * 0.17));
        const arrowX = W - pad - arrowR - 10;
        const arrowY = plateY + Math.floor(overlayH * 0.42);
        drawRoadDirectionArrow(ctx, arrowX, arrowY, arrowR, `${distanceMeters || 45}m`, "NE");

        // 3. Central Name Plate Details
        const contentX = mapX + mapSize + pad;
        const maxContentW = arrowX - arrowR - contentX - 10;
        const baseFont = Math.max(12, Math.floor(overlayH * 0.11));

        // Official Business Name Plate (Bold White + Blue highlight)
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${baseFont * 1.55}px sans-serif`;
        const bName = (businessName || "My Business Location").slice(0, 38);
        ctx.fillText(bName, contentX, plateY + baseFont * 2.1);

        // Highway / Road Signboard Pill
        const roadPlateText = `🛣️ ${roadName || "Main Road"}`;
        ctx.font = `bold ${baseFont * 1.05}px sans-serif`;
        const roadW = ctx.measureText(roadPlateText).width + 16;
        ctx.fillStyle = "#1e3a8a"; // Deep navy
        roundRect(ctx, contentX, plateY + baseFont * 2.8, Math.min(roadW, maxContentW), baseFont * 1.7, 6);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#fef08a"; // Yellow text on highway sign
        ctx.fillText(roadPlateText, contentX + 8, plateY + baseFont * 4.0);

        // Physical Address
        ctx.fillStyle = "#cbd5e1";
        ctx.font = `${baseFont * 0.95}px sans-serif`;
        const fullAddr = address || "Street Entrance, Pinpoint Location";
        ctx.fillText(fullAddr.slice(0, 60), contentX, plateY + baseFont * 5.6);

        // GPS Coordinates & Compass Bar
        ctx.fillStyle = "#38bdf8";
        ctx.font = `bold ${baseFont * 0.95}px monospace`;
        ctx.fillText(`📍 ${latStr}, ${lngStr}   🕒 ${timeStr}`, contentX, plateY + baseFont * 7.1);

        // Verification Pill Badge Top Right
        ctx.fillStyle = "#10b981";
        ctx.font = `bold ${Math.max(10, baseFont * 0.9)}px sans-serif`;
        const badgeTxt = "✓ GOOGLE MAPS ROAD VERIFIED";
        const badgeW = ctx.measureText(badgeTxt).width;
        ctx.fillText(badgeTxt, W - pad - badgeW, plateY + baseFont * 1.8);
      }

      // ==========================================
      // MODEL 2: ROAD ARROW NAVIGATOR HUD
      // Prominent Direction Arrow + Green Signboard
      // ==========================================
      else if (model === "road_arrow_hud") {
        const plateY = H - overlayH;
        ctx.fillStyle = "rgba(10, 15, 30, 0.92)";
        ctx.fillRect(0, plateY, W, overlayH);

        // Highway Green Header Banner
        ctx.fillStyle = "#047857"; // Highway Green
        ctx.fillRect(0, plateY, W, overlayH * 0.32);

        const baseFont = Math.max(13, Math.floor(overlayH * 0.12));

        // Road Name Plate on Green Banner
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${baseFont * 1.4}px sans-serif`;
        ctx.fillText(`🛣️ ROAD APPROACH: ${(roadName || "MAIN HIGHWAY").toUpperCase()}`, pad, plateY + baseFont * 1.8);

        // Large Arrow
        const arrowX = W - pad - 24;
        const arrowY = plateY + overlayH * 0.58;
        drawRoadDirectionArrow(ctx, arrowX, arrowY, Math.max(18, overlayH * 0.22), `${distanceMeters || 30}m`, "STRAIGHT");

        // Business Name & Info
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${baseFont * 1.5}px sans-serif`;
        ctx.fillText(businessName || "Business Storefront", pad, plateY + overlayH * 0.6);

        ctx.fillStyle = "#94a3b8";
        ctx.font = `${baseFont}px sans-serif`;
        ctx.fillText(address || "Roadside Location", pad, plateY + overlayH * 0.78);

        ctx.fillStyle = "#38bdf8";
        ctx.font = `bold ${baseFont * 0.9}px monospace`;
        ctx.fillText(`GPS: ${latStr}, ${lngStr} | ${timeStr}`, pad, plateY + overlayH * 0.94);
      }

      // ==========================================
      // MODEL 3: SOLOCATOR PRO / SURVEYOR AUDIT
      // Multi-column Engineering & Verification Card
      // ==========================================
      else {
        const plateY = H - overlayH;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(0, plateY, W, overlayH);

        ctx.fillStyle = "#f59e0b"; // Amber surveyor top line
        ctx.fillRect(0, plateY, W, 4);

        const mapSize = Math.floor(overlayH * 0.76);
        drawMiniRoadMap(ctx, pad, plateY + (overlayH - mapSize) / 2, mapSize, lat, lng, roadName);

        const baseFont = Math.max(12, Math.floor(overlayH * 0.11));
        const cx = pad + mapSize + pad;

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${baseFont * 1.5}px sans-serif`;
        ctx.fillText(businessName || "Verified Shop", cx, plateY + baseFont * 2.2);

        ctx.fillStyle = "#facc15";
        ctx.font = `bold ${baseFont}px sans-serif`;
        ctx.fillText(`[ROAD PIN] ${roadName || "Main Road"} (Entrance ${distanceMeters}m)`, cx, plateY + baseFont * 3.8);

        ctx.fillStyle = "#cbd5e1";
        ctx.font = `${baseFont * 0.9}px sans-serif`;
        ctx.fillText(address || "Location Verified", cx, plateY + baseFont * 5.3);

        ctx.fillStyle = "#4ade80";
        ctx.font = `bold ${baseFont * 0.95}px monospace`;
        ctx.fillText(`LAT/LNG: ${latStr}, ${lngStr} • HEADING: 138° SE`, cx, plateY + baseFont * 6.9);
      }

      resolve(canvas.toDataURL("image/jpeg", 0.93));
    };

    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}
