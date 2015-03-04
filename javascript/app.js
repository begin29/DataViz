google.load('visualization', '1.0', {'packages':['corechart']});

$(document).ready(function() {
  google.setOnLoadCallback(drawDiagram);

  function printError(err, file){
    console.log(err);
  };

  function drawDiagram() {
    $(".fileinput").change(function(e){
      if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
      };

      var ext = $("input.fileinput").val().split(".").pop().toLowerCase();

      if($.inArray(ext, ["csv"]) == -1) {
        alert('Please upload CSV file');
        return false;
      }

      if ($('.fileinput')[0].files.length){
        file = e.target.files[0];

        var config = {
          comments: "",
          delimiter: "",
          complete: drawResult,
          download: false,
          dynamicTyping: false,
          header: false,
          encoding: "",
          preview: 0,
          worker: false,
          step: undefined,
          error: printError,
          skipEmptyLines: false
        };

        Papa.parse(file, config);
      }
    });

  };

  function drawResult(result){
    var value_index = result.data[0].indexOf('summary_status');

    drawStackedChart(result.data, value_index);
    drawLineChart(result.data, value_index);
    calculateAbnormalFallDates(result.data, value_index);
  };

  function filterByStatus(element){
    var statusList = this[0];
    var value_index = this[1];
    return $.inArray(element[value_index], statusList) >= 0;
  };

  function filterByDate(element){
    var date = this[0].substring(0,10);
    var value_index = this[1];
    var d = element[value_index].substring(0,10);
    return d == date;
  };

  function filterMoreThan(element){
    var el = element[this[1]];
    return el > this[0];
  };

  function calculateStateCountPerDay(date_arr, possible_val_arr, prepared_array){
    var common_hash = {};
    //date_arr => [date1, date2, ...] uniq
    //prepared_array => [[date1, status], [date2, status2], [date1, status2], ...]
    //possible_val_arr => [status1, status2, ...] uniq

    for (var i = 0; i < date_arr.length; i++) {
      common_hash[date_arr[i]] = {};

      for (var k = 0; k < possible_val_arr.length; k++){
        common_hash[date_arr[i]][possible_val_arr[k]] = 0;
      };

      for (var j = 0; j < prepared_array.length; j++) {
        if (date_arr[i] == prepared_array[j][0]) {
          for (var k = 0; k < possible_val_arr.length; k++){
            if (prepared_array[j][1] == possible_val_arr[k]) {
              common_hash[date_arr[i]][possible_val_arr[k]] += 1;
            };
          };

        };
      };
    };

    var result_array = $.map(common_hash, function (val, ind) {
      arr = $.map(val, function (value, index) {
        return value
      });
      return [[].concat([ind], arr)];
    });
    return result_array;
  };

  function drawStackedChart(result_data, value_index){
    var prepared_array = [];
    var date_array = [];
    var statusList = ['passed', 'failed'];

    result_data = result_data.filter(filterByStatus, [statusList, value_index]);

    for(var i=0; i < result_data.length; i++){
      if(result_data[i].slice(2,4).length > 0){
        var temp_array = result_data[i].slice(2,4);
        temp_array[0] = temp_array[0].substring(0,10);
        date_array.push(temp_array[0]);
        prepared_array.push(temp_array);
      };

    };
    date_array = $.unique(date_array);

    var calculated_data = calculateStateCountPerDay(date_array, statusList, prepared_array);
    calculated_data.unshift(['Data', 'Passed', 'Failed']);
    var data = new google.visualization.arrayToDataTable(calculated_data);

    var options = {
      title: "Passing and failing builds per day.",
      width: 600,
      height: 400,
      bar: {groupWidth: "95%"},
      isStacked: true
    };

    var chart = new google.visualization.ColumnChart( $('.first_block')[0] );
    chart.draw(data, options);
  };

  function drawLineChart(result_data, value_index){
    var prepared_array = [];
    var date_array = [];

    var statusList = ['passed'];
    result_data = result_data.filter(filterByStatus, [statusList, value_index]);

    for(var i=0; i < result_data.length; i++){
      if(result_data[i].slice(2,5).length > 0){
        var temp_array = result_data[i].slice(2,5);
        temp_array.splice(1, 1);
        date_array.push(temp_array[0].substring(0,10));
        temp_array[1] = parseFloat(temp_array[1]);
        prepared_array.push(temp_array);
      };
    };
    date_array = $.unique(date_array);

    var selectbox = $('.linechart-select');

    date_array.forEach(function(e){
      var o = new Option(e, e);
      selectbox.append(o);
    });

    selectbox.show();

    selectbox.on('change', function(){
      if($(this).val() != ''){
        var selected_date = $(this).val();
        var duration_index = 0;
        var filtered_data = prepared_array.filter(filterByDate, [selected_date, duration_index]);

        filtered_data.unshift(['Data', 'Duration']);
        var data = new google.visualization.arrayToDataTable(filtered_data);

        var options = {
          title: "Build duration",
          width: 600,
          height: 400,
          bar: {groupWidth: "95%"}
        };

        var chart = new google.visualization.LineChart( $('.line-block')[0] );
        chart.draw(data, options);
      };
    });
  };

  function calculateAbnormalFallDates(result_data, value_index){
    var prepared_array = [];
    var date_array = [];

    var statusList = ['failed'];
    result_data = result_data.filter(filterByStatus, [statusList, value_index]);

    for(var i=0; i < result_data.length; i++){
      if(result_data[i].slice(2,4).length > 0){
        var temp_array = result_data[i].slice(2,4);
        temp_array[0] = temp_array[0].substring(0,10);
        date_array.push(temp_array[0]);
        prepared_array.push(temp_array);
      };

    };

    var calculated_data = calculateStateCountPerDay(date_array, statusList, prepared_array);
    var summ = 0;
    var middle_value = 0;
    calculated_data.forEach(function(element){
      summ += element[1];
      middle_value = Math.round(summ/calculated_data.length);
    });

    var index_value = 1;
    var date_with_ubnormal = calculated_data.filter(filterMoreThan, [middle_value, index_value]);
    date_with_ubnormal.unshift(['Date', 'Failed']);
    var data = new google.visualization.arrayToDataTable(date_with_ubnormal);

    var table = new google.visualization.ChartWrapper({
      chartType: 'Table',
      containerId: 'table-block',
      dataTable: data,
      options: {
        title: 'Abnormal fails',
        view: {'columns': [0,1]},
        width: '500px',
        height:'100px'
      }
    })

    table.draw();
    $('.table-wrapper').show();
  };

})
