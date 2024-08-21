import React, { useEffect } from 'react'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { SaleRepository } from 'src/repositories/SaleRepository'

const SalesZonesLevels = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.SalesZoneLevels
  })

  useEffect(() => {
    getGridData()
  }, [])

  function getGridData() {
    formik.setValues({
      items: [
        {
          id: 1,
          levelId: null,
          name: ''
        }
      ]
    })

    getRequest({
      extension: SaleRepository.SaleZoneLevel.qry
    })
      .then(res => {
        const result = res.list

        const processedData = result.map((item, index) => ({
          id: index + 1,
          levelId: item?.levelId,
          name: item?.name
        }))
        res.list.length > 0 && formik.setValues({ items: processedData })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const { formik } = useForm({
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object().shape({
          levelId: yup
            .number()
            .required('Level ID is required')
            .integer('Level ID must be an integer')
            .min(0, 'Level ID must be at least 0')
            .max(9, 'Level ID must be no more than 9')
            .test('is-unique', 'Level ID must be unique', function (value) {
              const { parent } = this
              const itemList = formik.values.items
              const duplicate = itemList.find(item => item.levelId === value && item.id !== parent.id)

              return !duplicate
            }),
          name: yup.string().required()
        })
      )
    }),
    initialValues: {
      items: [
        {
          id: 1,
          levelId: null,
          name: ''
        }
      ]
    },
    onSubmit: async values => {
      try {
        const data = {
          items: values.items
        }

        await postRequest({
          extension: SaleRepository.SaleZoneLevel.set2,
          record: JSON.stringify(data)
        })
        toast.success(platformLabels.Saved)
      } catch (error) {}
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.levelId,
      name: 'levelId'
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('items', value)}
          value={formik.values.items}
          error={formik.errors.items}
          columns={columns}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default SalesZonesLevels
