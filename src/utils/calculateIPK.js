export function calculateIPK(nilaiList) {
  if (!nilaiList || nilaiList.length === 0) return '0.00'
  const totalBobot = nilaiList.reduce((sum, n) => sum + n.bobot * (n.mata_kuliah?.sks ?? 0), 0)
  const totalSKS = nilaiList.reduce((sum, n) => sum + (n.mata_kuliah?.sks ?? 0), 0)
  return totalSKS > 0 ? (totalBobot / totalSKS).toFixed(2) : '0.00'
}

export function calculateIPS(nilaiList, semester) {
  const filtered = nilaiList.filter((n) => n.semester === semester)
  return calculateIPK(filtered)
}

export function totalSKS(nilaiList) {
  return nilaiList.reduce((sum, n) => sum + (n.mata_kuliah?.sks ?? 0), 0)
}

export function ipkColor(ipk) {
  const v = parseFloat(ipk)
  if (v >= 3.5) return 'text-emerald-600'
  if (v >= 3.0) return 'text-blue-600'
  if (v >= 2.5) return 'text-amber-600'
  return 'text-red-600'
}
