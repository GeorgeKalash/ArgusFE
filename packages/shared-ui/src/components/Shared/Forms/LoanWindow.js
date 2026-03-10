import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import LoansForm from '@argus/shared-ui/src/components/Shared/Forms/LoansForm'
import DeductionTab from '@argus/shared-ui/src/components/Shared/Forms/DeductionTab'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const LoanWindow = ({ recordId, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId,
    isClosed: false,
    loanAmount: 0,
    effectiveDate: null
  })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.Loans,
    editMode: !!recordId
  })
  useSetWindow({ title: labels.Loans, window })

  const tabs = [{ label: labels.LoanInfo }, { label: labels.Deduction, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <LoansForm labels={labels} setStore={setStore} store={store} maxAccess={access} window={window} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <DeductionTab labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}

LoanWindow.width = 800
LoanWindow.height = 600

export default LoanWindow
