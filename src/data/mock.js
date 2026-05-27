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
    { ID: 1, Source: null,             AssetID: 3,    AccessibleYear: 2050, WithdrawalRate: 4.0, ExpectedYearlyAmount: null,  Notes: 'Target retirement age 65' },
    { ID: 2, Source: 'Social Security', AssetID: null, AccessibleYear: 2055, WithdrawalRate: null, ExpectedYearlyAmount: 24000, Notes: 'Estimated benefit at 70' },
    { ID: 3, Source: 'Pension',         AssetID: null, AccessibleYear: 2052, WithdrawalRate: null, ExpectedYearlyAmount: 12000, Notes: 'Estimated' },
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
    { ID: 1,  AssetClass: 'Cash',  Subclass: null,                  GoalPct: 10 },
    { ID: 2,  AssetClass: 'Cash',  Subclass: 'USD',                 GoalPct: 100 },
    { ID: 3,  AssetClass: 'Bonds/CDs/Treasuries', Subclass: null,                   GoalPct: 20 },
    { ID: 4,  AssetClass: 'Bonds/CDs/Treasuries', Subclass: 'Certificate Deposit',  GoalPct: 40 },
    { ID: 5,  AssetClass: 'Bonds/CDs/Treasuries', Subclass: 'Bonds',                GoalPct: 40 },
    { ID: 14, AssetClass: 'Bonds/CDs/Treasuries', Subclass: 'Treasuries',           GoalPct: 20 },
    { ID: 6,  AssetClass: 'Stock', Subclass: null,                  GoalPct: 65 },
    { ID: 7,  AssetClass: 'Stock',    Subclass: 'US Stocks',            GoalPct: 60 },
    { ID: 8,  AssetClass: 'Stock',    Subclass: 'International Stocks', GoalPct: 30 },
    { ID: 9,  AssetClass: 'Stock',    Subclass: 'Taxable',              GoalPct: 10 },
    { ID: 10, AssetClass: 'Other',    Subclass: null,                   GoalPct: 5 },
    { ID: 11, AssetClass: 'Other',    Subclass: 'BTC',                  GoalPct: 60 },
    { ID: 12, AssetClass: 'Other',    Subclass: 'Sports Cards',         GoalPct: 25 },
    { ID: 13, AssetClass: 'Other',    Subclass: 'Coins',                GoalPct: 15 },
  ],

  ReadingLog: [
    { ID: 1,  Name: 'Sapiens',                          Author: 'Yuval Noah Harari',   ReadDate: '2022-06-10', Genre: 'Nonfiction',  Format: 'Physical',  Rating: 5,   Notes: '' },
    { ID: 2,  Name: '1984',                             Author: 'George Orwell',       ReadDate: '2021-02-20', Genre: 'Classic',     Format: 'Ebook',     Rating: 5,   Notes: '' },
    { ID: 3,  Name: 'Dune',                             Author: 'Frank Herbert',       ReadDate: '2023-08-20', Genre: 'Sci-Fi',      Format: 'Physical',  Rating: 5,   Notes: '' },
    { ID: 4,  Name: 'The Road',                         Author: 'Cormac McCarthy',     ReadDate: '2022-11-15', Genre: 'Fiction',     Format: 'Audiobook', Rating: 5,   Notes: '' },
    { ID: 5,  Name: 'The Pragmatic Programmer',         Author: 'Andrew Hunt',         ReadDate: '2023-01-15', Genre: 'Technology',  Format: 'Physical',  Rating: 5,   Notes: '' },
    { ID: 6,  Name: 'Atomic Habits',                    Author: 'James Clear',         ReadDate: '2022-03-05', Genre: 'Self-Help',   Format: 'Ebook',     Rating: 4,   Notes: '' },
    { ID: 7,  Name: 'Clean Code',                       Author: 'Robert C. Martin',   ReadDate: '2023-11-01', Genre: 'Technology',  Format: 'Physical',  Rating: 4,   Notes: '' },
    { ID: 8,  Name: 'Neuromancer',                      Author: 'William Gibson',      ReadDate: '2024-01-08', Genre: 'Sci-Fi',      Format: 'Physical',  Rating: 4,   Notes: '' },
    { ID: 9,  Name: 'The Great Gatsby',                 Author: 'F. Scott Fitzgerald', ReadDate: '2021-09-12', Genre: 'Classic',     Format: 'Physical',  Rating: 3,   Notes: '' },
    { ID: 10, Name: 'Design Patterns',                  Author: 'Erich Gamma et al.', ReadDate: '2024-03-20', Genre: 'Technology',  Format: 'Physical',  Rating: 4,   Notes: '' },
    { ID: 11, Name: 'Shogun',                           Author: 'James Clavell',       ReadDate: '2024-06-05', Genre: 'Historical',  Format: 'Physical',  Rating: 5,   Notes: '' },
    { ID: 12, Name: 'A Fire Upon the Deep',             Author: 'Vernor Vinge',        ReadDate: '2024-09-14', Genre: 'Sci-Fi',      Format: 'Ebook',     Rating: 4.5, Notes: '' },
  ],

  GamingLog: [
    { ID: 1,  Name: "The Legend of Zelda: Breath of the Wild", Platform: 'Switch', Status: 'Completed', CompletionDate: '2022-04-10', Genre: 'Action',     Rating: 5,   Notes: '' },
    { ID: 2,  Name: 'Elden Ring',                              Platform: 'PC',     Status: 'Completed', CompletionDate: '2023-02-28', Genre: 'RPG',        Rating: 5,   Notes: '' },
    { ID: 3,  Name: 'Disco Elysium',                           Platform: 'PC',     Status: 'Completed', CompletionDate: '2022-10-15', Genre: 'RPG',        Rating: 5,   Notes: '' },
    { ID: 4,  Name: "God of War (2018)",                       Platform: 'PS4',    Status: 'Completed', CompletionDate: '2023-05-20', Genre: 'Action',     Rating: 5,   Notes: '' },
    { ID: 5,  Name: 'Hollow Knight',                           Platform: 'PC',     Status: 'Completed', CompletionDate: '2023-08-05', Genre: 'Platformer', Rating: 5,   Notes: '' },
    { ID: 6,  Name: "Baldur's Gate 3",                         Platform: 'PC',     Status: 'Completed', CompletionDate: '2024-01-10', Genre: 'RPG',        Rating: 5,   Notes: '' },
    { ID: 7,  Name: 'Hades',                                   Platform: 'PC',     Status: 'Completed', CompletionDate: '2022-07-22', Genre: 'Roguelite',  Rating: 4.5, Notes: '' },
    { ID: 8,  Name: 'Return of the Obra Dinn',                 Platform: 'PC',     Status: 'Completed', CompletionDate: '2023-12-15', Genre: 'Puzzle',     Rating: 5,   Notes: '' },
    { ID: 9,  Name: 'Dave the Diver',                          Platform: 'PC',     Status: 'Completed', CompletionDate: '2024-03-01', Genre: 'Adventure',  Rating: 4,   Notes: '' },
    { ID: 10, Name: 'Final Fantasy XIV',                       Platform: 'PC',     Status: 'Playing',   CompletionDate: null,         Genre: 'MMO',        Rating: 4,   Notes: '' },
    { ID: 11, Name: 'Cyberpunk 2077',                          Platform: 'PC',     Status: 'Completed', CompletionDate: '2024-05-18', Genre: 'RPG',        Rating: 4,   Notes: 'Phantom Liberty included' },
    { ID: 12, Name: 'Factorio',                                Platform: 'PC',     Status: 'Playing',   CompletionDate: null,         Genre: 'Strategy',   Rating: 5,   Notes: '' },
  ],

  FilmLog: [
    { ID: 1,  Name: 'Blade Runner 2049',                    ReleaseYear: 2017, WatchDate: '2023-05-10', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/blade-runner-2049/', Notes: '' },
    { ID: 2,  Name: 'Inception',                            ReleaseYear: 2010, WatchDate: '2022-12-01', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/inception/', Notes: '' },
    { ID: 3,  Name: 'The Grand Budapest Hotel',             ReleaseYear: 2014, WatchDate: '2023-02-14', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/the-grand-budapest-hotel/', Notes: '' },
    { ID: 4,  Name: 'Everything Everywhere All at Once',    ReleaseYear: 2022, WatchDate: '2023-01-20', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/everything-everywhere-all-at-once/', Notes: '' },
    { ID: 5,  Name: 'Perfect Blue',                         ReleaseYear: 1997, WatchDate: '2022-08-05', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/perfect-blue/', Notes: '' },
    { ID: 6,  Name: 'Spirited Away',                        ReleaseYear: 2001, WatchDate: '2023-07-12', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/spirited-away/', Notes: '' },
    { ID: 7,  Name: 'The Lighthouse',                       ReleaseYear: 2019, WatchDate: '2024-02-18', Rating: 4,   LetterboxdURI: 'https://letterboxd.com/film/the-lighthouse-2019/', Notes: '' },
    { ID: 8,  Name: 'Annihilation',                         ReleaseYear: 2018, WatchDate: '2023-09-30', Rating: 4,   LetterboxdURI: 'https://letterboxd.com/film/annihilation/', Notes: '' },
    { ID: 9,  Name: 'Midsommar',                            ReleaseYear: 2019, WatchDate: '2023-10-22', Rating: 4,   LetterboxdURI: 'https://letterboxd.com/film/midsommar/', Notes: '' },
    { ID: 10, Name: 'Portrait of a Lady on Fire',           ReleaseYear: 2019, WatchDate: '2024-01-05', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/portrait-of-a-lady-on-fire/', Notes: '' },
    { ID: 11, Name: '2001: A Space Odyssey',                ReleaseYear: 1968, WatchDate: '2022-04-22', Rating: 5,   LetterboxdURI: 'https://letterboxd.com/film/2001-a-space-odyssey/', Notes: '' },
    { ID: 12, Name: 'Drive',                                ReleaseYear: 2011, WatchDate: '2023-06-30', Rating: 4.5, LetterboxdURI: 'https://letterboxd.com/film/drive-2011/', Notes: '' },
  ],

  LifetimeGoals: [
    { ID: 1,  Goal: 'Career in military/law enforcement',          Category: 'Career',        Status: 'Done',        Progress: null,      Notes: '' },
    { ID: 2,  Goal: 'Career in tech',                              Category: 'Career',        Status: 'Done',        Progress: null,      Notes: '' },
    { ID: 3,  Goal: 'Military Veteran',                            Category: 'Personal',      Status: 'Done',        Progress: null,      Notes: '' },
    { ID: 4,  Goal: 'BS in Computer Science',                      Category: 'Education',     Status: 'Done',        Progress: null,      Notes: '' },
    { ID: 5,  Goal: 'MA in Global Affairs',                        Category: 'Education',     Status: 'Done',        Progress: null,      Notes: '' },
    { ID: 6,  Goal: 'Live in Tokyo',                               Category: 'Life',          Status: 'Done',        Progress: null,      Notes: '' },
    { ID: 7,  Goal: 'Live in SoCal',                               Category: 'Life',          Status: 'Done',        Progress: null,      Notes: '' },
    { ID: 8,  Goal: 'Japanese JLPT N1',                            Category: 'Education',     Status: 'In Progress', Progress: null,      Notes: '' },
    { ID: 9,  Goal: 'Find romance',                                Category: 'Personal',      Status: 'In Progress', Progress: null,      Notes: '' },
    { ID: 10, Goal: 'Live to 90',                                  Category: 'Health',        Status: 'In Progress', Progress: '41/90',   Notes: '' },
    { ID: 11, Goal: 'Travel to 7 continents',                      Category: 'Travel',        Status: 'In Progress', Progress: '3/7',     Notes: '' },
    { ID: 12, Goal: 'Travel to 30 countries',                      Category: 'Travel',        Status: 'In Progress', Progress: '9/30',    Notes: '' },
    { ID: 13, Goal: 'Read 500 books',                              Category: 'Personal',      Status: 'In Progress', Progress: '83/500',  Notes: '' },
    { ID: 14, Goal: 'Watch 1000 movies',                           Category: 'Entertainment', Status: 'In Progress', Progress: '814/1000',Notes: '' },
    { ID: 15, Goal: 'Complete 400 games',                          Category: 'Entertainment', Status: 'In Progress', Progress: '228/400', Notes: '' },
    { ID: 16, Goal: 'French B2 (start at 55)',                     Category: 'Education',     Status: 'Planned',     Progress: null,      Notes: '' },
    { ID: 17, Goal: 'Release 5 full games',                        Category: 'Creative',      Status: 'Not Started', Progress: '0/5',     Notes: '' },
    { ID: 18, Goal: 'Get photos published in 5 magazines',         Category: 'Creative',      Status: 'Not Started', Progress: '0/5',     Notes: '' },
    { ID: 19, Goal: 'Live in a home with no shared walls + movie room', Category: 'Life',    Status: 'Planned',     Progress: null,      Notes: '' },
  ],

  EducationGoals: [
    { ID: 1,  Order: 1,  Name: 'BS Information Technology',           Type: 'Technology', Difficulty: 'Beginner',     Renewal: 'No',    TargetDate: '2012',   Done: true,  Notes: '' },
    { ID: 2,  Order: 2,  Name: 'JLPT N3',                             Type: 'Japanese',   Difficulty: 'Beginner',     Renewal: 'No',    TargetDate: '2012',   Done: true,  Notes: '' },
    { ID: 3,  Order: 3,  Name: 'MS Global Affairs',                   Type: 'Humanities', Difficulty: 'Intermediate', Renewal: 'No',    TargetDate: '2014',   Done: true,  Notes: '' },
    { ID: 4,  Order: 4,  Name: 'Business Administration Cert',        Type: 'Business',   Difficulty: 'Beginner',     Renewal: 'No',    TargetDate: '2019',   Done: true,  Notes: '' },
    { ID: 5,  Order: 5,  Name: 'JLPT N2',                             Type: 'Japanese',   Difficulty: 'Intermediate', Renewal: 'No',    TargetDate: '2022',   Done: true,  Notes: '' },
    { ID: 6,  Order: 6,  Name: 'BS Computer Science',                 Type: 'Technology', Difficulty: 'Intermediate', Renewal: 'No',    TargetDate: '2025',   Done: true,  Notes: '' },
    { ID: 7,  Order: 7,  Name: 'AZ-900',                              Type: 'Microsoft',  Difficulty: 'Beginner',     Renewal: 'No',    TargetDate: 'Oct-25', Done: true,  Notes: '' },
    { ID: 8,  Order: 8,  Name: 'AI-900',                              Type: 'Microsoft',  Difficulty: 'Beginner',     Renewal: 'No',    TargetDate: 'Nov-25', Done: true,  Notes: '' },
    { ID: 9,  Order: 9,  Name: 'JLPT N1',                             Type: 'Japanese',   Difficulty: 'Advanced',     Renewal: 'No',    TargetDate: 'Jul-26', Done: false, Notes: '' },
    { ID: 10, Order: 10, Name: 'AZ-104 (Azure Admin Assoc)',          Type: 'Microsoft',  Difficulty: 'Intermediate', Renewal: '1 year',TargetDate: 'Apr-27', Done: false, Notes: '' },
    { ID: 11, Order: 11, Name: 'AZ-400 (Azure DevOps Engineer)',      Type: 'Microsoft',  Difficulty: 'Advanced',     Renewal: '1 year',TargetDate: 'Sep-27', Done: false, Notes: '' },
    { ID: 12, Order: 12, Name: 'AZ-305 (Azure Solutions Architect)',  Type: 'Microsoft',  Difficulty: 'Advanced',     Renewal: '1 year',TargetDate: 'Apr-28', Done: false, Notes: '' },
    { ID: 13, Order: 13, Name: 'AZ-500 (Azure Security Engineer)',    Type: 'Microsoft',  Difficulty: 'Advanced',     Renewal: '1 year',TargetDate: 'Sep-28', Done: false, Notes: '' },
  ],

  FinancialGoals: [
    { ID: null, Name: '2021 Financial Goal',  TargetAmount:  250000, TargetDate: '2021-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'Goal Met', Notes: '' },
    { ID: null, Name: '2026 Financial Goal',  TargetAmount:  500000, TargetDate: '2026-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'Goal Met', Notes: '' },
    { ID: null, Name: '2031 Financial Goals', TargetAmount:  750000, TargetDate: '2031-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'On Track', Notes: '' },
    { ID: null, Name: '2043 Financial Goals', TargetAmount: 1200000, TargetDate: '2043-12-31T00:00:00.000Z', LinkedAssetID: null, Status: 'On Track', Notes: '' },
  ],
}
