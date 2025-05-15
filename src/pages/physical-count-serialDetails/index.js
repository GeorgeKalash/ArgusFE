import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useRef, useState, useMemo } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SCRepository } from 'src/repositories/SCRepository'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemChecks } from 'src/resources/SystemChecks'
import toast from 'react-hot-toast'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ClearGridConfirmation from 'src/components/Shared/ClearGridConfirmation'
import { useWindow } from 'src/windows'
import ImportSerials from 'src/components/Shared/ImportSerials'
import { formatDateFromApi } from 'src/lib/date-helper'

const PhysicalCountSerialDe = () => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [siteStore, setSiteStore] = useState([])
  const [controllerStore, setControllerStore] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [disSkuLookup, setDisSkuLookup] = useState('')
  const [jumpToNextLine, setJumpToNextLine] = useState(false)
  const [showDefaultQty, setShowDefaultQty] = useState(false)

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
      rows: [
        {
          id: 1,
          srlNo: null,
          weight: 0,
          sku: '',
          itemId: null,
          itemName: ''
        }
      ]
    },
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      siteId: yup.string().required(),
      controllerId: yup.string().required(),
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
        items: items.length > 0 ? items : []
      }

      await postRequest({
        extension: SCRepository.StockCountSerialDetail.set2,
        record: JSON.stringify(StockCountSerialDetailPack)
      })

      toast.success(platformLabels.Edited)
      setEditMode(items.length > 0)
      checkPhyStatus(obj.controllerId)
    }
  })

  const rowsUpdate = useRef(formik?.values?.rows)

  async function fetchGridData(controllerId) {
    const stockCountId = formik.values.stockCountId

    //getDTDsku(stockCountId)

    await getRequest({
      extension: SCRepository.StockCountSerialDetail.qry,
      parameters: `_stockCountId=${stockCountId}&_siteId=${formik.values.siteId}&_controllerId=${controllerId}`
    }).then(res => {
      if (res.list) {
        const modifiedList = res.list?.map((item, index) => ({
          ...item,
          id: index + 1
        }))
        if (modifiedList.length > 0) {
          formik.setFieldValue('rows', modifiedList)
          rowsUpdate.current = modifiedList
        }
      }

      setEditMode(res.list.length > 0)
    })
  }

  /* useEffect(() => {
    getSysChecks()
  }, [SystemChecks.POS_JUMP_TO_NEXT_LINE]) */ //IMPORT

  useEffect(() => {
    if (!formik.values.stockCountId) {
      setSiteStore([])
      setControllerStore([])
      setEditMode(false)
    }
  }, [formik.values.stockCountId])

  const fillSiteStore = stockCountId => {
    setSiteStore([])
    setControllerStore([])
    getRequest({
      extension: SCRepository.Sites.qry,
      parameters: `_stockCountId=${stockCountId}`
    }).then(res => {
      setSiteStore(res.list.filter(site => site.isChecked == true))
    })
  }

  const fillControllerStore = (stockCountId, siteId) => {
    getRequest({
      extension: SCRepository.StockCountControllerTab.qry,
      parameters: `_stockCountId=${stockCountId}&_siteId=${siteId}`
    }).then(res => {
      setControllerStore(res.list)
    })
  }

  const checkPhyStatus = async controllerId => {
    const resp = await getRequest({
      extension: SCRepository.StockCountControllerTab.get,
      parameters: `_stockCountId=${formik.values.stockCountId}&_siteId=${formik.values.siteId}&_controllerId=${controllerId}`
    })

    formik.setFieldValue('status', resp?.record?.status)
  }

  /*  async function getDTDsku(stockCountId) {
    let dtId
    let disableSKULookup = false

    const res = await getRequest({
      extension: SCRepository.StockCount.get,
      parameters: `_recordId=${stockCountId}`
    })

    dtId = res?.record?.dtId

    if (dtId) {
      const DTDres = await getRequest({
        extension: SCRepository.DocumentTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })
      disableSKULookup = DTDres?.record?.disableSKULookup || false
    }

    setDisSkuLookup(disableSKULookup)
  } */

  /*   async function getSysChecks() {
    const Jres = await getRequest({
      extension: SystemRepository.SystemChecks.get,
      parameters: `_checkId=${SystemChecks.POS_JUMP_TO_NEXT_LINE}&_scopeId=1&_masterId=0`
    })

    if (Jres?.record?.value) setJumpToNextLine(Jres?.record?.value)

    const DQres = await getRequest({
      extension: SystemRepository.SystemChecks.get,
      parameters: `_checkId=${SystemChecks.DEFAULT_QTY_PIECES}&_scopeId=1&_masterId=0`
    })

    if (DQres?.record?.value) setShowDefaultQty(DQres?.record?.value)

    formik.values.controllerId && formik.setFieldValue('rows[0].countedQty', DQres?.record?.value ? 1 : 0)
  } */

  //const defaultQty = !jumpToNextLine && !showDefaultQty ? 0 : 1

  async function autoSave(lastLine) {
    if (lastLine?.srlNo && lastLine?.itemId) {
      lastLine.controllerId = formik?.values?.controllerId
      lastLine.siteId = formik?.values?.siteId
      lastLine.stockCountId = formik?.values?.stockCountId

      const response = await postRequest({
        extension: SCRepository.StockCountSerialDetail.append,
        record: JSON.stringify(lastLine),
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

  const autoDelete = async row => {
    if (!row?.srlNo || !row?.itemId) return true

    row.controllerId = formik?.values?.controllerId
    row.siteId = formik?.values?.siteId
    row.stockCountId = formik?.values?.stockCountId

    await postRequest({
      extension: SCRepository.StockCountSerialDetail.del,
      record: JSON.stringify(row)
    })

    return true
  }

  const handleGridChange = (value, action, row) => {
    if (action === 'delete') {
      let updatedSerials = formik.values.rows

      updatedSerials = updatedSerials.filter(item => item.srlNo !== row.srlNo)
      formik.setFieldValue('rows', updatedSerials)
      rowsUpdate.current = updatedSerials
    } else {
      formik.setFieldValue('rows', value)
      rowsUpdate.current = value
    }
  }

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
        let itemId
        itemId = newRow?.itemId
        if (newRow.sku !== oldRow?.sku) {
          const txtRes = await getRequest({
            extension: InventoryRepository.Serial.get2,
            parameters: `_srlNo=${srlNo}&_siteId=${siteId}`
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
                itemName: res?.name,
                weight: result?.weight || 0
              }
            }

            const successSave = await autoSave(lineObj.changes)

            if (!successSave) {
              update({
                ...formik?.initialValues?.rows,
                id: newRow?.id,
                srlNo: ''
              })
            } else {
              await addRow(lineObj)
            }
          }
        } else {
          update({
            ...oldRow,
            sku: oldRow.sku
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

  const clearGrid = () => {
    formik.setFieldValue('rows', formik.initialValues.rows)
    rowsUpdate.current = formik.initialValues.rows

    setEditMode(false)
  }

  const isPosted = formik.values.status === 3

  const emptyGrid = formik?.values?.rows?.length === 0

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

    if (status == 3) {
      toast.success(platformLabels.Posted)
    } else {
      toast.success(platformLabels.Unposted)
    }
  }

  const onClearGridConfirmation = async () => {
    stack({
      Component: ClearGridConfirmation,
      props: {
        open: { flag: true },
        fullScreen: false,
        onConfirm: clearGrid,
        dialogText: platformLabels.DeleteGridConf
      },
      width: 570,
      height: 170,
      title: platformLabels.Clear
    })
  }

  const onClearAllConfirmation = async () => {
    stack({
      Component: ClearGridConfirmation,
      props: {
        open: { flag: true },
        fullScreen: false,
        onConfirm: () => {
          formik.resetForm()
          formik.setFieldValue('rows', [])

          setEditMode(false)
        },
        dialogText: platformLabels.ClearFormGrid
      },
      width: 570,
      height: 170,
      title: platformLabels.Clear
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
      onClick: onClearGridConfirmation,
      onSuccess: clearGrid,
      disabled: emptyGrid
    },
    {
      key: 'ClearHG',
      condition: true,
      onClick: onClearAllConfirmation,
      disabled: formik.values.controllerId == null
    },
    {
      key: 'Import',
      condition: true,
      onClick: () => onImportClick(),
      disabled: !isSaved
    }
  ]

  const totalCount = formik.values.rows.filter(item => item.srlNo).length

  const totalWeight = formik.values.rows.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.weight?.toString().replace(/,/g, '')) || 0

    return weightSum + weightValue
  }, 0)

  async function onImportClick() {
    // fix import
    stack({
      Component: ImportSerials,
      props: {
        //endPoint: SaleRepository.DraftInvoiceSerial.batch,
        //draftId: formik?.values?.recordId,
        //onCloseimport: fillGrids,
        //maxAccess: maxAccess
      },
      width: 550,
      height: 270,
      title: platformLabels.importSerials
    })
  }

  const filtered = formik.values.search
    ? formik.values.rows.filter(
        item =>
          (item.sku && item.sku?.toString()?.includes(formik.values.search?.toLowerCase())) ||
          (item.srlNo && item.srlNo?.toString()?.includes(formik.values.search?.toLowerCase())) ||
          (item.weight && item.weight?.toString()?.includes(formik.values.search?.toLowerCase()))
      )
    : formik.values.rows

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isCleared={false}
      isSavedClear={false}
      disabledSubmit={!isSaved}
      actions={actions}
      maxAccess={access}
      resourceId={ResourceIds.PhysicalCountSerialDetail}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
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
                readOnly={formik.values.controllerId}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('stockCountId', newValue?.recordId)
                  formik.setFieldValue('siteId', '')

                  if (!newValue) {
                    setSiteStore([])
                    clearGrid()
                    formik.setFieldValue('SCStatus', null)
                    formik.setFieldValue('SCWIP', null)
                    formik.setFieldValue('scDate', null)
                    formik.setFieldValue('scRef', null)
                  } else {
                    fillSiteStore(newValue?.recordId)
                    formik.setFieldValue('SCStatus', newValue?.status)
                    formik.setFieldValue('SCWIP', newValue?.wip)
                    formik.setFieldValue('scDate', formatDateFromApi(newValue?.date))
                    formik.setFieldValue('scRef', newValue?.reference)
                  }
                }}
                error={formik.touched.stockCountId && Boolean(formik.errors.stockCountId)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomDatePicker
                name='scDate'
                value={formik?.values?.scDate}
                readOnly
                maxAccess={access}
                error={formik.touched.scDate && Boolean(formik.errors.scDate)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='scRef'
                value={formik?.values?.scRef}
                maxAccess={access}
                readOnly
                error={formik.touched.scRef && Boolean(formik.errors.scRef)}
              />
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                name='siteId'
                store={siteStore}
                label={labels.site}
                valueField='siteId'
                displayField={['siteRef', 'siteName']}
                columnsInDropDown={[
                  { key: 'siteRef', value: 'Reference' },
                  { key: 'siteName', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={formik.values.controllerId}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.siteId)
                  formik.setFieldValue('controllerId', null)

                  if (!newValue) {
                    setControllerStore([])
                    clearGrid()
                    formik.setFieldValue('EndofSiteStatus', null)
                  } else {
                    fillControllerStore(formik.values.stockCountId, newValue?.siteId)
                    formik.setFieldValue('EndofSiteStatus', newValue?.status)
                  }
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={9}></Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                name='controllerId'
                store={controllerStore}
                label={labels.controller}
                valueField='controllerId'
                displayField='controllerName'
                values={formik.values}
                required
                readOnly={formik.values.controllerId}
                onChange={(event, newValue) => {
                  formik.setFieldValue('controllerId', newValue?.controllerId)
                  checkPhyStatus(newValue?.controllerId)
                  fetchGridData(newValue?.controllerId)
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
                  const { value } = event.target
                  formik.setFieldValue('search', value)
                }}
                onSearch={e => formik.setFieldValue('search', e)}
                search={true}
                readOnly={formik?.values?.rows?.length === 0 || formik?.values?.rows?.length === 0}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow key={formik.values.controllerId}>
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
            autoDelete={autoDelete}
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
                readOnly={true}
                hidden={!formik.values.controllerId}
                maxAccess={access}
                numberField={true}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='totalWeight'
                label={labels.totalWeight}
                value={getFormattedNumber(totalWeight.toFixed(2))}
                readOnly={true}
                hidden={!formik.values.controllerId}
                maxAccess={access}
                numberField={true}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalCountSerialDe
