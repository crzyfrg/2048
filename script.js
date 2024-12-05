class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.startTime = null;
        this.timerInterval = null;
        
        // DOM elements
        this.gameContainer = document.querySelector('.grid-container');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.modal = document.getElementById('gameOverModal');
        this.modalTitle = document.getElementById('gameOverTitle');
        this.modalMessage = document.getElementById('gameOverMessage');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.finalTimeDisplay = document.getElementById('finalTime');
        this.restartButton = document.getElementById('restartButton');
        this.quitButton = document.getElementById('quitButton');
        this.newGamePrompt = document.getElementById('newGamePrompt');
        this.confirmNewGame = document.getElementById('confirmNewGame');
        this.cancelNewGame = document.getElementById('cancelNewGame');
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Clear the grid
        this.gameContainer.innerHTML = '';
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        
        // Reset game state
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Update displays
        this.updateScore();
        this.resetTimer();
        
        // Hide modals
        this.modal.style.display = 'none';
        this.newGamePrompt.style.display = 'none';

        // Create grid cells
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            this.gameContainer.appendChild(cell);
        }

        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();

        // Enable keyboard controls
        document.addEventListener('keydown', this.handleInput.bind(this));
    }

    setupEventListeners() {
        // Remove any existing event listeners
        document.removeEventListener('keydown', this.handleInput.bind(this));
        
        // Add event listeners
        document.addEventListener('keydown', this.handleInput.bind(this));
        this.restartButton.addEventListener('click', () => this.init());
        
        // Quit button handler
        this.quitButton.addEventListener('click', () => {
            if (this.gameStarted && !this.gameOver) {
                this.newGamePrompt.style.display = 'flex';
            } else {
                this.init();
            }
        });

        // Confirm new game
        this.confirmNewGame.addEventListener('click', () => {
            this.newGamePrompt.style.display = 'none';
            this.init();
        });

        // Cancel new game
        this.cancelNewGame.addEventListener('click', () => {
            this.newGamePrompt.style.display = 'none';
        });
    }

    startTimer() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                const currentTime = Date.now();
                const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
                const minutes = Math.floor(elapsedTime / 60);
                const seconds = elapsedTime % 60;
                this.timerDisplay.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }
    }

    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerDisplay.textContent = '00:00';
        this.startTime = null;
        this.gameStarted = false;
    }

    showGameOverModal(won = false) {
        this.modalTitle.textContent = won ? 'Congratulations!' : 'Game Over!';
        this.modalMessage.textContent = won ? 
            'You reached 2048! Amazing job!' : 
            'No more moves available. Try again!';
        this.finalScoreDisplay.textContent = this.score;
        this.finalTimeDisplay.textContent = this.timerDisplay.textContent;
        this.modal.style.display = 'flex';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleInput(event) {
        if (this.gameOver) return;

        let moved = false;
        
        switch(event.key) {
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
            default:
                return;
        }

        if (moved) {
            this.startTimer();
            this.addRandomTile();
            this.updateScore();
            
            // Check for win
            if (this.hasWon()) {
                this.gameOver = true;
                this.showGameOverModal(true);
                return;
            }
            
            // Check for game over
            if (this.isGameOver()) {
                this.gameOver = true;
                this.showGameOverModal(false);
            }
        }
    }

    move(moveFunction, isVertical = false) {
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(this.grid));

        for (let i = 0; i < this.gridSize; i++) {
            const line = isVertical 
                ? this.grid.map(row => row[i])
                : [...this.grid[i]];
            
            const newLine = moveFunction(line);

            if (JSON.stringify(line) !== JSON.stringify(newLine)) {
                moved = true;
                if (isVertical) {
                    for (let j = 0; j < this.gridSize; j++) {
                        this.grid[j][i] = newLine[j];
                    }
                } else {
                    this.grid[i] = newLine;
                }
            }
        }

        if (moved) {
            this.renderGrid();
        }

        return moved;
    }

    moveLeft() {
        return this.move(row => {
            const newRow = row.filter(cell => cell !== 0);
            for (let i = 0; i < newRow.length - 1; i++) {
                if (newRow[i] === newRow[i + 1]) {
                    newRow[i] *= 2;
                    this.score += newRow[i];
                    newRow.splice(i + 1, 1);
                }
            }
            while (newRow.length < this.gridSize) newRow.push(0);
            return newRow;
        });
    }

    moveRight() {
        return this.move(row => {
            const newRow = row.filter(cell => cell !== 0);
            for (let i = newRow.length - 1; i > 0; i--) {
                if (newRow[i] === newRow[i - 1]) {
                    newRow[i] *= 2;
                    this.score += newRow[i];
                    newRow.splice(i - 1, 1);
                    i--;
                }
            }
            while (newRow.length < this.gridSize) newRow.unshift(0);
            return newRow;
        });
    }

    moveUp() {
        return this.move(col => {
            const newCol = col.filter(cell => cell !== 0);
            for (let i = 0; i < newCol.length - 1; i++) {
                if (newCol[i] === newCol[i + 1]) {
                    newCol[i] *= 2;
                    this.score += newCol[i];
                    newCol.splice(i + 1, 1);
                }
            }
            while (newCol.length < this.gridSize) newCol.push(0);
            return newCol;
        }, true);
    }

    moveDown() {
        return this.move(col => {
            const newCol = col.filter(cell => cell !== 0);
            for (let i = newCol.length - 1; i > 0; i--) {
                if (newCol[i] === newCol[i - 1]) {
                    newCol[i] *= 2;
                    this.score += newCol[i];
                    newCol.splice(i - 1, 1);
                    i--;
                }
            }
            while (newCol.length < this.gridSize) newCol.unshift(0);
            return newCol;
        }, true);
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
            this.renderTile(x, y, this.grid[x][y]);
        }
    }

    renderTile(x, y, value) {
        const cell = this.gameContainer.children[x * this.gridSize + y];
        const existingTile = cell.querySelector('.tile');
        
        if (existingTile) {
            if (value === 0) {
                cell.removeChild(existingTile);
            } else {
                existingTile.textContent = value;
                existingTile.className = `tile tile-${value}`;
            }
        } else if (value !== 0) {
            const tile = document.createElement('div');
            tile.textContent = value;
            tile.className = `tile tile-${value}`;
            cell.appendChild(tile);
        }
    }

    renderGrid() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.renderTile(i, j, this.grid[i][j]);
            }
        }
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
    }

    hasWon() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 2048) return true;
            }
        }
        return false;
    }

    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                if (
                    (j < this.gridSize - 1 && current === this.grid[i][j + 1]) ||
                    (i < this.gridSize - 1 && current === this.grid[i + 1][j])
                ) {
                    return false;
                }
            }
        }

        return true;
    }
}

// Start the game
const game = new Game2048();
