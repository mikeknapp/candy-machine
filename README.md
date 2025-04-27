This is a [Next.js](https://nextjs.org) project.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Then ensure oclip is running:

```bash
cd ../oclip
conda activate oclip
python src/app.py
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

This project uses a custom lightweight testing framework. To run all tests:

```bash
npm run tests
```

### Creating Tests

To create a new test:

1. Create a file with a name ending in `Test.ts` (e.g., `myFeatureTest.ts`)
2. Inside the file, write your test logic with assertions
3. Export a `runTests` function for more structured tests:

```typescript
// example: lib/myFeatureTest.ts
export async function runTests() {
  console.log("Running my feature tests")

  // Your test logic here
  const result = myFunction()
  console.assert(result === expectedValue, `Expected ${expectedValue}, got ${result}`)

  if (allTestsPassed) {
    console.log("✅ Tests passed!")
  } else {
    console.log("❌ Tests failed!")
  }
}

// You can also run the tests directly when the file is imported
runTests().catch(console.error)
```

All files ending with `Test.ts` will be automatically discovered and executed when running `npm run tests`.
