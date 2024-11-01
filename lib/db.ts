
import { Pool } from 'pg';
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
// Consulta de ejemplo para mostrar algunos datos
pool.query('SELECT * FROM loan LIMIT 1')
  .then(result => {
    /* console.log('📊 Muestra de préstamos en la base de datos:');
  
    console.log('JSON format:', JSON.stringify(result.rows, null, 2)); */
  })
  .catch(err => console.error('❌ Error al consultar préstamos:', err));

// Verificar conexión
pool.query('SELECT 1')
  .then(() => console.log('✅ Conexión a PostgreSQL establecida con éxito'))
  .catch(err => console.error('❌ Error conectando a PostgreSQL:', err))

export default pool 