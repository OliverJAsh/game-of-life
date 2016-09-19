import {min, max, range, flatten, uniqWith, isEqual, includes} from 'lodash';

type X = number;
type Y = number;
export type Cell = [ X, Y ];

type Range = { min: number, max: number };
export const getCellsXRange = (cells: Cell[]): Range => {
    const xs: X[] = cells.map(cell => cell[0]);
    const minX = min(xs);
    const maxX = max(xs);
    return { min: minX, max: maxX };
}

export const getCellsYRange = (cells: Cell[]): Range => {
    const xs: X[] = cells.map(cell => cell[1]);
    const minY = min(xs);
    const maxY = max(xs);
    return { min: minY, max: maxY };
}

export const generateCellGrid = (cell1: Cell, cell2: Cell): Cell[][] => {
    const cells: Cell[] = [ cell1, cell2 ];
    const { min: minX, max: maxX } = getCellsXRange(cells);
    const { min: minY, max: maxY } = getCellsYRange(cells);
    return range(minY, maxY + 1).map(y => (
        range(minX, maxX + 1).map((x): Cell => [ x, y ])
    ))
}

export const findNeighbourCells = (cell: Cell): Cell[] => {
    const cell1: Cell = [ cell[0] - 1, cell[1] - 1, ]
    const cell2: Cell = [ cell[0] + 1, cell[1] + 1, ]
    return flatten(generateCellGrid(cell1, cell2))
        .filter(gridCell => ! isEqual(gridCell, cell))
};

export const isCellNeighbourOf = (cell1: Cell, cell2: Cell): boolean => {
    return findNeighbourCells(cell1)
        .some(neighbourCell => isEqual(neighbourCell, cell2));
}

const findNeighbourCellsIn = (cell: Cell, cells: Cell[]): Cell[] => (
    cells.filter(cell2 => isCellNeighbourOf(cell, cell2))
)

export const shouldReincarnateCell = (cell: Cell, liveCells: Cell[]): boolean => {
    const liveNeighbourCells: Cell[] = findNeighbourCellsIn(cell, liveCells);
    return liveCells.some(liveCell => isEqual(liveCell, cell))
        ? false
        : liveNeighbourCells.length === 3;
};

export const reincarnateNeighbourCells = (cell: Cell, liveCells: Cell[]): Cell[] => (
    findNeighbourCells(cell)
        .filter(neighbourCell => shouldReincarnateCell(neighbourCell, liveCells))
);

export const shouldKillCell = (cell: Cell, liveCells: Cell[]): boolean => {
    const liveNeighbourCells: Cell[] = findNeighbourCellsIn(cell, liveCells);
    return liveNeighbourCells.length !== 2 && liveNeighbourCells.length !== 3;
};

const tick = (liveCells: Cell[]): Cell[] => {
    const liveCellsAfterKilled: Cell[] = (
        liveCells.filter(liveCell => ! shouldKillCell(liveCell, liveCells))
    );

    const reincarnatedNeighbourCells: Cell[] = uniqWith(
        flatten(
            liveCells.map(liveCell => (
                findNeighbourCells(liveCell)
                    .filter(neighbourCell => shouldReincarnateCell(neighbourCell, liveCells))
            ))
        ),
        isEqual
    );

    return flatten([ liveCellsAfterKilled, reincarnatedNeighbourCells ]);
};

export default tick;
