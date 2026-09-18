// TEMPBOX Admin Portal Frontend Application Logic

let activeTab = 'overview';
let telemetryChartInstance = null;
let selectedCompartment = null;

// Tab Switcher
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));

  const activeBtn = document.getElementById(`tab-btn-${tab}`);
  if (activeBtn) activeBtn.classList.add('active-tab');

  const targetView = document.getElementById(`view-${tab}`);
  if (targetView) targetView.classList.remove('hidden');

  const titles = {
    overview: 'Ringkasan Operasional & KPI',
    lockers: 'Manajemen Loker & Kompartemen Pintar',
    telemetry: 'Monitoring IoT Telemetri Suhu Realtime',
    rentals: 'Daftar Transaksi & Riwayat Sewa',
    members: 'Database Member & Loyalitas Pengguna'
  };
  document.getElementById('page-title').innerText = titles[tab] || 'Admin Portal';

  if (tab === 'telemetry') {
    initOrUpdateChart();
  }
}

// Clock
function updateClock() {
  const now = new Date();
  document.getElementById('live-clock').innerText = now.toLocaleTimeString('id-ID') + ' WIB';
}
setInterval(updateClock, 1000);
updateClock();

// Toast helper
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastContent = document.getElementById('toast-content');
  const toastIcon = document.getElementById('toast-icon');
  const toastMsg = document.getElementById('toast-message');

  toastMsg.innerText = message;
  if (type === 'success') {
    toastContent.className = 'px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 bg-slate-900 text-white border-l-4 border-emerald-500';
    toastIcon.className = 'fa-solid fa-check text-emerald-400';
  } else if (type === 'warning') {
    toastContent.className = 'px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 bg-slate-900 text-white border-l-4 border-amber-500';
    toastIcon.className = 'fa-solid fa-triangle-exclamation text-amber-400';
  } else {
    toastContent.className = 'px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 bg-slate-900 text-white border-l-4 border-red-500';
    toastIcon.className = 'fa-solid fa-circle-xmark text-red-400';
  }

  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3500);
}

