import pandas as pd
import sys
import os

try:
    df = pd.read_excel('backend/ArchivosUtiles/mapeo_mapas.xlsx', header=None)
    for i in range(5):
        row = df.iloc[i]
        print(f"Row {i}: Col0='{row[0]}', Col1='{row[1]}', Col2='{row[2]}'")
    
    unique_col1 = df[1].unique()
    print("\nUnique values in Col1:", unique_col1)
except Exception as e:
    print(e)
