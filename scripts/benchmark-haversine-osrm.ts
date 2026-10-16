/**
 * Benchmark script to compare OSRM performance with and without Haversine filtering
 *
 * This script tests:
 * 1. Scenario A: OSRM for ALL institutions (no haversine filter)
 * 2. Scenario B: OSRM for top 20 nearest institutions (with haversine filter)
 *
 * Run with: npx tsx scripts/benchmark-haversine-osrm.ts
 */

import dotenv from "dotenv";
import path from "path";

// Load .env.local FIRST before any other imports
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { donations, institutions } from "@/app/database/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { fetchOSRMDistances, OSDestination } from "@/lib/utils/osrm";

// Setup database connection directly
const client = neon(process.env.DATABASE_URL!);
const db = drizzle({ client });

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

async function getAllActiveInstitutions() {
  const results = await db
    .select({
      id: donations.id,
      institutionId: institutions.id,
      institutionName: institutions.institutionName,
      institutionLat: institutions.latitude,
      institutionLng: institutions.longitude,
      institutionCity: institutions.city,
    })
    .from(donations)
    .innerJoin(institutions, eq(donations.institutionId, institutions.id))
    .where(
      and(
        eq(donations.status, "ACTIVE"),
        eq(institutions.status, "APPROVED")
      )
    );

  return results;
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
  console.log("║   Haversine + OSRM Performance Benchmark                 ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Test location (Jakarta)
  const userLat = -6.2088;
  const userLng = 106.8456;

  console.log(`\nFetching all active institutions...`);
  const allInstitutions = await getAllActiveInstitutions();

  if (allInstitutions.length === 0) {
    console.log("No active institutions found. Please seed the database first.");
    return;
  }

  console.log(`Found ${allInstitutions.length} active institutions`);

  // Prepare destinations for Scenario A (ALL institutions)
  const allDestinations: OSDestination[] = allInstitutions
    .filter((d) => d.institutionLat != null && d.institutionLng != null)
    .map((d) => ({
      id: d.id,
      lat: d.institutionLat!,
      lng: d.institutionLng!,
    }));

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
    const inst = allInstitutions.find((a) => a.id === d.id);
    const haversineDist = calculateHaversineDistance(userLat, userLng, d.lat, d.lng);
    console.log(
      `  ${i + 1}. ${inst?.institutionName} (${inst?.institutionCity}) - ${haversineDist.toFixed(2)}km`
    );
  });

  // Run Scenario A: ALL institutions (simulate without haversine filter)
  // Limit to max 50 for testing to avoid too long wait time
  const maxTestDestinations = Math.min(allDestinations.length, 50);
  const testAllDestinations = allDestinations.slice(0, maxTestDestinations);

  const scenarioA = await benchmarkOSRM(
    userLat,
    userLng,
    testAllDestinations,
    `A: OSRM for ${maxTestDestinations} institutions (NO Haversine filter)`
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
}

main().catch(console.error);
