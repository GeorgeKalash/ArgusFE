import { Grid } from '@mui/material'
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
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import { useState } from 'react'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { useForm } from 'src/hooks/form'

const ProductLegForm = ({ store, labels, editMode, maxAccess, active }) => {
  const { recordId: pId, countries, _seqNo, rowSelectionSaved } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [commissionColumns, setCommissionColumns] = useState([])
  const [commission, setCommission] = useState([])

  const isNumeric = str => {
    return !isNaN(str) && !isNaN(parseFloat(str))
  }

  const post = obj => {
    const data = {
      productId: pId,
      seqNo: _seqNo,
      productScheduleRanges: obj.map(({ id, fromAmount, toAmount }, index) => ({
        seqNo: _seqNo,
        rangeSeqNo: id,
        productId: pId,
        fromAmount,
        toAmount
      })),
      productScheduleFees: obj.flatMap(({ id, seqNo, rangeSeqNo, saved, productId, ...rest }, index) => {
        const commissions = []

        for (const [key, value] of Object.entries(rest)) {
          if (isNumeric(key)) {
            commissions.push({
              seqNo: _seqNo,
              rangeSeqNo: id,
              productId: pId,
              commissionId: parseInt(key),
              commission: value || 0
            })
          }
        }

        return commissions
      })
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductScheduleRanges.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success(platformLabels.Edited)
        getScheduleRange()
      })
      .catch(error => {})
  }

  const { formik } = useForm({
    initialValues: {
      seqNo: '',
      productRanges: [
        {
          id: 1,
          seqNo: '',
          rangeSeqNo: 1,
          fromAmount: '',
          toAmount: ''
        }
      ]
    },
    enableReinitialize: false,
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      productRanges: yup
        .array()
        .of(
          yup.object().shape({
            fromAmount: yup.string().required(),
            toAmount: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: values => {
      post(values.productRanges)
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
      name: item.recordId.toString()
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

    return 1
  }

  useEffect(() => {
    const fetchData = async () => {
      if (commissionColumns?.length < 1) {
        await getColumns()
      }
      if (_seqNo && active && rowSelectionSaved) {
        getScheduleRange(_seqNo)
      }
    }

    fetchData()
  }, [_seqNo, active, rowSelectionSaved])

  const getScheduleRange = async () => {
    if (_seqNo !== formik.values.seqNo) {
      formik.setFieldValue('seqNo', _seqNo)
      const defaultParams = `_productId=${pId}&_seqNo=${_seqNo}`
      const parameters = defaultParams

      const allCommissionFees = await getRequest({
        extension: RemittanceSettingsRepository.ProductScheduleFees.qry, //qryPSF
        parameters: `_productId=${pId}&_seqNo=${_seqNo}&_rangeSeqNo=${0}`
      })

      const res = await getRequest({
        extension: RemittanceSettingsRepository.ProductScheduleRanges.qry,
        parameters: parameters
      })

      const productLegsPromises = res?.list?.map(async (item, index) => {
        const commissionFees = await allCommissionFees?.list?.filter(value => value.rangeSeqNo === item.rangeSeqNo)

        try {
          const commissionFeesMap = commissionFees.reduce((acc, fee) => {
            acc[fee?.commissionId] = fee?.commission

            return acc
          }, {})

          const rows = commission.map(commissionType => {
            return {
              [commissionType?.name]: commissionFeesMap[commissionType?.name] || ''
            }
          })

          return {
            id: index + 1,
            saved: true,
            ...item,
            ...Object.assign({}, ...rows)
          }
        } catch (error) {
          return
        }
      })

      const productScheduleRanges = await Promise.all(productLegsPromises)

      formik.setFieldValue('productRanges', productScheduleRanges)
    }
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.ProductMaster}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      isSaved={!!rowSelectionSaved}
      infoVisible={!!rowSelectionSaved}
    >
      {rowSelectionSaved && active && (
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
          {active && rowSelectionSaved && commissionColumns.length > 0 && (
            <Grow key={active}>
              <DataGrid
                onChange={value => formik.setFieldValue('productRanges', value)}
                value={formik.values.productRanges}
                error={formik.errors.productRanges}
                columns={commissionColumns}
                name='productRanges'
                maxAccess={maxAccess}
              />
            </Grow>
          )}
        </VertLayout>
      )}
    </FormShell>
  )
}

export default ProductLegForm
