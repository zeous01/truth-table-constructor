document.getElementById('num-variables').addEventListener('change', function () {
    const numVariables = parseInt(this.value);
    const variableInputs = document.getElementById('variable-inputs');
    variableInputs.innerHTML = ''; // Clear previous inputs

    for (let i = 1; i <= numVariables; i++) {
        const div = document.createElement('div'); // Create a new div for each input
        div.classList.add('form-group'); // Add styling class

        const label = document.createElement('label');
        label.textContent = `Variable ${i}: `;
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `variable${i}`;
        input.placeholder = `Enter variable ${i}`;
        input.required = true;

        div.appendChild(label);
        div.appendChild(input);
        variableInputs.appendChild(div);
    }
});

document.getElementById('truth-table-generator-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const numVariables = parseInt(document.getElementById('num-variables').value);
    const variables = [];
    for (let i = 1; i <= numVariables; i++) {
        variables.push(document.querySelector(`input[name="variable${i}"]`).value.trim());
    }
    const expression = document.getElementById('expression').value.trim();

    // Validate expression
    const isValid = validateExpression(expression, variables);
    if (!isValid) {
        alert('The expression contains invalid variables.');
        return;
    }

    generateTruthTable(variables, expression);
});

function validateExpression(expression, variables) {
    const validVariables = new Set(variables);
    const tokens = expression.match(/(&|\||~|=>|\(|\)|\w+)/g);

    for (const token of tokens) {
        if (/[a-zA-Z]/.test(token) && !validVariables.has(token)) {
            return false;
        }
    }
    return true;
}

function generateTruthTable(variables, expression) {
    const tableHeader = document.getElementById('truth-table-header');
    const tableBody = document.getElementById('truth-table-body');

    // Clear previous table
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    // Create table header
    variables.forEach(variable => {
        const th = document.createElement('th');
        th.textContent = variable;
        tableHeader.appendChild(th);
    });

    const thResult = document.createElement('th');
    thResult.textContent = 'Result';
    tableHeader.appendChild(thResult);

    // Generate all combinations of truth values
    const combinations = generateCombinations(variables.length);

    // Convert infix expression to postfix
    const postfixExpression = infixToPostfix(expression);

    // Evaluate expression for each combination
    combinations.forEach(combination => {
        const row = document.createElement('tr');
        combination.forEach(value => {
            const td = document.createElement('td');
            td.textContent = value ? '1' : '0'; // Show as 1 or 0
            row.appendChild(td);
        });

        const resultTd = document.createElement('td');
        const result = evaluatePostfix(postfixExpression, variables, combination);
        resultTd.textContent = result ? '1' : '0'; // Show result as 0/1
        row.appendChild(resultTd);

        tableBody.appendChild(row);
    });
}

function generateCombinations(numVariables) {
    const combinations = [];
    const numCombinations = Math.pow(2, numVariables);

    for (let i = 0; i < numCombinations; i++) {
        const combination = [];
        for (let j = numVariables - 1; j >= 0; j--) {
            combination.push((i >> j) & 1 ? true : false);
        }
        combinations.push(combination);
    }

    return combinations;
}

function infixToPostfix(expression) {
    const precedence = {
        '~': 4,  // NOT
        '&': 3,  // AND
        '|': 2,  // OR
        '=>': 0, // IMPLICATION
    };

    const output = [];
    const stack = [];

    const tokens = expression.match(/(&|\||~|=>|\(|\)|\w+)/g);

    tokens.forEach(token => {
        if (/[a-zA-Z]/.test(token)) {
            output.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();  // Remove the '('
        } else {
            while (stack.length && precedence[token] <= precedence[stack[stack.length - 1]]) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    });

    while (stack.length) {
        output.push(stack.pop());
    }

    return output;
}

function evaluatePostfix(postfixExpression, variables, combination) {
    const stack = [];

    postfixExpression.forEach(token => {
        if (/[a-zA-Z]/.test(token)) {
            const index = variables.indexOf(token);
            stack.push(combination[index]);
        } else {
            if (token === '~') {
                const operand = stack.pop();
                stack.push(!operand);
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (token) {
                    case '&': stack.push(a && b); break;
                    case '|': stack.push(a || b); break;
                    case '=>': stack.push(!a || b); break;
                }
            }
        }
    });

    return stack.pop();
}
