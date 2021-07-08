
/* Ideas:
 *  + Provide option for game mode to wrap around screen borders.
 *  + Provide option for map generation to surround map by waters (continents only).
 *
 */

/* Resources:
 *  + Color picker: https://www.w3schools.com/colors/colors_picker.asp
 */

var xs = 30; // Small map.
var ys = 15;

// var xs = 40; // Medium map.
// var ys = 20;

// var xs = 50; // Large map.
// var ys = 25;

var maxWidth = window.innerWidth;
var maxHeight = window.innerHeight;

const BLACK = '#000';
const WHITE = '#fff';
const RED = '#f00';
const GREEN = '#0f0';
const YELLOW = '#ff0';
const DARK_GREEN = '#070';
const BROWN = '#630';
const BLUE = '#00f';

const WATER = BLUE;
const LAND = GREEN;
const MOUNTAIN = DARK_GREEN;
const HIGH_MOUNTAIN = BROWN;
const BEACH = YELLOW;
const SNOW = WHITE;

const quota = 0.4;
const MIN_DILATION = 1;
const MIN_EROSION = 2;

var start = 0.00;
var left = 0.33;
var half = 0.50;
var rite = 0.66;
var maxx = 0.99;

var points = [
  [left, start],
  [rite, start],
  [maxx, half],
  [rite, maxx],
  [left, maxx],
  [start, half],
];
var offsetX = maxWidth / xs;
var factor = 1;
var stateArray = Array.from(Array(xs), () => new Array(ys))

var full = 0xfff;
var limit = full / 3;
var offsetY = offsetX * factor;
var diff = offsetX - offsetY;
var canvas = document.getElementById('canvas');
canvas.width = maxWidth;
canvas.height = maxHeight;
var ctx = canvas.getContext('2d');
ctx['imageSmoothingEnabled'] = false; // standard
ctx['oImageSmoothingEnabled'] = false; // opera
ctx['webkitImageSmoothingEnabled'] = false; // safari
ctx['msImageSmoothingEnabled'] = false; // IE

function randomNum() {
  var randomVal = Math.random();
  if (randomVal > quota) {
    return LAND;
  } else {
    return WATER;
  }
}

function drawHexagon(shape, i, j) {
  for (const point of points) {
    var shift = 0
    if (i % 2 == 0) {
      shift = 0.5 * offsetX
    }
    var distanceI = i * offsetX;
    var distanceJ = j * offsetY;
    var lengthI = point[0] * offsetX + distanceI
    var lengthJ = point[1] * offsetY + distanceJ + shift
    lengthI = lengthI - (0.33 * offsetX * i) // Contract in x direction.
    shape.lineTo(lengthI, lengthJ);
  }
}

function drawHexagonWithinContext(i, j) {
  ctx.fillStyle = stateArray[i][j];
  const shape = new Path2D();
  drawHexagon(shape, i, j);
  canvas.addEventListener('mousemove',
    function(event) {
      // Check whether point is inside circle
      if (ctx.isPointInPath(shape, event.offsetX, event.offsetY)) {
        ctx.fillStyle = GREEN;
      }
      else {
        ctx.fillStyle = RED;
      }
    }
  );
  // ctx.strokeStyle = BLACK; // TODO: fix margin.
  ctx.fill(shape);
}

function countColor(arr, color) {
  var count = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == color) {
      count++;
    }
  }
  return count;
}

// . . . . . . . . . . . . . . . . . . . . .
// .                                       .
// .  NOTE: with xs == arr.length          .
// .        and  ys == arr[0].length       .
// .                                       .
// . . . . . . . . . . . . . . . . . . . . .
// .                                       .
// .                 i in xs               .
// .            ___________________        .
// .           /                   \       .
// .               0     1     2           .
// .                                       .
// .      /            +---+       +       .
// .     |            /     \     /        .
// .     |       +---+   B   +---+         .
// .     |      /     \     /     \        .
// .  j  |  0  +   A   +---+   C   +       .
// .     |      \     /=====\     /        .
// .  in |       +---+=(i,j)=+---+         .
// .     |      /=====\=====/=====\        .
// .  ys |  1  +===F===+---+===D===+       .
// .     |      \=====/     \=====/        .
// .     |       +---+   E   +---+         .
// .     |      /     \     /     \        .
// .      \ 2  +       +---+       +       .
// .                                       .
// .                 i in xs               .
// .            _________________________  .
// .           /                         \ .
// .               0     1     2     3     .
// .                                       .
// .      /            +---+       +---+   .
// .     |            /     \     /     \  .
// .     |       +---+       +---+       + .
// .     |      /     \     /     \     /  .
// .  j  |  0  +       +---+   V   +---+   .
// .     |      \     /=====\     /=====\  .
// .  in |       +---+===U===+---+===W===+ .
// .     |      /=====\=====/=====\=====/  .
// .  ys |  1  +=======+---+=(i,j)=+---+=  .
// .     |      \=====/     \=====/     \  .
// .     |       +---+   Z   +---+   X   + .
// .     |      /     \     /     \     /  .
// .     |  2  +       +---+   Y   +---+   .
// .     |      \     /=====\     /=====\  .
// .     \       +---+=======+---+=======+ .
// .            /=====\=====/=====\=====/  .
// .                                       .
// . . . . . . . . . . . . . . . . . . . . .

