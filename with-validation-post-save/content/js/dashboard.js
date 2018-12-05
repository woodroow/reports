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

    var data = {"OkPercent": 99.32508816035906, "KoPercent": 0.6749118396409469};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4994347613343007, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.49134871339840286, 500, 1500, "Create landing"], "isController": false}, {"data": [0.4452609478104379, 500, 1500, "Get structure"], "isController": false}, {"data": [0.49798957557706625, 500, 1500, "Create structure"], "isController": false}, {"data": [0.5592234476507025, 500, 1500, "Set global value (Color Background)"], "isController": false}, {"data": [0.48571645646558276, 500, 1500, "Set value (Description)"], "isController": false}, {"data": [0.5471359450600906, 500, 1500, "Remove landing"], "isController": false}, {"data": [0.49166921430755123, 500, 1500, "Set value (Galley image)"], "isController": false}, {"data": [0.46659499308861924, 500, 1500, "Set value (TITLE)"], "isController": false}, {"data": [0.511683689260291, 500, 1500, "Set template"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 59267, 400, 0.6749118396409469, 1041.093930855274, 5, 3426, 2215.0, 2374.0, 2817.0, 211.2943189718177, 724.4079558292037, 474.6711484663274], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Create landing", 6762, 46, 0.6802721088435374, 1034.6465542738845, 23, 3026, 1865.6999999999998, 2013.8499999999995, 2375.699999999999, 24.107381593254782, 19.16743307590153, 31.514578301306617], "isController": false}, {"data": ["Get structure", 6668, 49, 0.7348530293941212, 1155.201259748053, 5, 3420, 2091.0, 2262.5499999999993, 2625.0, 23.817092728785894, 323.4941668348413, 31.136775160108158], "isController": false}, {"data": ["Create structure", 6715, 47, 0.6999255398361877, 1063.8473566641828, 45, 3426, 1690.4000000000005, 1950.999999999999, 2597.0, 23.965024982155605, 325.6035623271324, 31.805971460117775], "isController": false}, {"data": ["Set global value (Color Background)", 6619, 38, 0.5741048496751775, 882.3701465478157, 46, 3298, 1752.0, 1986.0, 2370.000000000001, 23.76182886026508, 9.684227262650957, 38.75161589478417], "isController": false}, {"data": ["Set value (Description)", 6581, 39, 0.5926151040875247, 1066.66433672694, 151, 3410, 1924.0, 2105.7999999999993, 2434.1800000000003, 23.655133246587063, 9.650258318026928, 63.87661452979087], "isController": false}, {"data": ["Remove landing", 6407, 47, 0.7335726549086936, 931.8442328702978, 57, 3311, 1776.0, 1971.0, 2343.76, 23.259528710470235, 9.557738934752066, 30.566086823442497], "isController": false}, {"data": ["Set value (Galley image)", 6542, 30, 0.4585753592173647, 1062.1874044634649, 5, 3298, 2002.0, 2202.0, 2525.5699999999997, 23.57893826297256, 9.552387037485898, 43.24263704446911], "isController": false}, {"data": ["Set value (TITLE)", 6511, 49, 0.752572569497773, 1117.1953616955902, 111, 3297, 1996.8000000000002, 2189.3999999999996, 2590.88, 23.514328536087685, 9.671504400359343, 104.25736741364055], "isController": false}, {"data": ["Set template", 6462, 55, 0.8511296812132467, 1053.2770040235241, 24, 3254, 1968.0, 2171.0, 2549.4399999999987, 23.391262483846564, 9.669310981260203, 104.33345636943136], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 4, 1.0, 0.006749118396409469], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 4, 1.0, 0.006749118396409469], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 392, 98.0, 0.661413602848128], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 59267, 400, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 392, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 4, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 4, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create landing", 6762, 46, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 46, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get structure", 6668, 49, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 46, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 3, null, null, null, null, null, null], "isController": false}, {"data": ["Create structure", 6715, 47, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 46, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Set global value (Color Background)", 6619, 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 37, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (Description)", 6581, 39, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 39, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Remove landing", 6407, 47, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 47, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (Galley image)", 6542, 30, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 29, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (TITLE)", 6511, 49, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 48, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Set template", 6462, 55, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 54, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 1, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
