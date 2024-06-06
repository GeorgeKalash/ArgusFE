export const getButtons = mainLabels => [
  {
    key: 'Post',
    label: mainLabels.Post,
    color: '#231f20',
    image: 'post.png',
    main: false
  },
  {
    key: 'Bulk',
    label: mainLabels.Bulk,
    color: '#09235C',
    image: 'Bulk.png',
    main: false
  },
  {
    key: 'Cancel',
    label: mainLabels.Cancel,
    color: '#0A4164',
    image: 'cancelWhite.png',
    main: false
  },
  {
    key: 'WorkFlow',
    label: mainLabels.WorkFlow,
    color: '#231f20',
    image: 'workflow.png',
    main: false
  },
  {
    key: 'Delete',
    label: mainLabels.Delete,
    color: '#231f20',
    image: 'delete-icon.png',
    main: false
  },
  {
    key: 'Close',
    label: mainLabels.Close,
    color: 'transparent',
    image: 'close.png',
    border: '1px solid #01a437',
    main: false
  },
  {
    key: 'Reopen',
    label: mainLabels.Reopen,
    color: 'transparent',
    image: 'reopen.png',
    border: '1px solid #000000',
    main: false
  },
  {
    key: 'Approval',
    label: mainLabels.Approval,
    color: '#4EB558',
    image: 'approval.png',
    main: false
  },
  {
    key: 'Dismiss all',
    label: mainLabels.DismissAll,
    color: '#F44336',
    image: 'dismissal.png',
    main: false
  },
  {
    key: 'Reject',
    label: mainLabels.Reject,
    color: '#F44336',
    image: 'dismissal.png',
    main: false
  },
  {
    key: 'Approve',
    label: mainLabels.Approve,
    color: '#4EB558',
    image: 'approval.png',
    main: false
  },
  {
    key: 'Beneficiary',
    label: mainLabels.Beneficiary,
    color: '#231f20',
    image: 'beneficiary.png',
    main: false
  },
  {
    key: 'Print',
    label: mainLabels.Print,
    color: '#231f20',
    image: 'print.png',
    main: false
  },
  {
    key: 'Invoice',
    label: mainLabels.Invoice,
    color: '#231f20',
    image: 'invoice.png',
    main: false
  },
  {
    key: 'Tree',
    label: mainLabels.Tree,
    color: '#231f20',
    image: 'tree.png',
    main: false
  },
  {
    key: 'Integration Account',
    label: mainLabels.IntegrationAccount,
    color: '#231f20',
    image: 'intAccount.png',
    main: false
  },
  {
    key: 'Account Balance',
    label: mainLabels.AccountBalance,
    color: '#275915',
    image: 'popup-window.png',
    main: false
  },
  {
    key: 'Client Relation',
    label: mainLabels.ClientRelation,
    color: '#AC48AE',
    image: 'clientRelations.png',
    main: false
  },
  {
    key: 'GL',
    label: mainLabels.GL,
    color: '#231f20',
    image: 'gl.png',
    main: false
  },
  {
    key: 'Shipment',
    label: mainLabels.Shipment,
    color: '#843c54',
    image: 'shipment.png',
    main: false
  },
  {
    key: 'Transportation',
    label: mainLabels.Transportation,
    color: '#064b38',
    image: 'transportation.png',
    main: false
  },
  {
    key: 'RecordRemarks',
    label: mainLabels.RecordRemarks,
    color: '#90278e',
    image: 'notes.png',
    main: false
  },
  {
    key: 'Apply',
    label: mainLabels.Apply,
    color: '#4eb558',
    image: 'apply.png',
    main: false
  },
  {
    key: 'Clear',
    label: mainLabels.Clear,
    condition: 'isCleared',
    onClick: 'onClear',
    color: '#f44336',
    image: 'clear.png',
    main: true
  },
  {
    key: 'Info',
    label: mainLabels.Info,
    condition: 'isInfo && infoVisible',
    onClick: 'onInfo',
    color: '#4355a5',
    disabled: '!editMode',
    image: 'info.png',
    main: true
  },
  {
    key: 'Submit',
    label: mainLabels.Submit,
    condition: 'isSaved',
    onClick: 'onSave',
    color: '#4eb558',
    disabled: 'disabledSubmit || isPosted || isClosed',
    image: 'save.png',
    main: true
  }
]
