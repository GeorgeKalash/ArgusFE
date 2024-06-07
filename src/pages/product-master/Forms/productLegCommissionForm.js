import { Grid, Box } from '@mui/material'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ProductLegCommissionForm = ({ row, labels, maxAccess, store }) => {
  const { recordId: pId, seqNo } = store

  const { getRequest, postRequest } = useContext(RequestsContext)

  const columns = [
    {
      component: 'textfield',
      label: labels.commissionType,
      name: 'commissionName',
      props: {
        mandatory: true,
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.commission,
      name: 'commission',
      props: {
        mandatory: true,
        readOnly: false
      }
    }
  ]

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      productLegCommission: yup
        .array()
        .of(
          yup.object().shape({
            commission: yup.string().required('commission is required')
          })
        )
        .required('productLegCommission array is required')
    }),
    initialValues: {
      productLegCommission: [
        { id: 1, productId: '', seqNo: 1, rangeSeqNo: '', commissionId: '', commissionName: '', commission: '' }
      ]
    },
    onSubmit: values => {
      post(values.productLegCommission)
    }
  })

  useEffect(() => {
    row && getCommissions(row)
  }, [row])

  const getCommissions = obj => {
    var parameters = '_filter='
    getRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.qry,
      parameters: parameters
    })
      .then(commissionTypes => {
        const _productId = obj.productId
        const _seqNo = obj.seqNo
        const _rangeSeqNo = obj.rangeSeqNo
        const defaultParams = `_productId=${_productId}&_seqNo=${_seqNo}&_rangeSeqNo=${_rangeSeqNo}`
        var parameters = defaultParams
        getRequest({
          extension: RemittanceSettingsRepository.ProductScheduleFees.qry, //qryPSF
          parameters: parameters
        })
          .then(commissionFees => {
            const commissionFeesMap = commissionFees.list.reduce((acc, fee) => {
              acc[fee.commissionId] = fee.commission

              return acc
            }, {})

            const rows = commissionTypes.list.map((commissionType, index) => {
              const commissionValue = commissionFeesMap[commissionType.recordId] || 0

              return {
                id: index + 1,
                productId: obj.productId,
                seqNo: obj.seqNo,
                rangeSeqNo: obj.rangeSeqNo,
                commissionId: commissionType.recordId,
                commissionName: commissionType.name,
                commission: commissionValue
              }
            })

            formik.setValues({ productLegCommission: rows })
          })
          .catch(error => {})
      })
      .catch(error => {})
  }

  const post = obj => {
    const data = {
      productId: pId,
      seqNo: seqNo,
      rangeSeqNo: row.rangeSeqNo,
      productScheduleFees: obj?.filter(item => item.commission > 0)
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductScheduleFees.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
      .catch(error => {})
  }

  return (
    <FormShell
      form={formik}
      isCleared={false}
      infoVisible={false}
      resourceId={ResourceIds.ProductMaster}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('productLegCommission', value)}
            value={formik.values.productLegCommission}
            error={formik.errors.productLegCommission}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ProductLegCommissionForm
