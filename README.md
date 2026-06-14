# Finance Life Planning

A personal finance and life tracking app that runs as both an **Electron desktop app** and a **web app** (Azure Static Web Apps). Uses a single Excel file as the database — local file on desktop, Azure Blob Storage on the web.

## Features

### Finance
- **Dashboard** — net worth summary, net worth over time chart, asset allocation breakdown, upcoming CD maturities
- **Budget** — income and expense tracking by category and frequency
- **Allocation** — target vs. actual asset class breakdown
- **Projection** — compound growth projections for multiple assets/income sources

### Accounts
- **Accounts** — bank accounts, investment accounts, retirement accounts, HSA, bonds, etc. with value history
- **CDs** — certificate of deposit tracker with maturity calendar and APY averages
- **Crypto** — cryptocurrency holdings with staking, APY, and unlock dates
- **Retirement** — retirement holdings, fund allocation, and withdrawal schedule
- **Donations** — charitable giving log by year and organization
- **Debts** — mortgage, auto, student loans, credit cards with collateral values, equity calculation, and credit card rewards/points tracker

### Assets
- **Tangible Assets** — physical collection tracker (books, vinyl, art, etc.) with cost and current value, grouped by category
- **Digital Assets** — digital collection tracker (ebooks, digital games, etc.), same structure as tangible

### Life
- **Goals** — financial goals, lifetime goals, and education/certification roadmap
- **Achievements** — awards and personal milestones
- **Tasks** — to-do list with priority and due dates
- **Research** — saved links and reference material by category
- **Media** — reading log, gaming log, and film log with ratings and search
- **Wishlist** — cross-category want list (books, films, games, vinyl, art, etc.) with priority and target price; marking an item Purchased automatically adds it to the matching collection

### Personal
- **Contacts** — address book with relationships and birthdays
- **Personal Info** — profile and contact details

### App-wide
- **Demo Mode** — toggle in the sidebar to instantly swap to built-in sample data for sharing screenshots or demos without exposing real data; real data is restored when toggled off

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron |
| Web host | Azure Static Web Apps |
| API | Azure Functions v4 (Node.js) |
| UI | React + Vite |
| Data storage (web) | Azure Blob Storage (single `.xlsx` file) |
| Data storage (desktop) | Local `.xlsx` file |
| Excel read/write | ExcelJS |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Auth (web) | GitHub OAuth via Azure Static Web Apps |

---

## Getting Started

### Prerequisites

- Node.js v18+
- For the web backend: an Azure Storage account and Azure Static Web Apps deployment

### Install

```bash
npm install
```

### Run (desktop/Electron)

```bash
npm run dev
```

Opens the Vite dev server and the Electron window. On first launch, click **New Excel File** in the sidebar to create a blank data file, or **Connect Excel File** to point to an existing one.

### Run (web, local)

```bash
# Terminal 1 — Vite dev server
npm run dev:web

# Terminal 2 — Azure Functions local runtime
cd api && npm install && func start
```

Requires `api/local.settings.json` with your Azure Storage connection string (gitignored, never commit).

### Build desktop app

```bash
npm run build:app
```

### Deploy web app

Push to `main` — GitHub Actions deploys automatically to Azure Static Web Apps.

---

## Project Structure

```
├── api/
│   ├── functions.js          # Azure Functions v4 endpoints
│   ├── shared/
│   │   └── excel.js          # Blob Storage access, ExcelJS helpers, SHEET_COLUMNS
│   └── local.settings.json   # Local secrets — gitignored, never commit
├── electron/
│   ├── main.js               # Main process: window, IPC handlers, SHEET_COLUMNS
│   └── preload.js            # Exposes window.electronAPI to renderer
├── src/
│   ├── App.jsx               # App shell: routing, data loading, save/delete handlers
│   ├── api.js                # Dual-mode API: IPC (Electron) or fetch (web)
│   ├── index.css             # Tailwind + shared component classes
│   ├── components/
│   │   ├── Chevron.jsx       # Reusable collapse chevron
│   │   ├── EntityForm.jsx    # Generic CRUD modal form driven by schema
│   │   ├── Modal.jsx         # Modal wrapper
│   │   ├── Pagination.jsx    # Page controls for large lists
│   │   ├── Sidebar.jsx       # Navigation, file controls, demo mode toggle
│   │   ├── SortableHeader.jsx
│   │   ├── StatCard.jsx      # Reusable stat summary card
│   │   ├── AssetBreakdown.jsx
│   │   ├── CDMaturities.jsx
│   │   └── NetWorthChart.jsx
│   ├── data/
│   │   ├── mock.js           # Built-in sample data (used in demo mode + dev fallback)
│   │   └── schemas.js        # Field schemas that drive all CRUD modals
│   ├── hooks/
│   │   ├── useEntityModal.js
│   │   ├── usePagination.js
│   │   └── useSortableTable.js
│   └── pages/
│       ├── Dashboard.jsx
│       ├── AllocationPage.jsx
│       ├── BudgetPage.jsx
│       ├── CDsPage.jsx
│       ├── ContactsPage.jsx
│       ├── CryptoPage.jsx
│       ├── DebtsPage.jsx
│       ├── DigitalAssetsPage.jsx
│       ├── DonationsPage.jsx
│       ├── GoalsPage.jsx
│       ├── AchievementsPage.jsx
│       ├── MediaPage.jsx
│       ├── NonTangibleAssetsPage.jsx
│       ├── PersonalInfoPage.jsx
│       ├── ProjectionPage.jsx
│       ├── ResearchPage.jsx
│       ├── RetirementPage.jsx
│       ├── TangibleAssetsPage.jsx
│       ├── TasksPage.jsx
│       └── WishlistPage.jsx
├── staticwebapp.config.json  # SWA routing + GitHub OAuth role gates
└── index.html
```

