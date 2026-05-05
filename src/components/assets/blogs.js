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
    id: "react-optimization-patterns",
    title: "React Optimization Patterns - Complete Blog Notes",
    date: "May 5, 2026",
    readTime: "35 min read",
    tags: ["React", "JavaScript", "Performance"],
    summary:
      "A practical guide to the React performance patterns that matter in real apps: re-renders, memoization, stable callbacks, derived state, debouncing, throttling, lazy loading, skeleton UIs, virtualization, isolation, and React Compiler.",
    content: `
This guide is a practical React optimization playground. It covers the most common performance patterns used in real React applications: understanding re-renders, memoizing components and values, stabilizing function references, avoiding derived state bugs, reducing expensive event calls, splitting bundles, showing skeleton UIs, isolating state, using virtualization for large lists, and understanding where React Compiler fits.

The main idea is simple: do less unnecessary work. React is already fast, so optimization should be applied where it solves a real problem: expensive rendering, large lists, repeated calculations, too many network calls, large bundles, or state changes affecting too many components.

---

## 1. First Understand Re-Rendering

### What is a re-render?

A re-render happens when React runs a component function again to calculate what the UI should look like now.

React components re-render when:

- Their own state changes.
- Their props change.
- Their parent re-renders.
- A consumed context value changes.
- A forced update happens.

One simple way to observe render behavior while learning is to count renders with a ref:

\`\`\`jsx
function ChildRenderTracker() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return <div>Child rendered {renderCount.current} times</div>;
}
\`\`\`

### Why do we need to understand this?

Before optimizing, we need to know what React is doing. Many performance issues come from child components re-rendering even though their visible output did not change.

Example:

\`\`\`jsx
function RenderTracker() {
  const [value, setValue] = useState("");

  return (
    <>
      <div>Parent RenderTracker</div>
      <ChildRenderTracker />
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </>
  );
}
\`\`\`

When the input changes, \`RenderTracker\` re-renders. Because \`ChildRenderTracker\` is inside the parent, it also re-renders by default, even though it does not receive the input value.

### When is re-rendering a problem?

Re-rendering is normal. It becomes a problem when:

- The component is expensive to render.
- The parent changes frequently.
- A large list re-renders too often.
- The child does not depend on the changed state.
- The render causes expensive calculations.

### Important note about StrictMode

If your app uses \`StrictMode\`, you may notice extra renders in development:

\`\`\`jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
\`\`\`

In development, React StrictMode intentionally runs some render logic twice. This helps detect side effects and unsafe code. It does not mean production will always render twice.

---

## 2. React.memo: Prevent Child Re-Renders When Props Are Same

### What is React.memo?

\`React.memo\` is a higher-order component that memoizes a functional component. It tells React: if the props are the same as last time, reuse the previous rendered result and skip rendering this component again.

Example:

\`\`\`jsx
import { memo } from "react";

const MemoizedProfileCard = memo(function ProfileCard({ name }) {
  console.log("Rendered <ProfileCard/>");
  return <div>ProfileCard {name}</div>;
});
\`\`\`

### Why do we need React.memo?

In \`MemoizedProfile\`, typing in the input changes parent state:

\`\`\`jsx
function MemoizedProfile() {
  const [value, setValue] = useState("");

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <MemoizedProfileCard name="Tapas" />
    </div>
  );
}
\`\`\`

The child receives \`name="Tapas"\`, which never changes. Without memoization, it can still render when the parent renders. With \`React.memo\`, React skips the child render because the prop is unchanged.

### When should we use React.memo?

Use it when:

- A child component renders often with the same props.
- A parent state changes frequently.
- The child is expensive to render.
- The child receives stable primitive props.

Avoid it when:

- The component is tiny and cheap.
- Props change almost every render.
- It makes the code harder without visible benefit.

### Key rule

\`React.memo\` uses shallow comparison. For primitives, this works well:

\`\`\`jsx
<ProfileCard name="Tapas" />
\`\`\`

For objects, arrays, and functions, references matter:

\`\`\`jsx
<ProfileCard user={{ name: "Tapas" }} />
\`\`\`

The object above is recreated on every render, so memoization can break unless the object is stabilized with \`useMemo\`.

---

## 3. useCallback: Keep Function References Stable

### What is useCallback?

\`useCallback\` memoizes a function reference. It returns the same function between renders until its dependency array changes.

Example:

\`\`\`jsx
const handleClick = useCallback(() => {
  console.log("CHILD CLICKED");
}, []);
\`\`\`

### Why do we need useCallback?

Functions are reference values. A new inline function is created on every render:

\`\`\`jsx
<Child onClick={() => console.log("clicked")} />
\`\`\`

Even if the function body looks the same, the reference is different. If \`Child\` is wrapped with \`memo\`, this new reference makes React think props changed, so the child re-renders.

We can fix that by stabilizing the callback:

\`\`\`jsx
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log("CHILD CLICKED");
  }, []);

  return (
    <div>
      <button onClick={() => setCount((prev) => prev + 1)}>INCREMENT</button>
      <Child onClick={handleClick} />
    </div>
  );
}
\`\`\`

And the child is memoized:

\`\`\`jsx
const Child = memo(function Child({ onClick }) {
  console.log("Child Rendered");
  return <button onClick={onClick}>CLICK ME</button>;
});
\`\`\`

Now when \`count\` changes, the parent re-renders, but \`handleClick\` keeps the same reference. Because the child props are stable, \`memo\` can skip the child render.

### When should we use useCallback?

Use it when:

- Passing callbacks to memoized children.
- A function is used in a dependency array.
- A custom hook needs stable callbacks.
- A function prop causes unnecessary child renders.

Avoid it when:

- The function is only used inside the same component.
- The component is simple and has no performance issue.
- Dependencies become complicated and risk stale closures.

### Important dependency rule

If a callback uses state or props, include them in the dependency array.

\`\`\`jsx
const handleSave = useCallback(() => {
  saveUser(user);
}, [user]);
\`\`\`

Missing dependencies can create stale closure bugs, where the function uses old values.

---

## 4. useMemo: Cache Expensive Computed Values

### What is useMemo?

\`useMemo\` memoizes the result of a calculation. React returns the cached value until one of the dependencies changes.

Example:

\`\`\`jsx
const sorted = useMemo(() => {
  console.log("Sorting users...");
  return [...list].sort((a, b) => a.localeCompare(b));
}, [list]);
\`\`\`

### Why do we need useMemo?

Sorting, filtering, grouping, and heavy calculations can become expensive. Without \`useMemo\`, this sort would run every time the component renders, even when the list did not change.

Imagine the parent also has an unrelated counter:

\`\`\`jsx
const [count, setCount] = useState(0);
const [users, setUsers] = useState([]);
\`\`\`

Clicking \`Increment\` changes \`count\`, which re-renders the parent and child. But the user list did not change. With \`useMemo\`, sorting does not run again unless \`list\` changes.

### When should we use useMemo?

Use it when:

- Sorting a large list.
- Filtering many items.
- Doing expensive calculations.
- Creating stable object or array props for memoized children.

Avoid it when:

- The calculation is cheap.
- The data is small.
- It adds complexity without measurable benefit.

### Important safety detail

Do not mutate props while sorting:

\`\`\`jsx
// Avoid this because it mutates list
const sorted = list.sort((a, b) => a.localeCompare(b));

// Better
const sorted = [...list].sort((a, b) => a.localeCompare(b));
\`\`\`

The safe version copies the list before sorting.

---

## 5. Derived State: Do Not Store What You Can Calculate

### What is derived state?

Derived state is any value that can be calculated from existing state or props.

Examples:

- Cart total from cart items.
- Filtered items from \`items\` and \`query\`.
- Validation status from form values.
- Sorted list from original list.

### Why should we avoid storing derived state?

If a value can be calculated from existing state, storing it separately creates two sources of truth.

Bad pattern:

\`\`\`jsx
const [total, setTotal] = useState(0);

useEffect(() => {
  const sum = items.reduce((acc, item) => acc + item.price, 0);
  setTotal(sum);
}, [items]);
\`\`\`

This causes:

- Extra render after the effect updates state.
- Sync bugs if state is not updated correctly.
- More code than needed.
- Stale UI risk.

Better pattern:

\`\`\`jsx
const total = useMemo(() => {
  return items.reduce((acc, item) => acc + item.price, 0);
}, [items]);
\`\`\`

### When should we calculate directly?

If the calculation is cheap, calculate it directly:

\`\`\`jsx
const total = items.reduce((acc, item) => acc + item.price, 0);
\`\`\`

If the calculation is expensive or the list is large, use \`useMemo\`.

### Search example

The search component stores the source data and query:

\`\`\`jsx
const [items, setItems] = useState([
  "Wireless Headphones",
  "Mechanical Keyboard",
  "Smartwatch",
  "Electric Kettle",
  "Gaming Mouse",
]);

const [query, setQuery] = useState("");
\`\`\`

The filtered result is derived:

\`\`\`jsx
const filteredItems = useMemo(() => {
  return items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );
}, [query, items]);
\`\`\`

This is cleaner than storing both \`items\` and \`filteredItems\` in state.

### When do we need derived state optimization?

Use this pattern whenever a value can be calculated from existing data. It keeps React code declarative and avoids manual synchronization.

---

## 6. State and Component Isolation

### What is isolation?

Isolation means placing state as close as possible to the component that needs it, and separating unrelated UI or context values so updates do not spread everywhere.

### Why do we need isolation?

If a parent owns too much state, every state change can re-render many children. If unrelated values are placed in one context, every context consumer can re-render when only one value changes.

Bad context shape:

\`\`\`jsx
<UserContext.Provider value={{ user, theme }}>
  <App />
</UserContext.Provider>
\`\`\`

Problem: \`user\` and \`theme\` change for different reasons. If theme changes, components that only need user may still re-render.

Better:

\`\`\`jsx
<UserProvider value={user}>
  <ThemeProvider value={theme}>
    <App />
  </ThemeProvider>
</UserProvider>
\`\`\`

Now user updates and theme updates are isolated.

### Component memoization in Dashboard

A dashboard can memoize independent pieces:

\`\`\`jsx
const MUserCard = memo(UserCard);
const MRevenue = memo(Revenu);

function Dashboard({ user, stats }) {
  return (
    <div>
      <MUserCard user={user} />
      <MRevenue stats={stats} />
      <Visitors />
    </div>
  );
}
\`\`\`

### When should we isolate?

Use isolation when:

- One state change causes many unrelated children to render.
- Context contains unrelated values.
- Dashboard-like screens have independent sections.
- A small input state causes a large page to re-render.

Good optimization often means moving state down, not adding more hooks.

---

## 7. Debouncing: Wait Until the User Stops

### What is debouncing?

Debouncing delays an action until a user stops triggering events for a certain time.

Example hook:

\`\`\`jsx
export function useDebounce(value, delay = 1000) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
\`\`\`

### Why do we need debouncing?

Without debouncing, typing \`react\` into a search input can trigger 5 API calls:

\`\`\`txt
r
re
rea
reac
react
\`\`\`

With debouncing, the app waits until the user pauses, then calls the API once with the final value.

Example usage:

\`\`\`jsx
const [state, setState] = useState("");
const debouncedQuery = useDebounce(state, 1000);

useEffect(() => {
  if (debouncedQuery) {
    console.log(\`Calling API with: \${debouncedQuery}\`);
  }
}, [debouncedQuery]);
\`\`\`

### When should we use debouncing?

Use it for:

- Search inputs.
- Autocomplete.
- Username availability checks.
- Form validation after typing stops.
- Auto-save after the user pauses.
- Window resize handling when only the final result matters.

### Debounce vs delay

Debouncing is not just delaying. It resets the timer every time the value changes. The action only runs after changes stop for the chosen delay.

---

## 8. Throttling: Limit Work to Once Per Interval

### What is throttling?

Throttling limits how often an action can run. It allows execution at most once per time interval.

Example usage:

\`\`\`jsx
const [scroll, setScroll] = useState(0);
const throttle = useThrottle(scroll, 3000);

useEffect(() => {
  const handleScroll = () => {
    setScroll(window.scrollY);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
\`\`\`

### Why do we need throttling?

Scroll, resize, mousemove, and touchmove events can fire many times per second. If every event updates state or runs expensive logic, the UI can become slow.

Throttling keeps updates controlled:

\`\`\`txt
User scrolls continuously
React updates scroll position at most once per delay
UI stays smoother
\`\`\`

### When should we use throttling?

Use it for:

- Scroll tracking.
- Infinite scroll checks.
- Resize measurements.
- Mouse move tracking.
- Drag interactions.
- Analytics events.

### Debouncing vs throttling

Use debouncing when you want to wait until the user stops.

Use throttling when you want regular controlled updates while the user continues.

Examples:

\`\`\`txt
Search input: debounce
Scroll position: throttle
Resize final layout calculation: debounce
Live resize preview: throttle
\`\`\`

---

## 9. Code Splitting and Lazy Loading

### What is code splitting?

Code splitting breaks the JavaScript bundle into smaller chunks so the browser does not download all code at once.

### What is lazy loading?

Lazy loading means loading code only when it is needed.

Example:

\`\`\`jsx
const Heavy = React.lazy(() => import("./Heavy"));
\`\`\`

The heavy component is wrapped in \`Suspense\`:

\`\`\`jsx
<Suspense fallback={<div>Loading Heavy Component...</div>}>
  {show && <Heavy />}
</Suspense>
\`\`\`

### Why do we need code splitting?

Without code splitting, the heavy component becomes part of the initial bundle. The user downloads it even if they never click \`SHOW HEAVY\`.

With code splitting:

- Initial JavaScript is smaller.
- First load is faster.
- Heavy code loads only when needed.
- Time to interactive improves.

### When should we use lazy loading?

Use it for:

- Large components not visible immediately.
- Routes or pages.
- Modals.
- Admin panels.
- Charts and editors.
- Heavy third-party libraries.

### What is Suspense?

\`Suspense\` shows fallback UI while a lazy-loaded component is being downloaded.

\`\`\`jsx
<Suspense fallback={<ProductSkeleton />}>
  <ProductCard product={product} />
</Suspense>
\`\`\`

Without a fallback, users may see nothing while the chunk loads.

---

## 10. Skeleton Loading UI

### What is a skeleton?

A skeleton is a placeholder UI that looks like the final layout while data is loading.

Example:

\`\`\`jsx
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-300 w-full"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
}
\`\`\`

### Why do we need skeletons?

Skeletons improve perceived performance. The app may still be loading data, but the user sees structure immediately.

The product list uses skeleton cards while fetching:

\`\`\`jsx
{loading
  ? Array.from({ length: 8 }).map((_, index) => (
      <ProductSkeleton key={index} />
    ))
  : products.map((product) => (
      <ProductCard product={product} key={product.id} />
    ))}
\`\`\`

### When should we use skeletons?

Use them when:

- Data takes noticeable time to load.
- You know the final layout shape.
- A spinner would feel too empty.
- You want to reduce perceived waiting.

Skeletons are especially useful for product cards, dashboards, feeds, and profile pages.

---

## 11. List Virtualization

### What is virtualization?

List virtualization, also called windowing, renders only the visible items in a large list instead of rendering the whole list.

### Why do we need virtualization?

Rendering 300 items may be acceptable. Rendering 10,000 items can slow down the browser, use too much memory, and make scrolling janky.

The non-virtual list renders every quote:

\`\`\`jsx
{quotes.map((quote, index) => (
  <div key={quote.id} className="quote-item">
    <div className="quote-number">#{index + 1}</div>
    <div className="quote-content">
      <div className="quote-author">{quote.author}</div>
      <div className="quote-text">"{quote.quote}"</div>
    </div>
  </div>
))}
\`\`\`

The virtual list renders only the items visible in the scroll window.

### How does the virtual list work?

It tracks scroll position:

\`\`\`jsx
const [scrollTop, setScrollTop] = useState(0);
\`\`\`

It calculates the full virtual height:

\`\`\`jsx
const totalHeight = quotes.length * itemHeight;
\`\`\`

It calculates which items are visible:

\`\`\`jsx
const startIndex = Math.floor(scrollTop / itemHeight);

const endIndex = Math.min(
  quotes.length - 1,
  Math.ceil((scrollTop + height) / itemHeight),
);
\`\`\`

It renders a small range with overscan:

\`\`\`jsx
const overscanCount = 1;
const overscanStartIndex = Math.max(0, startIndex - overscanCount);
const overscanEndIndex = Math.min(quotes.length - 1, endIndex + overscanCount);

const visibleQuotes = quotes.slice(overscanStartIndex, overscanEndIndex + 1);
\`\`\`

Then each rendered item is absolutely positioned in the large virtual space:

\`\`\`jsx
style={{
  position: "absolute",
  top: \`\${actualIndex * itemHeight}px\`,
  width: "100%",
}}
\`\`\`

### What is overscan?

Overscan means rendering a few extra items above and below the visible area. It prevents blank gaps when the user scrolls quickly.

### When should we use virtualization?

Use it for:

- Large lists.
- Long tables.
- Chat histories.
- Search results.
- Logs.
- Feeds.

Avoid it when:

- The list is small.
- SEO needs every item in the HTML.
- Screen reader access to the full list is critical.
- Items have highly dynamic heights and you do not want extra complexity.

For production, libraries like \`react-window\`, \`react-virtualized\`, or modern virtualizer libraries are often better than writing this manually.

---

## 12. React Compiler

### What is React Compiler?

React Compiler is a build-time optimization tool that can automatically memoize values and component output in many cases.

In a Vite app, the compiler plugin can be configured like this:

\`\`\`jsx
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],
});
\`\`\`

### Why do we need React Compiler?

Before compiler-based optimization, developers often manually added:

\`\`\`jsx
const total = useMemo(() => amount * 2, [amount]);
const handleClick = useCallback(() => save(id), [id]);
\`\`\`

React Compiler can reduce the need for some manual \`useMemo\`, \`useCallback\`, and \`memo\` usage by optimizing safe patterns automatically.

### When should we still use manual optimization?

Even with the compiler, you still need to understand optimization because:

- Not every pattern can be optimized automatically.
- You still need good state structure.
- You still need virtualization for large lists.
- You still need debouncing and throttling for event frequency.
- You still need code splitting for bundle size.
- You still need to measure performance.

React Compiler helps, but it does not replace good architecture.

---

## 13. How These Patterns Work Together

React optimization is not one hook. It is a set of decisions:

\`\`\`txt
Problem: child re-renders with same props
Solution: React.memo

Problem: function prop changes every render
Solution: useCallback

Problem: expensive value recalculates every render
Solution: useMemo

Problem: duplicated computed state
Solution: derive it from source state or props

Problem: search calls API on every keypress
Solution: debouncing

Problem: scroll handler runs too often
Solution: throttling

Problem: initial JavaScript bundle is too large
Solution: code splitting and lazy loading

Problem: loading screen feels empty
Solution: skeleton UI

Problem: thousands of DOM nodes
Solution: list virtualization

Problem: unrelated state updates re-render large UI sections
Solution: state isolation and split contexts
\`\`\`

---

## 14. Final Optimization Checklist

Before optimizing, ask:

- Is there an actual performance problem?
- Which component is rendering too often?
- Is the expensive work rendering, calculating, fetching, or loading JavaScript?
- Can state be moved closer to where it is used?
- Can derived state be calculated instead of stored?
- Are object, array, or function props breaking memoization?
- Is a list too large for normal rendering?
- Is the bundle loading code that the user does not need yet?
- Would debouncing or throttling reduce event pressure?

---

## 15. Important Rule: Measure Before and After

Use these tools:

- React DevTools Profiler to find unnecessary renders.
- Browser Performance tab to inspect long tasks and scroll jank.
- Network tab to confirm lazy-loaded chunks.
- Lighthouse to inspect loading and interaction metrics.
- Console logs only for learning, not final performance proof.

Optimization should make the app simpler or faster. If an optimization adds complexity but gives no real benefit, it is not a win.

---

## Conclusion

These optimization techniques teach one bigger lesson: React performance is mostly about controlling work.

Use \`React.memo\` to avoid unnecessary child renders. Use \`useCallback\` to keep function props stable. Use \`useMemo\` to cache expensive computed values. Avoid derived state duplication. Use debounce and throttle to control repeated events. Use code splitting to load less JavaScript at startup. Use skeletons to improve perceived loading. Use virtualization when the DOM becomes too large. Use state and context isolation so one update does not disturb the whole UI.

The best React optimization is not adding every hook everywhere. The best optimization is knowing what work is happening, deciding whether that work matters, and then choosing the smallest pattern that removes the waste.
    `,
  },
];
