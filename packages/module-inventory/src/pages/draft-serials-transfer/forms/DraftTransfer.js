import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import WorkFlow from '@argus/shared-ui/src/components/Shared/WorkFlow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentType } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import ImportSerials from '@argus/shared-ui/src/components/Shared/ImportSerials'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import { useError } from '@argus/shared-providers/src/providers/error'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import MaterialsTransferForm from '@argus/shared-ui/src/components/Shared/Forms/MaterialsTransferForm'

export default function DraftTransfer({ labels, access, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, userDefaults, systemChecks } = useContext(DefaultsContext)
  const [reCal, setReCal] = useState(false)

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftTransfer,
    access,
    enabled: !recordId,
    objectName: 'header'
  })

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.DraftTransfer.page
  })

  const defUserSiteId = parseInt(userDefaults?.list?.find(obj => obj.key === 'siteId')?.value) || null
  const defSiteId = parseInt(systemDefaults?.list?.find(obj => obj.key === 'siteId')?.value) || null
  const jumpToNextLine = systemChecks?.find(item => item.checkId === SystemChecks.POS_JUMP_TO_NEXT_LINE)?.value || false

  const { formik } = useForm({
    maxAccess,
    documentType: { key: 'header.dtId', value: documentType?.dtId, reference: documentType?.reference },
    initialValues: {
      recordId,
      header: {
        recordId,
        dtId: null,
        reference: '',
        date: new Date(),
        fromSiteId: defUserSiteId || defSiteId || null,
        toSiteId: null,
        notes: '',
        status: 1,
        totalWeight: 0,
        carrierId: null
      },
      items: [
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
    validationSchema: yup.object({
      header: yup.object({
        date: yup.string().required(),
        fromSiteId: yup.string().required(),
        toSiteId: yup.string().required()
      }),
      items: yup.array().of(
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

      if (obj?.header?.fromSiteId === obj?.header?.toSiteId) {
        toast.error(labels.SameSiteError)

        return
      }

      const updatedRows = formik?.values?.items
        .filter(row => row.srlNo)
        .map(({ recordId, ...rest }, index) => ({
          ...rest,
          seqNo: index + 1,
          draftTransferId: recordId || 0
        }))

      const DraftTransferPack = {
        header: {
          ...formik.values?.header,
          pcs: formik.values.items.length,
          date: formatDateToApi(formik.values?.header?.date)
        },
        items: updatedRows
      }

      postRequest({
        extension: InventoryRepository.DraftTransfer.set2,
        record: JSON.stringify(DraftTransferPack)
      }).then(async diRes => {
        toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
        await refetchForm(diRes.recordId)
        invalidate()
      })
    }
  })

  async function refetchForm(recordId) {
    const pack = await getDraftTransferPack(recordId)
    await fillDraftTransferFromPack(pack)
  }

  async function getDraftTransferPack(recordId) {
    if (!recordId) return null

    const res = await getRequest({
      extension: InventoryRepository.DraftTransfer.get2,
      parameters: `_recordId=${recordId}`
    })

    res.record.header.date = res?.record?.header?.date ? formatDateFromApi(res.record.header.date) : null

    return res?.record || null
  }

  async function fillDraftTransferFromPack(pack) {
    if (!pack) return

    const { header, items } = pack
    const itemsList = (items || []).map((item, index) => ({
      ...item,
      id: index + 1
    }))

    formik.setValues({
      ...formik.values,
      recordId: header?.recordId || null,
      header: {
        ...formik.values.header,
        ...header
      },
      items: itemsList.length ? itemsList : formik.initialValues.items
    })
  }

  const editMode = !!formik.values.recordId
  const isPosted = formik.values?.header?.status === 3

  const autoDelete = async row => {
    if (!row?.draftTransferId) return true

    await postRequest({
      extension: InventoryRepository.DraftTransferSerial.del,
      record: JSON.stringify({
        draftId: formik?.values?.recordId,
        lineItem: row
      })
    })

    return true
  }

  async function autoSave(header, lastLine) {
    if (!lastLine?.srlNo) return

    const response = await postRequest({
      extension: InventoryRepository.DraftTransferSerial.append,
      record: JSON.stringify({
        header,
        lineItem: { ...lastLine, draftTransferId: header?.recordId}
      }),
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

  async function saveHeader(lastLine) {
    const totals = calculateTotalWeightFromSerials([lastLine])
    const DraftTransferPack = {
      header: {
        ...formik?.values?.header,
        pcs: 1,
        ...totals,
        date: formatDateToApi(formik.values?.header?.date)
      },
      items: [lastLine]
    }

    delete DraftTransferPack.header.items

    const diRes = await postRequest({
      extension: InventoryRepository.DraftTransfer.set2,
      record: JSON.stringify(DraftTransferPack)
    })

    if (diRes.recordId) {
      toast.success(platformLabels.Saved)
      await refetchForm(diRes.recordId)

      return true
    } else {
      return false
    }
  }

  const itemColumns = [
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
        if (!newRow?.srlNo) return

        if (newRow?.srlNo && newRow.srlNo !== oldRow?.srlNo) {
          const res = await getRequest({
            extension: InventoryRepository.Serial.get2,
            parameters: `_srlNo=${newRow?.srlNo}&_siteId=${formik?.values?.header?.fromSiteId}`
          })

          let lineObj = {
            fieldName: 'srlNo',
            changes: {
              id: newRow.id,
              seqNo: newRow.id,
              draftTransferId: formik?.values?.recordId || 0,
              srlNo: res?.record?.srlNo || '',
              sku: res?.record?.sku || '',
              itemName: res?.record?.itemName || '',
              categoryName: res?.record?.categoryName || '',
              weight: res?.record?.weight || 0,
              itemId: res?.record?.itemId || null,
              metalId: res?.record?.metalId || null,
              metalRef: res?.record?.metalRef || '',
              designId: res?.record?.designId || null,
              designRef: res?.record?.designRef || ''
            }
          }

          !reCal && setReCal(true)

          const successSave = formik?.values?.recordId
            ? await autoSave(formik?.values?.header, lineObj.changes)
            : await saveHeader(lineObj.changes)

          if (!successSave) 
            update({
              ...formik?.initialValues?.items,
              id: newRow?.id,
              srlNo: ''
            })
          else  await addRow(lineObj)       
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
      label: labels.categoryName,
      name: 'categoryName',
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
    const res = await postRequest({
      extension: InventoryRepository.DraftTransfer.post,
      record: JSON.stringify({
        ...formik.values?.header,
        date: formatDateToApi(formik.values?.header?.date)
      })
    })
    toast.success(platformLabels.Posted)
    invalidate()
    window.close()

    if(!res?.recordId)
      stack({
        Component: MaterialsTransferForm,
        props: {
          recordId: res?.recordId
        }
      })
  }

  async function onWorkFlowClick() {
    stack({
      Component: WorkFlow,
      props: {
        functionId: SystemFunction.DraftTransfer,
        recordId: formik.values.recordId
      }
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: {
        endPoint: InventoryRepository.BatchDraftTransferSerial.batch,
        header: {
          draftId: formik?.values?.recordId
        },
        onCloseimport: async () => {
          await refetchForm(formik.values.recordId)
        },
        maxAccess
      }
    })
  }

  async function onCopy() {
    if (formik.values?.header?.fromSiteId === formik.values?.header?.toSiteId) {
      toast.error(labels.SameSiteError)

      return
    }

    const updatedRows = formik?.values?.items
      .filter(row => row.srlNo)
      .map(({ recordId, ...rest }, index) => ({
        ...rest,
        seqNo: index + 1,
        draftTransferId: recordId || 0
      }))

    const CloneDraftTransferPack = {
      header: {
        ...formik?.values?.header,
        pcs: formik.values?.items.length,
        date: formatDateToApi(formik?.values?.header?.date)
      },
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
      disabled: isPosted
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !editMode 
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
      onClick: onCopy,
      disabled: !isPosted
    }
  ]

  async function onChangeDtId(recordId) {
    const dtd = await getRequest({
      extension: InventoryRepository.DocumentTypeDefaults.get,
      parameters: `_dtId=${recordId}`
    })

    formik.setFieldValue('header.carrierId', dtd?.record?.carrierId || null)
    formik.setFieldValue('header.fromSiteId', dtd?.record?.siteId || formik?.values?.header?.fromSiteId || null)
    formik.setFieldValue('header.toSiteId', dtd?.record?.toSiteId || formik?.values?.header?.toSiteId || null)
  }

  useEffect(() => {
    if (formik?.values?.items?.length) {
      const itemsList = formik?.values?.items

      const metalMap = itemsList.reduce((acc, { metalId, weight, metalRef }) => {
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

      const itemMap = itemsList.reduce((acc, { sku, itemId, itemName, weight, categoryName }) => {
        if (itemId) {
          if (!acc[itemId]) {
            seqNo++
            acc[itemId] = { sku: sku, pcs: 0, weight: 0, itemName: itemName, categoryName: categoryName, seqNo: seqNo }
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
  }, [formik?.values?.items])

  function calculateTotalWeightFromSerials(items) {
    return items.reduce(
      (acc, row) => {
        const weight = parseFloat(row.weight) || 0
        acc.totalWeight += weight

        return acc
      },
      { totalWeight: 0 }
    )
  }

    useEffect(() => {
    if (!formik.values.items?.length) return
    const totals = calculateTotalWeightFromSerials(formik.values.items)

    formik.setFieldValue('header.totalWeight', totals.totalWeight || 0)

  }, [formik.values.items])

  useEffect(() => {
    ;(async function () {
      if (formik?.values?.recordId) await refetchForm(formik?.values?.recordId)
      else formik.setFieldValue('header.fromSiteId', defUserSiteId || defSiteId || null)    
    })()
  }, [])

  useEffect(() => {
    if (!recordId && formik?.values?.header?.dtId) onChangeDtId(formik?.values?.header?.dtId)
  }, [formik?.values?.header?.dtId])

  async function onValidationRequired() {
    const errors = await formik.validateForm()

    if (errors.header && Object.keys(errors.header).length) {
      const touchedFields = {
        header: { ...formik.touched.header }
      }

      Object.keys(errors.header).forEach(key => {
        if (!formik.touched.header || !formik.touched.header[key]) {
          touchedFields.header[key] = true
        }
      })

      formik.setTouched(touchedFields, true)
    }
  }

  return (
    <FormShell
      resourceId={ResourceIds.DraftTransfer}
      functionId={SystemFunction.DraftTransfer}
      form={formik}
      maxAccess={maxAccess}
      previewReport={editMode}
      actions={actions}
      editMode={editMode}
      isParentWindow={false}
      disabledSubmit={isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.DraftTransfer.pack}
                    reducer={response => response?.record?.documentTypes}
                    name='header.dtId'
                    label={labels.documentType}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    values={formik.values?.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.dtId', newValue?.recordId || null)
                      changeDT(newValue)
                    }}
                    error={formik.touched?.header?.dtId && Boolean(formik.errors?.header?.dtId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.DraftTransfer.pack}
                    reducer={response => response?.record?.sites}
                    name='header.fromSiteId'
                    readOnly={isPosted || formik?.values?.items?.some(serial => serial.srlNo)}
                    label={labels.fromSite}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    required
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.fromSiteId', !newValue?.isInactive ? newValue?.recordId : null)
                      if (newValue?.isInactive)
                        stackError({
                          message: labels.inactiveSite
                        })
                    }}
                    error={formik.touched?.header?.fromSiteId && Boolean(formik.errors?.header?.fromSiteId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField
                    name='header.reference'
                    label={labels.reference}
                    value={formik?.values?.header?.reference}
                    maxAccess={!editMode && maxAccess}
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('header.reference', '')}
                    error={formik.touched?.header?.reference && Boolean(formik.errors?.header?.reference)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.DraftTransfer.pack}
                    reducer={response => response?.record?.sites}
                    name='header.toSiteId'
                    readOnly={isPosted}
                    label={labels.toSite}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values.header}
                    required
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('header.toSiteId', !newValue?.isInactive ? newValue?.recordId : null)
                      if (newValue?.isInactive) 
                        stackError({
                          message: labels.inactiveSite
                        })
                    }}
                    error={formik.touched?.header?.toSiteId && Boolean(formik.errors?.header?.toSiteId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomDatePicker
                    name='header.date'
                    required
                    label={labels.postingDate}
                    value={formik?.values?.header?.date}
                    onChange={formik.setFieldValue}
                    readOnly={isPosted}
                    maxAccess={maxAccess}
                    max={new Date()}
                    onClear={() => formik.setFieldValue('header.date', null)}
                    error={formik.touched?.header?.date && Boolean(formik.errors?.header?.date)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.DraftTransfer.pack}
                    reducer={response => response?.record?.notificationGroups}
                    name='header.notificationGroupId'
                    label={labels.notificationGroup}
                    valueField='recordId'
                    displayField='name'
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={isPosted}
                    values={formik.values.header}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('header.notificationGroupId', newValue?.recordId || null)}
                    error={formik.touched?.header?.notificationGroupId && Boolean(formik.errors?.header?.notificationGroupId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ResourceComboBox
                    endpointId={InventoryRepository.DraftTransfer.pack}
                    reducer={response => response?.record?.carriers}
                    name='header.carrierId'
                    label={labels.carrier}
                    values={formik.values.header}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    readOnly={editMode}
                    maxAccess={maxAccess}
                    onChange={(_, newValue) => formik.setFieldValue('header.carrierId', newValue?.recordId || null)}
                    error={formik.touched?.header?.carrierId && Boolean(formik.errors?.header?.carrierId)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <CustomTextArea
                name='header.notes'
                label={labels.description}
                value={formik.values.header.notes}
                rows={4}
                readOnly={isPosted}
                maxAccess={maxAccess}
                onChange={e => formik.setFieldValue('header.notes', e.target.value)}
                onClear={() => formik.setFieldValue('header.notes', '')}
                error={formik.touched?.header?.notes && Boolean(formik.errors?.header?.notes)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('items', value)
              action === 'delete' && setReCal(true)
            }}
            value={formik.values.items || []}
            error={formik.errors.items}
            columns={itemColumns}
            showCounterColumn={true}
            name='items'
            initialValues={formik?.initialValues?.items[0]}
            enableFilters
            maxAccess={maxAccess}
            disabled={isPosted || Object.entries(formik?.errors || {}).filter(([key]) => key !== 'items').length > 0}
            allowDelete={!isPosted}
            allowAddNewLine={
              formik.values?.items?.length === 0 ||
              !!formik.values?.items?.[formik.values?.items?.length - 1]?.srlNo
            }
            autoDelete={autoDelete}
            onValidationRequired={onValidationRequired}
          />
        </Grow>
        <Grid container spacing={2}>
          <Grid item xs={8}>
              <Grid item xs={12} height={140} sx={{ display: 'flex', flex: 1 }}>
                <Table
                  name='item'
                  columns={[
                    { field: 'seqNo', headerName: labels.seqNo, type: 'number', flex: 1 },
                    { field: 'sku', headerName: labels.sku, flex: 1 },
                    { field: 'itemName', headerName: labels.itemName, flex: 2 },
                    { field: 'categoryName', headerName: labels.categoryName, flex: 2 },
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
          <Grid item xs={4}>
            <Grid container>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <CustomNumberField
                  name='header.totalWeight'
                  maxAccess={maxAccess}
                  label={labels.totalWeight}
                  value={formik.values.header.totalWeight}
                  readOnly
                />
              </Grid>
              <Grid item xs={12} height={105} sx={{ display: 'flex', flex: 1 }}>
                <Table
                  name='metal'
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
            </Grid>
          </Grid>
        </Grid>
      </VertLayout>
    </FormShell>
  )
}
