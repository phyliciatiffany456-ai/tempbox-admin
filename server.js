// TEMPBOX Admin Portal - Standalone Backend Server
// Built with pure Node.js (zero external dependencies required)

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// In-Memory Database (Synced with TEMPBOX Mobile Ecosystem)
const database = {
  locations: [
    {
      id: 'loc_gi',
      name: 'Grand Indonesia Mall',
      city: 'Jakarta Pusat',
      address: 'East Mall Lantai LG (Dekat Ranch Market)',
      totalUnits: 6,
      targetCold: 4.0,
      targetHot: 60.0,
      currentCold: 3.8,
      currentHot: 60.4,
      status: 'Optimal'
    },
    {
      id: 'loc_sc',
      name: 'Senayan City',
      city: 'Jakarta Selatan',
      address: 'Lantai B1 Area Parkir Valet',
      totalUnits: 6,
      targetCold: 4.0,
      targetHot: 60.0,
      currentCold: 4.1,
      currentHot: 59.8,
      status: 'Optimal'
    },
    {
      id: 'loc_kintamani',
      name: 'Kintamani Glamping Resort',
      city: 'Bali',
      address: 'Jl. Raya Penelokan No. 88, Batur',
      totalUnits: 4,
      targetCold: 4.0,
      targetHot: 60.0,
      currentCold: 3.9,
      currentHot: 60.2,
      status: 'Optimal'
    },
    {
      id: 'loc_lembang',
      name: 'Lembang Ecotourism Hub',
      city: 'Bandung Barat',
      address: 'Jl. Maribaya No. 105, Lembang',
      totalUnits: 4,
      targetCold: 4.0,
      targetHot: 60.0,
      currentCold: 4.2,
      currentHot: 59.9,
      status: 'Optimal'
    },
    {
      id: 'loc_siloam',
      name: 'Siloam Medical Hub',
      city: 'Jakarta Barat',
      address: 'Lobby Farmasi & Spesialis Lt. 1',
      totalUnits: 4,
      targetCold: 4.0,
      targetHot: 60.0,
      currentCold: 3.7,
      currentHot: 60.1,
      status: 'Optimal'
    }
  ],

  compartments: [
    { id: 'C-GI-A1', locationId: 'loc_gi', locationName: 'Grand Indonesia Mall', size: 'Medium', type: 'Cold', targetTemp: 4.0, currentTemp: 3.8, status: 'occupied', tenant: 'Tiffany Phylicia', rentalId: 'TBX-RENT-8491', pin: '8491', doorOpen: false },
    { id: 'C-GI-A2', locationId: 'loc_gi', locationName: 'Grand Indonesia Mall', size: 'Large', type: 'Hot', targetTemp: 60.0, currentTemp: 60.5, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-GI-B1', locationId: 'loc_gi', locationName: 'Grand Indonesia Mall', size: 'Small', type: 'Cold', targetTemp: 4.0, currentTemp: 4.0, status: 'occupied', tenant: 'Budi Santoso', rentalId: 'TBX-RENT-7712', pin: '5512', doorOpen: false },
    { id: 'C-GI-B2', locationId: 'loc_gi', locationName: 'Grand Indonesia Mall', size: 'Medium', type: 'Cold', targetTemp: 4.0, currentTemp: 3.9, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-GI-C1', locationId: 'loc_gi', locationName: 'Grand Indonesia Mall', size: 'Large', type: 'Cold', targetTemp: 4.0, currentTemp: 4.1, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-GI-C2', locationId: 'loc_gi', locationName: 'Grand Indonesia Mall', size: 'Small', type: 'Hot', targetTemp: 60.0, currentTemp: 60.2, status: 'maintenance', tenant: null, rentalId: null, pin: null, doorOpen: false },

    { id: 'C-SC-A1', locationId: 'loc_sc', locationName: 'Senayan City', size: 'Large', type: 'Cold', targetTemp: 4.0, currentTemp: 3.9, status: 'occupied', tenant: 'Jessica Wijaya', rentalId: 'TBX-RENT-6531', pin: '9921', doorOpen: false },
    { id: 'C-SC-A2', locationId: 'loc_sc', locationName: 'Senayan City', size: 'Medium', type: 'Hot', targetTemp: 60.0, currentTemp: 59.8, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-SC-B1', locationId: 'loc_sc', locationName: 'Senayan City', size: 'Small', type: 'Cold', targetTemp: 4.0, currentTemp: 4.1, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-SC-B2', locationId: 'loc_sc', locationName: 'Senayan City', size: 'Medium', type: 'Cold', targetTemp: 4.0, currentTemp: 4.0, status: 'occupied', tenant: 'Ahmad Fauzi', rentalId: 'TBX-RENT-5520', pin: '4102', doorOpen: false },

    { id: 'C-KM-A1', locationId: 'loc_kintamani', locationName: 'Kintamani Glamping Resort', size: 'Large', type: 'Cold', targetTemp: 4.0, currentTemp: 3.9, status: 'occupied', tenant: 'Michael Brown', rentalId: 'TBX-RENT-4409', pin: '1982', doorOpen: false },
    { id: 'C-KM-A2', locationId: 'loc_kintamani', locationName: 'Kintamani Glamping Resort', size: 'Medium', type: 'Hot', targetTemp: 60.0, currentTemp: 60.2, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-KM-B1', locationId: 'loc_kintamani', locationName: 'Kintamani Glamping Resort', size: 'Medium', type: 'Cold', targetTemp: 4.0, currentTemp: 3.7, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-KM-B2', locationId: 'loc_kintamani', locationName: 'Kintamani Glamping Resort', size: 'Small', type: 'Hot', targetTemp: 60.0, currentTemp: 60.4, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },

    { id: 'C-LB-A1', locationId: 'loc_lembang', locationName: 'Lembang Ecotourism Hub', size: 'Medium', type: 'Cold', targetTemp: 4.0, currentTemp: 4.2, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-LB-A2', locationId: 'loc_lembang', locationName: 'Lembang Ecotourism Hub', size: 'Large', type: 'Hot', targetTemp: 60.0, currentTemp: 59.9, status: 'occupied', tenant: 'Rina Kusuma', rentalId: 'TBX-RENT-3190', pin: '7721', doorOpen: false },
    { id: 'C-LB-B1', locationId: 'loc_lembang', locationName: 'Lembang Ecotourism Hub', size: 'Small', type: 'Cold', targetTemp: 4.0, currentTemp: 4.0, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-LB-B2', locationId: 'loc_lembang', locationName: 'Lembang Ecotourism Hub', size: 'Medium', type: 'Cold', targetTemp: 4.0, currentTemp: 4.1, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },

    { id: 'C-SL-A1', locationId: 'loc_siloam', locationName: 'Siloam Medical Hub', size: 'Small', type: 'Cold', targetTemp: 4.0, currentTemp: 3.7, status: 'occupied', tenant: 'dr. Hendra Sp.A', rentalId: 'TBX-RENT-2201', pin: '3391', doorOpen: false },
    { id: 'C-SL-A2', locationId: 'loc_siloam', locationName: 'Siloam Medical Hub', size: 'Medium', type: 'Cold', targetTemp: 4.0, currentTemp: 3.8, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-SL-B1', locationId: 'loc_siloam', locationName: 'Siloam Medical Hub', size: 'Large', type: 'Cold', targetTemp: 4.0, currentTemp: 3.9, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false },
    { id: 'C-SL-B2', locationId: 'loc_siloam', locationName: 'Siloam Medical Hub', size: 'Small', type: 'Hot', targetTemp: 60.0, currentTemp: 60.1, status: 'available', tenant: null, rentalId: null, pin: null, doorOpen: false }
  ],

  rentals: [
    {
      id: 'TBX-RENT-8491',
      tenantName: 'Tiffany Phylicia',
      tenantPhone: '081258294859',
      locationName: 'Grand Indonesia Mall',
      compartmentId: 'C-GI-A1',
      type: 'Cold (4°C)',
      size: 'Medium',
      startTime: '2026-09-18 16:30',
      endTime: '2026-09-18 20:30',
      initialHours: 3,
      extendedHours: 1,
      totalHours: 4,
      amount: 45000,
      paymentMethod: 'QRIS Gopay',
      status: 'active',
      pin: '8491'
    },
    {
      id: 'TBX-RENT-7712',
      tenantName: 'Budi Santoso',
      tenantPhone: '081398765432',
      locationName: 'Grand Indonesia Mall',
      compartmentId: 'C-GI-B1',
      type: 'Cold (4°C)',
      size: 'Small',
      startTime: '2026-09-18 17:00',
      endTime: '2026-09-18 19:00',
      initialHours: 2,
      extendedHours: 0,
      totalHours: 2,
      amount: 20000,
      paymentMethod: 'BCA Virtual Account',
      status: 'active',
      pin: '5512'
    },
    {
      id: 'TBX-RENT-6531',
      tenantName: 'Jessica Wijaya',
      tenantPhone: '081711223344',
      locationName: 'Senayan City',
      compartmentId: 'C-SC-A1',
      type: 'Cold (4°C)',
      size: 'Large',
      startTime: '2026-09-18 15:00',
      endTime: '2026-09-18 21:00',
      initialHours: 6,
      extendedHours: 0,
      totalHours: 6,
      amount: 75000,
      paymentMethod: 'ShopeePay',
      status: 'active',
      pin: '9921'
    },
    {
      id: 'TBX-RENT-5520',
      tenantName: 'Ahmad Fauzi',
      tenantPhone: '085699887766',
      locationName: 'Senayan City',
      compartmentId: 'C-SC-B2',
      type: 'Cold (4°C)',
      size: 'Medium',
      startTime: '2026-09-18 14:00',
      endTime: '2026-09-18 18:00',
      initialHours: 4,
      extendedHours: 0,
      totalHours: 4,
      amount: 40000,
      paymentMethod: 'QRIS Mandiri',
      status: 'completed',
      pin: '4102'
    },
    {
      id: 'TBX-RENT-4409',
      tenantName: 'Michael Brown',
      tenantPhone: '081900112233',
      locationName: 'Kintamani Glamping Resort',
      compartmentId: 'C-KM-A1',
      type: 'Cold (4°C)',
      size: 'Large',
      startTime: '2026-09-18 13:00',
      endTime: '2026-09-18 22:00',
      initialHours: 9,
      extendedHours: 0,
      totalHours: 9,
      amount: 120000,
      paymentMethod: 'Credit Card',
      status: 'active',
      pin: '1982'
    },
    {
      id: 'TBX-RENT-3190',
      tenantName: 'Rina Kusuma',
      tenantPhone: '081233445566',
      locationName: 'Lembang Ecotourism Hub',
      compartmentId: 'C-LB-A2',
      type: 'Hot (60°C)',
      size: 'Large',
      startTime: '2026-09-18 12:00',
      endTime: '2026-09-18 18:00',
      initialHours: 6,
      extendedHours: 0,
      totalHours: 6,
      amount: 80000,
      paymentMethod: 'QRIS Dana',
      status: 'active',
      pin: '7721'
    },
    {
      id: 'TBX-RENT-2201',
      tenantName: 'dr. Hendra Sp.A',
      tenantPhone: '081122334455',
      locationName: 'Siloam Medical Hub',
      compartmentId: 'C-SL-A1',
      type: 'Cold (4°C)',
      size: 'Small',
      startTime: '2026-09-18 09:00',
      endTime: '2026-09-18 18:00',
      initialHours: 9,
      extendedHours: 0,
      totalHours: 9,
      amount: 90000,
      paymentMethod: 'BCA Virtual Account',
      status: 'active',
      pin: '3391'
    }
  ],

  members: [
    { id: 'usr_001', name: 'Tiffany Phylicia', phone: '081258294859', email: 'phyliciatiffany456@gmail.com', tier: 'Silver Member', loyaltyPoints: 250, totalSpending: 0, referralCode: 'TBX4859', joinDate: '2026-09-15' },
    { id: 'usr_002', name: 'Budi Santoso', phone: '081398765432', email: 'budi.santoso@gmail.com', tier: 'Gold Member', loyaltyPoints: 1250, totalSpending: 1850000, referralCode: 'TBX5432', joinDate: '2026-08-10' },
    { id: 'usr_003', name: 'Jessica Wijaya', phone: '081711223344', email: 'jessica.w@gmail.com', tier: 'Diamond Member', loyaltyPoints: 4800, totalSpending: 6200000, referralCode: 'TBX3344', joinDate: '2026-06-22' },
    { id: 'usr_004', name: 'Michael Brown', phone: '081900112233', email: 'mbrown@bali.com', tier: 'Platinum Member', loyaltyPoints: 9500, totalSpending: 12400000, referralCode: 'TBX2233', joinDate: '2026-04-18' },
    { id: 'usr_005', name: 'Rina Kusuma', phone: '081233445566', email: 'rina.k@bandung.co.id', tier: 'Silver Member', loyaltyPoints: 420, totalSpending: 450000, referralCode: 'TBX5566', joinDate: '2026-09-02' },
    { id: 'usr_006', name: 'dr. Hendra Sp.A', phone: '081122334455', email: 'hendra.siloam@medical.id', tier: 'Gold Member', loyaltyPoints: 2100, totalSpending: 2800000, referralCode: 'TBX4455', joinDate: '2026-07-05' }
  ],

  logs: [
    { time: '18:25:10', type: 'info', message: 'Sistem sinkronisasi IoT berjalan normal di 5 titik lokasi.' },
    { time: '18:20:45', type: 'success', message: 'Perpanjangan sewa kompartemen C-GI-A1 (+1 Jam) berhasil dibukukan.' },
    { time: '18:15:30', type: 'info', message: 'DS18B20 Sensor Cold Box C-GI-A1 suhu stabil 3.8°C.' },
    { time: '18:02:11', type: 'info', message: 'Pintu kompartemen C-SC-B2 ditutup rapat oleh pengguna Ahmad Fauzi.' }
  ]
};

// Request Parser Helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// REST API Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTES ---
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // 1. Overview Dashboard Stats
    if (pathname === '/api/overview' && method === 'GET') {
      const totalComp = database.compartments.length;
      const occupiedComp = database.compartments.filter(c => c.status === 'occupied').length;
      const occupancyRate = ((occupiedComp / totalComp) * 100).toFixed(1) + '%';
      const todayRevenue = database.rentals.reduce((sum, r) => sum + r.amount, 0);

      const overview = {
        totalLocations: database.locations.length,
        totalCompartments: totalComp,
        occupiedCount: occupiedComp,
        availableCount: database.compartments.filter(c => c.status === 'available').length,
        maintenanceCount: database.compartments.filter(c => c.status === 'maintenance').length,
        occupancyRate: occupancyRate,
        tempCompliance: '99.8%',
        todayRevenue: todayRevenue,
        activeMembers: database.members.length,
        activeRentals: occupiedComp,
        coldAvg: '3.9°C',
        hotAvg: '60.1°C',
        systemStatus: 'ONLINE_SECURE',
        lastUpdated: new Date().toLocaleTimeString('id-ID')
      };
      res.writeHead(200);
      res.end(JSON.stringify(overview));
      return;
    }

    // 2. Lockers & Compartments Fleet
    if (pathname === '/api/lockers' && method === 'GET') {
      const locFilter = parsedUrl.query.location;
      let results = database.compartments;
      if (locFilter && locFilter !== 'all') {
        results = results.filter(c => c.locationId === locFilter);
      }
      res.writeHead(200);
      res.end(JSON.stringify({
        locations: database.locations,
        compartments: results
      }));
      return;
    }

    // 3. Emergency Remote Unlock API
    if (pathname === '/api/lockers/unlock' && method === 'POST') {
      const body = await parseBody(req);
      const { compartmentId, reason } = body;
      const comp = database.compartments.find(c => c.id === compartmentId);

      if (!comp) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Kompartemen tidak ditemukan' }));
        return;
      }

      // Simulate solenoid trigger
      comp.status = 'available';
      comp.doorOpen = true;
      const logEntry = {
        time: new Date().toLocaleTimeString('id-ID'),
        type: 'warning',
        message: `EMERGENCY UNLOCK: Kompartemen ${comp.id} di ${comp.locationName} dibuka jarak jauh oleh Admin. Alasan: ${reason || 'Permintaan Bantuan Teknis'}`
      };
      database.logs.unshift(logEntry);

      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: `Solenoid relay kompartemen ${comp.id} berhasil di-trigger. Pintu sekarang TERBUKA.`,
        compartment: comp,
        log: logEntry
      }));
      return;
    }

    // 4. Rentals & Transactions
    if (pathname === '/api/rentals' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        rentals: database.rentals,
        total: database.rentals.length
      }));
      return;
    }

    // 5. Members & Loyalty CRM
    if (pathname === '/api/members' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        members: database.members,
        total: database.members.length
      }));
      return;
    }

    // 6. Live IoT Telemetry & Sensor Logs
    if (pathname === '/api/telemetry' && method === 'GET') {
      // Generate slight natural thermal fluctuations for live chart
      const now = new Date();
      const timeLabels = [];
      const coldData = [];
      const hotData = [];

      for (let i = 10; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 30000);
        timeLabels.push(d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        coldData.push((3.8 + (Math.sin(i * 0.8) * 0.25)).toFixed(1));
        hotData.push((60.1 + (Math.cos(i * 0.8) * 0.35)).toFixed(1));
      }

      res.writeHead(200);
      res.end(JSON.stringify({
        labels: timeLabels,
        coldSeries: coldData,
        hotSeries: hotData,
        currentCold: coldData[coldData.length - 1],
        currentHot: hotData[hotData.length - 1],
        systemPeltier: 'Active (PWM 68%)',
        systemHeater: 'Active (PID 45%)',
        sensorHealth: 'Optimal (DS18B20 Verified)',
        recentLogs: database.logs
      }));
      return;
    }

    // 404 for unknown API
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'API Endpoint Not Found' }));
    return;
  }

  // --- STATIC FILES (Frontend SPA) ---
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, reqPath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // SPA Fallback to index.html
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (fallbackErr, fallbackContent) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallbackContent);
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  TEMPBOX BACKEND ADMIN PORTAL IS RUNNING!`);
  console.log(`  Local Access URL:   http://localhost:${PORT}`);
  console.log(`  Directory:          ${__dirname}`);
  console.log(`=======================================================`);
});
