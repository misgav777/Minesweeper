'use strict'

const MINE = '💣';
const MARK = '🚩';
const EMPTY = '';
const LIFE = '💛';

var gClickCount = 0;
var gGameInterval = null;
var gStartingTime;
var gBoard;
var gLevel = {
  size: 4,
  mines: 2
}
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
};

function initGame() {
  gBoard = buildBoard(gLevel.size)
  // addMines(gBoard)
  renderBoard(gBoard, '.board-container')
  console.log(gBoard);
};

function buildBoard(boardSize) {
  var board = [];
  for (var i = 0; i < boardSize; i++) {
    board.push([]);
    // console.log(row);
    for (var j = 0; j < boardSize; j++) {
      board[i][j] = {
        minesAroundCount: '',
        isShown: false,
        isMine: false,
        isMarked: false
      }
    }
  }
  for (var i = 0; i < gLevel.mines; i++) {
    var idxi = getRandomInt(0, gLevel.size);
    var idxj = getRandomInt(0, gLevel.size);
    // console.log(`i`);
    console.log(`this is i: ${idxi}`);
    console.log(`    this is j: ${idxj}`);
    if (!board[idxi][idxj].isMine) board[idxi][idxj].isMine = true;

  }

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      board[i][j].minesAroundCount = setMinesNegsCount(i, j, board);
    }
  }
  return board
}

function renderBoard(mat, selector) {
  var strHTML = '<table border="1" align="center"><tbody>'
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      if (cell.isMine) {
        strHTML += `<td class="cell cell-${i}-${j}" id="mine" data-i="${i}" data-j="${j}" 
          data-inside="${MINE}" onclick="cellClicked(this,${i},${j})" 
          oncontextmenu=" markFlag(this, ${i},${j})">
          ${EMPTY}</td>`
      } else {
        strHTML += `<td class="cell cell-${i}-${j}" id="num"
           data-i="${i}" data-j="${j}" data-inside="${setMinesNegsCount(i, j, gBoard)}"
          onclick="cellClicked(this,${i},${j})" oncontextmenu=" cellMarked(this, ${i},${j})">
          ${EMPTY}</td>`;
      }
    }
    strHTML += '<tr>'
  }
  strHTML += `</table></tbody>`
  document.querySelector(selector).innerHTML = strHTML;
}


function setMinesNegsCount(cellI, cellJ, board) {
  var negsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j > board[i].length - 1) continue;
      if (i === cellI && j === cellJ) continue;
      if (board[i][j].isMine) negsCount++;
    }
  }
  return negsCount;
}


function cellClicked(elCell) {
  gClickCount++;
  if (gClickCount === 1) {
    timer();
    gGame.isOn = true;
  }
  var i = elCell.getAttribute('data-i');
  var j = elCell.getAttribute('data-j');
  var inside = elCell.getAttribute('data-inside');

  elCell.innerText = inside;
 
  if (inside === MINE) {
    showAllMines(i, j);
    document.querySelector('.game button').innerText = '😥';
    gGame.isOn = false;
    clearInterval
  } else if (+inside === 0) {
    expandShown(i, j);
  } else {
    gBoard[i][j].isShown = true;
    gGame.shownCount++;
  }
  checkGameOver();
}


function cellMarked(elCell) {
  var i = elCell.getAttribute('data-i');
  var j = elCell.getAttribute('data-j');
  if (gBoard[i][j].isMine) {
    elCell.innerText = MARK;
    gBoard[i][j].isMarked = true;
    gGame.markedCount++;
  }
  if (!gBoard[i][j].isMarked) {
    elCell.innerText = MARK;
    gBoard[i][j].isMarked = true;

  }
  checkGameOver();
};

function showAllMines(iIdx, jIdx) {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine && i !== iIdx && j !== jIdx) {
        document.querySelector(`[data-i="${i}"][data-j="${j}"]`).innerText = MINE;
      }
    }
  }
  clearInterval(gGameInterval);
  gGame.isOn = false;
}

function checkGameOver() {
  var count = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
        count++;
      }
    }
  }
  console.log(count);
  if (count === gLevel.mines) {
    clearInterval(gGameInterval);
    gGame.isOn = false;
  }
};


function expandShown(idxi, idxj) {
  for (var i = idxi - 1; i <= idxi + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = idxj - 1; j <= idxj + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (!gBoard[i][j].isMine) {
        var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
        elCell.innerText = elCell.getAttribute('data-inside');
        gBoard[i][j].isShown = true;
        gGame.shownCount++;
      }
    }
  }
  checkGameOver();

};


function restartGame() {
  clearInterval(gGameInterval);
  document.querySelector('.game button').innerText = '😀';
  document.querySelector('.timer').innerText = '00:00';
  gGameInterval = null;
  gGame.markedCount = 0;
  gClickCount = 0;
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  gGame.secsPassed = 0;
  initGame();
}

function changeLevel(elBtn) {
  gLevel.size = +elBtn.getAttribute('data-level');
  gLevel.mines = changeMines(gLevel.size);
  restartGame();
}

function changeMines(level) {
  if (level === 4) {
    return 2;
  } else if (level === 8) {
    return 12;
  } else if (level === 12) {
    return 30;
  }
}


