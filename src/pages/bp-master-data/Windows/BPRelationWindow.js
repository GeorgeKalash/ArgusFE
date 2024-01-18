// ** MUI Imports
import { Grid, Box} from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useContext, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'


const BPRelationWindow = ({
  onClose,
  onSave,
  relationValidation,
  labels,
  maxAccess
}) => {
  const { getRequest } = useContext(RequestsContext)

  const [businessPartnerStore, setBusinessPartnerStore] = useState([])

  return (
    <Window id='BPRelationWindow' Title={labels.relation} onClose={onClose} onSave={onSave} width={600} height={400}>
      <CustomTabPanel index={0} value={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
            <Grid item xs={12}>
            <CustomLookup
              name='toBPId'
              label= {labels.businessPartner}
              value={relationValidation.values.toBPId}
              required
              valueField='reference'
              displayField='name'
              store={businessPartnerStore}
              firstValue={relationValidation.values.toBPRef}
              secondValue={relationValidation.values.toBPName}
              setStore={setBusinessPartnerStore}
              onLookup={searchQry => {
    setBusinessPartnerStore([])
    if(searchQry){
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: BusinessPartnerRepository.MasterData.snapshot,
      parameters: parameters
    })
      .then(res => {
        setBusinessPartnerStore(res.list)
      })
      .catch(error => {
         setErrorMessage(error)
      })}
  }}
              onChange={(event, newValue) => {
                if (newValue) {
                  relationValidation.setFieldValue('toBPId', newValue?.recordId)
                  relationValidation.setFieldValue('toBPRef', newValue?.reference)
                  relationValidation.setFieldValue('toBPName', newValue?.name)
                } else {
                  relationValidation.setFieldValue('toBPId', null)
                  relationValidation.setFieldValue('toBPRef', null)
                  relationValidation.setFieldValue('toBPName', null)
                }
              }}
              error={
                relationValidation.touched.toBPId &&
                Boolean(relationValidation.errors.toBPId)
              }
              helperText={
                relationValidation.touched.toBPId && relationValidation.errors.toBPId
              }
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
            endpointId={BusinessPartnerRepository.RelationTypes.qry}
              name='relationId'
              label={labels.relation}
              columnsInDropDown= {[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={relationValidation.values}
              required
              onChange={(event, newValue) => {
                relationValidation && relationValidation.setFieldValue('relationId', newValue?.recordId);
              }}
              error={relationValidation.touched.relationId && Boolean(relationValidation.errors.relationId)}
              helperText={relationValidation.touched.relationId && relationValidation.errors.relationId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='startDate'
              label={labels.from}
              value={relationValidation.values.startDate}
              onChange={relationValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => relationValidation.setFieldValue('startDate', '')}
              error={relationValidation.touched.startDate && Boolean(relationValidation.errors.startDate)}
              helperText={relationValidation.touched.startDate && relationValidation.errors.startDate}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='endDate'
              label={labels.to}
              value={relationValidation.values.endDate}
              onChange={relationValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => relationValidation.setFieldValue('endDate', '')}
              error={relationValidation.touched.endDate && Boolean(relationValidation.errors.endDate)}
              helperText={relationValidation.touched.endDate && relationValidation.errors.endDate}
            />
          </Grid>

             </Grid>
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default BPRelationWindow
