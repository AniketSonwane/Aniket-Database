/**
 * Quick Sort Step Simulation Engine with Line-by-Line Mapping to User's Complete C++ Code
 * algorithm: partition(arr, low, high) with pivot = arr[high]
 */

class QuickSortEngine {
  constructor(initialArray) {
    this.initialArray = [...initialArray];
    this.steps = [];
    this.comparisonsCount = 0;
    this.swapsCount = 0;
    this.partitionsCount = 0;
    this.recursiveCallsCount = 0;
    this.maxRecursionDepth = 0;
    this.callIdCounter = 0;
    this.recursionTree = [];
    this.sortedIndices = new Set();

    this.generateSteps();
  }

  generateSteps() {
    let arr = [...this.initialArray];
    let n = arr.length;

    // Initial State (Step 0)
    this.recordStep({
      type: 'INIT',
      cLine: 25,
      arr: [...arr],
      low: 0,
      high: n - 1,
      pivot: arr[n - 1],
      pivotIndex: n - 1,
      i: -1,
      j: 0,
      pi: null,
      phase: 'INITIALIZATION',
      action: `Starting quickSort(arr, low=0, high=${n - 1})`,
      nextOp: 'Check if (low < high)',
      callId: null,
      depth: 0,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activePartition: [0, n - 1],
      swappedIndices: []
    });

    // Run Recursive Quick Sort
    if (n > 0) {
      this.runQuickSort(arr, 0, n - 1, 0, null);
    }

    // Final Completion Step
    this.recordStep({
      type: 'SORT_COMPLETE',
      cLine: 38,
      arr: [...arr],
      low: 0,
      high: n - 1,
      pivot: null,
      pivotIndex: null,
      i: n - 1,
      j: n - 1,
      pi: null,
      phase: 'COMPLETE',
      action: 'Quick Sort complete! Array is fully sorted.',
      nextOp: 'Output sorted array',
      callId: null,
      depth: 0,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activePartition: [0, n - 1],
      swappedIndices: []
    });
  }

  recordStep(details) {
    this.steps.push({
      ...details,
      arrState: [...details.arr],
      comparisonsCount: this.comparisonsCount,
      swapsCount: this.swapsCount,
      partitionsCount: this.partitionsCount,
      recursiveCallsCount: this.recursiveCallsCount,
      maxRecursionDepth: this.maxRecursionDepth,
      sortedIndices: Array.from(this.sortedIndices),
      treeSnapshot: JSON.parse(JSON.stringify(this.recursionTree))
    });
  }

