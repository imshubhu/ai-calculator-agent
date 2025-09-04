#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const readline = require('readline');
const CalculatorAgent = require('./CalculatorAgent');

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

            if (trimmedInput === 'examples') {
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
        console.log(chalk.white('help, h          - Show this help message'));
        console.log(chalk.white('info             - Show agent information'));
        console.log(chalk.white('examples         - Show example calculations'));
        console.log(chalk.white('clear            - Clear the screen'));
        console.log(chalk.white('exit, quit       - Exit the program'));
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
}

// Create and run CLI
const cli = new CalculatorCLI();
cli.run();
