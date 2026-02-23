import asyncio
from database import fetch_all

async def main():
    tables = await fetch_all("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name ILIKE '%unab%' OR table_name ILIKE '%contactos%');")
    print("MATCHING TABLES:")
    for t in tables:
        print(f"- {t['table_name']}")

if __name__ == "__main__":
    asyncio.run(main())
