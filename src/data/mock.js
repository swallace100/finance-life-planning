// 18 months of deterministic history: Dec 2024 → May 2026
function generateAssetHistory() {
  const dates = [
    '2024-12-01', '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01',
    '2025-06-01', '2025-07-01', '2025-08-01', '2025-09-01', '2025-10-01', '2025-11-01',
    '2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01',
  ]

  const assets = [
    { id: 1, values: [6200, 5100, 7300, 4800, 6500, 5900, 7200, 6100, 8000, 5500, 6800, 7100, 6400, 5800, 7500, 6300, 8200, 6900] },
    { id: 2, values: [21000, 21400, 21800, 22200, 22600, 23000, 23400, 23800, 24200, 24600, 25000, 25400, 25800, 26200, 26600, 27000, 27400, 27800] },
    { id: 3, values: [85000, 87000, 88500, 86000, 90000, 92000, 91000, 94000, 96000, 93000, 97000, 100000, 99000, 102000, 104000, 106000, 103000, 107000] },
    { id: 4, values: [32000, 33500, 35000, 33000, 36000, 37500, 36000, 38500, 40000, 38000, 41000, 43000, 42000, 44500, 46000, 47500, 45000, 48000] },
    { id: 5, values: [6000, 8000, 10000, 9000, 12000, 11000, 8000, 13000, 15000, 12000, 14000, 16000, 18000, 15000, 12000, 16000, 19000, 22000] },
  ]

  let id = 1
  const rows = []
  dates.forEach((date, t) => {
    assets.forEach(asset => {
      rows.push({ ID: id++, AssetID: asset.id, Date: date, Value: asset.values[t] })
    })
  })
  return rows
}

