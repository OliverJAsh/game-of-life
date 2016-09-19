import tick, {Cell, generateCellGrid, getCellsXRange, getCellsYRange} from './tick';
import {min, max, isEqual} from 'lodash';
import {diff, patch, create, VNode, h} from 'virtual-dom';

const renderVNodeToDom = (containerNode: Element) => {
    let currentVNode: VNode, rootNode: Element;
    return (newVNode: VNode) => {
        if (!rootNode) {
            rootNode = create(newVNode);
            containerNode.appendChild(rootNode);
        }
        const patches = diff(currentVNode || newVNode, newVNode);
        rootNode = patch(rootNode, patches);
        currentVNode = newVNode;
    };
};

const patchObject = <O,P>(o: O, p: P): O & P => Object.assign({}, o, p);

const selector = '#root';
const maybeRootEl = document.querySelector(selector);
const updateDom = renderVNodeToDom(maybeRootEl);
const ulStyle = {
    listStyle: 'none',
    display: 'inline-flex',
    paddingLeft: 'unset',
    marginTop: 'unset',
    marginBottom: 'unset',
}
const cellSize = 20;
const rootUlStyle = (minX: number, maxX: number, minY: number, maxY: number) => patchObject(ulStyle, {
    flexDirection: 'column',
    border: '1px solid grey',
    marginLeft: `${(minX + maxX) * cellSize}px`,
    marginTop: `${(minY + maxY) * -1 * cellSize}px`,
})
const liStyle = (cell: Cell, liveCells: Cell[]) => {
    const isMiddleCell: boolean = isEqual(cell, [ 0, 0 ]);
    return {
        boxSizing: 'border-box',
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        border: '1px solid grey',
        backgroundColor: liveCells.some(liveCell => isEqual(liveCell, cell))
            ? isMiddleCell ? '#ccc' : 'black'
            : isMiddleCell ? 'yellow' : undefined
    }
};
const render = ({ minX, maxX, minY, maxY, cellGrid, liveCells }: State): VNode => (
    h('ul', { style: rootUlStyle(minX, maxX, minY, maxY) }, cellGrid
        .reverse()
        .map(row => (
            h('ul', { style: ulStyle }, row.map(cell => (
                h('li', {
                    style: liStyle(cell, liveCells),
                    title: cell.toString(),
                }, [])
            )))
        )))
)

const initialLiveCells: Cell[] = [
    [ 0, 0 ],
    [ 1, 0 ],
    [ 2, 0 ],
    [ -1, -1 ],
    [ 0, -1 ],
    [ 1, -1 ],
    [ 3, 1 ],
]
type State = {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    cellGrid: Cell[][],
    liveCells: Cell[]
};
const createLiveCellsScanner = () => {
    let liveCells: Cell[];
    return () => {
        liveCells = liveCells ? tick(liveCells) : initialLiveCells;
        return liveCells;
    }
}
const scanLiveCells = createLiveCellsScanner();
const scanState = (): State => {
    const liveCells = scanLiveCells();
    const { min: minX, max: maxX } = getCellsXRange(liveCells);
    const { min: minY, max: maxY } = getCellsYRange(liveCells);
    const cellGrid: Cell[][] = generateCellGrid([ minX, minY ], [ maxX, maxY ]);
    return { minX, maxX, minY, maxY, cellGrid, liveCells };
};
const update = () => updateDom(render(scanState()));

const buttonEl = document.querySelector('button');
buttonEl.addEventListener('click', update);
update();

