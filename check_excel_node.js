const xlsx = require('xlsx');

try {
    const workbook = xlsx.readFile('backend/ArchivosUtiles/mapeo_mapas.xlsx');
    const sheet_name_list = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: 1 });
    console.log("First 10 rows:");
    for (let i = 0; i < Math.min(10, data.length); i++) {
        console.log(data[i]);
    }
} catch (e) {
    console.log(e);
}
