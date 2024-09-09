import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import * as yup from 'yup'
import { DataSets } from 'src/resources/DataSets'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { ControlContext } from 'src/providers/ControlContext'

const FeesDetailsForm = ({ store, labels }) => {
  const { recordId: pId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useEffect(() => {
    getGridData(pId)
  }, [pId])

  function getGridData(scheduleId) {
    formik.setValues({
      scheduleId: pId,
      FeeScheduleDetail: [
        {
          id: 1,
          seqNo: 1,
          amountTo: '',
          amountFrom: '',
          feeAmount: '',
          feeType: '',
          feeTypeName: ''
        }
      ]
    })

    if (scheduleId) {
      getRequest({
        extension: RemittanceOutwardsRepository.FeeScheduleDetail.qry,

        parameters: `_scheduleId=${scheduleId}`
      })
        .then(res => {
          const result = res.list

          const processedData = result.map((item, index) => ({
            ...item,
            id: index + 1,
            seqNo: index + 1
          }))
          result && formik.setValues({ FeeScheduleDetail: processedData })
        })
        .catch(error => {})
    }
  }

  const columns = [
    {
      component: 'numberfield',
      label: labels.amountFrom,
      name: 'amountFrom'
    },
    {
      component: 'numberfield',
      label: labels.amountTo,
      name: 'amountTo'
    },

    {
      component: 'resourcecombobox',
      name: 'feeType',
      label: labels.feeType,
      props: {
        datasetId: DataSets.FeesType,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'feeType' },
          { from: 'value', to: 'feeTypeName' }
        ]
      }
    },

    {
      component: 'textfield',
      label: labels.feeAmount,
      name: 'feeAmount'
    }
  ]

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      FeeScheduleDetail: yup
        .array()
        .of(
          yup.object().shape({
            amountFrom: yup.string().required(),
            amountTo: yup.string().required(),
            feeAmount: yup.string().required(),
            feeType: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      scheduleId: pId,
      FeeScheduleDetail: [
        {
          id: 1,
          seqNo: 1,
          amountTo: '',
          amountFrom: '',
          feeAmount: '',
          feeType: '',
          feeTypeName: ''
        }
      ]
    },
    onSubmit: async values => {
      await post(values)
    }
  })

  const post = async obj => {
    const res = obj.FeeScheduleDetail.map(({ seqNo, scheduleId, ...rest }, index) => ({
      seqNo: index + 1,
      scheduleId: pId,
      ...rest
    }))

    const data = {
      scheduleId: pId,
      items: res
    }

    await postRequest({
      extension: RemittanceOutwardsRepository.FeeScheduleDetail.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Submit)
      })
      .catch(error => {})
  }

  return (
    <FormShell form={formik} infoVisible={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('FeeScheduleDetail', value)}
            value={formik.values.FeeScheduleDetail}
            error={formik.errors.FeeScheduleDetail}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default FeesDetailsForm
