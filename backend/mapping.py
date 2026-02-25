import pandas as pd
import os
import re
import unicodedata

class ProgramMapping:
    def __init__(self):
        self.mapping = {}
        self.load_mapping()

    def _normalize(self, text: str) -> str:
        if not text:
            return ""
        # Remove accents
        nfkd_form = unicodedata.normalize('NFKD', str(text))
        text = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
        # Upper case, strip, replace multiple spaces
        text = text.upper().strip()
        text = re.sub(r'\s+', ' ', text)
        return text

    def load_mapping(self):
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        # Look for the Excel file in the project root or backend dir
        paths_to_try = [
            os.path.join(os.path.dirname(backend_dir), "ArchivosUtiles", "mapeo_mapas.xlsx"),
            os.path.join(backend_dir, "ArchivosUtiles", "mapeo_mapas.xlsx"),
            "ArchivosUtiles/mapeo_mapas.xlsx"
        ]
        
        excel_path = None
        for p in paths_to_try:
            if os.path.exists(p):
                excel_path = p
                break
        
        if not excel_path:
            print(f"[Mapping] Excel file not found in any of: {paths_to_try}")
            return

        try:
            df = pd.read_excel(excel_path, header=None)
            # We assume Col 0 is Program Name, Col 2 is Level
            for _, row in df.iterrows():
                if pd.isna(row[0]) or pd.isna(row[2]):
                    continue
                prog = self._normalize(str(row[0]))
                level = str(row[2]).strip().upper()
                if level in ["GRADO", "POSGRADO"]:
                    self.mapping[prog] = level
            
            print(f"[Mapping] Loaded {len(self.mapping)} program mappings.")
        except Exception as e:
            print(f"[Mapping] Error loading Excel: {e}")

    def get_level(self, program_name: str) -> str:
        if not program_name:
            return "OTROS"
        
        clean_name = self._normalize(program_name)
        
        # 1. Exact match
        if clean_name in self.mapping:
            return self.mapping[clean_name]
        
        # 2. Try removing "VIRTUAL" if present
        name_no_virtual = re.sub(r'\s+VIRTUAL$', '', clean_name)
        if name_no_virtual in self.mapping:
            return self.mapping[name_no_virtual]
            
        # 3. Substring match (if any mapped program name is inside the lead's program name)
        # We check the longest matching substrings first to be more specific
        sorted_keys = sorted(self.mapping.keys(), key=len, reverse=True)
        for mapped_prog in sorted_keys:
            if mapped_prog in clean_name:
                return self.mapping[mapped_prog]
        
        # 4. Special rules for patterns
        if "MAESTRIA" in clean_name or "ESPECIALIZACION" in clean_name or "DOCTORADO" in clean_name:
            return "POSGRADO"
        if "TECNOLOGIA" in clean_name or "PROFESIONAL" in clean_name:
            return "GRADO"
            
        return "OTROS"

# Singleton instance
mapping = ProgramMapping()
