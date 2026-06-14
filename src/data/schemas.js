// Field schema for each Excel sheet.
// type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea'
// optionsFromData: fn(data) → [{ value, label }]  — dynamic select from loaded data

export const SCHEMAS = {

  // ── Finance ────────────────────────────────────────────────────────────────

  Budget: [
    { key: 'Name', label: 'Name', type: 'text', required: true },
    { key: 'Type', label: 'Type', type: 'select', required: true,
      options: [
        'Employment', 'Business', 'Investment Income', 'Rental Income',
        'Housing', 'Utility', 'Food', 'Dining Out', 'Transportation',
        'Healthcare', 'Insurance', 'Entertainment', 'Personal Care',
        'Education', 'Travel', 'Subscriptions', 'Savings', 'Taxes',
        'Home Maintenance', 'Gifts', 'Other',
      ] },
    { key: 'Category',  label: 'Category',  type: 'select', required: true, options: ['Income', 'Expense'] },
    { key: 'Amount',    label: 'Amount ($)', type: 'number', required: true },
    { key: 'Frequency', label: 'Frequency', type: 'select', defaultValue: 'Monthly',
      options: ['Monthly', 'Weekly', 'Bi-weekly', 'Annual', 'One-time'] },
    { key: 'Active', label: 'Active', type: 'select', defaultValue: 'Yes', options: ['Yes', 'No'] },
  ],

  AssetGoals: [
    { key: 'AssetClass', label: 'Asset Class', type: 'select', required: true,
      options: ['Cash', 'Bonds/CDs/Treasuries', 'Stock', 'Other'] },
    { key: 'Subclass', label: 'Subclass (blank = class-level goal)', type: 'text' },
    { key: 'GoalPct',  label: 'Goal (%)', type: 'number', required: true, step: 0.1 },
  ],

  FinancialGoals: [
    { key: 'Name',         label: 'Name',              type: 'text',   required: true },
    { key: 'TargetAmount', label: 'Target Amount ($)',  type: 'number', required: true },
    { key: 'TargetDate',   label: 'Target Date',        type: 'date' },
    { key: 'LinkedAssetID', label: 'Linked Asset ID',  type: 'number' },
    { key: 'Status', label: 'Status', type: 'select', defaultValue: 'On Track',
      options: ['On Track', 'Goal Met', 'At Risk'] },
    { key: 'Notes', label: 'Notes', type: 'textarea' },
  ],

  ProjectionSettings: [
    { key: 'Label',      label: 'Asset / Income Source',                                      type: 'text',     required: true },
    { key: 'StartValue', label: 'Starting Value ($) — leave blank to use current balance',    type: 'number' },
    { key: 'GrowthRate', label: 'Annual Growth Rate (%)',                                     type: 'number',   step: 0.1, required: true, defaultValue: 8 },
    { key: 'AnnualAdd',  label: 'Annual Contribution ($) — e.g. 401k match, budget surplus', type: 'number',   defaultValue: 0 },
    { key: 'Notes',      label: 'Notes / Assumptions',                                       type: 'textarea' },
  ],

  Liabilities: [
    { key: 'Name',         label: 'Name',                       type: 'text',    required: true },
    { key: 'Type',         label: 'Type',                       type: 'select',  required: true,
      options: ['Mortgage', 'Auto', 'Student Loan', 'Credit Card', 'Personal', 'Other'] },
    { key: 'Lender',       label: 'Lender / Servicer',          type: 'text' },
    { key: 'Balance',      label: 'Current Balance ($)',         type: 'number',  required: true },
    { key: 'InterestRate', label: 'Interest Rate (%)',           type: 'number',  step: 0.01 },
    { key: 'MinPayment',   label: 'Minimum Payment ($/mo)',      type: 'number' },
    { key: 'AssetValue',   label: 'Collateral Value ($) — e.g. home or car value for secured debts', type: 'number' },
    { key: 'Active',       label: 'Active',                      type: 'boolean', defaultValue: true },
    { key: 'Notes',        label: 'Notes',                       type: 'textarea' },
  ],

  CreditCardRewards: [
    { key: 'CardName',      label: 'Card Name',                                                          type: 'text',   required: true },
    { key: 'RewardProgram', label: 'Reward Program (e.g. Chase Ultimate Rewards, Delta SkyMiles)',       type: 'text' },
    { key: 'Points',        label: 'Points / Miles Balance',                                             type: 'number', required: true },
    { key: 'CentsPerPoint', label: 'Estimated Value (¢ per point) — e.g. 1.0 for cash, 1.5–2.0 for travel', type: 'number', step: 0.1, defaultValue: 1 },
    { key: 'ExpirationDate', label: 'Points Expiration Date',                                            type: 'date' },
    { key: 'Notes',         label: 'Notes',                                                              type: 'textarea' },
  ],

  // ── Accounts ──────────────────────────────────────────────────────────────

  NonTangibleAssets: [
    { key: 'Name', label: 'Name', type: 'text', required: true },
    { key: 'Type', label: 'Type', type: 'select', required: true,
      options: ['Bank', 'Credit Union', 'Certificate Deposit', 'Investment', 'Retirement', 'HSA', 'Bonds', 'Stock', 'Crypto', 'Treasuries', 'Other'] },
    { key: 'Subtype',          label: 'Subtype',           type: 'text' },
    { key: 'Currency',         label: 'Currency',          type: 'text',    defaultValue: 'USD' },
    { key: 'Institution',      label: 'Institution',       type: 'text' },
    { key: 'RetirementAccount', label: 'Retirement Account', type: 'boolean' },
    { key: 'Notes',            label: 'Notes',             type: 'textarea' },
  ],

  AssetHistory: [
    { key: 'AssetID', label: 'Asset', type: 'select', required: true,
      optionsFromData: (d) => (d?.NonTangibleAssets || []).map((a) => ({ value: a.ID, label: a.Name })) },
    { key: 'Date',  label: 'Date',       type: 'date',   required: true },
    { key: 'Value', label: 'Value ($)',   type: 'number', required: true },
  ],

  CDs: [
    { key: 'Name',         label: 'Name',           type: 'text',    required: true },
    { key: 'Currency',     label: 'Currency',        type: 'text',    defaultValue: 'USD' },
    { key: 'Institution',  label: 'Institution',     type: 'text' },
    { key: 'StartDate',    label: 'Start Date',      type: 'date' },
    { key: 'APY',          label: 'APY (%)',          type: 'number',  step: 0.01 },
    { key: 'FaceValue',    label: 'Face Value ($)',   type: 'number',  required: true },
    { key: 'MaturityDate', label: 'Maturity Date',   type: 'date',    required: true },
    { key: 'AutoRenew',    label: 'Auto Renew',       type: 'boolean' },
    { key: 'Active',       label: 'Active',           type: 'boolean', defaultValue: true },
    { key: 'Notes',        label: 'Notes',            type: 'textarea' },
  ],

  CryptoAssets: [
    { key: 'Name',       label: 'Name',               type: 'text',   required: true },
    { key: 'Ticker',     label: 'Ticker',              type: 'text',   required: true },
    { key: 'Wallet',     label: 'Wallet / Exchange',   type: 'text' },
    { key: 'Quantity',   label: 'Coins Held',          type: 'number', step: 0.00000001 },
    { key: 'Value',      label: 'Current Value ($)',   type: 'number' },
    { key: 'Staked',     label: 'Staked',              type: 'boolean' },
    { key: 'AutoRestake', label: 'Auto Restake',       type: 'boolean' },
    { key: 'StakingAPY', label: 'Staking APY (%)',     type: 'number', step: 0.01 },
    { key: 'UnlockDate', label: 'Unlock Date',         type: 'date' },
    { key: 'Notes',      label: 'Notes',               type: 'textarea' },
  ],

  RetirementSchedule: [
    { key: 'Source', label: 'Source Name (e.g. Social Security)', type: 'text' },
    { key: 'AssetID', label: 'Linked Account (leave blank for SS/pension)', type: 'select',
      optionsFromData: (d) => (d?.NonTangibleAssets || []).map((a) => ({ value: a.ID, label: a.Name })) },
    { key: 'AccessibleYear',       label: 'Accessible Year',                                                   type: 'number', required: true },
    { key: 'WithdrawalRate',       label: 'Withdrawal Rate (%) — leave blank for fixed income',                type: 'number', step: 0.1, defaultValue: 4 },
    { key: 'ExpectedYearlyAmount', label: 'Expected Yearly Amount ($) — used when no withdrawal rate',         type: 'number' },
    { key: 'Notes',                label: 'Notes',                                                             type: 'textarea' },
  ],

  RetirementHoldings: [
    { key: 'AssetID', label: 'Account', type: 'select',
      optionsFromData: (d) => (d?.NonTangibleAssets || []).filter((a) => a.RetirementAccount).map((a) => ({ value: a.ID, label: a.Name })) },
    { key: 'FundName',   label: 'Fund Name',       type: 'text',   required: true },
    { key: 'Ticker',     label: 'Ticker',           type: 'text' },
    { key: 'Percentage', label: 'Percentage (%)',   type: 'number', required: true },
    { key: 'Notes',      label: 'Notes',            type: 'textarea' },
  ],

  FundAllocation: [
    { key: 'HoldingID', label: 'Holding', type: 'select', required: true,
      optionsFromData: (d) => (d?.RetirementHoldings || []).map((h) => ({
        value: h.ID ?? h._rowIndex,
        label: h.Ticker ? `${h.Ticker} — ${h.FundName}` : h.FundName,
      })) },
    { key: 'AssetClass',  label: 'Asset Class',     type: 'text',   required: true },
    { key: 'Percentage',  label: 'Percentage (%)',   type: 'number', required: true },
  ],

  Donations: [
    { key: 'Year',         label: 'Year',           type: 'number', required: true },
    { key: 'Organization', label: 'Organization',   type: 'text',   required: true },
    { key: 'Amount',       label: 'Amount ($)',      type: 'number', required: true },
    { key: 'Date',         label: 'Date',            type: 'date' },
    { key: 'Notes',        label: 'Notes',           type: 'textarea' },
  ],

  // ── Assets ────────────────────────────────────────────────────────────────

  TangibleAssets: [
    { key: 'Category',     label: 'Category',          type: 'text',    required: true },
    { key: 'Name',         label: 'Name',               type: 'text',    required: true },
    { key: 'Series',       label: 'Series',             type: 'text' },
    { key: 'Author',       label: 'Author',             type: 'text' },
    { key: 'Language',     label: 'Language',           type: 'text' },
    { key: 'Format',       label: 'Format',             type: 'text' },
    { key: 'Condition',    label: 'Condition',          type: 'text' },
    { key: 'BuyDate',      label: 'Purchase Date',      type: 'date' },
    { key: 'Cost',         label: 'Cost ($)',            type: 'number' },
    { key: 'CurrentValue', label: 'Current Value ($)',  type: 'number' },
    { key: 'StillHave',    label: 'Still Own',          type: 'boolean', defaultValue: true },
    { key: 'Notes',        label: 'Notes',              type: 'textarea' },
  ],

  DigitalAssets: [
    { key: 'Category',     label: 'Category',             type: 'text',    required: true },
    { key: 'Name',         label: 'Name',                  type: 'text',    required: true },
    { key: 'Series',       label: 'Series',                type: 'text' },
    { key: 'Author',       label: 'Author / Publisher',    type: 'text' },
    { key: 'Language',     label: 'Language',              type: 'text' },
    { key: 'Format',       label: 'Format',                type: 'text' },
    { key: 'Condition',    label: 'Condition',             type: 'text' },
    { key: 'BuyDate',      label: 'Purchase Date',         type: 'date' },
    { key: 'Cost',         label: 'Cost ($)',               type: 'number' },
    { key: 'CurrentValue', label: 'Current Value ($)',     type: 'number' },
    { key: 'StillHave',    label: 'Still Own',             type: 'boolean', defaultValue: true },
    { key: 'Notes',        label: 'Notes',                 type: 'textarea' },
  ],

  // ── Life ──────────────────────────────────────────────────────────────────

  LifetimeGoals: [
    { key: 'Goal', label: 'Goal', type: 'text', required: true },
    { key: 'Status', label: 'Status', type: 'select', required: true, defaultValue: 'Not Started',
      options: ['In Progress', 'Planned', 'Not Started', 'Done'] },
    { key: 'Category', label: 'Category',                  type: 'text' },
    { key: 'Progress', label: 'Progress (e.g. 41/90)',     type: 'text' },
    { key: 'Notes',    label: 'Notes',                     type: 'textarea' },
  ],

  EducationGoals: [
    { key: 'Name', label: 'Cert / Degree Name', type: 'text', required: true },
    { key: 'Type', label: 'Type', type: 'select', required: true,
      options: ['Technology', 'Japanese', 'Humanities', 'Business', 'Microsoft', 'Other'] },
    { key: 'Difficulty', label: 'Difficulty', type: 'select',
      options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'Renewal',    label: 'Renewal',      type: 'text' },
    { key: 'TargetDate', label: 'Target Date',  type: 'text' },
    { key: 'Done',       label: 'Done',          type: 'boolean', defaultValue: false },
    { key: 'Notes',      label: 'Notes',         type: 'textarea' },
  ],

  Awards: [
    { key: 'Title', label: 'Award / Honor', type: 'text', required: true },
    { key: 'Category', label: 'Category', type: 'select', required: true,
      options: ['Work', 'School', 'Sports', 'Volunteer', 'Personal', 'Other'] },
    { key: 'Issuer',    label: 'Issuer / Organization', type: 'text' },
    { key: 'AwardDate', label: 'Date',                  type: 'date' },
    { key: 'Notes',     label: 'Notes',                 type: 'textarea' },
  ],

  Milestones: [
    { key: 'Title', label: 'Milestone', type: 'text', required: true },
    { key: 'Category', label: 'Category', type: 'select', required: true,
      options: ['Family', 'Travel', 'Career', 'Education', 'Health', 'Personal', 'Other'] },
    { key: 'Date',  label: 'Date',  type: 'date',     required: true },
    { key: 'Notes', label: 'Notes', type: 'textarea' },
  ],

  Tasks: [
    { key: 'Name', label: 'Task', type: 'text', required: true },
    { key: 'Category', label: 'Category', type: 'select',
      options: ['Work', 'School', 'Personal', 'Family', 'Health', 'Other'] },
    { key: 'Priority', label: 'Priority', type: 'select', defaultValue: 'Medium',
      options: ['High', 'Medium', 'Low'] },
    { key: 'DueDate', label: 'Due Date', type: 'date' },
    { key: 'Status',  label: 'Status',   type: 'select', defaultValue: 'Open', options: ['Open', 'Done'] },
    { key: 'Notes',   label: 'Notes',    type: 'textarea' },
  ],

  ResearchLinks: [
    { key: 'Title',    label: 'Title',             type: 'text', required: true },
    { key: 'Category', label: 'Category',          type: 'text', required: true },
    { key: 'Link',     label: 'File Path or URL',  type: 'text', required: true },
    { key: 'Notes',    label: 'Notes',             type: 'textarea' },
  ],

  ReadingLog: [
    { key: 'Name',     label: 'Title',          type: 'text' ,  required: true },
    { key: 'Author',   label: 'Author',         type: 'text' },
    { key: 'ReadDate', label: 'Read Date',      type: 'date' },
    { key: 'Genre',    label: 'Genre',          type: 'text' },
    { key: 'Format',   label: 'Format',         type: 'select', options: ['Physical', 'Ebook', 'Audiobook'] },
    { key: 'Rating',   label: 'Rating (1–5)',   type: 'number', step: 0.5 },
    { key: 'Notes',    label: 'Notes',          type: 'textarea' },
  ],

  GamingLog: [
    { key: 'Name',     label: 'Game',            type: 'text', required: true },
    { key: 'Platform', label: 'Platform',         type: 'text', required: true },
    { key: 'Status',   label: 'Status',           type: 'select', defaultValue: 'Completed',
      options: ['Completed', 'Playing', 'Abandoned', 'Backlog'] },
    { key: 'CompletionDate', label: 'Completion Date', type: 'date' },
    { key: 'Genre',          label: 'Genre',            type: 'text' },
    { key: 'Rating',         label: 'Rating (1–5)',     type: 'number', step: 0.5 },
    { key: 'Notes',          label: 'Notes',            type: 'textarea' },
  ],

  FilmLog: [
    { key: 'Name',         label: 'Title',          type: 'text',   required: true },
    { key: 'ReleaseYear',  label: 'Release Year',   type: 'number' },
    { key: 'WatchDate',    label: 'Watch Date',     type: 'date' },
    { key: 'Rating',       label: 'Rating (1–5)',   type: 'number', step: 0.5 },
    { key: 'LetterboxdURI', label: 'Letterboxd URI', type: 'text' },
    { key: 'Notes',        label: 'Notes',          type: 'textarea' },
  ],

  Wishlist: [
    { key: 'Name',     label: 'Name',                         type: 'text',   required: true },
    { key: 'Category', label: 'Category',                     type: 'select', required: true,
      options: ['Books', 'Films', 'Games', 'Vinyl', 'Comics', 'Art', 'Other'] },
    { key: 'Creator',     label: 'Author / Director / Developer', type: 'text' },
    { key: 'Priority',    label: 'Priority',                       type: 'select', defaultValue: 'Medium',
      options: ['High', 'Medium', 'Low'] },
    { key: 'TargetPrice', label: 'Target Price ($)',               type: 'number' },
    { key: 'Notes',       label: 'Notes',                          type: 'textarea' },
    { key: 'Status',      label: 'Status',                         type: 'select', defaultValue: 'Wanted',
      options: ['Wanted', 'Found', 'Purchased'] },
    { key: 'AddedDate',   label: 'Date Added',                     type: 'date' },
  ],

  // ── Personal ──────────────────────────────────────────────────────────────

  PersonalInfo: [
    { key: 'Name',        label: 'Full Name',    type: 'text', required: true },
    { key: 'Nickname',    label: 'Nickname',     type: 'text' },
    { key: 'DateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'Notes',       label: 'Bio',          type: 'textarea' },
  ],

  PersonalContacts: [
    { key: 'Type', label: 'Type', type: 'select', required: true,
      options: ['Email', 'Phone', 'Address', 'Website', 'Social', 'Other'] },
    { key: 'Label',   label: 'Label (e.g. Work, Personal, Home, Mobile)', type: 'text',    required: true },
    { key: 'Value',   label: 'Value',                                      type: 'text',    required: true },
    { key: 'Primary', label: 'Primary',                                    type: 'boolean', defaultValue: false },
    { key: 'Notes',   label: 'Notes',                                      type: 'textarea' },
  ],

  Contacts: [
    { key: 'Name', label: 'Name', type: 'text', required: true },
    { key: 'Relationship', label: 'Relationship', type: 'select',
      options: ['Family', 'Friend', 'Colleague', 'Acquaintance', 'Other'] },
    { key: 'Phone',    label: 'Phone',        type: 'text' },
    { key: 'Email',    label: 'Email',        type: 'text' },
    { key: 'Social',   label: 'Social Media', type: 'text' },
    { key: 'Address',  label: 'Address',      type: 'text' },
    { key: 'Birthday', label: 'Birthday',     type: 'date' },
    { key: 'Favorite', label: 'Favorite',     type: 'boolean', defaultValue: false },
    { key: 'Notes',    label: 'Notes',        type: 'textarea' },
  ],

};
