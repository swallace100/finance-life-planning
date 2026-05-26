# Finance Life Planning

A personal finance desktop app for tracking assets, net worth, CDs, tangible assets, and financial goals. Built with Electron + React, using an Excel file as the database.

## Tech Stack

- **Electron** — desktop shell, file system access, IPC
- **React + Vite** — UI renderer
- **ExcelJS** — reads/writes the Excel data file
- **Recharts** — charts and visualizations
- **Tailwind CSS** — styling

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+

### Install & Run

```bash
npm install
npm run dev
```

On first launch, click **Connect Excel File** in the header to point the app at your `Data/Data.xlsx` file. The path is saved automatically for future launches.

### Build for Production

```bash
npm run build
```

## Excel Data File

The app reads from a single `.xlsx` file with one sheet per entity:

| Sheet | Key Columns |
|---|---|
| `NonTangibleAssets` | ID, Name, Type, Subtype, Currency, Institution, RetirementAccount |
| `AssetHistory` | ID, AssetID, Month, Year, Value |
| `CDs` | ID, Name, FaceValue, APY, StartDate, MaturityDate, AutoRenew, Active |
| `TangibleAssets` | ID, Category, Name, Cost, CurrentValue |
| `Budget` | ID, Name, Type, Category, Amount, Frequency, Active |
| `Donations` | ID, Year, Organization, Amount, Date |
| `FinancialGoals` | ID, Name, TargetAmount, TargetDate, LinkedAssetID |
| `RetirementSchedule` | ID, AssetID, AccessibleYear, ExpectedMonthlyAmount |
| `RetirementHoldings` | ID, AssetID, FundName, Ticker, Percentage |
| `FundAllocation` | ID, HoldingID, AssetClass, Percentage |
| `CryptoAssets` | ID, Name, Ticker, Platform, Staked, StakingAPY |

## Project Structure

```
├── electron/
│   ├── main.js        # Main process: window, IPC handlers, ExcelJS loading
│   └── preload.js     # Exposes window.electronAPI to the renderer
├── src/
│   ├── App.jsx        # App shell: Excel loading, mock data fallback
│   ├── data/mock.js   # Sample data for UI development
│   ├── pages/
│   │   └── Dashboard.jsx
│   └── components/
│       ├── NetWorthCard.jsx
│       ├── NetWorthChart.jsx
│       ├── AssetBreakdown.jsx
│       └── CDMaturities.jsx
├── index.html
└── Data/              # Excel data file (git-ignored)
```

## Dashboard

The dashboard displays:

- **Total net worth** — latest `AssetHistory` value per asset + active CD face values + tangible asset current values
- **Net worth over time** — line chart aggregated by month from `AssetHistory`
- **Asset breakdown** — donut chart by type (Bank, Investment, Retirement, Crypto, CD, Tangible)
- **Upcoming CD maturities** — CDs maturing within the next 12 months, sorted by date
