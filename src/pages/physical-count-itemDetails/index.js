import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useRef, useState } from 'react'
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
import ClearGridConfirmation from 'src/components/Shared/ClearGridConfirmation'
import { useWindow } from 'src/windows'
import ImportForm from 'src/components/Shared/ImportForm'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const PhysicalCountItemDe = () => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [siteStore, setSiteStore] = useState([])
  const [controllerStore, setControllerStore] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [disSkuLookup, setDisSkuLookup] = useState('')
  const [jumpToNextLine, setJumpToNextLine] = useState(false)
  const [showDefaultQty, setShowDefaultQty] = useState(false)
  const [disableItemDuplicate, setDisableItemDuplicate] = useState(false)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.IVPhysicalCountItemDetails
  })

  const getItemDetails = async itemId => {
    const res = await getRequest({
      extension: InventoryRepository.Physical.get,
      parameters: `_itemId=${itemId}`
    })

    return res?.record
  }

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
      rows: [
        {
          id: 1,
          sku: '',
          itemId: null,
          itemName: '',
          countedQty: 0,
          weight: 0,
          metalPurity: 0
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      siteId: yup.string().required(),
      controllerId: yup.string().required(),
      rows: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().test({
              name: 'sku-first-row-check',
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
        ?.filter(item => item.sku && item.sku !== '')
        .map((item, index) => ({
          ...item,
          seqNo: index + 1,
          siteId: obj.siteId,
          stockCountId: obj.stockCountId,
          controllerId: obj.controllerId
        }))

      const StockCountItemDetailPack = {
        siteId: obj.siteId,
        controllerId: obj.controllerId,
        stockCountId: obj.stockCountId,
        items: items.length > 0 && items[0].sku ? items : []
      }

      await postRequest({
        extension: SCRepository.StockCountItemDetail.set2,
        record: JSON.stringify(StockCountItemDetailPack)
      })

      toast.success(platformLabels.Edited)
      setEditMode(items.length > 0)
      checkPhyStatus(obj.controllerId)
    }
  })

  const rowsUpdate = useRef(formik?.values?.rows)

  async function fetchGridData(controllerId) {
    const stockCountId = formik.values.stockCountId

    getDTDsku(stockCountId)

    await getRequest({
      extension: SCRepository.StockCountItemDetail.qry,
      parameters: `_stockCountId=${stockCountId}&_siteId=${formik.values.siteId}&_controllerId=${controllerId}`
    }).then(res => {
      if (res.list) {
        const modifiedList = res.list?.map((item, index) => ({
          ...item,
          id: index + 1,
          metalPurity: item?.metalPurity || 0,
          weight: item?.weight || 0,
          countedQty: item?.countedQty || 0
        }))
        if (modifiedList.length > 0) {
          formik.setFieldValue('rows', modifiedList)
          rowsUpdate.current = modifiedList
        }
      }

      setEditMode(res?.list?.length > 0)
    })
  }

  useEffect(() => {
    getSysChecks()
  }, [SystemChecks.POS_JUMP_TO_NEXT_LINE])

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

  async function getDTDsku(stockCountId) {
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
  }

  async function getSysChecks() {
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
  }

  const defaultQty = !jumpToNextLine && !showDefaultQty ? 0 : 1

  const columns = [
    {
      component: disSkuLookup ? 'textfield' : 'resourcelookup',
      name: 'sku',
      label: labels.sku,
      ...(disSkuLookup && { updateOn: 'blur' }),
      jumpToNextLine: jumpToNextLine,
      disableDuplicate: disableItemDuplicate,
      props: {
        ...(!disSkuLookup && {
          endpointId: InventoryRepository.Item.snapshot,
          mapping: [
            { from: 'recordId', to: 'itemId' },
            { from: 'sku', to: 'sku' },
            { from: 'name', to: 'itemName' },
            { from: 'priceType', to: 'priceType' }
          ],
          displayField: 'sku',
          valueField: 'sku',
          columnsInDropDown: [
            { key: 'sku', value: 'sku' },
            { key: 'name', value: 'Name' },
            { key: 'flName', value: 'FL Name' }
          ],
          displayFieldWidth: 2
        })
      },
      async onChange({ row: { update, newRow, oldRow, addRow } }) {
        let itemId
        itemId = newRow?.itemId

        if (!disSkuLookup) {
          if (newRow.sku !== oldRow?.sku) {
            if (itemId) {
              const result = await getItemDetails(itemId)
              update({
                weight: result?.weight || 0,
                metalPurity: result?.metalPurity || 0,
                metalId: result?.metalId,
                isMetal: result?.isMetal,
                countedQty: defaultQty
              })
              addRow()
            }
          }
        }
        if (disSkuLookup) {
          if (newRow.sku !== oldRow?.sku) {
            const txtRes = await getRequest({
              extension: InventoryRepository.Items.get2,
              parameters: `_sku=${newRow.sku}`
            })

            const res = txtRes?.record

            if (res) {
              itemId = res.recordId

              const result = await getItemDetails(itemId)

              addRow({
                fieldName: 'sku',
                changes: {
                  id: newRow.id,
                  sku: res.sku,
                  itemId: itemId,
                  countedQty: defaultQty,
                  itemName: res?.name,
                  priceType: res?.priceType,
                  weight: result?.weight,
                  metalPurity: result?.metalPurity,
                  metalId: result?.metalId,
                  isMetal: result?.isMetal
                }
              })
            }
          }
        }
      }
    },

    {
      component: 'textfield',
      name: 'itemName',
      label: labels.name,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'countedQty'
    },
    {
      component: 'numberfield',
      label: labels.metalPurity,
      name: 'metalPurity',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight',
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

  const handleMetalClick = async () => {
    const metalItemsList = rowsUpdate?.current
      ?.filter(item => item.metalId)
      .map(item => ({
        qty: item.countedQty,
        metalRef: '',
        metalId: item.metalId,
        metalPurity: item.metalPurity,
        weight: item.weight,
        priceType: item.priceType
      }))

    return metalItemsList || []
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
      }
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
      }
    })
  }

  async function onImportClick() {
    stack({
      Component: ImportForm,
      props: {
        resourceId: ResourceIds.PhysicalCountItemDetailsImport,
        access,
        onSuccess: async res => {
          if (formik.values?.controllerId) fetchGridData(formik.values?.controllerId)
        }
      }
    })
  }

  const actions = [
    {
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal',
      handleMetalClick
    },
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
      onClick: onImportClick,
      disabled: false
    }
  ]

  const totalQty = formik.values.rows.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row.countedQty?.toString().replace(/,/g, '')) || 0

    return qtySum + qtyValue
  }, 0)

  const totalWeight = formik.values.rows.reduce((weightSum, row) => {
    const weightValue = parseFloat(row.weight?.toString().replace(/,/g, '')) || 0

    return weightSum + weightValue
  }, 0)

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isCleared={false}
      disabledSubmit={!isSaved}
      actions={actions}
      maxAccess={access}
      resourceId={ResourceIds.IVPhysicalCountItemDetails}
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
                  } else {
                    fillSiteStore(newValue?.recordId)
                    formik.setFieldValue('SCStatus', newValue?.status)
                    formik.setFieldValue('SCWIP', newValue?.wip)
                  }

                  setDisableItemDuplicate(!!newValue?.disableItemDuplicate)
                }}
                error={formik.touched.stockCountId && Boolean(formik.errors.stockCountId)}
              />
            </Grid>
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
          </Grid>
        </Fixed>
        <Grow key={formik.values.controllerId}>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('rows', value)
              rowsUpdate.current = value
            }}
            value={formik.values.controllerId && typeof disSkuLookup === 'boolean' ? formik.values?.rows : []}
            error={formik.errors?.rows}
            initialValues={formik?.initialValues?.rows?.[0]}
            columns={columns}
            disabled={formik.values?.SCStatus == 3 || formik.values?.EndofSiteStatus == 3 || formik.values?.status == 3}
            allowDelete={formik.values?.SCStatus != 3 && formik.values?.SCWIP != 2 && formik.values?.status != 3}
            allowAddNewLine={
              formik.values.controllerId &&
              formik.values?.SCStatus != 3 &&
              formik.values?.EndofSiteStatus != 3 &&
              !!(!formik?.values?.rows?.length || formik.values?.rows?.[formik.values?.rows?.length - 1]?.sku)
            }
            maxAccess={access}
            name='rows'
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ pt: 5 }}>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalQty'
                label={labels.totalQty}
                value={getFormattedNumber(totalQty.toFixed(2))}
                readOnly
                hidden={!formik.values.controllerId}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalWeight'
                label={labels.totalWeight}
                value={getFormattedNumber(totalWeight.toFixed(2))}
                readOnly
                hidden={!formik.values.controllerId}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalCountItemDe
