type LevelPerformanceInput = {
  synergyCount: number
  totalCost: number
  palyerLevelCompletionTimeMs: number
}

type LevelPerformanceResult = {
  estimatedOutperformedPercent: number
  expectedTimeSeconds: number
  excellentTimeSeconds: number
  standardDeviationSeconds: number
}

/** Приближение функции распределения стандартной нормали. */
function standardNormalCdf(z: number): number {
  if (z === 0) return 0.5

  const x = Math.abs(z)
  const t = 1 / (1 + 0.2316419 * x)

  const polynomial =
    t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))

  const tail = (Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)) * polynomial

  const probability = z > 0 ? 1 - tail : tail

  return Math.min(1, Math.max(0, probability))
}

export function calculateCompleteonGlobalStatus({
  synergyCount,
  totalCost,
  palyerLevelCompletionTimeMs,
}: LevelPerformanceInput): LevelPerformanceResult {
  if (!Number.isSafeInteger(synergyCount) || synergyCount <= 0) {
    throw new Error('Количество синергий должно быть целым числом больше нуля.')
  }

  if (!Number.isFinite(totalCost) || totalCost < 0) {
    throw new Error('Стоимость уровня должна быть конечным неотрицательным числом.')
  }

  const actualTimeSeconds = palyerLevelCompletionTimeMs / 1000

  const averageSynergyCost = totalCost / synergyCount

  const expectedTimeSeconds = (0.133 * averageSynergyCost + 3.6819) * synergyCount
  const excellentTimeSeconds = (0.1042 * averageSynergyCost + 1.6737) * synergyCount

  const standardDeviationSeconds = (expectedTimeSeconds - excellentTimeSeconds) / 3

  if (
    !Number.isFinite(expectedTimeSeconds) ||
    !Number.isFinite(excellentTimeSeconds) ||
    !Number.isFinite(standardDeviationSeconds) ||
    standardDeviationSeconds <= 0
  ) {
    throw new Error('Параметры выходят за допустимые пределы расчёта.')
  }

  const z = (expectedTimeSeconds - actualTimeSeconds) / standardDeviationSeconds

  const percent = 100 * standardNormalCdf(z)

  return {
    estimatedOutperformedPercent: percent > 99 ? 99 : percent,
    expectedTimeSeconds,
    excellentTimeSeconds,
    standardDeviationSeconds,
  }
}
