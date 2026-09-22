// 8320 → "8.3s"   |   95400 → "1:35.4"
export const formatDuration = (ms = 0) => {
  const totalSeconds = Math.max(0, ms) / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds - minutes * 60
  if (minutes === 0) return `${seconds.toFixed(1)}s`
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`
}
