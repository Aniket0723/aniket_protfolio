export const blogPosts = [
  {
    id: "aws-s3-ecommerce",
    title: "AWS S3 Ecommerce — Complete Notes",
    date: "May 4, 2026",
    readTime: "20 min read",
    tags: ["AWS", "S3", "CloudFront", "Node.js", "Next.js"],
    summary:
      "A full reference for everything used in building an ecommerce app with S3 image uploads: S3, IAM, CloudFront, presigned URLs, CORS, and how they all connect.",
    content: `
## 1. What is AWS S3?

**S3 = Simple Storage Service**

S3 is AWS's object storage service. It stores files (called **objects**) inside containers called **buckets**. Unlike a file system, there are no real folders — just keys (paths) like \`products/shoe.png\`.

- Infinitely scalable — no storage limit
- Highly durable — 99.999999999% (11 nines) durability
- Each object can be up to 5TB
- Objects are accessed via HTTP URLs
- Buckets are private by default

**S3 is not a database.** It stores raw files — images, videos, PDFs, backups. MongoDB stores the structured data (name, price, brand) and a reference to the S3 file.

---

## 2. Why S3 instead of storing files on the backend?

If you stored images directly on your Node.js server, the image lives on the server's disk.

**Problems with this approach:**

- Server disk fills up
- If the server restarts or crashes, files are lost
- Doesn't scale — multiple server instances can't share the same disk
- Your server bandwidth is used for every image download
- Expensive to scale storage

**With S3:**

- Storage is separate from compute — scale independently
- Files survive server restarts
- S3 handles millions of requests
- Direct browser-to-S3 upload saves your server bandwidth entirely
- Pay only for what you store and transfer

---

## 3. AWS Services Used in This Project

### S3 (Simple Storage Service)

Stores product images in the \`products/\` folder inside the \`an-aws-s3-ecommerce\` bucket.

### IAM (Identity and Access Management)

Controls **who** can access AWS resources and **what** they can do. We created a dedicated IAM user with a custom policy that only allows \`PutObject\` on our specific bucket — nothing else.

### CloudFront (CDN — Content Delivery Network)

Sits in front of S3 and serves images from 400+ edge locations worldwide. Users get images from the nearest server instead of always hitting S3 in Mumbai.

### AWS SDK for JavaScript

The official npm package used in the Node.js backend to interact with S3 — creating presigned URLs, uploading objects.

### AWS S3 Request Presigner

Used to generate time-limited signed URLs that allow the browser to upload directly to S3 without exposing AWS credentials.

---

## 4. Step 1 — Create an S3 Bucket

Go to **AWS Console → S3 → Create Bucket**

| Setting | Value | Why |
| ----------------------- | --------------------- | ------------------------------------------- |
| Bucket name | \`an-aws-s3-ecommerce\` | Must be globally unique across all AWS |
| Region | \`ap-south-1\` (Mumbai) | Closest to your users |
| Object Ownership | ACLs disabled | Simpler — use bucket policies instead |
| Block all public access | ✅ ON | Keep bucket private, CloudFront accesses it |
| Bucket versioning | Disabled | Not needed for this project |

> **Important:** Keep the bucket private. CloudFront will be the only way to serve images publicly. Direct S3 URLs will return 403.

### CORS Configuration on the Bucket

Since the browser uploads directly to S3 (cross-origin request from \`localhost:3000\` to \`s3.amazonaws.com\`), S3 needs a CORS policy. Go to **S3 → your bucket → Permissions → CORS**:

\`\`\`json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
\`\`\`

For production, replace \`http://localhost:3000\` with your actual domain.

---

## 5. Step 2 — Create an IAM User

IAM lets you create users with specific, limited permissions. Never use your root AWS account credentials in code.

### Create the User

Go to **AWS Console → IAM → Users → Create User**

- Name: \`aws-s3-ecommerce-user\`
- Access type: **Programmatic access only** (no AWS Console login needed)

### Create a Custom Policy

Instead of using a broad managed policy like \`AmazonS3FullAccess\`, create a minimal custom policy. Go to **IAM → Policies → Create Policy → JSON**:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowProductImageUpload",
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::an-aws-s3-ecommerce/products/*"
    }
  ]
}
\`\`\`

**Why only \`PutObject\`?**

- The backend only needs to generate presigned PUT URLs for uploads
- CloudFront reads from S3 directly using its own OAC — not the IAM user
- Least privilege principle: give only the permissions actually needed

### Generate Access Keys

Go to **IAM → Users → your user → Security credentials → Create access key**

- Select **"Application running outside AWS"**
- Download the CSV or copy the keys immediately — the secret key is shown only once

Store these in your \`.env\` file — never commit them to git.

---

## 6. Step 3 — Configure the S3 SDK in the Backend

\`\`\`bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
\`\`\`

### backend/config/s3.js

\`\`\`js
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export default s3Client;
\`\`\`

This creates a single S3 client instance that is reused across the app. The credentials come from environment variables — never hardcoded.

---

## 7. What is a Presigned URL?

A presigned URL is a **temporary, signed HTTP URL** that grants anyone who has it permission to perform a specific S3 operation — without needing AWS credentials themselves.

### Why it exists

S3 buckets are private. Normally only authenticated AWS users can read/write objects. But we want the browser to upload directly to S3 (to avoid routing large files through our server). The solution: the backend signs a URL using its credentials and hands it to the browser.

- **Without presigned URL:** Browser PUT → S3 → 403 FORBIDDEN (browser has no AWS credentials)
- **With presigned URL:** Backend signs URL → Browser uses signed URL → PUT → S3 → 200 OK (AWS keys never leave the backend)

### How it works in code

\`\`\`js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.js";

const command = new PutObjectCommand({
  Bucket: "an-aws-s3-ecommerce",
  Key: "products/shoe.png",
});

// URL is valid for 1 hour (3600 seconds)
const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
\`\`\`

The browser does a \`PUT\` to this URL with the image as the body. S3 verifies the signature and stores the file.

### Filename Sanitization

Before generating the presigned URL, we sanitize the filename to avoid URL issues:

\`\`\`js
// Replace spaces and + signs with underscores
const sanitizedName = fileName.trim().replace(/[\\s+]/g, "_");
const s3Key = \`products/\${sanitizedName}\`;
\`\`\`

This prevents issues like \`71Iit7U1S+L.jpg\` being misread as \`71Iit7U1S L.jpg\` in a URL (since \`+\` means space in URL encoding).

---

## 8. Upload Flow — How Creating a Product Works

### Step by step

1. User fills the form: name, price, brand, description, image file
2. Click "Create Product"
3. Frontend calls \`POST /api/upload/presigned-url\` with \`{ fileName: "shoe.png" }\`
4. Backend sanitizes filename, creates \`PutObjectCommand\`, signs URL (expires in 1 hour), returns \`{ url, finalName }\`
5. Browser PUTs image directly to S3 using the signed URL
6. Frontend calls \`POST /api/products\` with \`{ name, description, price, brand, filename: "products/shoe.png" }\`
7. Backend saves to MongoDB
8. \`router.push("/")\` + \`router.refresh()\` forces Next.js to refetch

### Frontend code

\`\`\`js
// Step 1: Get presigned URL
const presignRes = await fetch("http://localhost:3001/api/upload/presigned-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ fileName: form.image.name }),
});
const { url, finalName } = await presignRes.json();

// Step 2: Upload directly to S3
await fetch(url, {
  method: "PUT",
  headers: { "Content-Type": form.image.type },
  body: form.image,
});

// Step 3: Save product metadata to MongoDB
await fetch("http://localhost:3001/api/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: form.name,
    description: form.description,
    price: form.price,
    brand: form.brand,
    filename: finalName, // "products/shoe.png"
  }),
});
\`\`\`

---

## 9. What is Stored in MongoDB?

Only the **S3 key** is stored — not a full URL, not a presigned URL.

\`\`\`js
// MongoDB document
{
  _id: ObjectId("..."),
  name: "Nike Air Max",
  description: "Lightweight running shoe",
  price: 129.99,
  brand: "Nike",
  filename: "products/shoe.png",   // ← just the key
  createdAt: ISODate("2026-05-04"),
  updatedAt: ISODate("2026-05-04")
}
\`\`\`

**Why store just the key?**

- Presigned URLs expire after 1 hour — useless to store
- Full S3 URLs are tied to a specific region/bucket — hard to migrate
- The key \`products/shoe.png\` works with any CDN or storage backend
- When fetching, the backend builds the full CloudFront URL on the fly

\`\`\`js
// backend/controllers/product.controller.js
function toCloudFrontUrl(filename) {
  let key = filename;
  // Handle old records that stored full S3 URLs
  if (key.includes(".amazonaws.com/")) {
    key = key.split(".amazonaws.com/")[1];
  } else if (key.includes("cloudfront.net/")) {
    key = key.split("cloudfront.net/")[1];
  }
  return \`https://d2ocd53kzqw2fg.cloudfront.net/\${key}\`;
}
\`\`\`

---

## 10. Why CORS is Needed

**IAM permissions** and **CORS** solve completely different problems:

| | IAM Permission | CORS Policy |
| --- | --- | --- |
| Question | "WHO can access this resource?" | "Which websites can make browser requests here?" |
| Applies to | All requests (server, CLI, SDK) | Browser requests only (cross-origin fetch/XHR) |

### The problem

When the browser does \`fetch(presignedUrl, { method: "PUT" })\`, it is making a **cross-origin request** — from \`localhost:3000\` to \`s3.amazonaws.com\`. The browser automatically sends a preflight \`OPTIONS\` request first.

Without CORS configured, the browser blocks the request. With CORS configured on the S3 bucket, S3 responds to the preflight confirming PUT is allowed from your origin, and the upload proceeds.

### Could we avoid CORS?

Yes — by routing uploads through the backend (proxy upload). But that means every image passes through your server, consuming your bandwidth and memory. For large files this is slow and expensive. **Presigned URL + direct upload is the industry standard** — CORS is a one-time setup cost for that benefit.

---

## 11. What is CloudFront?

CloudFront is AWS's **CDN (Content Delivery Network)**. It caches your S3 content at 400+ edge locations worldwide so users get images from the nearest server.

### Without CloudFront

Every user hits the same S3 bucket in \`ap-south-1\` regardless of location. Users in New York or London get slow responses.

### With CloudFront

Each user hits the nearest CloudFront edge. Only on the first request (cache miss) does CloudFront fetch from S3. After that, it's served from cache.

### CloudFront vs S3 Direct

| | S3 Direct | CloudFront + S3 |
| --------------------- | --------------------------- | --------------------------------------------- |
| Speed | Slow for distant users | Fast everywhere |
| Cost per request | Higher | Lower after caching |
| URL | \`s3.amazonaws.com/...\` | \`d2ocd53kzqw2fg.cloudfront.net/...\` |
| Custom domain + HTTPS | Complex | Built in |
| Security | Bucket policy needed | S3 stays private, only CloudFront accesses it |
| Presigned URLs | Required for private bucket | Not needed for reads |

### How it changed our code

**Before CloudFront** — backend generated a presigned GET URL for every product on every request (expensive, URLs expire after 1 hour):

\`\`\`js
const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
\`\`\`

**After CloudFront** — backend just builds a plain URL (no AWS SDK call needed for reads):

\`\`\`js
const url = \`https://d2ocd53kzqw2fg.cloudfront.net/\${key}\`;
\`\`\`

No expiry. No \`GetObjectCommand\`. Just a string.

---

## 12. Step 4 — Set Up CloudFront

Go to **AWS Console → CloudFront → Create Distribution**

| Setting | Value |
| ---------------------- | ------------------------------------------------------ |
| Origin domain | \`an-aws-s3-ecommerce.s3.ap-south-1.amazonaws.com\` |
| Origin access | **Origin access control settings (OAC)** — recommended |
| Create OAC | Yes — create a new one |
| Viewer protocol policy | Redirect HTTP to HTTPS |
| Cache policy | CachingOptimized |

### Update the S3 Bucket Policy

After creating the distribution, CloudFront shows you a bucket policy to copy. Go to **S3 → your bucket → Permissions → Bucket Policy** and paste it:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::an-aws-s3-ecommerce/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<YOUR_ACCOUNT_ID>:distribution/<YOUR_DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
\`\`\`

This means S3 stays **completely private** — only CloudFront can read from it. Direct S3 URLs return 403.

### Add CloudFront Domain to Next.js

\`\`\`js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2ocd53kzqw2fg.cloudfront.net",
      },
    ],
  },
};
\`\`\`

---

## 13. Fetch Flow — How the Home Page Works

1. Page loads (Next.js server component)
2. \`GET /api/products\` is called
3. Backend runs \`ProductModel.find()\` sorted by \`createdAt\` desc
4. For each product, builds CloudFront URL: \`"products/shoe.png"\` → \`"https://d2ocd53kzqw2fg.cloudfront.net/products/shoe.png"\`
5. Returns \`{ products: [...] }\` with full URLs
6. Next.js renders product cards with \`<Image src="https://d2ocd53kzqw2fg.cloudfront.net/...">\`
7. CloudFront edge serves cached image

### Backend fetch code

\`\`\`js
// backend/controllers/product.controller.js
export async function getProducts(_req, res, next) {
  try {
    const products = await ProductModel.find().sort({ createdAt: -1 });
    const productsWithUrls = products.map((p) => {
      const obj = p.toObject();
      if (obj.filename) {
        obj.filename = toCloudFrontUrl(obj.filename);
      }
      return obj;
    });
    res.json({ products: productsWithUrls });
  } catch (err) {
    next(err);
  }
}
\`\`\`

### Frontend render code

\`\`\`jsx
// aws-s3-ecommerce/src/app/page.js
<div className="relative h-44 bg-gray-100">
  <Image
    src={product.filename}
    alt={product.name}
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    className="object-contain"
  />
</div>
\`\`\`

---

## 14. Environment Variables Reference

### backend/.env

| Variable | Where used | What it does |
| ----------------------- | ----------------------- | ------------------------------------------- |
| \`AWS_ACCESS_KEY\` | \`config/s3.js\` | IAM user access key to authenticate with S3 |
| \`AWS_SECRET_ACCESS_KEY\` | \`config/s3.js\` | IAM user secret key |
| \`BUCKET\` | \`product.controller.js\` | S3 bucket name for presigned URL generation |
| \`MONGODB_URI\` | \`config/db.js\` | MongoDB Atlas connection string |
| \`PORT\` | \`server.js\` | Port the Express server listens on |

> **Never commit \`.env\` to git.** Both \`.env\` and \`.env.local\` are in their respective \`.gitignore\` files.
    `,
  },
  {
    id: "understanding-useeffect",
    title: "Understanding useEffect — The Right Way",
    date: "April 20, 2026",
    readTime: "6 min read",
    tags: ["React", "Hooks", "JavaScript"],
    summary:
      "useEffect confused me for a long time. Here's how I finally wrapped my head around the dependency array, cleanup functions, and when not to use it at all.",
    content: `
## Why useEffect Tripped Me Up

When I first started with React hooks, \`useEffect\` was the one that kept biting me. Infinite loops, stale closures, missing dependencies — I hit all of them.

The mental model that finally clicked for me: **useEffect is not a lifecycle method**. It's a way to synchronize your component with something outside React.

## The Dependency Array

\`\`\`js
useEffect(() => {
  fetchUser(userId);
}, [userId]); // re-runs whenever userId changes
\`\`\`

Think of the dependency array as a list of "things this effect cares about." If any of them change, the effect re-runs. If the array is empty \`[]\`, the effect runs once after the first render. If you omit it entirely, it runs after every render — which is almost never what you want.

## Cleanup Functions

\`\`\`js
useEffect(() => {
  const subscription = subscribe(topic);

  return () => {
    subscription.unsubscribe(); // cleanup before next run or unmount
  };
}, [topic]);
\`\`\`

The function you return from useEffect is the cleanup. React calls it before running the effect again and when the component unmounts. This is how you avoid memory leaks with subscriptions, timers, or event listeners.

## When NOT to Use useEffect

This was the biggest shift for me. A lot of things I was putting in useEffect don't belong there:

- **Derived state** — if you can compute something from props or state, just compute it during render. No effect needed.
- **Handling user events** — put that logic in the event handler, not an effect.
- **Fetching on mount** — still valid, but consider React Query or SWR for anything serious.

## What I Do Now

I ask myself: "Am I synchronizing with something external?" If yes, useEffect is probably right. If I'm just transforming data or responding to a click, I keep it out of effects entirely.

It took a few real projects to internalize this, but once it clicked, my components got a lot cleaner.
    `,
  },
  {
    id: "css-grid-vs-flexbox",
    title: "CSS Grid vs Flexbox — When to Use Which",
    date: "March 15, 2026",
    readTime: "5 min read",
    tags: ["CSS", "Layout", "Frontend"],
    summary:
      "I used to reach for Flexbox for everything. Then I learned Grid and realized they solve different problems. Here's the mental model I use to pick between them.",
    content: `
## The Short Answer

- **Flexbox** → one dimension (a row or a column)
- **Grid** → two dimensions (rows AND columns)

That's the core of it. But let me show you what that means in practice.

## Flexbox Is Great For...

Navigation bars, button groups, centering a single item, distributing items along one axis.

\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

Flexbox lets the content drive the layout. Items shrink and grow based on available space. That flexibility is exactly what you want for components.

## Grid Is Great For...

Page layouts, card grids, anything where you need items to align in both rows and columns simultaneously.

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
\`\`\`

Grid lets the layout drive the content. You define the structure first, then place items into it.

## The Overlap

Both can technically do what the other does. But fighting the tool is never fun. I've learned to ask: "Am I thinking about a line of items, or a two-dimensional structure?" That question almost always gives me the answer.

## My Current Approach

I use Grid for the outer page structure and Flexbox for the inner components. They work great together — Grid for the skeleton, Flexbox for the muscles.
    `,
  },
  {
    id: "javascript-closures",
    title: "JavaScript Closures — Finally Made Sense",
    date: "February 8, 2026",
    readTime: "7 min read",
    tags: ["JavaScript", "Fundamentals"],
    summary:
      "Closures are one of those concepts that every JS interview asks about but nobody explains well. Here's the explanation I wish I had when I was starting out.",
    content: `
## What Is a Closure?

A closure is a function that remembers the variables from the scope where it was created, even after that scope has finished executing.

That sounds abstract. Here's a concrete example:

\`\`\`js
function makeCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
\`\`\`

\`makeCounter\` has finished running, but the inner function still has access to \`count\`. That's a closure.

## Why Does This Matter?

Closures are everywhere in JavaScript:

- **Event handlers** that reference variables from the outer function
- **setTimeout** callbacks that capture loop variables (the classic bug)
- **Module patterns** for private state
- **React hooks** — \`useState\` and \`useEffect\` both rely heavily on closures

## The Classic Bug

\`\`\`js
// Broken
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // prints 3, 3, 3
}

// Fixed with let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // prints 0, 1, 2
}
\`\`\`

\`var\` is function-scoped, so all three callbacks close over the same \`i\`. \`let\` is block-scoped, so each iteration gets its own \`i\`.

## How I Think About It Now

Every function in JavaScript carries a backpack. That backpack contains all the variables from the scope where the function was defined. Wherever the function goes, the backpack comes with it. That backpack is the closure.

Once I had that image in my head, closures stopped being scary.
    `,
  },
  {
    id: "async-await-deep-dive",
    title: "async/await — Beyond the Basics",
    date: "January 22, 2026",
    readTime: "8 min read",
    tags: ["JavaScript", "Async", "Promises"],
    summary:
      "async/await makes async code look synchronous, but there are patterns and pitfalls that took me a while to learn. Error handling, parallel execution, and the mistakes I made.",
    content: `
## The Basics (Quick Recap)

\`\`\`js
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const user = await response.json();
  return user;
}
\`\`\`

\`await\` pauses execution inside the async function until the promise resolves. The function always returns a promise.

## Error Handling

The most common mistake I see (and made myself) is forgetting to handle errors:

\`\`\`js
// Fragile
async function loadData() {
  const data = await fetchSomething(); // throws? crashes silently
  return data;
}

// Better
async function loadData() {
  try {
    const data = await fetchSomething();
    return data;
  } catch (error) {
    console.error("Failed to load:", error);
    return null;
  }
}
\`\`\`

## The Sequential vs Parallel Trap

This is the big one. This code is slow:

\`\`\`js
// Sequential — waits for each one before starting the next
const user = await fetchUser(id);
const posts = await fetchPosts(id);
const comments = await fetchComments(id);
\`\`\`

These requests don't depend on each other, so there's no reason to run them one at a time. Use \`Promise.all\`:

\`\`\`js
// Parallel — all three start at the same time
const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id),
]);
\`\`\`

This can make a huge difference in perceived performance.

## Promise.allSettled

When you want all results even if some fail:

\`\`\`js
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);

results.forEach((result) => {
  if (result.status === "fulfilled") {
    console.log(result.value);
  } else {
    console.error(result.reason);
  }
});
\`\`\`

## What I Learned the Hard Way

async/await is syntactic sugar over promises. Understanding promises first makes async/await much easier to reason about, especially when things go wrong. I spent a week going back to basics with \`.then()\` and \`.catch()\` and it paid off.
    `,
  },
  {
    id: "react-performance-tips",
    title: "React Performance — What Actually Moves the Needle",
    date: "December 10, 2025",
    readTime: "9 min read",
    tags: ["React", "Performance", "Optimization"],
    summary:
      "I've tried a lot of React performance tricks. Most of them didn't matter. Here are the ones that actually made a difference in real apps.",
    content: `
## Start With Measurement

Before optimizing anything, profile it. React DevTools Profiler shows you exactly which components are re-rendering and why. I've wasted hours optimizing things that weren't the bottleneck.

## The Wins That Actually Mattered

### 1. Lazy Loading Routes

\`\`\`js
const Dashboard = React.lazy(() => import('./Dashboard'));
const Settings = React.lazy(() => import('./Settings'));
\`\`\`

This splits your bundle so users only download the code they need. For a large app, this was the single biggest improvement I made.

### 2. Virtualization for Long Lists

Rendering 1000 list items is slow. Libraries like \`react-window\` or \`react-virtual\` only render what's visible in the viewport.

\`\`\`js
import { FixedSizeList } from 'react-window';

<FixedSizeList height={600} itemCount={1000} itemSize={50}>
  {({ index, style }) => <Row index={index} style={style} />}
</FixedSizeList>
\`\`\`

### 3. Avoiding Unnecessary Re-renders

\`React.memo\` prevents a component from re-rendering if its props haven't changed:

\`\`\`js
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive render */}</div>;
});
\`\`\`

But don't sprinkle this everywhere. The comparison itself has a cost. Use it when you've confirmed a component is re-rendering unnecessarily.

### 4. useMemo and useCallback

\`\`\`js
// Memoize expensive calculations
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Stable function reference for child components
const handleClick = useCallback((id) => {
  setSelected(id);
}, []);
\`\`\`

Again — measure first. These add complexity and aren't free.

## What Didn't Help Much

- Wrapping everything in \`useMemo\`/\`useCallback\` without profiling first
- Micro-optimizations in render functions
- Premature code splitting of small components

## The Real Lesson

Most React performance problems come from architecture, not micro-optimizations. Keeping state close to where it's used, avoiding prop drilling, and structuring components well will take you further than any hook.
    `,
  },
];
