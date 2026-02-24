import asyncio
from database import fetch_all

async def main():
    rows = await fetch_all("SELECT * FROM fact_unab_sheet2 LIMIT 1")
    if rows:
        print(dict(rows[0]))
    else:
        print("No rows found")

if __name__ == "__main__":
    asyncio.run(main())
