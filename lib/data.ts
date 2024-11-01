/* import db from './db';

console.log("🚀 ~ db:", db)

export async function getLoanDistribution() {
  try {
    const loans = await db.query()
      .from('loan')
      .select('loan_type')
      .count('loan_type as count') 
      .groupBy('loan_type');

    return loans.map(item => ({
      loan_type: item.loan_type,
      count: Number(item.count)
    }));
  } catch (error) {
    console.error('Error fetching loan distribution:', error);
    return [];
  }
}

export async function getTransactionTrends() {
  try {
    const transactions = await db('transaction')
      .select('date', 'amount')
      .orderBy('date', 'asc');

    return transactions;
  } catch (error) {
    console.error('Error fetching transaction trends:', error);
    return [];
  }
}

export async function getLeadsByEcosystem() {
  try {
    const leads = await db('lead')
      .select('ecosystem')
      .count('ecosystem as count')
      .groupBy('ecosystem');

    return leads.map(item => ({
      ecosystem: item.ecosystem,
      count: Number(item.count)
    }));
  } catch (error) {
    console.error('Error fetching leads by ecosystem:', error);
    return [];
  }
}

export async function getLoanAmountVsInterestRate() {
  try {
    const loans = await db('loan')
      .select('amount', 'interest_rate');

    return loans;
  } catch (error) {
    console.error('Error fetching loan amount vs interest rate:', error);
    return [];
  }
}

export async function getMonthlyLoanTotals() {
  try {
    const loans = await db('loan')
      .select('disbursement_date', 'amount')
      .whereNotNull('disbursement_date');

    const monthlyTotals = loans.reduce((acc: Record<string, number>, loan) => {
      const monthYear = new Date(loan.disbursement_date).toISOString().slice(0, 7);
      acc[monthYear] = (acc[monthYear] || 0) + Number(loan.amount);
      return acc;
    }, {});

    return Object.entries(monthlyTotals).map(([date, total]) => ({
      date,
      total
    }));
  } catch (error) {
    console.error('Error fetching monthly loan totals:', error);
    return [];
  }
} 



 */