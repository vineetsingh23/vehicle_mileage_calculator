import { useState, useEffect } from 'react';

function App() {
  const [insuranceLimit, setInsuranceLimit] = useState('5000');
  const [startOdometer, setStartOdometer] = useState('18246');
  const [currentOdometer, setCurrentOdometer] = useState(() => {
    if (typeof window === 'undefined') return '19988';
    return window.localStorage.getItem('currentOdometer') || '19988';
  });
  const [startDateStr, setStartDateStr] = useState('2026-03-15');

  const [daysDriven, setDaysDriven] = useState(1);
  const [totalDriven, setTotalDriven] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);
  const [remainingKm, setRemainingKm] = useState(0);

  const [refuelDate, setRefuelDate] = useState(() => {
    if (typeof window === 'undefined') return '2026-06-01';
    return window.localStorage.getItem('refuelDate') || '2026-06-01';
  });
  const [refuelOdometer, setRefuelOdometer] = useState(() => {
    if (typeof window === 'undefined') return '19900';
    return window.localStorage.getItem('refuelOdometer') || '19900';
  });
  const [fuelPrice, setFuelPrice] = useState(() => {
    if (typeof window === 'undefined') return '1.45';
    return window.localStorage.getItem('fuelPrice') || '1.45';
  });
  const [fuelQuantity, setFuelQuantity] = useState(() => {
    if (typeof window === 'undefined') return '40';
    return window.localStorage.getItem('fuelQuantity') || '40';
  });
  const [savedEntries, setSavedEntries] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = window.localStorage.getItem('savedRefuelEntries');
    return stored ? JSON.parse(stored) : [];
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('savedRefuelEntries', JSON.stringify(savedEntries));
  }, [savedEntries]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('refuelDate', refuelDate);
    window.localStorage.setItem('refuelOdometer', refuelOdometer);
    window.localStorage.setItem('fuelPrice', fuelPrice);
    window.localStorage.setItem('fuelQuantity', fuelQuantity);
  }, [refuelDate, refuelOdometer, fuelPrice, fuelQuantity]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('currentOdometer', currentOdometer);
  }, [currentOdometer]);

  useEffect(() => {
    const start = new Date(startDateStr);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    if (!isFinite(diffDays) || diffDays <= 0) diffDays = 1;

    const startOdo = parseFloat(startOdometer) || 0;
    const currentOdo = parseFloat(currentOdometer) || 0;
    const limit = parseFloat(insuranceLimit) || 0;

    const driven = Math.max(0, currentOdo - startOdo);
    const avg = driven / diffDays;
    const remaining = limit - driven;

    setDaysDriven(diffDays);
    setTotalDriven(driven);
    setAvgPerDay(avg);
    setRemainingKm(remaining);
  }, [insuranceLimit, startOdometer, currentOdometer, startDateStr]);

  const currentOdoValue = parseFloat(currentOdometer) || 0;
  const refuelOdoValue = parseFloat(refuelOdometer) || 0;
  const priceValue = parseFloat(fuelPrice) || 0;
  const quantityValue = parseFloat(fuelQuantity) || 0;
  const insuranceLimitValue = parseFloat(insuranceLimit) || 0;
  const totalPaid = priceValue * quantityValue;
  const distanceSinceRefuel = Math.max(0, currentOdoValue - refuelOdoValue);
  const mileage = quantityValue > 0 ? distanceSinceRefuel / quantityValue : 0;
  const costPerKm = distanceSinceRefuel > 0 ? totalPaid / distanceSinceRefuel : 0;
  const dailyRunningLimit = insuranceLimitValue / 365;
  const totalRunningLimitTillDate = daysDriven * dailyRunningLimit;
  const excessLimit = Math.max(0, totalRunningLimitTillDate - totalDriven);
  const shortOfLimit = Math.max(0, totalDriven - totalRunningLimitTillDate);

  const totalFuelConsumed = savedEntries.reduce((sum, entry) => sum + (parseFloat(entry.fuelQuantity) || 0), 0);
  const totalFuelCost = savedEntries.reduce((sum, entry) => sum + (parseFloat(entry.totalFuelPrice) || 0), 0);
  const firstRefuelOdometer = savedEntries.length > 0 ? parseFloat(savedEntries[0].refuelOdometer) || 0 : 0;
  const overallDistance = firstRefuelOdometer > 0 ? Math.max(0, currentOdoValue - firstRefuelOdometer) : 0;
  const averageMileageTillDate = totalFuelConsumed > 0 ? overallDistance / totalFuelConsumed : 0;
  const costPerKmTillDate = overallDistance > 0 ? totalFuelCost / overallDistance : 0;

  const handleRefuelSubmit = (event) => {
    event.preventDefault();

    const newEntry = {
      refuelDate,
      refuelOdometer,
      fuelPrice,
      fuelQuantity,
      totalFuelPrice: totalPaid.toFixed(2),
      distanceSinceRefuel: distanceSinceRefuel.toFixed(1),
      mileage: mileage.toFixed(2),
      costPerKm: costPerKm.toFixed(2)
    };

    if (editingIndex !== null) {
      setSavedEntries((prevEntries) => {
        const nextEntries = [...prevEntries];
        nextEntries[editingIndex] = newEntry;
        return nextEntries;
      });
      setSubmitMessage('Refuel entry updated successfully.');
      setEditingIndex(null);
    } else {
      setSavedEntries((prevEntries) => [...prevEntries, newEntry]);
      setSubmitMessage('Refuel entry saved successfully.');
    }
  };

  const handleEditEntry = (index) => {
    const entry = savedEntries[index];
    setRefuelDate(entry.refuelDate);
    setRefuelOdometer(entry.refuelOdometer);
    setFuelPrice(entry.fuelPrice);
    setFuelQuantity(entry.fuelQuantity);
    setEditingIndex(index);
    setSubmitMessage('Editing saved refuel entry. Make changes and save.');
  };

  const handleDeleteEntry = (index) => {
    setSavedEntries((prevEntries) => prevEntries.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setSubmitMessage('Edit cancelled because entry was deleted.');
    }
  };

  const handleUpdateWithCurrentOdometer = (index) => {
    setSavedEntries((prevEntries) => {
      return prevEntries.map((entry, idx) => {
        if (idx !== index) return entry;
        const currentOdo = parseFloat(currentOdometer) || 0;
        const refuelOdo = parseFloat(entry.refuelOdometer) || 0;
        const quantity = parseFloat(entry.fuelQuantity) || 0;
        const totalPrice = parseFloat(entry.totalFuelPrice) || 0;
        const newDistance = Math.max(0, currentOdo - refuelOdo);
        const newMileage = quantity > 0 ? newDistance / quantity : 0;
        const newCostPerKm = newDistance > 0 ? totalPrice / newDistance : 0;

        return {
          ...entry,
          distanceSinceRefuel: newDistance.toFixed(1),
          mileage: newMileage.toFixed(2),
          costPerKm: newCostPerKm.toFixed(2)
        };
      });
    });

    setSubmitMessage('Saved entry updated with current odometer reading.');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setSubmitMessage('Edit cancelled.');
  };

  const cards = [
    { label: 'Days Tracked', value: `${daysDriven} days`, variant: 'muted' },
    { label: 'Total Driven', value: `${totalDriven.toFixed(1)} km`, variant: 'muted' },
    { label: 'Average / Day', value: `${avgPerDay.toFixed(2)} km`, variant: 'muted' },
    { label: 'Daily Running Limit', value: `${dailyRunningLimit.toFixed(2)} km`, variant: 'muted' },
    { label: 'Total Running Limit Till Date', value: `${totalRunningLimitTillDate.toFixed(2)} km`, variant: 'muted' },
    { label: 'Excess of Limit', value: `${excessLimit.toFixed(1)} km`, variant: excessLimit > 0 ? 'positive' : 'muted' },
    { label: 'Short of Limit', value: `${shortOfLimit.toFixed(1)} km`, variant: shortOfLimit > 0 ? 'negative' : 'muted' },
    { label: 'Avg Mileage to Date', value: savedEntries.length > 0 ? `${averageMileageTillDate.toFixed(2)} km/L` : '—', variant: 'muted' },
    { label: 'Cost per km to Date', value: savedEntries.length > 0 ? `₹${costPerKmTillDate.toFixed(2)}` : '—', variant: 'muted' },
    {
      label: 'Remaining Allowance',
      value: `${remainingKm.toFixed(1)} km`,
      variant: remainingKm < 0 ? 'negative' : 'positive'
    }
  ];

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Mileage Insights</span>
          <h1>Vehicle Mileage Tracker</h1>
          <p>
            Track your odometer readings, compare against insurance limits, and monitor your daily average with an elegant, responsive dashboard.
          </p>
        </div>

        <div className="hero-panel-right">
          <div className="hero-stat">
            <span>Remaining Balance</span>
            <strong className={remainingKm < 0 ? 'stat-negative' : 'stat-positive'}>{remainingKm.toFixed(1)} km</strong>
          </div>
          <div className="hero-badge">Stay under limit</div>
        </div>
      </section>

      <section className="calculator-panel">
        <div className="panel-header">
          <div>
            <p className="section-title">Mileage Calculator</p>
            <p className="section-description">Update the values below to see your current usage and remaining allowance instantly.</p>
          </div>
          <span className="pill">Automatic updates</span>
        </div>

        <div className="form-grid">
          <label className="input-group">
            <span>Insurance Limit</span>
            <input
              type="number"
              min="0"
              step="100"
              value={insuranceLimit}
              onChange={(event) => setInsuranceLimit(event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Starting Odometer</span>
            <input
              type="number"
              min="0"
              value={startOdometer}
              onChange={(event) => setStartOdometer(event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Current Odometer</span>
            <input
              type="number"
              min="0"
              value={currentOdometer}
              onChange={(event) => setCurrentOdometer(event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Start Date</span>
            <input
              type="date"
              value={startDateStr}
              onChange={(event) => setStartDateStr(event.target.value)}
            />
          </label>
        </div>

        <div className="summary-grid">
          {cards.map((card) => (
            <article key={card.label} className={`summary-card ${card.variant}`}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="refuel-panel">
        <div className="panel-header">
          <div>
            <p className="section-title">Refueling Log</p>
            <p className="section-description">Enter your last refueling details to calculate distance, mileage, and cost per kilometer.</p>
          </div>
          <span className="pill">Live calculation</span>
        </div>

        <form className="form-grid" onSubmit={handleRefuelSubmit}>
          <label className="input-group">
            <span>Refuel Date</span>
            <input
              type="date"
              value={refuelDate}
              onChange={(event) => setRefuelDate(event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Odometer at Refuel</span>
            <input
              type="number"
              min="0"
              value={refuelOdometer}
              onChange={(event) => setRefuelOdometer(event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Fuel Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Quantity (liters)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fuelQuantity}
              onChange={(event) => setFuelQuantity(event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>Total Fuel Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalPaid.toFixed(2)}
              readOnly
            />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              {editingIndex !== null ? 'Update Entry' : 'Save Refuel'}
            </button>
            {editingIndex !== null && (
              <button className="secondary-button" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="summary-grid">
          {[
            { label: 'Distance Since Refuel', value: `${distanceSinceRefuel.toFixed(1)} km`, variant: 'muted' },
            { label: 'Mileage per Liter', value: `${mileage.toFixed(2)} km/L`, variant: 'muted' },
            { label: 'Cost per km', value: totalPaid > 0 ? `₹${costPerKm.toFixed(2)}` : '₹0.00', variant: 'positive' }
          ].map((metric) => (
            <article key={metric.label} className={`summary-card ${metric.variant}`}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        {submitMessage && <p className="submit-message">{submitMessage}</p>}

        {savedEntries.length > 0 && (
          <div className="saved-panel">
            <h3>Saved refuel entries</h3>
            <div className="saved-table-wrapper">
              <table className="saved-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Odometer</th>
                    <th>Fuel Price</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Distance</th>
                    <th>Mileage</th>
                    <th>Cost/km</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedEntries.map((entry, index) => (
                    <tr key={`${entry.refuelDate}-${index}`}>
                      <td>{entry.refuelDate}</td>
                      <td>{entry.refuelOdometer} km</td>
                      <td>₹{parseFloat(entry.fuelPrice).toFixed(2)}</td>
                      <td>{parseFloat(entry.fuelQuantity).toFixed(2)} L</td>
                      <td>₹{entry.totalFuelPrice}</td>
                      <td>{entry.distanceSinceRefuel} km</td>
                      <td>{entry.mileage} km/L</td>
                      <td>₹{entry.costPerKm}</td>
                      <td className="action-buttons">
                        {index === savedEntries.length - 1 && (
                          <button type="button" className="table-button update-button" onClick={() => handleUpdateWithCurrentOdometer(index)}>
                            Update
                          </button>
                        )}
                        <button type="button" className="table-button edit-button" onClick={() => handleEditEntry(index)}>
                          Edit
                        </button>
                        <button type="button" className="table-button delete-button" onClick={() => handleDeleteEntry(index)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="tips-panel">
        <div className="tips-card">
          <h2>Usage tips</h2>
          <ul>
            <li>Check your odometer often to keep the tracker accurate.</li>
            <li>Compare your driven kilometers to your insurance limit regularly.</li>
            <li>Use the remaining balance to plan trips and avoid penalty charges.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default App;
