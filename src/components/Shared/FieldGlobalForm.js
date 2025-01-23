import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grid } from '@mui/material'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { DataSets } from 'src/resources/DataSets'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form.js'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { CommonContext } from 'src/providers/CommonContext'

export default function FieldGlobalForm({ labels, maxAccess, row, invalidate, window, resourceId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [isLoading, setIsLoading] = useState(false)
  const { getAllKvsByDataset } = useContext(CommonContext)

  async function getAccessLevel() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.AU_RESOURCE_CONTROL_ACCESS_LEVEL,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      gridRows: [],
      ...row
    },
    onSubmit: async obj => {
      const updatedRows = formik.values.gridRows
        .filter(obj => obj.accessLevel != null && obj.accessLevel !== '')
        .map(control => ({
          resourceId: row.resourceId,
          sgId: row.sgId,
          ...control
        }))

      const resultObject = {
        resourceId: row.resourceId,
        sgId: row.sgId,
        controls: updatedRows
      }
      if (resourceId == ResourceIds.SecurityGroup) {
        await postRequest({
          extension: AccessControlRepository.SGControlAccess.set2,
          record: JSON.stringify(resultObject)
        })
      }
      if (resourceId == ResourceIds.GlobalAuthorization) {
        await postRequest({
          extension: AccessControlRepository.GlobalControlAuthorizationPack.set2,
          record: JSON.stringify(resultObject)
        })
      }
      toast.success('Record Edited Successfully')
      invalidate()
      window.close()
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
      if (row.resourceId) {
        let accessLevelRes = []
        setIsLoading(true)
        getAccessLevel()

        const res = await getRequest({
          extension: SystemRepository.ResourceControl.qry,
          parameters: `_resourceId=${row.resourceId}`
        })

        if (resourceId == ResourceIds.SecurityGroup) {
          accessLevelRes = await getRequest({
            extension: AccessControlRepository.SGControlAccess.qry,
            parameters: `_sgId=${row.sgId}&_resourceId=${row.resourceId}`
          })
        }
        if (resourceId == ResourceIds.GlobalAuthorization) {
          accessLevelRes = await getRequest({
            extension: AccessControlRepository.GlobalControlAuthorizationView.qry,
            parameters: `_resourceId=${row.resourceId}`
          })
        }

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

        formik.setValues({
          ...formik.values,
          gridRows: finalList.map((control, index) => ({
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
      resourceId={ResourceIds.SecurityGroup}
      form={formik}
      editMode={true}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceId'
                label={labels.resourceId}
                value={formik.values.resourceId}
                required
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                readOnly={true}
                onClear={() => formik.setFieldValue('resourceId', '')}
                error={formik.touched.resourceId && Boolean(formik.errors.resourceId)}
                helperText={formik.touched.resourceId && formik.errors.resourceId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceName'
                label={labels.resourceName}
                value={formik.values.resourceName}
                required
                readOnly={true}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('resourceName', '')}
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                helperText={formik.touched.resourceName && formik.errors.resourceName}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('gridRows', value)
            }}
            value={formik.values.gridRows}
            error={formik.errors.gridRows}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
