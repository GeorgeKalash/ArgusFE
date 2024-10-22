import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Button, Grid } from '@mui/material'
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

const PhysicalCountItemDe = () => {
  const { stack } = useWindow()
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])
  const [siteStore, setSiteStore] = useState([])
  const [controllerStore, setControllerStore] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [disSkuLookup, setDisSkuLookup] = useState(false)

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
      rows: [
        {
          id: 1,
          sku: '',
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
      controllerId: yup.string().required()
    }),
    onSubmit: values => {}
  })

  async function fetchGridData(stockCountId, siteId, controllerId) {
    getDTDsku(stockCountId)

    await getRequest({
      extension: SCRepository.StockCountItemDetail.qry,
      parameters: `_stockCountId=${stockCountId}&_siteId=${siteId}&_controllerId=${controllerId}`
    })
      .then(res => {
        if (!res.list) {
          //print
        } else {
          //print
          const modifiedList = res.list?.map(({ ...rest }, index) => ({
            id: index + 1,
            ...rest
          }))
          formik.setFieldValue('rows', modifiedList)
        }

        setEditMode(res.list.length > 0)

        //handleClick(res.list)
      })
      .catch(error => {})
  }

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
        setSiteStore(res.list)

        //enable import
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

        //enable import
      })
      .catch(error => {})
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

  async function fillItemProps(itemId) {
    /* const res = await getRequest({
      extension: SCRepository.StockCount.get,
      parameters: `_recordId=${stockCountId}`
    }) */
  }

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
        jumpToNextLine: true
      },
      async onChange({ row: { update, oldRow, newRow } }) {
        // update({
        //   countedQty: 1
        // })
        console.log(oldRow)
        console.log(newRow)

        /* if (newRow.accountId) {
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
        } */
      }

      //skuFocusLeaveHandler
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
      defaultValue: 1
    },
    {
      component: 'numberfield',
      label: _labels.weight,
      name: 'weight', //calculate footer
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

  /* const handleClick = async dataList => {
    try {
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
    } catch (exception) {}
  }

  const actions = [
    {
      key: 'Metals',
      condition: true,
      onClick: 'onClickMetal'
    }
  ] */

  return (
    <FormShell
      form={formik}
      isInfo={false}
      isSavedClear={false}
      //actions={actions}
      maxAccess={maxAccess}
      resourceId={ResourceIds.IVPhysicalCountItemDetails}
      //filteredItems={filteredItems}
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
                  } else {
                    fillSiteStore(newValue?.recordId)
                  }
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
                  } else {
                    fillControllerStore(formik.values.stockCountId, newValue?.siteId)
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
