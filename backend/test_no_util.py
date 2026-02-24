import asyncio
from cache import cache

async def main():
    await cache.refresh()
    print("No Util length:", len(cache.data.get('no_util', [])))
    if cache.data.get('no_util'):
        print("Sample:", cache.data.get('no_util')[0])
    else:
        print("Still empty!")

if __name__ == "__main__":
    asyncio.run(main())
