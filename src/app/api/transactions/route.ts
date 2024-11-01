import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
  try {
    // Consulta para transacciones agrupadas por mes
    const transactionsQuery = `
      SELECT 
        DATE_TRUNC('month', TO_TIMESTAMP(date, 'YYYY-MM-DD')::timestamp) as month,
        SUM(amount) as total_amount
      FROM transaction 
      WHERE 
        status = 'approved' 
        AND TO_TIMESTAMP(date, 'YYYY-MM-DD') >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', TO_TIMESTAMP(date, 'YYYY-MM-DD')::timestamp)
      ORDER BY month ASC
    `;

    // Consulta para préstamos y sus intereses
    const loansQuery = `
      SELECT 
        DATE_TRUNC('month', TO_TIMESTAMP(disbursement_date, 'YYYY-MM-DD')::timestamp) as month,
        SUM(amount) as total_capital,
        SUM(
          CASE 
            WHEN interest_rate_basis = 'monthly' THEN COALESCE(amount * interest_rate, 0)
            WHEN interest_rate_basis = 'yearly' THEN COALESCE(amount * (interest_rate / 12), 0)
            ELSE 0
          END
        ) as total_interest
      FROM loan
      WHERE 
        status = 'active'
        AND disbursement_date IS NOT NULL
        AND TO_TIMESTAMP(disbursement_date, 'YYYY-MM-DD') >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', TO_TIMESTAMP(disbursement_date, 'YYYY-MM-DD')::timestamp)
      ORDER BY month ASC
    `;

    const transactions = await db.query(transactionsQuery);
    const loans = await db.query(loansQuery);

    // Combinar los resultados en el formato requerido
    const financialData = {
      transactions: transactions.rows,
      loans: loans.rows
    };

    return NextResponse.json(financialData);
  } catch (error) {
    console.error('Error en la consulta:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos financieros', details: error }, 
      { status: 500 }
    );
  }
} 