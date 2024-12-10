import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
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

const PhysicalCountItemDe = () => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [siteStore, setSiteStore] = useState([])
  const [controllerStore, setControllerStore] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [disSkuLookup, setDisSkuLookup] = useState(false) //better to put them in formik not states if possible
  const [jumpToNextLine, setJumpToNextLine] = useState(false) //better to put them in formik not states if possible
  const [showDefaultQty, setShowDefaultQty] = useState(false) //better to put them in formik not states if possible
  const [disableItemDuplicate, setDisableItemDuplicate] = useState(false) //better to put them in formik not states if possible

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.IVPhysicalCountItemDetails
  })

  const { formik } = useForm({
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
    access,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      siteId: yup.string().required(),
      controllerId: yup.string().required(),
      rows: yup.array().of(
        yup.object().shape({
          sku: yup.string().test({
            name: 'sku-first-row-check',
            test(value, context) {
              const { parent } = context
              if (parent?.id == 1 && value) return true
              if (parent?.id == 1 && !value) return true
              if (parent?.id > 1 && !value) return false

              return value
            }
          }),
          itemName: yup.string().test({
            name: 'itemName-first-row-check',
            test(value, context) {
              const { parent } = context
              if (parent?.id == 1 && value) return true
              if (parent?.id == 1 && !value) return true
              if (parent?.id > 1 && !value) return false

              return value
            }
          })
        })
      )
    }),
    onSubmit: async obj => {
      const items = obj?.rows?.map((item, index) => ({
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

      handleClick(items)
    }
  })

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
        modifiedList.length > 0 && formik.setFieldValue('rows', modifiedList)
      }

      setEditMode(res.list.length > 0)
      handleClick(res.list)
    })
  }

  useEffect(() => {
    getSysChecks()
  }, [])

  useEffect(() => {
    if (!formik.values.stockCountId) {
      setSiteStore([])
      setControllerStore([])
      setFilteredItems([])
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
  }

  const defaultQty = !jumpToNextLine && !showDefaultQty ? 0 : 1

  const columns = [
    {
      component: disSkuLookup ? 'textfield' : 'resourcelookup',
      name: 'sku',
      label: _labels.sku,
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
          valueField: 'recordId',
          columnsInDropDown: [
            { key: 'sku', value: 'sku' },
            { key: 'name', value: 'Name' },
            { key: 'flName', value: 'FL Name' }
          ],
          displayFieldWidth: 2
        }),
        jumpToNextLine: jumpToNextLine
      },
      async onChange({ row: { update, newRow } }) {
        let itemId
        itemId = newRow?.itemId

        // if (!disSkuLookup) {
        //   itemId = newRow?.itemId
        //   if (disableItemDuplicate) {
        //     if (formik.values.rows.find(item => item.itemId == itemId)) {
        //       update({
        //         itemId: null,
        //         itemName: '',
        //         sku: null,
        //         priceType: null
        //       })
        //     }
        //     return
        //   }
        // }

        if (itemId) {
          const res = await getRequest({
            extension: InventoryRepository.Physical.get,
            parameters: `_itemId=${itemId}`
          })
          update({
            weight: res?.record?.weight || 0,
            metalPurity: res?.record?.metalPurity || 0,
            metalId: res?.record?.metalId,
            isMetal: res?.record?.isMetal
          })
        }
      },
      async onCellPress(e, { row: { addRow, oldValue, update } }) {
        if (disSkuLookup) {
          var txtRes
          if (e.target.value !== oldValue.sku) {
            txtRes = await getRequest({
              extension: InventoryRepository.Items.get2,
              parameters: `_sku=${e.target.value}`
            })
          }
          if (txtRes?.record) {
            const itemId = txtRes?.record?.recordId ? txtRes?.record?.recordId : ''
            addRow({
              fieldName: 'sku',
              changes: {
                id: oldValue.id,
                sku: e.target.value,
                itemId: itemId,
                itemName: txtRes?.record?.name ? txtRes?.record?.name : oldValue.itemName,
                priceType: txtRes?.record?.metalId ? txtRes?.record?.priceType : oldValue.priceType
              }
            })
          } else {
            update({
              id: oldValue.id,
              sku: ''
            })
          }
        }
      }
    },

    {
      component: 'textfield',
      name: 'itemName',
      label: _labels.name
    },
    {
      component: 'numberfield',
      label: _labels.qty,
      name: 'countedQty',
      defaultValue: defaultQty
    },
    {
      component: 'numberfield',
      label: _labels.metalPurity,
      name: 'metalPurity',
      defaultValue: 0,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: _labels.weight,
      name: 'weight',
      defaultValue: 0,
      props: {
        readOnly: true
      }
    }
  ]

  const clearGrid = () => {
    formik.setFieldValue('rows', formik.initialValues.rows)

    setFilteredItems([])
    setEditMode(false)
  }

  const handleClick = async dataList => {
    setFilteredItems([])

    const filteredItemsList = dataList
      .filter(item => item.metalId && item.metalId.toString().trim() !== '')
      .map(item => ({
        qty: item.countedQty,
        metalRef: null,
        metalId: item.metalId,
        metalPurity: item.metalPurity,
        weight: item.weight,
        priceType: item.priceType
      }))
    setFilteredItems(filteredItemsList)
    setEditMode(dataList.length > 0)
  }

  const isPosted = formik.values.status === 3

  const emptyGrid =
    formik?.values?.rows?.length < 2 &&
    (formik?.values?.rows[0]?.sku == undefined || formik?.values?.rows[0]?.sku == '')

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
          setFilteredItems([])
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
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal',
      disabled: formik.values.controllerId == null
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
      isSavedClear={false}
      disabledSubmit={!isSaved}
      actions={actions}
      maxAccess={access}
      resourceId={ResourceIds.IVPhysicalCountItemDetails}
      filteredItems={filteredItems}
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
                label={_labels.stockCount}
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
                    setFilteredItems([])
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
                label={_labels.site}
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
                    setFilteredItems([])
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
                label={_labels.controller}
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
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('rows', value)
            }}
            value={formik.values.controllerId ? formik.values?.rows : []}
            error={formik.errors?.rows}
            columns={columns}
            disabled={formik.values?.SCStatus == 3 || formik.values?.EndofSiteStatus == 3 || formik.values?.status == 3}
            allowDelete={formik.values?.SCStatus != 3 && formik.values?.SCWIP != 2 && formik.values?.status != 3}
            allowAddNewLine={formik.values?.SCStatus != 3 && formik.values?.EndofSiteStatus != 3}
            maxAccess={access}
            name='rows'
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ pt: 5 }}>
            <Grid item xs={2}>
              <CustomTextField
                name='totalQty'
                label={_labels.totalQty}
                value={getFormattedNumber(totalQty.toFixed(2))}
                readOnly={true}
                hidden={!formik.values.controllerId}
                maxAccess={access}
                numberField={true}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomTextField
                name='totalWeight'
                label={_labels.totalWeight}
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

export default PhysicalCountItemDe
