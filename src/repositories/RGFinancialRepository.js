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
  },
  DocumentAging: {
    AgingFI406a: service + 'FI406a',
    AgingFI406b: service + 'FI406b'
  }
}
