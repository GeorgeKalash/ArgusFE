import { useState, useContext, useEffect } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const CurrenciesTable = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const [data, setData] = useState([])

  const handleSubmit = async () => {
    const resultObject = {
      accountId: recordId,
      items: data
        .filter(row => row.checked)
        .map(row => ({
          accountId: recordId,
          currencyId: row.currencyId,
        }))
    }

    await postRequest({
      extension: FinancialRepository.AccountCurrencies.set2,
      record: JSON.stringify(resultObject)
    })

    toast.success(platformLabels.Updated)
  }

  useEffect(() => {
    ;(async function () {
      if (!recordId) return
      
      const res = await getRequest({
        extension: SystemRepository.Currency.qry,
        parameters: `_startAt=0&_pageSize=1000&_filter=`
      })

      const checkedRes = await getRequest({
        extension: FinancialRepository.AccountCurrencies.qry,
        parameters: `_accountId=${recordId}`
      })

      const checkedIds = new Set(
        (checkedRes?.list || []).map(item => item.currencyId)
      )

      const mergedData = (res?.list || []).map(currency => ({
        currencyId: currency.recordId,
        currencyRef: currency.reference,
        currencyName: currency.name,
        checked: checkedIds.has(currency.recordId)
      }))

      setData(mergedData)
    })()
  }, [recordId])

  const columns = [
    {
      field: 'currencyRef',
      headerName: labels.currencyRef,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: labels.currencyName,
      flex: 2
    }
  ]

  return (
    <Form onSave={handleSubmit} maxAccess={maxAccess} fullSize>
      <VertLayout>
        <Grow>
          <Table
            columns={columns}
            gridData={{ list: data }}
            rowId={['currencyId']}
            maxAccess={maxAccess}
            showCheckboxColumn={true}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CurrenciesTable