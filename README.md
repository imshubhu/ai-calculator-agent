# AI Calculator Agent

A powerful AI-powered calculator agent built with Node.js that can perform mathematical calculations using both mathematical expressions and natural language processing.

## Features

- 🤖 **AI-Powered**: Natural language processing for understanding calculation requests
- 🧮 **Comprehensive Math**: Basic arithmetic, advanced mathematics, statistics, and trigonometry
- 💬 **Natural Language**: Ask questions in plain English
- 🖥️ **CLI Interface**: Interactive command-line interface
- ✅ **Error Handling**: Robust validation and error reporting
- 🎨 **Beautiful Output**: Color-coded results and formatted display
 - 🔁 **Unit Conversion**: Length, weight, temperature, area, volume, time
 - 📈 **Graphing & Visualization**: Function plots, scatter plots, histograms (HTML output)
 - 🧠 **Memory**: History of previous calculations and `ans` token

## Supported Operations

### Basic Arithmetic
- Addition, subtraction, multiplication, division
- Order of operations with parentheses
- Decimal and integer calculations

### Advanced Mathematics
- Exponentiation (^)
- Square root (sqrt)
- Logarithmic functions (log, ln)
- Trigonometric functions (sin, cos, tan)
- Constants (π, e)

### Statistics
- Mean, median, mode
- Standard deviation, variance
- Sum, count operations

### Unit Conversion
- Convert between units of length, weight/mass, temperature, area, volume, and time
- Examples: `convert 100 cm to m`, `convert 32 fahrenheit to celsius`, `convert 1 hour to seconds`

### Graphing & Visualization
- Plot mathematical functions over a range (HTML files)
- Create scatter plots from points and histograms from data
- Examples: `plot x^2 from -5 to 5`, `scatter 1,2 3,4 5,6`, `histogram 1,2,3,4,5,6`

### Memory
- Keeps a history (last 50 entries by default)
- Use `ans` to reference the last numeric result in new expressions
- View, recall, and clear history from the CLI

### Natural Language Processing
- "What is 5 plus 3?"
- "Calculate the square root of 144"
- "Find the mean of 10, 20, 30, 40, 50"
- "What is 2 to the power of 10?"

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Interactive Mode (Recommended)
```bash
npm start
# or
node index.js
```

### Command Line Options
```bash
# Interactive mode
node index.js interactive
node index.js i

# Single calculation
node index.js calc "2 + 3 * 4"
node index.js c "sqrt(16)"

# Natural language
node index.js ask "What is 15 plus 27?"
node index.js a "Calculate the sine of 30 degrees"

# Show agent info
node index.js info

# Show examples
node index.js examples

# Unit conversion
node index.js convert 100 cm m
node index.js conv 2.5 kg lb

# Graphing & visualization (outputs HTML to ./plots)
node index.js plot "x^2" --from -5 --to 5
node index.js scatter 1,2 3,4 5,6
node index.js histogram "1,2,3,4,5,6,7,8,9,10"

# Memory
node index.js history           # show last 10
node index.js history -n 5      # show last 5
node index.js recall            # recall last
node index.js recall 2          # recall 2nd most recent
node index.js clear-history     # clear memory
```

### Programmatic Usage
```javascript
const CalculatorAgent = require('./CalculatorAgent');

const agent = new CalculatorAgent();

// Calculate mathematical expression
const result1 = await agent.calculate('2 + 3 * 4');
console.log(agent.formatResult(result1));

// Natural language calculation
const result2 = await agent.calculate('What is the square root of 144?');
console.log(agent.formatResult(result2));

// Statistics
const result3 = await agent.calculate('mean([1, 2, 3, 4, 5])');
console.log(agent.formatResult(result3));

// Unit conversion
const result4 = await agent.calculate('convert 100 cm to m');
console.log(agent.formatResult(result4));

// Graphing (generates HTML in ./plots)
const result5 = await agent.calculate('plot x^2 from -5 to 5');
console.log(agent.formatResult(result5));

// Memory: using last answer
await agent.calculate('2 + 3');
const result6 = await agent.calculate('ans * 4');
console.log(agent.formatResult(result6));
```

## Examples

### Mathematical Expressions
```
calc> 2 + 3 * 4
✅ Result: 14
   Expression: 2 + 3 * 4
   Operation: arithmetic

calc> sqrt(16)
✅ Result: 4
   Expression: sqrt(16)
   Operation: square root

calc> sin(30)
✅ Result: 0.5
   Expression: sin(30)
   Operation: trigonometry
```

### Natural Language
```
calc> What is 15 plus 27?
✅ Result: 42
   Expression: 15 + 27
   Operation: arithmetic

calc> Calculate the mean of 10, 20, 30
✅ Result: 20
   Expression: mean([10, 20, 30])
   Operation: statistics

calc> What is 2 to the power of 8?
✅ Result: 256
   Expression: 2^8
   Operation: exponentiation
```

### Unit Conversion
```
calc> convert 100 cm to m
✅ Result: 1 m
   Expression: 100 cm to m
   Operation: unit conversion

calc> convert 32 fahrenheit to celsius
✅ Result: 0 celsius
   Expression: 32 fahrenheit to celsius
   Operation: unit conversion
```

### Graphing & Visualization (HTML output)
```
calc> plot x^2 from -5 to 5
📊 Plot generated successfully!
   File: D:\\path\\to\\repo\\plots\\function_XXXXXXXXXXXX.html
   Type: function
   Open in browser to view the plot

calc> scatter 1,2 3,4 5,6
📊 Plot generated successfully!
   File: ...\\plots\\scatter_XXXXXXXXXXXX.html
   Type: scatter
   Open in browser to view the plot
```

### Memory
```
calc> 2 + 3
✅ Result: 5

calc> ans * 4
✅ Result: 20

calc> history -n 2
#2 arithmetic → 20
   Input: ans * 4
   Expr: 5 * 4
   At:   2025-01-01T00:00:00.000Z
#1 arithmetic → 5
   Input: 2 + 3
   Expr: 2 + 3
   At:   2025-01-01T00:00:00.000Z
```

## Testing

Run the test suite to verify all functionality:
```bash
npm test
# or
node test.js
```

## Dependencies

- **mathjs**: Advanced mathematical expressions and functions
- **natural**: Natural language processing utilities
- **commander**: Command-line interface framework
- **chalk**: Terminal string styling

## Architecture

### CalculatorAgent Class
The main AI agent class that handles:
- Natural language processing and parsing
- Mathematical expression evaluation
- Error handling and validation
- Result formatting

### CalculatorCLI Class
Command-line interface that provides:
- Interactive mode with readline
- Command parsing and routing
- User-friendly output formatting
- Help and example systems

## Error Handling

The agent includes comprehensive error handling for:
- Invalid mathematical expressions
- Division by zero
- Invalid function arguments
- Natural language parsing errors
- Input validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

ISC License - see package.json for details

## Future Enhancements

- [ ] Web interface
- [ ] More advanced NLP capabilities
- [ ] Export results to files
- [ ] Plugin system for custom functions

---

Built with ❤️
