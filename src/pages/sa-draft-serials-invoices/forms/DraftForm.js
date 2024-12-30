import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useForm } from 'src/hooks/form'
import WorkFlow from 'src/components/Shared/WorkFlow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { getVatCalc } from 'src/utils/VatCalculator'
import { getDiscValues, getFooterTotals, getSubtotal } from 'src/utils/FooterCalculator'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import AddressFilterForm from 'src/components/Shared/AddressFilterForm'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import SalesTrxForm from 'src/components/Shared/SalesTrxForm'

export default function DraftForm({ labels, access, recordId, currency, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData, userDefaultsData } = useContext(ControlContext)
  const [cycleButtonState, setCycleButtonState] = useState({ text: '%', value: 2 })
  const [address, setAddress] = useState({})
  const [filteredMu, setFilteredMU] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [reCal, setReCal] = useState(false)
  const [defaults, setDefaults] = useState({ userDefaultsList: {}, systemDefaultsList: {} })

  const { documentType, maxAccess, changeDT } = useDocumentType({
    functionId: SystemFunction.DraftSerialsIn,
    access: access,
    enabled: !recordId
  })

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    dtId: documentType?.dtId,
    reference: '',
    date: new Date(),
    plantId: null,
    clientId: '',
    currencyId: parseInt(currency),
    spId: null,
    siteId: null,
    description: '',
    status: 1,
    wip: 1,
    isVattable: false,
    taxId: '',
    subtotal: '',
    amount: 0,
    vatAmount: '',
    totalWeight: 0,
    plId: '',
    ptId: '',
    weight: '',
    serials: [
      {
        id: 1,
        draftId: recordId || 0,
        srlNo: '',
        metalId: '',
        designId: '',
        itemId: '',
        sku: '',
        itemName: '',
        seqNo: '',
        extendedPrice: 0,
        baseLaborPrice: 0,
        weight: 0,
        metalRef: '',
        designRef: '',
        vatAmount: 0,
        vatPct: 0,
        unitPrice: 0,
        taxId: '',
        taxDetails: null,
        priceType: 0,
        volume: 0
      }
    ],
    serials: [
      {
        metals: '',
        pcs: 0,
        totalWeight: 0
      }
    ],
    items: [
      {
        seqNo: '',
        itemId: '',
        sku: '',
        itemName: '',
        weight: 0,
        pcs: 0
      }
    ]
  })

  const invalidate = useInvalidate({
    endpointId: SaleRepository.DraftInvoice.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      currencyId: yup.string().required(),
      clientId: yup.string().required(),
      spId: yup.string().required(),
      siteId: yup.string().required(),
      items: /* yup.array().of(
        yup.object({
          sku: yup.string().required(),
          itemName: yup.string().required(),
          qty: yup.number().required()
        })
      ) */
     
    }),
    onSubmit: async obj => {
     /*  const copy = { ...obj }
      delete copy.items
      copy.date = formatDateToApi(copy.date)
      copy.dueDate = formatDateToApi(copy.dueDate)
      copy.miscAmount = copy.miscAmount || 0

      if (!obj.rateCalcMethod) delete copy.rateCalcMethod

      if (copy.serializedAddress) {
        const addressData = {
          clientId: copy.clientId,
          address: address
        }

        const addressRes = await postRequest({
          extension: SaleRepository.Address.set,
          record: JSON.stringify(addressData)
        })
        copy.shipToAddressId = addressRes.recordId
      }

      const updatedRows = formik.values.items.map((itemDetails, index) => {
        const { physicalProperty, ...rest } = itemDetails

        return {
          ...rest,
          seqNo: index + 1,
          siteId: obj.siteId,
          applyVat: obj.isVattable
        }
      })

      const itemsGridData = {
        header: copy,
        items: updatedRows
      }

      const soRes = await postRequest({
        extension: SaleRepository.SalesOrder.set2,
        record: JSON.stringify(itemsGridData)
      })

      const actionMessage = editMode ? platformLabels.Edited : platformLabels.Added
      toast.success(actionMessage)
      await refetchForm(soRes.recordId)
      invalidate() */
    }
  })
  
}
