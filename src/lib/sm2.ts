export interface SM2State {
  easeFactor: number
  repetitions: number
  intervalDays: number
}

export interface SM2Result extends SM2State {
  nextReview: string
}

export function responseTimeToQuality(ms: number): number {
  if (ms < 1000) return 5
  if (ms < 2000) return 4
  if (ms < 4000) return 3
  if (ms < 8000) return 2
  if (ms < 10000) return 1
  return 0
}

export function updateSM2(state: SM2State, quality: number): SM2Result {
  let { easeFactor, repetitions, intervalDays } = state

  easeFactor = easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  easeFactor = Math.max(1.3, easeFactor)

  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }
    repetitions++
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + intervalDays)

  return {
    easeFactor,
    repetitions,
    intervalDays,
    nextReview: nextReview.toISOString().slice(0, 10),
  }
}

export const DEFAULT_SM2_STATE: SM2State = {
  easeFactor: 2.5,
  repetitions: 0,
  intervalDays: 1,
}