  runQuickSort(arr, low, high, depth, parentCallId) {
    if (low > high) return;

    this.recursiveCallsCount++;
    this.maxRecursionDepth = Math.max(this.maxRecursionDepth, depth);
    let callId = ++this.callIdCounter;

    const treeNode = {
      id: callId,
      parentId: parentCallId,
      left: low,
      right: high,
      depth: depth,
      status: 'active',
      subArray: arr.slice(low, high + 1),
      pi: null
    };
    this.recursionTree.push(treeNode);

    // Line 25: void quickSort(int arr[], int low, int high)
    this.recordStep({
      type: 'ENTER_QUICKSORT',
      cLine: 25,
      arr: [...arr],
      low: low,
      high: high,
      pivot: low <= high ? arr[high] : null,
      pivotIndex: high,
      i: low - 1,
      j: low,
      pi: null,
      phase: 'RECURSION',
      action: `quickSort(arr, low=${low}, high=${high}) called at depth ${depth}`,
      nextOp: `Evaluate if (low < high) (${low} < ${high})`,
      callId: callId,
      depth: depth,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activePartition: [low, high],
      swappedIndices: []
    });

    // Line 26: if (low < high)
    let canPartition = low < high;
    this.recordStep({
      type: 'CHECK_BASE_CASE',
      cLine: 26,
      arr: [...arr],
      low: low,
      high: high,
      pivot: canPartition ? arr[high] : null,
      pivotIndex: high,
      i: low - 1,
      j: low,
      pi: null,
      phase: 'RECURSION',
      action: `Base case check: low < high (${low} < ${high}) is ${canPartition ? 'TRUE' : 'FALSE (Single Element Base Case)'}`,
      nextOp: canPartition ? `Call partition(arr, ${low}, ${high})` : `Base case reached for element at index ${low}`,
      callId: callId,
      depth: depth,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: canPartition ? 'TRUE' : 'FALSE',
      activePartition: [low, high],
      swappedIndices: []
    });

    if (canPartition) {
      // Line 27: int pi = partition(arr, low, high);
      this.recordStep({
        type: 'CALL_PARTITION',
        cLine: 27,
        arr: [...arr],
        low: low,
        high: high,
        pivot: arr[high],
        pivotIndex: high,
        i: low - 1,
        j: low,
        pi: null,
        phase: 'PARTITION',
        action: `Entering partition(arr, low=${low}, high=${high})`,
        nextOp: `Select pivot = arr[${high}] (${arr[high]})`,
        callId: callId,
        depth: depth,
        comparingVal1: null,
        comparingVal2: null,
        comparingResult: null,
        activePartition: [low, high],
        swappedIndices: []
      });

      let pi = this.runPartition(arr, low, high, depth, callId, treeNode);
      treeNode.pi = pi;
      treeNode.status = 'partitioned';
      this.sortedIndices.add(pi);

      // Line 29: quickSort(arr, low, pi - 1);
      if (low <= pi - 1) {
        this.recordStep({
          type: 'RECURSE_LEFT',
          cLine: 29,
          arr: [...arr],
          low: low,
          high: high,
          pivot: arr[pi],
          pivotIndex: pi,
          i: low - 1,
          j: low,
          pi: pi,
          phase: 'RECURSION',
          action: `Pivot placed at index ${pi}. Recursing left half: quickSort(arr, ${low}, ${pi - 1})`,
          nextOp: `Enter left child execution`,
          callId: callId,
          depth: depth,
          comparingVal1: null,
          comparingVal2: null,
          comparingResult: null,
          activePartition: [low, pi - 1],
          swappedIndices: []
        });

        this.runQuickSort(arr, low, pi - 1, depth + 1, callId);
      }

      // Line 30: quickSort(arr, pi + 1, high);
      if (pi + 1 <= high) {
        this.recordStep({
          type: 'RECURSE_RIGHT',
          cLine: 30,
          arr: [...arr],
          low: low,
          high: high,
          pivot: arr[pi],
          pivotIndex: pi,
          i: low - 1,
          j: low,
          pi: pi,
          phase: 'RECURSION',
          action: `Recursing right half: quickSort(arr, ${pi + 1}, ${high})`,
          nextOp: `Enter right child execution`,
          callId: callId,
          depth: depth,
          comparingVal1: null,
          comparingVal2: null,
          comparingResult: null,
          activePartition: [pi + 1, high],
          swappedIndices: []
        });

        this.runQuickSort(arr, pi + 1, high, depth + 1, callId);
      }
    } else {
      if (low === high) {
        this.sortedIndices.add(low);
      }
      treeNode.status = 'done';
    }
  }

