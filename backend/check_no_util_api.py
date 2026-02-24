import asyncio
from cache import cache

async def main():
    await cache.refresh()
    data = await cache.get_all()
    print("TOTAL NO UTIL:", data.get("no_util_total"))
    nu = data.get("no_util", [])
    print("LEN NO UTIL ARRAY:", len(nu))
    if nu:
        print("SAMPLE NO UTIL:", dict(nu[0]))

if __name__ == '__main__':
    asyncio.run(main())
