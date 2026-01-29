const service = 'CS.asmx/'

export const companyStructureRepository = {
  DivisionFilters: {
    qry: service + 'qryDI'
  },
  BranchFilters: {
    qry: service + 'qryBR'
  },
  CompanyPositions: {
    qry: service + 'qryPO'
  },
  DepartmentFilters: {
    qry: service + 'qryDE'
  }
}
