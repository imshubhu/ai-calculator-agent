const CalculatorAgent = require('./CalculatorAgent');
const chalk = require('chalk');

class CalculatorTester {
    constructor() {
        this.agent = new CalculatorAgent();
        this.testResults = [];
    }

    async runTests() {
        console.log(chalk.cyan.bold('🧪 Running AI Calculator Agent Tests\n'));

        const tests = [
            // Basic arithmetic
            { input: '2 + 3', expected: 5, description: 'Basic addition' },
            { input: '10 - 4', expected: 6, description: 'Basic subtraction' },
            { input: '6 * 7', expected: 42, description: 'Basic multiplication' },
            { input: '15 / 3', expected: 5, description: 'Basic division' },
            
            // Advanced math
            { input: '2^8', expected: 256, description: 'Exponentiation' },
            { input: 'sqrt(16)', expected: 4, description: 'Square root' },
            { input: 'log(100)', expected: 2, description: 'Logarithm' },
            { input: 'sin(30)', expected: 0.5, description: 'Sine function' },
            
            // Natural language
            { input: 'What is 5 plus 3?', expected: 8, description: 'Natural language addition' },
            { input: 'Calculate 10 times 4', expected: 40, description: 'Natural language multiplication' },
            { input: 'Find the square root of 25', expected: 5, description: 'Natural language square root' },
            
            // Statistics
            { input: 'mean([1, 2, 3, 4, 5])', expected: 3, description: 'Mean calculation' },
            { input: 'What is the average of 10, 20, 30?', expected: 20, description: 'Natural language mean' },
            
            // Complex expressions
            { input: '(2 + 3) * 4', expected: 20, description: 'Parentheses' },
            { input: '2 + 3 * 4', expected: 14, description: 'Order of operations' },
        ];

        for (const test of tests) {
            await this.runTest(test);
        }

        this.printResults();
    }

    async runTest(test) {
        try {
            const result = await this.agent.calculate(test.input);
            
            if (result.success) {
                const actual = typeof result.result === 'number' 
                    ? parseFloat(result.result.toFixed(6))
                    : result.result;
                const expected = typeof test.expected === 'number' 
                    ? parseFloat(test.expected.toFixed(6))
                    : test.expected;
                
                const passed = Math.abs(actual - expected) < 0.0001;
                
                this.testResults.push({
                    ...test,
                    actual,
                    passed,
                    error: null
                });
                
                const status = passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
                console.log(`${status} ${test.description}`);
                if (!passed) {
                    console.log(chalk.gray(`   Expected: ${expected}, Got: ${actual}`));
                }
            } else {
                this.testResults.push({
                    ...test,
                    actual: null,
                    passed: false,
                    error: result.error
                });
                
                console.log(chalk.red(`❌ FAIL ${test.description}`));
                console.log(chalk.gray(`   Error: ${result.error}`));
            }
        } catch (error) {
            this.testResults.push({
                ...test,
                actual: null,
                passed: false,
                error: error.message
            });
            
            console.log(chalk.red(`❌ FAIL ${test.description}`));
            console.log(chalk.gray(`   Error: ${error.message}`));
        }
    }

    printResults() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.passed).length;
        const failed = total - passed;
        
        console.log(chalk.cyan.bold('\n📊 Test Results Summary:'));
        console.log(chalk.white(`Total tests: ${total}`));
        console.log(chalk.green(`Passed: ${passed}`));
        console.log(chalk.red(`Failed: ${failed}`));
        console.log(chalk.white(`Success rate: ${((passed / total) * 100).toFixed(1)}%`));
        
        if (failed > 0) {
            console.log(chalk.red.bold('\n❌ Failed Tests:'));
            this.testResults
                .filter(t => !t.passed)
                .forEach(test => {
                    console.log(chalk.red(`  • ${test.description}`));
                    console.log(chalk.gray(`    Input: "${test.input}"`));
                    if (test.error) {
                        console.log(chalk.gray(`    Error: ${test.error}`));
                    } else {
                        console.log(chalk.gray(`    Expected: ${test.expected}, Got: ${test.actual}`));
                    }
                });
        }
        
        console.log();
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new CalculatorTester();
    tester.runTests().catch(console.error);
}

module.exports = CalculatorTester;
