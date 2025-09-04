const math = require('mathjs');
const natural = require('natural');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class CalculatorAgent {
    constructor() {
        this.name = "AI Calculator Agent";
        this.version = "1.0.0";
        this.supportedOperations = [
            'addition', 'subtraction', 'multiplication', 'division',
            'exponentiation', 'square root', 'logarithm', 'trigonometry',
            'statistics', 'algebra', 'calculus', 'geometry', 'unit conversion',
            'graphing', 'plotting', 'visualization'
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

        // Unit conversion data
        this.unitConversions = {
            // Length
            'length': {
                'mm': 0.001, 'millimeter': 0.001, 'millimeters': 0.001,
                'cm': 0.01, 'centimeter': 0.01, 'centimeters': 0.01,
                'm': 1, 'meter': 1, 'meters': 1,
                'km': 1000, 'kilometer': 1000, 'kilometers': 1000,
                'in': 0.0254, 'inch': 0.0254, 'inches': 0.0254,
                'ft': 0.3048, 'foot': 0.3048, 'feet': 0.3048,
                'yd': 0.9144, 'yard': 0.9144, 'yards': 0.9144,
                'mi': 1609.344, 'mile': 1609.344, 'miles': 1609.344
            },
            // Weight/Mass
            'weight': {
                'mg': 0.001, 'milligram': 0.001, 'milligrams': 0.001,
                'g': 1, 'gram': 1, 'grams': 1,
                'kg': 1000, 'kilogram': 1000, 'kilograms': 1000,
                'oz': 28.3495, 'ounce': 28.3495, 'ounces': 28.3495,
                'lb': 453.592, 'pound': 453.592, 'pounds': 453.592,
                'ton': 1000000, 'metric ton': 1000000, 'tonne': 1000000
            },
            // Temperature
            'temperature': {
                'c': 'celsius', 'celsius': 'celsius', '°c': 'celsius',
                'f': 'fahrenheit', 'fahrenheit': 'fahrenheit', '°f': 'fahrenheit',
                'k': 'kelvin', 'kelvin': 'kelvin'
            },
            // Area
            'area': {
                'mm²': 0.000001, 'cm²': 0.0001, 'm²': 1, 'km²': 1000000,
                'in²': 0.00064516, 'ft²': 0.092903, 'yd²': 0.836127,
                'acre': 4046.86, 'hectare': 10000
            },
            // Volume
            'volume': {
                'ml': 0.001, 'milliliter': 0.001, 'milliliters': 0.001,
                'l': 1, 'liter': 1, 'liters': 1,
                'gal': 3.78541, 'gallon': 3.78541, 'gallons': 3.78541,
                'qt': 0.946353, 'quart': 0.946353, 'quarts': 0.946353,
                'pt': 0.473176, 'pint': 0.473176, 'pints': 0.473176,
                'cup': 0.236588, 'cups': 0.236588,
                'fl oz': 0.0295735, 'fluid ounce': 0.0295735, 'fluid ounces': 0.0295735
            },
            // Time
            'time': {
                'ms': 0.001, 'millisecond': 0.001, 'milliseconds': 0.001,
                's': 1, 'second': 1, 'seconds': 1,
                'min': 60, 'minute': 60, 'minutes': 60,
                'h': 3600, 'hour': 3600, 'hours': 3600,
                'day': 86400, 'days': 86400,
                'week': 604800, 'weeks': 604800,
                'month': 2629746, 'months': 2629746,
                'year': 31556952, 'years': 31556952
            }
        };

        // Unit conversion keywords
        this.unitKeywords = {
            'convert': 'convert', 'conversion': 'convert', 'to': 'to',
            'from': 'from', 'in': 'in', 'as': 'as'
        };

        // Graphing keywords
        this.graphKeywords = {
            'plot': 'plot', 'graph': 'plot', 'chart': 'plot', 'draw': 'plot',
            'visualize': 'plot', 'show': 'plot', 'display': 'plot',
            'function': 'function', 'equation': 'function', 'formula': 'function',
            'scatter': 'scatter', 'line': 'line', 'bar': 'bar', 'histogram': 'histogram'
        };

        // Initialize plotting capabilities
        this.plotsDir = path.join(process.cwd(), 'plots');

        // In-memory calculation history and memory
        this.history = [];
        this.historyLimit = 50;
        this.lastAnswer = null;
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
            let cleanedInput = this.cleanInput(input);

            // Support 'ans' token to reference last answer
            if (this.lastAnswer !== null) {
                cleanedInput = cleanedInput.replace(/\bans\b/g, String(this.lastAnswer));
            }
            
            // Determine if it's a natural language request or mathematical expression
            const isNaturalLanguage = this.isNaturalLanguage(cleanedInput);
            
            let expression;
            let operationType;
            
            if (isNaturalLanguage) {
                // Check if it's a graphing request first
                if (this.containsGraphKeywords(cleanedInput)) {
                    const parsed = this.parseGraphingRequest(cleanedInput);
                    expression = parsed; // Keep the entire parsed object for graphing
                    operationType = parsed.operationType;
                } else if (this.containsUnitKeywords(cleanedInput)) {
                    const parsed = this.parseUnitConversion(cleanedInput);
                    expression = parsed.expression;
                    operationType = parsed.operationType;
                } else {
                    const parsed = this.parseNaturalLanguage(cleanedInput);
                    expression = parsed.expression;
                    operationType = parsed.operationType;
                }
            } else {
                expression = cleanedInput;
                operationType = this.detectOperationType(cleanedInput);
            }
            
            // Validate expression (skip validation for graphing operations)
            if (operationType !== 'graphing' && !this.isValidExpression(expression)) {
                throw new Error('Invalid mathematical expression');
            }
            
            // Perform calculation or generate plot
            let result;
            let additionalData = {};
            
            if (operationType === 'graphing' && typeof expression === 'object') {
                if (expression.graphType === 'function') {
                    result = await this.generateFunctionPlot(expression.expression, expression.from, expression.to);
                    additionalData = {
                        graphType: expression.graphType,
                        from: expression.from,
                        to: expression.to
                    };
                } else if (expression.graphType === 'scatter') {
                    result = await this.generateScatterPlot(expression.x, expression.y);
                    additionalData = {
                        graphType: expression.graphType,
                        points: expression.x.length
                    };
                } else if (expression.graphType === 'histogram') {
                    result = await this.generateHistogram(expression.data);
                    additionalData = {
                        graphType: expression.graphType,
                        dataPoints: expression.data.length
                    };
                }
            } else {
                result = this.evaluateExpression(expression);
            }
            
            const successPayload = {
                success: true,
                input: input,
                expression: expression.expression || expression,
                result: result,
                operationType: operationType,
                timestamp: new Date().toISOString(),
                agent: this.name,
                ...additionalData
            };

            // Update memory/history only on successful non-graphing calculations or when graph generated successfully
            if (successPayload.success) {
                let numericResult = null;
                if (typeof successPayload.result === 'number') {
                    numericResult = successPayload.result;
                } else if (successPayload.operationType === 'unit conversion' && typeof successPayload.result === 'number') {
                    numericResult = successPayload.result;
                }

                if (numericResult !== null) {
                    this.lastAnswer = numericResult;
                }

                // Store compact entry
                this.addHistoryEntry({
                    input: successPayload.input,
                    expression: successPayload.expression,
                    operationType: successPayload.operationType,
                    result: successPayload.result,
                    timestamp: successPayload.timestamp
                });
            }

            return successPayload;
            
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
        
        // Check if it's a graphing request first
        if (this.containsGraphKeywords(input)) {
            return true;
        }
        
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
     * Parse unit conversion requests
     */
    parseUnitConversion(input) {
        const numbers = this.extractNumbers(input);
        if (numbers.length === 0) {
            throw new Error('No number found for unit conversion');
        }
        
        const value = numbers[0];
        const { fromUnit, toUnit, category } = this.extractUnits(input);
        
        if (!fromUnit || !toUnit) {
            throw new Error('Could not identify source and target units');
        }
        
        const result = this.convertUnit(value, fromUnit, toUnit, category);
        
        return {
            expression: `${value} ${fromUnit} to ${toUnit}`,
            operationType: 'unit conversion',
            result: result,
            fromUnit: fromUnit,
            toUnit: toUnit,
            category: category
        };
    }

    /**
     * Extract units from input text
     */
    extractUnits(input) {
        const tokens = this.tokenizer.tokenize(input.toLowerCase());
        let fromUnit = null;
        let toUnit = null;
        let category = null;
        
        // Find "to" keyword to separate source and target units
        const toIndex = tokens.findIndex(token => token === 'to' || token === 'in' || token === 'as');
        
        if (toIndex === -1) {
            // Try to find units without explicit "to" keyword
            for (const [cat, units] of Object.entries(this.unitConversions)) {
                for (const [unit, _] of Object.entries(units)) {
                    if (input.toLowerCase().includes(unit)) {
                        if (!fromUnit) {
                            fromUnit = unit;
                            category = cat;
                        } else if (!toUnit) {
                            toUnit = unit;
                            break;
                        }
                    }
                }
                if (toUnit) break;
            }
        } else {
            // Parse units before and after "to"
            const beforeTo = tokens.slice(0, toIndex).join(' ');
            const afterTo = tokens.slice(toIndex + 1).join(' ');
            
            // Find source unit
            for (const [cat, units] of Object.entries(this.unitConversions)) {
                for (const [unit, _] of Object.entries(units)) {
                    if (beforeTo.includes(unit)) {
                        fromUnit = unit;
                        category = cat;
                        break;
                    }
                }
                if (fromUnit) break;
            }
            
            // Find target unit
            for (const [unit, _] of Object.entries(this.unitConversions[category] || {})) {
                if (afterTo.includes(unit)) {
                    toUnit = unit;
                    break;
                }
            }
        }
        
        return { fromUnit, toUnit, category };
    }

    /**
     * Convert between units
     */
    convertUnit(value, fromUnit, toUnit, category) {
        if (category === 'temperature') {
            return this.convertTemperature(value, fromUnit, toUnit);
        }
        
        const units = this.unitConversions[category];
        if (!units || !units[fromUnit] || !units[toUnit]) {
            throw new Error(`Unsupported unit conversion: ${fromUnit} to ${toUnit}`);
        }
        
        // Convert to base unit first, then to target unit
        const baseValue = value * units[fromUnit];
        const result = baseValue / units[toUnit];
        
        return result;
    }

    /**
     * Convert temperature between Celsius, Fahrenheit, and Kelvin
     */
    convertTemperature(value, fromUnit, toUnit) {
        const from = fromUnit.toLowerCase();
        const to = toUnit.toLowerCase();
        
        // Convert to Celsius first
        let celsius;
        if (from === 'celsius' || from === 'c' || from === '°c') {
            celsius = value;
        } else if (from === 'fahrenheit' || from === 'f' || from === '°f') {
            celsius = (value - 32) * 5/9;
        } else if (from === 'kelvin' || from === 'k') {
            celsius = value - 273.15;
        } else {
            throw new Error(`Unsupported temperature unit: ${fromUnit}`);
        }
        
        // Convert from Celsius to target unit
        if (to === 'celsius' || to === 'c' || to === '°c') {
            return celsius;
        } else if (to === 'fahrenheit' || to === 'f' || to === '°f') {
            return (celsius * 9/5) + 32;
        } else if (to === 'kelvin' || to === 'k') {
            return celsius + 273.15;
        } else {
            throw new Error(`Unsupported temperature unit: ${toUnit}`);
        }
    }

    /**
     * Check if input contains unit conversion keywords
     */
    containsUnitKeywords(input) {
        return Object.keys(this.unitKeywords).some(keyword => 
            input.includes(keyword)
        ) || this.containsUnitNames(input);
    }

    /**
     * Check if input contains unit names
     */
    containsUnitNames(input) {
        for (const [category, units] of Object.entries(this.unitConversions)) {
            for (const unit of Object.keys(units)) {
                if (input.toLowerCase().includes(unit)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Parse graphing requests
     */
    parseGraphingRequest(input) {
        const numbers = this.extractNumbers(input);
        const graphType = this.detectGraphType(input);
        
        if (graphType === 'function') {
            return this.parseFunctionPlot(input);
        } else if (graphType === 'scatter') {
            return this.parseScatterPlot(input);
        } else if (graphType === 'histogram') {
            return this.parseHistogram(input);
        } else {
            throw new Error('Unsupported graph type');
        }
    }

    /**
     * Detect graph type from input
     */
    detectGraphType(input) {
        if (input.includes('scatter') || input.includes('points')) {
            return 'scatter';
        } else if (input.includes('histogram') || input.includes('distribution')) {
            return 'histogram';
        } else if (input.includes('function') || input.includes('equation') || input.includes('formula')) {
            return 'function';
        } else {
            return 'function'; // Default to function plotting
        }
    }

    /**
     * Parse function plotting requests
     */
    parseFunctionPlot(input) {
        // Extract function expression - more flexible regex
        const functionMatch = input.match(/(?:plot|graph|draw|show|display)\s+(.+?)(?:\s+from\s+(-?\d+(?:\.\d+)?))?(?:\s+to\s+(-?\d+(?:\.\d+)?))?$/i);
        
        if (!functionMatch) {
            throw new Error('Could not extract function expression');
        }
        
        const expression = functionMatch[1].trim();
        const from = functionMatch[2] ? parseFloat(functionMatch[2]) : -10;
        const to = functionMatch[3] ? parseFloat(functionMatch[3]) : 10;
        
        return {
            expression: expression,
            operationType: 'graphing',
            graphType: 'function',
            from: from,
            to: to,
            result: null // Will be generated during plotting
        };
    }

    /**
     * Parse scatter plot requests
     */
    parseScatterPlot(input) {
        const numbers = this.extractNumbers(input);
        
        if (numbers.length < 4) {
            throw new Error('Scatter plot requires at least 2 data points (4 numbers)');
        }
        
        // Split numbers into x and y coordinates
        const x = numbers.filter((_, index) => index % 2 === 0);
        const y = numbers.filter((_, index) => index % 2 === 1);
        
        return {
            expression: `scatter plot with ${x.length} points`,
            operationType: 'graphing',
            graphType: 'scatter',
            x: x,
            y: y,
            result: null
        };
    }

    /**
     * Parse histogram requests
     */
    parseHistogram(input) {
        const numbers = this.extractNumbers(input);
        
        if (numbers.length === 0) {
            throw new Error('Histogram requires data points');
        }
        
        return {
            expression: `histogram with ${numbers.length} data points`,
            operationType: 'graphing',
            graphType: 'histogram',
            data: numbers,
            result: null
        };
    }

    /**
     * Check if input contains graphing keywords
     */
    containsGraphKeywords(input) {
        return Object.keys(this.graphKeywords).some(keyword => 
            input.includes(keyword)
        );
    }

    /**
     * Generate plot data for a function
     */
    generateFunctionData(expression, from, to, points = 100) {
        const x = [];
        const y = [];
        const step = (to - from) / points;
        
        for (let i = 0; i <= points; i++) {
            const xVal = from + i * step;
            try {
                // Replace 'x' with the actual value in the expression
                const evalExpression = expression.replace(/x/g, `(${xVal})`);
                const yVal = math.evaluate(evalExpression);
                if (isFinite(yVal)) {
                    x.push(xVal);
                    y.push(yVal);
                }
            } catch (error) {
                // Skip invalid points
                continue;
            }
        }
        
        return { x, y };
    }

    /**
     * Create and save a plot as HTML file
     */
    async createPlot(plotData, filename = 'plot.html') {
        try {
            // Create plots directory if it doesn't exist
            if (!fs.existsSync(this.plotsDir)) {
                fs.mkdirSync(this.plotsDir, { recursive: true });
            }
            
            const filepath = path.join(this.plotsDir, filename);
            
            // Generate HTML content with Chart.js
            const htmlContent = this.generateHTMLPlot(plotData);
            
            // Write HTML file
            fs.writeFileSync(filepath, htmlContent, 'utf8');
            
            return filepath;
        } catch (error) {
            throw new Error(`Failed to create plot: ${error.message}`);
        }
    }

    /**
     * Generate HTML content for plotting
     */
    generateHTMLPlot(plotData) {
        const { x, y, type, name, color = 'blue' } = plotData;
        
        if (!x || !y) {
            throw new Error('Invalid plot data: missing x or y values');
        }
        
        let chartConfig;
        
        if (type === 'scatter' && plotData.mode === 'lines') {
            // Function plot
            chartConfig = {
                type: 'line',
                data: {
                    labels: x.map(val => val.toFixed(2)),
                    datasets: [{
                        label: name || 'Function',
                        data: y,
                        borderColor: color,
                        backgroundColor: color + '20',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: name || 'Mathematical Function'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'X'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Y'
                            }
                        }
                    }
                }
            };
        } else if (type === 'scatter' && plotData.mode === 'markers') {
            // Scatter plot
            chartConfig = {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: name || 'Data Points',
                        data: x.map((xVal, i) => ({ x: xVal, y: y[i] })),
                        backgroundColor: color,
                        borderColor: color
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: name || 'Scatter Plot'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'X'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Y'
                            }
                        }
                    }
                }
            };
        } else if (type === 'histogram') {
            // Histogram
            chartConfig = {
                type: 'bar',
                data: {
                    labels: x.map((val, i) => `Bin ${i + 1}`),
                    datasets: [{
                        label: name || 'Frequency',
                        data: y,
                        backgroundColor: color + '80',
                        borderColor: color,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: name || 'Histogram'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Bins'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Frequency'
                            }
                        }
                    }
                }
            };
        }
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Mathematical Plot</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        canvas { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Mathematical Plot</h2>
        <canvas id="plotChart"></canvas>
    </div>
    <script>
        const ctx = document.getElementById('plotChart').getContext('2d');
        const chartConfig = ${JSON.stringify(chartConfig, null, 2)};
        const chart = new Chart(ctx, chartConfig);
    </script>
</body>
</html>`;
    }

    /**
     * Generate plot for a function
     */
    async generateFunctionPlot(expression, from, to) {
        const { x, y } = this.generateFunctionData(expression, from, to);
        
        const plotData = {
            x: x,
            y: y,
            type: 'scatter',
            mode: 'lines',
            name: `y = ${expression}`,
            line: { color: 'blue' }
        };
        
        const filename = `function_${Date.now()}.html`;
        const filepath = await this.createPlot(plotData, filename);
        
        return {
            success: true,
            filepath: filepath,
            expression: expression,
            from: from,
            to: to,
            points: x.length
        };
    }

    /**
     * Generate scatter plot
     */
    async generateScatterPlot(x, y) {
        const plotData = {
            x: x,
            y: y,
            type: 'scatter',
            mode: 'markers',
            name: 'Data Points',
            marker: { color: 'red', size: 8 }
        };
        
        const filename = `scatter_${Date.now()}.html`;
        const filepath = await this.createPlot(plotData, filename);
        
        return {
            success: true,
            filepath: filepath,
            points: x.length
        };
    }

    /**
     * Generate histogram
     */
    async generateHistogram(data) {
        // Create histogram bins
        const bins = this.createHistogramBins(data);
        
        const plotData = {
            x: bins.labels,
            y: bins.counts,
            type: 'histogram',
            name: 'Distribution',
            color: 'green'
        };
        
        const filename = `histogram_${Date.now()}.html`;
        const filepath = await this.createPlot(plotData, filename);
        
        return {
            success: true,
            filepath: filepath,
            dataPoints: data.length
        };
    }

    /**
     * Create histogram bins from data
     */
    createHistogramBins(data) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const numBins = Math.min(10, Math.ceil(Math.sqrt(data.length)));
        const binWidth = (max - min) / numBins;
        
        const bins = [];
        const counts = [];
        
        for (let i = 0; i < numBins; i++) {
            const binStart = min + i * binWidth;
            const binEnd = min + (i + 1) * binWidth;
            bins.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
            
            const count = data.filter(val => val >= binStart && val < binEnd).length;
            counts.push(count);
        }
        
        return { labels: bins, counts };
    }

    /**
     * Extract numbers from text
     */
    extractNumbers(text) {
        const numberRegex = /-?\d+\.?\d*/g;
        return text.match(numberRegex)?.map(Number) || [];
    }

    /**
     * History helpers
     */
    addHistoryEntry(entry) {
        this.history.push(entry);
        if (this.history.length > this.historyLimit) {
            this.history.shift();
        }
    }

    getHistory(limit = 10) {
        if (limit <= 0) return [];
        return this.history.slice(-limit).reverse();
    }

    clearHistory() {
        this.history = [];
        this.lastAnswer = null;
    }

    getLastAnswer() {
        return this.lastAnswer;
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
            // For graphing operations, we don't need to validate the expression the same way
            if (typeof expression === 'object' && expression.operationType === 'graphing') {
                return true;
            }
            
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
                'Unit conversion (length, weight, temperature, area, volume, time)',
                'Graphing and visualization (function plots, scatter plots, histograms)',
                'Memory of previous calculations (history, ans token)',
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
        
        // Special formatting for graphing operations
        if (result.operationType === 'graphing' && result.result && result.result.filepath) {
            return chalk.green(`📊 Plot generated successfully!\n   File: ${result.result.filepath}\n   Type: ${result.graphType}\n   Open in browser to view the plot`);
        }
        
        // Special formatting for unit conversions
        if (result.operationType === 'unit conversion' && result.fromUnit && result.toUnit) {
            const formattedResult = typeof result.result === 'number' 
                ? result.result.toFixed(6).replace(/\.?0+$/, '')
                : result.result.toString();
            return chalk.green(`✅ Result: ${formattedResult} ${result.toUnit}`);
        }
        
        const formattedResult = typeof result.result === 'number' 
            ? result.result.toFixed(6).replace(/\.?0+$/, '')
            : result.result.toString();
            
        return chalk.green(`✅ Result: ${formattedResult}`);
    }
}

module.exports = CalculatorAgent;
