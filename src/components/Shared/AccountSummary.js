import React, { useContext, useEffect, useState } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceLookup } from './ResourceLookup'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from './Layouts/Fixed'
import { VertLayout } from './Layouts/VertLayout'
import ResourceComboBox from './ResourceComboBox'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import CustomButton from '../Inputs/CustomButton'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import Table from './Table'
import { RGFinancialRepository } from 'src/repositories/RGFinancialRepository'
import useSetWindow from 'src/hooks/useSetWindow'
import { formatDateForGetApI } from 'src/lib/date-helper'
import CustomDatePicker from '../Inputs/CustomDatePicker'
import CustomTextField from '../Inputs/CustomTextField'

export default function AccountSummary({ accountId, moduleId, date, window }) {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [summary, setSummary] = useState(null)

  useSetWindow({ title: platformLabels.AccountSummary, window })

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.AccountSummary
  })
  const baseColumns = [{ field: 'days', headerName: labels.days, flex: 1, type: 'number' }]
  const baseSummaryColumns = [{ field: '', headerName: '', flex: 1 }]
  const [columns, setColumns] = useState(baseColumns)
  const [summaryColumns, setSummaryColumns] = useState(baseSummaryColumns)

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      accountId: null,
      accountRef: '',
      accountName: '',
      date: date || null,
      agpId: null,
      moduleId
    }
  })

  async function getDynamicColumns() {
    const res = await getRequest({
      extension: RGFinancialRepository.AccountSummary.get,
      parameters: `_accountId=${accountId}&_agpId=${formik.values.agpId}&_endDate=${formatDateForGetApI(date)}`
    })

    formik.setFieldValue('spRef', res?.record?.spRef || '')
    formik.setFieldValue('spName', res?.record?.spName || '')

    const summaryData = {
      list: [
        {
          label: labels.creditLimit,
          metal: Number(res?.record?.credit_limit_reporting_metal || 0).toFixed(2),
          base: Number(res?.record?.credit_limit_baseCurrency || 0).toFixed(2)
        },
        {
          label: labels.totalBalance,
          metal: Number(res?.record?.balance_reporting_metal || 0).toFixed(2),
          base: Number(res?.record?.balance_baseCurrency || 0).toFixed(2)
        },
        {
          label: labels.margin,
          metal: Math.abs(
            Number(res?.record?.credit_limit_reporting_metal || 0) - Number(res?.record?.balance_reporting_metal || 0)
          ).toFixed(2),
          base: Math.abs(
            Number(res?.record?.credit_limit_baseCurrency || 0) - Number(res?.record?.balance_baseCurrency || 0)
          ).toFixed(2)
        }
      ]
    }

    const summaryColumns = [
      {
        field: 'label',
        headerName: '',
        flex: 1
      },
      {
        field: 'metal',
        headerName: res?.record?.reportMetalRef,
        flex: 1
      },
      {
        field: 'base',
        headerName: res?.record?.baseCurrencyRef,
        flex: 1
      }
    ]

    setSummary(summaryData)
    setSummaryColumns(summaryColumns)

    const agingProfiles = res?.record?.agingProfiles || []

    if (!agingProfiles.length) {
      setColumns([...baseColumns])
      setData({ list: [] })

      return
    }

    const currencies = [...new Set(agingProfiles.map(i => i.currencyRef).filter(Boolean))]

    const dynamicColumns = [...baseColumns]

    currencies.forEach((cur, index) => {
      dynamicColumns.push({
        field: `column${index + 1}`,
        headerName: cur,
        flex: 1,
        type: 'number'
      })
    })
    setColumns(dynamicColumns)

    const agingRows = [...new Map(agingProfiles.filter(i => i.seqDays !== -1).map(i => [i.seqDays, i])).values()].sort(
      (a, b) => a.seqDays - b.seqDays
    )

    const rows = agingRows.map(row => {
      const rowObject = { days: row.seqDays }

      currencies.forEach((cur, index) => {
        const value = agingProfiles
          .filter(i => i.seqDays === row.seqDays && i.currencyRef === cur)
          .reduce((sum, i) => sum + Number(i.amount || 0), 0)

        rowObject[`column${index + 1}`] = value.toFixed(2)
      })

      return rowObject
    })

    const totalRow = {}

    currencies.forEach((cur, index) => {
      const total = agingProfiles.some(i => i.seqDays === -1 && i.currencyRef === cur)
        ? agingProfiles
            .filter(i => i.seqDays === -1 && i.currencyRef === cur)
            .reduce((s, i) => s + Number(i.amount || 0), 0)
        : agingProfiles
            .filter(i => i.seqDays !== -1 && i.currencyRef === cur)
            .reduce((s, i) => s + Number(i.amount || 0), 0)

      totalRow[`column${index + 1}`] = total.toFixed(2)
    })

    rows.push(totalRow)

    setData({ list: rows })
  }

  useEffect(() => {
    ;(async function () {
      if (accountId && moduleId) {
        const account = await getRequest({
          extension: FinancialRepository.Account.get,
          parameters: `_recordId=${accountId}`
        })
        formik.setFieldValue('accountId', account?.record?.recordId)
        formik.setFieldValue('accountRef', account?.record?.reference)
        formik.setFieldValue('accountName', account?.record?.name)
      }
    })()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} p={2}>
          <Grid item xs={6}>
            <ResourceLookup
              endpointId={FinancialRepository.Account.snapshot}
              name='accountId'
              label={labels.account}
              valueField='reference'
              displayField='name'
              valueShow='accountRef'
              secondValueShow='accountName'
              form={formik}
              readOnly={formik.values.accountId && formik.values.moduleId}
              required
              maxAccess={access}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              onChange={async (event, newValue) => {
                formik.setFieldValue('accountId', newValue?.recordId || null)
                formik.setFieldValue('accountName', newValue?.name || '')
                formik.setFieldValue('accountRef', newValue?.reference || '')
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomDatePicker
              name='date'
              label={labels.date}
              readOnly
              value={date}
              onChange={formik.setFieldValue}
              maxAccess={access}
              onClear={() => formik.setFieldValue('date', null)}
              error={formik.touched.date && Boolean(formik.errors.date)}
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
              disabled={!formik.values.agpId || !formik.values.moduleId || !formik.values.accountId}
              tooltipText={platformLabels.Preview}
            />
          </Grid>

          <Grid item xs={3}>
            <CustomTextField
              name='spRef'
              label={labels.spRef}
              value={formik.values.spRef}
              maxAccess={access}
              readOnly
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('spRef', '')}
              error={formik.touched.spRef && Boolean(formik.errors.spRef)}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='spName'
              label={labels.spName}
              value={formik.values.spName}
              maxAccess={access}
              readOnly
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('spName', '')}
              error={formik.touched.spName && Boolean(formik.errors.spName)}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grid container spacing={1} sx={{ height: '100%' }}>
        <Grid item xs={4} sx={{ display: 'flex' }}>
          <Table name='summaryTable' columns={summaryColumns} gridData={summary} pagination={false} />
        </Grid>
        <Grid item xs={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Table name='agingProfilesTable' columns={columns} gridData={data} pagination={false} />
        </Grid>
      </Grid>
    </VertLayout>
  )
}

AccountSummary.width = 1000
AccountSummary.height = 500
