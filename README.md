This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
