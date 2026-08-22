/**
 * Merge Sort Step Simulation Engine with Line-by-Line Mapping to User's C++ Code
 * algorithm: mergeSort(arr, low, high) with temp[100]
 */

class MergeSortEngine {
  constructor(initialArray) {
    this.initialArray = [...initialArray];
    this.steps = [];
    this.comparisonsCount = 0;
    this.assignmentsCount = 0;
    this.mergeCallsCount = 0;
    this.maxRecursionDepth = 0;
    this.callIdCounter = 0;
    this.recursionTree = [];

    this.generateSteps();
  }

  generateSteps() {
    let arr = [...this.initialArray];
    let n = arr.length;

    // Initial State (Step 0)
    this.recordStep({
      type: 'INIT',
      cLine: 29,
      arr: [...arr],
      low: 0,
      mid: Math.floor((n - 1) / 2),
      high: n - 1,
      i: null,
      j: null,
      k: null,
      temp: [],
      phase: 'INITIALIZATION',
      action: 'Starting mergeSort(arr, 0, ' + (n - 1) + ')',
      nextOp: 'Check if (low < high)',
      callId: null,
      depth: 0,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activeSubarray: [0, n - 1],
      highlightedIndices: []
    });

    // Run Recursive Merge Sort
    this.runMergeSort(arr, 0, n - 1, 0, null);

    // Final Completion Step
    this.recordStep({
      type: 'SORT_COMPLETE',
      cLine: 38,
      arr: [...arr],
      low: 0,
      mid: Math.floor((n - 1) / 2),
      high: n - 1,
      i: null,
      j: null,
      k: null,
      temp: [],
      phase: 'COMPLETE',
      action: 'Merge Sort complete! Array is fully sorted.',
      nextOp: 'Output sorted array',
      callId: null,
      depth: 0,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activeSubarray: [0, n - 1],
      highlightedIndices: Array.from({ length: n }, (_, idx) => idx)
    });
  }

  recordStep(details) {
    this.steps.push({
      ...details,
      arrState: [...details.arr],
      tempState: details.temp ? [...details.temp] : [],
      comparisonsCount: this.comparisonsCount,
      assignmentsCount: this.assignmentsCount,
      mergeCallsCount: this.mergeCallsCount,
      maxRecursionDepth: this.maxRecursionDepth,
      treeSnapshot: JSON.parse(JSON.stringify(this.recursionTree))
    });
  }

