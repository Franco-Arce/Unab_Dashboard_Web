import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from database import fetch_all

async def main():
    q = "SELECT column_name FROM information_schema.columns WHERE table_name = 'dim_contactos'"
    cols = await fetch_all(q)
    col_names = [c['column_name'] for c in cols]
    
    # print columns 10 by 10 to avoid truncation
    print("dim_contactos columns:")
    for i in range(0, len(col_names), 10):
        print(col_names[i:i+10])
        
    print("\nCheck if area_academica or conocimiento exists:")
    matches = [c for c in col_names if 'area' in c.lower() or 'conocimiento' in c.lower() or 'facultad' in c.lower()]
    print("Matches:", matches)

asyncio.run(main())
