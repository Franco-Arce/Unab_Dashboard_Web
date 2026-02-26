import asyncio
from cache import cache

async def main():
    await cache.refresh()
    data = await cache.get_all()
    ps = data.get("merged_programs", [])
    levels = set(p.get("nivel") for p in ps)
    print("Levels found:", levels)
    print("Leads by level:")
    for l in levels:
        ls = sum(p.get("leads", 0) for p in ps if p.get("nivel") == l)
        print(f"  {l}: {ls}")

if __name__ == "__main__":
    asyncio.run(main())