  runPartition(arr, low, high, depth, callId, treeNode) {
    this.partitionsCount++;

    // Line 5: int pivot = arr[high];
    let pivot = arr[high];
    
    // Line 6: int i = low - 1;
    let i = low - 1;

    this.recordStep({
      type: 'INIT_PARTITION',
      cLine: 5,
      arr: [...arr],
      low: low,
      high: high,
      pivot: pivot,
      pivotIndex: high,
      i: i,
      j: low,
      pi: null,
      phase: 'PARTITION',
      action: `Selected pivot = arr[${high}] (${pivot}), set i = low - 1 (${i})`,
      nextOp: `Start loop for (j = ${low}; j < ${high}; j++)`,
      callId: callId,
      depth: depth,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activePartition: [low, high],
      swappedIndices: []
    });

    // Line 8: for (int j = low; j < high; j++)
    for (let j = low; j < high; j++) {
      this.comparisonsCount++;
      let condition = arr[j] < pivot;

      // Line 9: if (arr[j] < pivot)
      this.recordStep({
        type: 'COMPARE',
        cLine: 9,
        arr: [...arr],
        low: low,
        high: high,
        pivot: pivot,
        pivotIndex: high,
        i: i,
        j: j,
        pi: null,
        phase: 'PARTITIONING',
        action: `Comparing arr[${j}] (${arr[j]}) < pivot (${pivot}): ${condition ? 'TRUE' : 'FALSE'}`,
        nextOp: condition ? `Increment i and swap arr[i] with arr[j]` : `No swap. Move j to ${j + 1}`,
        callId: callId,
        depth: depth,
        comparingVal1: arr[j],
        comparingVal2: pivot,
        comparingResult: condition ? 'TRUE' : 'FALSE',
        activePartition: [low, high],
        swappedIndices: []
      });

      if (condition) {
        i++;
        // Line 10: i++;
        this.recordStep({
          type: 'INC_I',
          cLine: 10,
          arr: [...arr],
          low: low,
          high: high,
          pivot: pivot,
          pivotIndex: high,
          i: i,
          j: j,
          pi: null,
          phase: 'PARTITIONING',
          action: `Incremented i to ${i}`,
          nextOp: `Swap temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;`,
          callId: callId,
          depth: depth,
          comparingVal1: arr[j],
          comparingVal2: pivot,
          comparingResult: 'INC I',
          activePartition: [low, high],
          swappedIndices: []
        });

        // Lines 12, 13, 14: temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        if (i !== j) {
          let temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          this.swapsCount++;
        }

        this.recordStep({
          type: 'SWAP',
          cLine: 13,
          arr: [...arr],
          low: low,
          high: high,
          pivot: pivot,
          pivotIndex: high,
          i: i,
          j: j,
          pi: null,
          phase: 'SWAPPING',
          action: i !== j ? `Swapped arr[${i}] (${arr[i]}) and arr[${j}] (${arr[j]})` : `Element at index ${i} already in position for i`,
          nextOp: `Continue loop for j = ${j + 1}`,
          callId: callId,
          depth: depth,
          comparingVal1: arr[i],
          comparingVal2: arr[j],
          comparingResult: 'SWAPPED',
          activePartition: [low, high],
          swappedIndices: [i, j]
        });
      }
    }

    // Lines 18, 19, 20: int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
    let pivotPos = i + 1;
    if (pivotPos !== high) {
      let temp = arr[pivotPos];
      arr[pivotPos] = arr[high];
      arr[high] = temp;
      this.swapsCount++;
    }

    this.recordStep({
      type: 'PLACE_PIVOT',
      cLine: 19,
      arr: [...arr],
      low: low,
      high: high,
      pivot: pivot,
      pivotIndex: pivotPos,
      i: i,
      j: high,
      pi: pivotPos,
      phase: 'PIVOT PLACEMENT',
      action: `Placed pivot ${pivot} into its correct sorted position at index ${pivotPos} (swap arr[${pivotPos}] and arr[${high}])`,
      nextOp: `Return pivot index pi = ${pivotPos}`,
      callId: callId,
      depth: depth,
      comparingVal1: arr[pivotPos],
      comparingVal2: arr[high],
      comparingResult: 'PIVOT PLACED',
      activePartition: [low, high],
      swappedIndices: [pivotPos, high]
    });

    // Line 22: return i + 1;
    this.recordStep({
      type: 'RETURN_PI',
      cLine: 22,
      arr: [...arr],
      low: low,
      high: high,
      pivot: pivot,
      pivotIndex: pivotPos,
      i: i,
      j: high,
      pi: pivotPos,
      phase: 'PARTITION COMPLETE',
      action: `Partition complete. Returning pi = ${pivotPos}`,
      nextOp: `Return to quickSort caller`,
      callId: callId,
      depth: depth,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activePartition: [low, high],
      swappedIndices: []
    });

    return pivotPos;
  }
}
