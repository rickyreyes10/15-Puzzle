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
        this.toggleMusicButton.addEventListener('click', () => this.toggleMusic());



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