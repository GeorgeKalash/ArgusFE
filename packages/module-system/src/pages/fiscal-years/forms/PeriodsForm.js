import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import PeriodsModuleForm from './PeriodsModuleForm'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const PeriodsForm = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const { recordId } = store

  const post = async obj => {
    const data = {
      fiscalYear: recordId,
      periods: obj.map(({ id, periodId, startDate, endDate, ...rest }) => ({
        periodId: id,
        startDate: formatDateToApi(startDate),
        endDate: formatDateToApi(endDate),
        ...rest
      }))
    }
    await postRequest({
      extension: SystemRepository.FiscalPeriodPack.set2,
      record: JSON.stringify(data)
    })

    toast.success(platformLabels.Edited)
    getPeriods()
  }

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      periods: []
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      periods: yup
        .array()
        .of(
          yup.object().shape({
            statusName: yup.string().required(),
            startDate: yup.string().required(),
            endDate: yup.string().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      await post(values.periods)
    }
  })

  const editMode = !!formik.values.recordId

  const columns = [
    {
      component: 'numberfield',
      label: labels?.period,
      name: 'periodId',
      props: {
        readOnly: true
      }
    },
    {
      component: 'date',
      name: 'startDate',
      label: labels?.startDate
    },
    {
      component: 'date',
      name: 'endDate',
      label: labels?.endDate
    },
    {
      component: 'resourcecombobox',
      label: labels?.status,
      name: 'statusName',
      props: {
        datasetId: DataSets.FY_PERIOD_STATUS,
        valueField: 'key',
        displayField: 'value',
        widthDropDown: 200,
        mapping: [
          { from: 'key', to: 'status' },
          { from: 'value', to: 'statusName' }
        ],
        columnsInDropDown: [{ key: 'value', value: 'Name' }],
        displayFieldWidth: 2
      }
    },
    {
      component: 'button',
      name: 'saved',
      onClick: (e, row) => {
        stack({
          Component: PeriodsModuleForm,
          props: {
            labels,
            maxAccess,
            row,
            recordId
          },
          width: 600,

          title: labels?.period
        })
      }
    }
  ]

  useEffect(() => {
    if (recordId) getPeriods()
  }, [recordId])

  const getPeriods = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.Period.qry,
        parameters: `_fiscalYear=${recordId}`
      })
      if (res.list?.length > 0) {
        const periods = res.list.map(({ id, periodId, startDate, endDate, ...rest }, index) => {
          return {
            id: index + 1,
            periodId: index + 1,
            startDate: formatDateFromApi(startDate),
            endDate: formatDateFromApi(endDate),
            saved: true,
            ...rest
          }
        })

        formik.setValues({
          recordId: recordId,
          periods: periods
        })
      }
    } catch (error) {}
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('periods', value)}
            value={formik.values?.periods}
            error={formik.errors?.periods}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PeriodsForm
