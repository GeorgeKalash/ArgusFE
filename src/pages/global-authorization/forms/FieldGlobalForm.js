import { useFormik } from 'formik'
import * as yup from 'yup'
import { useEffect, useState, useContext } from 'react'
import toast from 'react-hot-toast'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Box, Grid } from '@mui/material'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { AuthContext } from 'src/providers/AuthContext'
import { getFormattedNumber } from 'src/lib/numberField-helper'
import { DataGrid } from 'src/components/Shared/DataGrid'

export default function FieldGlobalForm({ labels, maxAccess, resourceId, resourceName, setErrorMessage }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { user, setUser } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)

  const invalidate = useInvalidate({
    endpointId: SystemRepository.ModuleClassRES.qry
  })

  const detailsFormik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [],
      resourceId: resourceId,
      resourceName: resourceName
    },
    onSubmit: async obj => {
      console.log(detailsFormik.values.rows)

      const updatedRows = detailsFormik.values.rows
        .filter(obj => {
          return obj.accessLevel != null
        }).map(({ ...rest }) => ({
          resourceId: resourceId,
          ...rest
        }))

        /*.map(({ accessLevelCombo, controlId }) => {
          return {
            controlId: controlId,
            accessLevel: accessLevelCombo?.key,
            accessLevelName: accessLevelCombo?.value,
            resourceId: resourceId
          }
        })*/
        console.log('list')

        console.log(updatedRows)

      // Create the resultObject
      const resultObject = {
        resourceId: resourceId,
        controls: updatedRows
      }

      console.log(resultObject)

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
        mapping: [ { from: 'key', to: 'accessLevel' } ,
          { from: 'value', to: 'accessLevelName' }]
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.accessLevelCombo?.key) {
          return
        } else {
          update({ accessLevelName: newRow.accessLevelCombo?.value, accessLevel: newRow.accessLevelCombo?.key })
        }
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      try {
        if (resourceId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: SystemRepository.ResourceControl.qry,
            parameters: `_resourceId=${resourceId}`
          })
          console.log(res.list)

          const accessLevelRes = await getRequest({
            extension: AccessControlRepository.GlobalControlAuthorizationView.qry,
            parameters: `_resourceId=${resourceId}`
          })

          console.log(accessLevelRes)

          const finalList = res.list.map(controlDetail => {
            const n = {
              controlId: controlDetail.id,
              name: controlDetail.name,
              accessLevel: null,
              accessLevelName: null
            };
    
            const matching = accessLevelRes.list.find(
              y => n.controlId === y.controlId
            );
    
            if (matching) {
              n.accessLevel = matching.accessLevel;
              n.accessLevelName = matching.accessLevelName;
            }
    
            return n;
          });

          console.log(finalList)
          
          detailsFormik.setValues({
            ...detailsFormik.values,
            rows: finalList.map(({ ...rest }, index) => ({
              id: index + 1,
              ...rest
            }))
          })

          //setInitialData(res.record)
        }
      } catch (exception) {
        //setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.GlobalAuthorization}
      form={detailsFormik}
      height={300}
      editMode={true}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
    >
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
              height={230}
              onChange={value => {
                console.log(value)
                detailsFormik.setFieldValue('rows', value)
              }}
              value={detailsFormik.values.rows}
              error={detailsFormik.errors.rows}
              columns={columns}
              allowDelete={false}
              allowAddNewLine={false}
            />
          </Box>
        </Grid>
    </FormShell>
  )
}
