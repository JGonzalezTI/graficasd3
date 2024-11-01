import { NextResponse } from 'next/server';
import db from "../../../../lib/db";

const VALID_PERIODS = ['week', 'month', 'year'] as const;
type Period = typeof VALID_PERIODS[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    if (!VALID_PERIODS.includes(period as Period)) {
      return NextResponse.json({
        success: false,
        error: `Período no válido. Debe ser uno de: ${VALID_PERIODS.join(', ')}`
      }, { status: 400 });
    }

    const query = `
      WITH date_series AS (
        SELECT generate_series(
          date_trunc($1::text, CURRENT_DATE - INTERVAL '1 year')::timestamp,
          date_trunc($1::text, CURRENT_DATE)::timestamp,
          CASE 
            WHEN $1 = 'week' THEN '1 week'::interval
            WHEN $1 = 'month' THEN '1 month'::interval
            ELSE '1 year'::interval
          END
        ) as time_period
      ),
      lead_counts AS (
        SELECT 
          date_trunc($1::text, created_at::timestamp) as period,
          COUNT(*) as lead_count
        FROM lead
        WHERE created_at::timestamp >= date_trunc($1::text, CURRENT_DATE - INTERVAL '1 year')::timestamp
        GROUP BY 1
      ),
      loan_counts AS (
        SELECT 
          date_trunc($1::text, assignment_date::timestamp) as period,
          COUNT(*) as loan_count
        FROM loan
        WHERE assignment_date::timestamp >= date_trunc($1::text, CURRENT_DATE - INTERVAL '1 year')::timestamp
        GROUP BY 1
      )
      SELECT 
        to_char(ds.time_period, 
          CASE 
            WHEN $1 = 'week' THEN 'YYYY-MM-DD'
            WHEN $1 = 'month' THEN 'YYYY-MM'
            ELSE 'YYYY'
          END
        ) as period,
        COALESCE(l.lead_count, 0) as leads,
        COALESCE(ln.loan_count, 0) as loans
      FROM date_series ds
      LEFT JOIN lead_counts l ON ds.time_period = l.period
      LEFT JOIN loan_counts ln ON ds.time_period = ln.period
      ORDER BY ds.time_period;
    `;

    try {
      const { rows } = await db.query(query, [period]);
      
      return NextResponse.json({
        success: true,
        period,
        data: rows
      });

    } catch (dbError: any) {
      console.error('Error en la base de datos:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Error en la consulta a la base de datos',
        details: process.env.NODE_ENV === 'development' ? dbError : undefined
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al procesar la solicitud',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}