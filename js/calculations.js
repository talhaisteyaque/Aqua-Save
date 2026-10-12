/**
 * ==============================================================================
 * AquaSave – Water Conservation Recommendation System
 * Academic Project: CHE110 Environmental Studies CA1
 * Module: Calculation Engine & Assumptions Model (js/calculations.js)
 * ==============================================================================
 * 
 * NOTE FOR COLLEGE PRESENTATION & EVALUATION:
 * All calculations provided by AquaSave are scientifically grounded ESTIMATES 
 * derived from standard municipal water-use benchmarks (e.g., Central Pollution 
 * Control Board (CPCB), US EPA WaterSense, and World Health Organization guidelines).
 * Domestic water fixtures exhibit variations in water pressure and flow rates, 
 * so these constants represent typical residential operational values.
 */

// Global Water Usage Benchmark Constants (in Litres)
const WATER_BENCHMARKS = {
    // Shower Benchmarks
    SHOWER_STANDARD_FLOW_RATE: 9.5,   // Litres per minute for standard showerhead
    SHOWER_ECO_FLOW_RATE: 6.0,        // Litres per minute with low-flow aerated showerhead
    TARGET_ECO_SHOWER_DURATION: 5.0,  // Recommended target shower time in minutes

    // Bathroom Tap Benchmarks
    TAP_STANDARD_FLOW_RATE: 6.0,      // Litres per minute for regular bathroom tap
    TAP_USE_AVERAGE_VOLUME: 1.5,      // Litres per typical handwashing/brushing session (tap not left running continuously)
    TAP_RUNNING_BRUSH_SAVING: 5.0,    // Litres saved per session by turning off tap while brushing/soaping

    // Toilet Flush Benchmarks
    TOILET_STANDARD_FLUSH: 9.0,       // Litres per flush for conventional single-flush cistern
    TOILET_DUAL_FLUSH_AVG: 4.5,       // Litres per flush average for dual-flush system (3L half / 6L full)
    TOILET_DISPLACEMENT_SAVING: 2.0,  // Litres saved per flush with cistern displacement bag or dual-flush conversion

    // Kitchen Benchmarks
    KITCHEN_TAP_FLOW_RATE: 8.0,       // Litres per minute for kitchen sink faucet
    DISHWASHING_RUNNING_TAP_DAILY: 60.0, // Litres/day for washing dishes under continuous running water
    DISHWASHING_BASIN_DAILY: 20.0,       // Litres/day for dual-basin or soaking method
    DISHWASHING_EFFICIENT_MACHINE: 12.0, // Litres/day for energy/water star dishwasher

    // Laundry Benchmarks
    WASHING_MACHINE_LOAD: 50.0,       // Litres per average residential washing machine load
    HANDWASH_LAUNDRY_SESSION: 35.0,   // Litres per handwashing clothes session
    LAUNDRY_FULL_LOAD_SAVINGS_RATIO: 0.30, // 30% water saved by consolidating into full loads

    // Outdoor & Gardening Benchmarks
    GARDEN_HOSE_SESSION: 45.0,        // Litres per 10-minute hosepipe watering session (~15 L/min with pauses)
    GARDEN_CAN_SESSION: 12.0,         // Litres per targeted watering can session
    GARDEN_DRIP_SAVINGS_RATIO: 0.50,  // 50% savings through drip/watering-can vs open hose

    // Other Household Benchmarks
    CAR_WASH_HOSE: 120.0,             // Litres per car wash using open hosepipe
    CAR_WASH_BUCKET: 30.0,            // Litres per car wash using bucket and sponge
    MINOR_LEAK_DAILY_WASTE: 25.0      // Litres wasted daily from a slowly dripping faucet (approx. 30 drops/min)
};

/**
 * Validates and sanitizes raw input values from the user form.
 * Ensures non-negative numbers and reasonable upper bounds for academic integrity.
 */
