/**
 * Created by Omri on 09-Jun-17.
 */
$( document ).ready(function() {

    google.charts.load('current', {'packages':['geochart']});
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {

        $.get( "happiness", function( happiness ) {

            let dataTable = [];
            // set caption
            dataTable.push(['Country', 'Happiness Score']);

            var arrays = _.map(happiness, function (item) {
                return [ item.country, item.score];
            });

            _.each(arrays, function (array) {
                dataTable.push(array);
            });

            var data = google.visualization.arrayToDataTable(dataTable);

            var options = {};

            var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

            chart.draw(data, options);
        });
    }


});