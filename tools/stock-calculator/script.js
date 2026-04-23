let chart = null;

const $ = id => document.getElementById(id);

const fmtWon = n => Math.round(n).toLocaleString('ko-KR') + '원';
const fmtPct = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

$('taxType').addEventListener('change', function () {
  $('customTaxGroup').style.display = this.value === 'custom' ? 'flex' : 'none';
});

$('calcBtn').addEventListener('click', calculate);

document.querySelectorAll('input').forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
});

function getTaxRate() {
  const sel = $('taxType');
  if (sel.value === 'custom') {
    return parseFloat($('customTax').value || 0) / 100;
  }
  return parseFloat(sel.value) / 100;
}

function calculate() {
  const buyPrice   = parseFloat($('buyPrice').value);
  const qty        = parseFloat($('buyQty').value);
  const sellPrice  = parseFloat($('sellPrice').value);
  const buyFeeRate = parseFloat($('buyFee').value) / 100;
  const sellFeeRate= parseFloat($('sellFee').value) / 100;
  const taxRate    = getTaxRate();

  if (!buyPrice || !qty || !sellPrice) {
    alert('매수가, 수량, 매도가를 모두 입력해주세요.');
    return;
  }

  // 매수
  const totalBuy  = buyPrice * qty;
  const buyFeeAmt = totalBuy * buyFeeRate;
  const totalCost = totalBuy + buyFeeAmt;

  // 매도
  const totalSell     = sellPrice * qty;
  const sellFeeAmt    = totalSell * sellFeeRate;
  const taxAmt        = totalSell * taxRate;
  const sellDeductions= sellFeeAmt + taxAmt;
  const netSell       = totalSell - sellDeductions;

  // 손익
  const profit = netSell - totalCost;
  const rate   = (profit / totalCost) * 100;

  // 손익분기가: netSell = totalCost
  // bep * qty * (1 - sellFeeRate - taxRate) = totalCost
  const bep = totalCost / (qty * (1 - sellFeeRate - taxRate));

  // 결과 표시
  $('totalBuy').textContent     = fmtWon(totalBuy);
  $('buyFeeAmt').textContent    = fmtWon(buyFeeAmt);
  $('totalCost').textContent    = fmtWon(totalCost);
  $('totalSell').textContent    = fmtWon(totalSell);
  $('sellDeductions').textContent = fmtWon(sellDeductions);
  $('netSell').textContent      = fmtWon(netSell);
  $('bep').textContent          = Math.round(bep).toLocaleString('ko-KR') + '원';

  const profitEl = $('profit');
  const rateEl   = $('rate');
  profitEl.textContent = fmtWon(profit);
  rateEl.textContent   = fmtPct(rate);

  const cls = profit > 0 ? 'profit' : profit < 0 ? 'loss' : 'neutral';
  profitEl.className = 'value big ' + cls;
  rateEl.className   = 'value big ' + cls;

  $('results').style.display     = 'block';
  $('chartSection').style.display = 'block';

  drawChart(buyPrice, qty, totalCost, sellFeeRate, taxRate);
}

function drawChart(buyPrice, qty, totalCost, sellFeeRate, taxRate) {
  const labels = [];
  const rates  = [];

  for (let pct = -40; pct <= 80; pct += 5) {
    const sp = buyPrice * (1 + pct / 100);
    const ns = sp * qty * (1 - sellFeeRate - taxRate);
    const r  = ((ns - totalCost) / totalCost) * 100;
    labels.push((pct >= 0 ? '+' : '') + pct + '%');
    rates.push(parseFloat(r.toFixed(2)));
  }

  const ctx = $('profitChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '수익률',
        data: rates,
        backgroundColor: rates.map(r => r >= 0 ? 'rgba(248,113,113,0.65)' : 'rgba(96,165,250,0.65)'),
        borderColor:     rates.map(r => r >= 0 ? '#f87171' : '#60a5fa'),
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `수익률: ${ctx.raw >= 0 ? '+' : ''}${ctx.raw}%`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', font: { size: 11 } },
          grid:  { color: '#1a2d42' }
        },
        y: {
          ticks: {
            color: '#64748b',
            callback: v => v + '%'
          },
          grid: { color: '#1a2d42' }
        }
      }
    }
  });
}
