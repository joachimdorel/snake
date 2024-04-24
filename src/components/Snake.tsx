import { useEffect, useState } from "react";
import { Position } from "../types/position";
import { Cell } from "../types/cell";
import { Direction } from "../types/direction";

const boardSize: number = 10;

const initialSnake: Position[] = [ { x: 2, y: 1 }, { x: 1, y: 1 } ];
const initialPosition: Position = { x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize) };
const createEmptyBoard = (): Cell[][] => Array(boardSize).fill(null).map(() => Array(boardSize).fill('0'));

const Snake: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard());
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Position>(initialPosition);
  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // effect to move the snake at intervals
  useEffect(() => {
    if (!gameOver) {
      document.addEventListener('keydown', handleKeyDown);
      const interval = setInterval(moveSnake, 200);
      return () => {
        // clean the listeners to avoid side effect
        document.removeEventListener('keydown', handleKeyDown);
        clearInterval(interval);
      };
    }
  // eslint-disable-next-line
  }, [snake, direction]);

  // effect to update the board when the snake is updated
  useEffect(() => {
    updateBoard();
  // eslint-disable-next-line
  }, [snake]);

  // manage the keyDown for the direction
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':  
        (direction !== 'DOWN') && setDirection('UP'); 
        break;
      case 'ArrowDown': 
        (direction !== 'UP') && setDirection('DOWN'); 
        break;
      case 'ArrowLeft': 
        (direction !== 'RIGHT') && setDirection('LEFT');
        break;
      case 'ArrowRight':
        (direction !== 'LEFT') && setDirection('RIGHT');
        break;
    }
  };

  const moveSnake = () => {
    const newSnake = [...snake];
    let head: Position = { x: newSnake[0].x, y: newSnake[0].y };
    switch (direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // if the snake eat itself - Invariant: la règle ne change jamais
    if (newSnake.some((seg: Position, index: number) => seg.x === head.x && seg.y === head.y && index < newSnake.length-1)) {
      setMessage(`Game over - Score : ${score}`);
      (score > best) && (setBest(score))
      setGameOver(true);
      return;
    };

    // update the head coordinates if it reached a border
    (head.x < 0) && (head.x = boardSize-1);
    (head.x >= boardSize) && (head.x = 0);
    (head.y < 0) && (head.y = boardSize-1);
    (head.y >= boardSize) && (head.y = 0); 

    newSnake.unshift(head);
    // food management
    if (head.x === food.x && head.y === food.y) {
      setFood({ x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize) });
      setScore(score + 1);
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  const updateBoard = () => {
    const newBoard = createEmptyBoard();
    snake.forEach((vertebra: Position) => newBoard[vertebra.y][vertebra.x] = 'S');
    newBoard[food.y][food.x] = 'F';
    setBoard(newBoard);
  };

  const newGame = () => {
    setGameOver(false);
    setMessage('');
    setSnake(initialSnake);
    setFood({ x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize) });
    setBest(score);
    setScore(0);
    setDirection('RIGHT');
  };

  return (
    <div className="flex flex-col border border-green justify-center items-center gap-2">
      <div>Best: {best} | Score : {score}</div>
      <div>{message}</div>
      <div>
        {gameOver && 
          <button className="p-1 m-1 bg-slate-100 border border-slate-900 rounded-md hover:bg-slate-300" onClick={newGame}>New game</button>
        }
      </div>

      <div className="grid grid-rows-10 w-48 justify-center">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className='grid grid-cols-10 gap-0 text-sm'>
            {row.map((cell, index) => (
              <span 
                key={index} className={(cell === 'S' ? 'bg-green-500' : (cell === 'F' ? 'bg-red-500' : 'bg-slate-100'))}
              >
                &nbsp;&nbsp;&nbsp;
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Snake;