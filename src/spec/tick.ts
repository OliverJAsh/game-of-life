import tick, {findNeighbourCells, generateCellGrid, shouldReincarnateCell, Cell, isCellNeighbourOf, reincarnateNeighbourCells, shouldKillCell} from '../tick';
import {assert} from 'chai';

describe('generateCellGrid', () => {
    it('should return grid', () => {
        const cell1: Cell = [ -1, -1 ]
        const cell2: Cell = [ 1, 1 ]
        const expectedGrid: Cell[][] = [
            [ [ -1, -1 ], [ 0, -1 ], [ 1, -1 ] ],
            [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ] ],
            [ [ -1, 1 ], [ 0, 1 ], [ 1, 1 ] ],
        ];
        const grid: Cell[][] = generateCellGrid(cell1, cell2);
        assert.deepEqual(grid, expectedGrid)
    })

    it('should return grid (inverted)', () => {
        const cell1: Cell = [ 1, 1 ]
        const cell2: Cell = [ -1, -1 ]
        const expectedGrid: Cell[][] = [
            [ [ -1, -1 ], [ 0, -1 ], [ 1, -1 ] ],
            [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ] ],
            [ [ -1, 1 ], [ 0, 1 ], [ 1, 1 ] ]
        ];
        const grid: Cell[][] = generateCellGrid(cell1, cell2);
        assert.deepEqual(grid, expectedGrid)
    })
})

describe('findNeighbourCells', () => {
    it('should return neighbours', () => {
        const cell: Cell = [ 0, 0 ]
        const expectedNeighbours: Cell[] = [
            [ -1, -1 ],
            [ 0, -1 ],
            [ 1, -1 ],
            [ -1, 0 ],
            [ 1, 0 ],
            [ -1, 1 ],
            [ 0, 1 ],
            [ 1, 1 ],
        ];
        const neighbours: Cell[] = findNeighbourCells(cell);
        assert.deepEqual(neighbours, expectedNeighbours)
    })

    it('should return neighbours (negative)', () => {
        const cell: Cell = [ 0, -1 ]
        const expectedNeighbours: Cell[] = [
            [ -1, -2 ],
            [ 0, -2 ],
            [ 1, -2 ],
            [ -1, -1 ],
            [ 1, -1 ],
            [ -1, 0 ],
            [ 0, 0 ],
            [ 1, 0 ]
        ];
        const neighbours: Cell[] = findNeighbourCells(cell);
        assert.deepEqual(neighbours, expectedNeighbours)
    })
})

describe('isCellNeighbourOf', () => {
    const cell1: Cell = [ 0, 0 ];
    it('top', () => {
        const cell2: Cell = [ 0, -1 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('right', () => {
        const cell2: Cell = [ 1, 0 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('bottom', () => {
        const cell2: Cell = [ 0, 1 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('left', () => {
        const cell2: Cell = [ -1, 0 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('top-right', () => {
        const cell2: Cell = [ 1, -1 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('bottom-right', () => {
        const cell2: Cell = [ 1, 1 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('bottom-left', () => {
        const cell2: Cell = [ -1, 1 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('top-left', () => {
        const cell2: Cell = [ -1, -1 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), true)
    })
    it('out of bounds', () => {
        const cell2: Cell = [ 0, -2 ];
        assert.equal(isCellNeighbourOf(cell1, cell2), false)
    })
})

describe('shouldReincarnateCell', () => {
    it('Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.', () => {
        const deadCell: Cell = [ 0, -1 ];
        const liveCells: Cell[] = [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], ];
        assert.equal(shouldReincarnateCell(deadCell, liveCells), true);
    })

    it('should return false when cell is already alive', () => {
        const liveCell: Cell = [ 2, 0 ];
        const liveCells: Cell[] = [ [ 1, 0 ], liveCell, [ 1, -1 ], [ 3, 1 ], ];
        assert.equal(shouldReincarnateCell(liveCell, liveCells), false);
    })

    it('should return false when cell has two live neighbour cells', () => {
        const deadCell: Cell = [ 0, -1 ];
        const liveCells: Cell[] = [ [ -2, 0 ], [ -1, 0 ], [ 0, 0 ], ];
        assert.equal(shouldReincarnateCell(deadCell, liveCells), false);
    })
})

describe('shouldKillCell', () => {
    it('Any live cell with fewer than two live neighbours dies, as if caused by under-population', () => {
        const liveCell: Cell = [ 0, 0 ];
        const liveCells: Cell[] = [ [ -1, 0 ], liveCell, ];
        assert.equal(shouldKillCell(liveCell, liveCells), true);
    })

    it('Any live cell with two live neighbours lives on to the next generation.', () => {
        const liveCell: Cell = [ 0, 0 ];
        const liveCells: Cell[] = [ [ -1, 0 ], liveCell, [ 1, 0 ], ];
        assert.equal(shouldKillCell(liveCell, liveCells), false);
    })

    it('Any live cell with three live neighbours lives on to the next generation.', () => {
        const liveCell: Cell = [ 0, 0 ];
        const liveCells: Cell[] = [ [ -1, 0 ], liveCell, [ 1, 0 ], [ 0, 1 ], ];
        assert.equal(shouldKillCell(liveCell, liveCells), false);
    })

    it('Any live cell with more than three live neighbours dies, as if by over-population.', () => {
        const liveCell: Cell = [ 0, 0 ];
        const liveCells: Cell[] = [ [ -1, 0 ], liveCell, [ 1, 0 ], [ 0, 1 ], [ 1, 1 ], ];
        assert.equal(shouldKillCell(liveCell, liveCells), true);
    })
})

describe('tick', () => {
    it('should return the correct next live cells', () => {
        const liveCells: Cell[] = [ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], ];
        const expectedNextLiveCells: Cell[] = [ [ 0, 0 ], [ 0, -1 ], [ 0, 1 ], ];
        const nextLiveCells: Cell[] = tick(liveCells);
        assert.deepEqual(nextLiveCells, expectedNextLiveCells)
    })
})
