import React, { Component } from 'react';
import NemoBlock from '../NemoBlock/NemoBlock';
import './NemoBoard.scss';
import NemoButtons from '../NemoButtons/NemoButtons';
import NemoItem from '../NemoItem/NemoItem';
import LinkedQueue from '../../lib/LinkedQueue';
import { deepCopyArray } from '../../lib/Utils';

const HintBlock = (prop: {value: string}) => {
    return (
        <div className="HintBlock">
            {
                prop.value.split(" ").map((value, key) => {
                    return <span key={key}>{value}</span>
                })
            }
        </div>
    )
}

interface NemoBoardProps {
    stage: {
        name: string, 
        length: number, 
        blockCount: number,
        logic: number[][],
        //logics: string
    };
    callNextStage: Function;
    disable: boolean;
}
interface NemoBoardState {
    reset: boolean;
    burn: number[];
}
class NemoBoard extends Component<NemoBoardProps> {
    state: NemoBoardState = {
        reset: false,
        burn: new Array<number>(2)
    }
    currentLogic: number[][];
    hint: { indexI: string[], indexJ: string[] };
    length: number;
    blockCount: number;
    burn: LinkedQueue<number>;
    board: any;

    constructor(props: NemoBoardProps) {
        super(props);

        const { length, blockCount, logic } = props.stage;
        this.currentLogic = deepCopyArray(logic);
        this.hint = this.convertLogic(logic);
        this.length = length;
        this.blockCount = blockCount;
        this.board = React.createRef();
        this.burn = new LinkedQueue<number>();
    }
    componentWillReceiveProps(nextProps: NemoBoardProps) {
        if(nextProps.stage) {
            const { length, blockCount, logic } = nextProps.stage; 
            
            this.length = length;
            this.blockCount = blockCount;
            this.currentLogic = deepCopyArray(logic);
            this.hint = this.convertLogic(logic);
            this.board.current.style.width = `${length*2}rem`;
            this.setState({
                burn: new Array<number>(2)
            })
        }
    }
    componentDidMount() {
        this.board.current.style.width = `${this.length*2}rem`;
    }
    stageClearEffect = (): void => {
        let blockedCount = 0;
        const blocked = document.querySelectorAll('.blocked');
        
        const waitAnim = (element: HTMLElement) => {
            return new Promise((resolve, reject) => {
                if(blockedCount < blocked.length) {
                    element.style.backgroundColor = "#40c057";
                    setTimeout(() => {
                        resolve(waitAnim(blocked[++blockedCount] as HTMLElement));
                    }, 40);
                } else {
                    setTimeout(() => {
                        resolve(true);
                    }, 150)
                }
            })
        }
        
        waitAnim(blocked[0] as HTMLElement).then(() => this.props.callNextStage());
    }
    refreshBoard = (): void => {
        const { blockCount, logic } = this.props.stage;

        this.blockCount = blockCount;
        this.currentLogic = deepCopyArray(logic);
        this.setState({
            reset: !this.state.reset,
            burn: [null, null]
        })
    }
    checkBoard = (i: number, j: number, burn?: boolean): void => {
        if(this.blockCount == 0) {
            return;
        }
        if(burn) {
            if(this.currentLogic[i][j] == 1) {
                this.currentLogic[i][j] = 0;
                this.blockCount--;
            }
        } else {
            if(this.currentLogic[i][j] == 1) {
                this.currentLogic[i][j] = 0;
                this.blockCount--;
            } else {
                this.currentLogic[i][j] = 1;
                this.blockCount++;
            }
        }

        if(this.blockCount == 0) {
            this.stageClearEffect();
        }
    }
    itemAction = (type: string, target: HTMLElement): void => {
        const length = this.length;
        const blockList = this.board.current.childNodes;
        const boardLength = this.board.current.childNodes.length;
        let targetIndex;

        for(let i=0; i<boardLength; i++) {
            if(blockList[i] == target) {
                targetIndex = i;
                break;
            }
        }

        if(type == "checkHorizontal") {
            let leftIndex = targetIndex - 1;
            let rightIndex = targetIndex + 1;
            if(leftIndex % length != 4 && this.currentLogic[Math.floor(leftIndex/length)][leftIndex%length] == 1) {
                alert("틀렸습니다. 수정하세요 :(");
                return;
            }
            if(rightIndex % length != 0 && this.currentLogic[Math.floor(rightIndex/length)][rightIndex%length] == 1) {
                alert("틀렸습니다. 수정하세요 :(");
                return;
            }
            
            alert("맞습니다. 계속 진행하세요 :>");
            return;
        } else if(type == "checkVertical") {
            let aboveIndex = targetIndex - length;
                let underIndex = targetIndex + length;
                if(aboveIndex > 0 && this.currentLogic[Math.floor(aboveIndex/length)][aboveIndex%length] == 1) {
                    alert("틀렸습니다. 수정하세요 :(");
                    return;
                }
                if(underIndex < boardLength && this.currentLogic[Math.floor(underIndex/length)][underIndex%length] == 1) {
                    alert("틀렸습니다. 수정하세요 :(");
                    return;
                }

                alert("맞습니다. 계속 진행하세요 :>");
                return;
        } else if(type == "burnHorizontal") {
            const burnIndexI = Math.floor(targetIndex/length);
            this.props.stage.logic[burnIndexI].map((value, key) => {
                this.burn.enqueue(value);
            });

            const nextBurn = deepCopyArray(this.state.burn)
            nextBurn[0] = burnIndexI;
            this.setState({
                burn: [burnIndexI, null]
            })
        } else if(type == "burnVertical") {
            const burnIndexJ = Math.floor(targetIndex%length);
            this.props.stage.logic.map((value, key) => {
                this.burn.enqueue(value[burnIndexJ]); 
            });
            
            const nextBurn = deepCopyArray(this.state.burn)
            nextBurn[1] = burnIndexJ;
            this.setState({
                burn: [null, burnIndexJ]
            })
        }
    }
    
