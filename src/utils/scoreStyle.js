export function getScoreStyle(score) {
  if (score >= 75) {
    return {
      label: 'Strong match',
      badge: 'bg-emerald-50 text-emerald-700',
      bar: 'bg-emerald-500',
      stroke: 'stroke-emerald-500',
      text: 'text-emerald-600',
    }
  }
  if (score >= 50) {
    return {
      label: 'Fair match',
      badge: 'bg-amber-50 text-amber-700',
      bar: 'bg-amber-500',
      stroke: 'stroke-amber-500',
      text: 'text-amber-600',
    }
  }
  return {
    label: 'Weak match',
    badge: 'bg-red-50 text-red-700',
    bar: 'bg-red-500',
    stroke: 'stroke-red-500',
    text: 'text-red-600',
  }
}