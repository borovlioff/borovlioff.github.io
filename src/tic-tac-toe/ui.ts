import { Game } from "./game";


export class UIController {
  private game: Game;
  private statusEl: HTMLElement;
  private boardEl: HTMLElement;
  private historyEl: HTMLElement;
  private toggleHistoryBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;

  private history: Array<{
    player: 'X' | 'O';
    move: [number, number];
    timestamp: number;
  }> = [];

  constructor() {
    this.game = new Game();
    this.statusEl = document.querySelector('.status')!;
    this.boardEl = document.getElementById('board')!;
    this.historyEl = document.getElementById('history')!;
    this.toggleHistoryBtn = document.getElementById('toggleHistory') as HTMLButtonElement;
    this.resetBtn = document.getElementById('reset') as HTMLButtonElement;

    this.init();
  }

  private init(): void {
    this.render();
    this.boardEl.addEventListener('click', (e) => this.handleCellClick(e));
    this.resetBtn.addEventListener('click', () => this.handleReset());
    this.toggleHistoryBtn.addEventListener('click', () => this.toggleHistory());
  }

  private handleCellClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('cell')) return;

    const row = parseInt(target.dataset.row!);
    const col = parseInt(target.dataset.col!);

    if (this.game.makeMove(row, col)) {
      this.history.push({
        player: this.game.currentPlayer === 'O' ? 'X' : 'O',
        move: [row, col],
        timestamp: Date.now()
      });
      this.render();
    }
  }

  private handleReset(): void {
    this.game.reset();
    this.history = [];
    this.render();
  }

  private toggleHistory(): void {
    const isHidden = this.historyEl.style.display === 'none';
    this.historyEl.style.display = isHidden ? 'block' : 'none';
    this.toggleHistoryBtn.textContent = isHidden ? 'Скрыть историю' : 'Показать историю';
    this.renderHistory();
  }

  private render(): void {
  const nextPlayer = this.game.currentPlayer;
  const playerHistory = this.game.getPlayerMoveHistory(nextPlayer);
  const willBeRemoved = playerHistory.length >= 3 ? playerHistory[0] : null;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = this.boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`) as HTMLElement;
      const value = this.game.board.getCell(row, col).value;
      cell.textContent = value ?? '';

      // Сброс стилей
      cell.classList.remove('text-red-400', 'ring-2', 'ring-red-500', 'opacity-100', 'opacity-60');
      cell.classList.add('text-gray-100', 'opacity-90');

      if (willBeRemoved && willBeRemoved.row === row && willBeRemoved.col === col) {
        // Подсветка клетки, которая исчезнет
        cell.classList.add('text-red-400', 'ring-2', 'ring-red-500');
      } else if (this.isInRecentMoves(row, col)) {
        cell.classList.add('opacity-100');
      } else {
        cell.classList.add('opacity-60');
      }
    }
  }

  if (this.game.status === 'finished') {
    this.statusEl.textContent = this.game.winner 
      ? `Победил: ${this.game.winner}!` 
      : 'Игра завершена';
  } else {
    this.statusEl.textContent = `Ходит: ${nextPlayer}`;
  }

  this.renderHistory();
}
  private isInRecentMoves(row: number, col: number): boolean {
    const currentMoves = this.game.getPlayerMoveHistory(this.game.currentPlayer);
    return currentMoves.some(move => move.row === row && move.col === col);
  }

  private renderHistory(): void {
    if (this.historyEl.style.display !== 'block') return;

    this.historyEl.innerHTML = '';
    const title = document.createElement('h3');
    title.textContent = 'История ходов';
    this.historyEl.appendChild(title);

    if (this.history.length === 0) {
      this.historyEl.appendChild(document.createTextNode('История пуста.'));
      return;
    }

    const list = document.createElement('ol');
    this.history.forEach(entry => {
      const item = document.createElement('li');
      item.textContent = `Игрок ${entry.player} походил на (${entry.move[0]}, ${entry.move[1]})`;
      list.appendChild(item);
    });
    this.historyEl.appendChild(list);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new UIController();
});