    getHint = (logic: string) => {
        const rows = logic.split(",");
        const size = rows.length;
        let hint: {rows: string[], columns: string[]} = { rows: [], columns: [] };

        for(let i=0; i<size; i++) {
            let row = rows[i];
            let column;
            let convertRow = row.split("0").join(" ").trim().split(" ");

            for(let j=0; j<size; j++) {
                
            }

            if(row[i]) {
                if(!hint.rows[i]) {
                    hint.columns[i] = "1";
                }
            }

            hint.rows[i]
        }
    }

    convertLogic = (logic: number[][]) => {
        let indexI = [];
        let indexJ = [];

        for(let i=0; i<logic.length; i++) {
            indexI[i] = "0";
            indexJ[i] = "0";
        }

        let overI = 0;
        let overJ = 0;

        for(let i=0; i<logic.length; i++) {
            for(let j=0; j<logic[i].length; j++) {
                const check = logic[i][j];
                const lastCharI = indexI[i][indexI[i].length-1];
                const lastCharJ = indexJ[j][indexJ[j].length-1];
                
                if(check == 1) {
                    if(lastCharI == "0") {
                        if(!indexI[i][indexI[i].length-2]) {
                            indexI[i] = "1";
                        } else {
                            indexI[i] = overI+"";
                        }
                    } else if(lastCharI == " ") {
                        indexI[i] += "1";
                    } else {
                        const newValue: any = Number.parseInt(lastCharI)+1;
                        indexI[i] = indexI[i].slice(0, indexI[i].length-1) + newValue;
                        
                        if(newValue % 10 == 0) {
                            overI = newValue + 1;
                        }
                    }
                    if(lastCharJ == "0") {
                        if(!indexJ[j][indexJ[j].length-2]) {
                            indexJ[j] = "1";
                        } else {
                            indexJ[j] = overJ + "";
                        }
                    } else if(lastCharJ == " ") {
                        indexJ[j] += "1";
                    } else {
                        const newValue: any = Number.parseInt(lastCharJ)+1;
                        indexJ[j] = indexJ[j].slice(0, indexJ[j].length-1) + newValue;

                        if(newValue % 10 == 0) {
                            overJ = newValue + 1;
                        }
                    }
                } else {
                    if(lastCharI != "0" && lastCharI != " ") {
                        indexI[i] += " ";
                    } else {
                        if(lastCharI == "0" && indexI[i][indexI[i].length-2]) {
                            indexI[i] += " ";
                        }
                    }
                    if(lastCharJ != "0" && lastCharJ != " ") {
                        indexJ[j] += " ";
                    } else {
                        if(lastCharJ == "0" && indexJ[j][indexJ[j].length-2]) {
                            indexJ[j] += " ";
                        }
                    }
                }

                if(i == logic.length-1 && indexJ[j].lastIndexOf(" ") == indexJ[j].length-1) {
                    indexJ[j] = indexJ[j].slice(0, indexJ[j].length-1);
                }
            }
            if(indexI[i].lastIndexOf(" ") == indexI[i].length-1) {
                indexI[i] = indexI[i].slice(0, indexI[i].length-1);
            }
        }
        return {indexI, indexJ};
    }

    render() {
        const { logic, name } = this.props.stage;
        const { indexI, indexJ } = this.hint;
        const { refreshBoard, stageClearEffect, itemAction } = this;
        const { burn } = this.state;

        return(
            <div className="NemoBoard">
                <div className="NemoBoard_indexJ">
                    {
                        indexJ.map((value, key) => {
                            return <HintBlock value={value} key={key} />;
                        })
                    }
                </div>
                <div className="NemoBoard_indexI">
                    {
                        indexI.map((value, key) => {
                            return <HintBlock value={value} key={key} />;
                        })
                    }
                </div>
                <div className="NemoBoard_wrapper">
                    <div className="NemoBoard_board" ref={this.board} >
                        { this.props.disable && <div className="disabled" /> }
                        {logic.map((valueI, i) => (
                            valueI.map((valueJ, j) => {
                                if(typeof burn[0] == 'number' && burn[0] == i) {
                                    return <NemoBlock checkBoard={this.checkBoard} reset={this.state.reset} key={`${name}${i}${j}`} i={i} j={j} burn={this.burn.dequeue()} />
                                } else if(typeof burn[1] == 'number' && burn[1] == j) {
                                    return <NemoBlock checkBoard={this.checkBoard} reset={this.state.reset} key={`${name}${i}${j}`} i={i} j={j} burn={this.burn.dequeue()} />
                                }
                                return <NemoBlock checkBoard={this.checkBoard} reset={this.state.reset} key={`${name}${i}${j}`} i={i} j={j} />
                            })
                        ))}
                    </div>
                    <div className="NemoBoard_items">
                        <span>아이템 목록</span>
                        <NemoItem type="checkHorizontal" itemAction={itemAction} />
                        <NemoItem type="checkVertical" itemAction={itemAction} />
                        <NemoItem type="burnHorizontal" itemAction={itemAction} />
                        <NemoItem type="burnVertical" itemAction={itemAction} />
                    </div>
                </div>
                <NemoButtons refreshBoard={refreshBoard} stageClearEffect={stageClearEffect} />
            </div>
        )
    }
    
}

export default NemoBoard;

