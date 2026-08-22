/**
 * Binary Search Step Simulation Engine with Line-by-Line Mapping to C++ Code
 * algorithm: binarySearch(arr, n, target)
 */

class BinarySearchEngine {
  constructor(initialArray, target) {
    this.initialArray = [...initialArray];
    this.target = Number(target);
    this.steps = [];
    this.comparisonsCount = 0;
    this.iterationsCount = 0;

    this.generateSteps();
  }

  generateSteps() {
    let arr = [...this.initialArray];
    let n = arr.length;
    let target = this.target;

    // Step 0: Function Entry (Line 1)
    this.recordStep({
      type: 'INIT',
      cLine: 1,
      arr: [...arr],
      n: n,
      target: target,
      low: 0,
      high: n - 1,
      mid: null,
      comparingResult: null,
      phase: 'INITIALIZATION',
      action: `Starting binarySearch(arr, n=${n}, target=${target})`,
      nextOp: `Initialize low = 0 and high = n - 1 (${n - 1})`,
      searchStatus: 'searching',
      foundIndex: -1,
      activeRange: [0, n - 1],
      eliminatedIndices: []
    });

    // Step 1: Initialize low and high (Lines 3-4)
    let low = 0;
    let high = n - 1;

    this.recordStep({
      type: 'INIT_BOUNDS',
      cLine: 3,
      arr: [...arr],
      n: n,
      target: target,
      low: low,
      high: high,
      mid: null,
      comparingResult: null,
      phase: 'INITIALIZATION',
      action: `Set low = 0, high = ${high}`,
      nextOp: `Check while (low <= high) (${low} <= ${high})`,
      searchStatus: 'searching',
      foundIndex: -1,
      activeRange: [low, high],
      eliminatedIndices: []
    });

    let found = false;

    while (low <= high) {
      this.iterationsCount++;
      
      // Step 2: Check While Condition (Line 6)
      this.recordStep({
        type: 'WHILE_CHECK',
        cLine: 6,
        arr: [...arr],
        n: n,
        target: target,
        low: low,
        high: high,
        mid: null,
        comparingResult: 'TRUE',
        phase: 'SEARCHING',
        action: `Evaluate while (low <= high): ${low} <= ${high} is TRUE`,
        nextOp: `Calculate mid = low + (high - low) / 2`,
        searchStatus: 'searching',
        foundIndex: -1,
        activeRange: [low, high],
        eliminatedIndices: this.getEliminated(n, low, high)
      });

      // Step 3: Calculate mid (Line 8)
      let mid = Math.floor(low + (high - low) / 2);
      let midVal = arr[mid];

      this.recordStep({
        type: 'CALC_MID',
        cLine: 8,
        arr: [...arr],
        n: n,
        target: target,
        low: low,
        high: high,
        mid: mid,
        comparingResult: null,
        phase: 'MID CALCULATION',
        action: `Calculated mid = ${low} + (${high} - ${low}) / 2 = ${mid}. arr[mid] = ${midVal}`,
        nextOp: `Compare arr[${mid}] (${midVal}) == target (${target})`,
        searchStatus: 'searching',
        foundIndex: -1,
        activeRange: [low, high],
        eliminatedIndices: this.getEliminated(n, low, high)
      });

      this.comparisonsCount++;

      // Step 4: Check if (arr[mid] == target) (Line 10)
      if (midVal === target) {
        this.recordStep({
          type: 'COMPARE_EQUAL',
          cLine: 10,
          arr: [...arr],
          n: n,
          target: target,
          low: low,
          high: high,
          mid: mid,
          comparingResult: 'TRUE (Match Found!)',
          phase: 'MATCH FOUND',
          action: `arr[mid] (${midVal}) == target (${target}) is TRUE!`,
          nextOp: `Execute return mid (${mid})`,
          searchStatus: 'found',
          foundIndex: mid,
          activeRange: [low, high],
          eliminatedIndices: this.getEliminated(n, low, high)
        });

        // Step 5: Return mid (Line 12)
        this.recordStep({
          type: 'FOUND_RETURN',
          cLine: 12,
          arr: [...arr],
          n: n,
          target: target,
          low: low,
          high: high,
          mid: mid,
          comparingResult: 'FOUND',
          phase: 'MATCH FOUND',
          action: `Target ${target} found at index ${mid}! Returning ${mid}.`,
          nextOp: `Search Complete`,
          searchStatus: 'found',
          foundIndex: mid,
          activeRange: [low, high],
          eliminatedIndices: this.getEliminated(n, low, high)
        });

        found = true;
        break;
      } else {
        this.recordStep({
          type: 'COMPARE_EQUAL',
          cLine: 10,
          arr: [...arr],
          n: n,
          target: target,
          low: low,
          high: high,
          mid: mid,
          comparingResult: 'FALSE',
          phase: 'COMPARING',
          action: `arr[mid] (${midVal}) == target (${target}) is FALSE`,
          nextOp: `Check else if (arr[mid] < target) (${midVal} < ${target})`,
          searchStatus: 'searching',
          foundIndex: -1,
          activeRange: [low, high],
          eliminatedIndices: this.getEliminated(n, low, high)
        });
      }

      // Step 6: Check else if (arr[mid] < target) (Line 14)
      if (midVal < target) {
        this.recordStep({
          type: 'COMPARE_LESS',
          cLine: 14,
          arr: [...arr],
          n: n,
          target: target,
          low: low,
          high: high,
          mid: mid,
          comparingResult: 'TRUE (Target is Greater)',
          phase: 'RANGE REDUCTION',
          action: `arr[mid] (${midVal}) < target (${target}) is TRUE! Target lies in right half.`,
          nextOp: `Set low = mid + 1 (${mid + 1})`,
          searchStatus: 'searching',
          foundIndex: -1,
          activeRange: [low, high],
          eliminatedIndices: this.getEliminated(n, low, high)
        });

        // Step 7: Update low = mid + 1 (Line 16)
        low = mid + 1;

        this.recordStep({
          type: 'UPDATE_LOW',
          cLine: 16,
          arr: [...arr],
          n: n,
          target: target,
          low: low,
          high: high,
          mid: mid,
          comparingResult: 'UPDATED LOW',
          phase: 'RANGE REDUCTION',
          action: `Updated low = mid + 1 (${low}). Left search space [0...${mid}] eliminated.`,
          nextOp: `Return to while loop check`,
          searchStatus: 'searching',
          foundIndex: -1,
          activeRange: [low, high],
          eliminatedIndices: this.getEliminated(n, low, high)
        });
      } else {
        this.recordStep({
          type: 'COMPARE_LESS',
          cLine: 14,
          arr: [...arr],
          n: n,
          target: target,
          low: low,
          high: high,
          mid: mid,
          comparingResult: 'FALSE (Target is Smaller)',
          phase: 'RANGE REDUCTION',
          action: `arr[mid] (${midVal}) < target (${target}) is FALSE! Target lies in left half.`,
          nextOp: `Set high = mid - 1 (${mid - 1})`,
          searchStatus: 'searching',
          foundIndex: -1,
          activeRange: [low, high],
          eliminatedIndices: this.getEliminated(n, low, high)
        });

        // Step 8: Update high = mid - 1 (Line 20)
        high = mid - 1;

        this.recordStep({
          type: 'UPDATE_HIGH',
          cLine: 20,
          arr: [...arr],
          n: n,
          target: target,
          low: low,
          high: high,
          mid: mid,
          comparingResult: 'UPDATED HIGH',
          phase: 'RANGE REDUCTION',
          action: `Updated high = mid - 1 (${high}). Right search space [${mid}...${n - 1}] eliminated.`,
          nextOp: `Return to while loop check`,
          searchStatus: 'searching',
          foundIndex: -1,
          activeRange: [low, high],
          eliminatedIndices: this.getEliminated(n, low, high)
        });
      }
    }

    if (!found) {
      // While loop condition low <= high evaluated to FALSE (Line 6)
      this.recordStep({
        type: 'WHILE_END',
        cLine: 6,
        arr: [...arr],
        n: n,
        target: target,
        low: low,
        high: high,
        mid: null,
        comparingResult: 'FALSE (Search Space Empty)',
        phase: 'NOT FOUND',
        action: `while (low <= high): ${low} <= ${high} is FALSE! Search space exhausted.`,
        nextOp: `Execute return -1`,
        searchStatus: 'not_found',
        foundIndex: -1,
        activeRange: [low, high],
        eliminatedIndices: this.getEliminated(n, low, high)
      });

      // Line 24: return -1;
      this.recordStep({
        type: 'NOT_FOUND_RETURN',
        cLine: 24,
        arr: [...arr],
        n: n,
        target: target,
        low: low,
        high: high,
        mid: null,
        comparingResult: 'NOT FOUND',
        phase: 'NOT FOUND',
        action: `Target ${target} was not found in array. Returning -1.`,
        nextOp: `Search Complete`,
        searchStatus: 'not_found',
        foundIndex: -1,
        activeRange: [low, high],
        eliminatedIndices: this.getEliminated(n, low, high)
      });
    }
  }

  getEliminated(n, low, high) {
    const eliminated = [];
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) {
        eliminated.push(k);
      }
    }
    return eliminated;
  }

  recordStep(details) {
    this.steps.push({
      ...details,
      arrState: [...details.arr],
      comparisonsCount: this.comparisonsCount,
      iterationsCount: this.iterationsCount,
      eliminatedCount: details.eliminatedIndices.length
    });
  }
}
