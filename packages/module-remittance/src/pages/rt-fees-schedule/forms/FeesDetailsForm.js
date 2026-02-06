import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import * as yup from 'yup'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { RemittanceOutwardsRepository } from '@argus/repositories/src/repositories/RemittanceOutwardsRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const FeesDetailsForm = ({ store, labels, maxAccess }) => {
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
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('FeeScheduleDetail', value)}
            value={formik.values.FeeScheduleDetail}
            error={formik.errors.FeeScheduleDetail}
            columns={columns}
            maxAccess={maxAccess}
            name='FeeScheduleDetail'
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default FeesDetailsForm
