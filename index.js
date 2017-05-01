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
 * All the game lies inside.
 */
class D1v1d3 {

    /**
     * A binding for a single or a range of key codes.
     * @typedef {{ keys: Array|Number, eventHandler: Function }} KeyBinding
     */

    constructor () {
        /** @member {Element} */
        this.boardConsole = document.getElementById('board-console-input');
        /** @member {Element} */
        this.boardHistory = document.getElementById('board-history');
        /** @member {Element[]} */
        this.digitElements = document.querySelectorAll('.digit-cell');
        /** @member {String} */
        this.dividend = '';
        /** @member {String} */
        this.divisor = '';
        /** @member {Boolean} */
        this.isTypingDivisor = false;
        /** @member {Boolean} */
        this.isGuessingSymbol = false;
        /** @member {Number[]} */
        this.password = null;
        /** @member {String[]} */
        this.charByDigit = null;
        /** @member {KeyBinding[]} */
        this.keyBindings = [];

        // generate a password for this game instance
        this.generatePassword();

        // animate shuffling
        this.animateShuffling();

        // keyboard actions
        this.registerKeyBinding([ord('A'), ord('J')], this.processChar.bind(this));   // keys A to J
        this.registerKeyBinding(8, this.processBackspace.bind(this));                 // backspace
        this.registerKeyBinding(191, this.processDivisionOperator.bind(this));        // slash
        this.registerKeyBinding(111, this.processDivisionOperator.bind(this));        // numeric pad slash
        this.registerKeyBinding(13, this.processReturn.bind(this));                   // return
        this.registerKeyBinding(187, this.processAssignOperator.bind(this));          // equal sign
        this.registerKeyBinding([ord('0'), ord('9')], this.processDigit.bind(this));  // keys 0 to 9
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    generatePassword() {
        this.password = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        // Fisher-Yates shuffling
        for (let i = 0; i < 9; i++) {
            const j = i + 1 + Math.floor(Math.random() * (9 - i));

            const temp = this.password[i];
            this.password[i] = this.password[j];
            this.password[j] = temp;
        }

        // prepare map to help when ciphering
        this.charByDigit = [];
        let currentCharCode = ord('A');
        for (const digit of this.password) {
            this.charByDigit[digit] = String.fromCharCode(currentCharCode++);
        }
    }

    animateShuffling() {
        for (let i = 0; i < 10; i++) {
            const card = this.digitElements[i];
            card.classList.add('digit-cell-slide-up');
            card.innerText = i.toString();
        }
        const shufflingAnimationTimer = setInterval(() => {
            for (const card of this.digitElements) {
                const currentDigit = parseInt(card.innerText, 10);
                const nextDigit = (currentDigit + 1) % 10;
                card.innerText = nextDigit.toString();
            }
        }, 100);
        setTimeout(() => {
            clearInterval(shufflingAnimationTimer);
            for (const card of this.digitElements) {
                card.innerText = '?';
            }
        }, 3000);
    }

    processChar(event) {
        const key = event.key.toUpperCase();

        if (this.isTypingDivisor) {
            this.divisor += key;
        } else {
            this.dividend += key;
        }
    }

    processBackspace() {
        if (this.isTypingDivisor) {
            if (this.divisor.length > 0) {
                this.divisor = this.divisor.substr(0, this.divisor.length - 1);
            } else {
                this.isTypingDivisor = false;
            }
        } else if (this.dividend.length > 0) {
            this.dividend = this.dividend.substr(0, this.dividend.length - 1);
        }
    }

    processDivisionOperator() {
        this.isTypingDivisor = this.dividend.length > 0;
    }

    processReturn() {
        if (this.divisor.length === 0) {
            return;
        }

        const decipheredDividend = this.decipherValue(this.dividend);
        const decipheredSecondValue = this.decipherValue(this.divisor);

        let result = '';
        if (decipheredSecondValue === 0) {
            result = ' → division by zero! 😏';
        } else {
            const quotient = this.cipherValue(Math.floor(decipheredDividend / decipheredSecondValue));
            const remainder = this.cipherValue(decipheredDividend % decipheredSecondValue);
            result = ` = ${quotient}, remainder ${remainder}`;
        }

        const row = document.createElement('div');
        row.innerText = `${this.dividend} ÷ ${this.divisor}${result}`;
        this.boardHistory.insertBefore(row, this.boardHistory.firstChild);

        this.resetConsole();
    }

    processAssignOperator() {
        if (this.isTypingDivisor) {
            this.processReturn();  // treat as an alias to pressing the return key
        } else if (this.dividend.length === 1) {  // only single-char symbols are assignable
            this.isGuessingSymbol = true;
        }
    }

    processDigit(event) {
        if (!this.isGuessingSymbol) {
            return;
        }

        const guess = event.keyCode - ord('0');
        const actual = this.decipherValue(this.dividend);

        const row = document.createElement('div');
        row.innerText = `${this.dividend} = ${guess}? `;
        row.innerText += (guess === actual) ? 'Right guess! 😊' : 'Bad guess... 😰';
        this.boardHistory.insertBefore(row, this.boardHistory.firstChild);

        if (guess === actual) {
            // reveal corresponding card
            const digitIndex = ord(this.dividend) - ord('A');
            const card = this.digitElements[digitIndex];
            card.classList.remove('digit-cell-slide-up');
            card.innerText = actual;
        }

        this.resetConsole();
    }

    updateConsole() {
        this.boardConsole.innerText = this.dividend;
        if (this.isGuessingSymbol) {
            this.boardConsole.innerText += ' =';
        } else if (this.isTypingDivisor) {
            this.boardConsole.innerText += ' ÷ ' + this.divisor;
        }
    }

    resetConsole() {
        this.dividend = '';
        this.divisor = '';
        this.isTypingDivisor = false;
        this.isGuessingSymbol = false;
    }

    /**
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        let isRelevant = false;

        for (const keyBinding of this.keyBindings) {
            const [firstKey, lastKey] = keyBinding.keys;
            if (event.keyCode >= firstKey && event.keyCode <= lastKey) {
                keyBinding.eventHandler(event);
                isRelevant = true;
                break;
            }
        }

        if (isRelevant) {
            this.updateConsole();
        }
    }

    /**
     * @param {Number[]|Number} keyOrKeys
     * @param {Function} callback
     */
    registerKeyBinding(keyOrKeys, callback) {
        const keys = keyOrKeys.constructor === Array ? keyOrKeys : [keyOrKeys, keyOrKeys];
        this.keyBindings.push({ keys, eventHandler: (event) => callback(event) });
    }

    /**
     * @param {string} cipheredValue
     * @return {number} the deciphered value
     */
    decipherValue(cipheredValue) {
        let result = '0';
        for (let i = 0; i < cipheredValue.length; i++) {
            const passwordIndex = ord(cipheredValue) - 65;
            result += this.password[passwordIndex];
        }
        return parseInt(result, 10);
    }

    /**
     * @param {number} decipheredValue
     * @return {string} the ciphered value
     */
    cipherValue(decipheredValue) {
        return decipheredValue.toString(10)  // convert to string as an easy way to get each digit
            .split('')                       // make array of digits
            .map(c => parseInt(c, 10))       // convert to an index
            .map(d => this.charByDigit[d])   // map index to ciphered char
            .join('');                       // flatten into resulting ciphered value
    }
}

window.addEventListener('load', () => {
    // wait for everything to load, otherwise some things (like CSS animations) may not work properly
    new D1v1d3();
});
