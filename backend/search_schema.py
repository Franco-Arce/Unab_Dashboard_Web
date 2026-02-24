import asyncio
from database import fetch_all

async def main():
    rows = await fetch_all("SELECT table_name, column_name FROM information_schema.columns WHERE column_name ILIKE '%subcategoria%' OR column_name ILIKE '%no_util%' AND table_schema = 'public'")
    for r in rows:
        print(dict(r))

if __name__ == '__main__':
    asyncio.run(main())
