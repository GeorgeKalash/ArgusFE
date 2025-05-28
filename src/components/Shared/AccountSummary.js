import React, { useContext, useEffect, useState } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceLookup } from './ResourceLookup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from './Layouts/Fixed'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import ResourceComboBox from './ResourceComboBox'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormShell from './FormShell'
import CustomButton from '../Inputs/CustomButton'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { SystemRepository } from 'src/repositories/SystemRepository'
import Table from './Table'
import { RGFinancialRepository } from 'src/repositories/RGFinancialRepository'

export default function AccountSummary({ clientId, moduleId }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.AccountSummary
  })
  const baseColumns = [{ field: 'days', headerName: labels.days, flex: 1, type: 'number' }]
  const [columns, setColumns] = useState(baseColumns)

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      clientId: null,
      clientRef: '',
      clientName: '',
      agpId: null,
      moduleId
    }
  })

  async function getDynamicColumns() {
    let currencyItems
    let colcounts = 2
    let dynamicColumns = [...baseColumns]

    const currecnyList = await getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: `_filter=`
    })
    if (moduleId == 1) currencyItems = currecnyList?.list?.filter(currency => currency.sale)
    else if (moduleId == 2) currencyItems = currecnyList?.list?.filter(currency => currency.purchase)

    if (currencyItems.length == 0) return

    currencyItems?.forEach((cur, index) => {
      dynamicColumns.push({
        field: `column${index + 1}`,
        headerName: cur.reference,
        flex: 1,
        type: 'number'
      })
    })
    setColumns(dynamicColumns)

    const agingLegList = await getRequest({
      extension: FinancialRepository.AgingLeg.qry,
      parameters: `_agpId=${formik.values.agpId}`
    })

    let listObject = agingLegList?.list?.map(item => {
      const obj = new Array(currencyItems.length + 2).fill(0)
      obj[0] = null
      obj[1] = item.days

      return obj
    })

    const promises = (currencyItems || []).map(cur =>
      getRequest({
        extension: RGFinancialRepository.AccountSummary.AccFI405b,
        parameters: `_agpId=${formik.values.agpId}&_currencyId=${cur.recordId}&_accountId=${formik.values.clientId}`
      }).then(summaryRes => ({ summaryRes }))
    )

    const results = await Promise.all(promises)

    results.forEach(({ summaryRes }) => {
      summaryRes?.list?.forEach(y => {
        listObject?.forEach(ob => {
          if (ob[1] == y.seqDays) ob[colcounts] = y.amount
        })
      })
      colcounts++
    })

    const modifiedListObj = new Array(currencyItems.length + 2).fill(null)
    for (let co = 2; co < currencyItems.length + 2; co++) {
      let sum = 0
      listObject?.map(ob => {
        sum += Number(ob[co] || 0)
      })
      modifiedListObj[co] = sum
    }

    const newList = listObject
      .filter(item => item[1] !== null)
      .map(item => {
        const [_, days, ...columns] = item
        const rowObject = { days }
        columns.forEach((value, index) => {
          rowObject[`column${index + 1}`] = value
        })

        return rowObject
      })

    let totalRow = {}
    for (let i = 0; i < currencyItems.length; i++) {
      totalRow[`column${i + 1}`] = modifiedListObj[i + 2] ?? 0
    }
    newList.push(totalRow)

    setData({ list: newList })
  }

  useEffect(() => {
    ;(async function () {
      if (clientId && moduleId) {
        const account = await getRequest({
          extension: FinancialRepository.Account.get,
          parameters: `_recordId=${clientId}`
        })
        formik.setFieldValue('clientId', account?.record?.recordId)
        formik.setFieldValue('clientRef', account?.record?.reference)
        formik.setFieldValue('clientName', account?.record?.name)
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.AccountSummary}
      form={formik}
      maxAccess={access}
      editMode={true}
      isSaved={false}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                name='clientId'
                label={labels.account}
                valueField='reference'
                displayField='name'
                valueShow='clientRef'
                secondValueShow='clientName'
                form={formik}
                readOnly={formik.values.clientId}
                required
                maxAccess={access}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('clientId', newValue?.recordId || null)
                  formik.setFieldValue('clientName', newValue?.name)
                  formik.setFieldValue('clientRef', newValue?.reference)
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={FinancialRepository.AgingProfile.qry}
                parameters={`_startAt=0&_pageSize=1000&filter=`}
                name='agpId'
                label={labels.agingProfile}
                values={formik.values}
                valueField='recordId'
                displayField={'name'}
                maxAccess={access}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('agpId', newValue?.recordId || null)
                  if (!newValue?.recordId) setData({ list: [] })
                }}
              />
            </Grid>
            <Grid item xs={5}>
              <ResourceComboBox
                datasetId={DataSets.FI_AGING_MODULE}
                label={labels.module}
                name='moduleId'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={access}
                required
                readOnly={formik.values.moduleId}
                onChange={(event, newValue) => {
                  formik.setFieldValue('moduleId', newValue?.key || null)
                }}
              />
            </Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={getDynamicColumns}
                image={'preview.png'}
                disabled={!formik.values.agpId && !formik.values.moduleId && !formik.values.clientId}
                tooltipText={platformLabels.Preview}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table columns={columns} gridData={data} isLoading={false} pagination={false} />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