function sanitizeInputs(raw) {
    return {
        showersPerDay: Math.max(0, Math.min(10, parseFloat(raw.showersPerDay) || 0)),
        showerDuration: Math.max(0, Math.min(60, parseFloat(raw.showerDuration) || 0)),
        bathroomTapUses: Math.max(0, Math.min(50, parseFloat(raw.bathroomTapUses) || 0)),
        toiletFlushes: Math.max(0, Math.min(30, parseFloat(raw.toiletFlushes) || 0)),
        toiletType: raw.toiletType === 'dual' ? 'dual' : 'standard',
        kitchenTapMinutes: Math.max(0, Math.min(120, parseFloat(raw.kitchenTapMinutes) || 0)),
        dishwashingMethod: raw.dishwashingMethod || 'running_tap', // 'running_tap', 'basin', 'dishwasher'
        washingMachineLoadsWeek: Math.max(0, Math.min(30, parseFloat(raw.washingMachineLoadsWeek) || 0)),
        handwashSessionsWeek: Math.max(0, Math.min(30, parseFloat(raw.handwashSessionsWeek) || 0)),
        hasGarden: Boolean(raw.hasGarden),
        gardenWateringWeek: Math.max(0, Math.min(21, parseFloat(raw.gardenWateringWeek) || 0)),
        gardenMethod: raw.gardenMethod || 'hose', // 'hose', 'can_drip'
        carWashesMonth: Math.max(0, Math.min(30, parseFloat(raw.carWashesMonth) || 0)),
        carWashMethod: raw.carWashMethod || 'hose', // 'hose', 'bucket'
        hasLeaks: Boolean(raw.hasLeaks)
    };
}

/**
 * Core Water Usage Calculation Engine.
 * Computes individual daily consumption per activity and totals across daily, weekly, and monthly horizons.
 */
