#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const readline = require('readline');
const CalculatorAgent = require('./CalculatorAgent');
const express = require('express');
const cors = require('cors');
const path = require('path');

class CalculatorCLI {
    constructor() {
        this.agent = new CalculatorAgent();
        this.program = new Command();
        this.setupCommands();
    }

    setupCommands() {
        this.program
            .name('ai-calculator')
            .description('AI-powered calculator agent with natural language processing')
            .version('1.0.0');

        // Interactive mode
        this.program
            .command('interactive')
            .alias('i')
            .description('Start interactive calculator session')
            .action(() => this.startInteractiveMode());

        // Single calculation
        this.program
            .command('calc <expression>')
            .alias('c')
            .description('Calculate a single expression')
            .action((expression) => this.calculateSingle(expression));

        // Natural language calculation
        this.program
            .command('ask <question>')
            .alias('a')
            .description('Ask a question in natural language')
            .action((question) => this.askQuestion(question));

        // Unit conversion
        this.program
            .command('convert <value> <from> <to>')
            .alias('conv')
            .description('Convert between units (e.g., convert 100 cm to m)')
            .action((value, from, to) => this.convertUnits(value, from, to));

        // Graphing commands
        this.program
            .command('plot <expression>')
            .alias('graph')
            .description('Plot a mathematical function (e.g., plot x^2)')
            .option('-f, --from <number>', 'Start value for x-axis', '-10')
            .option('-t, --to <number>', 'End value for x-axis', '10')
            .action((expression, options) => this.plotFunction(expression, options));

        this.program
            .command('scatter <x1,y1> [x2,y2] [x3,y3]...')
            .description('Create a scatter plot from data points')
            .action((...points) => this.createScatterPlot(points));

        this.program
            .command('histogram <data>')
            .description('Create a histogram from data (comma-separated numbers)')
            .action((data) => this.createHistogram(data));

        // Memory commands
        this.program
            .command('history')
            .description('Show recent calculation history')
            .option('-n, --num <n>', 'Number of entries to show', '10')
            .action((options) => this.showHistory(options));

        this.program
            .command('recall [index]')
            .description('Recall a previous result by index (default: last)')
            .action((index) => this.recallResult(index));

        this.program
            .command('clear-history')
            .description('Clear calculation history and last answer')
            .action(() => this.clearHistory());

        // Show agent info
        this.program
            .command('info')
            .description('Show agent information and capabilities')
            .action(() => this.showInfo());

        // Examples
        this.program
            .command('examples')
            .description('Show example calculations')
            .action(() => this.showExamples());

        // Default to interactive mode if no command provided
        this.program
            .action(() => this.startInteractiveMode());

        // Web server
        this.program
            .command('web')
            .description('Start web server interface')
            .option('-p, --port <port>', 'Port to run the server on', '3000')
            .action((options) => this.startWebServer(parseInt(options.port, 10) || 3000));
    }

