import { useState } from 'react'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { getFormattedNumberMax } from 'src/lib/numberField-helper'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomLookup from 'src/components/Inputs/CustomLookup'

const OutwardsTab = ({
  labels,
  outwardsValidation,
  plantStore,
  countryStore,
  onCountrySelection,
  dispersalTypeStore,
  onDispersalSelection,
  currencyStore,
  onCurrencySelection,
  agentsStore,
  correspondentStore,
  setCorrespondentStore,
  lookupCorrespondent,
  onAmountDataFill,
  onIdNoBlur,
  editMode,
  setProductsWindowOpen,
  maxAccess
}) => {
  const [position, setPosition] = useState()

  return (
    <Grid container>
      {/* First Column */}
      <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
        <Grid item xs={12}>
          <CustomComboBox
            name='plantId'
            label='Plant'
            valueField='recordId'
            displayField={['reference', 'name']}
            store={plantStore}
            required
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            value={plantStore.filter(item => item.recordId === outwardsValidation.values.plantId)[0]}
            onChange={(event, newValue) => {
              outwardsValidation.setFieldValue('plantId', newValue?.recordId)
            }}
            error={outwardsValidation.touched.plantId && Boolean(outwardsValidation.errors.plantId)}
            helperText={outwardsValidation.touched.plantId && outwardsValidation.errors.plantId}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='countryId'
            label='Country'
            valueField='countryId'
            displayField={['countryRef', 'countryName']}
            columnsInDropDown={[
              { key: 'countryRef', value: 'Reference' },
              { key: 'countryName', value: 'Name' }
            ]}
            store={countryStore}
            required
            value={countryStore.filter(item => item.countryId === outwardsValidation.values.countryId)[0]}
            onChange={(event, newValue) => {
              outwardsValidation.setFieldValue('countryId', newValue?.countryId)
              if (newValue) onCountrySelection(newValue?.countryId)
            }}
            error={outwardsValidation.touched.countryId && Boolean(outwardsValidation.errors.countryId)}
            helperText={outwardsValidation.touched.countryId && outwardsValidation.errors.countryId}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='dispersalType'
            label='dispersal type'
            valueField='dispersalType'
            displayField='dispersalTypeName'
            required
            readOnly={outwardsValidation.values.countryId != null ? false : true}
            store={dispersalTypeStore}
            value={
              dispersalTypeStore?.filter(item => item.dispersalType === outwardsValidation.values.dispersalType)[0]
            }
            onChange={(event, newValue) => {
              outwardsValidation.setFieldValue('dispersalType', newValue?.dispersalType)
              if (newValue) onDispersalSelection(outwardsValidation.values.countryId, newValue?.dispersalType)
            }}
            error={outwardsValidation.touched.dispersalType && Boolean(outwardsValidation.errors.dispersalType)}
            helperText={outwardsValidation.touched.dispersalType && outwardsValidation.errors.dispersalType}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='currencyId'
            label='Currency'
            valueField='currencyId'
            displayField={['currencyRef', 'currencyName']}
            columnsInDropDown={[
              { key: 'currencyRef', value: 'Reference' },
              { key: 'currencyName', value: 'Name' }
            ]}
            required
            readOnly={outwardsValidation.values.dispersalType != null ? false : true}
            store={currencyStore}
            value={currencyStore?.filter(item => item.currencyId === outwardsValidation.values.currencyId)[0]}
            onChange={(event, newValue) => {
              outwardsValidation.setFieldValue('currencyId', newValue?.currencyId)
              if (newValue)
                onCurrencySelection(
                  outwardsValidation.values.countryId,
                  outwardsValidation.values.dispersalType,
                  newValue?.currencyId
                )
            }}
            error={outwardsValidation.touched.currencyId && Boolean(outwardsValidation.errors.currencyId)}
            helperText={outwardsValidation.touched.currencyId && outwardsValidation.errors.currencyId}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomComboBox
            name='agentId'
            label='Agent'
            valueField='agentId'
            displayField='agentName'
            required={outwardsValidation.values.dispersalType === 2 ? true : false}
            readOnly={
              outwardsValidation.values.dispersalType != null && outwardsValidation.values.dispersalType === 2
                ? false
                : true
            }
            store={agentsStore}
            value={agentsStore?.filter(item => item.agentId === outwardsValidation.values.agentId)[0]}
            onChange={(event, newValue) => {
              outwardsValidation.setFieldValue('agentId', newValue?.agentId)
            }}
            error={outwardsValidation.touched.agentId && Boolean(outwardsValidation.errors.agentId)}
            helperText={outwardsValidation.touched.agentId && outwardsValidation.errors.agentId}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            name='idNo'
            label='Id No'
            value={outwardsValidation.values.idNo}
            readOnly={editMode}
            required
            onChange={outwardsValidation.handleChange}
            onBlur={() => {
              if (outwardsValidation.values.idNo) onIdNoBlur(outwardsValidation.values.idNo)
            }}
            onClear={() => outwardsValidation.setFieldValue('idNo', '')}
            error={outwardsValidation.touched.idNo && Boolean(outwardsValidation.errors.idNo)}
            helperText={outwardsValidation.touched.idNo && outwardsValidation.errors.idNo}
            maxLength='15'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='cl_reference'
            label='Client reference'
            value={outwardsValidation.values.cl_reference}
            readOnly
            onChange={outwardsValidation.handleChange}
            error={outwardsValidation.touched.cl_reference && Boolean(outwardsValidation.errors.cl_reference)}
            helperText={outwardsValidation.touched.cl_reference && outwardsValidation.errors.cl_reference}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='cl_name'
            label='Client Name'
            value={outwardsValidation.values.cl_name}
            readOnly
            onChange={outwardsValidation.handleChange}
            error={outwardsValidation.touched.cl_name && Boolean(outwardsValidation.errors.cl_name)}
            helperText={outwardsValidation.touched.cl_name && outwardsValidation.errors.cl_name}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='idType'
            label='ID type'
            value={outwardsValidation.values.idType}
            readOnly
            onChange={outwardsValidation.handleChange}
            error={outwardsValidation.touched.idType && Boolean(outwardsValidation.errors.idType)}
            helperText={outwardsValidation.touched.idType && outwardsValidation.errors.idType}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='nationalityId'
            label='Nationality'
            value={outwardsValidation.values.nationalityId}
            readOnly
            onChange={outwardsValidation.handleChange}
            error={outwardsValidation.touched.nationalityId && Boolean(outwardsValidation.errors.nationalityId)}
            helperText={outwardsValidation.touched.nationalityId && outwardsValidation.errors.nationalityId}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
      {/* Second Column */}
      <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
        <Grid item xs={12}>
          <CustomTextField
            position={position}
            name='amount'
            type='text'
            label='amount'
            value={outwardsValidation.values.amount}
            required
            readOnly={
              (outwardsValidation.values.dispersalType == 2 && outwardsValidation.values.agentId != null) ||
              (outwardsValidation.values.dispersalType == 1 && outwardsValidation.values.agentId === null)
                ? false
                : true
            }
            maxAccess={maxAccess}
            onChange={e => {
              const input = e.target
              const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

              // Save current cursor position
              const currentPosition = input.selectionStart

              // Update field value
              outwardsValidation.setFieldValue('amount', formattedValue)

              // Calculate the new cursor position based on the formatted value
              const newCursorPosition = currentPosition + (formattedValue && formattedValue.length - input.value.length)

              setPosition(newCursorPosition)
            }}
            onBlur={() => {
              if (outwardsValidation.values.amount) onAmountDataFill(outwardsValidation.values)
            }}
            onClear={() => outwardsValidation.setFieldValue('amount', '')}
            error={outwardsValidation.touched.amount && Boolean(outwardsValidation.errors.amount)}
            helperText={outwardsValidation.touched.amount && outwardsValidation.errors.amount}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomLookup
            name='corId'
            label='Correspondent'
            value={outwardsValidation.values.corId}
            required={false}
            valueField='reference'
            displayField='name'
            firstFieldWidth='150px'
            store={correspondentStore}
            firstValue={outwardsValidation.values.corRef}
            secondValue={outwardsValidation.values.corName}
            setStore={setCorrespondentStore}
            onLookup={lookupCorrespondent}
            onChange={(event, newValue) => {
              if (newValue) {
                outwardsValidation.setFieldValue('corId', newValue?.recordId)
                outwardsValidation.setFieldValue('corRef', newValue?.reference)
                outwardsValidation.setFieldValue('corName', newValue?.name)
              } else {
                outwardsValidation.setFieldValue('corId', null)
                outwardsValidation.setFieldValue('corRef', null)
                outwardsValidation.setFieldValue('corName', null)
              }
            }}
            error={outwardsValidation.touched.corId && Boolean(outwardsValidation.errors.corId)}
            helperText={outwardsValidation.touched.corId && outwardsValidation.errors.corId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Button onClick={() => setProductsWindowOpen(true)}>Open Popup</Button>
        <Grid item xs={12}>
          <CustomTextField
            position={position}
            name='fees'
            type='text'
            label='fees'
            value={outwardsValidation.values.fees}
            required
            readOnly
            maxAccess={maxAccess}
            onChange={e => {
              const input = e.target
              const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

              // Save current cursor position
              const currentPosition = input.selectionStart

              // Calculate the new cursor position based on the formatted value
              const newCursorPosition = currentPosition + (formattedValue && formattedValue.length - input.value.length)

              setPosition(newCursorPosition)
            }}
            error={outwardsValidation.touched.fees && Boolean(outwardsValidation.errors.fees)}
            helperText={outwardsValidation.touched.fees && outwardsValidation.errors.fees}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            position={position}
            name='baseAmount'
            type='text'
            label='Base Amount'
            value={outwardsValidation.values.baseAmount}
            required
            readOnly
            maxAccess={maxAccess}
            onChange={e => {
              const input = e.target
              const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

              // Save current cursor position
              const currentPosition = input.selectionStart

              // Calculate the new cursor position based on the formatted value
              const newCursorPosition = currentPosition + (formattedValue && formattedValue.length - input.value.length)

              setPosition(newCursorPosition)
            }}
            error={outwardsValidation.touched.baseAmount && Boolean(outwardsValidation.errors.baseAmount)}
            helperText={outwardsValidation.touched.baseAmount && outwardsValidation.errors.baseAmount}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            position={position}
            name='net'
            type='text'
            label='net to pay'
            value={outwardsValidation.values.net}
            required
            readOnly
            maxAccess={maxAccess}
            onChange={e => {
              const input = e.target
              const formattedValue = input.value ? getFormattedNumberMax(input.value, 8, 2) : input.value

              // Save current cursor position
              const currentPosition = input.selectionStart

              // Calculate the new cursor position based on the formatted value
              const newCursorPosition = currentPosition + (formattedValue && formattedValue.length - input.value.length)

              setPosition(newCursorPosition)
            }}
            error={outwardsValidation.touched.net && Boolean(outwardsValidation.errors.net)}
            helperText={outwardsValidation.touched.net && outwardsValidation.errors.net}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OutwardsTab
