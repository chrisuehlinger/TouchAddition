var report = {
  name: 'Chris',
  series: []
};

var operators = ['+', '-', '×', '÷'];

!function(){
  var i,j;
  for(i = 0; i < 4; i++){
    report.series.push([]);
    var operator = ['+', '-', '×', '÷'][i];

    for(j = 0; j < 10; j++){
      var total = ~~(Math.random() * 20) + 1;
      var correct = ~~(Math.random() * total);
      
      report.series[i].push({
        label: operator + ' ' + j,
        right: correct,
        wrong: total-correct
      })
    }
  }
}()

console.log(JSON.stringify(report));

$('.report-title').text(report.name + "'s Math Report");

var barScale = d3.scale.linear()
                     .domain([0, d3.max(report.series, function(s){ return d3.max(s, function(d) { return d.right + d.wrong; })})])
                     .range([0, 200]);

report.series.map(function(series, i){
  var $seriesWrapper = $('<div class="series-wrapper"></div>');
  var $series = $('<div class="series"></div>');
  
  series.map(function(item){
    var $item = $('<div class="line-item"></div>');
    var $label = $('<label>' + item.label + '</label>');
    var $progress = $('<div class="progress-bar-wrapper"></div>');
    var $right = $('<div class="progress-bar progress-bar-right"></div>');
    var $wrong = $('<div class="progress-bar progress-bar-wrong"></div>');
    
    $series.append($item);
    $item.append($label);
    $item.append($progress);
    $progress.append($right).append($wrong);
    
    setTimeout(function(){
      var rightPercent = 100 * item.right / ( 20);
      $right.css({width: rightPercent + '%'});

      var wrongPercent = 100 * item.wrong / ( 20 );
      $wrong.css({width: wrongPercent + '%'});
    });
  });
  
  $('.report-area').append($seriesWrapper);
  $seriesWrapper.append('<h2 class="series-title">' + operators[i] + '</h2>');
  $seriesWrapper.append($series);
});

