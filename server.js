// TEMPBOX Admin Portal - Full CRUD Backend Server
// Pure Node.js with File-Based JSON Persistence

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Default Seed Data
const defaultData = {
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
    { time: '18:40:10', type: 'info', message: 'Sistem sinkronisasi IoT berjalan normal di 5 titik lokasi.' },
    { time: '18:20:45', type: 'success', message: 'Perpanjangan sewa kompartemen C-GI-A1 (+1 Jam) berhasil dibukukan.' },
    { time: '18:15:30', type: 'info', message: 'DS18B20 Sensor Cold Box C-GI-A1 suhu stabil 3.8°C.' },
    { time: '18:02:11', type: 'info', message: 'Pintu kompartemen C-SC-B2 ditutup rapat oleh pengguna Ahmad Fauzi.' }
  ]
};

// Database Loader & Persister
let db = defaultData;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
      console.log('Database loaded from persistent file:', DB_FILE);
    } else {
      saveDatabase();
      console.log('Initialized database with default seed data.');
    }
  } catch (err) {
    console.error('Error loading database file, using fallback in-memory:', err);
    db = defaultData;
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

loadDatabase();

// Body Parser
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { resolve({}); }
    });
  });
}

// REST API Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

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

    // 1. OVERVIEW
    if (pathname === '/api/overview' && method === 'GET') {
      const totalComp = db.compartments.length;
      const occupiedComp = db.compartments.filter(c => c.status === 'occupied').length;
      const occupancyRate = totalComp ? ((occupiedComp / totalComp) * 100).toFixed(1) + '%' : '0%';
      const todayRevenue = db.rentals.reduce((sum, r) => sum + (r.amount || 0), 0);

      res.writeHead(200);
      res.end(JSON.stringify({
        totalLocations: db.locations.length,
        totalCompartments: totalComp,
        occupiedCount: occupiedComp,
        availableCount: db.compartments.filter(c => c.status === 'available').length,
        maintenanceCount: db.compartments.filter(c => c.status === 'maintenance').length,
        occupancyRate: occupancyRate,
        tempCompliance: '99.8%',
        todayRevenue: todayRevenue,
        activeMembers: db.members.length,
        activeRentals: occupiedComp,
        coldAvg: '3.9°C',
        hotAvg: '60.1°C',
        lastUpdated: new Date().toLocaleTimeString('id-ID')
      }));
      return;
    }

    // 2. LOCATIONS (CRUD)
    if (pathname === '/api/locations') {
      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ locations: db.locations }));
        return;
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const newLoc = {
          id: body.id || 'loc_' + Date.now(),
          name: body.name || 'Lokasi Baru',
          city: body.city || 'Jakarta',
          address: body.address || '-',
          totalUnits: Number(body.totalUnits) || 4,
          targetCold: Number(body.targetCold) || 4.0,
          targetHot: Number(body.targetHot) || 60.0,
          currentCold: 3.9,
          currentHot: 60.1,
          status: 'Optimal'
        };
        db.locations.push(newLoc);
        saveDatabase();
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, location: newLoc }));
        return;
      }
    }

    // 3. COMPARTMENTS (CRUD)
    if (pathname === '/api/lockers' && method === 'GET') {
      const locFilter = parsedUrl.query.location;
      let results = db.compartments;
      if (locFilter && locFilter !== 'all') {
        results = results.filter(c => c.locationId === locFilter);
      }
      res.writeHead(200);
      res.end(JSON.stringify({
        locations: db.locations,
        compartments: results
      }));
      return;
    }

    // CREATE COMPARTMENT
    if (pathname === '/api/lockers' && method === 'POST') {
      const body = await parseBody(req);
      const loc = db.locations.find(l => l.id === body.locationId) || db.locations[0];
      const newComp = {
        id: body.id ? body.id.toUpperCase() : `C-${Date.now().toString().slice(-4)}`,
        locationId: loc.id,
        locationName: loc.name,
        size: body.size || 'Medium',
        type: body.type || 'Cold',
        targetTemp: Number(body.targetTemp) || (body.type === 'Hot' ? 60.0 : 4.0),
        currentTemp: Number(body.currentTemp) || (body.type === 'Hot' ? 60.0 : 4.0),
        status: body.status || 'available',
        tenant: body.tenant || null,
        rentalId: body.rentalId || null,
        pin: body.pin || null,
        doorOpen: false
      };
      db.compartments.push(newComp);
      db.logs.unshift({
        time: new Date().toLocaleTimeString('id-ID'),
        type: 'info',
        message: `Kompartemen baru ${newComp.id} berhasil ditambahkan di ${loc.name}.`
      });
      saveDatabase();
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, compartment: newComp }));
      return;
    }

    // UPDATE COMPARTMENT: /api/lockers/:id
    if (pathname.startsWith('/api/lockers/') && method === 'PUT') {
      const compId = pathname.replace('/api/lockers/', '');
      const body = await parseBody(req);
      const comp = db.compartments.find(c => c.id === compId);
      if (!comp) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Kompartemen tidak ditemukan' }));
        return;
      }
      if (body.size !== undefined) comp.size = body.size;
      if (body.type !== undefined) comp.type = body.type;
      if (body.targetTemp !== undefined) comp.targetTemp = Number(body.targetTemp);
      if (body.currentTemp !== undefined) comp.currentTemp = Number(body.currentTemp);
      if (body.status !== undefined) comp.status = body.status;
      if (body.tenant !== undefined) comp.tenant = body.tenant;
      if (body.rentalId !== undefined) comp.rentalId = body.rentalId;
      if (body.doorOpen !== undefined) comp.doorOpen = body.doorOpen;

      saveDatabase();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, compartment: comp }));
      return;
    }

    // DELETE COMPARTMENT: /api/lockers/:id
    if (pathname.startsWith('/api/lockers/') && method === 'DELETE') {
      const compId = pathname.replace('/api/lockers/', '');
      const idx = db.compartments.findIndex(c => c.id === compId);
      if (idx === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Kompartemen tidak ditemukan' }));
        return;
      }
      const deleted = db.compartments.splice(idx, 1)[0];
      db.logs.unshift({
        time: new Date().toLocaleTimeString('id-ID'),
        type: 'warning',
        message: `Kompartemen ${compId} telah dihapus dari sistem.`
      });
      saveDatabase();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: `Kompartemen ${compId} berhasil dihapus.`, deleted }));
      return;
    }

    // EMERGENCY UNLOCK
    if (pathname === '/api/lockers/unlock' && method === 'POST') {
      const body = await parseBody(req);
      const { compartmentId, reason } = body;
      const comp = db.compartments.find(c => c.id === compartmentId);

      if (!comp) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Kompartemen tidak ditemukan' }));
        return;
      }

      comp.status = 'available';
      comp.doorOpen = true;
      const logEntry = {
        time: new Date().toLocaleTimeString('id-ID'),
        type: 'warning',
        message: `EMERGENCY UNLOCK: Kompartemen ${comp.id} di ${comp.locationName} dibuka jarak jauh oleh Admin. Alasan: ${reason || 'Bantuan Teknis'}`
      };
      db.logs.unshift(logEntry);
      saveDatabase();

      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: `Relay solenoid ${comp.id} dibuka. Pintu sekarang TERBUKA.`,
        compartment: comp,
        log: logEntry
      }));
      return;
    }

    // 4. MEMBERS CRM (CRUD)
    if (pathname === '/api/members') {
      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ members: db.members, total: db.members.length }));
        return;
      }
      // CREATE MEMBER
      if (method === 'POST') {
        const body = await parseBody(req);
        const newMember = {
          id: 'usr_' + Date.now(),
          name: body.name || 'Member Baru',
          phone: body.phone || '-',
          email: body.email || '-',
          tier: body.tier || 'Silver Member',
          loyaltyPoints: Number(body.loyaltyPoints) || 100,
          totalSpending: Number(body.totalSpending) || 0,
          referralCode: body.referralCode || ('TBX' + (body.phone ? body.phone.slice(-4) : '2026')),
          joinDate: new Date().toISOString().split('T')[0]
        };
        db.members.unshift(newMember);
        db.logs.unshift({
          time: new Date().toLocaleTimeString('id-ID'),
          type: 'success',
          message: `Member baru terdaftar: ${newMember.name} (${newMember.tier}).`
        });
        saveDatabase();
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, member: newMember }));
        return;
      }
    }

    // UPDATE MEMBER: /api/members/:id
    if (pathname.startsWith('/api/members/') && method === 'PUT') {
      const memberId = pathname.replace('/api/members/', '');
      const body = await parseBody(req);
      const member = db.members.find(m => m.id === memberId);
      if (!member) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Member tidak ditemukan' }));
        return;
      }
      if (body.name !== undefined) member.name = body.name;
      if (body.phone !== undefined) member.phone = body.phone;
      if (body.email !== undefined) member.email = body.email;
      if (body.tier !== undefined) member.tier = body.tier;
      if (body.loyaltyPoints !== undefined) member.loyaltyPoints = Number(body.loyaltyPoints);
      if (body.totalSpending !== undefined) member.totalSpending = Number(body.totalSpending);
      if (body.referralCode !== undefined) member.referralCode = body.referralCode;

      saveDatabase();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, member }));
      return;
    }

    // DELETE MEMBER: /api/members/:id
    if (pathname.startsWith('/api/members/') && method === 'DELETE') {
      const memberId = pathname.replace('/api/members/', '');
      const idx = db.members.findIndex(m => m.id === memberId);
      if (idx === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Member tidak ditemukan' }));
        return;
      }
      const deleted = db.members.splice(idx, 1)[0];
      saveDatabase();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: `Member ${deleted.name} dihapus.`, deleted }));
      return;
    }

    // 5. RENTALS (CRUD)
    if (pathname === '/api/rentals') {
      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ rentals: db.rentals, total: db.rentals.length }));
        return;
      }
      // CREATE RENTAL
      if (method === 'POST') {
        const body = await parseBody(req);
        const newRental = {
          id: 'TBX-RENT-' + Math.floor(1000 + Math.random() * 9000),
          tenantName: body.tenantName || 'Pelanggan',
          tenantPhone: body.tenantPhone || '-',
          locationName: body.locationName || 'Grand Indonesia Mall',
          compartmentId: body.compartmentId || 'C-GI-A1',
          type: body.type || 'Cold (4°C)',
          size: body.size || 'Medium',
          startTime: body.startTime || new Date().toLocaleString('id-ID'),
          endTime: body.endTime || '-',
          initialHours: Number(body.initialHours) || 2,
          extendedHours: 0,
          totalHours: Number(body.initialHours) || 2,
          amount: Number(body.amount) || 25000,
          paymentMethod: body.paymentMethod || 'QRIS',
          status: 'active',
          pin: String(Math.floor(1000 + Math.random() * 9000))
        };
        db.rentals.unshift(newRental);

        // Update corresponding compartment status to occupied
        const targetComp = db.compartments.find(c => c.id === newRental.compartmentId);
        if (targetComp) {
          targetComp.status = 'occupied';
          targetComp.tenant = newRental.tenantName;
          targetComp.rentalId = newRental.id;
          targetComp.pin = newRental.pin;
        }

        db.logs.unshift({
          time: new Date().toLocaleTimeString('id-ID'),
          type: 'success',
          message: `Sewa baru ${newRental.id} dibuat untuk ${newRental.tenantName} di ${newRental.compartmentId}.`
        });
        saveDatabase();
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, rental: newRental }));
        return;
      }
    }

    // UPDATE RENTAL: /api/rentals/:id
    if (pathname.startsWith('/api/rentals/') && method === 'PUT') {
      const rentId = pathname.replace('/api/rentals/', '');
      const body = await parseBody(req);
      const rental = db.rentals.find(r => r.id === rentId);
      if (!rental) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Transaksi tidak ditemukan' }));
        return;
      }
      if (body.status !== undefined) {
        rental.status = body.status;
        if (body.status === 'completed') {
          const comp = db.compartments.find(c => c.id === rental.compartmentId);
          if (comp) {
            comp.status = 'available';
            comp.tenant = null;
            comp.rentalId = null;
          }
        }
      }
      if (body.extendedHours !== undefined) {
        rental.extendedHours = Number(body.extendedHours);
        rental.totalHours = rental.initialHours + rental.extendedHours;
      }
      if (body.amount !== undefined) rental.amount = Number(body.amount);

      saveDatabase();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, rental }));
      return;
    }

    // DELETE RENTAL: /api/rentals/:id
    if (pathname.startsWith('/api/rentals/') && method === 'DELETE') {
      const rentId = pathname.replace('/api/rentals/', '');
      const idx = db.rentals.findIndex(r => r.id === rentId);
      if (idx === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Transaksi tidak ditemukan' }));
        return;
      }
      const deleted = db.rentals.splice(idx, 1)[0];
      saveDatabase();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, message: `Transaksi ${rentId} berhasil dihapus.`, deleted }));
      return;
    }

    // 6. TELEMETRY
    if (pathname === '/api/telemetry' && method === 'GET') {
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
        recentLogs: db.logs
      }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
    return;
  }

  // --- STATIC FILES ---
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, reqPath);

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
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (fErr, fContent) => {
          if (fErr) { res.writeHead(404); res.end('404'); }
          else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(fContent); }
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
  console.log(`  TEMPBOX FULL-CRUD ADMIN PORTAL IS RUNNING!`);
  console.log(`  URL:         http://localhost:${PORT}`);
  console.log(`  Data Store:  ${DB_FILE}`);
  console.log(`=======================================================`);
});
