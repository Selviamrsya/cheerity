/**
 * Benchmark script to compare OSRM performance with and without Haversine filtering
 * Uses MOCK DATA for demonstration without database connection
 *
 * This script tests:
 * 1. Scenario A: OSRM for ALL institutions (no haversine filter)
 * 2. Scenario B: OSRM for top 20 nearest institutions (with haversine filter)
 *
 * Run with: npx tsx scripts/benchmark-haversine-osrm-mock.ts
 */

import { fetchOSRMDistances, OSDestination } from "@/lib/utils/osrm";

// Haversine formula (same as in donation.ts)
function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mock data: Generate random institutions around Jakarta
function generateMockInstitutions(count: number, centerLat: number, centerLng: number): OSDestination[] {
  const institutions: OSDestination[] = [];

  for (let i = 0; i < count; i++) {
    // Generate random coordinates within ~50km of center
    const latOffset = (Math.random() - 0.5) * 0.5; // ~25km
    const lngOffset = (Math.random() - 0.5) * 0.5; // ~25km

    institutions.push({
      id: `inst-${i + 1}`,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
    });
  }

  return institutions;
}

async function benchmarkOSRM(
  userLat: number,
  userLng: number,
  destinations: OSDestination[],
  scenarioName: string
) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`SCENARIO: ${scenarioName}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`User Location: ${userLat}, ${userLng}`);
  console.log(`Number of destinations: ${destinations.length}`);

  const startTime = Date.now();

  const results = await fetchOSRMDistances(userLat, userLng, destinations);

  const endTime = Date.now();
  const totalTimeMs = endTime - startTime;
  const avgTimePerRequest = totalTimeMs / destinations.length;

  console.log(`Total time: ${totalTimeMs}ms (${(totalTimeMs / 1000).toFixed(2)}s)`);
  console.log(`Average time per request: ${avgTimePerRequest.toFixed(2)}ms`);
  console.log(`Successful requests: ${results.filter(r => r.drivingDistanceKm !== null).length}/${results.length}`);

  // Show some sample results
  console.log(`\nSample results (first 5):`);
  results.slice(0, 5).forEach((r, i) => {
    const dest = destinations.find(d => d.id === r.id);
    const haversineDist = dest ? calculateHaversineDistance(userLat, userLng, dest.lat, dest.lng) : 0;
    console.log(
      `  ${i + 1}. ID: ${r.id} | Haversine: ${haversineDist.toFixed(2)}km | OSRM: ${r.drivingDistanceKm?.toFixed(2) ?? 'null'}km`
    );
  });

  return {
    totalTimeMs,
    avgTimePerRequest,
    successfulRequests: results.filter(r => r.drivingDistanceKm !== null).length,
    totalRequests: results.length,
  };
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Haversine + OSRM Performance Benchmark (MOCK DATA)     ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Test location (Harapan Indah)
  const userLat = -6.1836289;
  const userLng = 106.9773;

  // Generate mock institutions
  const totalInstitutions = 50; // Generate 50 mock institutions
  console.log(`\nGenerating ${totalInstitutions} mock institutions around Jakarta...`);
  const allDestinations = generateMockInstitutions(totalInstitutions, userLat, userLng);

  // Calculate Haversine distances and sort
  const withHaversine = allDestinations.map((dest) => ({
    ...dest,
    haversineDistance: calculateHaversineDistance(userLat, userLng, dest.lat, dest.lng),
  }));

  withHaversine.sort((a, b) => a.haversineDistance - b.haversineDistance);

  // Prepare destinations for Scenario B (top 20 nearest)
  const top20Destinations: OSDestination[] = withHaversine.slice(0, 20).map((d) => ({
    id: d.id,
    lat: d.lat,
    lng: d.lng,
  }));

  console.log(`\nTop 20 nearest institutions (by Haversine):`);
  top20Destinations.forEach((d, i) => {
    const haversineDist = calculateHaversineDistance(userLat, userLng, d.lat, d.lng);
    console.log(
      `  ${i + 1}. ID: ${d.id} - Haversine: ${haversineDist.toFixed(2)}km`
    );
  });

  // Run Scenario A: ALL institutions (simulate without haversine filter)
  const scenarioA = await benchmarkOSRM(
    userLat,
    userLng,
    allDestinations,
    `A: OSRM for ${allDestinations.length} institutions (NO Haversine filter)`
  );

  // Run Scenario B: Top 20 nearest (with haversine filter)
  const scenarioB = await benchmarkOSRM(
    userLat,
    userLng,
    top20Destinations,
    `B: OSRM for 20 nearest institutions (WITH Haversine filter)`
  );

  // Calculate comparison
  console.log(`\n${"=".repeat(60)}`);
  console.log("COMPARISON RESULTS");
  console.log(`${"=".repeat(60)}`);
  console.log(`Scenario A (No filter):`);
  console.log(`  - Destinations: ${scenarioA.totalRequests}`);
  console.log(`  - Total time: ${scenarioA.totalTimeMs}ms (${(scenarioA.totalTimeMs / 1000).toFixed(2)}s)`);
  console.log(`\nScenario B (With Haversine filter):`);
  console.log(`  - Destinations: ${scenarioB.totalRequests}`);
  console.log(`  - Total time: ${scenarioB.totalTimeMs}ms (${(scenarioB.totalTimeMs / 1000).toFixed(2)}s)`);
  console.log(`\nImprovement:`);
  const timeSaved = scenarioA.totalTimeMs - scenarioB.totalTimeMs;
  const timeSavedPercent = ((timeSaved / scenarioA.totalTimeMs) * 100).toFixed(1);
  const requestReduction = scenarioA.totalRequests - scenarioB.totalRequests;
  const requestReductionPercent = ((requestReduction / scenarioA.totalRequests) * 100).toFixed(1);

  console.log(`  - Time saved: ${timeSaved}ms (${timeSavedPercent}%)`);
  console.log(`  - Requests reduced: ${requestReduction} (${requestReductionPercent}%)`);
  console.log(`\nConclusion: Haversine filtering reduces OSRM load by ~${requestReductionPercent}%`);

  console.log(`\n${"=".repeat(60)}`);
  console.log("EXPLANATION");
  console.log(`${"=".repeat(60)}`);
  console.log("Haversine formula calculates straight-line distance (as the crow flies)");
  console.log("This is fast and can be done in SQL without external API calls.");
  console.log("");
  console.log("OSRM calculates actual driving distance along roads");
  console.log("This requires external API calls and is rate-limited (200ms delay).");
  console.log("");
  console.log("By filtering to top 20 nearest using Haversine first:");
  console.log("1. We reduce OSRM API calls from 50 to 20 (60% reduction)");
  console.log("2. We reduce total time proportionally");
  console.log("3. We still get accurate driving distances for the most relevant results");
  console.log(`${"=".repeat(60)}`);
}

main().catch(console.error);
