import { Grid, Box, Checkbox } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ProductLegCommissionForm from './productLegCommissionForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import { useState } from 'react'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const ProductLegForm = ({ store, labels, expanded, editMode, maxAccess }) => {
  const { recordId: pId, countries, _seqNo } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [commissionColumns, setCommissionColumns] = useState()
  const [commission, setCommission] = useState()

  const post = obj => {
    const data = {
      productId: pId,
      seqNo: _seqNo,
      productScheduleRanges: obj.map(({ id, seqNo, rangeSeqNo, saved, productId, ...rest }, index) => ({
        seqNo: _seqNo,
        rangeSeqNo: id,
        productId: pId,
        ...rest
      }))
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductScheduleRanges.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success(platformLabels.Edited)
        getScheduleRange()
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }

  const formik = useFormik({
    initialValues: {
      productLegs: [
        {
          id: 1,
          seqNo: '',
          rangeSeqNo: 1, //incremental
          fromAmount: '',
          toAmount: ''
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      productLegs: yup
        .array()
        .of(
          yup.object().shape({
            toAmount: yup.string().required('to Amount is required'),
            fromAmount: yup.string().required('From Amount is required')
          })
        )
        .required('productLegs array is required')
    }),
    onSubmit: values => {
      post(values.productLegs)
    }
  })

  const getColumns = async () => {
    const response = await getRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.qry,
      parameters: '_filter='
    })

    const result = await response.list.map(item => ({
      component: 'numberfield',
      label: item.name,
      name: item.recordId
    }))

    const columns = [
      {
        component: 'numberfield',
        label: labels.fromAmount,
        name: 'fromAmount'
      },
      {
        component: 'numberfield',
        label: labels.toAmount,
        name: 'toAmount'
      }
    ]

    setCommission(result)

    setCommissionColumns([...columns, ...result])
  }

  useEffect(() => {
    getColumns()
  }, [pId])

  useEffect(() => {
    _seqNo && getScheduleRange(_seqNo)
  }, [_seqNo])

  const getScheduleRange = async () => {
    const defaultParams = `_productId=${pId}&_seqNo=${_seqNo}`
    const parameters = defaultParams

    try {
      const res = await getRequest({
        extension: RemittanceSettingsRepository.ProductScheduleRanges.qry,
        parameters: parameters
      })

      const productLegsPromises = res.list.map(async (item, index) => {
        try {
          const commissionFees = await getRequest({
            extension: RemittanceSettingsRepository.ProductScheduleFees.qry, //qryPSF
            parameters: `_productId=${item.productId}&_seqNo=${item.seqNo}&_rangeSeqNo=${item.rangeSeqNo}`
          })

          const commissionFeesMap = commissionFees.list.reduce((acc, fee) => {
            acc[fee?.commissionId] = fee?.commission

            return acc
          }, {})

          const rows = commission.map(commissionType => {
            return {
              [commissionType?.name]: commissionFeesMap[commissionType?.name] || 0
            }
          })

          return {
            id: index + 1,
            saved: true,
            ...item,
            ...Object.assign({}, ...rows)
          }
        } catch (error) {
          console.error('Error fetching commission fees:', error)

          return
        }
      })

      const productLegs = await Promise.all(productLegsPromises)

      formik.setFieldValue('productLegs', productLegs)
    } catch (error) {
      console.error('Error fetching schedule range:', error)
    }
  }

  return (
    store.plantId &&
    store.currencyId && (
      <FormShell form={formik} resourceId={ResourceIds.ProductMaster} maxAccess={maxAccess} editMode={editMode}>
        <VertLayout>
          <Fixed>
            <Grid container xs={12} spacing={3}>
              <Grid item xs={3}>
                <ResourceComboBox
                  endpointId={SystemRepository.Plant.qry}
                  name='plantId'
                  label={labels.plant}
                  valueField='recordId'
                  values={store}
                  readOnly={true}
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                />
              </Grid>
              <Grid item xs={3}>
                <ResourceComboBox
                  store={countries}
                  name='countryId'
                  label={labels.country}
                  readOnly={true}
                  valueField='countryId'
                  displayField={['countryRef', 'countryName']}
                  columnsInDropDown={[
                    { key: 'countryRef', value: 'Reference' },
                    { key: 'countryName', value: 'Name' }
                  ]}
                  values={store}
                />
              </Grid>
              <Grid item xs={3}>
                <ResourceComboBox
                  name='currencyId'
                  label={labels.currency}
                  endpointId={SystemRepository.Currency.qry}
                  valueField='recordId'
                  values={store}
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={true}
                />
              </Grid>
              <Grid item xs={3}>
                {}
                <ResourceComboBox
                  store={store?.dispersals}
                  name='dispersalId'
                  label={labels.dispersal}
                  valueField='recordId'
                  values={store}
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly={true}
                />
              </Grid>
            </Grid>
          </Fixed>
          <Grow key={_seqNo}>
            <DataGrid
              onChange={value => formik.setFieldValue('productLegs', value)}
              value={formik.values.productLegs}
              error={formik.errors.productLegs}
              columns={commissionColumns}
            />
          </Grow>
        </VertLayout>
      </FormShell>
    )
  )
}

export default ProductLegForm
