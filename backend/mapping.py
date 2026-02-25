import pandas as pd
import os
import re
import unicodedata

class ProgramMapping:
    def __init__(self):
        self.mapping = {}
        self.area_mapping = {}
        self.load_mapping()

    def _normalize(self, text: str) -> str:
        if not text:
            return ""
        # Remove accents
        import unicodedata
        nfkd_form = unicodedata.normalize('NFKD', str(text))
        text = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
        # Upper case, strip, replace multiple spaces
        text = text.upper().strip()
        import re
        text = re.sub(r'\s+', ' ', text)
        return text

    def load_mapping(self):
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        paths_to_try = [
        os.path.join(backend_dir, "ArchivosUtiles", "mapeo_mapas.xlsx"),
        os.path.join(os.path.dirname(backend_dir), "ArchivosUtiles", "mapeo_mapas.xlsx"),
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
            for _, row in df.iterrows():
                if pd.isna(row[0]) or pd.isna(row[2]):
                    continue
                prog = self._normalize(str(row[0]))
                
                # Extract area from Col 1
                if pd.notna(row[1]):
                    self.area_mapping[prog] = str(row[1]).strip().upper()
                else:
                    self.area_mapping[prog] = "OTROS"
                    
                level = str(row[2]).strip().upper()
                if level in ["GRADO", "POSGRADO"]:
                    self.mapping[prog] = level
            
            print(f"[Mapping] Loaded {len(self.mapping)} program mappings and {len(self.area_mapping)} areas.")
        except Exception as e:
            print(f"[Mapping] Error loading Excel: {e}")

    def get_level(self, program_name: str) -> str:
        if not program_name:
            return "OTROS"
        
        import re
        clean_name = self._normalize(program_name)
        
        if clean_name in self.mapping:
            return self.mapping[clean_name]
        
        name_no_virtual = re.sub(r'\s+VIRTUAL$', '', clean_name)
        if name_no_virtual in self.mapping:
            return self.mapping[name_no_virtual]
            
        sorted_keys = sorted(self.mapping.keys(), key=len, reverse=True)
        for mapped_prog in sorted_keys:
            if mapped_prog in clean_name:
                return self.mapping[mapped_prog]
        
        if "MAESTRIA" in clean_name or "ESPECIALIZACION" in clean_name or "DOCTORADO" in clean_name:
            return "POSGRADO"
        if "TECNOLOGIA" in clean_name or "PROFESIONAL" in clean_name:
            return "GRADO"
            
        return "OTROS"
        
    def get_area(self, program_name: str) -> str:
        if not program_name:
            return "OTROS"
            
        import re
        clean_name = self._normalize(program_name)
        
        if clean_name in self.area_mapping:
            return self.area_mapping[clean_name]
            
        name_no_virtual = re.sub(r'\s+VIRTUAL$', '', clean_name)
        if name_no_virtual in self.area_mapping:
            return self.area_mapping[name_no_virtual]
            
        sorted_keys = sorted(self.area_mapping.keys(), key=len, reverse=True)
        for mapped_prog in sorted_keys:
            if mapped_prog in clean_name:
                return self.area_mapping[mapped_prog]
                
        return "OTROS"

# Singleton instance
mapping = ProgramMapping()
