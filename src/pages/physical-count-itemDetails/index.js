import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useState, useRef } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Button, Grid, Hidden } from '@mui/material'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SCRepository } from 'src/repositories/SCRepository'
import FormShell from 'src/components/Shared/FormShell'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SystemChecks } from 'src/resources/SystemChecks'
import { ContactlessOutlined } from '@mui/icons-material'
import toast from 'react-hot-toast'

const PhysicalCountItemDe = () => {
  const { stack } = useWindow()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [siteStore, setSiteStore] = useState([])
  const [controllerStore, setControllerStore] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [disSkuLookup, setDisSkuLookup] = useState(false)
  const [jumpToNextLine, setJumpToNextLine] = useState(false)
  const [showDefaultQty, setShowDefaultQty] = useState(false)
  const [disableItemDuplicate, setDisableItemDuplicate] = useState(false)

  //const [defaultQty, setDefaultQty] = useState(1)

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.IVPhysicalCountItemDetails
  })

  const { formik } = useForm({
    initialValues: {
      stockCountId: '',
      siteId: '',
      controllerId: '',
      totalQty: '',
      totalWeight: '',
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
          countedQty: 1,
          weight: 0
        }
      ]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      stockCountId: yup.string().required(),
      siteId: yup.string().required(),
      controllerId: yup.string().required(),
      rows: yup.array().of(
        yup.object().shape({
          sku: yup.string().required(),
          itemName: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const copy = { ...obj }

      const items = obj?.rows?.map((item, index) => ({
        ...item,
        seqNo: index + 1,
        siteId: copy.siteId,
        stockCountId: copy.stockCountId,
        controllerId: copy.controllerId
      }))

      const StockCountItemDetailPack = {
        siteId: copy.siteId,
        controllerId: copy.controllerId,
        stockCountId: copy.stockCountId,
        items: items
      }

      console.log('inSave')
      console.log(StockCountItemDetailPack)

      const response = await postRequest({
        extension: SCRepository.StockCountItemDetail.set2,
        record: JSON.stringify(StockCountItemDetailPack)
      })

      toast.success(platformLabels.Edited)
      setEditMode(items.length > 0)
      checkPhyStatus(copy.stockCountId, copy.siteId, copy.controllerId)

      //const newItems = { list: items }
      handleClick(items)

      //fetchGridData
    }
  })

  async function fetchGridData(stockCountId, siteId, controllerId) {
    //getSysChecks()

    getDTDsku(stockCountId)

    await getRequest({
      extension: SCRepository.StockCountItemDetail.qry,
      parameters: `_stockCountId=${stockCountId}&_siteId=${siteId}&_controllerId=${controllerId}`
    })
      .then(res => {
        if (res.list) {
          const modifiedList = res.list?.map(({ ...rest }, index) => ({
            id: index + 1,
            ...rest
          }))
          formik.setFieldValue('rows', modifiedList)
        }

        setEditMode(res.list.length > 0)
        handleClick(res.list)
      })
      .catch(error => {})
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

  useEffect(() => {
    setTotals(formik.values.rows)
  }, [formik.values.rows])

  const setTotals = gridList => {
    let sumQty = 0
    let sumWeight = 0

    gridList.map(item => {
      sumQty += item.countedQty || 0
      sumWeight += item.weight || 0
    })

    formik.setFieldValue('totalQty', sumQty)
    formik.setFieldValue('totalWeight', sumWeight)
  }

  const fillSiteStore = stockCountId => {
    setSiteStore([])
    setControllerStore([])
    var parameters = `_stockCountId=${stockCountId}`
    getRequest({
      extension: SCRepository.Sites.qry,
      parameters: parameters
    })
      .then(res => {
        setSiteStore(res.list.filter(site => site.isChecked == true))
      })
      .catch(error => {})
  }

  const fillControllerStore = (stockCountId, siteId) => {
    var parameters = `_stockCountId=${stockCountId}&_siteId=${siteId}`
    getRequest({
      extension: SCRepository.StockCountControllerTab.qry,
      parameters: parameters
    })
      .then(res => {
        setControllerStore(res.list)
      })
      .catch(error => {})
  }

  const checkPhyStatus = async (stockCountId, siteId, controllerId) => {
    var parameters = `_stockCountId=${stockCountId}&_siteId=${siteId}&_controllerId=${controllerId}`

    const resp = await getRequest({
      extension: SCRepository.StockCountControllerTab.get,
      parameters: parameters
    })

    if (resp) {
      formik.setFieldValue('status', resp.record.status)
    }
  }

  async function getDTDsku(stockCountId) {
    let dtId
    let disableSKULookup = false

    const res = await getRequest({
      extension: SCRepository.StockCount.get,
      parameters: `_recordId=${stockCountId}`
    })

    console.log(dtId)
    console.log(res)
    console.log('resss', res?.record?.dtId)
    res?.record?.dtId ? (dtId = res?.record?.dtId) : null
    console.log(dtId)

    if (dtId) {
      const DTDres = await getRequest({
        extension: SCRepository.DocumentTypeDefaults.get,
        parameters: `_dtId=${dtId}`
      })
      console.log(DTDres)
      DTDres?.record?.disableSKULookup ? (disableSKULookup = DTDres?.record?.disableSKULookup) : false
    }

    console.log(disableSKULookup)
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

    //checkDefQty()
  }

  const defaultQty = !jumpToNextLine && !showDefaultQty ? 0 : 1

  /* const checkDefQty = async () => {
    console.log('check', jumpToNextLine, showDefaultQty)
    if (!jumpToNextLine) {
      if (!showDefaultQty) {
        setDefaultQty(0)
      }
    }
  } */

  const previousValuesRef = useRef(formik.values.rows)

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
          displayFieldWidth: 1
        }),
        jumpToNextLine: jumpToNextLine
      },
      async onChange({ row: { update, newRow } }) {
        update({
          countedQty: 1
        })

        let itemId
        if (!disSkuLookup) {
          itemId = newRow?.itemId
          if (disableItemDuplicate) {
            if (formik.values.rows.find(item => item.itemId == itemId)) {
              update({
                itemId: null,
                itemName: '',
                sku: null,
                priceType: null
              }) // not clearing
              /* const duplicateIndex = formik.values.rows.findIndex(item => item.itemId === itemId)
              if (duplicateIndex !== -1) {
                const updatedRows = formik.values.rows.filter((_, index) => index !== duplicateIndex)
                formik.setFieldValue('rows', updatedRows)
              } */
              /* const newRows = formik.values.rows.filter(({ id }) => id !== newRow.id)
              formik.setFieldValue('rows', newRows) */
            }

            /* console.log(formik.values.rows[1])
              console.log(`${formik.values.rows[1]}`)
              formik.setFieldValue(`${formik.values.rows[1]}`, {
                itemId: null,
                itemName: '',
                sku: '',
                priceType: null
              }) */
            return
          }
        }
        if (itemId) {
          // Fill Item Phy Properties
          const res = await getRequest({
            extension: InventoryRepository.Physical.get,
            parameters: `_itemId=${itemId}`
          })
          console.log(res)
          update({
            weight: res?.record?.weight ? res?.record?.weight : 0,
            metalPurity: res?.record?.metalPurity ? res?.record?.metalPurity : 0,
            metalId: res?.record?.metalId ? res?.record?.metalId : null,
            isMetal: res?.record?.isMetal ? res?.record?.isMetal : null
          })
        }
      },
      async onCellPress(e, { row: { addRow, oldValue, update } }) {
        if (!disSkuLookup) {
          console.log(e.target.value, oldValue.sku)

          // // const oldValue = formik.values.rows[id - 1]?.sku
          // if (e.target.value !== oldValue.sku) {

          const txtRes = await getRequest({
            extension: InventoryRepository.Items.get2,
            parameters: `_sku=${e.target.value}`
          })
          if (txtRes?.record) {
            const itemId = txtRes?.record?.recordId ? txtRes?.record?.recordId : ''
            addRow({
              fieldName: 'sku',
              changes: {
                id: oldValue.id,
                sku: e.target.value,
                itemId: itemId,
                itemName: txtRes?.record?.name ? txtRes?.record?.name : '',
                priceType: txtRes?.record?.metalId ? txtRes?.record?.priceType : 0
              }
            })
          } else {
            update({
              id: oldValue.id,
              sku: ''
            })
          }
        }

        // } else {
        //   addRow({ changes: null })
        // }
      }
    },

    /* {
      component: 'resourcelookup',
      label: _labels.sku,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,

        //parameters: '_type=',
        displayField: 'sku',
        valueField: 'recordId',
        columnsInDropDown: [
          { key: 'sku', value: 'sku' },
          { key: 'name', value: 'Name' },
          { key: 'flName', value: 'FL Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' },
          { from: 'priceType', to: 'priceType' }
        ],
        displayFieldWidth: 1
      } */

    //fill item weight
    /*  async onChange({ row: { update, oldRow, newRow } }) {
        if (newRow.accountId) {
          update({
            currencyRef: formValues.currencyRef,
            currencyId: formValues.currencyId,
            exRate: exRateValue
          })

          if (formValues.currencyId) {
            const result = await getCurrencyApi(formValues.currencyId)

            const result2 = result?.record
            const exRate = result2?.exRate
            const rateCalcMethod = result2?.rateCalcMethod

            const updatedRateRow = getRate({
              amount: newRow?.amount,
              exRate: exRate,
              baseAmount: newRow?.baseAmount,
              rateCalcMethod: rateCalcMethod,
              dirtyField: DIRTYFIELD_RATE
            })
            update({
              exRate: updatedRateRow.exRate,
              amount: updatedRateRow.amount,
              baseAmount: updatedRateRow.baseAmount
            })
          }
        }
      } */
    //},
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
      label: _labels.weight,
      name: 'weight', //calculate footer
      defaultValue: 0,
      props: {
        readOnly: true
      }
    }

    /* {
      component: 'numberfield',
      name: 'metalId',
      props :{
        hidden: true
      }
    },
    {
      component: 'numberfield',
      name: 'metalPurity',
      props :{
        hidden: true
      }
    },
    {
      component: 'textfield',
      name: 'isMetal',
      Hidden: true,
      props :{
        Hidden: true
      }
    }, */
  ]

  const clearGrid = () => {
    formik.setFieldValue('rows', formik.initialValues.rows)

    setFilteredItems([])
    setEditMode(false)
  }

  const handleClick = async dataList => {
    try {
      setFilteredItems([])
      console.log('in handle click')
      console.log(dataList)

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
    } catch (exception) {}
  }

  const isPosted =
    formik.values.status === 3 &&
    formik.values.SCStatus != 3 &&
    formik.values.SCWIP != 2 &&
    formik.values.EndofSiteStatus != 3

  const isHeader =
    formik.values.stockCountId != null && formik.values.siteId != null && formik.values.controllerId != null

  const isSaved =
    formik.values.stockCountId != null &&
    formik.values.siteId != null &&
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

    const res = await postRequest({
      extension: SCRepository.StockCountControllerTab.post,
      record: JSON.stringify(StockCountControllerTab)
    })

    if (status == 3) {
      // public enum StockCountPhysicalStatus
      /*  {
        PENDING = 1,
        STARTED = 2,
        CLOSED = 3
    } */
      //delete row hide
      toast.success(platformLabels.Unposted)
    } else {
      //delete row show
      toast.success(platformLabels.Posted)
    }
  }

  const actions = [
    {
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal'
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
    }
  ]

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isSavedClear={false}
      isSaved={isSaved}
      actions={actions}
      maxAccess={maxAccess}
      resourceId={ResourceIds.IVPhysicalCountItemDetails}
      filteredItems={filteredItems}
      previewReport={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={2}>
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
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('stockCountId', newValue?.recordId)
                  formik.setFieldValue('siteId', '')

                  if (!newValue) {
                    setSiteStore([])
                    setFilteredItems([])
                    clearGrid()
                    formik.setFieldValue('SCStatus', null)
                    formik.setFieldValue('SCWIP', null)

                    //setDisableItemDuplicate(false)
                  } else {
                    fillSiteStore(newValue?.recordId)
                    formik.setFieldValue('SCStatus', newValue?.status)
                    formik.setFieldValue('SCWIP', newValue?.wip)
                  }

                  setDisableItemDuplicate(!!newValue?.disableItemDuplicate)
                  console.log('bool', !!newValue?.disableItemDuplicate)
                }}
                error={formik.touched.stockCountId && Boolean(formik.errors.stockCountId)}
              />
            </Grid>
            <Grid item xs={2}>
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
                  formik.setFieldValue('controllerId', '')

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
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2}>
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
                  checkPhyStatus(formik.values.stockCountId, formik.values.siteId, formik.values.controllerId)
                  fetchGridData(formik.values.stockCountId, formik.values.siteId, newValue?.controllerId)
                }}
                error={formik.touched.controllerId && Boolean(formik.errors.controllerId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                onClick={clearGrid}
                sx={{
                  backgroundColor: '#f44336',
                  '&:hover': {
                    backgroundColor: '#f44336',
                    opacity: 0.8
                  },
                  ml: 2
                }}
                variant='contained'
              >
                <img src='/images/buttonsIcons/clear.png' alt={platformLabels.Clear} />
              </Button>
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('rows', value)
            }}
            value={formik.values?.rows}
            error={formik.errors?.rows}
            columns={columns}
            disabled={formik.values?.SCStatus !=3 && formik.values?.EndofSiteStatus !=3}
            allowDelete={formik.values?.SCStatus !=3 && formik.values?.SCWIP != 2 && formik.values?.status != 3}
            allowAddNewLine={formik.values?.SCStatus !=3 && formik.values?.EndofSiteStatus !=3}
          />
        </Grow>
        <Fixed>
          <Grid container justifyContent='flex-end' spacing={2} sx={{ pt: 5 }}>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalQty'
                label={_labels.totalQty}
                value={formik.values.totalQty}
                readOnly={true}
                hidden={!(formik.values.stockCountId && formik.values.siteId && formik.values.controllerId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomNumberField
                name='totalWeight'
                label={_labels.totalWeight}
                value={formik.values.totalWeight}
                readOnly={true}
                hidden={!(formik.values.stockCountId && formik.values.siteId && formik.values.controllerId)}
              />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default PhysicalCountItemDe
