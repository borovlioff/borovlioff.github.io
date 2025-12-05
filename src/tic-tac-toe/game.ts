export class Cell {
  constructor(public value: 'X' | 'O' | null = null) {}
}

export class Board {
  private cells: Cell[] = Array(9).fill(null).map(() => new Cell());

  getCell(row: number, col: number): Cell {
    return this.cells[row * 3 + col];
  }

  setCell(row: number, col: number, value: 'X' | 'O' | null): void {
    this.cells[row * 3 + col].value = value;
  }

  isFull(): boolean {
    return this.cells.every(cell => cell.value !== null);
  }

  checkWinner(): 'X' | 'O' | null {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];

    for (const [a,b,c] of lines) {
      if (
        this.cells[a].value &&
        this.cells[a].value === this.cells[b].value &&
        this.cells[a].value === this.cells[c].value
      ) {
        return this.cells[a].value as 'X' | 'O';
      }
    }
    return null;
  }
}

export class Game {
  public currentPlayer: 'X' | 'O' = 'X';
  public status: 'active' | 'finished' = 'active';
  public winner: 'X' | 'O' | null = null;

  private moveHistory = {
    X: Array<{ row: number; col: number }>(),
    O: Array<{ row: number; col: number }>()
  };

  constructor(public board = new Board()) {}

  makeMove(row: number, col: number): boolean {
    const cell = this.board.getCell(row, col);
    if (cell.value || this.status === 'finished') return false;

    this.board.setCell(row, col, this.currentPlayer);
    this.moveHistory[this.currentPlayer].push({ row, col });

    if (this.moveHistory[this.currentPlayer].length > 3) {
      const firstMove = this.moveHistory[this.currentPlayer].shift()!;
      const cellValue = this.board.getCell(firstMove.row, firstMove.col).value;
      if (cellValue === this.currentPlayer) {
        this.board.setCell(firstMove.row, firstMove.col, null);
      }
    }

    this.winner = this.board.checkWinner();
    if (this.winner) {
      this.status = 'finished';
    }

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  reset(): void {
    this.board = new Board();
    this.currentPlayer = 'X';
    this.status = 'active';
    this.winner = null;
    this.moveHistory = { X: [], O: [] };
  }

  getPlayerMoveHistory(player: 'X' | 'O') {
    return this.moveHistory[player];
  }
}