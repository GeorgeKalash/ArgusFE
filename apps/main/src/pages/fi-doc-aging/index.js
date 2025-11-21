import * as yup from 'yup'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Grid } from '@mui/material'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useContext, useRef, useState } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { RGFinancialRepository } from '@argus/repositories/src/repositories/RGFinancialRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import RebuildAgingForm from '../fi-rebuild-aging/Forms/RebuildAgingForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const calculateDays = str => Math.floor((new Date() - new Date(parseInt(str.match(/\d+/)?.[0] || '0'))) / 86400000) - 1

const DocumentAging = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const fullRowData = useRef([])

  const [rowData, setRowData] = useState()

  const { stack } = useWindow()
  const amountAppliedRef = useRef()

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.DocumentsAging
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      accountId: null,
      profileId: null,
      amountDue: null,
      currencyId: null,
      amountApplied: null,
      balance: null,
      aging: [],
      agingTree: []
    },
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      accountId: yup.string().required(),
      profileId: yup.string().required(),
      currencyId: yup.string().required()
    }),
    onSubmit: async values => {
      const response = await getRequest({
        extension: RGFinancialRepository.FiAging.qry,
        parameters: `_params=1|${values?.profileId}^5|${values?.accountId}^6|${values?.currencyId}`
      })

      const legs = response?.record?.legs || []
      const amounts = response?.record?.agings?.[0]?.amounts || []

      const agingList = legs.map(leg => {
        const firstMatch = amounts.find(a => a.seqNo === leg.seqNo)

        return {
          age: leg.caption,
          balance: Math.round(Math.abs(firstMatch?.amount || 0))
        }
      })

      const totalBalance = agingList.reduce((sum, row) => sum + row.balance, 0)

      formik.setFieldValue('aging', agingList)
      formik.setFieldValue('balance', totalBalance)

      if (!!values?.accountId && !!values?.currencyId && !!values?.profileId) {
        const res2 = await getRequest({
          extension: RGFinancialRepository.DocumentAging.AgingFI406a,
          parameters: `_accountId=${values?.accountId}&_currencyId=${values?.currencyId}&_profileId=${values?.profileId}`
        })

        const childrenRes = await getRequest({
          extension: RGFinancialRepository.DocumentAging.AgingFI406b,
          parameters: `_accountId=${values?.accountId}&_currencyId=${values?.currencyId}&_profileId=${values?.profileId}`
        })

        const listAPL = await getRequest({
          extension: FinancialRepository.Apply.qry,
          parameters: `_accountId=${values?.accountId}&_currencyId=${values?.currencyId}`
        })

        const mappings = (listAPL?.list || []).map(node => ({
          ...node,
          fromId: `${node.fromFunctionId}|${node.fromRecordId}`,
          toId: `${node.toFunctionId}|${node.toRecordId}`
        }))

        const childrenList = childrenRes?.list || []

        let totalApplied = 0

        const parentRows = (res2?.list || []).map(parent => {
          const parentId = `${parent.functionId}|${parent.recordId}`
          const hasChildren = mappings.some(m => m.toId === parentId)

          return {
            ...parent,
            amount: Math.round(Math.abs(parent.amount || 0)),
            balance: Math.round(Math.abs(parent.balance || 0)),
            reference: parent.reference,
            days: calculateDays(parent.date),
            level: 0,
            isExpanded: hasChildren,
            hasChildren
          }
        })

        const allRows = parentRows.flatMap(parent => {
          const parentId = `${parent.functionId}|${parent.recordId}`

          const childRows = mappings
            .filter(m => m.toId === parentId)
            .map(map => {
              const child = childrenList.find(c => `${c.functionId}|${c.recordId}` === map.fromId)

              if (!child) {
                return null
              }

              totalApplied += child.amount || 0

              return {
                ...child,
                amount: Math.round(Math.abs(child.amount || 0)),
                balance: Math.round(Math.abs(child.balance || 0)),
                reference: child.reference,
                days: calculateDays(child.date),
                level: 1,
                parent: parent.reference
              }
            })
            .filter(Boolean)

          return [parent, ...(parent.isExpanded ? childRows : [])]
        })

        amountAppliedRef.current = totalApplied

        fullRowData.current = allRows

        const visibleRows = allRows.flatMap(row =>
          row.level === 0 ? [row, ...(row.isExpanded ? allRows.filter(c => c.parent === row.reference) : [])] : []
        )

        setRowData(visibleRows)
        formik.setFieldValue('agingTree', visibleRows)
      }
    }
  })

  const columns = [
    {
      field: 'age',
      headerName: labels.age,
      flex: 1
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1,
      type: 'number'
    }
  ]


  const columnsAgingTree = [
    {
      field: 'reference',
      headerName: labels.documentReference,
      flex: 1,
      isTree: true
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'days',
      headerName: labels.days,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number',
      props: { decimalScale: 0, allowNegative: false }
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1,
      type: 'number',
      props: { decimalScale: 0, allowNegative: false }
    }
  ]

  const { labels: _labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.RebuildAging
  })

  const confirmationRebuild = () => {
    stack({
      Component: RebuildAgingForm,
      props: {
        _labels,
        access: maxAccess,
        values: formik.values
      },
      width: 450,
      height: 160,
      title: platformLabels.Confirmation
    })
  }

  const totalAmount = formik.values?.agingTree?.reduce((amount, row) => {
    const amountValue = parseFloat(row.amount?.toString().replace(/,/g, '')) || null

    return amount + amountValue
  }, null)

  const balance = totalAmount - amountAppliedRef.current || null

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={FinancialRepository.Account.snapshot}
              name='accountId'
              label={labels.account}
              valueField='reference'
              displayField='name'
              valueShow='accountRef'
              secondValueShow='accountName'
              form={formik}
              required
              readOnly={formik.values.aging.length > 0 || formik.values.agingTree.length > 0}
              maxAccess={access}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              onChange={(_, newValue) => {
                formik.setFieldValue('accountName', newValue?.name || '')
                formik.setFieldValue('accountRef', newValue?.reference || '')
                formik.setFieldValue('accountId', newValue?.recordId || null)
              }}
              errorCheck={'accountId'}
            />
          </Grid>
          <Grid item xs={6}>
            <ResourceComboBox
              endpointId={FinancialRepository.AgingProfile.qry}
              parameters={`_startAt=0&_pageSize=1000&filter=`}
              name='profileId'
              label={labels.profile}
              values={formik.values}
              valueField='recordId'
              readOnly={formik.values.aging.length > 0 || formik.values.agingTree.length > 0}
              displayField={'name'}
              maxAccess={access}
              required
              onChange={(_, newValue) => {
                formik.setFieldValue('profileId', newValue?.recordId || null)
              }}
              error={formik.touched.profileId && Boolean(formik.errors.profileId)}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomNumberField
              name='amountDue'
              label={labels.amountDue}
              value={totalAmount}
              maxAccess={access}
              readOnly
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('amountDue', '')}
              error={formik.touched.amountDue && Boolean(formik.errors.amountDue)}
            />
          </Grid>
          <Grid item xs={6}>
            <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}
              name='currencyId'
              label={labels.currency}
              readOnly={formik.values.aging.length > 0 || formik.values.agingTree.length > 0}
              valueField='recordId'
              displayField={'name'}
              values={formik.values}
              required
              maxAccess={access}
              onChange={(_, newValue) => {
                formik.setFieldValue('currencyId', newValue?.recordId || null)
              }}
              error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomNumberField
              name='amountApplied'
              label={labels.amountApplied}
              value={amountAppliedRef.current}
              maxAccess={access}
              readOnly
            />
          </Grid>
          <Grid item xs={0.5}>
            <CustomButton
              onClick={() => {
                formik.handleSubmit()
              }}
              tooltipText={platformLabels.Preview}
              image={'preview.png'}
              color='#231f20'
            />
          </Grid>
          <Grid item xs={0.5}>
            <CustomButton
              onClick={async () => {
                formik.resetForm()
                setRowData([])
                amountAppliedRef.current = null
                formik.setFieldValue('balance', null)
                await formik.validateForm()
                formik.setTouched({
                  accountId: true,
                  profileId: true,
                  currencyId: true
                })
              }}
              label={platformLabels.Clear}
              tooltipText={platformLabels.Clear}
              image={'clear.png'}
              color='#f44336'
            />
          </Grid>
          <Grid item xs={0.5}>
            <CustomButton
              onClick={confirmationRebuild}
              label={platformLabels.RebuildButton}
              tooltipText={platformLabels.RebuildButton}
              image={'rebuild.png'}
              disabled={!formik.values.accountId}
              color='#231f20'
            />
          </Grid>
          <Grid item xs={4.5}></Grid>
          <Grid item xs={6}>
            <CustomNumberField
              name='balance'
              label={labels.balance}
              value={balance}
              maxAccess={access}
              readOnly
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('balance', null)}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Grid container spacing={2} sx={{ display: 'flex', flex: 1 }}>
          <Grid item xs={3} sx={{ display: 'flex' }}>
            <Table
              name='aging'
              columns={columns}
              gridData={{ list: formik.values.aging }}
              rowId={['recordId']}
              pagination={false}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={9} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Table
              name='agingTree'
              columns={columnsAgingTree}
              setRowData={setRowData}
              field='reference'
              fullRowData={fullRowData}
              gridData={{ list: rowData }}
              rowId={['recordId']}
              pagination={false}
              maxAccess={access}
            />
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}

export default DocumentAging
