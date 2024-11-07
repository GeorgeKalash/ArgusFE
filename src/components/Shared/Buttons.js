export const getButtons = platformLabels => [
  {
    key: 'Post',
    label: platformLabels.Post,
    color: '#231f20',
    image: 'post.png',
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
    main: false
  },
  {
    key: 'Reopen',
    label: platformLabels.Reopen,
    color: 'transparent',
    image: 'reopen.png',
    border: '1px solid #000000',
    main: false
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
    key: 'Rebuild',
    color: '#231F20',
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
    key: 'Clear',
    label: platformLabels.Clear,
    condition: 'isCleared',
    onClick: 'onClear',
    color: '#f44336',
    image: 'clear.png',
    main: true
  },
  {
    key: 'generate',
    label: platformLabels.Generate,
    condition: 'isGenerated',
    onClick: 'onGenerate',
    disabled: '!editMode',
    color: 'black',
    image: 'generate.png',
    main: true
  },
  {
    key: 'Audit',
    label: platformLabels.Audit,
    color: '#231f20',
    image: 'info.png',
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
    key: 'Import',
    label: platformLabels.Import,
    color: '#000',
    image: 'import.png',
    main: false
  },
  {
    key: 'Lock',
    label: platformLabels.Lock,
    color: '#231f20',
    image: 'lock.png',
    main: false
  },
  {
    key: 'Unlock',
    label: platformLabels.Unlock,
    color: '#231f20',
    image: 'unlock.png',
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
    key: 'generated 2 FA',
    label: platformLabels.Generated2FA,
    color: '#231f20',
    image: 'save.png',
    main: true
  }
]
