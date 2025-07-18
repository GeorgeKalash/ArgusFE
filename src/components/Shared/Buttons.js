import { accessMap, TrxType } from 'src/resources/AccessLevels'

export const getButtons = platformLabels => [
  {
    key: 'Clear',
    label: platformLabels.Clear,
    condition: 'isCleared',
    onClick: 'onClear',
    color: '#f44336',
    image: 'clear.png',
    main: true
  },
  {
    key: 'Rebuild',
    color: '#231F20',
    label: platformLabels.RebuildButton,
    image: 'rebuild.png',
    main: false
  },
  {
    key: 'Info',
    label: platformLabels.Info,
    condition: 'isInfo && infoVisible',
    onClick: 'onInfo',
    color: '#4355a5',
    disabled: '!editMode',
    image: 'info.png',
    main: true
  },
  {
    key: 'saveClear',
    label: platformLabels.saveClear,
    condition: 'isSavedClear',
    onClick: 'onSaveClear',
    color: '#231f20',
    image: 'saveclear.png',
    main: true,
    disabled: 'disabledSavedClear || isPosted || isClosed'
  },
  {
    key: 'Submit',
    label: platformLabels.Submit,
    condition: 'isSaved',
    onClick: 'onSave',
    color: '#4eb558',
    disabled: 'disabledSubmit || isPosted || isClosed',
    image: 'save.png',
    main: true
  },
  {
    key: 'ClearGrid',
    label: platformLabels.clearGrid,
    color: '#f44336',
    image: 'clear.png',
    main: false
  },
  {
    key: 'ClearHG', //HeaderGrid
    label: platformLabels.clearAll,
    color: '#4682B4',
    image: 'clear.png',
    main: false
  },
  {
    key: 'Bulk',
    label: platformLabels.Bulk,
    color: '#09235C',
    image: 'Bulk.png',
    main: false
  },
  {
    key: 'Sample',
    label: platformLabels.Sample,
    color: '#231f20',
    image: 'sample.png',
    main: false
  },
  {
    key: 'SerialsLots',
    label: platformLabels.SerialsLots,
    color: '#D3D3D3',
    image: 'serials-lots.png',
    main: false
  },
  {
    key: 'Start',
    label: platformLabels.Start,
    color: '#4eb558',
    image: 'play.png',
    main: false
  },
  {
    key: 'Stop',
    label: platformLabels.Stop,
    color: '#D3D3D3',
    image: 'stop.png',
    main: false
  },
  {
    key: 'Received',
    label: platformLabels.Received,
    color: '#D3D3D3',
    image: 'received.png',
    main: false
  },
  {
    key: 'Cancel',
    label: platformLabels.Cancel,
    color: '#0A4164',
    image: 'cancelWhite.png',
    main: false
  },
  {
    key: 'Terminate',
    label: platformLabels.Terminate,
    color: '#FF0000',
    image: 'cancelWhite.png',
    main: false
  },
  {
    key: 'AccountSummary',
    label: platformLabels.AccountSummary,
    color: '#90278e',
    image: 'accountBalanceWhite.png',
    main: false
  },
  {
    key: 'WorkFlow',
    label: platformLabels.WorkFlow,
    color: '#231f20',
    image: 'workflow.png',
    main: false
  },
  {
    key: 'Delete',
    label: platformLabels.Delete,
    color: '#231f20',
    image: 'delete-icon.png',
    main: false
  },
  {
    key: 'Close',
    label: platformLabels.Close,
    color: 'transparent',
    image: 'close.png',
    border: '1px solid #01a437',
    main: false,
    access: accessMap[TrxType.CLOSE]
  },
  {
    key: 'Reopen',
    label: platformLabels.Reopen,
    color: 'transparent',
    image: 'reopen.png',
    border: '1px solid #000000',
    main: false,
    access: accessMap[TrxType.REOPEN]
  },
  {
    key: 'Approval',
    label: platformLabels.Approval,
    color: '#231F20',
    image: 'approval.png',
    main: false
  },
  {
    key: 'Dismiss all',
    label: platformLabels.DismissAll,
    color: '#F44336',
    image: 'dismissal.png',
    main: false
  },
  {
    key: 'Reject',
    label: platformLabels.Reject,
    color: '#F44336',
    image: 'dismissal.png',
    main: false
  },
  {
    key: 'Approve',
    label: platformLabels.Approve,
    color: '#4EB558',
    image: 'approval.png',
    main: false
  },
  {
    key: 'BeneficiaryList',
    label: platformLabels.BeneficiaryList,
    color: '#231f20',
    image: 'beneficiary.png',
    main: false
  },
  {
    key: 'Beneficiary',
    label: platformLabels.Beneficiary,
    color: '#0A4164',
    image: 'beneficiary.png',
    main: false
  },
  {
    key: 'Correspondent',
    label: platformLabels.Correspondent,
    image: 'person.png',
    color: '#CECECE',
    main: false
  },
  {
    key: 'Print',
    label: platformLabels.Print,
    color: '#231f20',
    image: 'print.png',
    main: false
  },
  {
    key: 'Invoice',
    label: platformLabels.Invoice,
    color: '#231f20',
    image: 'invoice.png',
    main: false
  },
  {
    key: 'Order',
    label: platformLabels.Order,
    color: '#231f20',
    image: 'order.png',
    main: false
  },
  {
    key: 'Consignments',
    label: platformLabels.Consignments,
    color: '#231f20',
    image: 'consignment.png',
    main: false
  },
  {
    key: 'Receipt Voucher',
    label: platformLabels.ReceiptVoucher,
    color: '#231f20',
    image: 'invoice.png',
    main: false
  },
  {
    key: 'Tree',
    label: platformLabels.Tree,
    color: '#231f20',
    image: 'tree.png',
    main: false
  },
  {
    key: 'Integration Account',
    label: platformLabels.IntegrationAccount,
    color: '#231f20',
    image: 'intAccount.png',
    main: false
  },
  {
    key: 'Account Balance',
    label: platformLabels.AccountBalance,
    color: '#275915',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'Client Relation',
    label: platformLabels.ClientRelation,
    color: '#AC48AE',
    image: 'clientRelations.png',
    main: false
  },
  {
    key: 'Add Client Relation',
    label: platformLabels.addClientRelation,
    color: '#4eb558',
    image: 'clientRelations.png',
    main: false
  },
  {
    key: 'Lots',
    label: platformLabels.Lot,
    color: '#D3D3D3',
    image: 'lot.png',
    main: false
  },
  {
    key: 'GL',
    label: platformLabels.GL,
    color: '#231f20',
    image: 'gl.png',
    main: false
  },
  {
    key: 'SA Trx',
    label: platformLabels.SaTrx,
    color: '#8C0446',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'FI Trx',
    label: platformLabels.FinTrx,
    color: '#3E048C',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'Shipment',
    label: platformLabels.Shipment,
    color: '#843c54',
    image: 'shipment.png',
    main: false
  },
  {
    key: 'Transportation',
    label: platformLabels.Transportation,
    color: '#064b38',
    image: 'transportation.png',
    main: false
  },
  {
    key: 'RecordRemarks',
    label: platformLabels.RecordRemarks,
    color: '#90278e',
    image: 'notes.png',
    main: false
  },
  {
    key: 'Apply',
    label: platformLabels.Apply,
    color: '#4eb558',
    image: 'apply.png',
    main: false
  },
  {
    key: 'Run',
    color: '#231F20',
    label: platformLabels.Run,
    image: 'rebuild.png',
    main: false
  },
  {
    key: 'Cash Transaction',
    label: platformLabels.CashTransaction,
    color: '#231F20',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'OpenRPB',
    label: platformLabels.OpenRPB,
    color: '#231F20',
    image: 'parameters.png',
    main: false
  },
  {
    key: 'Refresh',
    label: platformLabels.Refresh,
    color: '#231F20',
    main: false
  },
  {
    key: 'GO',
    label: platformLabels.Apply,
    color: '#231F20',
    image: 'go.png',
    main: false
  },
  {
    key: 'IV',
    label: platformLabels.InventoryTransaction,
    color: '#A76035',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'generate',
    label: platformLabels.Generate,
    color: 'black',
    image: 'generate.png',
    main: false
  },
  {
    key: 'Audit',
    label: platformLabels.Audit,
    color: '#231f20',
    image: 'info.png',
    main: false
  },
  {
    key: 'Import',
    label: platformLabels.import,
    color: '#000',
    image: 'import.png',
    main: false
  },
  {
    key: 'ImportAll',
    label: platformLabels.importAll,
    color: '#000',
    image: 'importAll.png',
    main: false
  },
  {
    key: 'Aging',
    label: platformLabels.Aging,
    color: '#A95C68',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'Client Balance',
    label: platformLabels.ClientBalance,
    color: '#231f20',
    image: 'wallet-to-bank-icon.png',
    main: false
  },
  {
    key: 'OTP',
    label: platformLabels.OTP,
    color: '#231f20',
    image: 'sms.png',
    main: false
  },
  {
    key: 'Metals',
    label: platformLabels.Metals,
    color: '#ADD8E6',
    image: 'metals-icon.png',
    main: false
  },
  {
    key: 'Verify',
    label: platformLabels.Verify,
    color: '#047DFA',
    image: 'checkmark-icon.png',
    main: false
  },
  {
    key: 'Unverify',
    label: platformLabels.Unverify,
    color: '#047DFA',
    image: 'unverify-icon.png',
    main: false
  },
  {
    key: 'generated 2 FA',
    label: platformLabels.Generated2FA,
    color: '#231f20',
    image: 'save.png',
    main: true
  },
  {
    key: 'PR',
    label: platformLabels.PR,
    color: '#231f20',
    image: 'preview.png',
    main: false
  },
  {
    key: 'Transfer',
    label: platformLabels.Transfer,
    color: '#4eb558',
    image: 'exchange-refresh-icon.png',
    main: false
  },
  {
    key: 'generateIV',
    label: platformLabels.GenerateInvoice,
    color: 'black',
    image: 'generate.png',
    main: false
  },
  {
    key: 'Generate Invoice',
    label: platformLabels.GenerateInvoice,
    color: '#231f20',
    main: false
  },
  {
    key: 'ClientSalesTransaction',
    label: platformLabels.ClientSalesTransaction,
    color: 'blue',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'Locked',
    label: platformLabels.Locked,
    color: '#231f20',
    image: 'lock.png',
    main: false,
    access: accessMap[TrxType.UNPOST]
  },
  {
    key: 'Unlocked',
    label: platformLabels.Unlocked,
    color: '#231f20',
    image: 'unlock.png',
    main: false,
    access: accessMap[TrxType.POST]
  },
  {
    key: 'Ok',
    label: platformLabels.OK,
    color: '#231f20',
    main: false
  },
  {
    key: 'ItemPromotion',
    label: platformLabels.ItemPromotion,
    color: '#231f43',
    image: 'popup-window.png',
    main: false
  },
  { key: 'Attachment', label: platformLabels.Attachment, color: '#9B1944', image: 'attachment.png', main: false },
  {
    key: 'Production',
    label: platformLabels.Production,
    color: '#d3d3d3',
    image: 'production.png',
    main: false
  },
  {
    key: 'DefaultBilling',
    label: platformLabels.DefaultBilling,
    color: '#231f20',
    image: 'generate.png',
    main: false
  },
  {
    key: 'DefaultShipping',
    label: platformLabels.DefaultShipping,
    color: '#231f20',
    image: 'shipment.png',
    main: false
  },
  {
    key: 'Damage',
    label: platformLabels.Damage,
    color: '#C91E1E',
    image: 'popup-window.png'
  },
  {
    key: 'Sketch',
    label: platformLabels.Sketch,
    color: '#048693',
    image: 'sketch.png',
    main: false
  },
  { key: 'Copy', label: platformLabels.Copy, color: '#CD5C5C', image: 'copy.png', main: false },
  {
    key: 'GenerateJob',
    label: platformLabels.Generate,
    color: '#D3D3D3',
    image: 'generate2.png',
    main: false
  },
  {
    key: 'GenerateSerialsLots',
    label: platformLabels.GenerateSerials,
    color: '#D3D3D3',
    image: 'generate2.png',
    main: false
  },
  {
    key: 'threeDPrinting',
    label: platformLabels.threeDPrinting,
    color: '#067851',
    image: '3d-printer.png',
    main: false
  },
  {
    key: 'threeDDesign',
    label: platformLabels.threeDDesign,
    color: '#1f78b4',
    image: '3d-printer.png',
    main: false
  },
  {
    key: 'ORD',
    label: platformLabels.ord,
    color: '#231f20',
    main: false
  },
  {
    key: 'add',
    label: platformLabels.add,
    color: '#231f20',
    main: false
  },
  {
    key: 'SHP',
    label: platformLabels.shp,
    color: '#231f20',
    main: false
  },
  {
    key: 'Reset',
    label: platformLabels.Reset,
    image: 'undo-arrow-icon.png',
    color: '#231f20',
    main: false
  }
]
