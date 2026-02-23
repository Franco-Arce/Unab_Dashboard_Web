import asyncio
from cache import cache

async def main():
    await cache.refresh()
    print("Refresh OK")
    print(f"Total Leads: {cache.data.get('total_leads')}")
    print(f"Merged Programs count: {len(cache.data.get('merged_programs', []))}")
    if cache.data.get('merged_programs'):
        print(f"Sample: {cache.data.get('merged_programs')[0]}")

if __name__ == "__main__":
    asyncio.run(main())
