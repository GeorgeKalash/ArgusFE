function calculateFixed(pct, pctOf, basicSalary, eAmount) {
  const salary = parseFloat(String(basicSalary).replace(/,/g, '')) || 0

  let result = 0
  if (pctOf == 1) result = (pct / 100) * salary
  else result = (pct / 100) * (salary + parseFloat(eAmount) || 0)

  return result
}

export { calculateFixed }
