import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const buildProps = (ctx = {}) => ({
  ...(ctx.props || {})
})

const createResource = loader => ({
  loader,
  buildProps
})

export const ResourceRegistry = {
  [ResourceIds.Designer]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/DesignerForm')
  ),
  [ResourceIds.Sketch]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/Forms/SketchForm')
  ),
  [ResourceIds.ThreeDDesign]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/Forms/ThreeDDesignForm')
  ),
  [ResourceIds.ThreeDPrint]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/Forms/ThreeDPrintForm')
  ),
  [ResourceIds.RightToWork]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/CompanyRightToWork')
  ),
  [ResourceIds.EmployeeRightToWork]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/EmployeeRightToWork')
  ),
  [ResourceIds.EmployeesBirthday]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/EmployeesBirthday')
  ),
  [ResourceIds.Probation]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/ProbationEnd')
  ),
  [ResourceIds.Salaries]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/SalaryChange')
  ),
  [ResourceIds.CasePleads]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/CasePleads')
  ),
  [ResourceIds.LeaveRequestODOM]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/LeavingSoon')
  ),
  [ResourceIds.EmploymentReview]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/EmploymentReview')
  ),
  [ResourceIds.EmployeeChart]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/RetirementAge')
  ),
  [ResourceIds.TermEndDate]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/TermEndDate')
  ),
  [ResourceIds.WorkAnniversary]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/HrApplets/WorkAnniversary')
  )
}