function calculateWaterUsage(rawInputs) {
    const inputs = sanitizeInputs(rawInputs);

    // 1. Bathroom Calculations
    // Shower: showers/day * duration (min) * flow rate (L/min)
    const showerDaily = inputs.showersPerDay * inputs.showerDuration * WATER_BENCHMARKS.SHOWER_STANDARD_FLOW_RATE;
    // Bathroom taps: uses/day * avg volume (L)
    const bathroomTapDaily = inputs.bathroomTapUses * WATER_BENCHMARKS.TAP_USE_AVERAGE_VOLUME;
    const bathroomTotal = showerDaily + bathroomTapDaily;

    // 2. Toilet Calculations
    // Flushes/day * flush rate according to fixture type
    const flushVolume = inputs.toiletType === 'dual' 
        ? WATER_BENCHMARKS.TOILET_DUAL_FLUSH_AVG 
        : WATER_BENCHMARKS.TOILET_STANDARD_FLUSH;
    const toiletDaily = inputs.toiletFlushes * flushVolume;

    // 3. Kitchen Calculations
    // Kitchen tap: minutes/day * kitchen tap rate
    const kitchenTapDaily = inputs.kitchenTapMinutes * WATER_BENCHMARKS.KITCHEN_TAP_FLOW_RATE;
    // Dishwashing method:
    let dishwashingDaily = 0;
    if (inputs.dishwashingMethod === 'running_tap') {
        dishwashingDaily = WATER_BENCHMARKS.DISHWASHING_RUNNING_TAP_DAILY;
    } else if (inputs.dishwashingMethod === 'basin') {
        dishwashingDaily = WATER_BENCHMARKS.DISHWASHING_BASIN_DAILY;
    } else if (inputs.dishwashingMethod === 'dishwasher') {
        dishwashingDaily = WATER_BENCHMARKS.DISHWASHING_EFFICIENT_MACHINE;
    }
    const kitchenTotal = kitchenTapDaily + dishwashingDaily;

    // 4. Laundry Calculations
    // Machine loads: (loads/week * 50L) / 7 days
    const machineDaily = (inputs.washingMachineLoadsWeek * WATER_BENCHMARKS.WASHING_MACHINE_LOAD) / 7;
    // Handwash sessions: (sessions/week * 35L) / 7 days
    const handwashDaily = (inputs.handwashSessionsWeek * WATER_BENCHMARKS.HANDWASH_LAUNDRY_SESSION) / 7;
    const laundryTotal = machineDaily + handwashDaily;

    // 5. Gardening & Outdoor Calculations
    let gardenDaily = 0;
    if (inputs.hasGarden && inputs.gardenWateringWeek > 0) {
        const perSession = inputs.gardenMethod === 'can_drip' 
            ? WATER_BENCHMARKS.GARDEN_CAN_SESSION 
            : WATER_BENCHMARKS.GARDEN_HOSE_SESSION;
        gardenDaily = (inputs.gardenWateringWeek * perSession) / 7;
    }

    // 6. Other / Leaks / Car Washes
    const carWashPerWash = inputs.carWashMethod === 'bucket' 
        ? WATER_BENCHMARKS.CAR_WASH_BUCKET 
        : WATER_BENCHMARKS.CAR_WASH_HOSE;
    const carWashDaily = (inputs.carWashesMonth * carWashPerWash) / 30;
    const leakDaily = inputs.hasLeaks ? WATER_BENCHMARKS.MINOR_LEAK_DAILY_WASTE : 0;
    const otherTotal = carWashDaily + leakDaily;

    // Aggregates
    const totalDaily = showerDaily + bathroomTapDaily + toiletDaily + kitchenTotal + laundryTotal + gardenDaily + otherTotal;
    const totalWeekly = totalDaily * 7;
    const totalMonthly = totalDaily * 30;
    const totalAnnual = totalDaily * 365;

    // Breakdown Structure
    const breakdown = {
        shower: {
            name: 'Showering',
            icon: '',
            litres: Math.round(showerDaily * 10) / 10,
            percentage: totalDaily > 0 ? Math.round((showerDaily / totalDaily) * 100) : 0
        },
        toilet: {
            name: 'Toilet Flushing',
            icon: '',
            litres: Math.round(toiletDaily * 10) / 10,
            percentage: totalDaily > 0 ? Math.round((toiletDaily / totalDaily) * 100) : 0
        },
        kitchen: {
            name: 'Kitchen & Dishes',
            icon: '',
            litres: Math.round(kitchenTotal * 10) / 10,
            percentage: totalDaily > 0 ? Math.round((kitchenTotal / totalDaily) * 100) : 0
        },
        laundry: {
            name: 'Laundry',
            icon: '',
            litres: Math.round(laundryTotal * 10) / 10,
            percentage: totalDaily > 0 ? Math.round((laundryTotal / totalDaily) * 100) : 0
        },
        garden: {
            name: 'Garden & Plants',
            icon: '',
            litres: Math.round(gardenDaily * 10) / 10,
            percentage: totalDaily > 0 ? Math.round((gardenDaily / totalDaily) * 100) : 0
        },
        other: {
            name: 'Other & Fixtures',
            icon: '',
            litres: Math.round(otherTotal * 10) / 10,
            percentage: totalDaily > 0 ? Math.round((otherTotal / totalDaily) * 100) : 0
        }
    };

    // Determine the highest water-consuming activity
    let highestCategory = 'shower';
    let maxLitres = -1;
    for (const [key, item] of Object.entries(breakdown)) {
        if (item.litres > maxLitres) {
            maxLitres = item.litres;
            highestCategory = key;
        }
    }

    // Benchmark Status Classification
    // CPCB / WHO typical per-capita urban domestic water supply standard is ~135 Litres/day
    let status = {
        level: 'Moderate Usage',
        badgeClass: 'badge-warning',
        color: '#f59e0b',
        description: 'Your estimated consumption is within a typical urban domestic range. However, significant opportunities exist to improve efficiency.'
    };

    if (totalDaily < 100) {
        status = {
            level: 'Low Usage',
            badgeClass: 'badge-success',
            color: '#10b981',
            description: 'Impressive water efficiency! You are well below typical household averages, demonstrating responsible conservation.'
        };
    } else if (totalDaily > 180) {
        status = {
            level: 'High Usage',
            badgeClass: 'badge-danger',
            color: '#ef4444',
            description: 'Your estimated water footprint is notably higher than standard benchmarks. Implementing targeted recommendations can yield massive savings.'
        };
    }

    return {
        inputs,
        totals: {
            daily: Math.round(totalDaily * 10) / 10,
            weekly: Math.round(totalWeekly),
            monthly: Math.round(totalMonthly),
            annual: Math.round(totalAnnual)
        },
        breakdown,
        highestArea: {
            key: highestCategory,
            name: breakdown[highestCategory].name,
            icon: breakdown[highestCategory].icon,
            litres: breakdown[highestCategory].litres,
            percentage: breakdown[highestCategory].percentage
        },
        status
    };
}

/**
 * AquaSave Dynamic Eco Score Engine (0–100 Scale).
 * Evaluates efficiency across 5 key household dimensions:
 * 1. Shower Efficiency (25 pts)
 * 2. Toilet & Sanitation Efficiency (20 pts)
 * 3. Kitchen & Dishwashing Efficiency (20 pts)
 * 4. Laundry Efficiency (15 pts)
 * 5. Outdoor & Leak Prevention (20 pts)
 */
