"use strict";

class fifteenPuzzle { //class for the fifteen puzzle game
    constructor() { //constructor for the fifteen puzzle game class which is called when an instance of the class is created
        //this constructor is used to initialize the properties of the

        //properties represent the size of the board, the number of tiles, and the position of the empty space
        this.BOARD_SIZE = 4;
        this.TILE_COUNT = 15;
        this.emptyPos = { row: 3, col: 3 }; //bottom right initially

        //properties to keep track of the game state
        this.moveCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.bestTime = localStorage.getItem('bestTime') || null;
        this.bestMoves = localStorage.getItem('bestMoves') || null;
        this.isMusicPlaying = false;
        this.defaultVolume = 0.3; // 30% volume by default

        //bind event handlers where bind is used to ensure that the methods have the correct context when they are called
        this.handleTileClick = this.handleTileClick.bind(this); //bind the handleTileClick method to the this object so it can be used in the event listener
        this.handleMouseOver = this.handleMouseOver.bind(this); //bind the handleMouseOver method to the this object so it can be used in the event listener
        this.handleMouseOut = this.handleMouseOut.bind(this); //bind the handleMouseOut method to the this object so it can be used in the event listener

        //initialize when DOM is loaded where the initialize method is called
        document.addEventListener('DOMContentLoaded', () => { //event listener for when the DOM is loaded
            this.initialize(); //call the initialize method
        });
    }

    //helper method to initialize the game
    initialize() {
        //create DOM elements
        this.gameBoard = document.getElementById('gameBoard'); //get the game board DOM element
        this.shuffleButton = document.getElementById('shuffleButton'); //get the shuffle button DOM element

        //set up event listeners
        this.shuffleButton.addEventListener('click', () => this.shuffle()); //event listener for when the shuffle button is clicked


        //DOM elements to display the move count, timer, best time, and best moves
        this.moveCounter = document.getElementById('moveCounter');
        this.timerDisplay = document.getElementById('timer');
        this.bestTimeDisplay = document.getElementById('bestTime');
        this.bestMovesDisplay = document.getElementById('bestMoves');


        //DOM elements to control the music
        this.music = document.getElementById('backgroundMusic');
        this.toggleMusicButton = document.getElementById('toggleMusic');
        this.volumeSlider = document.getElementById('volumeSlider');

        // Set initial volume
        this.music.volume = this.defaultVolume;

        // Add event listeners for audio controls
        this.toggleMusicButton.addEventListener('click', () => this.toggleMusic());
        this.volumeSlider.addEventListener('input', () => {
            this.music.volume = this.volumeSlider.value / 100;
        });


        this.updateBestScores(); //update the best scores
        this.createBoard(); //create the initial board
        this.resetStats(); //reset the stats
    }

