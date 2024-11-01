import { NextResponse } from 'next/server';
import db from "../../../../lib/db";

export async function GET() {
  try {
    const query = `
      SELECT 
        CASE 
          WHEN status = 'arrear' THEN 'Atrasados'
          WHEN status = 'active' THEN 'Al día'
          WHEN status = 'paid' THEN 'Pagado'
          ELSE status
        END as label,
        COUNT(*) as count,
        SUM(amount) as value
      FROM loan
      WHERE status IN ('arrear', 'active', 'paid')
      GROUP BY status
      ORDER BY value DESC;
    `;

    const { rows } = await db.query(query);
    
    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de préstamos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener estadísticas de préstamos',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
