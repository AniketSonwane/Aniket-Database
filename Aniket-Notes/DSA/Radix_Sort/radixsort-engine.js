/**
 * Radix Sort Step Simulation Engine with Line-by-Line Mapping to User's C++ Code
 * Lines 1-53: includes, getMax, countingSort, radixSort, main
 */

class RadixSortEngine {
  constructor(initialArray) {
    this.initialArray = [...initialArray];
    this.steps = [];
    this.digitOpsCount = 0;
    this.maxPasses = 0;

    this.generateSteps();
  }

  generateSteps() {
    let arr = [...this.initialArray];
    let n = arr.length;

    // Step 0: Entry into main() (Line 41)
    this.recordStep({
      type: 'INIT',
      cLine: 41,
      arr: [...arr],
      n: n,
      maxVal: null,
      exp: 1,
      passName: 'INITIALIZATION',
      passNum: 0,
      totalPasses: 0,
      i: null,
      digit: null,
      count: [0,0,0,0,0,0,0,0,0,0],
      output: new Array(n).fill(null),
      buckets: this.initBuckets(),
      phase: 'INITIALIZATION',
      action: `int main(): Initialized array of size n = ${n}`,
      nextOp: `Call radixSort(arr, ${n})`,
      activeBucket: null,
      activeBoxIndex: null,
      swappedIndices: []
    });

    // Step 1: Call radixSort(arr, n) (Line 45 -> 34)
    this.recordStep({
      type: 'CALL_RADIX',
      cLine: 34,
      arr: [...arr],
      n: n,
      maxVal: null,
      exp: 1,
      passName: 'INITIALIZATION',
      passNum: 0,
      totalPasses: 0,
      i: null,
      digit: null,
      count: [0,0,0,0,0,0,0,0,0,0],
      output: new Array(n).fill(null),
      buckets: this.initBuckets(),
      phase: 'INITIALIZATION',
      action: `Entered void radixSort(int arr[], int n = ${n})`,
      nextOp: `Call int max = getMax(arr, ${n})`,
      activeBucket: null,
      activeBoxIndex: null,
      swappedIndices: []
    });

    // Step 2: Find maxVal using getMax (Lines 35 & 4-13)
    let maxVal = arr[0];
    for (let i = 1; i < n; i++) {
      if (arr[i] > maxVal) maxVal = arr[i];
    }
    let totalPasses = maxVal === 0 ? 1 : Math.floor(Math.log10(maxVal)) + 1;
    this.maxPasses = totalPasses;

    this.recordStep({
      type: 'GET_MAX',
      cLine: 35,
      arr: [...arr],
      n: n,
      maxVal: maxVal,
      exp: 1,
      passName: 'INITIALIZATION',
      passNum: 0,
      totalPasses: totalPasses,
      i: null,
      digit: null,
      count: [0,0,0,0,0,0,0,0,0,0],
      output: new Array(n).fill(null),
      buckets: this.initBuckets(),
      phase: 'FIND MAX',
      action: `getMax(arr, ${n}) returned max = ${maxVal}. Total passes required: ${totalPasses}`,
      nextOp: `Start loop for (exp = 1; max / exp > 0; exp *= 10)`,
      activeBucket: null,
      activeBoxIndex: null,
      swappedIndices: []
    });

    let passNum = 0;

    // Outer Loop: for (int exp = 1; max / exp > 0; exp *= 10) (Line 37)
    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      passNum++;
      let passName = exp === 1 ? 'ONES' : (exp === 10 ? 'TENS' : (exp === 100 ? 'HUNDREDS' : `EXP ${exp}`));

      // Line 38: countingSort(arr, n, exp);
      this.recordStep({
        type: 'ENTER_COUNTING_SORT',
        cLine: 38,
        arr: [...arr],
        n: n,
        maxVal: maxVal,
        exp: exp,
        passName: passName,
        passNum: passNum,
        totalPasses: totalPasses,
        i: null,
        digit: null,
        count: [0,0,0,0,0,0,0,0,0,0],
        output: new Array(n).fill(null),
        buckets: this.initBuckets(),
        phase: `${passName} PASS`,
        action: `Call countingSort(arr, ${n}, exp = ${exp})`,
        nextOp: `Initialize count[10] = {0} and output[100]`,
        activeBucket: null,
        activeBoxIndex: null,
        swappedIndices: []
      });

      this.runCountingSort(arr, n, exp, maxVal, passName, passNum, totalPasses);
    }

    // Line 47: cout << "Sorted array: ";
    this.recordStep({
      type: 'PRINT_OUTPUT',
      cLine: 47,
      arr: [...arr],
      n: n,
      maxVal: maxVal,
      exp: null,
      passName: 'PRINTING',
      passNum: totalPasses,
      totalPasses: totalPasses,
      i: null,
      digit: null,
      count: [0,0,0,0,0,0,0,0,0,0],
      output: [...arr],
      buckets: this.initBuckets(),
      phase: 'PRINTING',
      action: 'Executing cout << "Sorted array: ";',
      nextOp: 'Print sorted array elements',
      activeBucket: null,
      activeBoxIndex: null,
      swappedIndices: []
    });

