import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def main():
    pool = await asyncpg.create_pool(
        host=os.getenv('DB_HOST','77.37.68.210'),
        port=int(os.getenv('DB_PORT', '5432')),
        database=os.getenv('DB_NAME','unab'),
        user=os.getenv('DB_USER','nicoyapur'),
        password=os.getenv('DB_PASSWORD','Yapur2025###')
    )
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'agg_dim_contactos_leads'")
        print("COLUMNS:")
        for r in rows:
            print(f"- {r['column_name']} ({r['data_type']})")
        
        print("\nSAMPLE ROW:")
        sample = await conn.fetchrow("SELECT * FROM agg_dim_contactos_leads LIMIT 1")
        if sample:
            for k, v in dict(sample).items():
                print(f"{k}: {v}")
        else:
            print("No data in table")
            
    await pool.close()

if __name__ == '__main__':
    asyncio.run(main())
