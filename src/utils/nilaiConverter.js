export function angkaToHuruf(angka) {
  const n = parseFloat(angka)
  if (n >= 85) return { huruf: 'A', bobot: 4.0 }
  if (n >= 75) return { huruf: 'B+', bobot: 3.5 }
  if (n >= 70) return { huruf: 'B', bobot: 3.0 }
  if (n >= 65) return { huruf: 'C+', bobot: 2.5 }
  if (n >= 60) return { huruf: 'C', bobot: 2.0 }
  if (n >= 50) return { huruf: 'D', bobot: 1.0 }
  return { huruf: 'E', bobot: 0.0 }
}

export function hurufColor(huruf) {
  const map = {
    A: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950',
    'B+': 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    B: 'text-blue-500 bg-blue-50 dark:text-blue-300 dark:bg-blue-950',
    'C+': 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950',
    C: 'text-amber-500 bg-amber-50 dark:text-amber-300 dark:bg-amber-950',
    D: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
    E: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  }
  return map[huruf] ?? 'text-slate-600 bg-slate-100'
}
