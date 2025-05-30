const service = 'RG.FI.asmx/'

export const RGFinancialRepository = {
  FiOpeningBalance: {
    gen: service + 'genOBA'
  },
  FiAging: {
    qry: service + 'FI404'
  },
  AccountSummary: {
    AccFI405b: service + 'FI405b'
  }
}
