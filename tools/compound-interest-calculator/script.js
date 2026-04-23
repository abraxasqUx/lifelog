let chart = null;

function fmt(n) {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

function fmtPct(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function calcYear(principal, annualRate, n, monthlyAdd, years) {
  const r = annualRate / 100;
  const rn = r / n;
  const rows = [];

  for (let y = 1; y <= years; y++) {
    const t = y;
    // principal compounded
    let amount = principal * Math.pow(1 + rn, n * t);

    // monthly additional contributions compounded
    if (monthlyAdd > 0) {
      // each monthly payment grows for remaining periods
      // PMT paid at start of each month: FV = PMT * ((1+rm)^months - 1) / rm * (1+rm)
      const rm = r / 12;
      const months = t * 12;
      if (rm === 0) {
        amount += monthlyAdd * months;
      } else {
        amount += monthlyAdd * (Math.pow(1 + rm, months) - 1) / rm * (1 + rm);
      }
    }

    const totalPaid = principal + monthlyAdd * 12 * t;
    const interest = amount - totalPaid;
    const roi = ((amount - totalPaid) / totalPaid) * 100;
    rows.push({ year: y, totalPaid, interest, amount, roi });
  }
  return rows;
}

function render() {
  const principal = parseFloat(document.getElementById('principal').value) || 0;
  const rate = parseFloat(document.getElementById('rate').value) || 0;
  const n = parseInt(document.getElementById('compound').value);
  const years = parseInt(document.getElementById('years').value) || 0;
  const monthly = parseFloat(document.getElementById('monthly').value) || 0;

  if (principal <= 0 || rate <= 0 || years <= 0) {
    alert('원금, 이자율, 투자 기간을 올바르게 입력해주세요.');
    return;
  }

  const rows = calcYear(principal, rate, n, monthly, years);
  const last = rows[rows.length - 1];

  // Summary
  document.getElementById('finalAmount').textContent = fmt(last.amount);
  document.getElementById('totalPrincipal').textContent = fmt(last.totalPaid);
  document.getElementById('totalInterest').textContent = fmt(last.interest);
  document.getElementById('roi').textContent = fmtPct(last.roi);

  // CAGR
  const cagr = (Math.pow(last.amount / principal, 1 / years) - 1) * 100;
  document.getElementById('cagr').textContent = fmtPct(cagr);

  // Double time (Rule of 72 adjusted)
  const doubleYrs = Math.log(2) / Math.log(1 + rate / 100);
  document.getElementById('doubleTime').textContent =
    isFinite(doubleYrs) ? doubleYrs.toFixed(1) + '년' : '-';

  // Interest ratio
  const ratio = (last.interest / last.totalPaid * 100).toFixed(1);
  document.getElementById('interestRatio').textContent = ratio + '%';

  // Show sections
  ['results', 'chartSection', 'tableSection'].forEach(id => {
    document.getElementById(id).style.display = 'block';
  });

  // Table
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.year}년</td>
      <td>${fmt(r.totalPaid)}</td>
      <td>${fmt(r.interest)}</td>
      <td>${fmt(r.amount)}</td>
      <td class="roi-cell">${fmtPct(r.roi)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Chart
  const labels = rows.map(r => r.year + '년');
  const principalData = rows.map(r => Math.round(r.totalPaid));
  const interestData = rows.map(r => Math.round(r.interest));

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('growthChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '납입 원금',
          data: principalData,
          backgroundColor: '#3b82f6',
          borderRadius: 3,
        },
        {
          label: '누적 이자',
          data: interestData,
          backgroundColor: '#4ade80',
          borderRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { size: 12 } },
        },
        tooltip: {
          callbacks: {
            label: ctx =>
              ' ' + ctx.dataset.label + ': ' +
              Math.round(ctx.parsed.y).toLocaleString('ko-KR') + '원',
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#64748b', maxTicksLimit: 12 },
          grid: { color: '#1e3a5f55' },
        },
        y: {
          stacked: true,
          ticks: {
            color: '#64748b',
            callback: v =>
              v >= 1e8
                ? (v / 1e8).toFixed(0) + '억'
                : v >= 1e4
                ? (v / 1e4).toFixed(0) + '만'
                : v,
          },
          grid: { color: '#1e3a5f55' },
        },
      },
    },
  });
}

document.getElementById('calcBtn').addEventListener('click', render);

// Enter key support
document.querySelectorAll('input').forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') render(); });
});
