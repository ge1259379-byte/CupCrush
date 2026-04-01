import { _decorator, Component, Event, Node, sp, tween, Vec3 } from 'cc';
import { ColorConfig, PourSkeAniEventName, RiseSkeAniEventName, SkeletonAniSlots, SkeletonAniType } from './TypeDefine';
const { ccclass, property } = _decorator;

@ccclass('Cup')
export class Cup extends Component {
    @property([Node])
    cupBody: Node[] = [];
    @property(sp.Skeleton)
    riseSke: sp.Skeleton = null;
    @property(sp.Skeleton)
    leftRightPourSke: sp.Skeleton = null;
    sectionColorIds: number[] = [];
    private _clickCallback: (event: Event, customEventData: string, sectionColorIds: number[]) => void = null;
    /** 
     * 初始化瓶子颜色
     * @param sectionColorIds 需要设置的颜色id
     */
    initColor(sectionColorIds: number[], clickCallback: (event: Event, customEventData: string, sectionColorIds: number[]) => void) {
        // 初始时显示riseSke,隐藏leftRightPourSke
        this.cupBody.forEach(item => {
            item.active = true;
        });
        this.riseSke.node.active = true;
        this.leftRightPourSke.node.active = false;
        this._clickCallback = clickCallback;
        // 初始时有几层颜色
        const colorCount = sectionColorIds.length;
        if (colorCount > SkeletonAniSlots.length) {
            console.warn("颜色数量超过水瓶可显示的最大颜色数量，将只显示前" + SkeletonAniSlots.length + "层颜色");
            sectionColorIds = sectionColorIds.slice(0, SkeletonAniSlots.length);
        }
        // 根据totalColorCount,设置riseSke、leftRightPourSke的对应slot的颜色和trackTime
        this._setSlotColor(sectionColorIds, this.riseSke);
        this._setSlotColor(sectionColorIds, this.leftRightPourSke);
        this.sectionColorIds = sectionColorIds;
        // 重置动画
        const riseTrackEntry = this.riseSke.setAnimation(0, SkeletonAniType.Rise, false);
        riseTrackEntry.trackTime = 0.2 * colorCount;
        // 设置时间缩放为0,即暂停动画
        riseTrackEntry.timeScale = 0;
    }
    /** 
     * 设置当前静止状态瓶子水层的颜色
     * @param sectionColorIds 需要设置的颜色id
     */
    private _setSlotColor(sectionColorIds: number[], ske: sp.Skeleton) {
        const colorCount = sectionColorIds.length;
        // 水瓶一共可以显示SkeletonAniSlots.length层颜色，根据colorCount，设置是否显示对应层数的颜色
        for (let i = 0; i < SkeletonAniSlots.length; i++) {
            // 显示对应层数的颜色
            const slot0 = ske.findSlot(SkeletonAniSlots[i][0]);
            const slot1 = ske.findSlot(SkeletonAniSlots[i][1]);
            const slot2 = ske.findSlot(SkeletonAniSlots[i][2]);
            if (i < colorCount) {
                const config = ColorConfig.find(item => item.id === sectionColorIds[i]);
                [slot0, slot2].forEach(slot => {
                    slot.color.r = config.color.r / 255;
                    slot.color.g = config.color.g / 255;
                    slot.color.b = config.color.b / 255;
                    slot.color.a = 1; // 显示的水层需要把透明度打开
                });
                slot1.color.a = i === colorCount - 1 ? 1 : 0;
            } else {
                // 不显示对应层数的颜色
                [slot0, slot1, slot2].forEach(slot => {
                    slot.color.r = 0;
                    slot.color.g = 0;
                    slot.color.b = 0;
                    slot.color.a = 0;
                });
            }
        }
    }
    /** 
     * 加水
     * @param sectionColorIds 需要加上的颜色id
     */
    riseWater(sectionColorIds: number[]) {
        this.cupBody.forEach(item => {
            item.active = true;
        });
        this.riseSke.node.active = true;
        this.leftRightPourSke.node.active = false;
        if (SkeletonAniSlots.length - this.sectionColorIds.length === 0 || sectionColorIds.length === 0) {
            return;
        }
        if (sectionColorIds.length > SkeletonAniSlots.length - this.sectionColorIds.length) {
            console.warn("颜色数量超过水瓶可显示的最大颜色数量，将只显示前" + (SkeletonAniSlots.length - this.sectionColorIds.length) + "层颜色");
            sectionColorIds = sectionColorIds.slice(0, SkeletonAniSlots.length - this.sectionColorIds.length);
        }

        const trackEntry = this.riseSke.setAnimation(0, SkeletonAniType.Rise, false);
        trackEntry.trackTime = 0.2 * this.sectionColorIds.length;
        // 从当前水位开始表现水面上升动画
        this.riseSke.timeScale = 1;
        this.sectionColorIds = this.sectionColorIds.concat(sectionColorIds);
        this.riseSke.setEventListener((x: sp.spine.TrackEntry, ev: sp.spine.Event) => {
            this._riseAniEventListener(x, ev);
        });
    }
    /** 加水过程中需要一层一层显示水的颜色 */
    private _riseAniEventListener(x: sp.spine.TrackEntry, ev: sp.spine.Event) {
        switch (ev.data.name) {
            case RiseSkeAniEventName.EightyPencent:
                break;
            case RiseSkeAniEventName.SixtyPencent:
                this._setSlotColor(this.sectionColorIds.slice(0, 4), this.riseSke);
                this._setSlotColor(this.sectionColorIds.slice(0, 4), this.leftRightPourSke);
                if (this.sectionColorIds.length === 3) {
                    this._riseAniEnd();
                }
                break;
            case RiseSkeAniEventName.FortyPencent:
                this._setSlotColor(this.sectionColorIds.slice(0, 3), this.riseSke);
                this._setSlotColor(this.sectionColorIds.slice(0, 3), this.leftRightPourSke);
                if (this.sectionColorIds.length === 2) {
                    this._riseAniEnd();
                }
                break;
            case RiseSkeAniEventName.TwentyPencent:
                this._setSlotColor(this.sectionColorIds.slice(0, 2), this.riseSke);
                this._setSlotColor(this.sectionColorIds.slice(0, 2), this.leftRightPourSke);
                if (this.sectionColorIds.length === 1) {
                    this._riseAniEnd();
                }
                break;
            case RiseSkeAniEventName.ZeroPencent:
                this._setSlotColor(this.sectionColorIds.slice(0, 1), this.riseSke);
                this._setSlotColor(this.sectionColorIds.slice(0, 1), this.leftRightPourSke);
                if (this.sectionColorIds.length === 0) {
                    this._riseAniEnd();
                }
                break;
            default:
                break;
        }
    }
    /** 加水动画结束后需要暂停动画 */
    private _riseAniEnd() {
        this.riseSke.setEventListener(null);
        this.riseSke.timeScale = 0;
    }
    /** 对准瓶嘴倒水 */
    private _pourAniPostionTween(isLeft: boolean, isUp: boolean, duration: number, gap: number) {
        const offsetX = 150 + (gap - 1) * 300;
        const offsetY = 20;
        tween(this.node).by(duration, { position: new Vec3(isLeft ? -offsetX : offsetX, isUp ? offsetY : -offsetY, 0) }).start();
    }
    /** 
     * 倒水
     * @param isLeft 是否向左倒水
     * @param sectionColorIds 需要倒掉的颜色id
     */
    pourWater(isLeft: boolean, sectionColorIds: number[], gap: number) {
        if (sectionColorIds.length === 0) {
            return;
        }
        this.cupBody.forEach(item => {
            item.active = false;
        });
        this.riseSke.node.active = false;
        this.leftRightPourSke.node.active = true;
        const leftLength = this.sectionColorIds.length - sectionColorIds.length;
        this._pourAniPostionTween(isLeft, true, 0.5, gap);
        this.leftRightPourSke.setAnimation(0, isLeft ? SkeletonAniType.LeftPour : SkeletonAniType.RightPour, false);
        this.leftRightPourSke.setEventListener((x: sp.spine.TrackEntry, ev: sp.spine.Event) => {
            this._pourAniEventListener(x, ev, leftLength, isLeft, gap);
        });
    }
    /** 倒水过程中需要一层一层消失水的颜色 */
    private _pourAniEventListener(x: sp.spine.TrackEntry, ev: sp.spine.Event, leftLength: number, isLeft: boolean, gap: number) {
        switch (ev.data.name) {
            case PourSkeAniEventName.HundredPencent:
                break;
            case PourSkeAniEventName.EightyPencent:
                break;
            case PourSkeAniEventName.SixtyPencent:
                this.sectionColorIds = this.sectionColorIds.slice(0, 3);
                this._setSlotColor(this.sectionColorIds, this.riseSke);
                this._setSlotColor(this.sectionColorIds, this.leftRightPourSke);
                if (leftLength === 3) {
                    this._pourAniEnd(isLeft, gap);
                }
                break;
            case PourSkeAniEventName.FortyPencent:
                this.sectionColorIds = this.sectionColorIds.slice(0, 2);
                this._setSlotColor(this.sectionColorIds, this.riseSke);
                this._setSlotColor(this.sectionColorIds, this.leftRightPourSke);
                if (leftLength === 2) {
                    this._pourAniEnd(isLeft, gap);
                }
                break;
            case PourSkeAniEventName.TwentyPencent:
                this.sectionColorIds = this.sectionColorIds.slice(0, 1);
                this._setSlotColor(this.sectionColorIds, this.riseSke);
                this._setSlotColor(this.sectionColorIds, this.leftRightPourSke);
                if (leftLength === 1) {
                    this._pourAniEnd(isLeft, gap);
                }
                break;
            case PourSkeAniEventName.ZeroPencent:
                this.sectionColorIds = [];
                this._setSlotColor(this.sectionColorIds, this.riseSke);
                this._setSlotColor(this.sectionColorIds, this.leftRightPourSke);
                if (leftLength === 0) {
                    this._pourAniEnd(isLeft, gap);
                }
                break;
            default:
                break;
        }
    }
    /** 倒完水后需要反向播放动画，摆回杯子 */
    private _pourAniEnd(isLeft: boolean, gap: number) {
        this.leftRightPourSke.setEventListener(null);
        // 2. 取当前轨道上的动画
        const state = this.leftRightPourSke.getCurrent(0);
        if (!state) return;
        // 3. 把进度跳到动画尾部，然后反向播回去
        const duration = 0.8; // 根据实际 left/right 动画时长来填
        state.trackTime = duration;
        state.timeScale = -3;
        this._pourAniPostionTween(!isLeft, false, 0.25, gap);
        this.scheduleOnce(() => {
            if (!this.isValid) {
                return;
            }
            this.cupBody.forEach(item => {
                item.active = true;
            });
            this.riseSke.node.active = true;
            this.leftRightPourSke.node.active = false;
        }, duration);
    }
    /** 点击杯子 */
    private onClick(event: Event, customEventData: string) {
        this._clickCallback(event, customEventData, this.sectionColorIds);
    }
}

