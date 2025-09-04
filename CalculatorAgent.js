const math = require('mathjs');
const natural = require('natural');
const chalk = require('chalk');

class CalculatorAgent {
    constructor() {
        this.name = "AI Calculator Agent";
        this.version = "1.0.0";
        this.supportedOperations = [
            'addition', 'subtraction', 'multiplication', 'division',
            'exponentiation', 'square root', 'logarithm', 'trigonometry',
            'statistics', 'algebra', 'calculus', 'geometry'
        ];
        
        // Initialize natural language processing
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        
        // Mathematical keywords mapping
        this.mathKeywords = {
            'add': '+', 'plus': '+', 'addition': '+', 'sum': '+',
            'subtract': '-', 'minus': '-', 'subtraction': '-', 'difference': '-',
            'multiply': '*', 'times': '*', 'multiplication': '*', 'product': '*',
            'divide': '/', 'division': '/', 'quotient': '/',
            'power': '^', 'exponent': '^', 'exponentiation': '^',
            'sqrt': 'sqrt', 'square root': 'sqrt',
            'log': 'log', 'logarithm': 'log',
            'sin': 'sin', 'cos': 'cos', 'tan': 'tan',
            'pi': 'pi', 'e': 'e'
        };
        
        // Statistics functions
        this.statsKeywords = {
            'mean': 'mean', 'average': 'mean', 'avg': 'mean',
            'median': 'median', 'mode': 'mode',
            'standard deviation': 'std', 'variance': 'var',
            'sum': 'sum', 'count': 'count'
        };
    }

    /**
     * Main method to process calculation requests
     * @param {string} input - Natural language or mathematical expression
     * @returns {Object} - Result object with answer and metadata
     */
    async calculate(input) {
        try {
            console.log(chalk.blue(`🤖 ${this.name} processing: "${input}"`));
            
            // Clean and normalize input
            const cleanedInput = this.cleanInput(input);
            
            // Determine if it's a natural language request or mathematical expression
            const isNaturalLanguage = this.isNaturalLanguage(cleanedInput);
            
            let expression;
            let operationType;
            
            if (isNaturalLanguage) {
                const parsed = this.parseNaturalLanguage(cleanedInput);
                expression = parsed.expression;
                operationType = parsed.operationType;
            } else {
                expression = cleanedInput;
                operationType = this.detectOperationType(cleanedInput);
            }
            
            // Validate expression
            if (!this.isValidExpression(expression)) {
                throw new Error('Invalid mathematical expression');
            }
            
            // Perform calculation
            const result = this.evaluateExpression(expression);
            
            return {
                success: true,
                input: input,
                expression: expression,
                result: result,
                operationType: operationType,
                timestamp: new Date().toISOString(),
                agent: this.name
            };
            
        } catch (error) {
            return {
                success: false,
                input: input,
                error: error.message,
                timestamp: new Date().toISOString(),
                agent: this.name
            };
        }
    }

    /**
     * Clean and normalize input string
     */
    cleanInput(input) {
        return input
            .toLowerCase()
            .trim()
            .replace(/[^\w\s+\-*/().,^√π]/g, '') // Remove special characters except math symbols
            .replace(/\s+/g, ' '); // Normalize whitespace
    }

    /**
     * Check if input is natural language vs mathematical expression
     */
    isNaturalLanguage(input) {
        const mathSymbols = /[+\-*/^√()]/;
        const hasMathSymbols = mathSymbols.test(input);
        const hasWords = /[a-zA-Z]/.test(input);
        
        return hasWords && !hasMathSymbols;
    }

    /**
     * Parse natural language input into mathematical expression
     */
    parseNaturalLanguage(input) {
        const tokens = this.tokenizer.tokenize(input);
        let expression = '';
        let operationType = 'arithmetic';
        
        // Handle different types of natural language requests
        if (this.containsStatsKeywords(input)) {
            return this.parseStatisticsRequest(input);
        }
        
        if (this.containsTrigKeywords(input)) {
            return this.parseTrigonometryRequest(input);
        }
        
        // Basic arithmetic parsing
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (this.isNumber(token)) {
                expression += token;
            } else if (this.mathKeywords[token]) {
                expression += this.mathKeywords[token];
            } else if (token === 'and' || token === 'with') {
                // Skip connecting words
                continue;
            } else if (this.isNumberWord(token)) {
                expression += this.wordToNumber(token);
            }
            
            // Add spaces for readability
            if (i < tokens.length - 1 && this.isNumber(tokens[i + 1])) {
                expression += ' ';
            }
        }
        