// API Call: Fetch Overview Stats
async function fetchOverview() {
  try {
    const res = await fetch('/api/overview');
    const data = await res.json();

    document.getElementById('kpi-total-units').innerText = `${data.totalCompartments} Kompartemen`;
    document.getElementById('kpi-occupancy').innerText = data.occupancyRate;
    document.getElementById('kpi-occupied-desc').innerText = `${data.occupiedCount} Loker Terisi (${data.availableCount} Kosong)`;
    document.getElementById('kpi-temp-compliance').innerText = data.tempCompliance;
    document.getElementById('kpi-today-revenue').innerText = `Rp ${data.todayRevenue.toLocaleString('id-ID')}`;

    // Locations summary table
    const locRes = await fetch('/api/lockers');
    const locData = await locRes.json();
    const tbody = document.getElementById('overview-locations-tbody');
    tbody.innerHTML = '';

    locData.locations.forEach(loc => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/80 transition';
      tr.innerHTML = `
        <td class="py-2.5 font-bold text-slate-800">${loc.name}</td>
        <td class="py-2.5 text-slate-500">${loc.city}</td>
        <td class="py-2.5 text-center font-semibold">${loc.totalUnits} Box</td>
        <td class="py-2.5 text-center font-bold text-cyan-600">${loc.currentCold}°C</td>
        <td class="py-2.5 text-center font-bold text-orange-600">${loc.currentHot}°C</td>
        <td class="py-2.5 text-right">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ${loc.status}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Logs
    const telemRes = await fetch('/api/telemetry');
    const telemData = await telemRes.json();
    const logsContainer = document.getElementById('overview-logs-container');
    logsContainer.innerHTML = '';
    telemData.recentLogs.slice(0, 6).forEach(log => {
      const div = document.createElement('div');
      div.className = 'p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2';
      const icon = log.type === 'warning' ? 'fa-triangle-exclamation text-amber-500' : (log.type === 'success' ? 'fa-check text-emerald-500' : 'fa-info-circle text-blue-500');
      div.innerHTML = `
        <i class="fa-solid ${icon} mt-0.5"></i>
        <div class="flex-1">
          <p class="text-slate-700 font-medium leading-tight">${log.message}</p>
          <span class="text-[10px] text-slate-400">${log.time}</span>
        </div>
      `;
      logsContainer.appendChild(div);
    });
  } catch (err) {
    console.error('Failed to fetch overview:', err);
  }
}

// API Call: Fetch Lockers Fleet
async function fetchLockers() {
  try {
    const loc = document.getElementById('locker-location-filter').value;
    const res = await fetch(`/api/lockers?location=${loc}`);
    const data = await res.json();

    const container = document.getElementById('lockers-grid-container');
    container.innerHTML = '';

    data.compartments.forEach(c => {
      const isCold = c.type === 'Cold';
      const tempColor = isCold ? 'text-cyan-600' : 'text-orange-600';
      const tempBg = isCold ? 'bg-cyan-50' : 'bg-orange-50';
      const isOccupied = c.status === 'occupied';

      let statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Tersedia</span>';
      if (isOccupied) {
        statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">Terisi</span>';
      } else if (c.status === 'maintenance') {
        statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Maintenance</span>';
      }

      const card = document.createElement('div');
      card.className = 'bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-black text-base text-slate-800">${c.id}</span>
            ${statusBadge}
          </div>
          <p class="text-[11px] text-slate-500 font-medium truncate mb-2">${c.locationName}</p>

          <div class="flex items-center justify-between text-xs p-2 rounded-xl ${tempBg} mb-3">
            <span class="font-semibold text-slate-600">${c.type} (${c.size})</span>
            <span class="font-black ${tempColor}">${c.currentTemp}°C</span>
          </div>

          ${isOccupied ? `
            <div class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl mb-3 space-y-0.5">
              <div><span class="text-slate-400">Penyewa:</span> <span class="font-bold text-slate-800">${c.tenant}</span></div>
              <div><span class="text-slate-400">ID Sewa:</span> <span class="font-mono text-cyan-600">${c.rentalId}</span></div>
            </div>
          ` : `
            <div class="text-[11px] text-slate-400 italic mb-3">Siap disewa pengguna</div>
          `}
        </div>

        <button onclick="openUnlockModal('${c.id}', '${c.locationName}')" class="w-full py-1.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-lock-open text-[11px]"></i>
          Buka Darurat (Unlock)
        </button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to fetch lockers:', err);
  }
}

// Emergency Unlock Modal
function openUnlockModal(compId, locName) {
  selectedCompartment = compId;
  document.getElementById('modal-comp-id').innerText = compId;
  document.getElementById('modal-location-name').innerText = locName;
  document.getElementById('unlock-modal').classList.remove('hidden');
}

function closeUnlockModal() {
  document.getElementById('unlock-modal').classList.add('hidden');
  selectedCompartment = null;
}

async function executeUnlock() {
  if (!selectedCompartment) return;
  const reason = document.getElementById('modal-unlock-reason').value;
  const btn = document.getElementById('btn-confirm-unlock');
  btn.disabled = true;
  btn.innerText = 'Memproses...';

  try {
    const res = await fetch('/api/lockers/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compartmentId: selectedCompartment, reason: reason })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Pintu ${selectedCompartment} berhasil dibuka secara darurat!`, 'warning');
      closeUnlockModal();
      fetchLockers();
      fetchOverview();
    } else {
      showToast(data.error || 'Gagal membuka pintu', 'error');
    }
  } catch (err) {
    showToast('Koneksi server gagal', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Konfirmasi Buka Pintu';
  }
}

// API Call: Fetch Telemetry & Chart
async function fetchTelemetry() {
  try {
    const res = await fetch('/api/telemetry');
    const data = await res.json();

    document.getElementById('diag-peltier').innerText = data.systemPeltier;
    document.getElementById('diag-heater').innerText = data.systemHeater;

    if (telemetryChartInstance) {
      telemetryChartInstance.data.labels = data.labels;
      telemetryChartInstance.data.datasets[0].data = data.coldSeries;
      telemetryChartInstance.data.datasets[1].data = data.hotSeries;
      telemetryChartInstance.update();
    }
  } catch (err) {
    console.error('Failed to fetch telemetry:', err);
  }
}

function initOrUpdateChart() {
  const ctx = document.getElementById('telemetryChart');
  if (!ctx) return;

  if (telemetryChartInstance) {
    fetchTelemetry();
    return;
  }

  fetch('/api/telemetry').then(r => r.json()).then(data => {
    telemetryChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Cold Box Temp (°C)',
            data: data.coldSeries,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2
          },
          {
            label: 'Hot Box Temp (°C)',
            data: data.hotSeries,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  });
}

// API Call: Fetch Rentals Table
let allRentals = [];
async function fetchRentals() {
  try {
    const res = await fetch('/api/rentals');
    const data = await res.json();
    allRentals = data.rentals;
    renderRentalsTable(allRentals);
  } catch (err) {
    console.error('Failed to fetch rentals:', err);
  }
}

