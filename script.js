
        class Calculator {
            constructor() {
                this.display = document.getElementById('display');
                this.operation = document.getElementById('operation');
                this.historyList = document.getElementById('historyList');
                this.historyPanel = document.getElementById('historyPanel');
                this.themeBtn = document.getElementById('themeBtn');
                
                this.currentValue = '0';
                this.previousValue = null;
                this.operator = null;
                this.waitingForOperand = false;
                this.history = [];
                this.isDarkMode = false;
                
                this.bindEvents();
                this.initializeTheme();
            }

            initializeTheme() {
                // Check for saved theme preference or default to light mode
                const savedTheme = localStorage.getItem('calculator-theme');
                this.isDarkMode = savedTheme === 'dark';
                this.updateTheme();
            }

            toggleTheme() {
                this.isDarkMode = !this.isDarkMode;
                this.updateTheme();
                localStorage.setItem('calculator-theme', this.isDarkMode ? 'dark' : 'light');
            }

            updateTheme() {
                if (this.isDarkMode) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    this.themeBtn.textContent = '☀️';
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    this.themeBtn.textContent = '🌙';
                }
            }

            bindEvents() {
                // Number buttons
                document.querySelectorAll('[data-number]').forEach(btn => {
                    btn.addEventListener('click', () => this.inputNumber(btn.dataset.number));
                });

                // Operator buttons
                document.querySelectorAll('[data-operator]').forEach(btn => {
                    btn.addEventListener('click', () => this.inputOperator(btn.dataset.operator));
                });

                // Special buttons
                document.getElementById('decimal').addEventListener('click', () => this.inputDecimal());
                document.getElementById('equals').addEventListener('click', () => this.calculate());
                document.getElementById('clear').addEventListener('click', () => this.clear());
                document.getElementById('backspace').addEventListener('click', () => this.backspace());
                
                // History controls
                document.getElementById('historyBtn').addEventListener('click', () => this.toggleHistory());
                document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
                
                // Theme toggle
                this.themeBtn.addEventListener('click', () => this.toggleTheme());

                // Close history when clicking outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.controls')) {
                        this.historyPanel.style.display = 'none';
                    }
                });

                // Keyboard support
                document.addEventListener('keydown', (e) => this.handleKeyboard(e));
            }

            inputNumber(num) {
                if (this.waitingForOperand) {
                    this.currentValue = num;
                    this.waitingForOperand = false;
                } else {
                    this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
                }
                this.updateDisplay();
            }

            inputOperator(nextOperator) {
                const inputValue = parseFloat(this.currentValue);

                if (this.previousValue === null) {
                    this.previousValue = inputValue;
                } else if (this.operator) {
                    const currentValue = this.previousValue || 0;
                    const newValue = this.performCalculation(currentValue, inputValue, this.operator);

                    this.currentValue = String(newValue);
                    this.previousValue = newValue;
                    
                    // Add to history
                    const historyEntry = `${currentValue} ${this.operator} ${inputValue} = ${newValue}`;
                    this.addToHistory(historyEntry);
                }

                this.waitingForOperand = true;
                this.operator = nextOperator;
                this.updateDisplay();
            }

            inputDecimal() {
                if (this.waitingForOperand) {
                    this.currentValue = '0.';
                    this.waitingForOperand = false;
                } else if (this.currentValue.indexOf('.') === -1) {
                    this.currentValue += '.';
                }
                this.updateDisplay();
            }

            calculate() {
                if (this.operator && this.previousValue !== null) {
                    const inputValue = parseFloat(this.currentValue);
                    const newValue = this.performCalculation(this.previousValue, inputValue, this.operator);
                    
                    // Add to history
                    const historyEntry = `${this.previousValue} ${this.operator} ${inputValue} = ${newValue}`;
                    this.addToHistory(historyEntry);
                    
                    this.currentValue = String(newValue);
                    this.previousValue = null;
                    this.operator = null;
                    this.waitingForOperand = true;
                    this.updateDisplay();
                }
            }

            performCalculation(firstValue, secondValue, operator) {
                switch (operator) {
                    case '+':
                        return firstValue + secondValue;
                    case '-':
                        return firstValue - secondValue;
                    case '×':
                        return firstValue * secondValue;
                    case '÷':
                        return secondValue !== 0 ? firstValue / secondValue : 0;
                    default:
                        return secondValue;
                }
            }

            clear() {
                this.currentValue = '0';
                this.previousValue = null;
                this.operator = null;
                this.waitingForOperand = false;
                this.updateDisplay();
            }

            backspace() {
                if (this.currentValue.length > 1) {
                    this.currentValue = this.currentValue.slice(0, -1);
                } else {
                    this.currentValue = '0';
                }
                this.updateDisplay();
            }

            updateDisplay() {
                this.display.textContent = this.currentValue;
                
                if (this.operator && this.previousValue !== null) {
                    this.operation.textContent = `${this.previousValue} ${this.operator}`;
                } else {
                    this.operation.textContent = '';
                }
            }

            addToHistory(entry) {
                this.history.unshift(entry);
                this.history = this.history.slice(0, 10); // Keep last 10 entries
                this.updateHistoryDisplay();
            }

            updateHistoryDisplay() {
                if (this.history.length === 0) {
                    this.historyList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 1rem;">No calculations yet</div>';
                } else {
                    this.historyList.innerHTML = this.history.map(entry => 
                        `<div class="history-item">${entry}</div>`
                    ).join('');
                }
            }

            toggleHistory() {
                const isVisible = this.historyPanel.style.display === 'block';
                this.historyPanel.style.display = isVisible ? 'none' : 'block';
            }

            clearHistory() {
                this.history = [];
                this.updateHistoryDisplay();
            }

            handleKeyboard(e) {
                if (e.key >= '0' && e.key <= '9') {
                    this.inputNumber(e.key);
                } else if (e.key === '.') {
                    this.inputDecimal();
                } else if (e.key === '+') {
                    this.inputOperator('+');
                } else if (e.key === '-') {
                    this.inputOperator('-');
                } else if (e.key === '*') {
                    this.inputOperator('×');
                } else if (e.key === '/') {
                    e.preventDefault();
                    this.inputOperator('÷');
                } else if (e.key === 'Enter' || e.key === '=') {
                    this.calculate();
                } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
                    this.clear();
                } else if (e.key === 'Backspace') {
                    this.backspace();
                }
            }
        }

        // Initialize calculator when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new Calculator();
        });

