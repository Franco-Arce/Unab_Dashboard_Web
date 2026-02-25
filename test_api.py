import requests
import json

base_url = "http://localhost:8000/api/dashboard"

# Note: We need a token if require_auth is active. 
# But I can check if the server is running and reachable first.

def test_endpoint(endpoint, nivel=None):
    url = f"{base_url}/{endpoint}"
    params = {}
    if nivel:
        params['nivel'] = nivel
    
    print(f"Testing {url} with params {params}")
    try:
        # We might need to handle auth here if the server requires it.
        # But for debugging, I'll see if I can trigger it.
        # If I can't auth, I'll at least see the 401/403 which means it's reachable.
        res = requests.get(url, params=params)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            if endpoint == 'kpis':
                print(f"Total Leads: {data.get('total_leads')}")
            elif endpoint == 'funnel':
                print(f"Funnel length: {len(data)}")
        else:
            print(f"Error: {res.text[:200]}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_endpoint("kpis")
    test_endpoint("kpis", "GRADO")
    test_endpoint("kpis", "POSGRADO")
