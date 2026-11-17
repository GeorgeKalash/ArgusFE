import { useState, useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

export default function DimensionsTab({ labels, maxAccess, store, isActive }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { systemDefaults } = useContext(DefaultsContext)
  const { platformLabels } = useContext(ControlContext)
  const employeeDmgId = parseInt(systemDefaults?.list?.find(({ key }) => key === 'employeeDmgId')?.value) || null
  const [dimensions, setDimensions] = useState([])
  const [comboStore, setComboStore] = useState([])
  const [hasSavedData, setHasSavedData] = useState(false)

  const isEmptyValue = value => value === '' || value === undefined || value === null
  const computeHasSavedData = values => Object.values(values).some(value => !isEmptyValue(value))

  const { formik } = useForm({
    initialValues: { employeeId: employeeDmgId },
    onSubmit: async values => {
      await saveDimensionValues(platformLabels.Edited, values)
      setHasSavedData(dimensions.some(dimension => !isEmptyValue(values[dimension.dimensionId])))
    }
  })

  async function saveDimensionValues(toastMessage, values) {
    const filteredData = dimensions
      .map(dimension => ({
        dimension: dimension.dimensionId,
        id: values[dimension.dimensionId],
        employeeId: recordId
      }))
      .filter(item => !isEmptyValue(item.id))

    await postRequest({
      extension: EmployeeRepository.Dimensions.set2,
      record: JSON.stringify({ employeeId: recordId, data: filteredData })
    })

    toast.success(toastMessage)
  }

  const deleteDimensionFields = async () => {
    const clearedValues = dimensions.reduce((acc, dimension) => {
      acc[dimension.dimensionId] = ''

      return acc
    }, {})

    const values = { ...formik.values, ...clearedValues }
    formik.setValues(values)
    if (hasSavedData) {
      await saveDimensionValues(platformLabels.Deleted, values)
      setHasSavedData(false)
    } else {
      toast.success(platformLabels.Cleared)
    }
  }

  const actions = [
    {
      key: 'Delete',
      condition: true,
      onClick: deleteDimensionFields,
      disabled: !hasSavedData || !isActive
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (!employeeDmgId) return

      const res = await getRequest({
        extension: EmployeeRepository.Dimensions.packEM,
        parameters: `_employeeId=${recordId}&_dimGroupId=${employeeDmgId}`
      })

      if (!res?.record) return

      const { dimensionGroupElements = [], employeeDimensions = [], dimensions = [] } = res.record
      setDimensions(dimensionGroupElements)
      setComboStore(dimensions)

      const newDimensionValues = employeeDimensions.reduce((acc, item) => {
        acc[item.dimension] = item.id

        return acc
      }, {})

      setHasSavedData(computeHasSavedData(newDimensionValues))

      formik.setValues(prev => ({
        ...prev,
        ...newDimensionValues
      }))
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} actions={actions} disabledSubmit={!isActive}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={EmployeeRepository.EmployeeDimensionGroup.qry}
                name='employeeId'
                label={labels.dmg}
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                readOnly
                maxAccess={maxAccess}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
              />
            </Grid>
            {dimensions && dimensions.length > 0 && (
              <Grid item xs={12}>
                <FieldSet title={labels.dimensions}>
                  {dimensions?.map((dimension, index) => {
                    const dimensionNumber = dimension.dimensionId
                    const options = (comboStore || []).filter(d => d.dimension === dimensionNumber)

                    return (
                      <Grid container mt={0.2} spacing={2} key={index}>
                        <Grid item xs={12}>
                          <ResourceComboBox
                            store={options}
                            name={`${dimension.dimensionId}`}
                            label={dimension.dimensionName}
                            valueField='id'
                            displayField='name'
                            maxAccess={maxAccess}
                            values={formik.values}
                            readOnly={!isActive}
                            onChange={(_, newValue) =>
                              formik.setFieldValue(`${dimension.dimensionId}`, newValue?.id || null)
                            }
                          />
                        </Grid>
                      </Grid>
                    )
                  })}
                </FieldSet>
              </Grid>
            )}
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}