/**
 * ShopNET Movies - Benchmark Statistical Analysis & Metric Calculation
 * Calculates true effective costs, reliability ratios, and latency distributions.
 */

/**
 * Calculates median from an array of numbers
 * @param {number[]} numbers
 * @returns {number}
 */
export function calculateMedian(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

/**
 * Aggregates benchmark results per provider
 * @param {import('./types.js').BenchmarkResultRecord[]} records
 * @param {import('./providers/catalog.js').CANDIDATE_PROVIDERS[0]} providerCatalogItem
 * @returns {import('./types.js').ProviderAggregateMetrics}
 */
export function aggregateProviderMetrics(records, providerCatalogItem) {
  const providerRecords = records.filter(r => r.model === providerCatalogItem.modelId);
  const totalTests = providerRecords.length;

  if (totalTests === 0) {
    throw new Error(`No benchmark records found for provider model: ${providerCatalogItem.modelId}`);
  }

  const successCount = providerRecords.filter(r => r.status === 'SUCCESS' || r.status === 'RETRY_SUCCESS').length;
  const usableCount = providerRecords.filter(r => r.isUsable).length;
  const failureCount = providerRecords.filter(r => r.status === 'FAILED').length;

  // Sum total spent (including retries and failed attempts which incur billing)
  const totalCostUsd = providerRecords.reduce((sum, r) => sum + r.providerCostUsd, 0);
  const costPerAttemptUsd = totalCostUsd / totalTests;

  // Effective cost per usable clip = total dollars spent / total usable deliverables produced
  // If no usable clips were produced, effective cost is undefined/infinity
  const effectiveCostPerUsableClipUsd = usableCount > 0
    ? totalCostUsd / usableCount
    : 0;

  const successRatePercent = (successCount / totalTests) * 100;
  const usableRatePercent = (usableCount / totalTests) * 100;
  const failureRatePercent = (failureCount / totalTests) * 100;

  const latencies = providerRecords.map(r => r.latencyMs);
  const medianLatencyMs = calculateMedian(latencies);

  // Dimension averages
  const avgPromptAdherence = providerRecords.reduce((sum, r) => sum + (r.evaluationScores?.promptAdherence || 0), 0) / totalTests;
  const avgMotionQuality = providerRecords.reduce((sum, r) => sum + (r.evaluationScores?.motionQuality || 0), 0) / totalTests;
  const avgCharacterConsistency = providerRecords.reduce((sum, r) => sum + (r.evaluationScores?.characterConsistency || 0), 0) / totalTests;
  const avgCulturalAuthenticity = providerRecords.reduce((sum, r) => sum + (r.evaluationScores?.culturalAuthenticity || 0), 0) / totalTests;

  return {
    provider: providerCatalogItem.name,
    model: providerCatalogItem.modelId,
    totalTests,
    successCount,
    usableCount,
    failureCount,
    totalCostUsd: Number(totalCostUsd.toFixed(4)),
    costPerAttemptUsd: Number(costPerAttemptUsd.toFixed(4)),
    effectiveCostPerUsableClipUsd: Number(effectiveCostPerUsableClipUsd.toFixed(4)),
    successRatePercent: Number(successRatePercent.toFixed(1)),
    usableRatePercent: Number(usableRatePercent.toFixed(1)),
    failureRatePercent: Number(failureRatePercent.toFixed(1)),
    medianLatencyMs: Math.round(medianLatencyMs),
    avgPromptAdherence: Number(avgPromptAdherence.toFixed(2)),
    avgMotionQuality: Number(avgMotionQuality.toFixed(2)),
    avgCharacterConsistency: Number(avgCharacterConsistency.toFixed(2)),
    avgCulturalAuthenticity: Number(avgCulturalAuthenticity.toFixed(2)),
    commercialSuitabilityNote: providerCatalogItem.baselineMetrics.commercialSuitability
  };
}