function calculateEcoScore(inputs, calculationResults) {
    let showerScore = 25;
    let toiletScore = 20;
    let kitchenScore = 20;
    let laundryScore = 15;
    let outdoorScore = 20;

    // Shower evaluation: penalize high duration and excessive frequency
    if (inputs.showerDuration > 12) showerScore -= 15;
    else if (inputs.showerDuration > 8) showerScore -= 9;
    else if (inputs.showerDuration > 5) showerScore -= 4;

    if (inputs.showersPerDay > 2) showerScore -= 8;
    else if (inputs.showersPerDay === 2) showerScore -= 4;
    showerScore = Math.max(3, showerScore);

    // Toilet evaluation:
    if (inputs.toiletType === 'standard') toiletScore -= 8; // Lack of dual flush
    if (inputs.toiletFlushes > 7) toiletScore -= 7;
    else if (inputs.toiletFlushes > 5) toiletScore -= 3;
    toiletScore = Math.max(3, toiletScore);

    // Kitchen evaluation:
    if (inputs.dishwashingMethod === 'running_tap') kitchenScore -= 12;
    if (inputs.kitchenTapMinutes > 15) kitchenScore -= 7;
    else if (inputs.kitchenTapMinutes > 8) kitchenScore -= 3;
    kitchenScore = Math.max(2, kitchenScore);

    // Laundry evaluation:
    const totalWeeklyLoads = inputs.washingMachineLoadsWeek + inputs.handwashSessionsWeek;
    if (totalWeeklyLoads > 6) laundryScore -= 8;
    else if (totalWeeklyLoads > 4) laundryScore -= 4;
    laundryScore = Math.max(2, laundryScore);

    // Outdoor & Leaks evaluation:
    if (inputs.hasLeaks) outdoorScore -= 10;
    if (inputs.hasGarden && inputs.gardenMethod === 'hose') outdoorScore -= 6;
    if (inputs.carWashesMonth > 2 && inputs.carWashMethod === 'hose') outdoorScore -= 4;
    outdoorScore = Math.max(2, outdoorScore);

    const totalScore = Math.min(100, Math.max(10, showerScore + toiletScore + kitchenScore + laundryScore + outdoorScore));

    let grade = 'A';
    let verdict = 'Water Conservation Champion';
    let color = '#10b981';

    if (totalScore >= 85) {
        grade = 'A+';
        verdict = 'Outstanding Conservation Mindset';
        color = '#10b981';
    } else if (totalScore >= 70) {
        grade = 'B';
        verdict = 'Conscious User with Room to Optimize';
        color = '#0284c7';
    } else if (totalScore >= 50) {
        grade = 'C';
        verdict = 'Moderate Consumption – Action Needed';
        color = '#f59e0b';
    } else {
        grade = 'D';
        verdict = 'High Waste Risk – Immediate Action Recommended';
        color = '#ef4444';
    }

    return {
        score: totalScore,
        grade,
        verdict,
        color,
        subScores: {
            shower: { label: 'Shower Efficiency', score: showerScore, max: 25 },
            toilet: { label: 'Toilet & Sanitation', score: toiletScore, max: 20 },
            kitchen: { label: 'Kitchen & Dishwashing', score: kitchenScore, max: 20 },
            laundry: { label: 'Laundry Efficiency', score: laundryScore, max: 15 },
            outdoor: { label: 'Outdoor & Leak Control', score: outdoorScore, max: 20 }
        }
    };
}

/**
 * Dynamic Personalized Recommendations Engine.
 * Evaluates the specific behavioural profile of the user and outputs targeted,
 * prioritized recommendation cards with mathematically calculated potential savings.
 */