    //helper method to reset the stats
    resetStats() {
        // Reset move counter
        this.moveCount = 0;
        this.moveCounter.textContent = '0';

        // Reset and start timer
        clearInterval(this.timerInterval);
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    //helper method to update the timer
    updateTimer() {
        const seconds = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.timerDisplay.textContent =
            `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    //helper method to create the initial board
    createBoard() {
        //clear any existing tiles
        this.gameBoard.innerHTML = ''; //clear the game board

        //create and position tiles
        for (let row = 0; row < this.BOARD_SIZE; row++) { //loop through the rows of the board
            for (let col = 0; col < this.BOARD_SIZE; col++) { //loop through the columns of the board
                //skip the last tile (bottom-right) as its the empty space initially
                if (row === this.BOARD_SIZE - 1 && col === this.BOARD_SIZE - 1) { //if the current tile is the bottom-right tile (empty space), skip it
                    continue;
                }

                //create tile DOM element
                const tile = document.createElement('div'); //create a new div element for the tile
                const number = row * this.BOARD_SIZE + col + 1; //calculate the number to display on the tile

                //set tile properties
                tile.className = 'tile'; //set the class name for the tile which would be used for styling
                tile.id = `square_${row}_${col}`; //set the ID for the tile which would be used for identification
                tile.textContent = number; //set the text content for the tile which would be the number

                // Add animation delay based on tile number
                tile.style.setProperty('--tile-index', number); //set the tile index property for the tile which would be used for the animation delay.. --tile-index is a custom property that we're setting for the tile and we're setting it to the number of the tile

                //position tile
                tile.style.left = (col * 100) + 'px'; //set the left position of the tile which is the column number times 100 pixels because each tile is 100px wide
                tile.style.top = (row * 100) + 'px'; //set the top position of the tile which is the row number times 100 pixels because each tile is 100px high

                //set background position
                //negative values b/c we're moving the background "behind" the window
                tile.style.backgroundPosition = `${-col * 100}px ${-row * 100}px`; //set the background position of the tile which is the negative of the column number times 100 pixels and the negative of the row number times 100 pixels because we're moving the background "behind" the window

                //event listeners
                tile.addEventListener('click', this.handleTileClick); //event listener for when tile is clicked
                tile.addEventListener('mouseover', this.handleMouseOver); //event listener for when mouse hovers over tile
                tile.addEventListener('mouseout', this.handleMouseOut); //event listener for when mouse leaves tile

                //add tile to board
                this.gameBoard.appendChild(tile); //add the tile to the game board
            }
        }
    }


    //helper method to update background position when tiles move
    updateTileBackground(tile, row, col) {
        tile.style.backgroundPosition = `${-col * 100}px ${-row * 100}px`; //set the background position of the tile which is the negative of the column number times 100 pixels and the negative of the row number times 100 pixels because we're moving the background "behind" the window
    }

    //event handler for when a tile is clicked
    handleTileClick(event) {
        const tile = event.target; //get the tile DOM element that was clicked
        const [row, col] = tile.id.split('_').slice(1).map(Number); //extract row and col from tile ID and convert to numbers to store to variables row and col

        //check if clicked tile is adjacent to empty space so it can move
        if (this.isAdjacent(row, col)) {
            this.moveTile(row, col); //move tile to empty space
        }
    }

    //helper method to move tile to empty space
    moveTile(row, col, isShuffling = false) {
        //get the tile DOM element
        const tile = this.getTile(row, col);
        if (!tile) { //if tile doesn't exist, return
            return;
        }

        //store old position for background update
        const oldRow = row; //store the old row position of the tile that was moved
        const oldCol = col; //store the old column position of the tile that was moved

        //update tile position
        tile.style.left = (this.emptyPos.col * 100) + 'px'; //set the left position of the tile which is the column number times 100 pixels because each tile is 100px wide
        tile.style.top = (this.emptyPos.row * 100) + 'px'; //set the top position of the tile which is the row number times 100 pixels because each tile is 100px high

        //update tile ID to reflect new position
        tile.id = `square_${this.emptyPos.row}_${this.emptyPos.col}`; //update the ID of the tile to the new position which is the row number and the column number of the empty space

        //update background position for new location
        this.updateTileBackground(tile, this.emptyPos.row, this.emptyPos.col); //update the background position of the tile to the new position

        //update empty space position
        this.emptyPos = { row: oldRow, col: oldCol }; //update the empty space position to the old position of the tile that was moved

        //update movable pieces styling
        this.updateMovableStates(); //update the styling of the movable pieces

        // Only increment move counter if this is a player move (not shuffling)
        if (!isShuffling) {
            this.moveCount++;
            this.moveCounter.textContent = this.moveCount;

            // Check for win
            if (this.checkWin()) {
                this.handleWin();
            }
        }
    }

    //helper method to check if the game is won
    checkWin() { //this method is used to check if the game is won by checking if the tiles are in the correct order by comparing the text content of the tiles to the expected numbers
        for (let row = 0; row < this.BOARD_SIZE; row++) { //loop through the rows of the board      
            for (let col = 0; col < this.BOARD_SIZE; col++) { //loop through the columns of the board
                if (row === this.BOARD_SIZE - 1 && col === this.BOARD_SIZE - 1) { //if the current tile is the bottom-right tile (empty space), skip it
                    continue; // Skip empty space
                }
                const tile = this.getTile(row, col); //get the tile DOM element at the current row and column
                const expectedNumber = row * this.BOARD_SIZE + col + 1; //calculate the expected number for the tile at the current row and column
                if (!tile || parseInt(tile.textContent) !== expectedNumber) { //if the tile doesn't exist or the tile's text content is not equal to the expected number, return false
                    return false;
                }
            }
        }
        return true;
    }

    //helper method to handle the win
    handleWin() {
        clearInterval(this.timerInterval);
        const finalTime = Math.floor((Date.now() - this.startTime) / 1000);

        if (!this.bestTime || finalTime < parseInt(this.bestTime)) {
            this.bestTime = finalTime;
            localStorage.setItem('bestTime', finalTime);
        }
        if (!this.bestMoves || this.moveCount < parseInt(this.bestMoves)) {
            this.bestMoves = this.moveCount;
            localStorage.setItem('bestMoves', this.moveCount);
        }

        this.updateBestScores();

        const overlay = document.createElement('div');
        overlay.className = 'win-overlay';

        const message = document.createElement('div');
        message.className = 'win-message';
        message.innerHTML = `
            <h2>Congratulations!</h2>
            <p>Puzzle Completed</p>
            <p>Moves: ${this.moveCount}</p>
            <p>Time: ${Math.floor(finalTime / 60)}:${(finalTime % 60).toString().padStart(2, '0')}</p>
            <button onclick="location.reload()">Close</button>
        `;

        overlay.appendChild(message);
        document.body.appendChild(overlay);
    }

    updateBestScores() { //this method is used to update the best scores by displaying the best time and best moves
        this.bestTimeDisplay.textContent = this.bestTime ? //if the best time exists, display it in the format of minutes and seconds, otherwise display '-'
            `${Math.floor(this.bestTime / 60)}:${(this.bestTime % 60).toString().padStart(2, '0')}` :
            '-';
        this.bestMovesDisplay.textContent = this.bestMoves || '-'; //if the best moves exists, display it, otherwise display '-'
    }

    //helper method to toggle the music on and off
    toggleMusic() { //this method is used to toggle the music on and off
        if (this.isMusicPlaying) { //if the music is playing, pause it
            this.music.pause(); //pause the music
            this.toggleMusicButton.textContent = '🔈'; //change the text content of the toggle music button to the mute icon
        } else { //if the music is not playing, play it
            this.music.play(); //play the music
            this.toggleMusicButton.textContent = '🔊'; //change the text content of the toggle music button to the unmute icon
        }
        this.isMusicPlaying = !this.isMusicPlaying; //toggle the music playing state
    }


    //helper method to update movable piece styling when tiles move after a tile is clicked to move into the empty space
    updateMovableStates() { //this is necessary b/c we need to remove the moveable piece class from all tiles to start fresh so that we can add the moveable piece class to the new adjacent tiles after the tile is moved into the empty space
        //remove movable piece class from all tiles
        const tiles = document.querySelectorAll('.tile'); //get all the tiles DOM elements
        tiles.forEach(tile => { //loop through all the tiles
            tile.classList.remove('moveablepiece'); //remove the movable piece class from all tiles
        });

        //add moveablepiece class to adjacent tiles
        for (let row = 0; row < this.BOARD_SIZE; row++) { //loop through the rows of the board
            for (let col = 0; col < this.BOARD_SIZE; col++) { //loop through the columns of the board
                const tile = this.getTile(row, col); //get the tile DOM element at the current row and column
                if (tile && this.isAdjacent(row, col)) { //if the tile exists and is adjacent to the empty space, add the movable piece class to the tile
                    tile.classList.add('moveablepiece'); //add the movable piece class to the tile
                }
            }
        }
    }

    //event handler for mouseover when hovering over a tile that can be moved
    handleMouseOver(event) {
        const tile = event.target; //get the tile DOM element that was hovered over
        const [row, col] = tile.id.split('_').slice(1).map(Number); //extract row and col from tile ID and convert to numbers to store to variables row and col

        if (this.isAdjacent(row, col)) { //if the tile is adjacent to the empty space, add the movable piece class to the tile
            tile.classList.add('moveablepiece'); //add the movable piece class to the tile
        }
    }

    //helper method to remove movable piece class when mouse leaves a tile
    handleMouseOut(event) {
        const tile = event.target; //get the tile DOM element that was hovered over
        tile.classList.remove('moveablepiece'); //remove the movable piece class from the tile
    }


    //helper method to get tile at specific position
    //tile access
    getTile(row, col) {
        return document.getElementById(`square_${row}_${col}`); //get the tile DOM element at the specific row and column
    }

    //helper method to check if position is adjacent to empty space
    //move validation
    isAdjacent(row, col) {
        return (
            (Math.abs(row - this.emptyPos.row) === 1 && col === this.emptyPos.col) || //if the row difference is 1 and the column is the same as the empty space, return true this means the tile is adjacent to the empty space horizontally
            (Math.abs(col - this.emptyPos.col) === 1 && row === this.emptyPos.row) //if the column difference is 1 and the row is the same as the empty space, return true this means the tile is adjacent to the empty space vertically
        );
    }

    //helper method to shuffle the board
    shuffle() {
        //number of random moves to perform to shuffle the board
        const moves = 200;

        //disable shuffle button during animation
        this.shuffleButton.disabled = true;

        // Reset stats for new game
        this.resetStats();

        //perform moves with slight delay to show animation
        let shuffleCount = 0;
        const shuffleInterval = setInterval(() => { //set interval to make random moves with a slight delay to show animation
            this.makeRandomMove(true); //make a random move
            shuffleCount++;

            //stop after desired number of moves
            if (shuffleCount >= moves) { //if the move count is greater than or equal to the desired number of moves, stop the interval
                clearInterval(shuffleInterval); //clear the interval
                this.shuffleButton.disabled = false; //enable the shuffle button
            }
        }, 5); //small delay between moves
    }

    //helper method to make a random move
    makeRandomMove(isShuffling = false) { //this method is used to make a random move on the board
        //get all possible moves
        const validMoves = this.getValidMoves(); //get all the valid moves

        //select random move from valid moves
        if (validMoves.length > 0) { //if there are valid moves, select a random move
            const randomIndex = Math.floor(Math.random() * validMoves.length); //select a random index from the valid moves
            const { row, col } = validMoves[randomIndex]; //get the row and column of the random move
            this.moveTile(row, col, isShuffling); //move the tile to the random position
        }
    }

    //helper method to get all valid moves for the empty space
    //this method is used to get all the valid moves for the empty space so that we can make a random move from the valid moves
    //constraints: the move must be within the board boundaries and the move must be adjacent to the empty space
    getValidMoves() {
        const validMoves = []; //initialize valid moves array to store the valid moves

        //check all four possible directions
        const directions = [ //array of all the possible directions as objects with row and col properties
            { row: -1, col: 0 },  // up.. negative row value means moving up by 1 row since we can only move by 1 tile at a time 
            { row: 1, col: 0 },   // down.. positive row value means moving down by 1 row since we can only move by 1 tile at a time        
            { row: 0, col: -1 },  // left.. negative column value means moving left by 1 column since we can only move by 1 tile at a time
            { row: 0, col: 1 }    // right.. positive column value means moving right by 1 column since we can only move by 1 tile at a time
        ];

        //this loop checks all four possible directions to see if the move is valid
        for (const dir of directions) { //loop through all the possible directions

            //these are the new positions if the empty space moves in the direction of the current direction... only will be valid if the new position is within the board boundaries
            const newRow = this.emptyPos.row + dir.row; //this is the new row position if the empty space moves in the direction of the current direction
            const newCol = this.emptyPos.col + dir.col; //this is the new column position if the empty space moves in the direction of the current direction

            //check if move is within board boundaries
            if (newRow >= 0 && newRow < this.BOARD_SIZE && newCol >= 0 && newCol < this.BOARD_SIZE) { //if the new position is within the board boundaries, add it to the valid moves array
                validMoves.push({ row: newRow, col: newCol }); //add the new position to the valid moves array
            }
        }

        return validMoves;
    }

    //helper method to reset the gameboard/show correct order
    resetGame() {
        // Clear the board
        this.gameBoard.innerHTML = '';

        // Reset empty position
        this.emptyPos = { row: 3, col: 3 };

        // Recreate board with animations
        this.createBoard();
    }

}




//create instance of the game
const game = new fifteenPuzzle();