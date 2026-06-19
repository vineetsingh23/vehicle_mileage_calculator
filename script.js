document.addEventListener('DOMContentLoaded', () => {
  const insuranceEl = document.getElementById('insuranceLimit');
  const startOdoEl = document.getElementById('startOdometer');
  const currentOdoEl = document.getElementById('currentOdometer');
  const startDateEl = document.getElementById('startDate');

  const daysEl = document.getElementById('daysDriven');
  const totalEl = document.getElementById('totalDriven');
  const avgEl = document.getElementById('avgPerDay');
  const remainingEl = document.getElementById('remainingKm');

  function compute() {
    const startDateStr = startDateEl.value;
    const start = new Date(startDateStr);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    if (!isFinite(diffDays) || diffDays <= 0) diffDays = 1;

    const startOdo = parseFloat(startOdoEl.value) || 0;
    const currentOdo = parseFloat(currentOdoEl.value) || 0;
    const limit = parseFloat(insuranceEl.value) || 0;

    const driven = Math.max(0, currentOdo - startOdo);
    const avg = driven / diffDays;
    const remaining = limit - driven;

    daysEl.textContent = `${diffDays} Days`;
    totalEl.textContent = `${driven.toFixed(1)} Km`;
    avgEl.textContent = `${avg.toFixed(2)} Km/Day`;
    remainingEl.textContent = `${remaining.toFixed(1)} Km`;

    remainingEl.classList.remove('negative', 'positive');
    remainingEl.classList.add(remaining < 0 ? 'negative' : 'positive');
  }

  [insuranceEl, startOdoEl, currentOdoEl].forEach(el => el.addEventListener('input', compute));
  startDateEl.addEventListener('change', compute);

  compute();
});
