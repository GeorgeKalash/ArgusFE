import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useContext, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SCRepository } from '@argus/repositories/src/repositories/SCRepository'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import toast from 'react-hot-toast'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ClearGridConfirmation from '@argus/shared-ui/src/components/Shared/ClearGridConfirmation'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ImportSerials from '@argus/shared-ui/src/components/Shared/ImportSerials'
import { formatDateFromApi } from '@argus/shared-domain/src/lib/date-helper'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const PhysicalCountSerialDe = () => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { systemChecks } = useContext(DefaultsContext)
  const [editMode, setEditMode] = useState(false)
  const [combosDisabled, setCombosDisabled] = useState(false)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.PhysicalCountSerialDetail
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      stockCountId: null,
      siteId: null,
      controllerId: null,
      status: 1,
      SCStatus: null,
      SCWIP: null,
      EndofSiteStatus: null,
      search: '',
      scRef: null,
      scDate: null,
      rows: [
        {
          id: 1,
          seqNo: 1,
          srlNo: '',
          weight: 0,
          sku: '',
          itemId: null,
          itemName: ''
        }
      ]
    },
    validationSchema: yup.object({
      stockCountId: yup.number().required(),
      scDate: yup.date().required(),
      scRef: yup.string().required(),
      siteId: yup.number().required(),
      controllerId: yup.number().required(),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            srlNo: yup.string().test({
              name: 'srlNo-first-row-check',
              test(value, context) {
                const { parent, options } = context
                const allRows = options?.context?.rows
                const currentRowIndex = allRows?.findIndex(row => row.id === parent.id)
                const isLastRow = currentRowIndex === allRows?.length - 1

                if (isLastRow) {
                  return true
                }

                return !!value
              }
            })
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const items = obj?.rows
        ?.filter(item => item.srlNo)
        .map((item, index) => ({
          ...item,
          seqNo: index + 1,
          siteId: obj.siteId,
          stockCountId: obj.stockCountId,
          controllerId: obj.controllerId
        }))

      const StockCountSerialDetailPack = {
        siteId: obj.siteId,
        controllerId: obj.controllerId,
        stockCountId: obj.stockCountId,
        stockCountSerials: items
      }

      await postRequest({
        extension: SCRepository.StockCountSerialDetail.set2,
        record: JSON.stringify(StockCountSerialDetailPack)
      })

      toast.success(platformLabels.Saved)
      setEditMode(items.length > 0)
      checkPhyStatus(obj.controllerId)
    }
  })

  async function fetchGridData(controllerId) {
    await getRequest({
      extension: SCRepository.StockCountSerialDetail.qry,
      parameters: `_stockCountId=${formik.values.stockCountId}&_siteId=${formik.values.siteId}&_controllerId=${
        controllerId || formik?.values?.controllerId
      }`
    }).then(res => {
      if (res.list) {
        const modifiedList = res.list?.map((item, index) => ({
          ...item,
          id: index + 1
        }))
        if (modifiedList.length > 0) {
          formik.setFieldValue('rows', modifiedList)
        }
      }

      setEditMode(res.list.length > 0)
    })
  }

  const checkPhyStatus = async controllerId => {
    const resp = await getRequest({
      extension: SCRepository.StockCountControllerTab.get,
      parameters: `_stockCountId=${formik.values.stockCountId}&_siteId=${formik.values.siteId}&_controllerId=${controllerId}`
    })

    formik.setFieldValue('status', resp?.record?.status)
  }

  async function autoSave(lastLine) {
    if (lastLine?.srlNo && lastLine?.itemId) {
      lastLine.controllerId = formik?.values?.controllerId
      lastLine.siteId = formik?.values?.siteId
      lastLine.stockCountId = formik?.values?.stockCountId

      await postRequest({
        extension: SCRepository.StockCountSerialDetail.append,
        record: JSON.stringify(lastLine)
      })

      toast.success(platformLabels.Saved)
    }
  }

  const autoDelete = async row => {
    if (!row?.srlNo || !row?.itemId) return true

    row.controllerId = formik?.values?.controllerId
    row.siteId = formik?.values?.siteId
    row.stockCountId = formik?.values?.stockCountId

    await postRequest({
      extension: SCRepository.StockCountSerialDetail.del,
      record: JSON.stringify(row)
    })

    toast.success(platformLabels.Deleted)

    return true
  }

  const handleGridChange = (value, action, row) => {
    if (action === 'delete') {
      let updatedSerials = formik.values.rows

      updatedSerials = updatedSerials.filter(item => item.srlNo !== row.srlNo)
      formik.setFieldValue('rows', updatedSerials)
    } else {
      formik.setFieldValue('rows', value)
    }
  }

  const jumpToNextLine = systemChecks?.find(item => item.checkId === SystemChecks.POS_JUMP_TO_NEXT_LINE)?.value
  const autoSaveDel = systemChecks?.find(item => item.checkId === SystemChecks.AUTO_SAVE_CYCLE_COUNT)?.value

  const columns = [
    {
      component: 'textfield',
      name: 'srlNo',
      label: labels.srlNo,
      updateOn: 'blur',
      props: {
        clearable: true
      },
      jumpToNextLine: jumpToNextLine,
      async onChange({ row: { update, newRow, oldRow, addRow } }) {
        if (newRow.srlNo !== oldRow?.srlNo) {
          const txtRes = await getRequest({
            extension: InventoryRepository.Serial.get2,
            parameters: `_srlNo=${newRow?.srlNo}&_siteId=${formik?.values?.siteId}`
          })

          const res = txtRes?.record

          if (res) {
            let lineObj = {
              fieldName: 'srlNo',
              changes: {
                id: newRow.id,
                seqNo: newRow.id,
                srlNo: res.srlNo,
                sku: res.sku,
                itemId: res.itemId,
                itemName: res?.itemName,
                weight: res?.weight || 0
              }
            }

            autoSaveDel && (await autoSave(lineObj.changes))

            await addRow(lineObj)
          }
        } else {
          update({
            ...oldRow,
            srlNo: oldRow.srlNo
          })
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
      name: 'sku',
      label: labels.sku,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'itemName',
      label: labels.name,
      props: {
        readOnly: true
      }
    }
  ]

  const isPosted = formik.values.status === 3
  const emptyGrid = formik?.values?.rows?.filter(row => row?.srlNo)?.length === 0

  const isHeader =
    formik.values.controllerId != null &&
    formik.values.SCStatus != 3 &&
    formik.values.SCWIP != 2 &&
    formik.values.EndofSiteStatus != 3

  const isSaved =
    formik.values.controllerId != null &&
    formik.values.status != 3 &&
    formik.values.SCStatus != 3 &&
    formik.values.SCWIP != 2 &&
    formik.values.EndofSiteStatus != 3

  const onPost = async () => {
    const status = formik.values.status == 1 ? 3 : 1
    formik.setFieldValue('status', status)

    const StockCountControllerTab = {
      siteId: formik.values.siteId,
      controllerId: formik.values.controllerId,
      stockCountId: formik.values.stockCountId,
      status: status
    }

    await postRequest({
      extension: SCRepository.StockCountControllerTab.set,
      record: JSON.stringify(StockCountControllerTab)
    })

    toast.success(isPosted ? platformLabels.Posted : platformLabels.Unposted)
  }

  const onClearConfirmation = async clearOption => {
    stack({
      Component: ClearGridConfirmation,
      props: {
        open: { flag: true },
        fullScreen: false,
        onConfirm: () => {
          clearOption === 'clearAll' ? formik.resetForm() : formik.setFieldValue('rows', formik.initialValues.rows)
          setCombosDisabled(false)
          setEditMode(false)
        },
        dialogText: clearOption === 'clearAll' ? platformLabels.ClearFormGrid : platformLabels.DeleteGridConf
      }
    })
  }

  const actions = [
    {
      key: 'Locked',
      condition: isPosted,
      onClick: 'onUnpostConfirmation',
      onSuccess: onPost,
      disabled: !isHeader
    },
    {
      key: 'Unlocked',
      condition: !isPosted,
      onClick: onPost,
      disabled: !isHeader
    },
    {
      key: 'ClearGrid',
      condition: true,
      onClick: () => onClearConfirmation(),
      disabled: !isSaved || emptyGrid
    },
    {
      key: 'ClearHG',
      condition: true,
      onClick: () => onClearConfirmation('clearAll'),
      disabled: !(formik.values.controllerId || formik.values.siteId || formik.values.stockCountId)
    },
    {
      key: 'Import',
      condition: true,
      onClick: onImportClick,
      disabled: !isSaved
    }
  ]

  const totalCount = formik.values.rows.filter(item => item.srlNo).length

  const totalWeight = formik.values.rows.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.weight?.toString().replace(/,/g, '')) || 0

    return weightSum + weightValue
  }, 0)

  async function onImportClick() {
    stack({
      Component: ImportSerials,
      props: {
        endPoint: SCRepository.StockCountSerialDetail.batch,
        header: {
          siteId: formik?.values?.siteId,
          controllerId: formik?.values?.controllerId,
          stockCountId: formik?.values?.stockCountId
        },
        onCloseimport: fetchGridData,
        maxAccess: access
      }
    })
  }

  const filtered = formik.values.search
    ? formik.values.rows.filter(
        item =>
          (item.sku && item.sku?.toLowerCase().toString()?.includes(formik.values.search?.toLowerCase())) ||
          (item.srlNo && item.srlNo?.toString()?.includes(formik.values.search?.toLowerCase())) ||
          (item.weight && item.weight?.toString()?.includes(formik.values.search?.toLowerCase()))
      )
    : formik.values.rows

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isCleared={false}
      disabledSubmit={!isSaved}
      actions={actions}
      maxAccess={access}
      resourceId={ResourceIds.PhysicalCountSerialDetail}
      previewReport={editMode}
      fullSize
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} p={2}>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={SCRepository.StockCount.qry}
                parameters={`_startAt=0&_pageSize=1000&_params=`}
                name='stockCountId'
                label={labels.stockCount}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                required
                readOnly={combosDisabled}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('stockCountId', newValue?.recordId || null)
                  formik.setFieldValue('siteId', null)
                  formik.setFieldValue('controllerId', null)
                  setEditMode(false)

                  formik.setFieldValue('SCStatus', newValue?.status || null)
                  formik.setFieldValue('SCWIP', newValue?.wip || null)
                  formik.setFieldValue('scDate', formatDateFromApi(newValue?.date) || null)
                  formik.setFieldValue('scRef', newValue?.reference || null)
                }}
                error={formik.touched.stockCountId && Boolean(formik.errors.stockCountId)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomDatePicker
                name='scDate'
                label={labels.stockCountDate}
                value={formik?.values?.scDate}
                readOnly
                required
                error={formik.touched.scDate && Boolean(formik.errors.scDate)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='scRef'
                label={labels.stockCountRef}
                value={formik?.values?.scRef}
                readOnly
                required
                error={formik.touched.scRef && Boolean(formik.errors.scRef)}
              />
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={formik?.values?.stockCountId && SCRepository.Sites.qry}
                parameters={`_stockCountId=${formik?.values?.stockCountId}`}
                filter={item => item.isChecked}
                name='siteId'
                key={formik.values.stockCountId}
                label={labels.site}
                valueField='siteId'
                displayField={['siteRef', 'siteName']}
                columnsInDropDown={[
                  { key: 'siteRef', value: 'Reference' },
                  { key: 'siteName', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={combosDisabled}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.siteId || null)
                  formik.setFieldValue('controllerId', null)

                  formik.setFieldValue('EndofSiteStatus', newValue?.status || null)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={9}></Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={formik?.values?.siteId && SCRepository.StockCountControllerTab.qry}
                parameters={`_stockCountId=${formik?.values?.stockCountId}&_siteId=${formik?.values?.siteId}`}
                key={formik.values.siteId}
                name='controllerId'
                label={labels.controller}
                valueField='controllerId'
                displayField='controllerName'
                values={formik.values}
                required
                readOnly={combosDisabled}
                onChange={(event, newValue) => {
                  formik.setFieldValue('controllerId', newValue?.controllerId || null)
                  setCombosDisabled(true)
                  newValue?.controllerId && checkPhyStatus(newValue?.controllerId)
                  newValue?.controllerId && fetchGridData(newValue?.controllerId)
                }}
                error={formik.touched.controllerId && Boolean(formik.errors.controllerId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='search'
                value={formik.values.search}
                label={labels.search}
                onClear={() => {
                  formik.setFieldValue('search', '')
                }}
                onChange={event => {
                  formik.setFieldValue('search', event.target.value)
                }}
                onSearch={e => formik.setFieldValue('search', e)}
                search={true}
                readOnly={formik?.values?.rows?.length === 0}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow key={formik?.values?.controllerId}>
          <DataGrid
            onChange={(value, action, row) => handleGridChange(value, action, row)}
            value={formik.values.controllerId ? filtered : []}
            error={formik.errors?.rows}
            initialValues={formik?.initialValues?.rows?.[0]}
            columns={columns}
            disabled={formik.values?.SCStatus == 3 || formik.values?.EndofSiteStatus == 3 || formik.values?.status == 3}
            allowDelete={formik.values?.SCStatus != 3 && formik.values?.SCWIP != 2 && formik.values?.status != 3}
            allowAddNewLine={
              !formik?.values?.search &&
              formik.values.controllerId &&
              formik.values?.SCStatus != 3 &&
              formik.values?.EndofSiteStatus != 3 &&
              !!(!formik?.values?.rows?.length || formik.values?.rows?.[formik.values?.rows?.length - 1]?.sku)
            }
            maxAccess={access}
            autoDelete={autoSaveDel ? autoDelete : null}
            name='rows'
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ pt: 5 }}>
            <Grid item xs={2}>
              <CustomTextField
                name='totalCount'
                label={labels.totalCount}
                value={totalCount}
                readOnly
                hidden={!formik.values.controllerId}
                numberField
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='totalWeight'
                label={labels.totalWeight}
                value={getFormattedNumber(totalWeight.toFixed(2))}
                readOnly
                hidden={!formik.values.controllerId}
                numberField
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalCountSerialDe
