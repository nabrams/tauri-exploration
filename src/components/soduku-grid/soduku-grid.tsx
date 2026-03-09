import {
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
  $,
} from "@builder.io/qwik";

type Difficulty = "easy" | "medium" | "hard" | null;

// Pre-made puzzles: [puzzle (0 = empty), solution]
// Easy: more givens | Medium: fewer | Hard: fewest
const PUZZLES: Record<
  "easy" | "medium" | "hard",
  { puzzle: number[][]; solution: number[][] }
> = {
  easy: {
    puzzle: [
      [5, 3, 0, 6, 0, 0, 0, 1, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  medium: {
    puzzle: [
      [0, 0, 0, 6, 0, 8, 0, 1, 0],
      [6, 0, 0, 0, 9, 0, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 0, 0, 0, 0, 3],
      [0, 0, 6, 8, 0, 3, 7, 0, 0],
      [7, 0, 0, 0, 0, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  hard: {
    puzzle: [
      [0, 0, 0, 6, 0, 0, 0, 0, 0],
      [6, 0, 0, 0, 9, 0, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 6, 8, 0, 3, 7, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
};

function deepCopyGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

export const SodukuGrid = component$(() => {
  const difficulty = useSignal<Difficulty>(null);
  const timeElapsed = useSignal(0);
  const timerRunning = useSignal(false);
  const checkResult = useSignal<"correct" | "incorrect" | null>(null);
  const solved = useSignal(false);

  const grid = useStore<{ values: number[][] }>({
    values: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  });

  const initialGrid = useSignal<number[][] | null>(null);
  const solutionGrid = useSignal<number[][] | null>(null);

  // Timer: increment every second when running (client-only interval)
  // eslint-disable-next-line qwik/no-use-visible-task -- timer requires setInterval in browser
  useVisibleTask$(({ track, cleanup }) => {
    track(() => timerRunning.value);
    if (!timerRunning.value) return;
    const id = setInterval(() => {
      timeElapsed.value += 1;
    }, 1000);
    cleanup(() => clearInterval(id));
  });

  const loadPuzzle = $((level: "easy" | "medium" | "hard") => {
    const { puzzle, solution } = PUZZLES[level];
    difficulty.value = level;
    initialGrid.value = deepCopyGrid(puzzle);
    solutionGrid.value = deepCopyGrid(solution);
    grid.values = deepCopyGrid(puzzle);
    timeElapsed.value = 0;
    timerRunning.value = true;
    checkResult.value = null;
    solved.value = false;
  });

  const clearGrid = $(() => {
    if (initialGrid.value) {
      grid.values = deepCopyGrid(initialGrid.value);
      timeElapsed.value = 0;
      timerRunning.value = true;
      checkResult.value = null;
      solved.value = false;
    } else {
      grid.values = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];
      difficulty.value = null;
      initialGrid.value = null;
      solutionGrid.value = null;
      timerRunning.value = false;
      timeElapsed.value = 0;
      checkResult.value = null;
    }
  });

  const checkAnswer = $(() => {
    const solution = solutionGrid.value;
    if (!solution) {
      checkResult.value = "incorrect";
      return;
    }
    let correct = true;
    for (let r = 0; r < 9 && correct; r++) {
      for (let c = 0; c < 9 && correct; c++) {
        const v = grid.values[r][c];
        if (v === 0 || v !== solution[r][c]) correct = false;
      }
    }
    checkResult.value = correct ? "correct" : "incorrect";
    if (correct) {
      solved.value = true;
      timerRunning.value = false;
    }
  });

  const onCellInput = $(
    (row: number, col: number, e: Event) => {
      if (solved.value) return;
      const input = e.target as HTMLInputElement;
      const raw = input.value.replace(/\D/g, "");
      let num = 0;
      if (raw.length > 0) {
        const parsed = parseInt(raw.slice(-1), 10);
        if (parsed >= 1 && parsed <= 9) num = parsed;
      }
      grid.values[row][col] = num;
      input.value = num === 0 ? "" : String(num);
    }
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isGiven = (row: number, col: number) => {
    const initial = initialGrid.value;
    return initial != null && initial[row][col] !== 0;
  };

  return (
    <div class="sudoku-container">
      <div class="sudoku-sidebar">
        <h3 class="sidebar-title">Difficulty</h3>
        <button
          class="difficulty-btn easy"
          onClick$={() => loadPuzzle("easy")}
          type="button"
        >
          Easy
        </button>
        <button
          class="difficulty-btn medium"
          onClick$={() => loadPuzzle("medium")}
          type="button"
        >
          Medium
        </button>
        <button
          class="difficulty-btn hard"
          onClick$={() => loadPuzzle("hard")}
          type="button"
        >
          Hard
        </button>
        <div class="sidebar-divider" />
        <button class="action-btn clear" onClick$={clearGrid} type="button">
          Clear grid
        </button>
        <button
          class="action-btn check"
          onClick$={checkAnswer}
          type="button"
          disabled={!solutionGrid.value}
        >
          Check answer
        </button>
        <div class="timer-display" aria-live="polite">
          <span class="timer-label">Time</span>
          <span class="timer-value">{formatTime(timeElapsed.value)}</span>
        </div>
        {checkResult.value && (
          <p
            class={`check-result ${checkResult.value}`}
            role="status"
          >
            {checkResult.value === "correct" ? "Correct! Well done." : "Not quite. Keep trying!"}
          </p>
        )}
      </div>
      <div class="sudoku-wrapper">
        <div class="sudoku-grid">
          {grid.values.map((row, r) =>
            row.map((cell, c) => {
              const given = isGiven(r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  class={`cell ${given ? "given" : "editable"} ${
                    (r + 1) % 3 === 1 && r !== 0 ? "border-top" : ""
                  } ${(c + 1) % 3 === 1 && c !== 0 ? "border-left" : ""}`}
                >
                  {given ? (
                    <span class="cell-value">{cell || ""}</span>
                  ) : (
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      class="cell-input"
                      value={cell === 0 ? "" : String(cell)}
                      onInput$={(e) => onCellInput(r, c, e)}
                      disabled={solved.value}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={`
        .sudoku-container {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          flex-wrap: wrap;
          padding: 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .sudoku-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 160px;
        }
        .sidebar-title {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }
        .difficulty-btn, .action-btn {
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .difficulty-btn:hover, .action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .difficulty-btn.easy {
          background: #86efac;
          color: #166534;
        }
        .difficulty-btn.medium {
          background: #fde047;
          color: #854d0e;
        }
        .difficulty-btn.hard {
          background: #fca5a5;
          color: #991b1b;
        }
        .action-btn.clear {
          background: #e5e7eb;
          color: #374151;
        }
        .action-btn.check {
          background: #3b82f6;
          color: white;
        }
        .action-btn.check:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .sidebar-divider { height: 1px; background: #e5e7eb; margin: 0.25rem 0; }
        .timer-display {
          padding: 0.5rem 0;
          border-top: 1px solid #e5e7eb;
        }
        .timer-label { display: block; font-size: 0.75rem; color: #6b7280; }
        .timer-value { font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums; color: #111; }
        .check-result {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .check-result.correct { color: #15803d; }
        .check-result.incorrect { color: #b91c1c; }
        .sudoku-wrapper {
          border: 3px solid #1f2937;
          border-radius: 4px;
          padding: 4px;
          background: #1f2937;
        }
        .sudoku-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          grid-template-rows: repeat(9, 1fr);
          width: min(360px, 90vw);
          aspect-ratio: 1;
          gap: 1px;
          background: #1f2937;
        }
        .cell {
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }
        .cell.border-top { border-top: 2px solid #1f2937; }
        .cell.border-left { border-left: 2px solid #1f2937; }
        .cell-value {
          font-size: clamp(14px, 4vw, 22px);
          font-weight: 700;
          color: #111;
        }
        .cell-input {
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          font-size: clamp(14px, 4vw, 22px);
          font-weight: 600;
          text-align: center;
          color: #2563eb;
        }
        .cell-input:focus {
          outline: none;
          background: #eff6ff;
        }
        .cell-input:disabled {
          color: #15803d;
          background: #f0fdf4;
        }
      `} />
    </div>
  );
});