  runMergeSort(arr, low, high, depth, parentCallId) {
    this.maxRecursionDepth = Math.max(this.maxRecursionDepth, depth);
    let callId = ++this.callIdCounter;

    const treeNode = {
      id: callId,
      parentId: parentCallId,
      left: low,
      right: high,
      depth: depth,
      status: 'active',
      subArray: arr.slice(low, high + 1)
    };
    this.recursionTree.push(treeNode);

    // Line 29: void mergeSort(int arr[], int low, int high)
    this.recordStep({
      type: 'ENTER_MERGESORT',
      cLine: 29,
      arr: [...arr],
      low: low,
      mid: null,
      high: high,
      i: null,
      j: null,
      k: null,
      temp: [],
      phase: 'DIVIDE',
      action: `mergeSort(arr, low=${low}, high=${high}) called at depth ${depth}`,
      nextOp: `Evaluate if (low < high) (${low} < ${high})`,
      callId: callId,
      depth: depth,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activeSubarray: [low, high],
      highlightedIndices: []
    });

    // Line 30: if (low < high)
    let canSplit = low < high;
    this.recordStep({
      type: 'CHECK_BASE_CASE',
      cLine: 30,
      arr: [...arr],
      low: low,
      mid: null,
      high: high,
      i: null,
      j: null,
      k: null,
      temp: [],
      phase: 'DIVIDE',
      action: `Base case check: low < high (${low} < ${high}) is ${canSplit ? 'TRUE' : 'FALSE (Single Element)'}`,
      nextOp: canSplit ? `Calculate mid = (low + high) / 2` : `Return from recursion`,
      callId: callId,
      depth: depth,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: canSplit ? 'TRUE' : 'FALSE',
      activeSubarray: [low, high],
      highlightedIndices: []
    });

    if (canSplit) {
      let mid = Math.floor((low + high) / 2);
      treeNode.mid = mid;

      // Line 31: int mid = (low + high) / 2;
      this.recordStep({
        type: 'CALC_MID',
        cLine: 31,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: null,
        j: null,
        k: null,
        temp: [],
        phase: 'DIVIDE',
        action: `Calculated mid = (${low} + ${high}) / 2 = ${mid}`,
        nextOp: `Call mergeSort(arr, ${low}, ${mid})`,
        callId: callId,
        depth: depth,
        comparingVal1: null,
        comparingVal2: null,
        comparingResult: null,
        activeSubarray: [low, high],
        highlightedIndices: []
      });

      // Line 33: mergeSort(arr, low, mid);
      this.recordStep({
        type: 'RECURSE_LEFT',
        cLine: 33,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: null,
        j: null,
        k: null,
        temp: [],
        phase: 'DIVIDE',
        action: `Recursing left half: mergeSort(arr, ${low}, ${mid})`,
        nextOp: `Enter left child execution`,
        callId: callId,
        depth: depth,
        comparingVal1: null,
        comparingVal2: null,
        comparingResult: null,
        activeSubarray: [low, mid],
        highlightedIndices: []
      });

      this.runMergeSort(arr, low, mid, depth + 1, callId);

      // Line 34: mergeSort(arr, mid + 1, high);
      this.recordStep({
        type: 'RECURSE_RIGHT',
        cLine: 34,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: null,
        j: null,
        k: null,
        temp: [],
        phase: 'DIVIDE',
        action: `Recursing right half: mergeSort(arr, ${mid + 1}, ${high})`,
        nextOp: `Enter right child execution`,
        callId: callId,
        depth: depth,
        comparingVal1: null,
        comparingVal2: null,
        comparingResult: null,
        activeSubarray: [mid + 1, high],
        highlightedIndices: []
      });

      this.runMergeSort(arr, mid + 1, high, depth + 1, callId);

      // Line 36: merge(arr, low, mid, high);
      this.recordStep({
        type: 'CALL_MERGE',
        cLine: 36,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: null,
        j: null,
        k: null,
        temp: [],
        phase: 'CONQUER & MERGE',
        action: `Subarrays sorted. Calling merge(arr, low=${low}, mid=${mid}, high=${high})`,
        nextOp: `Initialize temp[100] and pointers i=${low}, j=${mid + 1}, k=${low}`,
        callId: callId,
        depth: depth,
        comparingVal1: null,
        comparingVal2: null,
        comparingResult: null,
        activeSubarray: [low, high],
        highlightedIndices: []
      });

      this.runMerge(arr, low, mid, high, depth, callId, treeNode);
      treeNode.status = 'merged';
    } else {
      treeNode.status = 'done';
    }
  }

