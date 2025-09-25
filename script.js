const OPERATORS = {
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    mul: (a, b) => a * b,
    div: (a, b) => a / b
    
}
const SYMBOL = { add: '+', sub: '-', mul: '*', div: '/' };

const allowedOperators = ["add", "mul", "sub", "div"]

const isCommutative = {
    add: true,
    sub: false,
    mul: true,
    div: false,
}

const solve = (numbers, target=24) => {
    const bfsQueue = [[numbers, [numbers], []]]

    while (bfsQueue.length > 0) {
        const currentNode = bfsQueue.shift()
        const current = currentNode[0]
        const history = currentNode[1]
        const operations = currentNode[2]
        if (current.length == 1) {
            if (current[0] == target) {
                return { status: "Success", data: { history: history, operations: operations } }
            } else continue
        } 
        for (let i = 0; i < current.length; i++) {
            for (let j = i + 1; j < current.length; j++) {
                allowedOperators.forEach(operator => {
                    const newArr = current.filter((_, idx) => idx !== i && idx !== j);
                    const f = OPERATORS[operator]
                    const result = f(current[i], current[j])
                    const newNums = [...newArr, result]
                    bfsQueue.push([newNums, [...history, newNums, ], [...operations, [current[i], operator, current[j], result]]])
                    if (!isCommutative[operator]) {
                        const result2 = f(current[j], current[i])
                        const newNums2 = [...newArr, result2]
                        bfsQueue.push([newNums2, [...history, newNums2], [...operations, [current[j], operator, current[i], result2]]])
                    }
                })
            }
        }
    }
 
    return {
        status: "Fail"
    }
}

const parseExpression = (history, operations) => {
    const remainingNums = []
    history[0].forEach(x => remainingNums.push([x, x]))

    operations.forEach(operation => {
        const [left, operator, right, result] = operation
        const indexLeft = remainingNums.findIndex(x => x[1] == left)
        const leftItem = remainingNums[indexLeft]
        remainingNums.splice(indexLeft, 1)
        const indexRight = remainingNums.findIndex(x => x[1] == right)
        const rightItem = remainingNums[indexRight]
        remainingNums.splice(indexRight, 1)

        const newItem = {
            left: leftItem[0],
            right: rightItem[0],
            operator: operator
        }
        remainingNums.push([newItem, result])  
    })

    return remainingNums[0]
}

const displayExpr = evalTree => {
    if (typeof evalTree == "number") {
        return evalTree.toString()
    } 

    return `(${displayExpr(evalTree.left)} ${SYMBOL[evalTree.operator]} ${displayExpr(evalTree.right)})`
}

const removeOuterBrackets = expr => expr.slice(1, -1)


const displaySuccess = equation => {
    $("#fail-div").attr("hidden", true)
    $("#results-div").text(equation)
    $("#results-div").attr("hidden", false)
}

const displayFail = () => {
    $("#results-div").attr("hidden", true)
    $("#fail-div").attr("hidden", false)
}

$("form").submit(e => {
    e.preventDefault()

    const target = Number($("#target").val())
    const numbers = [
        Number($("#num-1").val()),
        Number($("#num-2").val()),
        Number($("#num-3").val()),
        Number($("#num-4").val()),
    ]    

    const result = solve(numbers, target)
    if (result.status === "Success") {
        const { history: history, operations: operations } = result.data
        const [parseTree, evalResult] = parseExpression(history, operations)
        if (evalResult !== target) {
            displayFail()
            return
        }
        const equation = removeOuterBrackets(displayExpr(parseTree))
        displaySuccess(equation)
    } else {
        displayFail()
    }
})