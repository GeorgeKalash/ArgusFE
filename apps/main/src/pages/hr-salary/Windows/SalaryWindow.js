import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useContext, useRef, useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import SalaryTab from '../forms/SalaryTab'
import EntitlementsTab from '../forms/EntitlementsTab'
import DeductionsTab from '../forms/DeductionsTab'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'

export default function SalaryWindow({ labels, maxAccess, recordId, employeeInfo, window }) {
  const { getRequest } = useContext(RequestsContext)

  const [activeTab, setActiveTab] = useState(0)
  const [salaryInfo, setSalaryInfo] = useState({ recordId })
  const [modifiedData, setModifiedData] = useState(null)

  const [store, setStore] = useState({
    recordId,
    currency: ''
  })

  const refetchSalaryTab = useRef(false)
  const saveWholePack = useRef(false)

  const {
    query: { data }
  } = useResourceQuery({
    enabled: !!(recordId && store.currency),
    datasetId: ResourceIds.Salaries,
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.SalaryDetails.qry,
    params: { disabledReqParams: true, maxAccess }
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
    setModifiedData(null)

    return response.list.map(record => ({
      ...record,
      currencyAmount: `${store.currency} ${getFormattedNumber(record.fixedAmount, 2)}`,
      concatenatedPct: record?.pct ? `${parseFloat(record.pct).toFixed(2)}%` : `0.00%`
    }))
  }

  function reCalcNewAmounts(basicSalary, eAmount) {
    const updatedData = (data || []).map(record => {
      if (!record.includeInTotal) return record

      const salary = parseFloat(String(basicSalary).replace(/,/g, ''))
      const entitlement = parseFloat(String(eAmount || 0).replace(/,/g, ''))

      if (!record.pct || record.pct == 0) return record

      let fixedAmount
      const pctValue = parseFloat(record.pct) / 100

      if (record.type === 1) fixedAmount = pctValue * salary
      else if (record.type === 2) fixedAmount = pctValue * (salary + (record.pctOf == 1 ? 0 : entitlement))

      return { ...record, fixedAmount, currencyAmount: `${store.currency} ${getFormattedNumber(fixedAmount, 2)}` }
    })
    setModifiedData(updatedData)
    saveWholePack.current = true
  }

  const tabs = [
    { label: labels.salary },
    { label: labels.entitlement, disabled: !store.recordId },
    { label: labels.deduction, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <SalaryTab
          labels={labels}
          maxAccess={maxAccess}
          setStore={setStore}
          store={store}
          employeeInfo={employeeInfo}
          setSalaryInfo={setSalaryInfo}
          data={modifiedData || data}
          refetchSalaryTab={refetchSalaryTab}
          reCalcNewAmounts={reCalcNewAmounts}
          saveWholePack={saveWholePack}
          window={window}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <EntitlementsTab
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          salaryInfo={salaryInfo}
          data={modifiedData || data}
          refetchSalaryTab={refetchSalaryTab}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <DeductionsTab
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          salaryInfo={salaryInfo}
          data={modifiedData || data}
          refetchSalaryTab={refetchSalaryTab}
        />
      </CustomTabPanel>
    </>
  )
}
