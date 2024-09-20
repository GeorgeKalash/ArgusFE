import { useState, useContext, useEffect } from 'react'

import { RequestsContext } from 'src/providers/RequestsContext'

import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form.js'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const PropertiesForm = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { platformLabels } = useContext(ControlContext)

  const [dimensions, setDimensions] = useState([])
  const [dimensionsUDT, setDimensionsUDT] = useState([])

  useEffect(() => {
    if (recordId) {
      const fetchDimension = async () => {
        try {
          const response = await getRequest({
            extension: SystemRepository.Defaults.qry,
            parameters: `_filter=`
          })

          const filteredDimensions = response.list.filter(
            item => item.key.includes('ivtDimension') && item.value.length > 0
          )
          setDimensions(filteredDimensions)

          const filteredDimensions2 = response.list.filter(
            item => item.key.includes('ivtUDT') && item.key !== 'ivtUDTCount' && item.value.length > 0
          )
          setDimensionsUDT(filteredDimensions2)
          console.log(filteredDimensions2, 'ivtUDT')
        } catch (error) {}
      }

      fetchDimension()
    }
  }, [])

  const { formik } = useForm({
    initialValues: {},

    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async () => {
      const submissionData = dimensions.map(dimension => {
        const dimensionNumber = dimension.key.match(/\d+$/)?.[0]

        return {
          dimension: dimensionNumber,
          id: formik.values[dimension.key],
          itemId: recordId
        }
      })

      const filteredData = submissionData.filter(item => item.id !== '' && item.id !== undefined && item.id !== null)

      const udtData = dimensionsUDT.map(udt => {
        const udtNumber = udt.key.match(/\d+$/)?.[0]

        return {
          dimension: udtNumber,
          itemId: recordId,
          value: formik.values[udt.key]
        }
      })

      const filteredUdtData = udtData.filter(
        item => item.value !== '' && item.value !== undefined && item.value !== null
      )

      try {
        if (filteredData.length > 0) {
          await postRequest({
            extension: InventoryRepository.DimensionId.set,
            record: JSON.stringify({
              itemId: recordId,
              data: filteredData
            })
          })
        }

        if (filteredUdtData.length > 0) {
          await postRequest({
            extension: InventoryRepository.DimensionUDT.set,
            record: JSON.stringify({
              itemId: recordId,
              data: filteredUdtData
            })
          })
        }
      } catch (error) {}
    }
  })

  useEffect(() => {
    const fetchDimensionsData = async () => {
      if (recordId && dimensions.length > 0) {
        try {
          const requests = dimensions.map(dimension => {
            const dimensionNumber = dimension.key.match(/\d+$/)?.[0]

            return getRequest({
              extension: InventoryRepository.DimensionId.get,
              parameters: `_itemId=${recordId}&_dimension=${dimensionNumber}`
            })
          })

          const responses = await Promise.all(requests)

          const newValues = responses.reduce((acc, res, index) => {
            const dimensionKey = dimensions[index].key
            acc[dimensionKey] = res.record?.id || ''

            return acc
          }, {})

          formik.setValues(prevValues => ({
            ...prevValues,
            ...newValues
          }))
        } catch (error) {}
      }
    }

    fetchDimensionsData()
  }, [recordId, dimensions])

  console.log(formik.values, 'formik')

  return (
    <FormShell form={formik} resourceId={ResourceIds.Items} maxAccess={maxAccess} infoVisible={false}>
      <VertLayout>
        <Grow>
          <Grid container>
            {dimensions.map((dimension, index) => {
              const dimensionNumber = dimension.key.match(/\d+$/)?.[0] || ''

              return (
                <Grid container mt={0.2} spacing={2} key={index}>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={InventoryRepository.Dimension.qry}
                      parameters={`_dimension=${dimensionNumber}`}
                      name={dimension.key}
                      label={dimension.value}
                      valueField='id'
                      displayField='name'
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue(`${dimension.key}`, newValue?.id)
                      }}
                    />
                  </Grid>
                </Grid>
              )
            })}

            {dimensionsUDT.map((dimension, index) => {
              return (
                <Grid container mt={0.2} spacing={2} key={index}>
                  <Grid item xs={6}>
                    <CustomTextField
                      name={dimension.key}
                      label={dimension.value}
                      value={formik.values[dimension.key]}
                      onChange={formik.handleChange}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue([dimension.key], '')}
                    />
                  </Grid>
                </Grid>
              )
            })}
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PropertiesForm
