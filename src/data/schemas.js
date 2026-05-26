// Field schema for each Excel sheet.
// type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea'
// optionsFromData: fn(data) → [{ value, label }]  — dynamic select from loaded data

export const SCHEMAS = {
  NonTangibleAssets: [
    { key: 'Name',              label: 'Name',               type: 'text',    required: true },
    { key: 'Type',              label: 'Type',               type: 'select',  required: true,
      options: ['Bank', 'Investment', 'Retirement', 'Crypto', 'Other'] },
    { key: 'Subtype',           label: 'Subtype',            type: 'text' },
    { key: 'Currency',          label: 'Currency',           type: 'text',    defaultValue: 'USD' },
    { key: 'Institution',       label: 'Institution',        type: 'text' },
    { key: 'RetirementAccount', label: 'Retirement Account', type: 'boolean' },
    { key: 'Notes',             label: 'Notes',              type: 'textarea' },
  ],

  AssetHistory: [
    { key: 'AssetID', label: 'Asset', type: 'select', required: true,
      optionsFromData: d => (d?.NonTangibleAssets || []).map(a => ({ value: a.ID, label: a.Name })) },
    { key: 'Date',    label: 'Date',       type: 'date',   required: true },
    { key: 'Value',   label: 'Value ($)',  type: 'number', required: true },
  ],

  CDs: [
    { key: 'Name',         label: 'Name',           type: 'text',    required: true },
    { key: 'Currency',     label: 'Currency',        type: 'text',    defaultValue: 'USD' },
    { key: 'Institution',  label: 'Institution',     type: 'text' },
    { key: 'StartDate',    label: 'Start Date',      type: 'date' },
    { key: 'APY',          label: 'APY (%)',         type: 'number',  step: 0.01 },
    { key: 'FaceValue',    label: 'Face Value ($)',  type: 'number',  required: true },
    { key: 'MaturityDate', label: 'Maturity Date',   type: 'date',    required: true },
    { key: 'AutoRenew',    label: 'Auto Renew',      type: 'boolean' },
    { key: 'Active',       label: 'Active',          type: 'boolean', defaultValue: true },
    { key: 'Notes',        label: 'Notes',           type: 'textarea' },
  ],

  TangibleAssets: [
    { key: 'Category',     label: 'Category',           type: 'text',    required: true },
    { key: 'Name',         label: 'Name',               type: 'text',    required: true },
    { key: 'Series',       label: 'Series',             type: 'text' },
    { key: 'Author',       label: 'Author',             type: 'text' },
    { key: 'Language',     label: 'Language',           type: 'text' },
    { key: 'Format',       label: 'Format',             type: 'text' },
    { key: 'Condition',    label: 'Condition',          type: 'text' },
    { key: 'BuyDate',      label: 'Purchase Date',      type: 'date' },
    { key: 'Cost',         label: 'Cost ($)',           type: 'number' },
    { key: 'CurrentValue', label: 'Current Value ($)',  type: 'number' },
    { key: 'StillHave',    label: 'Still Own',          type: 'boolean', defaultValue: true },
    { key: 'Notes',        label: 'Notes',              type: 'textarea' },
  ],

  DigitalAssets: [
    { key: 'Category',     label: 'Category',           type: 'text',    required: true },
    { key: 'Name',         label: 'Name',               type: 'text',    required: true },
    { key: 'Series',       label: 'Series',             type: 'text' },
    { key: 'Author',       label: 'Author / Publisher', type: 'text' },
    { key: 'Language',     label: 'Language',           type: 'text' },
    { key: 'Format',       label: 'Format',             type: 'text' },
    { key: 'Condition',    label: 'Condition',          type: 'text' },
    { key: 'BuyDate',      label: 'Purchase Date',      type: 'date' },
    { key: 'Cost',         label: 'Cost ($)',           type: 'number' },
    { key: 'CurrentValue', label: 'Current Value ($)',  type: 'number' },
    { key: 'StillHave',    label: 'Still Own',          type: 'boolean', defaultValue: true },
    { key: 'Notes',        label: 'Notes',              type: 'textarea' },
  ],

  CryptoAssets: [
    { key: 'Name',        label: 'Name',               type: 'text',    required: true },
    { key: 'Ticker',      label: 'Ticker',             type: 'text',    required: true },
    { key: 'Wallet',      label: 'Wallet / Exchange',  type: 'text' },
    { key: 'Staked',      label: 'Staked',             type: 'boolean' },
    { key: 'AutoRestake', label: 'Auto Restake',       type: 'boolean' },
    { key: 'StakingAPY',  label: 'Staking APY (%)',   type: 'number',  step: 0.01 },
    { key: 'UnlockDate',  label: 'Unlock Date',        type: 'date' },
    { key: 'Notes',       label: 'Notes',              type: 'textarea' },
  ],

  Budget: [
    { key: 'Name',      label: 'Name',       type: 'text',   required: true },
    { key: 'Type',      label: 'Type',       type: 'text',   required: true },
    { key: 'Category',  label: 'Category',   type: 'select', required: true,
      options: ['Income', 'Expense'] },
    { key: 'Amount',    label: 'Amount ($)', type: 'number', required: true },
    { key: 'Frequency', label: 'Frequency',  type: 'select', defaultValue: 'Monthly',
      options: ['Monthly', 'Weekly', 'Bi-weekly', 'Annual', 'One-time'] },
    { key: 'Active',    label: 'Active',     type: 'select', defaultValue: 'Yes',
      options: ['Yes', 'No'] },
  ],

  Donations: [
    { key: 'Year',         label: 'Year',         type: 'number', required: true },
    { key: 'Organization', label: 'Organization', type: 'text',   required: true },
    { key: 'Amount',       label: 'Amount ($)',   type: 'number', required: true },
    { key: 'Date',         label: 'Date',         type: 'date' },
    { key: 'Notes',        label: 'Notes',        type: 'textarea' },
  ],

  FinancialGoals: [
    { key: 'Name',          label: 'Name',               type: 'text',   required: true },
    { key: 'TargetAmount',  label: 'Target Amount ($)',  type: 'number', required: true },
    { key: 'TargetDate',    label: 'Target Date',        type: 'date' },
    { key: 'LinkedAssetID', label: 'Linked Asset ID',    type: 'number' },
    { key: 'Status',        label: 'Status',             type: 'select', defaultValue: 'On Track',
      options: ['On Track', 'Goal Met', 'At Risk'] },
    { key: 'Notes',         label: 'Notes',              type: 'textarea' },
  ],

  RetirementSchedule: [
    { key: 'AssetID', label: 'Asset', type: 'select',
      optionsFromData: d => (d?.NonTangibleAssets || []).map(a => ({ value: a.ID, label: a.Name })) },
    { key: 'AccessibleYear',       label: 'Accessible Year',          type: 'number', required: true },
    { key: 'ExpectedYearlyAmount', label: 'Expected Yearly Amount ($)', type: 'number' },
    { key: 'Notes',                label: 'Notes',                    type: 'textarea' },
  ],

  RetirementHoldings: [
    { key: 'AssetID', label: 'Account', type: 'select',
      optionsFromData: d => (d?.NonTangibleAssets || [])
        .filter(a => a.RetirementAccount)
        .map(a => ({ value: a.ID, label: a.Name })) },
    { key: 'FundName',   label: 'Fund Name',        type: 'text',   required: true },
    { key: 'Ticker',     label: 'Ticker',           type: 'text' },
    { key: 'Percentage', label: 'Percentage (%)',   type: 'number', required: true },
    { key: 'Notes',      label: 'Notes',            type: 'textarea' },
  ],

  FundAllocation: [
    { key: 'HoldingID',  label: 'Holding ID',      type: 'number', required: true },
    { key: 'AssetClass', label: 'Asset Class',     type: 'text',   required: true },
    { key: 'Percentage', label: 'Percentage (%)',  type: 'number', required: true },
  ],

  AssetGoals: [
    { key: 'AssetClass', label: 'Asset Class',                            type: 'text',   required: true },
    { key: 'Subclass',   label: 'Subclass (blank = class-level goal)',     type: 'text' },
    { key: 'GoalPct',    label: 'Goal (%)',                               type: 'number', required: true, step: 0.1 },
  ],
}
