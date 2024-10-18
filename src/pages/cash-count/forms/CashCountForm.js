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
import { CashCountRepository } from 'src/repositories/CashCountRepository'
import { formatDateFromApi, formatDateToApi, getTimeInTimeZone } from 'src/lib/date-helper'
import { SystemFunction } from 'src/resources/SystemFunction'
import { getStorageData } from 'src/storage/storage'
import { useInvalidate } from 'src/hooks/resource'
import WorkFlow from 'src/components/Shared/WorkFlow'
import GenerateTransferForm from './GenerateTransferForm'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { ControlContext } from 'src/providers/ControlContext'

export default function CashCountForm({ labels, maxAccess: access, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [editMode, setEditMode] = useState(!!recordId)
  const { stack } = useWindow()
  const [isClosed, setIsClosed] = useState(false)
  const [isPosted, setIsPosted] = useState(false)

  const getDefaultDT = async () => {
    const userData = getStorageData('userData')

    const _userId = userData.userId
    const parameters = `_userId=${_userId}&_functionId=${SystemFunction.CashCountTransaction}`
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
      const cashAccountId = cashAccountRecord?.value
      if (cashAccountId) {
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
    endpointId: CashCountRepository.CashCountTransaction.qry
  })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.CashCountTransaction,
    access: access,
    hasDT: false,
    enabled: !editMode
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
      forceNoteCount: false,
      wip: 1,
      status: 1,
      releaseStatus: '',
      date: new Date(),
      startTime: '',
      endTime: '',
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
          enabled: false,
          currencyNotes: []
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      cashAccountRef: yup.string().required(' '),
      plantId: yup.string().required(' '),
      items: yup
        .array()
        .of(
          yup.object().shape({
            currencyId: yup.string().required(' '),
            counted: yup.string().required(' ')
          })
        )
        .required(' ')
    }),
    onSubmit: async obj => {
      try {
        const payload = {
          header: {
            recordId: obj.recordId,
            dtId: obj.dtId,
            plantId: obj.plantId,
            shiftId: obj.shiftId,
            currencyId: obj.currencyId,
            cashAccountId: obj.cashAccountId,
            forceNoteCount: obj.forceNoteCount,
            reference: obj.reference,
            date: formatDateToApi(new Date()),
            startTime: obj.startTime,
            endTime: obj.endTime,
            status: obj.status,
            wip: obj.wip,
            releaseStatus: obj.releaseStatus
          },
          items: obj.items.map(({ id, flag, enabled, cashCountId, currencyNotes, ...rest }, index) => ({
            seqNo: index + 1,
            cashCountId: cashCountId || 0,
            currencyNotes: currencyNotes || [],
            ...rest
          }))
        }

        const response = await postRequest({
          extension: CashCountRepository.CashCountTransaction.set2,
          record: JSON.stringify(payload)
        })
        const _recordId = response.recordId
        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          getData(_recordId)
        } else toast.success(platformLabels.Edited)
        setEditMode(true)

        invalidate()
      } catch (error) {}
    }
  })

  useEffect(() => {
    !editMode && getDefaultDT()
    getTime()
  }, [])

  useEffect(() => {
    getData(recordId)
  }, [recordId])

  const getData = async recordId => {
    try {
      if (recordId) {
        const {
          record: { header, items }
        } = await getRequest({
          extension: CashCountRepository.CashCountTransaction.get2,
          parameters: `_recordId=${recordId}`
        })
        setIsClosed(header.wip === 2 ? true : false)
        setIsPosted(header.status === 3 ? true : false)
        formik.setValues({
          recordId: header.recordId,
          plantId: header.plantId,
          reference: header.reference,
          cashAccountId: header.cashAccountId,
          cashAccountRef: header.cashAccountRef,
          cashAccountName: header.cashAccountName,
          forceNoteCount: header.forceNoteCount,
          wip: header.wip,
          status: header.status,
          releaseStatus: header.releaseStatus,
          date: formatDateFromApi(header.date),
          startTime: header.startTime && getTimeInTimeZone(header.startTime),
          endTime: header.endTime && getTimeInTimeZone(header.endTime),
          items: items.map(({ seqNo, variation, ...rest }, index) => ({
            id: seqNo,
            seqNo,
            enabled: true,
            variation,
            flag: variation === 0 ? true : false,
            ...rest
          }))
        })
      }
    } catch (exception) {}
  }

  async function onReopen() {
    const obj = formik.values

    const data = {
      recordId: obj.recordId,
      dtId: obj.dtId,
      plantId: obj.plantId,
      shiftId: obj.shiftId,
      currencyId: obj.currencyId,
      cashAccountId: obj.cashAccountId,
      reference: obj.reference,
      date: obj.date,
      startTime: obj.startTime,
      status: obj.status,
      wip: obj.wip,
      releaseStatus: obj.releaseStatus
    }

    const res = await postRequest({
      extension: CashCountRepository.CashCountTransaction.reopen,
      record: JSON.stringify(data)
    }).then(() => {
      if (res.recordId) {
        toast.success(platformLabels.Reopened)
        invalidate()
        getData(obj?.recordId)
      }
    })
  }

  const onClose = () => {
    postRequest({
      extension: CashCountRepository.CashCountTransaction.close,
      record: JSON.stringify(formik.values)
    }).then(res => {
      if (res?.recordId) {
        toast.success(platformLabels.Closed)
        invalidate()
        getData(res?.recordId)
      }
    })
  }

  const onPost = () => {
    postRequest({
      extension: CashCountRepository.CashCountTransaction.post,
      record: JSON.stringify(formik.values)
    }).then(res => {
      if (res?.recordId) {
        toast.success(platformLabels.Posted)
        invalidate()
        setIsPosted(true)
      }
    })
  }
  function openTransferForm() {
    stack({
      Component: GenerateTransferForm,
      props: {
        labels: labels,
        cashCountId: formik.values.recordId,
        fromPlantId: formik.values.plantId,
        maxAccess
      },
      width: 600,
      height: 300,
      title: labels.bulk
    })
  }

  const onWorkFlowClick = async () => {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.CashCountTransaction,
        recordId: formik.values.recordId
      },
      width: 950,
      title: 'Workflow'
    })
  }

  const actions = [
    {
      key: 'Bulk',
      condition: true,
      onClick: openTransferForm,
      disabled: !isPosted
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !editMode || formik.values.status !== 4 || isPosted
    },
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed || !editMode || formik.values.releaseStatus === 3
    },
    {
      key: 'Account Balance',
      condition: true,
      onClick: 'onClickAC',
      disabled: false
    }
  ]

  const getTime = async () => {
    const { record } = await getRequest({
      extension: SystemRepository.TimeZone?.get,
      parameters: ``
    })
    if (record) {
      !editMode && formik.setFieldValue('startTime', getTimeInTimeZone(record?.utcDate, record?.timeZone))
    }
  }

  const getSystem = async currencyId => {
    const cashAccountId = formik.values?.cashAccountId
    if (currencyId && cashAccountId) {
      const { record } = await getRequest({
        extension: CashBankRepository.AccountBalance.get,
        parameters: `_currencyId=` + currencyId + `&_cashAccountId=` + formik.values?.cashAccountId
      })
      if (record) {
        return record.balance
      }
    }
  }

  return (
    <FormShell
      actions={actions}
      resourceId={ResourceIds.CashCountTransaction}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      functionId={SystemFunction.CashCountTransaction}
      disabledSubmit={isClosed}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                name='cashAccountRef'
                required
                label={labels.cashAccount}
                readOnly={isPosted || isClosed}
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
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={6}>
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
                readOnly={isPosted || isClosed}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  const plantId = newValue?.recordId || ''
                  formik.setFieldValue('plantId', plantId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='startTime'
                label={labels.startTime}
                value={formik.values.startTime}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={e => {
                  formik.handleChange(e)
                }}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField name='endTime' label={labels.endTime} value={formik.values.endTime} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='forceNoteCount'
                    checked={formik.values?.forceNoteCount}
                    onChange={formik.handleChange}
                    disabled={
                      formik.values.items &&
                      (formik.values?.items[0]?.currencyId || formik.values?.items[0]?.currencyId)
                    }
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
                  readOnly: isPosted || isClosed,
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
                propsReducer({ row, props }) {
                  return { ...props, readOnly: row.currencyNotes?.length > 0 }
                },
                async onChange({ row: { update, newRow } }) {
                  if (newRow?.currencyId) {
                    const balance = await getSystem(newRow?.currencyId)
                    update({
                      enabled: true,
                      system: balance
                    })
                  }
                }
              },
              {
                component: 'numberfield',
                name: 'counted',
                label: labels.count,
                props: {
                  readOnly: formik.values.forceNoteCount || isPosted || isClosed
                },
                async onChange({ row: { update, newRow } }) {
                  const counted = newRow.counted || 0
                  const system = newRow.system || 0

                  update({
                    variation: counted - system,
                    flag: system === counted ? true : false
                  })
                }
              },
              {
                component: 'numberfield',
                label: labels.system,
                name: 'system',
                props: {
                  readOnly: true
                }
              },
              {
                component: 'icon',
                label: labels.flag,
                name: 'flag'
              },
              {
                component: 'button',
                name: 'enabled',
                label: labels.currencyNotes,
                onClick: (e, row, update, updateRow) => {
                  stack({
                    Component: CashCountNotes,
                    props: {
                      readOnly: isPosted || isClosed,
                      labels: labels,
                      maxAccess: maxAccess,
                      forceNoteCount: formik.values.forceNoteCount,
                      row,
                      updateRow
                    },
                    width: 700,
                    title: labels?.currencyNotes
                  })
                }
              }
            ]}
            allowDelete={!isClosed || (!isPosted && !isClosed)}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