export const mockData = {
  NonTangibleAssets: [
    { ID: 1, Name: 'Chase Checking',     Type: 'Bank',       Subtype: 'Checking', Currency: 'USD', Institution: 'Chase',        RetirementAccount: false, Notes: '' },
    { ID: 2, Name: 'Marcus HYSA',        Type: 'Bank',       Subtype: 'Savings',  Currency: 'USD', Institution: 'Goldman Sachs', RetirementAccount: false, Notes: '' },
    { ID: 3, Name: 'Fidelity 401(k)',    Type: 'Retirement', Subtype: '401k',     Currency: 'USD', Institution: 'Fidelity',      RetirementAccount: true,  Notes: '' },
    { ID: 4, Name: 'Fidelity Brokerage', Type: 'Investment', Subtype: 'Taxable',  Currency: 'USD', Institution: 'Fidelity',      RetirementAccount: false, Notes: '' },
    { ID: 5, Name: 'Bitcoin',            Type: 'Crypto',     Subtype: 'BTC',      Currency: 'USD', Institution: 'Coinbase',      RetirementAccount: false, Notes: '' },
  ],

  AssetHistory: generateAssetHistory(),

  CDs: [
    { ID: 1, Name: 'Ally 1-Year CD',  Currency: 'USD', Institution: 'Ally Bank',     StartDate: '2025-07-01', APY: 5.00, FaceValue: 10000, MaturityDate: '2026-07-01', AutoRenew: false, Active: true,  Notes: '' },
    { ID: 2, Name: 'Marcus 18-Mo CD', Currency: 'USD', Institution: 'Goldman Sachs', StartDate: '2025-03-15', APY: 4.75, FaceValue: 15000, MaturityDate: '2026-09-15', AutoRenew: true,  Active: true,  Notes: '' },
    { ID: 3, Name: 'Ally 6-Month CD', Currency: 'USD', Institution: 'Ally Bank',     StartDate: '2026-01-01', APY: 5.25, FaceValue:  5000, MaturityDate: '2026-07-01', AutoRenew: false, Active: true,  Notes: '' },
    { ID: 4, Name: 'Chase 2-Year CD', Currency: 'USD', Institution: 'Chase',         StartDate: '2025-05-01', APY: 4.50, FaceValue: 20000, MaturityDate: '2027-05-01', AutoRenew: false, Active: true,  Notes: '' },
    { ID: 5, Name: 'Old Marcus CD',   Currency: 'USD', Institution: 'Goldman Sachs', StartDate: '2023-12-01', APY: 4.25, FaceValue:  8000, MaturityDate: '2024-12-01', AutoRenew: false, Active: false, Notes: 'Matured' },
  ],

  TangibleAssets: [
    { ID: 1, Category: 'Sports Cards', Name: 'Mickey Mantle 1952 Topps',  Series: '1952 Topps',        Author: '', Language: 'English', Format: 'Raw',   Condition: 'VG', BuyDate: '2022-05-10', Cost: 500, CurrentValue: 800, StillHave: true, Notes: '' },
    { ID: 2, Category: 'Sports Cards', Name: 'LeBron James RC',           Series: '2003 Topps Chrome', Author: '', Language: 'English', Format: 'PSA 9', Condition: 'NM', BuyDate: '2021-03-15', Cost: 200, CurrentValue: 350, StillHave: true, Notes: '' },
    { ID: 3, Category: 'Coins',        Name: '1921 Morgan Silver Dollar', Series: 'Morgan',            Author: '', Language: '',        Format: 'Raw',   Condition: 'XF', BuyDate: '2023-08-20', Cost: 150, CurrentValue: 200, StillHave: true, Notes: '' },
  ],

  DigitalAssets: [
    { ID: 1, Category: 'Comics', Name: 'Amazing Fantasy #15 (digital)', Series: 'Amazing Fantasy', Author: 'Stan Lee',  Language: 'English', Format: 'CBZ', Condition: 'Digital', BuyDate: '2023-01-10', Cost: 15, CurrentValue: 15, StillHave: true, Notes: '' },
    { ID: 2, Category: 'Games',  Name: 'Zelda: Breath of the Wild',     Series: 'Zelda',           Author: 'Nintendo', Language: 'English', Format: 'ROM', Condition: 'Digital', BuyDate: '2022-06-01', Cost: 60, CurrentValue: 60, StillHave: true, Notes: '' },
  ],

  CryptoAssets: [
    { ID: 1, Name: 'Bitcoin',  Ticker: 'BTC', Wallet: 'Coinbase', Staked: false, AutoRestake: false, StakingAPY: null, UnlockDate: null,         Notes: '' },
    { ID: 2, Name: 'Ethereum', Ticker: 'ETH', Wallet: 'MetaMask', Staked: true,  AutoRestake: true,  StakingAPY: 4.2,  UnlockDate: '2026-08-01', Notes: 'Liquid staking' },
    { ID: 3, Name: 'Solana',   Ticker: 'SOL', Wallet: 'Phantom',  Staked: true,  AutoRestake: false, StakingAPY: 6.5,  UnlockDate: '2026-07-15', Notes: '' },
  ],

  Donations: [
    { ID: 1, Year: 2026, Organization: 'Red Cross',        Amount: 250, Date: '2026-01-15', Notes: '' },
    { ID: 2, Year: 2025, Organization: 'Local Food Bank',  Amount: 500, Date: '2025-11-22', Notes: 'Holiday drive' },
    { ID: 3, Year: 2025, Organization: 'Red Cross',        Amount: 400, Date: '2025-06-01', Notes: '' },
    { ID: 4, Year: 2025, Organization: 'ACLU',             Amount: 100, Date: '2025-03-15', Notes: '' },
    { ID: 5, Year: 2024, Organization: 'Red Cross',        Amount: 300, Date: '2024-12-01', Notes: '' },
    { ID: 6, Year: 2024, Organization: 'Local Food Bank',  Amount: 200, Date: '2024-11-20', Notes: '' },
  ],

  RetirementSchedule: [
    { ID: 1, AssetID: 3, AccessibleYear: 2050, ExpectedYearlyAmount: 60000, Notes: 'Target retirement age 65' },
  ],

  RetirementHoldings: [
    { ID: 1, AssetID: 3, FundName: 'Fidelity Total Market Index', Ticker: 'FSKAX', Percentage: 60, Notes: '' },
    { ID: 2, AssetID: 3, FundName: 'Fidelity International Index', Ticker: 'FSPSX', Percentage: 30, Notes: '' },
    { ID: 3, AssetID: 3, FundName: 'Fidelity Bond Index',          Ticker: 'FXNAX', Percentage: 10, Notes: '' },
  ],

  FundAllocation: [
    { ID: 1, HoldingID: 1, AssetClass: 'US Stocks',            Percentage: 100 },
    { ID: 2, HoldingID: 2, AssetClass: 'International Stocks',  Percentage: 100 },
    { ID: 3, HoldingID: 3, AssetClass: 'Bonds',                 Percentage: 100 },
  ],

  Budget: [
    { ID: 1,  Name: 'Salary',          Type: 'Employment',    Category: 'Income',  Amount:  5000,  Frequency: 'Monthly', Active: 'Yes' },
    { ID: 2,  Name: 'Rent',            Type: 'Housing',       Category: 'Expense', Amount: -1500,  Frequency: 'Monthly', Active: 'Yes' },
    { ID: 3,  Name: 'Groceries',       Type: 'Food',          Category: 'Expense', Amount:  -400,  Frequency: 'Monthly', Active: 'Yes' },
    { ID: 4,  Name: 'Electric',        Type: 'Utility',       Category: 'Expense', Amount:   -80,  Frequency: 'Monthly', Active: 'Yes' },
    { ID: 5,  Name: 'Netflix',         Type: 'Entertainment', Category: 'Expense', Amount:   -18,  Frequency: 'Monthly', Active: 'Yes' },
    { ID: 6,  Name: 'Health Insurance',Type: 'Insurance',     Category: 'Expense', Amount:  -200,  Frequency: 'Monthly', Active: 'Yes' },
  ],

  AssetGoals: [
    { ID: 1,  AssetClass: 'Cash',     Subclass: null,                   GoalPct: 10 },
    { ID: 2,  AssetClass: 'Cash',     Subclass: 'USD',                  GoalPct: 100 },
    { ID: 3,  AssetClass: 'Bonds/CD', Subclass: null,                   GoalPct: 20 },
    { ID: 4,  AssetClass: 'Bonds/CD', Subclass: 'Certificate Deposit',  GoalPct: 50 },
    { ID: 5,  AssetClass: 'Bonds/CD', Subclass: 'Bonds',                GoalPct: 50 },
    { ID: 6,  AssetClass: 'Stock',    Subclass: null,                   GoalPct: 65 },
    { ID: 7,  AssetClass: 'Stock',    Subclass: 'US Stocks',            GoalPct: 60 },
    { ID: 8,  AssetClass: 'Stock',    Subclass: 'International Stocks', GoalPct: 30 },
    { ID: 9,  AssetClass: 'Stock',    Subclass: 'Taxable',              GoalPct: 10 },
    { ID: 10, AssetClass: 'Other',    Subclass: null,                   GoalPct: 5 },
    { ID: 11, AssetClass: 'Other',    Subclass: 'BTC',                  GoalPct: 60 },
    { ID: 12, AssetClass: 'Other',    Subclass: 'Sports Cards',         GoalPct: 25 },
    { ID: 13, AssetClass: 'Other',    Subclass: 'Coins',                GoalPct: 15 },
  ],

  FinancialGoals: [
    { ID: null, Name: '2021 Financial Goal',  TargetAmount:  250000, TargetDate: '2021-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'Goal Met', Notes: '' },
    { ID: null, Name: '2026 Financial Goal',  TargetAmount:  500000, TargetDate: '2026-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'Goal Met', Notes: '' },
    { ID: null, Name: '2031 Financial Goals', TargetAmount:  750000, TargetDate: '2031-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'On Track', Notes: '' },
    { ID: null, Name: '2043 Financial Goals', TargetAmount: 1200000, TargetDate: '2043-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'On Track', Notes: '' },
  ],
}
