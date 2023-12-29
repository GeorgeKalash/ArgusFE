// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'

// ** MUI Imports
import { Grid } from '@mui/material'

const DefaultsTab = ({
  labels,
  defaultsValidation,
  maxAccess,
  siteStore,
  plantStore,
  salesPersonStore,
  setCashAccStore,
  cashAccStore,
  lookupCashAcc
}) => {
    
  return (
    <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomComboBox
            name='siteId'
            label={labels.site}
            valueField='recordId'
            displayField='name'
            columnsInDropDown= {[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            store={siteStore}
            value={siteStore.filter(item => item.recordId === defaultsValidation.values?.siteId)[0]}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
                  defaultsValidation.setFieldValue('siteId', newValue?.recordId)
            }}
            error={defaultsValidation.touched.siteId && Boolean(defaultsValidation.errors.siteId)}
            helperText={defaultsValidation.touched.siteId && defaultsValidation.errors.siteId}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='plantId'
            label={labels.plant}
            valueField='recordId'
            displayField='name'
            columnsInDropDown= {[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            store={plantStore}
            value={plantStore.filter(item => item.recordId === defaultsValidation.values?.plantId)[0]}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
                  defaultsValidation.setFieldValue('plantId', newValue?.recordId)
            }}
            error={defaultsValidation.touched.plantId && Boolean(defaultsValidation.errors.plantId)}
            helperText={defaultsValidation.touched.plantId && defaultsValidation.errors.plantId}
          />
        </Grid>
        <Grid item xs={12}>
        <CustomLookup
          name='cashAccountId'
          value={defaultsValidation.values.cashAccountId}
          label={labels.cashAcc}
          valueField='accountNo'
          displayField='name'
          store={cashAccStore}
          setStore={setCashAccStore}
          firstValue={defaultsValidation.values.cashAccountRef}
          secondValue={defaultsValidation.values.cashAccountName}
          onLookup={lookupCashAcc}
          onChange={(event, newValue) => {
                if ( newValue.recordId) {
                  defaultsValidation.setFieldValue('cashAccountId', newValue?.recordId)
                  defaultsValidation.setFieldValue('cashAccountRef', newValue?.accountNo)
                  defaultsValidation.setFieldValue('cashAccountName', newValue?.name)
                }
                 else {
                 defaultsValidation.setFieldValue('cashAccountId', null)
                 defaultsValidation.setFieldValue('cashAccountRef', null)
                 defaultsValidation.setFieldValue('cashAccountName', null)
                }
         }}
          error={defaultsValidation.touched.cashAccountId && Boolean(defaultsValidation.errors.cashAccountId)}
          helperText={defaultsValidation.touched.cashAccountId && defaultsValidation.errors.cashAccountId}
          maxAccess={maxAccess}
        />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='spId'
            label={labels.salesPerson}
            valueField='recordId'
            displayField='name'
            columnsInDropDown= {[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            store={salesPersonStore}
            value={salesPersonStore.filter(item => item.recordId === defaultsValidation.values.spId)[0]}
            maxAccess={maxAccess}
            onChange={(event, newValue) => { 
                  defaultsValidation.setFieldValue('spId', newValue?.recordId)
            }}
            error={defaultsValidation.touched.spId && Boolean(defaultsValidation.errors.spId)}
            helperText={defaultsValidation.touched.spId && defaultsValidation.errors.spId}
          />
        </Grid>
    </Grid>
  )
}

export default DefaultsTab
