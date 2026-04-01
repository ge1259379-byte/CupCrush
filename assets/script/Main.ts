import { _decorator, Component, Event, Label } from 'cc';
import { Cup } from './Cup';
import { ColorConfig, SkeletonAniSlots } from './TypeDefine';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    @property([Cup])
    cups: Cup[] = [];
    @property(Label)
    congratulationsLabel: Label = null;
    private _firstChoosedCup: number = -1;
    start() {
        this.onClickReset();
    }
    /** 点击杯子 */
    onClickCup(event: Event, customEventData: string, sectionColorIds: number[]) {
        console.log(event.target.parent.name, customEventData, sectionColorIds);
        if (this._firstChoosedCup !== -1
            && (Number(customEventData) === this._firstChoosedCup
                || this.cups[this._firstChoosedCup].sectionColorIds.length === 0
                || this.cups[Number(customEventData)].sectionColorIds.length === SkeletonAniSlots.length
            )) {
            //自己和自己/自己空杯/对方满杯 不能交换
            this._firstChoosedCup = -1;
            return;
        }
        if (this._firstChoosedCup === -1) {
            if (this.cups[Number(customEventData)].sectionColorIds.length === 0) {
                return;
            }
            this._firstChoosedCup = Number(customEventData);
        } else {
            const firstCupSectionColorIds = this.cups[this._firstChoosedCup].sectionColorIds;
            const secondCupSectionColorIds = this.cups[Number(customEventData)].sectionColorIds;
            if (firstCupSectionColorIds[firstCupSectionColorIds.length - 1]
                === secondCupSectionColorIds[secondCupSectionColorIds.length - 1]
                || secondCupSectionColorIds.length === 0) {
                const selfColorId = firstCupSectionColorIds[firstCupSectionColorIds.length - 1];
                // 从顶层向下收集连续同色层
                const selfTotalColorId: number[] = [];
                for (let i = firstCupSectionColorIds.length - 1; i >= 0; i--) {
                    if (firstCupSectionColorIds[i] === selfColorId) {
                        selfTotalColorId.push(firstCupSectionColorIds[i]);
                    } else {
                        break;
                    }
                }
                if (selfTotalColorId.length !== 0) {
                    this.cups[this._firstChoosedCup].pourWater(this._firstChoosedCup > Number(customEventData),
                        selfTotalColorId.slice(0, SkeletonAniSlots.length - secondCupSectionColorIds.length),
                        Math.abs(Number(customEventData) - this._firstChoosedCup));
                    this.cups[Number(customEventData)].riseWater(selfTotalColorId.slice(0, SkeletonAniSlots.length - secondCupSectionColorIds.length));
                }
            }
            this._firstChoosedCup = -1;
        }
    }
    /** 点击重置此局游戏 */
    onClickReset() {
        // 1. 从 ColorConfig 里取出所有可用颜色 id
        const allColorIds = ColorConfig.map(item => item.id);

        // 2. 随机选 2 种不同颜色
        const shuffledIds = [...allColorIds].sort(() => Math.random() - 0.5);
        const colors = shuffledIds.slice(0, 2); // [colorA, colorB]

        // 3. 严格生成：2种颜色，每种恰好4层（共8层）
        const totalSections: number[] = [
            colors[0], colors[0], colors[0], colors[0],
            colors[1], colors[1], colors[1], colors[1],
        ];
        // 打乱顺序
        totalSections.sort(() => Math.random() - 0.5);

        // 4. 三个杯子的初始层数固定为 [3,3,2] 的随机排列（每杯最多 3 层，总共 8 层）
        const distribution = [3, 3, 2].sort(() => Math.random() - 0.5);

        // 5. 按分布切片分给 3 个杯子
        let offset = 0;
        this.cups.forEach((cup, idx) => {
            const count = distribution[idx];
            const sections = totalSections.slice(offset, offset + count);
            offset += count;
            cup.initColor(sections, this.onClickCup.bind(this));
        });
    }
}