function generateRecommendations(inputs, results) {
    const recommendations = [];

    // 1. Shower Recommendations
    if (inputs.showerDuration > 6) {
        const excessMinutes = inputs.showerDuration - 5;
        const potentialDailySaving = excessMinutes * WATER_BENCHMARKS.SHOWER_STANDARD_FLOW_RATE * inputs.showersPerDay;
        const annualSaving = Math.round(potentialDailySaving * 365);

        recommendations.push({
            id: 'rec_shower_duration',
            category: 'Bathroom',
            icon: '',
            priority: inputs.showerDuration >= 10 ? 'High' : 'Medium',
            problem: `Your average shower lasts ${inputs.showerDuration} minutes (${inputs.showersPerDay} times daily), consuming an estimated ${results.breakdown.shower.litres} L/day.`,
            recommendation: `Adopt a 5-minute shower routine or use a waterproof shower timer.`,
            whyItHelps: `Every minute curtailed under a standard showerhead prevents approximately 9.5 Litres of treated water and water-heating energy from being wasted.`,
            dailySaving: Math.round(potentialDailySaving),
            annualSaving: annualSaving,
            tag: 'Top Potential Saving'
        });
    }

    if (inputs.showersPerDay >= 2 && inputs.showerDuration > 4) {
        const aeratorDailySaving = (WATER_BENCHMARKS.SHOWER_STANDARD_FLOW_RATE - WATER_BENCHMARKS.SHOWER_ECO_FLOW_RATE) * inputs.showerDuration * inputs.showersPerDay;
        recommendations.push({
            id: 'rec_shower_aerator',
            category: 'Bathroom',
            icon: '',
            priority: 'Medium',
            problem: `High shower frequency (${inputs.showersPerDay} showers/day) with standard flow fixtures.`,
            recommendation: `Install an inexpensive low-flow aerated showerhead (flow rate ~6.0 L/min).`,
            whyItHelps: `Aerators infuse air into the water stream, preserving satisfying water pressure while cutting total volume by up to 35%.`,
            dailySaving: Math.round(aeratorDailySaving),
            annualSaving: Math.round(aeratorDailySaving * 365),
            tag: 'Hardware Retrofit'
        });
    }

    // 2. Bathroom Tap Recommendations
    if (inputs.bathroomTapUses >= 4) {
        // Turning off tap while brushing or lathering saves ~4L per session
        const tapSavings = inputs.bathroomTapUses * 3.5;
        recommendations.push({
            id: 'rec_tap_habits',
            category: 'Bathroom',
            icon: '',
            priority: 'Medium',
            problem: `Frequent tap usage (${inputs.bathroomTapUses} times/day) for handwashing, brushing, or grooming.`,
            recommendation: `Turn off the tap completely while actively lathering soap or brushing teeth.`,
            whyItHelps: `A running tap discharges about 6 Litres every single minute. Turning it off during the 20-second scrub cycle immediately halves tap waste.`,
            dailySaving: Math.round(tapSavings),
            annualSaving: Math.round(tapSavings * 365),
            tag: 'Zero-Cost Habit'
        });
    }

    // 3. Toilet Recommendations
    if (inputs.toiletType === 'standard' && inputs.toiletFlushes > 0) {
        const toiletSavings = inputs.toiletFlushes * WATER_BENCHMARKS.TOILET_DISPLACEMENT_SAVING;
        recommendations.push({
            id: 'rec_toilet_dual',
            category: 'Sanitation',
            icon: '',
            priority: inputs.toiletFlushes >= 5 ? 'High' : 'Medium',
            problem: `Single-flush cistern discharges a uniform ~9 Litres per flush across all ${inputs.toiletFlushes} daily uses.`,
            recommendation: `Upgrade to a dual-flush mechanism or place a displacement bottle inside the cistern.`,
            whyItHelps: `Dual-flush cisterns offer a 3L liquid waste option, reducing toilet water footprint by 35%–50% without compromising hygiene.`,
            dailySaving: Math.round(toiletSavings),
            annualSaving: Math.round(toiletSavings * 365),
            tag: 'High Impact'
        });
    }

    // 4. Kitchen & Dishwashing Recommendations
    if (inputs.dishwashingMethod === 'running_tap') {
        const dishSavings = WATER_BENCHMARKS.DISHWASHING_RUNNING_TAP_DAILY - WATER_BENCHMARKS.DISHWASHING_BASIN_DAILY;
        recommendations.push({
            id: 'rec_dish_basin',
            category: 'Kitchen',
            icon: '',
            priority: 'High',
            problem: `Dishes are washed under continuous running tap water, consuming ~60 Litres per day.`,
            recommendation: `Switch to a two-basin or soaking sink method (one basin for soapy wash, one for rinsing).`,
            whyItHelps: `Soaking loosens food residues with minimal active rinsing, reducing kitchen dish cleaning water by over 60%.`,
            dailySaving: Math.round(dishSavings),
            annualSaving: Math.round(dishSavings * 365),
            tag: 'High Priority'
        });
    }

    if (inputs.kitchenTapMinutes > 10) {
        const kitchenTapSavings = (inputs.kitchenTapMinutes - 5) * WATER_BENCHMARKS.KITCHEN_TAP_FLOW_RATE * 0.4;
        recommendations.push({
            id: 'rec_kitchen_tap_aerator',
            category: 'Kitchen',
            icon: '',
            priority: 'Medium',
            problem: `Kitchen faucet is actively run for ~${inputs.kitchenTapMinutes} minutes daily.`,
            recommendation: `Equip kitchen faucet with a swivel aerator or use a bowl for food rinsing.`,
            whyItHelps: `Rinsing fruits and vegetables in a dedicated bowl rather than running water captures greywater that can be reused for house plants.`,
            dailySaving: Math.round(kitchenTapSavings),
            annualSaving: Math.round(kitchenTapSavings * 365),
            tag: 'Greywater Reuse'
        });
    }

    // 5. Laundry Recommendations
    if (inputs.washingMachineLoadsWeek >= 4) {
        // Consolidating into full loads saves ~1 load per week
        const laundrySavingsWeekly = WATER_BENCHMARKS.WASHING_MACHINE_LOAD;
        const laundryDailySavings = laundrySavingsWeekly / 7;
        recommendations.push({
            id: 'rec_laundry_full_loads',
            category: 'Laundry',
            icon: '',
            priority: 'Medium',
            problem: `Operating ${inputs.washingMachineLoadsWeek} washing machine cycles per week.`,
            recommendation: `Always run full laundry loads and utilize cold eco-cycles.`,
            whyItHelps: `Washing machines use virtually the same quantity of water regardless of load fullness. Consolidating partial loads cuts water and electric bills directly.`,
            dailySaving: Math.round(laundryDailySavings),
            annualSaving: Math.round(laundryDailySavings * 365),
            tag: 'Energy & Water'
        });
    }

    // 6. Gardening Recommendations
    if (inputs.hasGarden) {
        if (inputs.gardenMethod === 'hose') {
            const gardenSavingsWeekly = inputs.gardenWateringWeek * (WATER_BENCHMARKS.GARDEN_HOSE_SESSION - WATER_BENCHMARKS.GARDEN_CAN_SESSION);
            const gardenDailySavings = gardenSavingsWeekly / 7;
            recommendations.push({
                id: 'rec_garden_method',
                category: 'Gardening',
                icon: '',
                priority: 'High',
                problem: `Using an open hosepipe for garden watering consumes ~${WATER_BENCHMARKS.GARDEN_HOSE_SESSION} Litres per session.`,
                recommendation: `Switch to targeted watering cans or drip irrigation, and water strictly early morning or late evening.`,
                whyItHelps: `Watering during midday heat causes up to 40% of moisture to evaporate before reaching plant roots. Targeted early watering keeps soil moist longer.`,
                dailySaving: Math.round(gardenDailySavings),
                annualSaving: Math.round(gardenDailySavings * 365),
                tag: 'Evaporation Control'
            });
        }
    }

    // 7. Household Leaks
    if (inputs.hasLeaks) {
        recommendations.push({
            id: 'rec_fix_leaks',
            category: 'Household',
            icon: '',
            priority: 'Critical',
            problem: `Unrepaired domestic dripping taps or plumbing leaks detected in household.`,
            recommendation: `Promptly replace worn tap washers or flush valve seals.`,
            whyItHelps: `A dripping faucet wasting just 1 drop per second squanders over 25 Litres of potable water every 24 hours (over 9,000 Litres a year!).`,
            dailySaving: Math.round(WATER_BENCHMARKS.MINOR_LEAK_DAILY_WASTE),
            annualSaving: Math.round(WATER_BENCHMARKS.MINOR_LEAK_DAILY_WASTE * 365),
            tag: 'Zero Waste'
        });
    }

    // 8. Vehicle Washing
    if (inputs.carWashesMonth > 0 && inputs.carWashMethod === 'hose') {
        const carSavingsPerWash = WATER_BENCHMARKS.CAR_WASH_HOSE - WATER_BENCHMARKS.CAR_WASH_BUCKET;
        const carDailySavings = (inputs.carWashesMonth * carSavingsPerWash) / 30;
        recommendations.push({
            id: 'rec_car_bucket',
            category: 'Outdoor',
            icon: '',
            priority: 'Medium',
            problem: `Washing vehicles using a running hosepipe uses ~120 Litres per wash.`,
            recommendation: `Wash vehicles using a bucket, biodegradable soap, and a microfiber sponge.`,
            whyItHelps: `Using two buckets provides comprehensive vehicle cleaning while using only ~30 Litres, saving up to 90 Litres per wash.`,
            dailySaving: Math.round(carDailySavings),
            annualSaving: Math.round(carDailySavings * 365),
            tag: 'High Efficiency'
        });
    }

    // Fallback recommendation if user already has very conservative usage
    if (recommendations.length === 0) {
        recommendations.push({
            id: 'rec_conservation_champion',
            category: 'General',
            icon: '',
            priority: 'Low',
            problem: `Your current water practices are already highly conscious!`,
            recommendation: `Consider exploring rooftop rainwater harvesting and greywater diversion for outdoor gardening.`,
            whyItHelps: `Rainwater harvesting captures seasonal monsoon rainfall to recharge local groundwater aquifers and reduce municipal dependence.`,
            dailySaving: 15,
            annualSaving: 5475,
            tag: 'Next Level Sustainability'
        });
    }

    // Calculate total potential savings across all recommended measures
    const totalPotentialDailySaving = recommendations.reduce((acc, r) => acc + (r.dailySaving || 0), 0);
    const totalPotentialAnnualSaving = Math.round(totalPotentialDailySaving * 365);

    return {
        list: recommendations,
        totalPotentialDailySaving,
        totalPotentialAnnualSaving
    };
}

