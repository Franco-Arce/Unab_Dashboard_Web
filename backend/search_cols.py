import asyncio
from database import fetch_all

async def main():
    try:
        tables = await fetch_all("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        
        found = False
        for t in tables:
            tname = t['table_name']
            cols = await fetch_all(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{tname}'")
            col_names = [c['column_name'] for c in cols]
            
            if 'leads_7_dias' in col_names or 'leads_14_dias' in col_names:
                print(f"FOUND IN TABLE: {tname}")
                found = True
                
        if not found:
            print("Did not find columns leads_7_dias or leads_14_dias in ANY public table.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