    async startInteractiveMode() {
        console.log(chalk.cyan.bold('\n🤖 AI Calculator Agent - Interactive Mode'));
        console.log(chalk.gray('Type "help" for commands, "exit" to quit\n'));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.blue('calc> ')
        });

        rl.prompt();

        rl.on('line', async (input) => {
            const trimmedInput = input.trim();
            
            if (trimmedInput === 'exit' || trimmedInput === 'quit') {
                console.log(chalk.yellow('👋 Goodbye!'));
                rl.close();
                return;
            }

            if (trimmedInput === 'help') {
                this.showHelp();
                rl.prompt();
                return;
            }

            if (trimmedInput === 'info') {
                this.showInfo();
                rl.prompt();
                return;
            }

            if (trimmedInput === 'examples' || trimmedInput === 'example' || trimmedInput === 'e') {
                this.showExamples();
                rl.prompt();
                return;
            }

            if (trimmedInput === 'clear') {
                console.clear();
                console.log(chalk.cyan.bold('\n🤖 AI Calculator Agent - Interactive Mode'));
                console.log(chalk.gray('Type "help" for commands, "exit" to quit\n'));
                rl.prompt();
                return;
            }

            if (trimmedInput.includes('history')) {
                this.showHistory();
                rl.prompt();
                return;
            }

            if (trimmedInput === '') {
                rl.prompt();
                return;
            }

            try {
                const result = await this.agent.calculate(trimmedInput);
                console.log(this.agent.formatResult(result));
                
                if (result.success) {
                    console.log(chalk.gray(`   Expression: ${result.expression}`));
                    console.log(chalk.gray(`   Operation: ${result.operationType}`));
                }
            } catch (error) {
                console.log(chalk.red(`❌ Error: ${error.message}`));
            }

            console.log(); // Empty line for readability
            rl.prompt();
        });

        rl.on('close', () => {
            process.exit(0);
        });
    }

    async calculateSingle(expression) {
        try {
            const result = await this.agent.calculate(expression);
            console.log(this.agent.formatResult(result));
            
            if (result.success) {
                console.log(chalk.gray(`Expression: ${result.expression}`));
                console.log(chalk.gray(`Operation: ${result.operationType}`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    async askQuestion(question) {
        try {
            const result = await this.agent.calculate(question);
            console.log(chalk.cyan(`🤖 Question: ${question}`));
            console.log(this.agent.formatResult(result));
            
            if (result.success) {
                console.log(chalk.gray(`Expression: ${result.expression}`));
                console.log(chalk.gray(`Operation: ${result.operationType}`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    async convertUnits(value, from, to) {
        try {
            const conversionQuery = `convert ${value} ${from} to ${to}`;
            const result = await this.agent.calculate(conversionQuery);
            console.log(chalk.cyan(`🔄 Converting: ${value} ${from} to ${to}`));
            console.log(this.agent.formatResult(result));
            
            if (result.success) {
                console.log(chalk.gray(`Expression: ${result.expression}`));
                console.log(chalk.gray(`Operation: ${result.operationType}`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    async plotFunction(expression, options) {
        try {
            const from = parseFloat(options.from);
            const to = parseFloat(options.to);
            const plotQuery = `plot ${expression} from ${from} to ${to}`;
            const result = await this.agent.calculate(plotQuery);
            console.log(chalk.cyan(`📊 Plotting: ${expression} from ${from} to ${to}`));
            console.log(this.agent.formatResult(result));
            
            if (result.success) {
                console.log(chalk.gray(`Expression: ${result.expression}`));
                console.log(chalk.gray(`Operation: ${result.operationType}`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    async createScatterPlot(points) {
        try {
            // Parse points from command line arguments
            const dataPoints = points.map(point => {
                const [x, y] = point.split(',').map(Number);
                return { x, y };
            }).filter(point => !isNaN(point.x) && !isNaN(point.y));
            
            if (dataPoints.length < 2) {
                throw new Error('At least 2 data points are required for scatter plot');
            }
            
            const x = dataPoints.map(p => p.x);
            const y = dataPoints.map(p => p.y);
            const scatterQuery = `scatter plot ${x.join(' ')} ${y.join(' ')}`;
            const result = await this.agent.calculate(scatterQuery);
            console.log(chalk.cyan(`📊 Creating scatter plot with ${dataPoints.length} points`));
            console.log(this.agent.formatResult(result));
            
            if (result.success) {
                console.log(chalk.gray(`Expression: ${result.expression}`));
                console.log(chalk.gray(`Operation: ${result.operationType}`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    async createHistogram(data) {
        try {
            const numbers = data.split(',').map(Number).filter(n => !isNaN(n));
            
            if (numbers.length === 0) {
                throw new Error('No valid numbers found in data');
            }
            
            const histogramQuery = `histogram ${numbers.join(' ')}`;
            const result = await this.agent.calculate(histogramQuery);
            console.log(chalk.cyan(`📊 Creating histogram with ${numbers.length} data points`));
            console.log(this.agent.formatResult(result));
            
            if (result.success) {
                console.log(chalk.gray(`Expression: ${result.expression}`));
                console.log(chalk.gray(`Operation: ${result.operationType}`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
        }
    }

    async showHistory(options) {
        const num = parseInt(options?.num || '10', 10);
        const entries = this.agent.getHistory(isNaN(num) ? 10 : num);
        if (entries.length === 0) {
            console.log(chalk.yellow('History is empty.'));
            return;
        }
        console.log(chalk.cyan.bold(`\n📝 Last ${entries.length} calculations:\n`));
        entries.forEach((e, i) => {
            const idx = entries.length - i;
            const res = typeof e.result === 'number' ? e.result : (e.result?.filepath || e.result);
            console.log(chalk.white(`#${idx} ${e.operationType} → ${res}`));
            console.log(chalk.gray(`   Input: ${e.input}`));
            console.log(chalk.gray(`   Expr: ${e.expression}`));
            console.log(chalk.gray(`   At:   ${e.timestamp}`));
        });
        console.log();
    }

    async recallResult(index) {
        const entries = this.agent.getHistory(1000);
        if (entries.length === 0) {
            console.log(chalk.yellow('History is empty.'));
            return;
        }
        let idx = 1;
        if (index !== undefined) {
            const parsed = parseInt(index, 10);
            if (!isNaN(parsed) && parsed > 0) idx = parsed;
        }
        const entry = entries[idx - 1];
        if (!entry) {
            console.log(chalk.red('Invalid history index.'));
            return;
        }
        const res = typeof entry.result === 'number' ? entry.result : (entry.result?.filepath || entry.result);
        console.log(chalk.green(`Recalled #${idx}: ${res}`));
    }

    clearHistory() {
        this.agent.clearHistory();
        console.log(chalk.yellow('History and last answer cleared.'));
    }

    showInfo() {
        const info = this.agent.getInfo();
        console.log(chalk.cyan.bold('\n🤖 AI Calculator Agent Information\n'));
        console.log(chalk.white(`Name: ${info.name}`));
        console.log(chalk.white(`Version: ${info.version}`));
        console.log(chalk.white(`Supported Operations: ${info.supportedOperations.join(', ')}`));
        console.log(chalk.white('\nCapabilities:'));
        info.capabilities.forEach(capability => {
            console.log(chalk.gray(`  • ${capability}`));
        });
        console.log();
    }

    showHelp() {
        console.log(chalk.cyan.bold('\n📚 Available Commands:\n'));
        console.log(chalk.white('help, h               - Show this help message'));
        console.log(chalk.white('info                  - Show agent information'));
        console.log(chalk.white('examples, e           - Show example calculations'));
        console.log(chalk.white('convert <v> <f> <t>   - Convert units'));
        console.log(chalk.white('plot <expr> [--from --to] - Plot a function'));
        console.log(chalk.white('scatter <x1,y1> ...   - Scatter plot'));
        console.log(chalk.white('histogram <n1,...>    - Histogram from numbers'));
        console.log(chalk.white('history [-n N]        - Show recent calculations'));
        console.log(chalk.white('recall [index]        - Recall a previous result'));
        console.log(chalk.white('clear-history         - Clear memory'));
        console.log(chalk.white('clear                 - Clear the screen'));
        console.log(chalk.white('exit, quit            - Exit the program'));
        console.log(chalk.gray('\nYou can also type mathematical expressions or natural language questions directly.'));
        console.log();
    }

    showExamples() {
        console.log(chalk.cyan.bold('\n💡 Example Calculations:\n'));
        
        const examples = [
            {
                type: 'Mathematical Expressions',
                examples: [
                    '2 + 3 * 4',
                    'sqrt(16)',
                    'sin(30)',
                    'log(100)',
                    '2^8',
                    'mean([1, 2, 3, 4, 5])'
                ]
            },
            {
                type: 'Natural Language',
                examples: [
                    'What is 15 plus 27?',
                    'Calculate the square root of 144',
                    'What is the sine of 45 degrees?',
                    'Find the mean of 10, 20, 30, 40, 50',
                    'What is 2 to the power of 10?',
                    'Add 5 and 7 then multiply by 3'
                ]
            },
            {
                type: 'Unit Conversions',
                examples: [
                    'Convert 100 cm to meters',
                    'Convert 32 fahrenheit to celsius',
                    'Convert 5 feet to inches',
                    'Convert 2.5 kg to pounds',
                    'Convert 1 gallon to liters',
                    'Convert 1 hour to seconds',
                    'Convert 100 square meters to acres'
                ]
            },
            {
                type: 'Graphing & Visualization',
                examples: [
                    'Plot x^2 from -5 to 5',
                    'Graph sin(x) from 0 to 2*pi',
                    'Draw y = 2*x + 3',
                    'Show scatter plot with points 1,2 3,4 5,6',
                    'Create histogram of 1,2,3,4,5,6,7,8,9,10',
                    'Visualize cos(x) from -pi to pi',
                    'Plot exponential function e^x'
                ]
            },
            {
                type: 'Memory',
                examples: [
                    '2 + 3',
                    'ans * 4',
                    'history',
                    'history -n 5',
                    'recall',
                    'recall 2',
                    'clear-history'
                ]
            }
        ];

        examples.forEach(section => {
            console.log(chalk.white.bold(`${section.type}:`));
            section.examples.forEach(example => {
                console.log(chalk.gray(`  • ${example}`));
            });
            console.log();
        });
    }

    run() {
        this.program.parse();
    }

    startWebServer(port) {
        const app = express();
        app.use(cors());
        app.use(express.json());

        // Serve static frontend and plots directory
        const publicDir = path.join(process.cwd(), 'public');
        app.use('/plots', express.static(path.join(process.cwd(), 'plots')));
        app.use(express.static(publicDir));

        // REST endpoints
        app.post('/api/calculate', async (req, res) => {
            try {
                const { input } = req.body || {};
                if (!input || typeof input !== 'string') {
                    return res.status(400).json({ success: false, error: 'Missing input' });
                }
                const result = await this.agent.calculate(input);
                return res.json(result);
            } catch (e) {
                return res.status(500).json({ success: false, error: e.message });
            }
        });

        app.get('/api/history', (req, res) => {
            const n = parseInt(req.query.n, 10) || 10;
            return res.json({ success: true, history: this.agent.getHistory(n) });
        });

        app.post('/api/clear-history', (req, res) => {
            this.agent.clearHistory();
            return res.json({ success: true });
        });

        app.get('/api/info', (req, res) => {
            return res.json(this.agent.getInfo());
        });

        app.listen(port, () => {
            console.log(chalk.cyan(`\n🌐 Web server running at http://localhost:${port}`));
            console.log(chalk.gray(`Serving static files from ${publicDir} and plots from /plots`));
        });
    }
}

// Create and run CLI
const cli = new CalculatorCLI();
cli.run();