    // Step Final: return 0 (Line 52)
    this.recordStep({
      type: 'SORT_COMPLETE',
      cLine: 52,
      arr: [...arr],
      n: n,
      maxVal: maxVal,
      exp: null,
      passName: 'COMPLETE',
      passNum: totalPasses,
      totalPasses: totalPasses,
      i: null,
      digit: null,
      count: [0,0,0,0,0,0,0,0,0,0],
      output: [...arr],
      buckets: this.initBuckets(),
      phase: 'COMPLETE',
      action: 'Radix Sort complete! Returning 0 from main().',
      nextOp: 'Program completed successfully',
      activeBucket: null,
      activeBoxIndex: null,
      swappedIndices: []
    });
  }

  runCountingSort(arr, n, exp, maxVal, passName, passNum, totalPasses) {
    let output = new Array(n).fill(null);
    let count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let buckets = this.initBuckets();

    // 1. Count Frequencies & Populate Buckets (Lines 19-20)
    for (let i = 0; i < n; i++) {
      this.digitOpsCount++;
      let digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
      buckets[digit].push(arr[i]);

      // Line 20: count[(arr[i] / exp) % 10]++;
      this.recordStep({
        type: 'COUNT_DIGIT',
        cLine: 20,
        arr: [...arr],
        n: n,
        maxVal: maxVal,
        exp: exp,
        passName: passName,
        passNum: passNum,
        totalPasses: totalPasses,
        i: i,
        digit: digit,
        count: [...count],
        output: [...output],
        buckets: JSON.parse(JSON.stringify(buckets)),
        phase: 'DIGIT COUNTING',
        action: `arr[${i}] = ${arr[i]} → digit = (${arr[i]} / ${exp}) % 10 = ${digit}. Added to Bucket ${digit}. count[${digit}] = ${count[digit]}`,
        nextOp: i + 1 < n ? `Process arr[${i + 1}] (${arr[i + 1]})` : `Calculate cumulative prefix count`,
        activeBucket: digit,
        activeBoxIndex: i,
        swappedIndices: []
      });
    }

    // 2. Cumulative Count Prefix Sum (Lines 22-23)
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];

      // Line 23: count[i] += count[i - 1];
      this.recordStep({
        type: 'PREFIX_SUM',
        cLine: 23,
        arr: [...arr],
        n: n,
        maxVal: maxVal,
        exp: exp,
        passName: passName,
        passNum: passNum,
        totalPasses: totalPasses,
        i: i,
        digit: i,
        count: [...count],
        output: [...output],
        buckets: JSON.parse(JSON.stringify(buckets)),
        phase: 'PREFIX SUM',
        action: `Cumulative count for digit ${i}: count[${i}] += count[${i - 1}] → ${count[i]}`,
        nextOp: i + 1 < 10 ? `Compute prefix sum for digit ${i + 1}` : `Build output array stably from right to left`,
        activeBucket: i,
        activeBoxIndex: null,
        swappedIndices: []
      });
    }

    // 3. Build Output Array Stably in Reverse Order (Lines 25-28)
    for (let i = n - 1; i >= 0; i--) {
      this.digitOpsCount++;
      let digit = Math.floor(arr[i] / exp) % 10;
      let targetPos = count[digit] - 1;
      output[targetPos] = arr[i];

      // Line 26: output[count[(arr[i] / exp) % 10] - 1] = arr[i];
      this.recordStep({
        type: 'BUILD_OUTPUT',
        cLine: 26,
        arr: [...arr],
        n: n,
        maxVal: maxVal,
        exp: exp,
        passName: passName,
        passNum: passNum,
        totalPasses: totalPasses,
        i: i,
        digit: digit,
        count: [...count],
        output: [...output],
        buckets: JSON.parse(JSON.stringify(buckets)),
        phase: 'OUTPUT PLACEMENT',
        action: `arr[${i}] = ${arr[i]} (digit ${digit}) placed into output[${targetPos}]`,
        nextOp: `Decrement count[${digit}]`,
        activeBucket: digit,
        activeBoxIndex: i,
        swappedIndices: []
      });

      count[digit]--;

      // Line 27: count[(arr[i] / exp) % 10]--;
      this.recordStep({
        type: 'DECREMENT_COUNT',
        cLine: 27,
        arr: [...arr],
        n: n,
        maxVal: maxVal,
        exp: exp,
        passName: passName,
        passNum: passNum,
        totalPasses: totalPasses,
        i: i,
        digit: digit,
        count: [...count],
        output: [...output],
        buckets: JSON.parse(JSON.stringify(buckets)),
        phase: 'OUTPUT PLACEMENT',
        action: `Decremented count[${digit}] to ${count[digit]}`,
        nextOp: i - 1 >= 0 ? `Process arr[${i - 1}]` : `Copy output array back to arr[]`,
        activeBucket: digit,
        activeBoxIndex: i,
        swappedIndices: []
      });
    }

    // 4. Copy Output Array Back to Original Array (Lines 30-31)
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];

      // Line 31: arr[i] = output[i];
      this.recordStep({
        type: 'COPY_BACK',
        cLine: 31,
        arr: [...arr],
        n: n,
        maxVal: maxVal,
        exp: exp,
        passName: passName,
        passNum: passNum,
        totalPasses: totalPasses,
        i: i,
        digit: null,
        count: [...count],
        output: [...output],
        buckets: JSON.parse(JSON.stringify(buckets)),
        phase: 'COPY BACK',
        action: `Copied output[${i}] (${output[i]}) back into arr[${i}]`,
        nextOp: i + 1 < n ? `Copy output[${i + 1}]` : `${passName} Pass Complete!`,
        activeBucket: null,
        activeBoxIndex: i,
        swappedIndices: [i]
      });
    }
  }

  initBuckets() {
    return [[], [], [], [], [], [], [], [], [], []];
  }

  recordStep(details) {
    this.steps.push({
      ...details,
      arrState: [...details.arr],
      digitOpsCount: this.digitOpsCount,
      maxPasses: this.maxPasses
    });
  }
}
