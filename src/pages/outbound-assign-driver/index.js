import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'

const OutboundAssignDriver = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access: maxAccess } = useResourceQuery({
    datasetId: ResourceIds.OutboundAssignDriver
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      tripList: []
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      tripList: yup.array().of(
        yup.object().shape({
          vehicleId: yup.string().required(),
          departureTime: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const list = obj.tripList?.map((item, index) => {
        return {
          ...item,
          departureTime: formatDateToApi(item?.departureTime)
        }
      })

      console.log('check obj', obj.tripList)

      // const res = await postRequest({
      //   extension: DeliveryRepository.Trip.assign,
      //   record: JSON.stringify({ tripList: list })
      // })
      // toast.success(platformLabels.Edited)
      // refetchForm(res.recordId)
    }
  })

  async function refetchForm() {
    const res = await getRequest({
      extension: DeliveryRepository.Trip.unassign,
      parameters: ``
    })

    const modifiedList =
      res?.list?.length > 0
        ? res?.list?.map((item, index) => {
            return {
              ...item,
              id: index + 1,
              date: formatDateFromApi(item?.date),
              departureTime: formatDateFromApi(item?.departureTime)
            }
          })
        : []
    formik.setFieldValue('tripList', modifiedList)
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.reference,
      name: 'reference',
      props: {
        readOnly: true
      }
    },
    {
      component: 'date',
      name: 'date',
      label: labels.date,
      props: {
        readOnly: true
      }
    },
    {
      component: 'date',
      name: 'departureTime',
      label: labels.departureDate
    },
    {
      component: 'resourcecombobox',
      label: labels.vehicle,
      name: 'vehicleId',
      props: {
        endpointId: DeliveryRepository.Vehicle.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'vehicleId' },
          { from: 'name', to: 'vehName' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.driver,
      name: 'driverId',
      props: {
        endpointId: DeliveryRepository.Driver.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'driverId' },
          { from: 'name', to: 'driverName' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.notes,
      name: 'notes',
      props: {
        readOnly: true
      }
    }
  ]

  useEffect(() => {
    refetchForm()
  }, [])

  return (
    <FormShell form={formik} infoVisible={false} visibleClear={false} isCleared={false} isSavedClear={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('tripList', value)}
            value={formik.values.tripList}
            error={formik.errors.tripList}
            columns={columns}
            name='tripList'
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default OutboundAssignDriver
