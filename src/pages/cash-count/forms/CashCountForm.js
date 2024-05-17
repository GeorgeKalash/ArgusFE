import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CashCountNotes from './CashCountNotesForm'
import { useWindow } from 'src/windows'
import { CCTRXrepository } from 'src/repositories/CCTRXRepository'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { SystemFunction } from 'src/resources/SystemFunction'
import { getStorageData } from 'src/storage/storage'
import { useInvalidate } from 'src/hooks/resource'

export default function CashCountForm({ labels, maxAccess, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const [editMode, setEditMode] = useState(!!recordId)
  const { stack } = useWindow()
  const [isClosed, setIsClosed] = useState(false)
  const [isPosted, setIsPosted] = useState(false)

  const getDefaultDT = async () => {
    const userData = getStorageData('userData')
    const _userId = userData.userId
    const parameters = `_userId=${_userId}&_functionId=${SystemFunction.Transaction}`
    try {
      const { record } = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: parameters
      })

      if (record) {
        formik.setFieldValue('dtId', record.dtId)
      }

      const { record: cashAccountRecord } = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${_userId}&_key=cashAccountId`
      })

      if (cashAccountRecord) {
        const cashAccountId = cashAccountRecord.value

        const { record: cashAccountResult } = await getRequest({
          extension: CashBankRepository.CbBankAccounts.get,
          parameters: `_recordId=${cashAccountId}`
        })
        formik.setFieldValue('cashAccountId', cashAccountId)
        formik.setFieldValue('cashAccountRef', cashAccountResult.reference)
        formik.setFieldValue('cashAccountName', cashAccountResult.name)
      }

      const { record: plantRecord } = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: `_userId=${_userId}&_key=plantId`
      })
      if (plantRecord) {
        formik.setFieldValue('plantId', parseInt(plantRecord.value))
      }
    } catch (error) {}
  }

  const invalidate = useInvalidate({
    endpointId: CCTRXrepository.CashCount.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      plantId: null,
      reference: '',
      cashAccountId: '',
      cashAccountRef: '',
      cashAccountName: '',
      forceNotesCount: false,
      wip: 1,
      status: 1,
      releaseStatus: 1,
      date: new Date(),
      time: '',
      items: [
        {
          id: 1,
          cashCountId: '',
          seqNo: 1,
          currencyId: '',
          currencyName: '',
          currencyRef: '',
          counted: '',
          system: '',
          variation: '',
          flag: '',
          enabled: 'true'
        }
      ],
      currencyNotes: [{ id: 1, seqNo: 1, cashCountId: '', note: '', qty: '', subTotal: '' }]
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const payload = {
        header: {
          recordId: obj.recordId,
          dtId: obj.dtId,
          plantId: obj.plantId,
          shiftId: obj.shiftId,
          currencyId: obj.currencyId,
          cashAccountId: obj.cashAccountId,
          reference: obj.reference,
          date: formatDateToApi(new Date()),
          time: obj.time,
          status: obj.status,
          wip: obj.wip,
          releaseStatus: obj.releaseStatus
        },
        items: obj.items.map(({ id, flag, enabled, cashCountId, ...rest }, index) => ({
          seqNo: index + 1,
          cashCountId: cashCountId,
          ...rest
        })),
        currencyNotes: obj.currencyNotes
      }

      const response = await postRequest({
        extension: CCTRXrepository.CashCount.set2,
        record: JSON.stringify(payload)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        getData(recordId)
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })
  useEffect(() => {
    !editMode && getDefaultDT()
  }, [])

  useEffect(() => {
    getData(recordId)
  }, [recordId])

  const getData = async recordId => {
    try {
      if (recordId) {
        const {
          record: { header, items, currencyNotes }
        } = await getRequest({
          extension: CCTRXrepository.CashCount.get2,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          recordId: header.recordId,
          plantId: header.plantId,
          reference: header.reference,
          cashAccountId: header.cashAccountId,
          cashAccountRef: header.cashAccountRef,
          cashAccountName: header.cashAccountName,
          forceNotesCount: false,
          wip: header.wip,
          status: header.status,
          releaseStatus: header.releaseStatus,
          date: formatDateFromApi(header.date),
          time: header.time,
          items: items.map(({ id, ...rest }, index) => ({
            id: index + 1,
            enabled: true,
            flag: true,
            ...rest
          })),
          currencyNotes: currencyNotes.map(({ qty, note, ...rest }, index) => ({
            id: index + 1,
            qty,
            note,
            subTotal: qty * note,
            ...rest
          }))
        })
      }
    } catch (exception) {}
  }

  const onClose = () => {
    postRequest({
      extension: CCTRXrepository.CashCount.close,
      record: JSON.stringify(formik.values)
    })
      .then(res => {
        if (res?.recordId) {
          toast.success('Record Posted Successfully')
          invalidate()
          setIsClosed(true)
        }
      })
      .catch(error => {})
  }

  const onPost = () => {
    postRequest({
      extension: CCTRXrepository.CashCount.post,
      record: JSON.stringify(formik.values)
    })
      .then(res => {
        if (res?.recordId) {
          toast.success('Record Posted Successfully')
          invalidate()
          setIsPosted(true)
        }
      })
      .catch(error => {})
  }

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.CashAccounts}
      form={formik}
      actions={actions}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={7}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                name='cashAccountRef'
                required
                label={labels.cashAccount}
                valueField='reference'
                displayField='name'
                valueShow='cashAccountRef'
                secondValueShow='cashAccountName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    cashAccountId: newValue?.recordId || '',
                    cashAccountRef: newValue?.reference || '',
                    cashAccountName: newValue?.name || ''
                  })
                }}
                errorCheck={'cashAccountId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={7}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  const plantId = newValue?.recordId || ''
                  formik.setFieldValue('plantId', plantId)
                }}
                error={formik.errors && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={7}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                maxAccess={maxAccess}
                onChange={e => {
                  formik.handleChange(e)
                }}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={7}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={7}>
              <CustomTextField name='time' label={labels.time} value={formik.values.time} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='forceNotesCount'
                    checked={formik.values?.forceNotesCount}
                    onChange={formik.handleChange}
                    disabled={formik.values.items?.length}
                  />
                }
                label={labels.forceNotesCount}
              />
            </Grid>
          </Grid>
        </Fixed>

        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={[
              {
                component: 'resourcecombobox',
                label: labels.currency,
                name: 'currencyId',
                props: {
                  endpointId: SystemRepository.Currency.qry,
                  valueField: 'recordId',
                  displayField: 'reference',
                  mapping: [
                    { from: 'recordId', to: 'currencyId' },
                    { from: 'reference', to: 'currencyRef' },
                    { from: 'name', to: 'currencyName' }
                  ],
                  columnsInDropDown: [
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ],
                  displayFieldWidth: 2
                },
                async onChange({ row: { update, newRow } }) {
                  update({
                    enabled: true
                  })
                }
              },
              {
                component: 'numberfield',
                name: 'counted',
                label: labels.count,
                props: {
                  disabled: formik.values.forceNotesCount && true
                },
                async onChange({ row: { update, newRow } }) {
                  const counted = newRow.counted || 0
                  const system = newRow.system || 0
                  update({
                    variation: system - counted,
                    flag: system === counted ? true : false
                  })
                }
              },
              {
                component: 'numberfield',
                label: labels.system,
                name: 'system'
              },
              {
                component: 'icon',
                label: labels.flag,
                name: 'flag',
                disabled: true
              },
              {
                component: 'button',
                name: 'enabled',
                label: labels.enabled,
                onClick: (e, row) => {
                  stack({
                    Component: CashCountNotes,
                    props: {
                      labels: labels,
                      maxAccess: maxAccess,
                      formik2: formik,
                      row
                    },
                    width: 700,
                    title: labels?.currencyNotes
                  })
                }
              }
            ]}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
