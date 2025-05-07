const fs = require('fs');
const jsc = require('jsverify');
const { parallel_mergesort } = require('./code.js');

// Test 1: Output should match built-in `.sort()`
const testSort =
    jsc.forall("array nat", function (arr) {
        return parallel_mergesort([...arr]).then(sorted =>
            JSON.stringify(sorted) ==
            JSON.stringify([...arr].sort((a, b) => a - b))
        );
    });

// Test 2: Elements are in ascending order
const testAscendingOrder =
    jsc.forall("array nat", function (arr) {
        return parallel_mergesort([...arr]).then(sorted => {
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i - 1] > sorted[i]) {
                    return false;
                }
            }
            return true;
        });
    });

// Test 3: Hardcoded test
const testHardcoded =
    jsc.forall(jsc.constant([5, 2, 9, 1, 5, 6]), function (arr) {
        return parallel_mergesort([...arr]).then(sorted =>
            JSON.stringify(sorted) == JSON.stringify([1, 2, 5, 5, 6, 9])
        );
    });

// Test 4: Hardcoded with duplicates
const testHardcodedDuplicates =
    jsc.forall(jsc.constant([1, 1, 2, 2, 3, 3]), function (arr) {
        return parallel_mergesort([...arr]).then(sorted =>
            JSON.stringify(sorted) == JSON.stringify([1, 1, 2, 2, 3, 3])
        );
    });

// Helper to run async jsc tests
async function runAsyncTest(property, label) {
    try {
        const result = await jsc.check(property);
        if (result == true) {
            console.log(`passed ${label}`);
        } else {
            console.error(`failed ${label}`, result);
        }
    } catch (err) {
        console.error(`error in ${label}:`, err);
    }
}

// Run all tests
(async () => {
    await runAsyncTest(testSort, 'testSort');
    await runAsyncTest(testAscendingOrder, 'testAscendingOrder');
    await runAsyncTest(testHardcoded, 'testHardcoded');
    await runAsyncTest(testHardcodedDuplicates, 'testHardcodedDuplicates');
})();
