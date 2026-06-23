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
    import('@argus/shared-ui/src/components/Shared/CompanyRightToWork')
  ),
  [ResourceIds.EmployeeRightToWork]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/EmployeeRightToWork')
  ),
  [ResourceIds.EmployeesBirthday]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/EmployeesBirthday')
  ),
  [ResourceIds.Probation]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/ProbationEnd')
  ),
  [ResourceIds.Salaries]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/SalaryChange')
  ),
  [ResourceIds.CasePleads]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/CasePleads')
  ),
  [ResourceIds.LeaveRequestODOM]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/LeavingSoon')
  ),
  [ResourceIds.EmploymentReview]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/EmploymentReview')
  ),
  [ResourceIds.EmployeeChart]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/RetirementAge')
  ),
  [ResourceIds.TermEndDate]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/TermEndDate')
  ),
  [ResourceIds.WorkAnniversary]: createResource(() =>
    import('@argus/shared-ui/src/components/Shared/WorkAnniversary')
  )
}
