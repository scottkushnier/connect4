/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

/** placeInTable: update DOM to place piece into HTML table of board */



function placeInTable(y, x, player) {
  // console.log('place in table:', x, y);
  const piece = document.createElement('div');
  piece.classList.add('piece');
  piece.style.backgroundColor = player.color;
  // piece.style.top = -50 * (y + 2);   // vestigal code?
  const spot = document.getElementById(`spot-${y}-${x}`);
  spot.append(piece);
}

function Capitalize(str) {
  let cap = str[0].toUpperCase() + str.slice(1).toLowerCase();
  return(cap);
}

class Player {
  constructor(color, index) {
    this.color = color;
    this.index = index;         // will fill board with numbers, not players
  }
}

class Game {

  constructor(height, width, color1, color2) {
    this.width = width;
    this.height = height;
    this.board = [];
    this.makeBoard();
    this.makeHtmlBoard();
    this.gameOver = false;
    this.player1 = new Player(color1, 1);
    this.player2 = new Player(color2, 2);
    this.currentPlayer = this.player1;
    this.winCells = [];
    const showWinButton = document.querySelector('#show-win');
    showWinButton.style.visibility = 'hidden';
  }

  /** makeBoard: create in-JS board structure:
 *   board = array of rows, each row is array of cells  (board[y][x])
 */
  makeBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
  }

/** makeHtmlBoard: make HTML table and row of column tops. */
  makeHtmlBoard() {
    const board = document.getElementById('board');
  
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement('tr');
    top.setAttribute('id', 'column-top');
    top.addEventListener('click', this.handleClick.bind(this));
  
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement('td');
      headCell.setAttribute('id', x);
      top.append(headCell);
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.classList.add('header-piece');
      // piece.classList.add(`p1`);
      headCell.append(piece);
      // show color of next piece if hover over top square
      headCell.addEventListener('mouseover', function (e) {
        // console.log(this);
        // console.log('mouse over', `p${this.currPlayer}`)
        if (!this.gameOver) {
          piece.style.backgroundColor = this.currentPlayer.color;
        }
        // this.classList.add('p2');
      }.bind(this));
      headCell.addEventListener('mouseout', function (e) {
        // this.classList.remove('p2');
        piece.style.backgroundColor = null;
      }.bind(this));
    }
    board.append(top);
    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement('tr');
  
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('td');
        cell.setAttribute('id', `spot-${y}-${x}`);
        row.append(cell);
      }
      board.append(row);
    }
  }

  blinkCells(cells) {
    cells.forEach(function (cell) {
      const y = cell[0];
      const x = cell[1];
      const td = document.querySelector(`#spot-${y}-${x}`);
      const piece = td.querySelector('DIV');
      if (this.onWhite) {
        piece.style.backgroundColor = this.winColor;
      } else {
        piece.style.backgroundColor = 'white';
      }
    }.bind(this));
    this.onWhite = !this.onWhite;
    this.blinkCount++;
    if (this.blinkCount >= 15) {
      clearInterval(myInterval);
    }
  }

  showWin(cells) {
    const td = document.querySelector(`#spot-${cells[0][0]}-${cells[0][1]}`);
    const piece = td.querySelector('DIV');
    this.onWhite = true;
    this.winColor = piece.style.backgroundColor;
    this.blinkCount = 0;
    this.blinkCells(cells);
    myInterval = setInterval(function () {
      this.blinkCells(cells);
    }.bind(this), 200);
    const showWinButton = document.querySelector('#show-win');
    showWinButton.style.visibility = 'visible';
  }

  win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    const isAWin = cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < this.height &&
        x >= 0 &&
        x < this.width &&
        this.board[y][x] === this.currentPlayer.index
    );
    if (isAWin) {
      // console.log(cells);
      this.winCells = cells;
      this.showWin(cells);
    }
    return(isAWin);
  }
  
  /** checkForWin: check board cell-by-cell for "does a win start here?" */
  checkForWin() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
        // find winner (only checking each win-possibility as needed)
        if (this.win(horiz) || this.win(vert) || this.win(diagDR) || this.win(diagDL)) {
          return true;
        }
      }
    }
  }

  /** endGame: announce game end */
  endGame(msg) {
    this.gameOver = true;
    setTimeout(function () {         // give chance to show last disc before pop-up window
      alert(msg);
    }, 3000);
  }

  /** findSpotForCol: given column x, return top empty y (null if filled) */
  findSpotForCol(x) {
    // console.log('looking for spot for', x);
    for (let y = this.height - 1; y >= 0; y--) {
      if (!this.board[y][x]) {
        // console.log('spot', y);
        return y;
      }
    }
    return null;
  }

  /** handleClick: handle click of column top to play piece */
  handleClick(evt) {
    // get x from ID of clicked cell

    // disable click activity if game over
    if (this.gameOver) {
      return;
    }

    // console.log('this', this);
    // console.log('this color', this.player1.color);

    // if user just clicked, switch color on disc in play
    [...document.querySelectorAll('.header-piece')].forEach(function (piece) {
      if (piece.style.backgroundColor === this.player1.color) {
        piece.style.backgroundColor = this.player2.color;
      } else if (piece.style.backgroundColor === this.player2.color) {
        piece.style.backgroundColor = this.player1.color;
      }
    }.bind(this));

    let x = +evt.target.id;
    if (evt.target.tagName !== 'TD') {         // want TD element, not disc inside
      x = +evt.target.parentNode.id;
    }
  
    // get next spot in column (if none, ignore click)
    // console.log(this);
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }
  
    // place piece in board and add to HTML table
    this.board[y][x] = this.currentPlayer.index;
    placeInTable(y, x, this.currentPlayer);
    
    // check for win
    if (this.checkForWin()) {
      return this.endGame(`${Capitalize(this.currentPlayer.color)} player won!`);
    }
    
    // check for tie
    if (this.board.every(row => row.every(cell => cell))) {
      return this.endGame('Tie!');
    }
      
    // switch players
    this.currentPlayer = (this.currentPlayer === this.player1) ? this.player2 : this.player1;
  }
  
}

// let myGame = new Game(6, 7);

document.querySelector('#start-game').addEventListener('click', function () { 
  // remove board in DOM
  [...document.querySelectorAll('tr')].map(function (tr) { tr.remove()});
  // change button from 'Start Game' to 'New Game' after button pressed 1st time
  document.querySelector('#start-game').innerText = 'New Game!';
  // set color defaults for players
  if (!document.querySelector('#player-1-color').value) {
    document.querySelector('#player-1-color').value = 'crimson';
  }
  if (!document.querySelector('#player-2-color').value) {
    document.querySelector('#player-2-color').value = 'black';
  }
  // new game is on!
  myGame = new Game(6, 7, document.querySelector('#player-1-color').value, 
                          document.querySelector('#player-2-color').value);
  });


  let myInterval = null;

  document.querySelector('#show-win').addEventListener('click', function () {
    myGame.showWin(myGame.winCells);
  });

  