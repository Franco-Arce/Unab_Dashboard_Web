import asyncio
from database import fetch_all

async def main():
    rows = await fetch_all("SELECT column_name FROM information_schema.columns WHERE table_name = 'dim_contactos'")
    if rows:
        print([r['column_name'] for r in rows])
    else:
        print("Table not found")

if __name__ == "__main__":
    asyncio.run(main())
