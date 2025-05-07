const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function mergesort(array, start, mid, end) {
    // Define indicies
    // Left subarray = array[start] - array[mid - 1]
    // Right subarray = array[mid] - array[end - 1]
    let leftStartingIndex = start;
    let rightStartingIndex = mid;

    // If elements in left AND right subarrays
    while (leftStartingIndex < rightStartingIndex && rightStartingIndex < end) {
        if (array[leftStartingIndex] <= array[rightStartingIndex]) {
            leftStartingIndex = leftStartingIndex + 1;
        } else {
            const temp = array[rightStartingIndex];
            let index = rightStartingIndex;

            // Shift everything to the right
            while (index > leftStartingIndex) {
                array[index] = array[index - 1];
                index = index - 1;
            }

            array[leftStartingIndex] = temp;

            // Update all indicies to shuffle along to the right
            leftStartingIndex = leftStartingIndex + 1;
            rightStartingIndex = rightStartingIndex + 1;
        }
    }
}

// Worker thread logic
if (!isMainThread) {
    const { buffer, start, mid, end } = workerData;

    // Convert the shared buffer back into an Int32Array so we can operate on it
    const array = new Int32Array(buffer);

    // Run the in-place merge on the assigned segment of the shared array
    mergesort(array, start, mid, end);

    // Notify the parent that this worker is done processing when finished
    parentPort.postMessage('done');
}

if (isMainThread) {
    async function parallel_mergesort(inputArray) {
        const length = inputArray.length;

        // Create a shared memory buffer to allow all threads to access and modify the same array
        // since this is an in place solution
        const buffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);

        // Wrap that buffer in a typed array view so we can treat it like a normal array
        const array = new Int32Array(buffer);

        // Copy inputArray values into the shared memory array
        inputArray.forEach((value, index) => array[index] = value);

        let sectionLength = 1;

        // Iteratively perform merge passes with increasing section lengths
        while (sectionLength < length) {
            const promises = [];

            // Divide the array into sections of size `2 * sectionLength`
            for (let start = 0; start < length; start += (2 * sectionLength)) {
                // Don't go past end of array by using Math.min with length
                const mid = Math.min(start + sectionLength, length);
                const end = Math.min(start + (2 * sectionLength), length);

                if (mid < end) {
                    // Spawn a worker thread to merge the left and right halves in-place
                    // Execute same file (code.js) with __filename, and pass to
                    // workerData object containing the shared buffer and merge indicies
                    promises.push(new Promise((resolve, reject) => {
                        const worker = new Worker(__filename, {
                            workerData: { buffer, start, mid, end }
                        });

                        // Resolve the promise when the worker finishes
                        worker.on('message', () => resolve());

                        // Reject on error
                        worker.on('error', reject);

                        // Catch any weird exits
                        worker.on('exit', code => {
                            if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
                        });
                    }));
                }
            }

            // Wait for all merge tasks to finish before doubling the section length
            await Promise.all(promises);
            sectionLength *= 2;
        }

        // Return a copy of the final sorted array from the shared buffer
        return Array.from(array);
    }

    module.exports = { parallel_mergesort };
}
