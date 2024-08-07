import { Grid, Box, Checkbox } from '@mui/material'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useState } from 'react'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const FeesDetailsForm = ({ store, labels, editMode, maxAccess }) => {
  const { recordId: pId } = store
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
      feeScheduleDetail: obj.map(({ id, fromAmount, toAmount }, index) => ({
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
      extension: RemittanceOutwardsRepository.FreeScheduleDetail.set,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success(platformLabels.Edited)
        getScheduleRange()
      })
      .catch(error => {})
  }

  const formik = useFormik({
    initialValues: {
      productLegs: [
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
    validateOnChange: true,
    validationSchema: yup.object({
      productLegs: yup
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
      post(values.productLegs)
    }
  })

  const getColumns = async () => {
    const response = await getRequest({
      extension: RemittanceOutwardsRepository.FreeScheduleDetail.qry,
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
      const allCommissionFees = await getRequest({
        extension: RemittanceOutwardsRepository.FreeScheduleDetail.qry, //qryPSF
        parameters: `_productId=${pId}&_seqNo=${_seqNo}&_rangeSeqNo=${0}`
      })

      const res = await getRequest({
        extension: RemittanceOutwardsRepository.FreeScheduleDetail.qry,
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

      const productLegs = await Promise.all(productLegsPromises)

      formik.setFieldValue('productLegs', productLegs)
    } catch (error) {}
  }

  return (
    store.plantId &&
    store.currencyId && (
      <FormShell form={formik} resourceId={ResourceIds.FeeSchedule} maxAccess={maxAccess} editMode={editMode}>
        <VertLayout>
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

export default FeesDetailsForm
