import React, { useContext, useState } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { useFormik } from 'formik'
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
import * as yup from 'yup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import Table from './Table'
import { RGFinancialRepository } from 'src/repositories/RGFinancialRepository'

export default function AccountSummary({ clientInfo, moduleId }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.AccountSummary
  })
  const baseColumns = [{ field: 'days', headerName: labels.days, flex: 1, type: 'number' }]

  const [columns, setColumns] = useState([
    {
      field: 'days',
      headerName: labels.days,
      flex: 1
    }
  ])

  const formik = useFormik({
    initialValues: {
      clientId: clientInfo?.clientId,
      clientRef: clientInfo?.clientRef,
      clientName: clientInfo?.clientName,
      agpId: null,
      moduleId
    },
    validateOnChange: true,
    validationSchema: yup.object({
      agpId: yup.number().required()
    })
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

    for (const cur of currencyItems || []) {
      const summaryRes = await getRequest({
        extension: RGFinancialRepository.AccountSummary.AccFI405b,
        parameters: `_agpId=${formik.values.agpId}&_currencyId=${cur.recordId}&_accountId=${formik.values.clientId}`
      })
      summaryRes?.list?.forEach(y => {
        listObject?.forEach(ob => {
          if (ob[1] == y.seqDays) ob[colcounts] = y.amount
        })
      })
      colcounts++
    }

    const Lobj = new Array(currencyItems.length + 2).fill(null)
    for (let co = 2; co < currencyItems.length + 2; co++) {
      let sum = 0
      listObject?.map(ob => {
        sum += Number(ob[co] || 0)
      })
      Lobj[co] = sum
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

    let totalRow = []
    for (let i = 0; i < currencyItems.length; i++) {
      totalRow[`column${i + 1}`] = Lobj[i + 2] ?? 0
    }
    newList.push(totalRow)

    setData({ list: newList })
  }

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
          <Grid container spacing={4}>
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
                readOnly
                required
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
                error={formik?.touched?.agpId && Boolean(formik.errors?.agpId)}
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
                readOnly
              />
            </Grid>
            <Grid item xs={1}>
              <CustomButton
                onClick={getDynamicColumns}
                image={'preview.png'}
                disabled={!formik.values.agpId}
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
