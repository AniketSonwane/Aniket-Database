/**
 * Bubble Sort Step Generator with Line-by-Line C++ Step Mapping
 */

class BubbleSortEngine {
  constructor(initialArray) {
    this.initialArray = [...initialArray];
    this.steps = [];
    this.generateSteps();
  }

  generateSteps() {
    let arr = [...this.initialArray];
    let n = arr.length;
    let comparisonsCount = 0;
    let swapsCount = 0;
    let passesCount = 0;
    let sortedIndices = [];

    // Step 1: Function Header (Line 1)
    this.steps.push({
      type: 'INIT',
      arrState: [...arr],
      i: 0,
      j: 0,
      n: n,
      cLine: 1,
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: [...sortedIndices],
      comparisonsCount,
      swapsCount,
      passesCount,
      opDetails: {
        comparing: '—',
        valJ: '—',
        valJ1: '—',
        condition: 'void bubbleSort(int arr[], int n)',
        result: 'START',
        action: 'Starting bubbleSort execution',
        nextOp: 'Declare variables i, j, temp'
      }
    });

    // Step 2: Variable Declaration (Line 2: int i, j, temp;)
    this.steps.push({
      type: 'VAR_DECL',
      arrState: [...arr],
      i: 0,
      j: 0,
      n: n,
      cLine: 2,
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: [...sortedIndices],
      comparisonsCount,
      swapsCount,
      passesCount,
      opDetails: {
        comparing: '—',
        valJ: '—',
        valJ1: '—',
        condition: 'int i, j, temp;',
        result: 'OK',
        action: 'Declared loop indices i, j and temp variable',
        nextOp: 'Evaluate outer loop for (i = 0; i < n - 1; i++)'
      }
    });

    // Outer Loop: for (i = 0; i < n - 1; i++)
    for (let i = 0; i < n - 1; i++) {
      passesCount = i + 1;

      // Line 4: Outer loop condition check
      this.steps.push({
        type: 'OUTER_LOOP',
        arrState: [...arr],
        i: i,
        j: 0,
        n: n,
        cLine: 4,
        comparingIndices: [],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        passesCount,
        opDetails: {
          comparing: '—',
          valJ: '—',
          valJ1: '—',
          condition: `i < ${n - 1} (${i} < ${n - 1})`,
          result: 'TRUE',
          action: `Pass ${i + 1} started (i = ${i})`,
          nextOp: 'Evaluate inner loop for (j = 0; j < n - i - 1; j++)'
        }
      });

      // Inner Loop: for (j = 0; j < n - i - 1; j++)
      for (let j = 0; j < n - i - 1; j++) {
        
        // Line 6: Inner loop condition check
        this.steps.push({
          type: 'INNER_LOOP',
          arrState: [...arr],
          i: i,
          j: j,
          n: n,
          cLine: 6,
          comparingIndices: [j, j + 1],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          passesCount,
          opDetails: {
            comparing: `arr[${j}] & arr[${j + 1}]`,
            valJ: arr[j],
            valJ1: arr[j + 1],
            condition: `j < n - i - 1 (${j} < ${n - i - 1})`,
            result: 'TRUE',
            action: `Set inner index j = ${j}`,
            nextOp: `Check if (arr[${j}] > arr[${j + 1}])`
          }
        });

        // Line 7: if (arr[j] > arr[j + 1])
        comparisonsCount++;
        let conditionTrue = arr[j] > arr[j + 1];

        this.steps.push({
          type: 'COMPARE',
          arrState: [...arr],
          i: i,
          j: j,
          n: n,
          cLine: 7,
          comparingIndices: [j, j + 1],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          passesCount,
          opDetails: {
            comparing: `arr[${j}] & arr[${j + 1}]`,
            valJ: arr[j],
            valJ1: arr[j + 1],
            condition: `arr[${j}] > arr[${j + 1}] (${arr[j]} > ${arr[j + 1]})`,
            result: conditionTrue ? 'TRUE' : 'FALSE',
            action: conditionTrue 
              ? `Condition TRUE: ${arr[j]} > ${arr[j + 1]}`
              : `Condition FALSE: ${arr[j]} <= ${arr[j + 1]} (No Swap)`,
            nextOp: conditionTrue ? 'Execute temp = arr[j]' : 'Increment j++'
          }
        });

        if (conditionTrue) {
          swapsCount++;
          let valJ = arr[j];
          let valJ1 = arr[j + 1];

          // Line 9: temp = arr[j];
          this.steps.push({
            type: 'SWAP_STEP_1',
            arrState: [...arr],
            i: i,
            j: j,
            n: n,
            cLine: 9,
            comparingIndices: [j, j + 1],
            swappedIndices: [j],
            sortedIndices: [...sortedIndices],
            comparisonsCount,
            swapsCount,
            passesCount,
            opDetails: {
              comparing: `arr[${j}] & arr[${j + 1}]`,
              valJ: valJ,
              valJ1: valJ1,
              condition: `temp = arr[${j}] (${valJ})`,
              result: 'TEMP STORE',
              action: `Stored temp = ${valJ}`,
              nextOp: `Execute arr[${j}] = arr[${j + 1}]`
            }
          });

          // Perform swap in array
          arr[j] = valJ1;
          arr[j + 1] = valJ;

          // Line 10: arr[j] = arr[j + 1];
          this.steps.push({
            type: 'SWAP_STEP_2',
            arrState: [...arr],
            i: i,
            j: j,
            n: n,
            cLine: 10,
            comparingIndices: [j, j + 1],
            swappedIndices: [j, j + 1],
            sortedIndices: [...sortedIndices],
            comparisonsCount,
            swapsCount,
            passesCount,
            opDetails: {
              comparing: `arr[${j}] & arr[${j + 1}]`,
              valJ: arr[j],
              valJ1: arr[j + 1],
              condition: `arr[${j}] = arr[${j + 1}] (${valJ1})`,
              result: 'OVERWRITE',
              action: `Assigned arr[${j}] = ${valJ1}`,
              nextOp: `Execute arr[${j + 1}] = temp`
            }
          });

          // Line 11: arr[j + 1] = temp;
          this.steps.push({
            type: 'SWAP_STEP_3',
            arrState: [...arr],
            i: i,
            j: j,
            n: n,
            cLine: 11,
            comparingIndices: [j, j + 1],
            swappedIndices: [j, j + 1],
            sortedIndices: [...sortedIndices],
            comparisonsCount,
            swapsCount,
            passesCount,
            opDetails: {
              comparing: `arr[${j}] & arr[${j + 1}]`,
              valJ: arr[j],
              valJ1: arr[j + 1],
              condition: `arr[${j + 1}] = temp (${valJ})`,
              result: 'SWAPPED',
              action: `Swapped arr[${j}] and arr[${j + 1}] using temp`,
              nextOp: 'Increment j++'
            }
          });
        }
      }

      // Lock largest element of pass into sortedIndices
      let lockedIndex = n - 1 - i;
      if (!sortedIndices.includes(lockedIndex)) {
        sortedIndices.push(lockedIndex);
      }

      // End of Pass
      this.steps.push({
        type: 'PASS_END',
        arrState: [...arr],
        i: i,
        j: n - i - 2 >= 0 ? n - i - 2 : 0,
        n: n,
        cLine: 4,
        comparingIndices: [],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        passesCount,
        opDetails: {
          comparing: '—',
          valJ: '—',
          valJ1: '—',
          condition: `Pass ${i + 1} Complete`,
          result: 'PASS END',
          action: `Element ${arr[lockedIndex]} locked at index [${lockedIndex}]`,
          nextOp: i < n - 2 ? `Start Pass ${i + 2}` : 'Sorting complete'
        }
      });
    }

    // Lock remaining first element at index 0
    for (let k = 0; k < n; k++) {
      if (!sortedIndices.includes(k)) {
        sortedIndices.push(k);
      }
    }

    // Step Final: Function Return (Line 15)
    this.steps.push({
      type: 'SORT_COMPLETE',
      arrState: [...arr],
      i: n - 1,
      j: n - 1,
      n: n,
      cLine: 15,
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: [...sortedIndices],
      comparisonsCount,
      swapsCount,
      passesCount,
      opDetails: {
        comparing: '—',
        valJ: '—',
        valJ1: '—',
        condition: 'Completed',
        result: 'DONE',
        action: 'Array is fully sorted!',
        nextOp: 'View final statistics'
      }
    });
  }
}
