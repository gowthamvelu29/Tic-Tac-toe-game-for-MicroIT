document.addEventListener('DOMContentLoaded', () => {
            const board = document.getElementById('board');
            const cells = document.querySelectorAll('.cell');
            const statusDisplay = document.getElementById('status');
            const resetButton = document.getElementById('reset-game');
            const difficultySelect = document.getElementById('difficulty');
            const playerScoreDisplay = document.getElementById('player-score');
            const computerScoreDisplay = document.getElementById('computer-score');
            const tiesDisplay = document.getElementById('ties');
            
            let gameActive = true;
            let currentPlayer = 'X';
            let gameState = ['', '', '', '', '', '', '', '', ''];
            let playerScore = 0;
            let computerScore = 0;
            let ties = 0;
            
            const winningConditions = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6]             // diagonals
            ];
            
            function handleCellClick(clickedCellEvent) {
                const clickedCell = clickedCellEvent.target;
                const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
                
                if (gameState[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
                    return;
                }
                
                gameState[clickedCellIndex] = currentPlayer;
                clickedCell.textContent = currentPlayer;
                clickedCell.classList.add('x');
                
                checkGameResult();
                
                if (gameActive) {
                    currentPlayer = 'O';
                    statusDisplay.textContent = "Computer is thinking...";
                    
                    // Delay computer's move slightly to make it feel more natural
                    setTimeout(() => {
                        makeComputerMove();
                    }, 600);
                }
            }
            
            function makeComputerMove() {
                if (!gameActive) return;
                
                const difficulty = difficultySelect.value;
                let moveIndex;
                
                switch (difficulty) {
                    case 'easy':
                        moveIndex = getEasyMove();
                        break;
                    case 'medium':
                        moveIndex = Math.random() < 0.6 ? getMediumMove() : getEasyMove();
                        break;
                    case 'hard':
                        moveIndex = Math.random() < 0.8 ? getHardMove() : getMediumMove();
                        break;
                    case 'impossible':
                        moveIndex = getImpossibleMove();
                        break;
                }
                
                gameState[moveIndex] = 'O';
                cells[moveIndex].textContent = 'O';
                cells[moveIndex].classList.add('o');
                
                checkGameResult();
                
                if (gameActive) {
                    currentPlayer = 'X';
                    statusDisplay.textContent = "Your turn (X)";
                }
            }
            
            function getEasyMove() {
                // Random empty cell
                const emptyCells = gameState.reduce((acc, cell, idx) => {
                    if (cell === '') acc.push(idx);
                    return acc;
                }, []);
                
                return emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
            
            function getMediumMove() {
                // First check if computer can win in the next move
                for (let i = 0; i < gameState.length; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'O';
                        if (checkWinCondition('O')) {
                            gameState[i] = '';
                            return i;
                        }
                        gameState[i] = '';
                    }
                }
                
                // Then check if player can win in the next move and block
                for (let i = 0; i < gameState.length; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'X';
                        if (checkWinCondition('X')) {
                            gameState[i] = '';
                            return i;
                        }
                        gameState[i] = '';
                    }
                }
                
                // Otherwise, make a random move
                return getEasyMove();
            }
            
            function getHardMove() {
                // First check if computer can win in the next move
                for (let i = 0; i < gameState.length; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'O';
                        if (checkWinCondition('O')) {
                            gameState[i] = '';
                            return i;
                        }
                        gameState[i] = '';
                    }
                }
                
                // Then check if player can win in the next move and block
                for (let i = 0; i < gameState.length; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'X';
                        if (checkWinCondition('X')) {
                            gameState[i] = '';
                            return i;
                        }
                        gameState[i] = '';
                    }
                }
                
                // Try to take the center if it's free
                if (gameState[4] === '') {
                    return 4;
                }
                
                // Try to take corners
                const corners = [0, 2, 6, 8];
                const availableCorners = corners.filter(corner => gameState[corner] === '');
                if (availableCorners.length > 0) {
                    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
                }
                
                // Otherwise, make a random move
                return getEasyMove();
            }
            
            function getImpossibleMove() {
                // Use minimax algorithm for the best possible move
                let bestScore = -Infinity;
                let bestMove;
                
                for (let i = 0; i < gameState.length; i++) {
                    if (gameState[i] === '') {
                        gameState[i] = 'O';
                        let score = minimax(gameState, 0, false);
                        gameState[i] = '';
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = i;
                        }
                    }
                }
                
                return bestMove;
            }
            
            function minimax(board, depth, isMaximizing) {
                // Check terminal states
                if (checkWinCondition('O')) return 10 - depth;
                if (checkWinCondition('X')) return depth - 10;
                if (!board.includes('')) return 0;
                
                if (isMaximizing) {
                    let bestScore = -Infinity;
                    for (let i = 0; i < board.length; i++) {
                        if (board[i] === '') {
                            board[i] = 'O';
                            let score = minimax(board, depth + 1, false);
                            board[i] = '';
                            bestScore = Math.max(score, bestScore);
                        }
                    }
                    return bestScore;
                } else {
                    let bestScore = Infinity;
                    for (let i = 0; i < board.length; i++) {
                        if (board[i] === '') {
                            board[i] = 'X';
                            let score = minimax(board, depth + 1, true);
                            board[i] = '';
                            bestScore = Math.min(score, bestScore);
                        }
                    }
                    return bestScore;
                }
            }
            
            function checkWinCondition(player) {
                return winningConditions.some(condition => {
                    return condition.every(index => {
                        return gameState[index] === player;
                    });
                });
            }
            
            function checkGameResult() {
                let roundWon = false;
                let winningLine = null;
                
                // Check for win
                for (let i = 0; i < winningConditions.length; i++) {
                    const [a, b, c] = winningConditions[i];
                    if (gameState[a] !== '' && 
                        gameState[a] === gameState[b] && 
                        gameState[a] === gameState[c]) {
                        roundWon = true;
                        winningLine = winningConditions[i];
                        break;
                    }
                }
                
                if (roundWon) {
                    highlightWinningCells(winningLine);
                    statusDisplay.textContent = currentPlayer === 'X' ? 
                        "You Win!" : "Computer Wins!";
                    
                    if (currentPlayer === 'X') {
                        playerScore++;
                        playerScoreDisplay.textContent = playerScore;
                    } else {
                        computerScore++;
                        computerScoreDisplay.textContent = computerScore;
                    }
                    
                    gameActive = false;
                    return;
                }
                
                // Check for draw
                if (!gameState.includes('')) {
                    statusDisplay.textContent = "It's a Tie!";
                    ties++;
                    tiesDisplay.textContent = ties;
                    gameActive = false;
                    return;
                }
            }
            
            function highlightWinningCells(winningLine) {
                winningLine.forEach(index => {
                    cells[index].classList.add('winning');
                });
            }
            
            function resetGame() {
                gameActive = true;
                currentPlayer = 'X';
                gameState = ['', '', '', '', '', '', '', '', ''];
                statusDisplay.textContent = "Your turn (X)";
                
                cells.forEach(cell => {
                    cell.textContent = '';
                    cell.classList.remove('x', 'o', 'winning');
                });
            }
            
            // Event listeners
            cells.forEach(cell => {
                cell.addEventListener('click', handleCellClick);
            });
            
            resetButton.addEventListener('click', resetGame);
        });