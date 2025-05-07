# Parallel Mergesort

Implement a parallel version of mergesort (both the original recursive and the
iterative in-place version from a previous exercise are fine). You may use any
parallelization framework or method.

I have not provided any test code, but you can base yours on test code from
other exercises. Your tests must check the correctness of the result of running
the function and run automatically when you commit through a GitHub action.

## Runtime Analysis

What is the span of the parallel program, in terms of worst-case $\Theta$? Hint:
It may help to consider the DAG of the parallel program.

<hr>

I chose to make a parallel version of my iterative in-place merge sort from `parallel-mergesort-aijun-hall-uwyo`

My approach parallelizes each level of merging across the array.

Parallel Mergesort work distribution:

```
promises.push(new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
        workerData: { buffer, start, mid, end }
    });
```

Each worker thread is assigned a left and right segment of the array to merge in place using a shared buffer.
All merges at a given level (where `sectionLength` is fixed) happen in parallel via `Promise.all()`

Since the algorithm performs merging in $log_2(n)$ phases, where each phase doubles the size of the merged subarrays,
and merges in each phase run in parallel, the critical path consists of one in-place merge per level, increasing in size
each time.

Merges are sequential within each merge, but parallel across each level. So the longest sequence of dependent steps
is a single merge per level, growing in size each time.

Thus the span is : $\Theta(1 + 2 + 4 + ... + n) = \Theta(n)$

- Referenced https://www.geeksforgeeks.org/merge-sort-using-multi-threading/ for writing code and runtime analysis.
All code is written by me.

- Referenced https://nodejs.org/api/worker_threads.html for documentation on multithreading in javascript

- Referenced https://www.geeksforgeeks.org/node-js-worker-threads/ for documentation on multithreading in javascript

- Referenced previous mergesort-aijun-hall-uwyo repo assignment, and borrowed certain code snippets from past
mergesort work

"I certify that I have listed all sources used to complete this exercise, including the use of any Large Language Models. All of the work is my own, except where stated otherwise. I am aware that plagiarism carries severe penalties and that if plagiarism is suspected, charges may be filed against me without prior notice."