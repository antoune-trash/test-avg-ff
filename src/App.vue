<script setup lang="ts">
import { calculateCompleteonGlobalStatus } from './calculateLevelPerformance'
import { computed, ref } from 'vue'

const synergyCount = ref(10)
const totalCost = ref(100)
const playerLevelCompletionTimeS = ref(160)

const canCalculate = computed(() => {
  return synergyCount.value > 0 && totalCost.value > 0 && playerLevelCompletionTimeS.value > 0
})

const result = ref<number | null>(null)
const resultText = computed(() => {
  return result.value !== null ? `Лучше чем у ${result.value.toFixed(0)}% пользователей` : null
})

const expectedTimeSeconds = ref<number | null>(null)
const excellentTimeSeconds = ref<number | null>(null)
const standardDeviationSeconds = ref<number | null>(null)

const valuesStr = computed(() => {
  const _expectedTimeSeconds = expectedTimeSeconds.value
    ? `Rср ${expectedTimeSeconds.value.toFixed(0)}`
    : ''
  const _excellentTimeSeconds = excellentTimeSeconds.value
    ? `Rотл ${excellentTimeSeconds.value.toFixed(0)}`
    : ''
  const _standardDeviationSeconds = standardDeviationSeconds.value
    ? `Сигма ${standardDeviationSeconds.value.toFixed(0)}`
    : ''

  return `${_expectedTimeSeconds}, ${_excellentTimeSeconds}, ${_standardDeviationSeconds}`.trim()
})

function calculateGlaobalStatus() {
  if (!canCalculate.value) {
    result.value = null
    return
  }

  const _result = calculateCompleteonGlobalStatus({
    synergyCount: synergyCount.value,
    totalCost: totalCost.value,
    palyerLevelCompletionTimeMs: playerLevelCompletionTimeS.value * 1000,
  })

  expectedTimeSeconds.value = _result.expectedTimeSeconds
  excellentTimeSeconds.value = _result.excellentTimeSeconds
  standardDeviationSeconds.value = _result.standardDeviationSeconds

  result.value = _result.estimatedOutperformedPercent
}
</script>

<template>
  <div>
    <div>
      <label style="font-weight: 600">Данные уровня</label>

      <div>
        <label for="level-cost-total"> Суммарная стоимость уровня </label>
        <input id="level-cost-total" type="number" v-model="totalCost" />
      </div>

      <div>
        <label for="syn-count"> Количество синергий в уровне </label>
        <input id="syn-count" type="number" v-model="synergyCount" />
      </div>
    </div>

    <div style="margin-top: 6px">
      <Label style="font-weight: 600">Данные прохождения</Label>

      <div class="flex pag-3">
        <label for="test-time"> Время прохождения (R тест, секунды) </label>
        <input id="test-time" type="number" v-model="playerLevelCompletionTimeS" />
      </div>
    </div>

    <button style="margin-top: 10px" @click="calculateGlaobalStatus" :disabled="!canCalculate">
      Посчитать
    </button>

    <div v-if="resultText" style="margin-top: 10px">
      <label>Результат</label>

      <h3 style="color: #2e7920; margin-top: 6px; margin-bottom: 6px">
        {{ resultText }}
      </h3>
      <p style="margin-top: 6px">{{ valuesStr }}</p>
    </div>
  </div>
</template>

<style scoped></style>
