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

    var data = {"OkPercent": 95.27112232030265, "KoPercent": 4.7288776796973515};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.06967213114754098, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.05080213903743316, 500, 1500, "Create landing"], "isController": false}, {"data": [8.741258741258741E-4, 500, 1500, "Get structure"], "isController": false}, {"data": [8.110300081103001E-4, 500, 1500, "Create structure"], "isController": false}, {"data": [0.0728110599078341, 500, 1500, "Set global value (Color Background)"], "isController": false}, {"data": [0.11, 500, 1500, "Set value (Description)"], "isController": false}, {"data": [0.11104718066743383, 500, 1500, "Remove landing"], "isController": false}, {"data": [0.10068093385214008, 500, 1500, "Set value (Galley image)"], "isController": false}, {"data": [0.11619348054679285, 500, 1500, "Set value (TITLE)"], "isController": false}, {"data": [0.10590858416945373, 500, 1500, "Set template"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9516, 450, 4.7288776796973515, 7001.897225725096, 11, 24560, 14221.70000000001, 16461.3, 19442.3, 32.67071789061695, 141.84727054687232, 44.50999676524359], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Create landing", 1309, 76, 5.805958747135218, 5420.590527119941, 11, 15376, 10660.0, 12279.0, 14512.1, 4.494111992309541, 4.001914702209291, 5.4645556796529], "isController": false}, {"data": ["Get structure", 1144, 59, 5.1573426573426575, 9689.459790209785, 886, 23514, 16665.5, 17965.5, 20573.05, 3.9545913358498916, 124.80900108651879, 4.920908308314667], "isController": false}, {"data": ["Create structure", 1233, 89, 7.218167072181671, 11708.511759935114, 545, 24560, 18605.0, 19682.9, 22170.28000000002, 4.236370945298247, 3.796957916095461, 5.233793325740162], "isController": false}, {"data": ["Set global value (Color Background)", 1085, 57, 5.253456221198157, 5759.584331797241, 263, 16000, 11525.599999999999, 13278.400000000001, 14974.500000000002, 3.799711432053455, 2.071465847029221, 5.074911606367406], "isController": false}, {"data": ["Set value (Description)", 1000, 49, 4.9, 6392.6950000000015, 30, 15973, 12645.9, 13621.5, 15143.710000000001, 3.5933221700791247, 1.9329441447264406, 6.061990646582392], "isController": false}, {"data": ["Remove landing", 869, 10, 1.1507479861910241, 4609.94476409666, 144, 14985, 9557.0, 12526.0, 13915.6, 3.1515995546416278, 1.322664129565558, 4.123819935181861], "isController": false}, {"data": ["Set value (Galley image)", 1028, 28, 2.7237354085603114, 6270.552529182877, 198, 16090, 12614.4, 13648.749999999998, 15254.52, 3.6506200372164375, 1.7977397694747084, 5.616382268391597], "isController": false}, {"data": ["Set value (TITLE)", 951, 54, 5.678233438485805, 6292.709779179812, 201, 16236, 12074.6, 13106.999999999998, 14909.400000000001, 3.4302904384711943, 1.897923976548861, 4.782164242513598], "isController": false}, {"data": ["Set template", 897, 28, 3.121516164994426, 5501.430323299888, 161, 16025, 11484.2, 12741.899999999998, 15178.22, 3.2488817254930367, 1.4970220847896556, 4.510643839756243], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:2434 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1, 0.2222222222222222, 0.010508617065994116], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 28, 6.222222222222222, 0.2942412778478352], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 421, 93.55555555555556, 4.424127784783522], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9516, 450, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 421, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 28, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:2434 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create landing", 1309, 76, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 73, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 3, null, null, null, null, null, null], "isController": false}, {"data": ["Get structure", 1144, 59, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 57, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Create structure", 1233, 89, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 86, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 3, null, null, null, null, null, null], "isController": false}, {"data": ["Set global value (Color Background)", 1085, 57, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 48, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 8, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:2434 [localhost\/127.0.0.1, localhost\/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1, null, null, null, null], "isController": false}, {"data": ["Set value (Description)", 1000, 49, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 44, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 5, null, null, null, null, null, null], "isController": false}, {"data": ["Remove landing", 869, 10, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (Galley image)", 1028, 28, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 26, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Set value (TITLE)", 951, 54, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 52, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Set template", 897, 28, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket Closed", 25, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket operation on nonsocket: configureBlocking", 3, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