---

## Data Model

All data lives in a single `.xlsx` file — one sheet per entity. Both `electron/main.js` and `api/shared/excel.js` define the same `SHEET_COLUMNS` map; any new sheet must be added to both.

| Sheet | Key Columns |
|---|---|
| `NonTangibleAssets` | ID, Name, Type, Subtype, Currency, Institution, RetirementAccount |
| `AssetHistory` | ID, AssetID, Date, Value |
| `CDs` | ID, Name, FaceValue, APY, StartDate, MaturityDate, AutoRenew, Active |
| `TangibleAssets` | ID, Category, Name, Author, Cost, CurrentValue, StillHave |
| `DigitalAssets` | ID, Category, Name, Author, Cost, CurrentValue, StillHave |
| `CryptoAssets` | ID, Name, Ticker, Wallet, Staked, StakingAPY, UnlockDate |
| `Budget` | ID, Name, Type, Category, Amount, Frequency, Active |
| `Donations` | ID, Year, Organization, Amount, Date |
| `FinancialGoals` | ID, Name, TargetAmount, TargetDate, Status |
| `RetirementSchedule` | ID, Source, AssetID, AccessibleYear, WithdrawalRate, ExpectedYearlyAmount |
| `RetirementHoldings` | ID, AssetID, FundName, Ticker, Percentage |
| `FundAllocation` | ID, HoldingID, AssetClass, Percentage |
| `AssetGoals` | ID, AssetClass, Subclass, GoalPct |
| `Tasks` | ID, Name, Priority, DueDate |
| `ResearchLinks` | ID, Title, Category, Link |
| `LifetimeGoals` | ID, Goal, Category, Status, Progress |
| `EducationGoals` | ID, Order, Name, Type, Difficulty, TargetDate, Done |
| `ReadingLog` | ID, Name, Author, ReadDate, Genre, Format, Rating |
| `GamingLog` | ID, Name, Platform, Status, CompletionDate, Genre, Rating |
| `FilmLog` | ID, Name, ReleaseYear, WatchDate, Rating, LetterboxdURI |
| `PersonalInfo` | ID, Name, Nickname, DateOfBirth |
| `PersonalContacts` | ID, Type, Label, Value, Primary |
| `Awards` | ID, Title, Category, Issuer, AwardDate |
| `Milestones` | ID, Title, Category, Date |
| `Contacts` | ID, Name, Relationship, Phone, Email, Birthday, Favorite |
| `ProjectionSettings` | ID, Label, StartValue, GrowthRate, AnnualAdd |
| `Liabilities` | ID, Name, Type, Lender, Balance, InterestRate, MinPayment, AssetValue, Active |
| `CreditCardRewards` | ID, CardName, RewardProgram, Points, CentsPerPoint, ExpirationDate |
| `Wishlist` | ID, Name, Category, Creator, Priority, TargetPrice, Status, AddedDate |

---

## API Endpoints (web mode)

All endpoints are protected by GitHub OAuth via `staticwebapp.config.json` — only users with the `contributor` role can access them.

| Route | Method | Description |
|---|---|---|
| `/api/load-excel` | GET | Load and parse the entire workbook from Blob Storage |
| `/api/save-row` | POST | Insert or update a single row in a named sheet |
| `/api/delete-row` | POST | Delete a row by sheet name and row index |
| `/api/download-excel` | GET | Download the raw `.xlsx` file |
| `/api/upload-excel` | POST | Replace the workbook (validates before overwriting) |
| `/api/ping` | GET | Health check |

---

## Security Notes

- The web app requires GitHub login with the `contributor` role — anonymous access returns a 302 to GitHub OAuth
- `api/local.settings.json` is gitignored and must never be committed; it contains the Azure Storage connection string
- API error responses return generic messages only; full errors are logged server-side via `context.error()`

---

## Credits

Icon from [icons8.com](https://icons8.com/icons/set/cash-home)
