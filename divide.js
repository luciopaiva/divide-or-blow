"use strict";

/**
 * All the game lies inside.
 */
class D1v1d3 {

    /**
     * A binding for a single or a range of key codes.
     * @typedef {{ keys: Array|Number, eventHandler: Function }} KeyBinding
     */

    constructor () {
        this.INITIAL_COUNTDOWN = 60;
        this.GOOD_GUESS_BONUS = 60;
        this.BAD_GUESS_PENALTY = -60;

        /** @member {Element} */
        this.boardConsole = document.getElementById('board-console-input');
        /** @member {Element} */
        this.boardHistory = document.getElementById('board-history');
        /** @member {Element[]} */
        this.digitElements = document.querySelectorAll('.digit-cell');
        /** @member {Element} */
        this.countdownElement = document.getElementById('countdown');
        /** @member {Element} */
        this.guessCounterElement = document.getElementById('guess-counter');
        /** @member {Element} */
        this.gameTitle = document.getElementById('game-title');
        /** @member {Element} */
        this.instructions = document.getElementById('instructions');
        /** @member {Element} */
        this.gameSummary = document.getElementById('game-summary');
        /** @member {Element} */
        this.gameSummaryMessage = document.getElementById('game-summary-message');
        /** @member {Element} */
        this.symbolsRevealedField = document.getElementById('symbols-revealed');
        /** @member {Element} */
        this.divisionsMadeField = document.getElementById('divisions-made');
        /** @member {Element} */
        this.totalGuessesField = document.getElementById('total-guesses');
        /** @member {Element} */
        this.hitRateField = document.getElementById('hit-rate');
        /** @member {Element} */
        this.elapsedTimeField = document.getElementById('elapsed-time');

        /** @member {String} */
        this.dividend = '';
        /** @member {String} */
        this.divisor = '';
        /** @member {Boolean} */
        this.isTypingDivisor = false;
        /** @member {Boolean} */
        this.isGuessingSymbol = false;
        /** This is the password that must be unveiled by the player.
         *  The first position represents A; the second, B, then C and so on.
         *  @member {Number[]} */
        this.digitByCharIndex = null;
        /** @member {String[]} */
        this.charByDigit = null;
        /** @member {KeyBinding[]} */
        this.keyBindings = [];
        /** Which digits have already been revealed.
         *  @member {Set<Number>} */
        this.decipheredDigits = new Set();
        /** Which characters have already been revealed.
         *  @member {Set<String>} */
        this.decipheredChars = new Set();
        /** @member {Number} */
        this.numberOfDivisions = 0;
        /** @member {Number} */
        this.countdown = 0;
        /** @member {Object} */
        this.countdownTimer = null;
        /** @member {Object} */
        this.shufflingAnimationTimer = null;
        /** How many guesses were made so far.
         *  @member {Number} */
        this.totalGuesses = 0;
        /** How many good guesses were made so far.
         *  @member {Number} */
        this.goodGuesses = 0;
        /** Whether the game has started.
         *  @member {Boolean} */
        this.isGameStarted = false;
        /** Whether the game summary screen is being displayed.
         *  @member {Boolean} */
        this.isShowingGameSummary = false;
        /** Time when game started.
         *  @member {Number} */
        this.startTime = 0;
        /** Time when game started.
         *  @member {Number} */
        this.endTime = 0;

        // title expansion animation stuff
        /** @member {Object} */
        this.expansionAnimationTimer = null;
        /** @member {[Number, Number, Number]} */
        this.expansionAnimationColorStart = null;
        /** @member {[Number, Number, Number]} */
        this.expansionAnimationColorEnd = null;
        /** @member {String} */
        this.expansionAnimationSizeStart = null;
        /** @member {String} */
        this.expansionAnimationSizeEnd = null;

        // keyboard actions
        this.registerKeyBinding([ord('A'), ord('J')], this.processChar.bind(this));   // keys A to J
        this.registerKeyBinding(8, this.processBackspace.bind(this));                 // Backspace
        this.registerKeyBinding(ord('/'), this.processDivisionOperator.bind(this));   // slash
        this.registerKeyBinding(13, this.processReturn.bind(this));                   // Enter
        this.registerKeyBinding(ord('='), this.processAssignOperator.bind(this));     // equal sign
        this.registerKeyBinding(ord(' '), this.processSpaceBar.bind(this));           // space bar
        this.registerKeyBinding([ord('0'), ord('9')], this.processDigit.bind(this));  // keys 0 to 9
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    restartGame() {
        this.instructions.classList.add('hidden');
        this.isGameStarted = true;
        this.totalGuesses = 0;
        this.goodGuesses = 0;
        this.updateGuessCounterDisplay();
        this.decipheredChars = new Set();
        this.decipheredDigits = new Set();
        this.numberOfDivisions = 0;
        // generate a password for this game instance
        this.generatePassword();
        this.resetConsole();
        this.boardHistory.innerHTML = '';
        this.restartCountdown();
        // animate shuffling
        this.restartShufflingAnimation();
        this.restartTitleExpansionAnimation();
        this.startTime = (new Date()).getTime();
    }

    resetGame() {
        this.gameSummary.classList.add('hidden');
        this.instructions.classList.remove('hidden');
        this.isShowingGameSummary = false;
        this.isGameStarted = false;
    }

    showGameSummary() {
        this.isShowingGameSummary = true;

        // erase history so summary is guaranteed to appear, otherwise it might appear off-screen
        // ToDo it would be nice to have both the history *and* the summary
        this.boardHistory.innerHTML = '';

        const symbolsRevealed = this.decipheredChars.size;
        const hitRate = this.totalGuesses > 0 ? this.goodGuesses / this.totalGuesses : 0;
        const elapsedTime = (this.endTime - this.startTime) / 1000;
        const elapsedMins = Math.floor(elapsedTime / 60);
        const elapsedSecs = Math.round(elapsedTime % 60);

        this.symbolsRevealedField.innerText = (symbolsRevealed * 10).toFixed(0) + '%';
        this.divisionsMadeField.innerText = this.numberOfDivisions.toString();
        this.totalGuessesField.innerText = this.totalGuesses.toString();
        this.hitRateField.innerText = (hitRate * 100).toFixed(0) + '%';
        this.elapsedTimeField.innerText = elapsedMins.toString() + ':' + (elapsedSecs < 10 ? '0' : '') + elapsedSecs;

        this.gameSummaryMessage.innerText = D1v1d3.getFinalMessage(symbolsRevealed);

        this.gameSummary.classList.remove('hidden');
    }

    static getFinalMessage(symbolsRevealed) {
        switch (symbolsRevealed) {
            case 0: return 'Not nice...';
            case 1: return 'Try harder';
            case 2: return 'Expected more of you';
            case 3: return 'Rookie level';
            case 4: return 'Uh-oh...';
            case 5: return 'Could be better';
            case 6: return 'Not bad';
            case 7: return 'Good job';
            case 8: return 'Excellent job!';
            case 9: return 'Almost perfect!';
            case 10: return 'Perfect!';
        }
    }

    generatePassword() {
        this.digitByCharIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        // Fisher-Yates shuffling
        for (let i = 0; i < 9; i++) {
            const j = i + 1 + Math.floor(Math.random() * (9 - i));

            const temp = this.digitByCharIndex[i];
            this.digitByCharIndex[i] = this.digitByCharIndex[j];
            this.digitByCharIndex[j] = temp;
        }

        // prepare map to help when ciphering
        this.charByDigit = [];
        let currentCharCode = ord('A');
        for (const digit of this.digitByCharIndex) {
            this.charByDigit[digit] = String.fromCharCode(currentCharCode++);
        }
    }

    restartTitleExpansionAnimation() {
        if (this.expansionAnimationTimer !== null) {
            clearInterval(this.expansionAnimationTimer);
            this.expansionAnimationTimer = null;
        }

        this.gameTitle.innerHTML = this.gameTitle.getAttribute('data-text');

        const computedStyle = window.getComputedStyle(document.body);

        // prepare color interpolation
        const colorStart = computedStyle.getPropertyValue('--fg-color').replace(/[^a-zA-Z0-9]/g, '');
        this.expansionAnimationColorStart = [
            parseInt(colorStart.substr(0, 2), 16),
            parseInt(colorStart.substr(2, 2), 16),
            parseInt(colorStart.substr(4, 2), 16)
        ];
        const colorEnd = computedStyle.getPropertyValue('--ex-color').replace(/[^a-zA-Z0-9]/g, '');
        this.expansionAnimationColorEnd = [
            parseInt(colorEnd.substr(0, 2), 16),
            parseInt(colorEnd.substr(2, 2), 16),
            parseInt(colorEnd.substr(4, 2), 16)
        ];
        this.gameTitle.style.color = this.expansionAnimationColorStart;

        // prepare font interpolation
        this.expansionAnimationSizeStart = computedStyle.getPropertyValue('--title-initial-font-size');
        this.expansionAnimationSizeEnd = computedStyle.getPropertyValue('--title-final-font-size');
        this.gameTitle.style.fontSize = this.expansionAnimationSizeStart;

        this.expansionAnimationTimer = setInterval(() => {
            // start in 0, blow up in 1
            const progress = 1 - (Math.min(this.INITIAL_COUNTDOWN, this.countdown) / this.INITIAL_COUNTDOWN);
            this.gameTitle.style.color = lerpColor(
                this.expansionAnimationColorStart, this.expansionAnimationColorEnd, progress);
            this.gameTitle.style.fontSize = lerpNumber(
                    parseInt(this.expansionAnimationSizeStart, 10),
                    parseInt(this.expansionAnimationSizeEnd, 10),
                    progress) + 'em';
        }, 1000);
    }

    restartShufflingAnimation() {
        this.stopShufflingAnimation();

        for (let i = 0; i < 10; i++) {
            const card = this.digitElements[i];
            card.classList.add('digit-cell-slide-up');
            card.innerText = i.toString();
        }
        this.shufflingAnimationTimer = setInterval(() => {
            for (const card of this.digitElements) {
                const currentDigit = parseInt(card.innerText, 10);
                const nextDigit = (currentDigit + 1) % 10;
                card.innerText = nextDigit.toString();
            }
        }, 100);
        setTimeout(() => this.stopShufflingAnimation(), 3000);
    }

    stopShufflingAnimation() {
        if (this.shufflingAnimationTimer !== null) {
            clearInterval(this.shufflingAnimationTimer);
            this.shufflingAnimationTimer = null;
        }
        for (const card of this.digitElements) {
            card.innerText = '?';
        }
    }

    updateCountdownDisplay() {
        const minutes = Math.floor(this.countdown / 60);
        const seconds = this.countdown % 60;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
        const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
        this.countdownElement.innerText = minutesStr + ':' + secondsStr;
    }

    restartCountdown() {
        if (this.countdownTimer !== null) {
            clearInterval(this.countdownTimer);
        }

        this.countdown = this.INITIAL_COUNTDOWN;

        this.updateCountdownDisplay();

        this.countdownTimer = setInterval(() => {
            this.countdown--;
            this.updateCountdownDisplay();

            if (this.countdown <= 0) {  // may be less than zero if penalty was applied
                this.gameOver(false);
            }
        }, 1000);
    }

    addCountdownDelta(delta) {
        this.countdown = Math.max(1, this.countdown + delta);
        this.updateCountdownDisplay();
    }

    gameOver(isBombDisarmed) {
        clearInterval(this.countdownTimer);

        this.endTime = (new Date()).getTime();

        if (isBombDisarmed) {
            // ToDo show success message with animation
            this.showGameSummary();
        } else {
            // explode title!
            let title = this.gameTitle.getAttribute('data-text');
            title = title.replace(/(.)/g, '<div>$1</div>').replace(/\s/g, '<div>&nbsp;</div>');
            this.gameTitle.innerHTML = title;
            setTimeout(() => {  // move style changes to the next tick to avoid the transition not firing
                this.gameTitle.querySelectorAll('div').forEach(span => {
                    span.classList.add('exploded');
                    span.style.left = (-window.innerWidth + Math.random() * 2 * window.innerWidth) + 'px';
                    span.style.top = (Math.random() * window.innerHeight) + 'px';
                });

                // restart game after animation finishes
                setTimeout(() => this.showGameSummary(), 1000);
            }, 50);
        }
    }

    addHistoryRow(contents, className = null) {
        const row = document.createElement('div');
        row.innerHTML = '&gt; ' + contents;
        if (className !== null) {
            row.classList.add(className);
        }
        this.boardHistory.insertBefore(row, this.boardHistory.firstChild);
    }

    updateGuessCounterDisplay() {
        this.guessCounterElement.innerText = this.goodGuesses + '/' + this.totalGuesses;
    }

    makeGuess(guessedChar, guessedDigit) {
        this.resetConsole();

        if (this.decipheredChars.has(guessedChar)) {
            // avoid giving bonus for symbols already discovered
            const contents = `Symbol ${guessedChar} was already revealed!`;
            this.addHistoryRow(contents, 'redundant-guess');
            return;
        }

        if (this.decipheredDigits.has(guessedDigit)) {
            const contents = `Digit ${guessedDigit} was already revealed!`;
            this.addHistoryRow(contents, 'redundant-guess');
            return;
        }

        const actualDigit = this.decipherValue(guessedChar);

        const goodGuess = guessedDigit === actualDigit;

        // add guess to history
        const contents = `${guessedChar} = ${guessedDigit}... ` + (goodGuess ?
                'right guess! <img src="assets/happy.png"/>' : 'bad guess <img src="assets/sad.png"/>');
        this.addHistoryRow(contents, goodGuess ? 'good-guess' : 'bad-guess');

        this.totalGuesses++;

        if (goodGuess) {
            this.goodGuesses++;

            this.decipheredDigits.add(actualDigit);
            this.decipheredChars.add(guessedChar);

            // reveal corresponding card
            const digitIndex = ord(guessedChar) - ord('A');
            const card = this.digitElements[digitIndex];
            card.classList.remove('digit-cell-slide-up');
            card.innerText = actualDigit;

            this.addCountdownDelta(this.GOOD_GUESS_BONUS);

            if (this.decipheredDigits.size === 10) {
                this.gameOver(true);
            } else if (this.decipheredDigits.size === 9) {
                // if the player has unveiled 9 digits, the last one is obvious, so let's show it right away
                for (let charIndex = 0; charIndex < 10; charIndex++) {
                    const char = String.fromCharCode(ord('A') + charIndex);
                    if (!this.decipheredChars.has(char)) {
                        // found it
                        this.makeGuess(char, this.digitByCharIndex[charIndex]);
                        break;
                    }
                }
            }
        } else {
            this.addCountdownDelta(this.BAD_GUESS_PENALTY);
        }

        this.updateGuessCounterDisplay();
    }

    processChar(event) {
        const key = event.key.toUpperCase();

        if (this.isTypingDivisor) {
            this.divisor += key;
        } else {
            this.dividend += key;
            if (this.dividend.length === 1) {
                this.boardConsole.classList.remove('hidden');
            }
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
            if (this.isGuessingSymbol) {
                this.isGuessingSymbol = false;
            }
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
            result = ' → division by zero!';
        } else {
            let quotient = Math.floor(decipheredDividend / decipheredSecondValue);
            quotient = this.decipheredDigits.has(quotient) ? quotient : this.cipherValue(quotient);
            let remainder = decipheredDividend % decipheredSecondValue;
            remainder = this.decipheredDigits.has(remainder) ? remainder : this.cipherValue(remainder);
            result = ` = ${quotient}, remainder ${remainder}`;
        }

        const contents = `${this.dividend} ÷ ${this.divisor}${result}`;
        this.addHistoryRow(contents);
        this.numberOfDivisions++;

        this.resetConsole();
    }

    processSpaceBar() {
        if (!this.isGameStarted) {
            this.restartGame();
        } else if (this.isShowingGameSummary) {
            this.resetGame();
        }
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
        this.makeGuess(this.dividend, guess);
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
        this.boardConsole.classList.add('hidden');  // keep it hidden when empty so cursor aligns correctly
    }

    /**
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        let isRelevant = false;

        let keyOrd;
        switch (event.key) {  // do not trust event.keyCode, it's not cross-platform
            case 'Enter':
                keyOrd = 13;
                break;
            case 'Backspace':
                keyOrd = 8;
                break;
            default:
                if (event.key.length > 1) {
                    return;  // other special characters can be discarded right away
                }
                keyOrd = ord(event.key.toUpperCase());
        }

        for (const keyBinding of this.keyBindings) {
            const [firstKey, lastKey] = keyBinding.keys;
            if (keyOrd >= firstKey && keyOrd <= lastKey) {
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
            result += this.digitByCharIndex[passwordIndex];
        }
        return parseInt(result, 10);
    }

    /**
     * @param {number} decipheredValue
     * @param {boolean} revealDiscoveredDigits whether we should keep discovered digits revealed in the resulting string
     * @return {string} the ciphered value
     */
    cipherValue(decipheredValue, revealDiscoveredDigits = true) {
        return decipheredValue.toString(10)  // convert to string as an easy way to get each digit
            .split('')                       // make array of digits
            .map(c => parseInt(c, 10))       // convert to an index
            .map(d => {                      // map index to ciphered char
                if (revealDiscoveredDigits && this.decipheredDigits.has(d)) {
                    return d.toString();
                } else {
                    return this.charByDigit[d];
                }
            })
            .join('');                       // flatten into resulting ciphered value
    }
}
