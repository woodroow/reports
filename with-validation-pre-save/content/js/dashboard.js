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

    var data = {"OkPercent": 99.20119820269596, "KoPercent": 0.7988017973040439};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4505741387918123, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4447282861124013, 500, 1500, "Create landing"], "isController": false}, {"data": [0.3891879056514168, 500, 1500, "Get structure"], "isController": false}, {"data": [0.43953634085213034, 500, 1500, "Create structure"], "isController": false}, {"data": [0.522017614091273, 500, 1500, "Set global value (Color Background)"], "isController": false}, {"data": [0.4274790727623954, 500, 1500, "Set value (Description)"], "isController": false}, {"data": [0.5118988596926128, 500, 1500, "Remove landing"], "isController": false}, {"data": [0.4371664240659874, 500, 1500, "Set value (Galley image)"], "isController": false}, {"data": [0.42631493242142976, 500, 1500, "Set value (TITLE)"], "isController": false}, {"data": [0.45945502298095864, 500, 1500, "Set template"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 56084, 448, 0.7988017973040439, 1150.454193709432, 5, 4303, 2446.9000000000015, 2696.0, 3180.980000000003, 195.59250747195185, 670.6948687711212, 438.6228123888362], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Create landing", 6459, 75, 1.1611704598235022, 1139.4520823656906, 8, 3853, 1984.0, 2209.0, 2754.999999999998, 22.525868653156028, 18.11400369720336, 29.29082974446095], "isController": false}, {"data": ["Get structure", 6317, 71, 1.1239512426784866, 1275.3205635586519, 11, 4267, 2222.2, 2436.0999999999995, 2968.459999999999, 22.063651731701526, 298.7225138934731, 28.736092064751947], "isController": false}, {"data": ["Create structure", 6384, 66, 1.0338345864661653, 1182.4414160400995, 77, 4236, 1919.5, 2349.0, 2993.899999999998, 22.283344735629615, 301.91741419699326, 29.479239930783404], "isController": false}, {"data": ["Set global value (Color Background)", 6245, 33, 0.5284227381905524, 991.3522818254588, 34, 3496, 1959.800000000001, 2196.0, 2684.0, 21.9005235785701, 8.90305352521278, 35.73722922431116], "isController": false}, {"data": ["Set value (Description)", 6212, 29, 0.46683837733419187, 1175.0500643915077, 16, 3878, 2055.0, 2285.0, 2884.0, 21.81708349284061, 8.841136733004134, 58.9923752868936], "isController": false}, {"data": ["Remove landing", 6051, 42, 0.6941001487357461, 1026.2318625020653, 9, 3747, 1915.0, 2154.3999999999996, 2708.8799999999974, 21.48548460402227, 8.809208748029343, 28.250494134411216], "isController": false}, {"data": ["Set value (Galley image)", 6183, 42, 0.6792819019893256, 1174.164483260552, 5, 3943, 2139.0, 2358.7999999999993, 2980.5999999999985, 21.778488503155994, 8.92330269430864, 39.85672753818192], "isController": false}, {"data": ["Set value (TITLE)", 6141, 49, 0.7979156489171145, 1221.2582641263625, 9, 3853, 2179.0, 2419.8999999999996, 2947.58, 21.683403245625183, 8.93766818783279, 96.1000711812176], "isController": false}, {"data": ["Set template", 6092, 41, 0.6730137885751806, 1165.0861785948762, 138, 4303, 2147.0, 2404.3499999999995, 2939.469999999994, 21.566663008499926, 8.833418232671795, 96.37241601409691], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 40, 8.928571428571429, 0.07132158904500392], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 8, 1.7857142857142858, 0.014264317809000785], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 400, 89.28571428571429, 0.7132158904500392], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 56084, 448, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 400, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 40, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 8, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create landing", 6459, 75, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 68, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 6, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, null, null, null, null], "isController": false}, {"data": ["Get structure", 6317, 71, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 62, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 8, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, null, null, null, null], "isController": false}, {"data": ["Create structure", 6384, 66, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 62, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 4, null, null, null, null, null, null], "isController": false}, {"data": ["Set global value (Color Background)", 6245, 33, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 27, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 6, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (Description)", 6212, 29, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 24, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 4, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, null, null, null, null], "isController": false}, {"data": ["Remove landing", 6051, 42, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 37, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 3, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2, null, null, null, null], "isController": false}, {"data": ["Set value (Galley image)", 6183, 42, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 39, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 2, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 1, null, null, null, null], "isController": false}, {"data": ["Set value (TITLE)", 6141, 49, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 44, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 3, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2, null, null, null, null], "isController": false}, {"data": ["Set template", 6092, 41, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 37, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 4, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
