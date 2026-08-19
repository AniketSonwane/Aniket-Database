/**
 * Selection Sort Step Generator with Line-by-Line Mapping to User's C++ Code
 */

class SelectionSortEngine {
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
      minIndex: 0,
      minValue: arr[0],
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
        valMin: '—',
        condition: 'void selectionSort(int arr[], int n)',
        result: 'START',
        action: 'Starting selectionSort execution',
        nextOp: 'Declare variables i, j, minIndex, temp'
      }
    });

    // Step 2: Variable Declaration (Line 2: int i, j, minIndex, temp;)
    this.steps.push({
      type: 'VAR_DECL',
      arrState: [...arr],
      i: 0,
      j: 0,
      minIndex: 0,
      minValue: arr[0],
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
        valMin: '—',
        condition: 'int i, j, minIndex, temp;',
        result: 'OK',
        action: 'Declared loop indices i, j, minIndex and temp variable',
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
        j: i + 1,
        minIndex: i,
        minValue: arr[i],
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
          valMin: '—',
          condition: `i < n - 1 (${i} < ${n - 1})`,
          result: 'TRUE',
          action: `Pass ${i + 1} started. i = ${i}`,
          nextOp: `Execute minIndex = i (${i})`
        }
      });

      // Line 5: minIndex = i;
      let minIndex = i;
      this.steps.push({
        type: 'SET_MIN_INDEX',
        arrState: [...arr],
        i: i,
        j: i + 1,
        minIndex: minIndex,
        minValue: arr[minIndex],
        n: n,
        cLine: 5,
        comparingIndices: [],
        swappedIndices: [],
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        passesCount,
        opDetails: {
          comparing: '—',
          valJ: '—',
          valMin: arr[minIndex],
          condition: `minIndex = i (${i})`,
          result: 'SET MIN',
          action: `Set minIndex = ${i} (initial min value = ${arr[i]})`,
          nextOp: `Evaluate inner loop for (j = ${i + 1}; j < ${n}; j++)`
        }
      });

      // Inner Loop: for (j = i + 1; j < n; j++)
      for (let j = i + 1; j < n; j++) {
        
        // Line 7: Inner loop condition check
        this.steps.push({
          type: 'INNER_LOOP',
          arrState: [...arr],
          i: i,
          j: j,
          minIndex: minIndex,
          minValue: arr[minIndex],
          n: n,
          cLine: 7,
          comparingIndices: [j, minIndex],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          passesCount,
          opDetails: {
            comparing: `arr[${j}] & arr[${minIndex}]`,
            valJ: arr[j],
            valMin: arr[minIndex],
            condition: `j < n (${j} < ${n})`,
            result: 'TRUE',
            action: `Set inner pointer j = ${j}`,
            nextOp: `Check if (arr[${j}] < arr[${minIndex}])`
          }
        });

        // Line 8: if (arr[j] < arr[minIndex])
        comparisonsCount++;
        let conditionTrue = arr[j] < arr[minIndex];

        this.steps.push({
          type: 'COMPARE',
          arrState: [...arr],
          i: i,
          j: j,
          minIndex: minIndex,
          minValue: arr[minIndex],
          n: n,
          cLine: 8,
          comparingIndices: [j, minIndex],
          swappedIndices: [],
          sortedIndices: [...sortedIndices],
          comparisonsCount,
          swapsCount,
          passesCount,
          opDetails: {
            comparing: `arr[${j}] & arr[${minIndex}]`,
            valJ: arr[j],
            valMin: arr[minIndex],
            condition: `arr[${j}] < arr[${minIndex}] (${arr[j]} < ${arr[minIndex]})`,
            result: conditionTrue ? 'TRUE' : 'FALSE',
            action: conditionTrue 
              ? `Condition TRUE: ${arr[j]} < ${arr[minIndex]}`
              : `Condition FALSE: ${arr[j]} >= ${arr[minIndex]} (Minimum unchanged)`,
            nextOp: conditionTrue ? `Execute minIndex = ${j}` : `Increment j++`
          }
        });

        if (conditionTrue) {
          minIndex = j;

          // Line 9: minIndex = j;
          this.steps.push({
            type: 'NEW_MIN',
            arrState: [...arr],
            i: i,
            j: j,
            minIndex: minIndex,
            minValue: arr[minIndex],
            n: n,
            cLine: 9,
            comparingIndices: [j],
            swappedIndices: [],
            sortedIndices: [...sortedIndices],
            comparisonsCount,
            swapsCount,
            passesCount,
            opDetails: {
              comparing: `arr[${j}]`,
              valJ: arr[j],
              valMin: arr[minIndex],
              condition: `minIndex = j (${j})`,
              result: 'NEW MIN',
              action: `New minimum found at index ${j} (value = ${arr[j]})`,
              nextOp: `Continue scanning unsorted portion`
            }
          });
        }
      }

      // Explicit temp variable swap lines (Lines 13, 14, 15)
      let valI = arr[i];
      let valMin = arr[minIndex];
      swapsCount++;

      // Line 13: temp = arr[i];
      this.steps.push({
        type: 'SWAP_STEP_1',
        arrState: [...arr],
        i: i,
        j: n - 1,
        minIndex: minIndex,
        minValue: valMin,
        n: n,
        cLine: 13,
        comparingIndices: [i, minIndex],
        swappedIndices: [i],
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        passesCount,
        opDetails: {
          comparing: `arr[${i}] & arr[${minIndex}]`,
          valJ: valI,
          valMin: valMin,
          condition: `temp = arr[${i}] (${valI})`,
          result: 'TEMP STORE',
          action: `Stored temp = arr[${i}] (${valI})`,
          nextOp: `Execute arr[${i}] = arr[${minIndex}]`
        }
      });

      // Perform array swap
      arr[i] = valMin;
      arr[minIndex] = valI;

      // Line 14: arr[i] = arr[minIndex];
      this.steps.push({
        type: 'SWAP_STEP_2',
        arrState: [...arr],
        i: i,
        j: n - 1,
        minIndex: minIndex,
        minValue: valMin,
        n: n,
        cLine: 14,
        comparingIndices: [i, minIndex],
        swappedIndices: [i, minIndex],
        sortedIndices: [...sortedIndices],
        comparisonsCount,
        swapsCount,
        passesCount,
        opDetails: {
          comparing: `arr[${i}] & arr[${minIndex}]`,
          valJ: arr[i],
          valMin: arr[minIndex],
          condition: `arr[${i}] = arr[${minIndex}] (${valMin})`,
          result: 'OVERWRITE',
          action: `Assigned arr[${i}] = ${valMin}`,
          nextOp: `Execute arr[${minIndex}] = temp`
        }
      });

      // Line 15: arr[minIndex] = temp;
      this.steps.push({
        type: 'SWAP_STEP_3',
        arrState: [...arr],
        i: i,
        j: n - 1,
        minIndex: minIndex,
        minValue: valMin,
        n: n,
        cLine: 15,
        comparingIndices: [i, minIndex],
        swappedIndices: [i, minIndex],
        sortedIndices: [...sortedIndices, i],
        comparisonsCount,
        swapsCount,
        passesCount,
        opDetails: {
          comparing: `arr[${i}] & arr[${minIndex}]`,
          valJ: arr[i],
          valMin: arr[minIndex],
          condition: `arr[${minIndex}] = temp (${valI})`,
          result: 'SWAPPED',
          action: `Swapped arr[${i}] (${valI}) with min element at index ${minIndex} (${valMin})`,
          nextOp: i < n - 2 ? `Start Pass ${i + 2}` : 'Sorting complete'
        }
      });

      sortedIndices.push(i);
    }

    // Lock remaining last element
    for (let k = 0; k < n; k++) {
      if (!sortedIndices.includes(k)) {
        sortedIndices.push(k);
      }
    }

    // Step Final: Function Return (Line 17)
    this.steps.push({
      type: 'SORT_COMPLETE',
      arrState: [...arr],
      i: n - 1,
      j: n - 1,
      minIndex: n - 1,
      minValue: arr[n - 1],
      n: n,
      cLine: 17,
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: [...sortedIndices],
      comparisonsCount,
      swapsCount,
      passesCount,
      opDetails: {
        comparing: '—',
        valJ: '—',
        valMin: '—',
        condition: 'Completed',
        result: 'DONE',
        action: 'Array is fully sorted!',
        nextOp: 'View final statistics'
      }
    });
  }
}
