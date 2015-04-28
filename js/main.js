'use strict';

var width = self.frameElement ? 960 : innerWidth,
    height = self.frameElement ? 500 : innerHeight;

var data = d3.range(20).map(function(d) {
  return {
    id: d,
    digit: Math.floor(Math.random() * 10),
    coordinates: [Math.random() * width, Math.random() * height]
  };
});

var startingData = _.cloneDeep(data);
var record = [];

var newIndex = 20;

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

d3.select("body")
    .on("touchstart", nozoom)
    .on("touchmove", nozoom)
  .selectAll(".digit")
    .data(data)
  .enter().append("div")
    .attr('class', 'digit draggable')
    .attr('data-index', function(d){ return d.id; })
    .style(transform, function(d) { return "translate(" + d.coordinates[0] + "px," + d.coordinates[1] + "px)"; })
    .text(function(d){ return d.digit; })
    .style("color", function(d) { return color(d.digit); })
    .call(drag);

function dragstarted() {
  this.parentNode.appendChild(this);

  d3.select(this).transition()
      .ease("elastic")
      .duration(300)
      .attr('class', 'digit draggable dragging')
      .style("margin-top", "-4px")
      .styleTween("text-shadow", function() { return d3.interpolate("0 0px 0px rgba(0,0,0,0)", "0 4px 4px rgba(0,0,0,.3)"); });
}

function dragged(d) {
  d.coordinates[0] = d3.event.x;
  d.coordinates[1] = d3.event.y;

  d3.select(this)
      .style(transform, function(d) { return "translate(" + d.coordinates[0] + "px," + d.coordinates[1] + "px)"; });
}

function dragended() {
  d3.select(this).transition()
      .ease("elastic")
      .duration(300)
      .attr('class', 'digit draggable')
      .style("margin-top", "0px")
      .styleTween("text-shadow", function() { return d3.interpolate("0 4px 4px rgba(0,0,0,.3)", "0 0px 0px rgba(0,0,0,0)"); });
  
  var collision = detectCollision(this);
  
  if(collision.length > 0){
    var operator = chooseOperator(collision[0], collision[1]);
  }
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
    var operator = $(this).text();
    
    $('.dial-wrapper').fadeOut();
    $('.operator-panel').off('click touchend');
    addEmUp(n1,n2,operator);
  });
  
  return "+"
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
  
  $('.answer-input').on('keypress',function(e){
    if(e.keyCode === 13){
     displayAnswer(n1, n2, $(this).val());
      $('.answer-input').off('keypress');
    }
  });
}

function displayAnswer(n1, n2, newNumber){
  data.splice(data.indexOf(n1), 1);
  data.splice(data.indexOf(n2), 1);
  
  $('.equation-area, .mask').fadeOut(500);
  $('.answer-input').blur().val('');
  
  var i;
  for (i=0; i < newNumber.length; i++){
    data.push({
      id: newIndex++,
      digit: +newNumber[i],
      coordinates: [n1.coordinates[0] + 30*i, n1.coordinates[1]]
    });
  }
  
  d3.select('body').selectAll(".digit")
    .remove();
  
  d3.select('body').selectAll(".digit")
    .data(data)
  .enter().append("div")
    .attr('class', 'digit draggable')
    .attr('data-index', function(d){ return d.id; })
    .style(transform, function(d) { return "translate(" + d.coordinates[0] + "px," + d.coordinates[1] + "px)"; })
    .text(function(d){ return d.digit; })
    .style("color", function(d) { return color(d.digit); })
    .call(drag);
}