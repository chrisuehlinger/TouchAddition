'use strict';

var width = self.frameElement ? 960 : innerWidth,
    height = self.frameElement ? 500 : innerHeight;

var midX = width / 2,
    midY = (height / 2) - 100;

var vertSpacing = 35,
    horzSpacing = 25;

console.log('width: ' + width);
console.log('height: ' + height);

var staticData = [
  {
    id: 0,
    digit: 1 + Math.floor(Math.random() * 9),
    coordinates: [midX - horzSpacing, midY - vertSpacing]
  },
  {
    id: 1,
    digit: Math.floor(Math.random() * 10),
    coordinates: [midX + horzSpacing, midY - vertSpacing]
  },
  {
    id: 2,
    digit: 1 + Math.floor(Math.random() * 9),
    coordinates: [midX - horzSpacing, midY + vertSpacing]
  },
  {
    id: 3,
    digit: Math.floor(Math.random() * 10),
    coordinates: [midX + horzSpacing, midY + vertSpacing]
  }
];

var data = _.cloneDeep(staticData);

staticData.push({
  id: 5,
  digit: ['+', '-', '×', '÷'][0],//[Math.floor(Math.random()*4)],
  coordinates: [midX - 70, midY + vertSpacing]
});

staticData.push({
  id: 6,
  digit: '___',
  coordinates: [midX - 65, midY + 50]
});

var newIndex = 10;

var record = [
  {
    type: 'start',
    time: +new Date(),
    data: _.cloneDeep(data)
  }
];


var mode = 'record';
var timeScale = 2;

$('.play-button').on('click touchend', playBack);

function playBack(){
  mode = 'playback';
  data = _.cloneDeep(record[0].data);
  playBackFrame(_.cloneDeep(record));
  

  function playBackFrame(remainingRecord){
    console.log(remainingRecord[0]);
    var currentRecord = remainingRecord[0];
    var index = currentRecord.index;
    var el = $('[data-index="' + currentRecord.index + '"]')[0];
    var obj = getNumberByIndex(index, data);
    var delay = (remainingRecord.length > 1) && timeScale * (remainingRecord[1].time - remainingRecord[0].time);
    switch(currentRecord.type){
      case 'start':
        d3.selectAll('.digit.draggable').remove();
        render(data);
        newIndex = 10;
        delay = 1000;
        break;

      case 'dragstart':
        dragStartAnimation(el);
        break;

      case 'drag':
        obj.coordinates = currentRecord.coordinates;
        draggingAnimation(el);
        break;

      case 'dragend':
        dragEndAnimation(el);
        break;

      case 'collision':
        chooseOperator(obj, getNumberByIndex(currentRecord.collidee, data));
        break;

      case 'chosenOperator':
        var operator;
        switch(currentRecord.operator){
          case '+':
            operator = 'plus';
            break;

          case '—':
            operator = 'minus';
            break;

          case '×':
            operator = 'times';
            break;

          case '÷':
            operator = 'divide';
            break;
        }
        $('[data-operator="' + operator + '"]').addClass('active');
        delay += 500;
        setTimeout(function(){
          $('[data-operator="' + operator + '"]').click();
        }, 500);


        break;

      case 'input':
        $('.answer-input').val(currentRecord.value);
        break;

      case 'answer':
        $('.operator-panel').removeClass('active');

        $('.answer-input').val(currentRecord.answer);
        var e = jQuery.Event("keyup");
        e.keyCode = 13; // # Some key code value
        $(".answer-input").trigger(e);
        break;
    }

    if(remainingRecord.length > 1)
      setTimeout(function(){
        remainingRecord.shift(1);
        playBackFrame(remainingRecord);
      }, delay);
  }
}

$('.equation-area, .mask').hide();

console.log(data);
var transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform";

var color = d3.scale.category10();

var radius0 = 32,
    radius1 = 48;


