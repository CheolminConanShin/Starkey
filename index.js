var convertExcel = require('excel-as-json').processFile;

convertExcel('customers.xlsx', 'customers.json', false, function(err, data){

    });
