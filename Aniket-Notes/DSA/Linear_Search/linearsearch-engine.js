/**
 * Linear Search Step Simulation Engine with Line-by-Line Mapping to C++ Code
 * algorithm: linearSearch(arr, n, target)
 */

class LinearSearchEngine {
  constructor(initialArray, target) {
    this.initialArray = [...initialArray];
    this.target = Number(target);
    this.steps = [];
    this.comparisonCount = 0;
    this.elementsChecked = 0;

    this.generateSteps();
  }

  generateSteps() {
    let arr = [...this.initialArray];
    let n = arr.length;
    let target = this.target;

    // Step 0: Function Entry
    this.recordStep({
      type: 'INIT',
      cLine: 1,
      arr: [...arr],
      n: n,
      target: target,
      i: 0,
      currentElement: null,
      comparingResult: null,
      phase: 'INITIALIZATION',
      action: `Starting linearSearch(arr, n=${n}, target=${target})`,
      nextOp: 'Execute for loop int i = 0',
      searchStatus: 'searching',
      foundIndex: -1,
      checkedIndices: []
    });

    // Step 1: For Loop Init (Line 3)
    this.recordStep({
      type: 'LOOP_INIT',
      cLine: 3,
      arr: [...arr],
      n: n,
      target: target,
      i: 0,
      currentElement: null,
      comparingResult: null,
      phase: 'SEARCHING',
      action: `Set i = 0; Check i < n (0 < ${n}) is TRUE`,
      nextOp: `Compare arr[0] (${arr[0]}) == target (${target})`,
      searchStatus: 'searching',
      foundIndex: -1,
      checkedIndices: []
    });

    let found = false;
    let checked = [];

    for (let i = 0; i < n; i++) {
      this.comparisonCount++;
      this.elementsChecked++;
      checked.push(i);

      let currentVal = arr[i];
      let isMatch = (currentVal === target);

      // Line 5: if (arr[i] == target)
      this.recordStep({
        type: 'COMPARE',
        cLine: 5,
        arr: [...arr],
        n: n,
        target: target,
        i: i,
        currentElement: currentVal,
        comparingResult: isMatch ? 'TRUE' : 'FALSE',
        phase: 'COMPARING',
        action: `Comparing arr[${i}] (${currentVal}) == target (${target}): is ${isMatch ? 'TRUE (Match Found!)' : 'FALSE'}`,
        nextOp: isMatch ? `Execute return i (${i})` : (i + 1 < n ? `Increment i to ${i + 1}` : `Loop ends, move to return -1`),
        searchStatus: isMatch ? 'found' : 'searching',
        foundIndex: isMatch ? i : -1,
        checkedIndices: [...checked]
      });

      if (isMatch) {
        found = true;

        // Line 7: return i;
        this.recordStep({
          type: 'FOUND_RETURN',
          cLine: 7,
          arr: [...arr],
          n: n,
          target: target,
          i: i,
          currentElement: currentVal,
          comparingResult: 'FOUND',
          phase: 'MATCH FOUND',
          action: `Target ${target} found at index ${i}! Returning ${i}.`,
          nextOp: `Search Complete`,
          searchStatus: 'found',
          foundIndex: i,
          checkedIndices: [...checked]
        });

        break;
      }
    }

    if (!found) {
      // Line 11: return -1;
      this.recordStep({
        type: 'NOT_FOUND_RETURN',
        cLine: 11,
        arr: [...arr],
        n: n,
        target: target,
        i: n,
        currentElement: null,
        comparingResult: 'NOT FOUND',
        phase: 'NOT FOUND',
        action: `All ${n} elements checked. Target ${target} was not found. Returning -1.`,
        nextOp: `Search Complete`,
        searchStatus: 'not_found',
        foundIndex: -1,
        checkedIndices: [...checked]
      });
    }
  }

  recordStep(details) {
    this.steps.push({
      ...details,
      arrState: [...details.arr],
      comparisonCount: this.comparisonCount,
      elementsChecked: this.elementsChecked
    });
  }
}
