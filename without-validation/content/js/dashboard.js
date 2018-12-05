/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.22076102754478, "KoPercent": 0.7792389724552157};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4682350675048593, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4162108781525372, 500, 1500, "Create landing"], "isController": false}, {"data": [0.36963979416809606, 500, 1500, "Get structure"], "isController": false}, {"data": [0.4089084452678709, 500, 1500, "Create structure"], "isController": false}, {"data": [0.4954352274515977, 500, 1500, "Set global value (Color Background)"], "isController": false}, {"data": [0.4947743467933492, 500, 1500, "Set value (Description)"], "isController": false}, {"data": [0.5071070909384591, 500, 1500, "Remove landing"], "isController": false}, {"data": [0.508749602290805, 500, 1500, "Set value (Galley image)"], "isController": false}, {"data": [0.498083373263057, 500, 1500, "Set value (TITLE)"], "isController": false}, {"data": [0.5222347086209664, 500, 1500, "Set template"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 57107, 445, 0.7792389724552157, 1115.8098832017154, 4, 4276, 2468.0, 2697.9500000000007, 3127.980000000003, 200.39161055102693, 685.7653205346397, 449.78746365934796], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Create landing", 6582, 105, 1.5952597994530537, 1201.7281981160738, 4, 3832, 2099.0, 2324.8499999999995, 2789.34, 23.096681825837965, 18.73733720120291, 29.908052427002623], "isController": false}, {"data": ["Get structure", 6413, 60, 0.9355995633868704, 1345.9329486979623, 14, 4276, 2350.0, 2581.0, 3056.579999999999, 22.535993281019937, 305.59344053860775, 29.405524171372647], "isController": false}, {"data": ["Create structure", 6477, 64, 0.9881117801451289, 1255.4060521846566, 9, 4115, 2212.0, 2580.0999999999995, 3066.2200000000003, 22.742275280898877, 308.24953229239816, 30.098767227001403], "isController": false}, {"data": ["Set global value (Color Background)", 6353, 38, 0.59814260979065, 1074.3355894852818, 111, 4247, 2090.0, 2369.199999999997, 2845.46, 22.434969312154365, 9.154462147169232, 36.58204145794635], "isController": false}, {"data": ["Set value (Description)", 6315, 29, 0.4592240696753761, 1048.357244655582, 8, 3526, 1935.0, 2181.0, 2795.4000000000015, 22.35698961276207, 9.056303231717894, 60.34659225178962], "isController": false}, {"data": ["Remove landing", 6191, 54, 0.8722338879017929, 1033.8528509126172, 108, 3504, 1946.8000000000002, 2184.399999999998, 2706.4799999999996, 22.046307572876383, 9.121204614732674, 28.93439114145995], "isController": false}, {"data": ["Set value (Galley image)", 6286, 25, 0.39770919503658925, 1006.1396754692969, 108, 3968, 1925.0, 2179.0, 2754.13, 22.274350833427825, 8.994505078036411, 40.87814882994103], "isController": false}, {"data": ["Set value (TITLE)", 6261, 32, 0.5111004631847947, 1050.7014853857215, 9, 3933, 1953.8000000000002, 2175.8999999999996, 2697.180000000001, 22.20488358484209, 9.019577174915327, 98.58628495003813], "isController": false}, {"data": ["Set template", 6229, 38, 0.610049767217852, 1011.2053299084928, 18, 3938, 1925.0, 2187.5, 2768.199999999997, 22.142989179120395, 9.040215567767358, 99.00895715283605], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 55, 12.359550561797754, 0.09631043479783565], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 7, 1.5730337078651686, 0.012257691701542717], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 383, 86.06741573033707, 0.6706708459558373], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 57107, 445, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 383, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 55, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 7, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create landing", 6582, 105, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 92, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 10, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 3, null, null, null, null], "isController": false}, {"data": ["Get structure", 6413, 60, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 47, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 13, null, null, null, null, null, null], "isController": false}, {"data": ["Create structure", 6477, 64, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 53, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 10, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, null, null, null, null], "isController": false}, {"data": ["Set global value (Color Background)", 6353, 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 36, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (Description)", 6315, 29, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 24, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 3, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2, null, null, null, null], "isController": false}, {"data": ["Remove landing", 6191, 54, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 47, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 7, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (Galley image)", 6286, 25, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 21, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 4, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (TITLE)", 6261, 32, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 29, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 2, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, null, null, null, null], "isController": false}, {"data": ["Set template", 6229, 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 34, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 4, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
