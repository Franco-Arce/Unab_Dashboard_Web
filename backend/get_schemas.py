import asyncio
from database import fetch_all

async def get_schema(table_name):
    query = """
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
    """
    rows = await fetch_all(query, table_name)
    print(f"--- Schema for {table_name} ---")
    for r in rows:
        print(f"{r['column_name']}: {r['data_type']}")
    print()

async def main():
    await get_schema('fact_unab_sheet2')
    await get_schema('agg_dim_contactos_leads')

if __name__ == "__main__":
    asyncio.run(main())
