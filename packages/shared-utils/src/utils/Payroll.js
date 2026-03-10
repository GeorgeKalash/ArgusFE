function calculateFixed(pct, pctOf, basicSalary, eAmount) {
  const salary = parseFloat(String(basicSalary).replace(/,/g, '')) || 0

  let result = 0
  if (pctOf == 1) result = (pct / 100) * salary
  else result = (pct / 100) * (salary + parseFloat(eAmount) || 0)

  return result
}

async function ChangeEntitlementsAmount(entitlements, basicSalary) {
  let sum = 0
  entitlements?.map(record => {
    if (record.includeInTotal) {
      if (record.pct == 0) {
        sum += parseFloat(record.fixedAmount)

        return record
      } else {
        const x = (parseFloat(record.pct) / 100) * parseFloat(String(basicSalary).replace(/,/g, ''))
        sum += x

        return { ...record, fixedAmount: x }
      }
    }

    return record
  })

  return sum
}
async function ChangeDeductionsAmount(deductions, basicSalary, eAmount) {
  let sum = 0

  deductions?.map(record => {
    if (record.includeInTotal) {
      if (record.pct == 0) {
        sum += parseFloat(record.fixedAmount)

        return record
      } else {
        let x
        if (record.pctOf == 1) x = (parseFloat(record.pct) / 100) * parseFloat(String(basicSalary).replace(/,/g, ''))
        else
          x =
            (parseFloat(record.pct) / 100) *
            (parseFloat(String(basicSalary).replace(/,/g, '')) + parseFloat(String(eAmount).replace(/,/g, '')))

        sum += x

        return { ...record, fixedAmount: x }
      }
    }
  })

  return sum
}

export { calculateFixed, ChangeEntitlementsAmount, ChangeDeductionsAmount }
