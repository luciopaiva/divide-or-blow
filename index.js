
class D1v1d3 {

    constructor () {
        this.board = document.getElementById('board');
        this.firstValue = '';
        this.secondValue = '';
        this.hasFirstValue = false;

        this.password = D1v1d3.generatePassword();
        console.info(this.password);

        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    static generatePassword() {
        let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        for (let i = 0; i < 9; i++) {
            let j = i + 1 + Math.floor(Math.random() * (9 - i));

            let temp = digits[i];
            digits[i] = digits[j];
            digits[j] = temp;
        }

        return digits;
    }

    onKeyDown(event) {
        let hasResult = false;
        let result = '';

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
            } else if (this.hasFirstValue && this.secondValue.length > 0) {
                this.secondValue = this.secondValue.substr(0, this.secondValue.length - 1);
            }
        } else if (event.keyCode === 191) {  // division operator
            this.hasFirstValue = true;
        } else if (event.keyCode === 13) {  // return pressed
            let decipheredFirstValue = parseInt(this.decipherValue(this.firstValue), 10);
            let decipheredSecondValue = parseInt(this.decipherValue(this.secondValue), 10);

            if (decipheredSecondValue === 0) {
                result = ': division by zero! 😲';
            } else {
                let quotient = Math.floor(decipheredFirstValue / decipheredSecondValue);
                let remainder = decipheredFirstValue % decipheredSecondValue;
                result = ' = ' + quotient + ', remainder ' + remainder;
            }

            hasResult = true;
        }

        this.board.innerText = this.firstValue;
        if (this.hasFirstValue) {
            this.board.innerText += ' ÷ ' + this.secondValue;
        }
        if (hasResult) {
            this.board.innerText += result;
        }
    }

    decipherValue(cypheredValue) {
        let result = '';
        for (let i = 0; i < cypheredValue.length; i++) {
            let passwordIndex = cypheredValue.charCodeAt(i) - 65;
            result += this.password[passwordIndex];
        }
        return result;
    }
}

new D1v1d3();
