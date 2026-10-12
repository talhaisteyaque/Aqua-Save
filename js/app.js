/**
 * ==============================================================================
 * AquaSave – Water Conservation Recommendation System
 * Academic Project: CHE110 Environmental Studies CA1
 * Application Controller: js/app.js
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let currentInputs = null;
  let currentResults = null;
  let currentEcoScore = null;
  const STORAGE_KEY = 'aquasave_history_v1';

  // Category Color Scheme for Visual Consistency
  const CATEGORY_COLORS = {
    shower: '#0284c7',   // Ocean Blue
    toilet: '#0ea5e9',   // Sky Blue
    kitchen: '#10b981',  // Emerald Green
    laundry: '#8b5cf6',  // Violet
    garden: '#059669',   // Forest Green
    other: '#f59e0b'     // Amber
  };

  // ============================================================================
  // 1. DOM Elements Reference
  // ============================================================================
  const form = document.getElementById('water-calc-form');
  const formErrorBanner = document.getElementById('form-error-banner');
  const resultsSection = document.getElementById('results');
  const navResultsLink = document.getElementById('nav-results-link');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const toastContainer = document.getElementById('toast-container');

  // Results DOM elements
  const resDailyVal = document.getElementById('res-daily-val');
  const resWeeklyVal = document.getElementById('res-weekly-val');
  const resMonthlyVal = document.getElementById('res-monthly-val');
  const resStatusPill = document.getElementById('res-status-pill');
  const resStatusDot = document.getElementById('res-status-dot');
  const resStatusTitle = document.getElementById('res-status-title');
  const resStatusDesc = document.getElementById('res-status-desc');
  const highestIcon = document.getElementById('highest-icon');
  const highestTitle = document.getElementById('highest-title');
  const highestText = document.getElementById('highest-text');
  const donutSegmentsGroup = document.getElementById('donut-segments-group');
  const donutTotalVal = document.getElementById('donut-total-val');
  const donutLegend = document.getElementById('donut-legend');
  const categoryBarsList = document.getElementById('category-bars-list');

  // Recommendations DOM elements
  const recsGrid = document.getElementById('recs-grid');
  const recsTotalSavedVal = document.getElementById('recs-total-saved-val');
  const recsAnnualStat = document.getElementById('recs-annual-stat');

  // Simulator DOM elements
  const simRangeShower = document.getElementById('sim-range-shower');
  const simValShower = document.getElementById('sim-val-shower');
  const simRangeLaundry = document.getElementById('sim-range-laundry');
  const simValLaundry = document.getElementById('sim-val-laundry');
  const simToggleDish = document.getElementById('sim-toggle-dish');
  const simToggleToilet = document.getElementById('sim-toggle-toilet');
  const simToggleGarden = document.getElementById('sim-toggle-garden');
  const simToggleLeaks = document.getElementById('sim-toggle-leaks');

  const simCurrentVal = document.getElementById('sim-current-val');
  const simPotentialVal = document.getElementById('sim-potential-val');
  const simSavedVal = document.getElementById('sim-saved-val');
  const simSavedPercent = document.getElementById('sim-saved-percent');
  const simEquivBuckets = document.getElementById('sim-equiv-buckets');
  const simEquivBottles = document.getElementById('sim-equiv-bottles');
  const simEquivTrees = document.getElementById('sim-equiv-trees');

  // Eco Score DOM elements
  const gaugeCircle = document.getElementById('gauge-circle');
  const gaugeScoreVal = document.getElementById('gauge-score-val');
  const gaugeGrade = document.getElementById('gauge-grade');
  const gaugeVerdict = document.getElementById('gauge-verdict');
  const subShowerVal = document.getElementById('sub-shower-val');
  const subShowerFill = document.getElementById('sub-shower-fill');
  const subToiletVal = document.getElementById('sub-toilet-val');
  const subToiletFill = document.getElementById('sub-toilet-fill');
  const subKitchenVal = document.getElementById('sub-kitchen-val');
  const subKitchenFill = document.getElementById('sub-kitchen-fill');
  const subLaundryVal = document.getElementById('sub-laundry-val');
  const subLaundryFill = document.getElementById('sub-laundry-fill');
  const subOutdoorVal = document.getElementById('sub-outdoor-val');
  const subOutdoorFill = document.getElementById('sub-outdoor-fill');

  // Tracker DOM elements
  const trackCurrentVal = document.getElementById('track-current-val');
  const trackPrevVal = document.getElementById('track-prev-val');
  const trackSavedVal = document.getElementById('track-saved-val');
  const trackSavedSub = document.getElementById('track-saved-sub');
  const trackCountVal = document.getElementById('track-count-val');
  const trackerTable = document.getElementById('tracker-table');
  const trackerTbody = document.getElementById('tracker-tbody');
  const trackerEmpty = document.getElementById('tracker-empty');
  const motivationalTitle = document.getElementById('motivational-title');
  const motivationalDesc = document.getElementById('motivational-desc');

  // Preset Buttons
  const presetAvgBtn = document.getElementById('preset-avg-btn');
  const presetHighBtn = document.getElementById('preset-high-btn');
  const presetEcoBtn = document.getElementById('preset-eco-btn');
  const heroDemoAvgBtn = document.getElementById('btn-hero-demo-avg');
  const btnResetForm = document.getElementById('btn-reset-form');
  const btnSaveProgress = document.getElementById('btn-save-progress');
  const btnSaveCurrentLog = document.getElementById('btn-save-current-log');
  const btnClearTracker = document.getElementById('btn-clear-tracker');

  // Form Conditional Toggles
  const hasGardenInput = document.getElementById('hasGarden');
  const hasGardenText = document.getElementById('hasGardenText');
  const gardenOptionsGroup = document.getElementById('garden-options-group');
  const hasLeaksInput = document.getElementById('hasLeaks');
  const hasLeaksText = document.getElementById('hasLeaksText');

  // ============================================================================
  // 2. Navigation & UI Interactivity
  // ============================================================================
  // Mobile Nav Toggle
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close mobile nav when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // ScrollSpy Active Nav Link
  const sections = document.querySelectorAll('header[id], section[id]');
  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
      if (targetLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetLink.classList.add('active');
        } else {
          targetLink.classList.remove('active');
        }
      }
    });
  });

  // Toast Notification Function
  function showToast(message, icon = '') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = icon ? `<span>${icon}</span> <span>${message}</span>` : `<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Garden Toggle Handler
  hasGardenInput.addEventListener('change', (e) => {
    if (e.target.checked) {
      gardenOptionsGroup.classList.remove('hidden');
      hasGardenText.textContent = 'Yes, household waters plants';
    } else {
      gardenOptionsGroup.classList.add('hidden');
      hasGardenText.textContent = 'No plants / garden watered';
    }
  });

  // Leaks Toggle Handler
  hasLeaksInput.addEventListener('change', (e) => {
    if (e.target.checked) {
      hasLeaksText.textContent = 'Yes, minor leaks or dripping taps reported';
      hasLeaksText.style.color = '#ef4444';
    } else {
      hasLeaksText.textContent = 'No leaks reported';
      hasLeaksText.style.color = 'inherit';
    }
  });

  // ============================================================================
  // 3. Preset Profiles (Average, High, Eco)
  // ============================================================================
  const PRESETS = {
    average: {
      showersPerDay: 1,
      showerDuration: 8,
      bathroomTapUses: 5,
      toiletFlushes: 5,
      toiletType: 'standard',
      kitchenTapMinutes: 6,
      dishwashingMethod: 'running_tap',
      washingMachineLoadsWeek: 3,
      handwashSessionsWeek: 1,
      hasGarden: true,
      gardenWateringWeek: 4,
      gardenMethod: 'hose',
      carWashesMonth: 2,
      carWashMethod: 'hose',
      hasLeaks: false
    },
    high: {
      showersPerDay: 2,
      showerDuration: 14,
      bathroomTapUses: 8,
      toiletFlushes: 7,
      toiletType: 'standard',
      kitchenTapMinutes: 15,
      dishwashingMethod: 'running_tap',
      washingMachineLoadsWeek: 5,
      handwashSessionsWeek: 2,
      hasGarden: true,
      gardenWateringWeek: 6,
      gardenMethod: 'hose',
      carWashesMonth: 4,
      carWashMethod: 'hose',
      hasLeaks: true
    },
    eco: {
      showersPerDay: 1,
      showerDuration: 5,
      bathroomTapUses: 3,
      toiletFlushes: 4,
      toiletType: 'dual',
      kitchenTapMinutes: 4,
      dishwashingMethod: 'basin',
      washingMachineLoadsWeek: 2,
      handwashSessionsWeek: 0,
      hasGarden: true,
      gardenWateringWeek: 2,
      gardenMethod: 'can_drip',
      carWashesMonth: 1,
      carWashMethod: 'bucket',
      hasLeaks: false
    }
  };

  function applyPreset(presetData, presetName) {
    document.getElementById('showersPerDay').value = presetData.showersPerDay;
    document.getElementById('showerDuration').value = presetData.showerDuration;
    document.getElementById('bathroomTapUses').value = presetData.bathroomTapUses;
    document.getElementById('toiletFlushes').value = presetData.toiletFlushes;
    document.getElementById('toiletType').value = presetData.toiletType;
    document.getElementById('kitchenTapMinutes').value = presetData.kitchenTapMinutes;
    document.getElementById('dishwashingMethod').value = presetData.dishwashingMethod;
    document.getElementById('washingMachineLoadsWeek').value = presetData.washingMachineLoadsWeek;
    document.getElementById('handwashSessionsWeek').value = presetData.handwashSessionsWeek;

    hasGardenInput.checked = presetData.hasGarden;
    if (presetData.hasGarden) {
      gardenOptionsGroup.classList.remove('hidden');
      hasGardenText.textContent = 'Yes, household waters plants';
    } else {
      gardenOptionsGroup.classList.add('hidden');
      hasGardenText.textContent = 'No plants / garden watered';
    }
    document.getElementById('gardenWateringWeek').value = presetData.gardenWateringWeek;
    document.getElementById('gardenMethod').value = presetData.gardenMethod;

    document.getElementById('carWashesMonth').value = presetData.carWashesMonth;
    document.getElementById('carWashMethod').value = presetData.carWashMethod;

    hasLeaksInput.checked = presetData.hasLeaks;
    if (presetData.hasLeaks) {
      hasLeaksText.textContent = 'Yes, minor leaks or dripping taps reported';
      hasLeaksText.style.color = '#ef4444';
    } else {
      hasLeaksText.textContent = 'No leaks reported';
      hasLeaksText.style.color = 'inherit';
    }

    formErrorBanner.style.display = 'none';
    processCalculation();
    showToast(`Loaded "${presetName}" profile`);
  }

  presetAvgBtn.addEventListener('click', () => applyPreset(PRESETS.average, 'Average Household (~140 L/day)'));
  heroDemoAvgBtn.addEventListener('click', () => {
    applyPreset(PRESETS.average, 'Average Household Demo');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  });
  presetHighBtn.addEventListener('click', () => applyPreset(PRESETS.high, 'High Consumption (~260 L/day)'));
  presetEcoBtn.addEventListener('click', () => applyPreset(PRESETS.eco, 'Eco-Conscious (~85 L/day)'));

  // Reset Button
  btnResetForm.addEventListener('click', () => {
    applyPreset(PRESETS.average, 'Default Baseline');
    showToast('Form reset to default baseline parameters', '↺');
  });

  // ============================================================================
  // 4. Form Submission & Calculation
  // ============================================================================
  function collectFormInputs() {
    const raw = {
      showersPerDay: parseFloat(document.getElementById('showersPerDay').value),
      showerDuration: parseFloat(document.getElementById('showerDuration').value),
      bathroomTapUses: parseFloat(document.getElementById('bathroomTapUses').value),
      toiletFlushes: parseFloat(document.getElementById('toiletFlushes').value),
      toiletType: document.getElementById('toiletType').value,
      kitchenTapMinutes: parseFloat(document.getElementById('kitchenTapMinutes').value),
      dishwashingMethod: document.getElementById('dishwashingMethod').value,
      washingMachineLoadsWeek: parseFloat(document.getElementById('washingMachineLoadsWeek').value),
      handwashSessionsWeek: parseFloat(document.getElementById('handwashSessionsWeek').value),
      hasGarden: hasGardenInput.checked,
      gardenWateringWeek: parseFloat(document.getElementById('gardenWateringWeek').value),
      gardenMethod: document.getElementById('gardenMethod').value,
      carWashesMonth: parseFloat(document.getElementById('carWashesMonth').value),
      carWashMethod: document.getElementById('carWashMethod').value,
      hasLeaks: hasLeaksInput.checked
    };

    // Validation
    const numericKeys = [
      'showersPerDay', 'showerDuration', 'bathroomTapUses', 'toiletFlushes',
      'kitchenTapMinutes', 'washingMachineLoadsWeek', 'handwashSessionsWeek',
      'gardenWateringWeek', 'carWashesMonth'
    ];

    for (const key of numericKeys) {
      if (isNaN(raw[key]) || raw[key] < 0) {
        return null;
      }
    }

    return raw;
  }

  function processCalculation() {
    const inputs = collectFormInputs();
    if (!inputs) {
      formErrorBanner.style.display = 'flex';
      formErrorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    formErrorBanner.style.display = 'none';

    // Execute Mathematical Model
    currentInputs = inputs;
    currentResults = calculateWaterUsage(inputs);
    currentEcoScore = calculateEcoScore(inputs, currentResults);

    // Reveal results section
    resultsSection.style.display = 'block';

    // Update Hero sphere preview metric
    const heroSphere = document.getElementById('hero-sphere-val');
    if (heroSphere) {
      heroSphere.textContent = `${currentResults.totals.daily} L / Day`;
    }

    // Render Dashboard Sub-views
    renderResultsDashboard(currentResults);
    renderPersonalizedRecommendations(currentInputs, currentResults);
    initSimulatorWithDefaults(currentInputs, currentResults);
    renderEcoScore(currentEcoScore);
    renderProgressTracker();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    processCalculation();
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    showToast('Water footprint calculated successfully!');
  });

  // ============================================================================
  // 5. Results Dashboard Rendering
  // ============================================================================
  function renderResultsDashboard(res) {
    // 1. Metrics & Status
    animateValue(resDailyVal, 0, res.totals.daily, 800, ' L');
    resWeeklyVal.textContent = `${res.totals.weekly.toLocaleString()} L`;
    resMonthlyVal.textContent = `${res.totals.monthly.toLocaleString()} L`;

    resStatusTitle.textContent = res.status.level;
    resStatusDesc.textContent = res.status.description;
    resStatusDot.style.color = res.status.color;

    // 2. Highest Area Callout Banner
    highestIcon.textContent = res.highestArea.icon;
    highestTitle.textContent = `Your biggest water usage area is ${res.highestArea.name}.`;
    highestText.textContent = `Consuming approximately ${res.highestArea.litres} Litres/day (${res.highestArea.percentage}% of your overall domestic consumption).`;

    // 3. Render SVG Donut Chart
    renderDonutChart(res.breakdown, res.totals.daily);

    // 4. Render Detailed Category Bars
    renderCategoryBars(res.breakdown);
  }

  function animateValue(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      element.textContent = current + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end + suffix;
      }
    };
    window.requestAnimationFrame(step);
  }

  function renderDonutChart(breakdown, totalDaily) {
    donutTotalVal.textContent = `${Math.round(totalDaily)} L`;
    donutSegmentsGroup.innerHTML = '';
    donutLegend.innerHTML = '';

    const circumference = 2 * Math.PI * 90; // radius = 90 => ~565.48
    let currentOffset = 0;

    for (const [key, item] of Object.entries(breakdown)) {
      if (item.litres <= 0) continue;

      const strokePercent = totalDaily > 0 ? (item.litres / totalDaily) : 0;
      const strokeLength = strokePercent * circumference;
      const strokeColor = CATEGORY_COLORS[key] || '#64748b';

      // SVG circle segment
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '110');
      circle.setAttribute('cy', '110');
      circle.setAttribute('r', '90');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', '24');
      circle.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);
      circle.setAttribute('stroke-dashoffset', -currentOffset);
      circle.setAttribute('stroke-linecap', 'butt');
      circle.setAttribute('class', 'donut-segment');
      circle.style.transition = 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease';

      donutSegmentsGroup.appendChild(circle);
      currentOffset += strokeLength;

      // Legend Item
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-dot" style="background: ${strokeColor};"></span>
        <span>${item.name} (${item.percentage}%)</span>
      `;
      donutLegend.appendChild(legendItem);
    }
  }

  function renderCategoryBars(breakdown) {
    categoryBarsList.innerHTML = '';

    for (const [key, item] of Object.entries(breakdown)) {
      const color = CATEGORY_COLORS[key] || '#0284c7';
      const row = document.createElement('div');
      row.className = 'category-bar-item';
      row.innerHTML = `
        <div class="category-bar-header">
          <span>${item.icon} ${item.name}</span>
          <span style="font-weight: 700; color: ${color};">${item.litres} L/day (${item.percentage}%)</span>
        </div>
        <div class="category-bar-track">
          <div class="category-bar-fill" style="width: 0%; background: ${color};"></div>
        </div>
      `;
      categoryBarsList.appendChild(row);

      // Trigger width animation
      setTimeout(() => {
        const fill = row.querySelector('.category-bar-fill');
        if (fill) fill.style.width = `${Math.min(100, item.percentage)}%`;
      }, 50);
    }
  }

  // ============================================================================
  // 6. Dynamic Personalized Recommendations Engine
  // ============================================================================
  function renderPersonalizedRecommendations(inputs, results) {
    const recs = generateRecommendations(inputs, results);

    recsTotalSavedVal.textContent = recs.totalPotentialDailySaving;
    recsAnnualStat.textContent = `(~${recs.totalPotentialAnnualSaving.toLocaleString()} L / Year)`;

    recsGrid.innerHTML = '';

    recs.list.forEach((rec) => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      card.innerHTML = `
        <div class="rec-card-header">
          <div class="rec-card-category">
            <span>${rec.icon}</span>
            <span>${rec.category}</span>
          </div>
          <span class="badge ${rec.priority === 'Critical' ? 'badge-danger' : (rec.priority === 'High' ? 'badge-warning' : 'badge-emerald')}">
            ${rec.tag || rec.priority + ' Priority'}
          </span>
        </div>

        <div class="rec-problem-box">
          <span><strong>Issue:</strong> ${rec.problem}</span>
        </div>

        <h4 class="rec-title">${rec.recommendation}</h4>
        <p class="rec-why"><strong>Why it helps:</strong> ${rec.whyItHelps}</p>

        <div class="rec-saving-badge">
          <span class="rec-saving-label">Estimated Potential Savings:</span>
          <span class="rec-saving-amount">~${rec.dailySaving} Litres / Day</span>
        </div>
      `;
      recsGrid.appendChild(card);
    });
  }

  // ============================================================================
  // 7. Interactive Water Savings Simulator
  // ============================================================================
  function initSimulatorWithDefaults(inputs, results) {
    // Initialize slider ranges based on current input
    const maxShower = Math.max(12, inputs.showerDuration);
    simRangeShower.max = maxShower;
    const targetShower = Math.min(5, Math.max(3, inputs.showerDuration - 2));
    simRangeShower.value = targetShower;
    simValShower.textContent = `${targetShower} min`;

    const currentLaundry = inputs.washingMachineLoadsWeek;
    simRangeLaundry.max = Math.max(8, currentLaundry);
    const targetLaundry = Math.max(1, currentLaundry - 1);
    simRangeLaundry.value = targetLaundry;
    simValLaundry.textContent = `${targetLaundry} loads`;

    // Defaults for toggles
    simToggleDish.checked = inputs.dishwashingMethod === 'running_tap';
    simToggleToilet.checked = inputs.toiletType === 'standard';
    simToggleGarden.checked = inputs.hasGarden && inputs.gardenMethod === 'hose';
    simToggleLeaks.checked = inputs.hasLeaks;

    updateSimulation();
  }

  function updateSimulation() {
    if (!currentInputs) return;

    const tweaks = {
      showerDuration: parseFloat(simRangeShower.value),
      washingMachineLoadsWeek: parseFloat(simRangeLaundry.value),
      dishwashingMethod: simToggleDish.checked ? 'basin' : currentInputs.dishwashingMethod,
      toiletType: simToggleToilet.checked ? 'dual' : currentInputs.toiletType,
      gardenMethod: simToggleGarden.checked ? 'can_drip' : currentInputs.gardenMethod,
      fixLeaks: simToggleLeaks.checked
    };

    const sim = simulateWaterSavings(currentInputs, tweaks);

    // Update displays
    simCurrentVal.textContent = `${sim.baselineDaily} L`;
    simPotentialVal.textContent = `${sim.simulatedDaily} L`;
    simSavedVal.textContent = `${sim.dailySaved} L / day`;
    simSavedPercent.textContent = `${sim.percentSaved}% Reduction`;

    simEquivBuckets.textContent = sim.equivalents.bucketsSavedDaily;
    simEquivBottles.textContent = sim.equivalents.drinkingBottlesWeekly.toLocaleString();
    simEquivTrees.textContent = sim.equivalents.treesNourishedMonthly;
  }

  // Simulator Event Listeners
  simRangeShower.addEventListener('input', (e) => {
    simValShower.textContent = `${e.target.value} min`;
    updateSimulation();
  });

  simRangeLaundry.addEventListener('input', (e) => {
    simValLaundry.textContent = `${e.target.value} loads`;
    updateSimulation();
  });

  simToggleDish.addEventListener('change', updateSimulation);
  simToggleToilet.addEventListener('change', updateSimulation);
  simToggleGarden.addEventListener('change', updateSimulation);
  simToggleLeaks.addEventListener('change', updateSimulation);

  // ============================================================================
  // 8. AquaSave Eco Score Rendering
  // ============================================================================
  function renderEcoScore(eco) {
    gaugeScoreVal.textContent = eco.score;
    gaugeGrade.textContent = `Grade ${eco.grade}`;
    gaugeVerdict.textContent = eco.verdict;

    // Set badge style
    gaugeGrade.className = `gauge-grade-badge ${eco.score >= 80 ? 'badge-emerald' : (eco.score >= 60 ? 'badge-primary' : 'badge-warning')}`;

    // SVG Circumference: 2 * PI * 90 = ~565.48
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (circumference * eco.score / 100);
    gaugeCircle.style.strokeDashoffset = offset;
    gaugeCircle.style.stroke = eco.color;

    // Render Sub-scores
    const s = eco.subScores;
    subShowerVal.textContent = `${s.shower.score} / ${s.shower.max} pts`;
    subShowerFill.style.width = `${(s.shower.score / s.shower.max) * 100}%`;

    subToiletVal.textContent = `${s.toilet.score} / ${s.toilet.max} pts`;
    subToiletFill.style.width = `${(s.toilet.score / s.toilet.max) * 100}%`;

    subKitchenVal.textContent = `${s.kitchen.score} / ${s.kitchen.max} pts`;
    subKitchenFill.style.width = `${(s.kitchen.score / s.kitchen.max) * 100}%`;

    subLaundryVal.textContent = `${s.laundry.score} / ${s.laundry.max} pts`;
    subLaundryFill.style.width = `${(s.laundry.score / s.laundry.max) * 100}%`;

    subOutdoorVal.textContent = `${s.outdoor.score} / ${s.outdoor.max} pts`;
    subOutdoorFill.style.width = `${(s.outdoor.score / s.outdoor.max) * 100}%`;
  }

  // ============================================================================
  // 9. Progress Tracker (LocalStorage Management)
  // ============================================================================
  function getTrackerHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return [];
    }
  }

  function saveCurrentAssessment() {
    if (!currentResults || !currentEcoScore) {
      showToast('Please calculate your usage first!');
      return;
    }

    const history = getTrackerHistory();
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      dailyLitres: currentResults.totals.daily,
      weeklyLitres: currentResults.totals.weekly,
      highestArea: currentResults.highestArea.name,
      highestIcon: currentResults.highestArea.icon,
      ecoScore: currentEcoScore.score,
      grade: currentEcoScore.grade,
      status: currentResults.status.level
    };

    history.unshift(newEntry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      renderProgressTracker();
      showToast('Assessment successfully saved to Progress Tracker!');
    } catch (e) {
      showToast('Failed to save to local storage.');
    }
  }

  function clearTrackerHistory() {
    if (confirm('Are you sure you want to clear your local water conservation history?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderProgressTracker();
      showToast('Conservation history cleared.');
    }
  }

  function renderProgressTracker() {
    const history = getTrackerHistory();
    trackCountVal.textContent = history.length;

    if (history.length === 0) {
      trackCurrentVal.textContent = currentResults ? `${currentResults.totals.daily} L` : '0 L';
      trackPrevVal.textContent = '0 L';
      trackSavedVal.textContent = '0 L';
      trackSavedSub.textContent = 'No baseline recorded';
      trackerTable.style.display = 'none';
      trackerEmpty.style.display = 'block';

      motivationalTitle.textContent = 'Start Your Water Conservation Journey';
      motivationalDesc.textContent = 'Calculate your water usage and click "Save to Progress Tracker" to track your progress over time.';
      return;
    }

    trackerTable.style.display = 'table';
    trackerEmpty.style.display = 'none';

    // Summary Calculations
    const latest = history[0];
    const previous = history.length > 1 ? history[1] : latest;

    trackCurrentVal.textContent = `${latest.dailyLitres} L`;
    trackPrevVal.textContent = `${previous.dailyLitres} L`;

    const deltaLitres = previous.dailyLitres - latest.dailyLitres;
    const percentChange = previous.dailyLitres > 0 ? Math.round((deltaLitres / previous.dailyLitres) * 100) : 0;

    if (deltaLitres > 0) {
      trackSavedVal.textContent = `-${deltaLitres.toFixed(1)} L`;
      trackSavedVal.style.color = '#10b981';
      trackSavedSub.textContent = `Saved ${percentChange}% vs previous log!`;
      trackSavedSub.style.color = '#10b981';

      motivationalTitle.textContent = 'Outstanding Conservation Progress';
      motivationalDesc.textContent = `You have reduced your daily household consumption by ${deltaLitres.toFixed(1)} Litres. Keep up the impactful habits!`;
    } else if (deltaLitres < 0) {
      trackSavedVal.textContent = `+${Math.abs(deltaLitres).toFixed(1)} L`;
      trackSavedVal.style.color = '#ef4444';
      trackSavedSub.textContent = `Increased by ${Math.abs(percentChange)}%`;
      trackSavedSub.style.color = '#ef4444';

      motivationalTitle.textContent = 'Usage Increased – Check Recommendations';
      motivationalDesc.textContent = `Your water usage rose by ${Math.abs(deltaLitres).toFixed(1)} Litres compared to your prior record. Implement our personalized tips to reverse this trend.`;
    } else {
      trackSavedVal.textContent = '0.0 L';
      trackSavedVal.style.color = 'inherit';
      trackSavedSub.textContent = 'Baseline established';
      trackSavedSub.style.color = 'inherit';

      motivationalTitle.textContent = 'Baseline Recorded Successfully';
      motivationalDesc.textContent = 'Your initial water consumption baseline is saved. Implement recommended adjustments and re-assess to measure your savings.';
    }

    // Render Table Rows
    trackerTbody.innerHTML = '';
    history.forEach((entry) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${entry.timestamp}</strong></td>
        <td><strong style="color: var(--primary);">${entry.dailyLitres} L / day</strong></td>
        <td>${entry.weeklyLitres.toLocaleString()} L / week</td>
        <td>${entry.highestArea}</td>
        <td><span class="badge badge-emerald">${entry.ecoScore} / 100 (Grade ${entry.grade})</span></td>
        <td><span class="badge ${entry.status === 'Low Usage' ? 'badge-emerald' : (entry.status === 'High Usage' ? 'badge-danger' : 'badge-warning')}">${entry.status}</span></td>
      `;
      trackerTbody.appendChild(tr);
    });
  }

  btnSaveProgress.addEventListener('click', saveCurrentAssessment);
  btnSaveCurrentLog.addEventListener('click', saveCurrentAssessment);
  btnClearTracker.addEventListener('click', clearTrackerHistory);

  // ============================================================================
  // 10. Water-Saving Tips Category Filter
  // ============================================================================
  const tipsTabs = document.getElementById('tips-tabs');
  const tipCards = document.querySelectorAll('.tip-card');

  tipsTabs.querySelectorAll('.tips-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tipsTabs.querySelectorAll('.tips-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-category');
      tipCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ============================================================================
  // 11. Initial Run on Load (Demo Preparation for College Presentation)
  // ============================================================================
  // Automatically evaluate default values on load so the app is instantly active!
  processCalculation();
});
