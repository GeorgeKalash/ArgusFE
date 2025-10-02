import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useContext, useState } from 'react'
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

  const [store, setStore] = useState({
    recordId,
    currency: ''
  })

  const {
    query: { data }
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.Salaries,
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.SalaryDetails.qry
  })

  async function fetchGridData() {
    const response = await getRequest({
      extension: EmployeeRepository.SalaryDetails.qry,
      parameters: `_salaryId=${recordId}&_type=0`
    })

    return response.list.map(record => ({
      ...record,
      currencyAmount: `${store.currency} ${getFormattedNumber(record.fixedAmount, 2)}`,
      pct: record?.pct ? `${parseFloat(record.pct).toFixed(2)}%` : null
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
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <EntitlementsTab
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          salaryInfo={salaryInfo}
          data={data?.filter(record => record.type == 1)}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <DeductionsTab
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          salaryInfo={salaryInfo}
          data={data?.filter(record => record.type == 2)}
        />
      </CustomTabPanel>
    </>
  )
}
