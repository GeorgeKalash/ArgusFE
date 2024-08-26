import { useForm } from 'src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import PeriodsModuleForm from './PeriodsModuleForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataSets } from 'src/resources/DataSets'
import { formatDateFromApi } from 'src/lib/date-helper'
import { ControlContext } from 'src/providers/ControlContext'

const PeriodsForm = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const { recordId } = store

  const editMode = !!recordId

  const post = async obj => {
    try {
      const data = {
        fiscalYear: recordId,
        periods: obj.map(({ id, periodId, ...rest }) => ({
          periodId: id,
          ...rest
        }))
      }
      await postRequest({
        extension: SystemRepository.FiscalPeriodPack.set2,
        record: JSON.stringify(data)
      })

      toast.success(platformLabels.Edited)
      getPeriods()
    } catch (error) {}
  }

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      periods: []
    },
    maxAccess,
    enableReinitialize: false,
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
    <FormShell
      form={formik}
      resourceId={ResourceIds.FiscalYears}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
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
    </FormShell>
  )
}

export default PeriodsForm
