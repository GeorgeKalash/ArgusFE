import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'

// ** Custom Imports
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Box, Grid } from '@mui/material'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { DataSets } from 'src/resources/DataSets'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form.js'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function FieldGlobalForm({ labels, maxAccess, resourceId, resourceName, expanded }) {
  const { height } = useWindowDimensions()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [isLoading, setIsLoading] = useState(false)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.ModuleClassRES.qry
  })

  const { formik: detailsFormik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [],
      resourceId: resourceId,
      resourceName: resourceName
    },
    onSubmit: async obj => {
      const updatedRows = detailsFormik.values.rows
        .filter(obj => obj.accessLevel != null && obj.accessLevel !== '')
        .map(control => ({
          resourceId: resourceId,
          ...control
        }))

      // Create the resultObject
      const resultObject = {
        resourceId: resourceId,
        controls: updatedRows
      }

      const response = await postRequest({
        extension: AccessControlRepository.GlobalControlAuthorizationPack.set2,
        record: JSON.stringify(resultObject)
      })

      toast.success('Record Edited Successfully')

      invalidate()
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.controlId,
      name: 'controlId',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.controlName,
      name: 'name',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'accessLevelCombo',
      label: labels.accessLevel,
      props: {
        datasetId: DataSets.AU_RESOURCE_CONTROL_ACCESS_LEVEL,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'accessLevel' },
          { from: 'value', to: 'accessLevelName' }
        ]
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (resourceId) {
        setIsLoading(true)

        const res = await getRequest({
          extension: SystemRepository.ResourceControl.qry,
          parameters: `_resourceId=${resourceId}`
        })

        const accessLevelRes = await getRequest({
          extension: AccessControlRepository.GlobalControlAuthorizationView.qry,
          parameters: `_resourceId=${resourceId}`
        })

        let finalList = []

        if (res.list) {
          finalList = res.list.map(controlDetail => {
            const control = {
              controlId: controlDetail.id,
              name: controlDetail.name,
              accessLevel: null,
              accessLevelName: null
            }

            const matching = accessLevelRes.list.find(acessL => control.controlId === acessL.controlId)

            if (matching) {
              control.accessLevel = matching.accessLevel
              control.accessLevelName = matching.accessLevelName
            }

            return control
          })
        }

        detailsFormik.setValues({
          ...detailsFormik.values,
          rows: finalList.map((control, index) => ({
            id: index + 1,
            ...control
          }))
        })
      }

      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.GlobalAuthorization}
      form={detailsFormik}
      editMode={true}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceId'
                label={labels.resourceId}
                value={resourceId}
                required
                onChange={detailsFormik.handleChange}
                maxAccess={maxAccess}
                readOnly={true}
                onClear={() => detailsFormik.setFieldValue('resourceId', '')}
                error={detailsFormik.touched.resourceId && Boolean(detailsFormik.errors.resourceId)}
                helperText={detailsFormik.touched.resourceId && detailsFormik.errors.resourceId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceName'
                label={labels.resourceName}
                value={resourceName}
                required
                readOnly={true}
                maxAccess={maxAccess}
                onChange={detailsFormik.handleChange}
                onClear={() => detailsFormik.setFieldValue('resourceName', '')}
                error={detailsFormik.touched.resourceName && Boolean(detailsFormik.errors.resourceName)}
                helperText={detailsFormik.touched.resourceName && detailsFormik.errors.resourceName}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ pt: 2 }}>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                onChange={value => {
                  detailsFormik.setFieldValue('rows', value)
                }}
                value={detailsFormik.values.rows}
                error={detailsFormik.errors.rows}
                columns={columns}
                allowDelete={false}
                allowAddNewLine={false}
                height={`${expanded ? height - 300 : 230}px`}
              />
            </Box>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
