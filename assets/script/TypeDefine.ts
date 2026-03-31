import { Color } from "cc";

/** 水瓶动画类型 */
export enum SkeletonAniType {
    /** 加水 */
    Rise = "stay",
    /** 向左倒水 */
    LeftPour = "left",
    /** 向右倒水 */
    RightPour = "right",
}
/** 倒水动画事件名称 */
export enum PourSkeAniEventName {
    HundredPencent = "ds0",
    EightyPencent = "ds1",
    SixtyPencent = "ds2",
    FortyPencent = "ds3",
    TwentyPencent = "ds4",
    ZeroPencent = "ds5",
}
/** 加水动画事件名称 */
export enum RiseSkeAniEventName {
    EightyPencent = "stay4",
    SixtyPencent = "stay3",
    FortyPencent = "stay2",
    TwentyPencent = "stay1",
    ZeroPencent = "stay0",
}
/** 水瓶动画slot名称组，每个杯子最多可以容纳4层颜色，每个杯子最多可以容纳4层水 */
export const SkeletonAniSlots: string[][] = [
    ["s2_lv4_3", "s2_lv4_1", "s2_lv4_2"],
    ["s2_lv3_3", "s2_lv3_1", "s2_lv3_2"],
    ["s2_lv2_3", "s2_lv2_1", "s2_lv2_2"],
    ["s2_lv1_3", "s2_lv1_1", "s2_lv1_2"]
];
// 颜色接口类型
export interface ColorConfigItem {
    id: number;
    color: Color;
}
// 颜色配置
export const ColorConfig: ColorConfigItem[] = [
    {
        id: 1,
        color: Color.fromHEX(new Color(), "#ffca12"),
    },
    {
        id: 2,
        color: Color.fromHEX(new Color(), "#ff6e0e"),
    },
    {
        id: 3,
        color: Color.fromHEX(new Color(), "#dc110d"),
    },
    {
        id: 4,
        color: Color.fromHEX(new Color(), "#83c107"),
    },
    {
        id: 5,
        color: Color.fromHEX(new Color(), "#11b1f4"),
    },
    {
        id: 6,
        color: Color.fromHEX(new Color(), "#7a25b7"),
    },
    {
        id: 7,
        color: Color.fromHEX(new Color(), "#fa6fd1"),
    },
    {
        id: 8,
        color: Color.fromHEX(new Color(), "#20ebb3"),
    },
    {
        id: 9,
        color: Color.fromHEX(new Color(), "#2828dc"),
    },
    {
        id: 10,
        color: Color.fromHEX(new Color(), "#894239"),
    },
    {
        id: 11,
        color: Color.fromHEX(new Color(), "#767fcf"),
    },
    {
        id: 12,
        color: Color.fromHEX(new Color(), "#036d0d"),
    }
];