/**
 * Interactive What-If Water Savings Simulator Engine.
 * Takes current baseline parameters and tweaks, then calculates simulated consumption.
 */
function simulateWaterSavings(baseInputs, tweaks) {
    // Clone inputs and apply what-if adjustments
    const simulatedInputs = Object.assign({}, baseInputs);

    // Tweak 1: Adjusted Shower Duration
    if (tweaks.showerDuration !== undefined) {
        simulatedInputs.showerDuration = Math.max(2, parseFloat(tweaks.showerDuration) || 0);
    }

    // Tweak 2: Dishwashing Method
    if (tweaks.dishwashingMethod) {
        simulatedInputs.dishwashingMethod = tweaks.dishwashingMethod;
    }

    // Tweak 3: Toilet dual flush conversion
    if (tweaks.toiletType) {
        simulatedInputs.toiletType = tweaks.toiletType;
    }

    // Tweak 4: Garden watering method
    if (tweaks.gardenMethod) {
        simulatedInputs.gardenMethod = tweaks.gardenMethod;
    }

    // Tweak 5: Fix all leaks
    if (tweaks.fixLeaks !== undefined) {
        simulatedInputs.hasLeaks = !tweaks.fixLeaks;
    }

    // Tweak 6: Optimize laundry loads
    if (tweaks.washingMachineLoadsWeek !== undefined) {
        simulatedInputs.washingMachineLoadsWeek = Math.max(1, parseFloat(tweaks.washingMachineLoadsWeek) || 0);
    }

    // Compute baseline and simulated
    const baseline = calculateWaterUsage(baseInputs);
    const simulated = calculateWaterUsage(simulatedInputs);

    const dailySaved = Math.max(0, baseline.totals.daily - simulated.totals.daily);
    const weeklySaved = Math.max(0, baseline.totals.weekly - simulated.totals.weekly);
    const monthlySaved = Math.max(0, baseline.totals.monthly - simulated.totals.monthly);
    const annualSaved = Math.max(0, baseline.totals.annual - simulated.totals.annual);

    const percentSaved = baseline.totals.daily > 0 
        ? Math.round((dailySaved / baseline.totals.daily) * 100) 
        : 0;

    // Tangible real-world environmental equivalents
    const bucketsSavedDaily = Math.round(dailySaved / 15); // standard bucket is ~15 Litres
    const drinkingBottlesWeekly = Math.round(weeklySaved / 1.0); // 1-Litre bottles
    const treesNourishedMonthly = Math.round(monthlySaved / 30); // ~30 Litres per young tree per month

    return {
        baselineDaily: baseline.totals.daily,
        simulatedDaily: simulated.totals.daily,
        dailySaved: Math.round(dailySaved * 10) / 10,
        weeklySaved: Math.round(weeklySaved),
        monthlySaved: Math.round(monthlySaved),
        annualSaved: Math.round(annualSaved),
        percentSaved,
        equivalents: {
            bucketsSavedDaily,
            drinkingBottlesWeekly,
            treesNourishedMonthly
        }
    };
}