var drag = d3.behavior.drag()
    .origin(function(d) { return {x: d.coordinates[0], y: d.coordinates[1]}; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

render(data);
initialRender(staticData);

function initialRender(data){
  d3.select('body')
    .selectAll(".digit.nondraggable")
      .data(data)
    .enter().append("div")
      .attr('class', 'digit nondraggable')
      .style(transform, function(d) { return "translate(" + d.coordinates[0] + "px," + d.coordinates[1] + "px)"; })
      .text(function(d){ return d.digit; })
      .call(drag);
}

function render(data){

  d3.select("body")
      .on("touchstart", nozoom)
      .on("touchmove", nozoom)
    .selectAll(".digit.draggable")
      .data(data)
    .enter().append("div")
      .attr('class', 'digit draggable')
      .attr('data-index', function(d){ return d.id; })
      .style(transform, function(d) { return "translate(" + d.coordinates[0] + "px," + d.coordinates[1] + "px)"; })
      .text(function(d){ return d.digit; })
      .style("color", function(d) { return color(d.digit); })
      .call(drag);
}

function getNumberByIndex(index, data){
  var i;
  for(i = 0; i < data.length; i++) {
    if(data[i].id == index)
      return data[i];
  }
}

function dragstarted() {
  record.push({
    type:'dragstart',
    time:+new Date(),
    index: $(this).attr('data-index')
  });
  
  dragStartAnimation(this);
}

function dragStartAnimation(el){
  el.parentNode.appendChild(el);
  d3.select(el).transition()
      .ease("elastic")
      .duration(300)
      .attr('class', 'digit draggable dragging')
      .style("margin-top", "-4px")
      .styleTween("text-shadow", function() { return d3.interpolate("0 0px 0px rgba(0,0,0,0)", "0 4px 4px rgba(0,0,0,.3)"); });
}

function dragged(d) {
  d.coordinates[0] = d3.event.x;
  d.coordinates[1] = d3.event.y;
  
  record.push({
    type: 'drag',
    time: +new Date(),
    index: $(this).attr('data-index'),
    coordinates: [d3.event.x, d3.event.y]
  });

  draggingAnimation(this);
}

function draggingAnimation(el){
  d3.select(el)
    .style(transform, function(d) { return "translate(" + d.coordinates[0] + "px," + d.coordinates[1] + "px)"; });
}

function dragended() {
  record.push({
    type:'dragend',
    time:+new Date(),
    index: $(this).attr('data-index')
  });
  
  dragEndAnimation(this);
  
  var collision = detectCollision(this);
  
  if(collision.length > 0){
      record.push({
        type:'collision',
        time:+new Date(),
        index: $(this).attr('data-index'),
        collidee: collision[1].id
      });
    chooseOperator(collision[0], collision[1]);
  }
}

function dragEndAnimation(el){
  d3.select(el).transition()
      .ease("elastic")
      .duration(300)
      .attr('class', 'digit draggable')
      .style("margin-top", "0px")
      .styleTween("text-shadow", function() { return d3.interpolate("0 4px 4px rgba(0,0,0,.3)", "0 0px 0px rgba(0,0,0,0)"); });
}

function nozoom() {
  d3.event.preventDefault();
}

function nodeDistance(n1, n2){
  return Math.sqrt((n2[1]-n1[1])*(n2[1]-n1[1]) + (n2[0]-n1[0])*(n2[0]-n1[0]));
}

function detectCollision(element){
  var i, index = +element.getAttribute('data-index');
  var currentItem = data.filter(function(d){ return d.id === index; })[0];
  
  for(i = 0; i < data.length; i++){
    if(data[i].id !== currentItem.id && nodeDistance(currentItem.coordinates, data[i].coordinates) < 30){
      return [currentItem, data[i]];
    }
  }
  return [];
}

function chooseOperator(n1, n2){
  $('.dial-wrapper, .mask').fadeIn();
  $('.operator-panel').on('click touchend', function(e){
    var operator = $(this).text().trim();
    
    if(mode == 'record')
      record.push({
        type:'chosenOperator',
        time:+new Date(),
        operator: operator
      });
    
    $('.dial-wrapper').fadeOut();
    $('.operator-panel').off('click touchend');
    addEmUp(n1,n2,operator);
  });
}

function addEmUp(n1, n2, operator){
  console.log('adding: ', n1, n2);
  
  setTimeout(function(){
    $('.digit[data-index="' + n1.id + '"]').addClass('combined');
    $('.digit[data-index="' + n2.id + '"]').addClass('combined');
  }, 390);
  
  
  $('.first-number').text(n1.digit);
  $('.equation-area .operator').text(operator);
  $('.second-number').text(n2.digit);
  
  $('.equation-area').fadeIn(500);
  
  $('.answer-input').focus();
  
  $('.answer-input').on('keyup',function(e){
    if(e.keyCode === 13){
      
      if(mode == 'record')
        record.push({
          type:'answer',
          time:+new Date(),
          answer: $(this).val()
        });
      
      displayAnswer(n1, n2, $(this).val());
      $('.answer-input').off('keyup');
    } else {
      if(mode == 'record')
        record.push({
          type:'input',
          time:+new Date(),
          value: $(this).val()
        });
    }
  });
}

function displayAnswer(n1, n2, newNumber){
  data.splice(data.indexOf(n1), 1);
  data.splice(data.indexOf(n2), 1);
  
  $('.equation-area, .mask').fadeOut(500);
  $('.answer-input').blur().val('');
  
  var i;
  for (i= 0; i <newNumber.length ; i++){
    var newDigit = {
      id: newIndex++,
      digit: +newNumber[i],
      coordinates: [n2.coordinates[0] + 45*i - 45*(newNumber.length-1), midY + 110]
    };
    
    if(i === 0 && newNumber[i] === '-'){
      newDigit.digit = +(newNumber[0] + newNumber[1]);
      i++;
    }
    
    data.push(newDigit);
  }
  
  d3.select('body').selectAll(".digit.draggable")
    .remove();
  
  d3.select('body').selectAll(".digit.draggable")
    .data(data)
  .enter().append("div")
    .attr('class', 'digit draggable')
    .attr('data-index', function(d){ return d.id; })
    .style(transform, function(d) { return "translate(" + d.coordinates[0] + "px," + d.coordinates[1] + "px)"; })
    .text(function(d){ return d.digit; })
    .style("color", function(d) { return color(d.digit); })
    .call(drag);
}