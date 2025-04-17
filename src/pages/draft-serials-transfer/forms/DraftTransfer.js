import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import Table from 'src/components/Shared/Table'
import ImportSerials from 'src/components/Shared/ImportSerials'
import { SystemChecks } from 'src/resources/SystemChecks'
import { useError } from 'src/error'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'

export default function DraftTransfer({ labels, access, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData, systemChecks } = useContext(ControlContext)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftTransfer,
    access,
    enabled: !recordId
  })

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.DraftTransfer.page
  })

  useEffect(() => {
    if (documentType?.dtId) {
      formik.setFieldValue('dtId', documentType.dtId)
    }
  }, [documentType?.dtId])

  const defUserSiteId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'siteId')?.value)
  const defSiteId = parseInt(defaultsData?.list?.find(obj => obj.key === 'siteId')?.value)

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'dtId', value: documentType?.dtId },
    initialValues: {
      recordId,
      dtId: null,
      reference: '',
      date: new Date(),
      fromSiteId: defUserSiteId || defSiteId || null,
      toSiteId: null,
      notes: '',
      status: 1,
      totalWeight: 0,
      autoSrlNo: true,
      serials: [
        {
          id: 1,
          draftTransferId: recordId || 0,
          srlNo: '',
          metalId: null,
          designId: null,
          itemId: null,
          sku: '',
          itemName: '',
          seqNo: 1,
          weight: 0,
          metalRef: '',
          designRef: ''
        }
      ],
      metalGridData: [],
      itemGridData: []
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      fromSiteId: yup.string().required(),
      toSiteId: yup.string().required(),
      serials: yup.array().of(
        yup.object().shape({
          srlNo: yup.string().test({
            name: 'srlNo-first-row-check',
            test(value, context) {
              const { parent } = context

              if (parent?.id == 1) return true
              if (parent?.id > 1 && !value) return false

              return value
            }
          })
        })
      )
    }),
    onSubmit: async obj => {
      const { serials, date, ...rest } = obj

      const header = {
        ...rest,
        pcs: serials.length,
        date: formatDateToApi(date)
      }

      if (header.fromSiteId === header.toSiteId) {
        toast.error(labels.SameSiteError)

        return
      }

      const updatedRows = formik?.values?.serials
        .filter(row => row.srlNo)
        .map(({ recordId, ...rest }, index) => ({
          ...rest,
          seqNo: index + 1,
          draftTransferId: recordId || 0
        }))

      const DraftTransferPack = {
        header,
        items: updatedRows
      }

      postRequest({
        extension: InventoryRepository.DraftTransfer.set2,
        record: JSON.stringify(DraftTransferPack)
      }).then(async diRes => {
        toast.success(editMode ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(diRes.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(recordId) {
    const diHeader = await getDraftTransfer(recordId)
    const diItems = await getDraftTransferItems(recordId)
    await fillForm(diHeader, diItems)
  }

  async function getDraftTransfer(diId) {
    const res = await getRequest({
      extension: InventoryRepository.DraftTransfer.get,
      parameters: `_recordId=${diId}`
    })

    res.record.date = formatDateFromApi(res?.record?.date)

    return res
  }

  async function getDraftTransferItems(diId) {
    return await getRequest({
      extension: InventoryRepository.DraftTransferSerial.qry,
      parameters: `_draftTransferId=${diId}`
    })
  }

  const jumpToNextLine = systemChecks?.find(item => item.checkId === SystemChecks.POS_JUMP_TO_NEXT_LINE)?.value || false

  const editMode = !!formik.values.recordId
  const isPosted = formik.values.status === 3

  const autoDelete = async row => {
    if (!row?.draftTransferId) return true

    const LastSerPack = {
      draftId: formik?.values?.recordId,
      lineItem: row
    }

    await postRequest({
      extension: InventoryRepository.DraftTransferSerial.del,
      record: JSON.stringify(LastSerPack)
    })

    return true
  }

  async function autoSave(header, lastLine) {
    if (lastLine?.srlNo) {
      lastLine.draftTransferId = header?.recordId

      const LastSerPack = {
        header: header,
        lineItem: lastLine
      }

      const response = await postRequest({
        extension: InventoryRepository.DraftTransferSerial.append,
        record: JSON.stringify(LastSerPack),
        noHandleError: true
      })
      if (response?.error) {
        stackError({
          message: response?.error
        })

        return false
      }
      toast.success(platformLabels.Saved)

      return true
    }
  }

  async function saveHeader(lastLine) {
    const DraftTransferPack = {
      header: {
        ...formik?.values,
        pcs: 0,
        date: formatDateToApi(formik.values.date)
      },
      items: []
    }

    delete DraftTransferPack.header.serials

    const diRes = await postRequest({
      extension: InventoryRepository.DraftTransfer.set2,
      record: JSON.stringify(DraftTransferPack)
    })

    const diHeader = await getDraftTransfer(diRes.recordId)
    formik.setFieldValue('recordId', diRes.recordId)
    formik.setFieldValue('reference', diHeader?.record?.reference)
    formik.setFieldValue('date', diHeader?.record?.date)

    const success = await autoSave(diHeader?.record, lastLine)

    if (success) {
      toast.success(platformLabels.Saved)

      const diItems = await getDraftTransferItems(diRes.recordId)
      await fillForm(diHeader, diItems)

      return true
    } else {
      return false
    }
  }

  const serialsColumns = [
    {
      component: 'textfield',
      label: labels.srlNo,
      name: 'srlNo',
      flex: 2,
      updateOn: 'blur',
      jumpToNextLine: jumpToNextLine,
      disableDuplicate: true,
      propsReducer({ row, props }) {
        return { ...props, readOnly: row?.srlNo }
      },
      async onChange({ row: { update, newRow, oldRow, addRow } }) {
        if (!newRow?.srlNo) {
          return
        }

        if (newRow?.srlNo && newRow.srlNo !== oldRow?.srlNo) {
          const res = await getRequest({
            extension: InventoryRepository.Serial.get2,
            parameters: `_srlNo=${newRow?.srlNo}&_siteId=${formik?.values?.fromSiteId}`
          })

          let lineObj = {
            fieldName: 'srlNo',
            changes: {
              id: newRow.id,
              seqNo: newRow.id,
              draftTransferId: formik?.values?.recordId,
              srlNo: res?.record?.srlNo || '',
              sku: res?.record?.sku || '',
              itemName: res?.record?.itemName || '',
              weight: res?.record?.weight || 0,
              itemId: res?.record?.itemId || null,
              metalId: res?.record?.metalId || null,
              metalRef: res?.record?.metalRef || '',
              designId: res?.record?.designId || null,
              designRef: res?.record?.designRef || ''
            }
          }

          !reCal && setReCal(true)
          addRow(lineObj)

          const successSave = formik?.values?.recordId
            ? await autoSave(formik?.values, lineObj.changes)
            : await saveHeader(lineObj.changes)

          if (!successSave) {
            update({
              ...formik?.initialValues?.serials,
              id: newRow?.id
            })
          }
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.designRef,
      name: 'designRef',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.sku,
      name: 'sku',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.metal,
      name: 'metalRef',
      props: {
        readOnly: true
      }
    }
  ]

  async function onPost() {
    const { serials, ...restValues } = formik.values

    await postRequest({
      extension: InventoryRepository.DraftTransfer.post,
      record: JSON.stringify({
        ...restValues,
        date: formatDateToApi(formik.values.date)
      })
    }).then(() => {
      toast.success(platformLabels.Posted)
      invalidate()
      refetchForm(formik?.values?.recordId)
    })
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.DraftTransfer,
        recordId: formik.values.recordId
      },
      width: 950,
      height: 600,
      title: labels.workflow
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: {
        endPoint: InventoryRepository.BatchDraftTransferSerial.batch,
        draftId: formik?.values?.recordId,
        onCloseimport: fillGrids,
        maxAccess: maxAccess
      },
      width: 550,
      height: 270,
      title: platformLabels.importSerials
    })
  }

  async function onCopy(obj) {
    const { serials, date, ...rest } = obj

    const header = {
      ...rest,
      pcs: serials.length,
      date: formatDateToApi(date)
    }

    if (header.fromSiteId === header.toSiteId) {
      toast.error(labels.SameSiteError)

      return
    }

    const updatedRows = formik?.values?.serials
      .filter(row => row.srlNo)
      .map(({ recordId, ...rest }, index) => ({
        ...rest,
        seqNo: index + 1,
        draftTransferId: recordId || 0
      }))

    const CloneDraftTransferPack = {
      header,
      items: updatedRows
    }

    postRequest({
      extension: InventoryRepository.DraftTransfer.clone,
      record: JSON.stringify(CloneDraftTransferPack)
    }).then(async diRes => {
      toast.success(platformLabels.Saved)
      await refetchForm(diRes.recordId)
      invalidate()
    })
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      disabled: !editMode || isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode || isPosted
    },
    {
      key: 'WorkFlow',
      condition: true,
      onClick: onWorkFlowClick,
      disabled: !editMode
    },
    {
      key: 'Import',
      condition: true,
      onClick: onImportClick,
      disabled: !editMode || isPosted
    },
    {
      key: 'Copy',
      condition: true,
      onClick: () => onCopy(formik?.values),
      disabled: !isPosted
    }
  ]

  async function fillGrids() {
    const diHeader = await getDraftTransfer(formik?.values?.recordId)
    const diItems = await getDraftTransferItems(formik?.values?.recordId)

    const modifiedList = await Promise.all(
      diItems.list?.map(async (item, index) => {
        return {
          ...item,
          id: index + 1
        }
      })
    )

    formik.setValues({
      ...formik.values,
      ...diHeader.record,
      serials: modifiedList.length ? modifiedList : formik?.initialValues?.serials
    })
  }

  async function fillForm(diHeader, diItems) {
    const modifiedList = await Promise.all(
      diItems?.list?.map(async item => {
        return {
          ...item,
          id: item.seqNo
        }
      })
    )

    formik.setValues({
      ...formik.values,
      ...diHeader.record,
      serials: modifiedList.length ? modifiedList : formik?.initialValues?.serials
    })
  }

  async function onChangeDtId(recordId) {
    const dtd = await getRequest({
      extension: InventoryRepository.DocumentTypeDefaults.get,
      parameters: `_dtId=${recordId}`
    })

    formik.setFieldValue('carrierId', dtd?.record?.carrierId || null)
    formik.setFieldValue('fromSiteId', dtd?.record?.siteId || formik?.values?.fromSiteId || null)
    formik.setFieldValue('toSiteId', dtd?.record?.toSiteId || formik?.values?.toSiteId || null)
  }

  useEffect(() => {
    if (formik?.values?.serials?.length) {
      const serials = formik?.values?.serials

      const metalMap = serials.reduce((acc, { metalId, weight, metalRef }) => {
        if (metalId) {
          if (!acc[metalId]) {
            acc[metalId] = { metal: metalRef, pcs: 0, totalWeight: 0 }
          }
          acc[metalId].pcs += 1
          acc[metalId].totalWeight += parseFloat(weight || 0)
        }

        return acc
      }, {})

      Object.keys(metalMap).forEach(metalId => {
        metalMap[metalId].totalWeight = parseFloat(metalMap[metalId].totalWeight.toFixed(2))
      })

      formik.setFieldValue('metalGridData', Object.values(metalMap))

      var seqNo = 0

      const itemMap = serials.reduce((acc, { sku, itemId, itemName, weight }) => {
        if (itemId) {
          if (!acc[itemId]) {
            seqNo++
            acc[itemId] = { sku: sku, pcs: 0, weight: 0, itemName: itemName, seqNo: seqNo }
          }
          acc[itemId].pcs += 1
          acc[itemId].weight = parseFloat((acc[itemId].weight + parseFloat(weight || 0)).toFixed(2))
        }

        return acc
      }, {})

      formik.setFieldValue(
        'itemGridData',
        Object.values(itemMap).sort((a, b) => a.seqNo - b.seqNo)
      )
    }
  }, [formik?.values?.serials])

  const { totalWeight } = formik?.values?.serials?.reduce(
    (acc, row) => {
      const totWeight = parseFloat(row?.weight) || 0

      return {
        totalWeight: reCal ? acc?.totalWeight + totWeight : formik.values?.totalWeight || 0
      }
    },
    { totalWeight: 0 }
  )

  useEffect(() => {
    formik.setFieldValue('totalWeight', totalWeight)
  }, [totalWeight])

  useEffect(() => {
    ;(async function () {
      if (formik?.values?.recordId) {
        await refetchForm(formik?.values?.recordId)
      } else {
        const defaultSiteId = defUserSiteId || defSiteId || null
        formik.setFieldValue('fromSiteId', defaultSiteId)
      }
    })()
  }, [])

  useEffect(() => {
    if (formik?.values?.dtId) {
      onChangeDtId(formik?.values?.dtId)
    }
  }, [formik?.values?.dtId])

  return (
    <FormShell
      resourceId={ResourceIds.DraftTransfer}
      functionId={SystemFunction.DraftTransfer}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      isPosted={isPosted}
      actions={actions}
      editMode={editMode}
      disabledSubmit={isPosted}
      disabledSavedClear={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={SystemRepository.DocumentType.qry}
                    parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.DraftTransfer}`}
                    name='dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dtId', newValue?.recordId)
                      changeDT(newValue)
                    }}
                    error={formik.touched.dtId && Boolean(formik.errors.dtId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='fromSiteId'
                    readOnly={isPosted || formik?.values?.serials?.some(serial => serial.srlNo)}
                    label={labels.fromSite}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    required
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      if (!newValue?.isInactive) {
                        formik.setFieldValue('fromSiteId', newValue?.recordId)
                      } else {
                        formik.setFieldValue('fromSiteId', null)
                        stackError({
                          message: labels.inactiveSite
                        })
                      }
                    }}
                    error={formik.touched.fromSiteId && Boolean(formik.errors.fromSiteId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='reference'
                    label={labels.reference}
                    value={formik?.values?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('reference', '')}
                    error={formik.touched.reference && Boolean(formik.errors.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.Site.qry}
                    name='toSiteId'
                    readOnly={isPosted || formik?.values?.serials?.some(serial => serial.srlNo)}
                    label={labels.toSite}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    required
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      if (!newValue?.isInactive) {
                        formik.setFieldValue('toSiteId', newValue?.recordId)
                      } else {
                        formik.setFieldValue('toSiteId', null)
                        stackError({
                          message: labels.inactiveSite
                        })
                      }
                    }}
                    error={formik.touched.toSiteId && Boolean(formik.errors.toSiteId)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.postingDate}
                    value={formik?.values?.date}
                    onChange={formik.setFieldValue}
                    editMode={editMode}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('date', '')}
                    error={formik.touched.date && Boolean(formik.errors.date)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={AccessControlRepository.NotificationGroup.qry}
                    parameters='filter='
                    name='notificationGroupId'
                    label={labels.notificationGroup}
                    valueField='recordId'
                    displayField='name'
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('notificationGroupId', newValue?.recordId)
                    }}
                    error={formik.touched.notificationGroupId && Boolean(formik.errors.notificationGroupId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={LogisticsRepository.LoCarrier.qry}
                    name='carrierId'
                    label={labels.carrier}
                    values={formik.values}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    required
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('carrierId', newValue?.recordId)
                    }}
                    error={formik.touched.carrierId && Boolean(formik.errors.carrierId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextArea
                name='notes'
                label={labels.description}
                value={formik.values.notes}
                rows={4}
                editMode={editMode}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('notes', e.target.value)}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('serials', value)
              action === 'delete' && setReCal(true)
            }}
            value={formik.values.serials || []}
            error={formik.errors.serials}
            columns={serialsColumns}
            name='serials'
            maxAccess={maxAccess}
            disabled={isPosted || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'serials').length > 0}
            allowDelete={!isPosted}
            allowAddNewLine={
              formik.values?.serials?.length === 0 ||
              !!formik.values?.serials?.[formik.values?.serials?.length - 1]?.srlNo
            }
            autoDelete={autoDelete}
            form={formik}
          />
          <Grid container spacing={16}>
            <Grid item xs={8}>
              <Grid container>
                <Grid item xs={12} height={125} sx={{ display: 'flex', flex: 1 }}>
                  <Table
                    gridData={{ count: 1, list: formik?.values?.metalGridData }}
                    maxAccess={access}
                    columns={[
                      { field: 'metal', headerName: labels.metal, flex: 1 },
                      { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                      { field: 'totalWeight', headerName: labels.totalWeight, type: 'number', flex: 1 }
                    ]}
                    rowId={['metal']}
                    pagination={false}
                  />
                </Grid>
                <Grid item xs={12} height={125} sx={{ display: 'flex', flex: 1 }}>
                  <Table
                    columns={[
                      { field: 'seqNo', headerName: labels.seqNo, type: 'number', flex: 1 },
                      { field: 'sku', headerName: labels.sku, flex: 1 },
                      { field: 'itemName', headerName: labels.itemName, flex: 2 },
                      { field: 'pcs', headerName: labels.pcs, type: 'number', flex: 1 },
                      { field: 'weight', headerName: labels.weight, type: 'number', flex: 1 }
                    ]}
                    gridData={{ count: 1, list: formik?.values?.itemGridData }}
                    rowId={['sku']}
                    maxAccess={access}
                    pagination={false}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='totalWeight'
                    maxAccess={maxAccess}
                    label={labels.totalWeight}
                    value={totalWeight}
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