function renderRentalsTable(list) {
  const tbody = document.getElementById('rentals-tbody');
  tbody.innerHTML = '';

  list.forEach(r => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition';
    const statusBadge = r.status === 'active'
      ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">Aktif</span>'
      : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Selesai</span>';

    tr.innerHTML = `
      <td class="py-3 px-2 font-mono font-bold text-cyan-600">${r.id}</td>
      <td class="py-3 px-2">
        <p class="font-bold text-slate-800">${r.tenantName}</p>
        <p class="text-[10px] text-slate-400">${r.tenantPhone}</p>
      </td>
      <td class="py-3 px-2">
        <p class="font-semibold text-slate-800">${r.locationName}</p>
        <p class="text-[10px] text-slate-400">Box: ${r.compartmentId}</p>
      </td>
      <td class="py-3 px-2 font-semibold ${r.type.includes('Cold') ? 'text-cyan-600' : 'text-orange-600'}">${r.type}</td>
      <td class="py-3 px-2">
        <p class="text-slate-700">${r.startTime}</p>
        <p class="text-[10px] text-slate-400">s/d ${r.endTime}</p>
      </td>
      <td class="py-3 px-2 text-center font-bold text-slate-800">
        ${r.totalHours} Jam
        ${r.extendedHours > 0 ? `<span class="block text-[10px] text-emerald-600 font-semibold">(+${r.extendedHours} Jam)</span>` : ''}
      </td>
      <td class="py-3 px-2 text-right font-black text-slate-800">Rp ${r.amount.toLocaleString('id-ID')}</td>
      <td class="py-3 px-2 font-medium text-slate-600">${r.paymentMethod}</td>
      <td class="py-3 px-2 text-center">${statusBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterRentalsTable() {
  const query = document.getElementById('rental-search-input').value.toLowerCase();
  const filtered = allRentals.filter(r =>
    r.tenantName.toLowerCase().includes(query) ||
    r.id.toLowerCase().includes(query) ||
    r.compartmentId.toLowerCase().includes(query) ||
    r.locationName.toLowerCase().includes(query)
  );
  renderRentalsTable(filtered);
}

// API Call: Fetch Members CRM
let allMembers = [];
async function fetchMembers() {
  try {
    const res = await fetch('/api/members');
    const data = await res.json();
    allMembers = data.members;
    renderMembersTable(allMembers);
  } catch (err) {
    console.error('Failed to fetch members:', err);
  }
}

function renderMembersTable(list) {
  const tbody = document.getElementById('members-tbody');
  tbody.innerHTML = '';

  list.forEach(m => {
    let tierColor = 'bg-slate-100 text-slate-700 border-slate-200';
    if (m.tier.includes('Platinum')) tierColor = 'bg-purple-100 text-purple-800 border-purple-200';
    else if (m.tier.includes('Diamond')) tierColor = 'bg-blue-100 text-blue-800 border-blue-200';
    else if (m.tier.includes('Gold')) tierColor = 'bg-amber-100 text-amber-800 border-amber-200';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition';
    tr.innerHTML = `
      <td class="py-3 px-2 font-bold text-slate-800">${m.name}</td>
      <td class="py-3 px-2">
        <p class="font-medium text-slate-700">${m.phone}</p>
        <p class="text-[10px] text-slate-400">${m.email}</p>
      </td>
      <td class="py-3 px-2 text-center">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tierColor}">
          ${m.tier}
        </span>
      </td>
      <td class="py-3 px-2 text-center font-black text-amber-600">${m.loyaltyPoints.toLocaleString('id-ID')} Pts</td>
      <td class="py-3 px-2 text-right font-black text-slate-800">Rp ${m.totalSpending.toLocaleString('id-ID')}</td>
      <td class="py-3 px-2 text-center font-mono font-bold text-cyan-600 tracking-wider">${m.referralCode}</td>
      <td class="py-3 px-2 text-right text-slate-400">${m.joinDate}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterMembersTable() {
  const query = document.getElementById('member-search-input').value.toLowerCase();
  const filtered = allMembers.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.phone.toLowerCase().includes(query) ||
    m.referralCode.toLowerCase().includes(query)
  );
  renderMembersTable(filtered);
}

// Initial Data Load
window.addEventListener('DOMContentLoaded', () => {
  fetchOverview();
  fetchLockers();
  fetchRentals();
  fetchMembers();

  // Poll overview & telemetry every 8 seconds
  setInterval(() => {
    fetchOverview();
    if (activeTab === 'telemetry') fetchTelemetry();
  }, 8000);
});
