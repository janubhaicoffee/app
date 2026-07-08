/**
 * Unit and Boundary Tests for ProductClient Customizer
 * Co-located in src/app/product/[id]/ProductClient.test.js
 */

const fs = require('fs');
const path = require('path');

// 1. Percentage formula extraction
function calculatePercentage(value, min = 1, max = 100) {
  // Verbatim from ProductClient.jsx line 14:
  return max === min ? 0 : ((value - min) / (max - min)) * 100;
}

// 2. Mocking and testing percentage logic
function runPercentageTests() {
  console.log('=== Running Slider Percentage Boundary Tests ===');
  const testCases = [
    { name: 'value = min', value: 1, min: 1, max: 100, expected: 0 },
    { name: 'value = max', value: 100, min: 1, max: 100, expected: 100 },
    { name: 'value = midpoint', value: 50.5, min: 1, max: 100, expected: 50 },
    { name: 'min = max (division by zero safety)', value: 50, min: 50, max: 50, expected: 0 },
    { name: 'value below min', value: -10, min: 1, max: 100, expected: -11.11111111111111 },
    { name: 'value above max', value: 150, min: 1, max: 100, expected: 150.50505050505052 },
    { name: 'value below min (min=max)', value: 10, min: 50, max: 50, expected: 0 },
  ];

  let failures = 0;
  for (const tc of testCases) {
    const result = calculatePercentage(tc.value, tc.min, tc.max);
    // Use a tolerance for floating point comparison
    const diff = Math.abs(result - tc.expected);
    if (diff < 1e-7) {
      console.log(
        `✅ PASS: ${tc.name} (val: ${tc.value}, min: ${tc.min}, max: ${tc.max}) -> Result: ${result}%`,
      );
    } else {
      console.error(
        `❌ FAIL: ${tc.name} (val: ${tc.value}, min: ${tc.min}, max: ${tc.max}) -> Expected: ${tc.expected}%, Got: ${result}%`,
      );
      failures++;
    }
  }

  return failures === 0;
}

// 3. Static Code Analysis of ProductClient.jsx
function analyzeProductClientCode() {
  console.log('\n=== Analyzing ProductClient.jsx Source Code ===');
  const filePath = path.join(__dirname, 'ProductClient.jsx');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: Could not find ProductClient.jsx at ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let pass = true;

  // Verify hidden input overlay attributes
  console.log('Checking input overlays...');
  const hasTypeRange = content.includes('type="range"');
  const hasMin = content.includes('min={min}');
  const hasMax = content.includes('max={max}');
  const hasValue = content.includes('value={value}');
  const hasOnChange = content.includes('onChange={(e) => onChange(Number(e.target.value))}');
  const hasOnFocus = content.includes('onFocus={() => setIsFocused(true)}');
  const hasOnBlur = content.includes('onBlur={() => setIsFocused(false)}');

  if (hasTypeRange && hasMin && hasMax && hasValue && hasOnChange && hasOnFocus && hasOnBlur) {
    console.log(
      '✅ PASS: Hidden native input overlay contains correct accessibility & state attributes.',
    );
  } else {
    console.error('❌ FAIL: Input overlay is missing expected attributes.');
    console.log({ hasTypeRange, hasMin, hasMax, hasValue, hasOnChange, hasOnFocus, hasOnBlur });
    pass = false;
  }

  // Verify 3D card layout and animation attributes
  console.log('Checking 3D flip card and holographic animation states...');
  const hasPerspective = content.includes("perspective: '1000px'");
  const hasAnimatePresenceMode = content.includes('mode="wait"');
  const hasLockedDropRotateY = content.includes('rotateY: 0') && content.includes('rotateY: -90');
  const hasRevealedDropRotateY = content.includes('rotateY: 90') && content.includes('scale: 0.95');
  const hasHolographicShimmer =
    content.includes('holographic-reveal') && content.includes("left: ['-150%', '150%']");

  if (
    hasPerspective &&
    hasAnimatePresenceMode &&
    hasLockedDropRotateY &&
    hasRevealedDropRotateY &&
    hasHolographicShimmer
  ) {
    console.log(
      '✅ PASS: 3D Flip Card transition and holographic shimmer attributes are correctly configured.',
    );
  } else {
    console.error(
      '❌ FAIL: 3D card layout or holographic animation properties are missing/incorrect.',
    );
    console.log({
      hasPerspective,
      hasAnimatePresenceMode,
      hasLockedDropRotateY,
      hasRevealedDropRotateY,
      hasHolographicShimmer,
    });
    pass = false;
  }

  // Check for potential design flaws or caveats
  console.log('\n=== Checking for Known Issues / Edge Cases ===');
  // Check if there is clamping in query param parser
  const sleepDebtInit =
    content.includes('const sd = searchParams?.get("sleep_debt");') &&
    content.includes('Number(sd) : 50');
  const workloadInit =
    content.includes('const wl = searchParams?.get("workload");') &&
    content.includes('Number(wl) : 50');

  if (sleepDebtInit && workloadInit) {
    console.log(
      "⚠️ WARNING: Query parameters 'sleep_debt' and 'workload' are read from URL without bounds check or clamping. User can inject arbitrary values.",
    );
  }

  // Check if percentage calculation clamps to [0, 100]
  if (!content.includes('Math.min(100, Math.max(0')) {
    console.log(
      '⚠️ WARNING: Percentage calculation does not clamp percentage values to [0, 100]. Customizer handles might render out-of-bounds if values are manipulated via URL parameters.',
    );
  }

  return pass;
}

// Run tests
const percentagePass = runPercentageTests();
const codeAnalysisPass = analyzeProductClientCode();

if (percentagePass && codeAnalysisPass) {
  console.log('\n🎉 ALL TESTS PASSED!');
  process.exit(0);
} else {
  console.error('\n❌ SOME TESTS FAILED!');
  process.exit(1);
}
