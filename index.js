"use strict";

function makeCheatSheet() {
    // cheat sheet
    const cheatSheet = new Map();
    for (let i = 9; i > 1; i--) {
        for (let j = i - 1; j > 0; j--) {
            const q = Math.floor(i / j);
            const r = i % j;
            const key = `${q},${r}`;
            const value = `${i}/${j}`;
            if (!cheatSheet.has(key)) {
                cheatSheet.set(key, []);
            }
            cheatSheet.get(key).push(value);
        }
    }
    // will print a list of (quotient,remainder) => [list of dividend/divisor pairs that result in it]
    const cheatSheetStr = [...cheatSheet.entries()]
        .map(([key, pairs]) => `\t(${key}) = [${pairs.join(', ')}]`)
        .join('\n');
    return 'Cheat sheet!\n\n(quotient,remainder) => [list of dividend/divisor pairs]\n\n' + cheatSheetStr;
}

/** cheat code for sheet of possible outcomes */
let solomon = '';

window.addEventListener('load', () => {
    // wait for everything to load, otherwise some things (like CSS animations) may not work properly
    new D1v1d3();

    solomon = makeCheatSheet();
});
