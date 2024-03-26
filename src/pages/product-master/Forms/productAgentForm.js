import { Grid, Box } from '@mui/material'

// ** Custom Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'

const ProductAgentForm = ({
  store,
  labels,
  editMode,
  height,
  maxAccess
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const {recordId : pId, dispersals} = store
  const[ _dispersalId , setDispersalId] = useState()

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.agents,
      name: 'agent',
      props: {
        endpointId:  RemittanceSettingsRepository.CorrespondentAgents.qry,
        valueField: 'recordId',
        displayField: 'name',
        columnsInDropDown: [{ key: 'name', value: 'name' }]
      }

    }
  ]

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({ agents: yup
      .array()
      .of(
        yup.object().shape({
          agent: yup
            .object()
            .shape({
              recordId: yup.string().required('agent recordId is required')
            })
            .required('agent is required'),
        })
      ).required('agents array is required') }),
    initialValues: {
      agents: [
        { id: 1,
          dispersalId: '',
          agentId: '',
          agentName: ''
        }
      ]
    },
    onSubmit: values => {
      postProductAgents(values.agents)
    }
  })

  const postProductAgents = obj => {
    const data = {
      dispersalId: pId,
      productDispersalAgents: obj.map(({dispersalId, agent, agentId, agentName, ...rest}, index)=>({
        id: index + 1,
        agent,
        dispersalId: _dispersalId,
        agentId: agent.recordId,
        agentName: agent.name,
        ...rest
       }))
    }
    postRequest({
      extension: RemittanceSettingsRepository.ProductDispersalAgents.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
      })
  }

  const onDispersalSelection = dispersalId => {

    const _dispersalId = dispersalId
    const defaultParams = `_dispersalId=${_dispersalId}`
    var parameters = defaultParams
    formik.setValues({ agents: [
    { id: 1,
      dispersalId: '',
      agentId: '',
      agentName: ''
    }]})

    dispersalId &&  getRequest({
      extension: RemittanceSettingsRepository.ProductDispersalAgents.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) {
          formik.setValues({ agents: res.list.map(({agentId,agentName,...rest}, index)=>({
           id: index+1,
           agent:{
            recordId: agentId,
            name: agentName
           },
           ...rest
          })) }) //map
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
                label={labels.dispersal}
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

                  setDispersalId(newValue?.recordId);
                  onDispersalSelection(newValue?.recordId)

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

export default ProductAgentForm
