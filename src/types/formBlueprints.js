export const formBlueprints = {
    companies: {
        legalName: '', displayName: '', description: '', foundedYear: null,
        website: '', logoUrl: '', employeeCount: null, ceo: '', headquarters: '',
        status: 'ACTIVE', fiscalYearEndMonth: 12
    },
    listings: {
        symbol: '', isin: '', cusip: '', assetType: 'STOCK',
        ipoDate: '', companyId: '', exchangeId: ''
    },
    'income-statements': {
        companyId: '', period: 'ANNUAL', fiscalYear: new Date().getFullYear(), fiscalQuarter: null,
        periodEndDate: '', currency: 'IDR', auditStatus: 'UNAUDITED', revenue: 0, revenueGrowthYoY: null,
        cogs: null, grossProfit: null, operatingExpenses: null, sellingExpenses: null, generalAdminExpenses: null,
        rdExpenses: null, depreciationAmort: null, ebit: null, ebitda: null, operatingIncome: null,
        interestExpense: null, interestIncome: null, otherNonOperatingIncome: null, pretaxIncome: null,
        incomeTaxExpense: null, effectiveTaxRate: null, netIncome: 0, netIncomeAttributable: null,
        minorityInterest: null, eps: null, epsDiluted: null, sharesWeightedAvg: null
    },
    'balance-sheets': {
        companyId: '', period: 'ANNUAL', fiscalYear: new Date().getFullYear(), fiscalQuarter: null,
        periodEndDate: '', currency: 'IDR', auditStatus: 'UNAUDITED', cash: null, shortTermInvestments: null,
        accountsReceivable: null, inventory: null, otherCurrentAssets: null, totalCurrentAssets: null,
        propertyPlantEquipment: null, intangibleAssets: null, goodwill: null, longTermInvestments: null,
        otherNonCurrentAssets: null, totalNonCurrentAssets: null, totalAssets: 0, shortTermDebt: null,
        accountsPayable: null, deferredRevenue: null, otherCurrentLiabilities: null, totalCurrentLiabilities: null,
        longTermDebt: null, deferredTaxLiabilities: null, otherNonCurrentLiabilities: null, totalNonCurrentLiabilities: null,
        totalLiabilities: null, commonStock: null, additionalPaidInCapital: null, retainedEarnings: null,
        treasuryStock: null, otherEquity: null, minorityInterestEquity: null, totalEquity: 0,
        bookValuePerShare: null, netDebt: null, workingCapital: null
    },
    'cash-flows': {
        companyId: '', period: 'ANNUAL', fiscalYear: new Date().getFullYear(), fiscalQuarter: null,
        periodEndDate: '', currency: 'IDR', auditStatus: 'UNAUDITED', netIncomeStart: null, depreciationAmort: null,
        stockBasedCompensation: null, changeInWorkingCapital: null, changeInReceivables: null, changeInInventory: null,
        changeInPayables: null, otherOperatingActivities: null, netCashFromOperations: 0, capitalExpenditures: null,
        acquisitions: null, purchaseOfInvestments: null, saleOfInvestments: null, otherInvestingActivities: null,
        netCashFromInvesting: null, debtIssuance: null, debtRepayment: null, commonStockIssuance: null,
        commonStockRepurchase: null, dividendsPaid: null, otherFinancingActivities: null, netCashFromFinancing: null,
        netChangeInCash: null, cashBeginningPeriod: null, cashEndPeriod: null, freeCashFlow: null
    },
    'stock-prices': {
        companyId: '',
        date: '',
        open: null,
        high: null,
        low: null,
        close: null,
        volume: null,
        value: null
    }
}