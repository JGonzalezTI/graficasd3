import { NextResponse } from "next/server";
import db from "../../../../lib/db";

const VALID_PERIODS = ["week", "month", "year"] as const;
type Period = (typeof VALID_PERIODS)[number];

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function GET(request: Request) {
  try {
    if (!request.url) {
      throw new ValidationError("URL de solicitud no válida");
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    if (!VALID_PERIODS.includes(period as Period)) {
      throw new ValidationError(
        `Período no válido. Debe ser uno de: ${VALID_PERIODS.join(", ")}`
      );
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
    loan_counts AS (
      SELECT 
        date_trunc($1::text, disbursement_date::timestamp) as period,
        COUNT(*) as loan_count,
        SUM(CAST(amount as DECIMAL)) as total_amount
      FROM loan
      WHERE disbursement_date::timestamp >= (CURRENT_DATE - INTERVAL '1 year')::timestamp
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
      COALESCE(l.loan_count, 0) as count,
      COALESCE(l.total_amount, 0) as amount
    FROM date_series ds
    LEFT JOIN loan_counts l ON ds.time_period = l.period
      ORDER BY ds.time_period;
    `;

    try {
      const { rows } = await db.query(query, [period]);

      return NextResponse.json({
        success: true,
        period,
        data: rows,
      });
    } catch (dbError: any) {
      console.error("Error en la base de datos:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Error al consultar la base de datos",
          details:
            process.env.NODE_ENV === "development"
              ? dbError.message
              : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    console.error("Error no controlado:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

/* {
  "success": true,
  "data": [
    {
      "status": "al_dia",
      "count": 150,
      "percentage": 60.00,
      "avg_days_overdue": 0,
      "color": "rgb(66, 136, 181)"
    },
    {
      "status": "pagado",
      "count": 50,
      "percentage": 20.00,
      "avg_days_overdue": 0,
      "color": "rgb(137, 137, 137)"
    },
    {
      "status": "atrasado",
      "count": 50,
      "percentage": 20.00,
      "avg_days_overdue": 45.5,
      "color": "rgb(209, 60, 75)"
    }
  ]
} */
