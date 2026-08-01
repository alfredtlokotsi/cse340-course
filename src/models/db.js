import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

let db = null;

if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('Executed query:', { 
                    text: text.replace(/\s+/g, ' ').trim(), 
                    duration: `${duration}ms`, 
                    rows: res.rowCount 
                });
                return res;
            } catch (error) {
                console.error('Error in query:', { 
                    text: text.replace(/\s+/g, ' ').trim(), 
                    error: error.message 
                });
                throw error;
            }
        },
        async close() {
            await pool.end();
        }
    };
} else {
    db = pool;
    db.close = async () => {
        await pool.end();
    };
}

const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time, current_database() as database_name, version() as version');
        console.log('✅ Database connection successful!');
        console.log(`📊 Database: ${result.rows[0].database_name}`);
        console.log(`🕐 Current time: ${result.rows[0].current_time}`);
        console.log(`📦 PostgreSQL version: ${result.rows[0].version}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

export { db as default, testConnection };