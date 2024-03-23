import { Grid, Box } from '@mui/material'

import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductAgentTab = ({
  store,
  editMode,
  height,
  maxAccess
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
console.log(store)
 const {recordId : pId, dispersals} = store

  const columns = [
    {
      component: 'resourcecombobox',
      label: 'Agents',
      name: 'agent',
      props: {
        endpointId:  RemittanceSettingsRepository.CorrespondentAgents.qry,
        valueField: 'recordId',
        displayField: 'name',
        fieldsToUpdate: [{ from: 'name', to: 'agentName' }],
        columnsInDropDown: [{ key: 'name', value: '' }]
      }

    }
  ]

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,

    // validate: values => {
    //   const isValid = values.rows.every(row => !!row.agentId)

    //   return isValid ? {} : { rows: Array(values.rows.length).fill({ agentId: 'Agent ID is required' }) }
    // },
    initialValues: {
      agents: [
        { id: 1,
          dispersalId: pId,
          agentId: '',
          agentName: ''
        }
      ]
    },
    onSubmit: values => {
      postProductAgents(values.rows)
    }
  })

  const onDispersalSelection = dispersalId => {

    const _dispersalId = dispersalId
    const defaultParams = `_dispersalId=${_dispersalId}`
    var parameters = defaultParams
    formik.setValues({ agents:  [
      { id: 1,
        dispersalId: pId,
        agentId: '',
        agentName: ''
      }
    ] })

    getRequest({
      extension: RemittanceSettingsRepository.ProductDispersalAgents.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) {
          formik.setValues({ agents: res.list }) //map
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

return (
  <FormShell form={formik}
   resourceId={ResourceIds.ProductMaster}
   maxAccess={maxAccess}
   editMode={editMode}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container gap={2}>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                name='dispersalId'
                label='Dispersal'
                store={dispersals}
                valueField='recordId'
                displayField= {['reference', 'name']}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                ]}
                values={formik?.values}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('dispersalId', newValue?.recordId)
                  onDispersalSelection(newValue?.recordId);

                }}
                error={Boolean(formik.errors.dispersalId)}
                helperText={formik.errors.dispersalId}
              />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <DataGrid
            onChange={value => formik.setFieldValue('agents', value)}
            value={formik.values.agents}
            error={formik.errors.agents}
            columns={columns}
            height={height-100}
            />
          </Grid>
        </Grid>
      </Box>
    </FormShell>
  )
}

export default ProductAgentTab
