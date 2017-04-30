
class D1v1d3 {

    constructor () {
        this.board = document.getElementById('board');
        this.boardConsole = document.getElementById('board-console-input');
        this.boardHistory = document.getElementById('board-history');
        this.firstValue = '';
        this.secondValue = '';
        this.hasFirstValue = false;
        this.password = null;
        this.digitToChar = null;

        this.generatePassword();

        console.info(this.password);

        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    generatePassword() {
        this.password = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        // shuffle sequence
        for (let i = 0; i < 9; i++) {
            let j = i + 1 + Math.floor(Math.random() * (9 - i));

            let temp = this.password[i];
            this.password[i] = this.password[j];
            this.password[j] = temp;
        }

        // prepare map to help with ciphering
        this.digitToChar = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];
        let currentCharCode = 'A'.charCodeAt(0);
        for (let c of this.password) {
            this.digitToChar[c] = String.fromCharCode(currentCharCode++);
        }
    }

    onKeyDown(event) {

        if (event.keyCode >= 65 && event.keyCode <= 74) {  // between A and J
            let key = event.key.toUpperCase();

            if (!this.hasFirstValue) {
                this.firstValue += key;
            } else {
                this.secondValue += key;
            }

        } else if (event.keyCode === 8) {  // backspace
            if (!this.hasFirstValue && this.firstValue.length > 0) {
                this.firstValue = this.firstValue.substr(0, this.firstValue.length - 1);
            } else if (this.hasFirstValue) {
                if (this.secondValue.length > 0) {
                    this.secondValue = this.secondValue.substr(0, this.secondValue.length - 1);
                } else {
                    this.hasFirstValue = false;
                }
            }
        } else if (event.keyCode === 191 && this.firstValue.length > 0) {  // division operator
            this.hasFirstValue = true;
        } else if (event.keyCode === 13 && this.hasFirstValue && this.secondValue.length > 0) {  // return pressed
            let decipheredFirstValue = parseInt(this.decipherValue(this.firstValue), 10);
            let decipheredSecondValue = parseInt(this.decipherValue(this.secondValue), 10);

            let result = '';
            if (decipheredSecondValue === 0) {
                result = ': division by zero! 😲';
            } else {
                let quotient = this.cipherValue(Math.floor(decipheredFirstValue / decipheredSecondValue));
                let remainder = this.cipherValue(decipheredFirstValue % decipheredSecondValue);
                result = ' = ' + quotient + ', remainder ' + remainder;
            }

            let row = document.createElement('div');
            row.innerText = `${this.firstValue} ÷ ${this.secondValue}${result}`;
            this.boardHistory.insertBefore(row, this.boardHistory.firstChild);

            this.firstValue = '';
            this.hasFirstValue = false;
            this.secondValue = '';
        }

        this.boardConsole.innerText = '> ' + this.firstValue;
        if (this.hasFirstValue) {
            this.boardConsole.innerText += ' ÷ ' + this.secondValue;
        }
    }

    decipherValue(cipheredValue) {
        let result = '';
        for (let i = 0; i < cipheredValue.length; i++) {
            let passwordIndex = cipheredValue.charCodeAt(i) - 65;
            result += this.password[passwordIndex];
        }
        return result;
    }

    /**
     * @param {number} decipheredValue
     * @return {string} the ciphered value
     */
    cipherValue(decipheredValue) {
        return decipheredValue.toString(10)  // convert to string as an easy way to get each digit
            .split('')                       // make array of digits
            .map(c => parseInt(c, 10))       // convert to an index
            .map(d => this.digitToChar[d])   // map index to ciphered char
            .join('');                       // flatten into resulting ciphered value
    }
}

new D1v1d3();
