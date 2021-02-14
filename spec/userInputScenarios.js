var userScenario =
    [
        {
            case: 1, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true, isLocked: true, userTargetValue: 15 },
            output: { isUserCustom: true, isLocked: true, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 2, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: true, userTargetValue: 15 },
            output: { isUserCustom: true, isLocked: true, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 3, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true, userTargetValue: 15 },
            output: { isUserCustom: true, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 4, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { userTargetValue: 15 },
            output: { isUserCustom: true, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 5, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true, isLocked: true },
            output: { isUserCustom: true, isLocked: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 6, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: true },
            output: { isUserCustom: true, isLocked: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 7, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true },
            output: { isUserCustom: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 8, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: true, isLocked: true },
            output: { isUserCustom: true, isLocked: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 9, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isLocked: true },
            output: { isUserCustom: true, isLocked: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 10, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: true },
            output: { isUserCustom: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 11, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true, isLocked: false, userTargetValue: 15 },
            output: { isUserCustom: true, isLocked: false, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 12, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: false, userTargetValue: 15 },
            output: { isUserCustom: true, isLocked: false, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 13, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true, userTargetValue: 15 },
            output: { isUserCustom: true, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 14, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true, isLocked: false },
            output: { isUserCustom: true, isLocked: false, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 15, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: false },
            output: { isLocked: false, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 16, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: true },
            output: { isUserCustom: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 17, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: true, isLocked: false },
            output: { isUserCustom: true, isLocked: false, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 18, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isLocked: false },
            output: { isLocked: false, targetValue: 8 }
        },
        {
            case: 19, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: true },
            output: { isUserCustom: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 20, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false, isLocked: true, userTargetValue: 15 },
            output: { isUserCustom: false, isLocked: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 21, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: true, userTargetValue: 15 },
            output: { isUserCustom: true, isLocked: true, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 22, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false, userTargetValue: 15 },
            output: { isUserCustom: false, isLocked: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 23, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false, isLocked: true },
            output: { isUserCustom: false, isLocked: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 24, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: true },
            output: { isUserCustom: true, isLocked: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 25, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false },
            output: { isUserCustom: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 26, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: false, isLocked: true },
            output: { isUserCustom: false, isLocked: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 27, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isLocked: true },
            output: { isUserCustom: true, isLocked: true, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 28, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: false },
            output: { isUserCustom: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 29, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false, isLocked: false, userTargetValue: 15 },
            output: { isUserCustom: false, isLocked: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 30, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: false, userTargetValue: 15 },
            output: { isUserCustom: true, isLocked: false, targetValue: 15, userTargetValue: 15 }
        },
        {
            case: 31, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false, userTargetValue: 15 },
            output: { isUserCustom: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 32, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false, isLocked: false },
            output: { isUserCustom: false, isLocked: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 33, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isLocked: false },
            output: { isLocked: false, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 34, status: { currentSchedule: { temp: 7 }, targetValue: 8, userTargetValue: 10 },
            input: { isUserCustom: false },
            output: { isUserCustom: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 35, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: false, isLocked: false },
            output: { isUserCustom: false, isLocked: false, targetValue: 7, userTargetValue: 7 }
        },
        {
            case: 36, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isLocked: false },
            output: { isLocked: false, targetValue: 8, userTargetValue: 8 }
        },
        {
            case: 37, status: { currentSchedule: { temp: 7 }, targetValue: 8 },
            input: { isUserCustom: false },
            output: { isUserCustom: false, targetValue: 7, userTargetValue: 7 }
        }
    ];
module.exports = userScenario;