        return { expression, operationType };
    }

    /**
     * Parse statistics-related requests
     */
    parseStatisticsRequest(input) {
        const numbers = this.extractNumbers(input);
        const statsType = this.detectStatsType(input);
        
        let result;
        switch (statsType) {
            case 'mean':
                result = math.mean(numbers);
                break;
            case 'median':
                result = math.median(numbers);
                break;
            case 'std':
                result = math.std(numbers);
                break;
            case 'sum':
                result = math.sum(numbers);
                break;
            default:
                result = math.mean(numbers);
        }
        
        return {
            expression: `${statsType}(${numbers.join(', ')})`,
            operationType: 'statistics',
            result: result
        };
    }

    /**
     * Parse trigonometry requests
     */
    parseTrigonometryRequest(input) {
        const angle = this.extractNumbers(input)[0];
        const trigFunction = this.detectTrigFunction(input);
        
        let result;
        switch (trigFunction) {
            case 'sin':
                result = math.sin(math.unit(angle, 'deg'));
                break;
            case 'cos':
                result = math.cos(math.unit(angle, 'deg'));
                break;
            case 'tan':
                result = math.tan(math.unit(angle, 'deg'));
                break;
        }
        
        return {
            expression: `${trigFunction}(${angle})`,
            operationType: 'trigonometry',
            result: result
        };
    }

    /**
     * Extract numbers from text
     */
    extractNumbers(text) {
        const numberRegex = /-?\d+\.?\d*/g;
        return text.match(numberRegex)?.map(Number) || [];
    }

    /**
     * Check if string contains statistics keywords
     */
    containsStatsKeywords(input) {
        return Object.keys(this.statsKeywords).some(keyword => 
            input.includes(keyword)
        );
    }

    /**
     * Check if string contains trigonometry keywords
     */
    containsTrigKeywords(input) {
        return ['sin', 'cos', 'tan', 'sine', 'cosine', 'tangent'].some(keyword => 
            input.includes(keyword)
        );
    }

    /**
     * Detect statistics operation type
     */
    detectStatsType(input) {
        for (const [keyword, operation] of Object.entries(this.statsKeywords)) {
            if (input.includes(keyword)) {
                return operation;
            }
        }
        return 'mean';
    }

    /**
     * Detect trigonometry function
     */
    detectTrigFunction(input) {
        if (input.includes('sin') || input.includes('sine')) return 'sin';
        if (input.includes('cos') || input.includes('cosine')) return 'cos';
        if (input.includes('tan') || input.includes('tangent')) return 'tan';
        return 'sin';
    }

    /**
     * Check if token is a number
     */
    isNumber(token) {
        return !isNaN(parseFloat(token)) && isFinite(token);
    }

    /**
     * Check if token is a number word
     */
    isNumberWord(token) {
        const numberWords = {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
            'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
            'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
            'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
            'eighteen': 18, 'nineteen': 19, 'twenty': 20
        };
        return numberWords.hasOwnProperty(token);
    }

    /**
     * Convert number word to number
     */
    wordToNumber(word) {
        const numberWords = {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
            'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
            'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
            'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
            'eighteen': 18, 'nineteen': 19, 'twenty': 20
        };
        return numberWords[word] || word;
    }

    /**
     * Detect operation type from expression
     */
    detectOperationType(expression) {
        if (expression.includes('sin') || expression.includes('cos') || expression.includes('tan')) {
            return 'trigonometry';
        }
        if (expression.includes('log') || expression.includes('ln')) {
            return 'logarithm';
        }
        if (expression.includes('sqrt') || expression.includes('√')) {
            return 'square root';
        }
        if (expression.includes('^') || expression.includes('**')) {
            return 'exponentiation';
        }
        return 'arithmetic';
    }

    /**
     * Validate mathematical expression
     */
    isValidExpression(expression) {
        try {
            // Try to compile the expression
            math.compile(expression);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Evaluate mathematical expression
     */
    evaluateExpression(expression) {
        try {
            return math.evaluate(expression);
        } catch (error) {
            throw new Error(`Calculation error: ${error.message}`);
        }
    }

    /**
     * Get agent information
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            supportedOperations: this.supportedOperations,
            capabilities: [
                'Basic arithmetic (+, -, *, /)',
                'Advanced math (^, sqrt, log, sin, cos, tan)',
                'Statistics (mean, median, std, variance)',
                'Natural language processing',
                'Expression validation',
                'Error handling'
            ]
        };
    }

    /**
     * Format result for display
     */
    formatResult(result) {
        if (!result.success) {
            return chalk.red(`❌ Error: ${result.error}`);
        }
        
        const formattedResult = typeof result.result === 'number' 
            ? result.result.toFixed(6).replace(/\.?0+$/, '')
            : result.result.toString();
            
        return chalk.green(`✅ Result: ${formattedResult}`);
    }
}

module.exports = CalculatorAgent;