  runMerge(arr, low, mid, high, depth, callId, treeNode) {
    this.mergeCallsCount++;

    // Line 6: int i = low, j = mid + 1, k = low;
    let temp = new Array(high + 1).fill(null);
    let i = low;
    let j = mid + 1;
    let k = low;

    this.recordStep({
      type: 'INIT_MERGE',
      cLine: 6,
      arr: [...arr],
      low: low,
      mid: mid,
      high: high,
      i: i,
      j: j,
      k: k,
      temp: [...temp],
      phase: 'MERGING',
      action: `Initialized pointers: i=${i}, j=${j}, k=${k}`,
      nextOp: `Begin comparison while (i <= mid && j <= high)`,
      callId: callId,
      depth: depth,
      comparingVal1: null,
      comparingVal2: null,
      comparingResult: null,
      activeSubarray: [low, high],
      highlightedIndices: [i, j]
    });

    // Line 8: while (i <= mid && j <= high)
    while (i <= mid && j <= high) {
      this.comparisonsCount++;
      let condition = arr[i] < arr[j];

      // Line 9: if (arr[i] < arr[j])
      this.recordStep({
        type: 'COMPARE',
        cLine: 9,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: i,
        j: j,
        k: k,
        temp: [...temp],
        phase: 'MERGING',
        action: `Comparing arr[${i}] (${arr[i]}) < arr[${j}] (${arr[j]}): is ${condition ? 'TRUE' : 'FALSE'}`,
        nextOp: condition ? `Execute temp[k++] = arr[i++]` : `Execute temp[k++] = arr[j++]`,
        callId: callId,
        depth: depth,
        comparingVal1: arr[i],
        comparingVal2: arr[j],
        comparingResult: condition ? 'TRUE' : 'FALSE',
        activeSubarray: [low, high],
        highlightedIndices: [i, j]
      });

      if (condition) {
        temp[k] = arr[i];
        this.assignmentsCount++;

        // Line 10: temp[k++] = arr[i++];
        this.recordStep({
          type: 'PLACE_LEFT',
          cLine: 10,
          arr: [...arr],
          low: low,
          mid: mid,
          high: high,
          i: i,
          j: j,
          k: k,
          temp: [...temp],
          phase: 'MERGING',
          action: `Copied arr[${i}] (${arr[i]}) to temp[${k}]`,
          nextOp: `Increment i to ${i + 1} and k to ${k + 1}`,
          callId: callId,
          depth: depth,
          comparingVal1: arr[i],
          comparingVal2: arr[j],
          comparingResult: 'COPY LEFT',
          activeSubarray: [low, high],
          highlightedIndices: [i]
        });

        i++;
      } else {
        temp[k] = arr[j];
        this.assignmentsCount++;

        // Line 12: temp[k++] = arr[j++];
        this.recordStep({
          type: 'PLACE_RIGHT',
          cLine: 12,
          arr: [...arr],
          low: low,
          mid: mid,
          high: high,
          i: i,
          j: j,
          k: k,
          temp: [...temp],
          phase: 'MERGING',
          action: `Copied arr[${j}] (${arr[j]}) to temp[${k}]`,
          nextOp: `Increment j to ${j + 1} and k to ${k + 1}`,
          callId: callId,
          depth: depth,
          comparingVal1: arr[i],
          comparingVal2: arr[j],
          comparingResult: 'COPY RIGHT',
          activeSubarray: [low, high],
          highlightedIndices: [j]
        });

        j++;
      }

      k++;
    }

    // Line 16: while (i <= mid)
    while (i <= mid) {
      temp[k] = arr[i];
      this.assignmentsCount++;

      // Line 17: temp[k++] = arr[i++];
      this.recordStep({
        type: 'CLEANUP_LEFT',
        cLine: 17,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: i,
        j: j,
        k: k,
        temp: [...temp],
        phase: 'MERGING CLEANUP',
        action: `Copied remaining arr[${i}] (${arr[i]}) to temp[${k}]`,
        nextOp: `Increment i and k`,
        callId: callId,
        depth: depth,
        comparingVal1: arr[i],
        comparingVal2: null,
        comparingResult: 'CLEANUP LEFT',
        activeSubarray: [low, high],
        highlightedIndices: [i]
      });

      i++;
      k++;
    }

    // Line 20: while (j <= high)
    while (j <= high) {
      temp[k] = arr[j];
      this.assignmentsCount++;

      // Line 21: temp[k++] = arr[j++];
      this.recordStep({
        type: 'CLEANUP_RIGHT',
        cLine: 21,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: i,
        j: j,
        k: k,
        temp: [...temp],
        phase: 'MERGING CLEANUP',
        action: `Copied remaining arr[${j}] (${arr[j]}) to temp[${k}]`,
        nextOp: `Increment j and k`,
        callId: callId,
        depth: depth,
        comparingVal1: null,
        comparingVal2: arr[j],
        comparingResult: 'CLEANUP RIGHT',
        activeSubarray: [low, high],
        highlightedIndices: [j]
      });

      j++;
      k++;
    }

    // Line 24 & 25: for (i = low; i <= high; i++) arr[i] = temp[i];
    for (let c = low; c <= high; c++) {
      arr[c] = temp[c];
      this.assignmentsCount++;

      this.recordStep({
        type: 'COPY_BACK',
        cLine: 25,
        arr: [...arr],
        low: low,
        mid: mid,
        high: high,
        i: c,
        j: j,
        k: c,
        temp: [...temp],
        phase: 'COPYING BACK',
        action: `Copied temp[${c}] (${temp[c]}) back to arr[${c}]`,
        nextOp: c < high ? `Copy next element to arr` : `Merge complete for range [${low}...${high}]`,
        callId: callId,
        depth: depth,
        comparingVal1: null,
        comparingVal2: null,
        comparingResult: 'COPY BACK',
        activeSubarray: [low, high],
        highlightedIndices: [c]
      });
    }

    treeNode.subArray = arr.slice(low, high + 1);
  }
}