function getAdjacentHexes(i, j, arr) {
  var hasSpaceTop = j - 1 >= 0;
  var hasSpaceLeft = i - 1 >= 0;
  var hasSpaceBottom = j + 1 < arr[0].length;
  var hasSpaceRight = i + 1 < arr.length;
  var outArr = [];
  if ((i % 2) == 1) {
    if (hasSpaceTop && hasSpaceLeft) {     // A
      outArr.push(arr[i - 1][j - 1]);
    }
    if (hasSpaceTop) {                     // B
      outArr.push(arr[i][j - 1]);
    }
    if (hasSpaceTop && hasSpaceRight) {    // C
      outArr.push(arr[i + 1][j - 1]);
    }
    if (hasSpaceRight) {                   // D
      outArr.push(arr[i + 1][j]);
    }
    if (hasSpaceBottom) {                  // E
      outArr.push(arr[i][j + 1]);
    }
    if (hasSpaceLeft) {                    // F
      outArr.push(arr[i - 1][j]);
    }
    return outArr;
  } else {
    if (hasSpaceLeft) {                    // U
      outArr.push(arr[i - 1][j]);
    }
    if (hasSpaceTop) {                     // V
      outArr.push(arr[i][j - 1]);
    }
    if (hasSpaceRight) {                   // W
      outArr.push(arr[i + 1][j]);
    }
    if (hasSpaceBottom && hasSpaceRight) { // X
      outArr.push(arr[i + 1][j + 1]);
    }
    if (hasSpaceBottom) {                  // Y
      outArr.push(arr[i][j + 1]);
    }
    if (hasSpaceBottom && hasSpaceLeft) {  // Z
      outArr.push(arr[i - 1][j + 1]);
    }
    return outArr;
  }
}

function eliminateOnCount(arr, mainColor, adjacentColor, count, newColor) {
  var hadChange = 0;
  var changeArray = Array.from(Array(arr.length), () => new Array(arr[0].length))
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[0].length; j++) {
      if (arr[i][j] == mainColor) {
        var adjacents = getAdjacentHexes(i, j, arr);
        if (countColor(adjacents, adjacentColor) == count) {
          changeArray[i][j] = 1;
          hadChange = 1;
        }
      }
    }
  }
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[0].length; j++) {
      if (changeArray[i][j] == 1) {
        stateArray[i][j] = newColor;
      }
    }
  }
  return hadChange;
}

for (var i = 0; i < xs; i++) {
  for (var j = 0; j < ys; j++) {
    var state = randomNum();
    stateArray[i][j] = state;
    drawHexagonWithinContext(i, j);
  }
}

function eliminateUntilNoFurtherChange(arr, mainColor, adjacentColor, count, newColor) {
  var hadChange;
  hadChange = 1;
  while (hadChange) {
    hadChange = eliminateOnCount(arr, mainColor, adjacentColor, count, newColor);
  }
}

// Eliminate land touching map boundies.
for (var i = 0; i < xs; i++) {
  stateArray[i][stateArray[0].length - 1] = WATER;
  stateArray[i][0] = WATER;
}
for (var j = 0; j < ys; j++) {
  stateArray[stateArray.length - 1][j] = WATER;
  stateArray[0][j] = WATER;
}


eliminateOnCount(stateArray, LAND, WATER, 6, WATER);
eliminateOnCount(stateArray, LAND, WATER, 5, WATER);
eliminateUntilNoFurtherChange(stateArray, WATER, LAND, 5, LAND);
eliminateUntilNoFurtherChange(stateArray, WATER, LAND, 6, LAND);
eliminateUntilNoFurtherChange(stateArray, LAND, LAND, 1, WATER);
eliminateUntilNoFurtherChange(stateArray, LAND, LAND, 0, WATER);
eliminateUntilNoFurtherChange(stateArray, LAND, LAND, 6, MOUNTAIN);
eliminateUntilNoFurtherChange(stateArray, LAND, WATER, 4, BEACH);
eliminateUntilNoFurtherChange(stateArray, LAND, BEACH, 2, BEACH);
eliminateUntilNoFurtherChange(stateArray, MOUNTAIN, MOUNTAIN, 6, HIGH_MOUNTAIN);
eliminateOnCount(stateArray, HIGH_MOUNTAIN, HIGH_MOUNTAIN, 5, SNOW);

for (var i = 0; i < xs; i++) {
  for (var j = 0; j < ys; j++) {
    drawHexagonWithinContext(i, j);
  }
}

function getIndexesFromCoords(x, y) {
  var i = -1;
  var j = -1;
  return [i, j];
}

function printMousePos(event) {
  var x = event.clientX;
  var y = event.clientY;
  var indexes = getIndexesFromCoords(x, y);
  var i = indexes[0];
  var j = indexes[1];
  stateArray[i][j] = RED;
}

document.addEventListener("click", printMousePos);

