"use strict";

/**
 * Utility function to convert a character to its code.
 * @param {String} char single-character string
 * @returns {Number} corresponding code
 */
function ord(char) {
    return char.charCodeAt(0);
}

/**
 * Do linear interpolation between c1 and c2 at t and return resulting color.
 * @param {[Number, Number, Number]} c1 initial RGB color
 * @param {[Number, Number, Number]} c2 final RGB color
 * @param {Number} t value in the range [0, 1[
 * @return {String} interpolated color in the format '#000000'
 */
function lerpColor(c1, c2, t) {
    let r = Math.floor(lerpNumber(c1[0], c2[0], t)).toString(16);
    let g = Math.floor(lerpNumber(c1[1], c2[1], t)).toString(16);
    let b = Math.floor(lerpNumber(c1[2], c2[2], t)).toString(16);
    r = r.length < 2 ? '0' + r : r;
    g = g.length < 2 ? '0' + g : g;
    b = b.length < 2 ? '0' + b : b;
    return '#' + r + g + b;
}

/**
 * Do linear interpolation between n1 and n2 at t.
 * @param {Number} n1 first value
 * @param {Number} n2 second value
 * @param {Number} t value in the range [0, 1[
 * @returns {Number} resulting interpolated value
 */
function lerpNumber(n1, n2, t) {
    return n1 + t * (n2 - n1);
}
