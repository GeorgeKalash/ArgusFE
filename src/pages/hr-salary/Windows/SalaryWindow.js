import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useContext, useRef, useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import SalaryTab from '../forms/SalaryTab'
import EntitlementsTab from '../forms/EntitlementsTab'
import DeductionsTab from '../forms/DeductionsTab'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { getFormattedNumber } from 'src/lib/numberField-helper'

export default function SalaryWindow({ labels, maxAccess, recordId, employeeInfo }) {
  const [activeTab, setActiveTab] = useState(0)
  const [salaryInfo, setSalaryInfo] = useState({})
  const { getRequest } = useContext(RequestsContext)
  const refetchSalaryTab = useRef(false)

  const [store, setStore] = useState({
    recordId,
    currency: ''
  })

  const {
    query: { data }
  } = useResourceQuery({
    enabled: !!recordId && store.currency,
    datasetId: ResourceIds.Salaries,
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.SalaryDetails.qry
  })

  async function fetchGridData() {
    const response = await getRequest({
      extension: EmployeeRepository.SalaryDetails.qry,
      parameters: `_salaryId=${recordId}&_type=0`
    })

    setStore(prevStore => ({
      ...prevStore,
      maxSeqNo: response?.list?.length > 0 ? Math.max(...response?.list?.map(r => r.seqNo ?? 0)) : 0
    }))

    return response.list.map(record => ({
      ...record,
      currencyAmount: `${store.currency} ${getFormattedNumber(record.fixedAmount, 2)}`,
      concatenatedPct: record?.pct ? `${parseFloat(record.pct).toFixed(2)}%` : `0.00%`
    }))
  }

  const tabs = [
    { label: labels.salary },
    { label: labels.entitlement, disabled: !store.recordId },
    { label: labels.deduction, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <SalaryTab
          labels={labels}
          maxAccess={maxAccess}
          setStore={setStore}
          store={store}
          employeeInfo={employeeInfo}
          setSalaryInfo={setSalaryInfo}
          data={data}
          refetchSalaryTab={refetchSalaryTab}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <EntitlementsTab
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          salaryInfo={salaryInfo}
          data={data}
          refetchSalaryTab={refetchSalaryTab}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <DeductionsTab
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          salaryInfo={salaryInfo}
          data={data}
          refetchSalaryTab={refetchSalaryTab}
        />
      </CustomTabPanel>
    </>
  )
}
