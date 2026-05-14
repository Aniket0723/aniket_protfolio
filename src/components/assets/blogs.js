export const blogPosts = [
  {
    id: "aws-s3-ecommerce",
    title: "AWS S3 Ecommerce",
    date: "May 4, 2026",
    readTime: "20 min read",
    tags: ["AWS", "S3", "CloudFront", "Node.js", "Next.js"],
    summary:
      "A full reference for everything used in building an ecommerce app with S3 image uploads: S3, IAM, CloudFront, presigned URLs, CORS, and how they all connect.",
    content: `
# AWS S3 Ecommerce - Complete Notes

A full reference for everything used in this project: S3, IAM, CloudFront, presigned URLs, CORS, and how they all connect.

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

### Main reason we use S3 in this project

The backend should store product data, not heavy binary files.

- **MongoDB** stores product metadata: name, price, brand, description, and image key.
- **S3** stores the actual image file.
- **Express/Node.js** creates the presigned URL and saves metadata, but it does not carry the image bytes.
- **CloudFront** serves images quickly to users when products are displayed.

This keeps the backend light. Large file uploads and downloads do not consume Node.js server bandwidth, CPU, or memory.

### Why not store images or videos in MongoDB?

MongoDB can store binary files, but it is usually not the best place for product images, videos, PDFs, or other heavy files.

MongoDB is best for **structured data**:

\`\`\`js
{
  name: "Nike Air Max",
  price: 129.99,
  brand: "Nike",
  description: "Lightweight running shoe",
  imageKey: "products/shoe.png"
}
\`\`\`

S3 is best for the **actual file**:

\`\`\`text
products/shoe.png
products/watch.webp
videos/product-demo.mp4
\`\`\`

Reasons we avoid storing files directly in MongoDB:

- **Database becomes heavy:** images and videos increase database size very quickly.
- **Slower backups and restores:** large binary files make database maintenance slower.
- **More load on MongoDB:** every image view would require reading file data from the database.
- **More load on backend:** the backend would need to receive the file from MongoDB and send it to the browser.
- **Document size limit:** one MongoDB document can only be up to 16MB. Bigger files require GridFS, which adds extra complexity.
- **No CDN benefit by default:** files in MongoDB are not automatically served from nearby global edge locations like CloudFront.
- **Higher cost and poorer scaling:** databases are expensive resources; object storage is cheaper and built for large files.

If images are stored in MongoDB, the read flow becomes:

\`\`\`text
Browser -> Backend -> MongoDB -> Backend -> Browser
\`\`\`

With S3 and CloudFront, the read flow becomes:

\`\`\`text
Browser -> CloudFront -> S3 only on cache miss
\`\`\`

So the best practice is:

\`\`\`text
MongoDB = product data and image key
S3 = actual image/video file
CloudFront = fast public delivery of that file
\`\`\`

### Direct upload idea

The browser first asks the backend for permission, then uploads directly to S3:

\`\`\`text
Browser -> Backend: "Give me a signed upload URL for shoe.png"
Backend -> S3 SDK: Create presigned PUT URL
Backend -> Browser: Return signed URL
Browser -> S3: PUT image directly
Browser -> Backend: POST product metadata
Backend -> MongoDB: Save name, price, brand, description, filename
\`\`\`

The backend is still in control of security, but S3 handles the heavy file transfer.

---

## 3. AWS Services Used in This Project

### S3 (Simple Storage Service)

Stores product images in the \`products/\` folder inside the ecommerce S3 bucket.

### IAM (Identity and Access Management)

Controls **who** can access AWS resources and **what** they can do. We create a dedicated IAM user with a custom policy that only allows \`PutObject\` on the product image path in the selected bucket.

### CloudFront (CDN — Content Delivery Network)

Sits in front of S3 and serves images from 400+ edge locations worldwide. Users get images from a nearby CloudFront edge instead of always requesting directly from the S3 region.

### AWS SDK for JavaScript (\`@aws-sdk/client-s3\`)

The official npm package used in a Node.js backend to interact with S3, such as creating presigned URLs for uploads.

### AWS S3 Request Presigner (\`@aws-sdk/s3-request-presigner\`)

Used to generate time-limited signed URLs. These URLs allow the browser to upload directly to S3 without exposing AWS credentials.

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

Since the browser uploads directly to S3 from a different origin, S3 needs a CORS policy. Go to **S3 → your bucket → Permissions → CORS**:

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

For production, replace \`http://localhost:3000\` with the real domain where your frontend is hosted.

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

Do not paste real access keys into code, documentation, screenshots, or commits. Keep examples masked:

\`\`\`text
Access Key ID:     AKIA************
Secret Access Key: ****************
\`\`\`

---

## 6. Step 3 — Configure the S3 SDK in the Backend

\`\`\`bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
\`\`\`

### Example S3 Client Setup

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

S3 buckets are private. Normally only authenticated AWS users can read/write objects. But in this flow, the browser uploads directly to S3 to avoid routing large files through the backend. The solution: the backend signs a URL using its credentials and hands it to the browser.

- **Without presigned URL:** Browser PUT → S3 → 403 FORBIDDEN (browser has no AWS credentials)
- **With presigned URL:** Backend signs URL → Browser uses signed URL → PUT → S3 → 200 OK (AWS keys never leave the backend)

### How it works in code

\`\`\`js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "./s3Client.js";

const command = new PutObjectCommand({
  Bucket: "an-aws-s3-ecommerce",
  Key: "products/shoe.png",
});

// URL is valid for 1 hour (3600 seconds)
const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
\`\`\`

The browser does a \`PUT\` to this URL with the image as the body. S3 verifies the signature and stores the file.

### PUT presigned URL vs GET presigned URL

Presigned URLs can be created for different S3 actions:

| Use case | S3 command | Browser method | Why |
| -------- | ---------- | -------------- | --- |
| Upload image | \`PutObjectCommand\` | \`PUT\` | Allows browser to upload directly to private S3 |
| View image directly from private S3 | \`GetObjectCommand\` | \`GET\` | Allows browser to read one private object temporarily |

For uploads, this project uses a **presigned PUT URL**.

For viewing products, there are two possible approaches:

1. **Direct S3 read with presigned GET URL**

   The backend fetches products from MongoDB, then generates a temporary GET URL for every product image.

   \`\`\`js
   const command = new GetObjectCommand({
     Bucket: process.env.BUCKET,
     Key: "products/shoe.png",
   });

   const imageUrl = await getSignedUrl(s3Client, command, {
     expiresIn: 3600,
   });
   \`\`\`

   This works, but every \`GET /api/products\` request needs AWS signing work, and image URLs expire.

2. **CloudFront read URL**

   The backend fetches products from MongoDB, then builds a CloudFront URL from the saved S3 key.

   \`\`\`js
   const imageUrl = \`https://d2ocd53kzqw2fg.cloudfront.net/products/shoe.png\`;
   \`\`\`

   This is better for production because CloudFront caches images near users and the backend does not need to generate read signatures for every product.

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
3. Frontend calls an upload API such as \`POST /api/upload/presigned-url\` with \`{ fileName: "shoe.png" }\`
4. Backend sanitizes filename, creates \`PutObjectCommand\`, signs URL (expires in 1 hour), returns \`{ url, finalName }\`
5. Browser PUTs image directly to S3 using the signed URL
6. Frontend calls \`POST /api/products\` with \`{ name, description, price, brand, filename: "products/shoe.png" }\`
7. Backend saves to MongoDB
8. \`router.push("/")\` + \`router.refresh()\` forces Next.js to refetch

### Frontend code

\`\`\`js
// Step 1: Get presigned URL
const presignRes = await fetch(
  "http://localhost:3001/api/upload/presigned-url",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: form.image.name }),
  },
);
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
// Example helper used when returning product data
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

When the browser does \`fetch(presignedUrl, { method: "PUT" })\`, it is making a **cross-origin request** from your frontend domain to S3. The browser automatically sends a preflight \`OPTIONS\` request first.

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

### How this changes backend code

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
// Example Next.js image configuration
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

### Example Backend Fetch Code

\`\`\`js
// Example product fetch handler
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

### Example Frontend Render Code

\`\`\`jsx
// Example product card image
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

### Important fetch detail

\`GET /api/products\` does **not** fetch image bytes from S3. It only fetches product documents from MongoDB and converts each saved S3 key into a browser-loadable image URL.

With CloudFront:

\`\`\`text
MongoDB stores:
filename: "products/shoe.png"

Backend returns:
filename: "https://d2ocd53kzqw2fg.cloudfront.net/products/shoe.png"

Browser loads:
<img src="https://d2ocd53kzqw2fg.cloudfront.net/products/shoe.png">
\`\`\`

CloudFront then handles the real image delivery. If the image is already cached at the nearest edge location, S3 is not contacted again.

---

## 14. Full Architecture Diagram

\`\`\`text
UPLOAD FLOW

Browser              Backend (3001)              S3 Bucket              MongoDB
-------              --------------              ---------              -------
Fill form
   |
   | POST /api/upload/presigned-url
   |-------------------------------> Sign URL
   |<------------------------------- { url, finalName }
   |
   | PUT image directly
   |-----------------------------------------------> Store object
   |
   | POST /api/products { name, filename }
   |-------------------------------> Save product ---------------------> document
   |<------------------------------- success
\`\`\`

\`\`\`text
FETCH FLOW

Browser              Backend (3001)              MongoDB                CloudFront
-------              --------------              -------                ----------
Page loads
   |
   | GET /api/products
   |-------------------------------> Find products
   |                                  Build CloudFront URLs
   |<------------------------------- { products: [...] }
   |
   | <Image src="cloudfront.net/...">
   |-------------------------------------------------------------------> Serve cached image
\`\`\`

---

## 15. Environment Variables Reference

### Backend Environment Variables

| Variable | Where used | What it does |
| ----------------------- | ----------------------- | ------------------------------------------- |
| \`AWS_ACCESS_KEY\` | S3 client setup | IAM user access key to authenticate with S3 |
| \`AWS_SECRET_ACCESS_KEY\` | S3 client setup | IAM user secret key |
| \`BUCKET\` | Upload API | S3 bucket name for presigned URL generation |
| \`MONGODB_URI\` | Database connection | MongoDB Atlas connection string |
| \`PORT\` | Backend server | Port the backend server listens on |

> **Never commit \`.env\` to git.** Both \`.env\` and \`.env.local\` are in their respective \`.gitignore\` files.
    `,
  },
  {
    id: "react-optimization-patterns",
    title: "React Optimization Patterns",
    date: "May 5, 2026",
    readTime: "35 min read",
    tags: ["React", "JavaScript", "Performance"],
    summary:
      "A practical guide to the React performance patterns that matter in real apps: re-renders, memoization, stable callbacks, derived state, debouncing, throttling, lazy loading, skeleton UIs, virtualization, isolation, and React Compiler.",
    content: `
This guide is a practical React optimization playground. It covers the most common performance patterns used in real React applications: understanding re-renders, memoizing components and values, stabilizing function references, avoiding derived state bugs, reducing expensive event calls, splitting bundles, showing skeleton UIs, isolating state, using virtualization for large lists, and understanding where React Compiler fits.

I wrote these notes from what I learned while practicing React optimization patterns. Each example is intentionally small and generic, so the focus stays on the idea rather than any private project code.

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
      <MemoizedProfileCard name="Aniket" />
    </div>
  );
}
\`\`\`

The child receives \`name="Aniket"\`, which never changes. Without memoization, it can still render when the parent renders. With \`React.memo\`, React skips the child render because the prop is unchanged.

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
<ProfileCard name="Aniket" />
\`\`\`

For objects, arrays, and functions, references matter:

\`\`\`jsx
<ProfileCard user={{ name: "Aniket" }} />
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
  {
    id: "ci-cd-complete-notes",
    title: "CI/CD Complete Notes",
    date: "April 3, 2026",
    readTime: "18 min read",
    tags: ["CI/CD", "DevOps", "GitHub Actions", "Jenkins", "Docker"],
    summary:
      "A beginner-friendly guide to CI/CD: developer checks, repositories, CI pipelines, CD releases, artifacts, staging, production deployment, and the difference between Continuous Delivery and Continuous Deployment.",
    content: `
## What Is CI/CD?

CI/CD is a software development practice that helps teams test, build, and release code automatically.

These notes come from what I learned while practicing CI/CD flow. They use common tools and generic project flows instead of any private repository setup.

- **CI** means **Continuous Integration**
- **CD** means **Continuous Delivery** or **Continuous Deployment**

In simple words:

- CI checks whether new code is safe to merge.
- CD prepares and releases the application after the code is merged.

The main goal is to reduce manual work and catch problems early. Instead of waiting until the end to test everything, CI/CD checks the application every time code is pushed or a pull request is updated.

---

## Full CI/CD Flow Diagram

This horizontal flow shows each phase from left to right, including what happens when a check fails:

\`\`\`text
                                                                  CI/CD
                                                                    |
                                                                    v
+---------------------------+    +---------------------------+    +---------------------------+    +---------------------------+    +---------------------------+
| 1. Developer Phase        |    | 2. Repository Phase       |    | 3. CI Phase               |    | 4. CD Phase               |    | 5. Production             |
+---------------------------+    +---------------------------+    +---------------------------+    +---------------------------+    +---------------------------+
| You write code            |    | GitHub / GitLab / repo    |    | CI system starts          |    | CD system starts          |    | Users get new version     |
| Local checks              |    | Open Pull Request         |    | CI checks                 |    | CD steps                  |    |                           |
| - tests                   |    | Trigger CI pipeline       |    | - pull code               |    | - build artifact          |    |                           |
| - linters                 |    |                           |    | - install dependencies    |    | - publish artifact        |    |                           |
| - formatters              |    |                           |    | - lint / format / type    |    | - deploy staging / QA     |    |                           |
| - type checks             |    |                           |    | - security checks         |    | - staging checks          |    |                           |
| - local build             |    |                           |    | - tests and build         |    |                           |    |                           |
+-------------+-------------+    +-------------+-------------+    +-------------+-------------+    +-------------+-------------+    +-------------+-------------+
              |                                ^                                |                                |                                ^
              v                                |                                v                                v                                |
       +-------------+                         |                         +-------------+                  +-------------+                         |
       | Fail?       |                         |                         | Fail?       |                  | Fail?       |                         |
       +-------------+                         |                         +-------------+                  +-------------+                         |
       YES |   | NO                            |                         YES |   | NO                     YES |   | NO                            |
           |   +-------------------------------+------------------------------+   +----------------------------+   +-----------------------------+
           |                                   |                                  |                                |
           v                                   |                                  v                                v
   +---------------+                           |                         +----------------+               +----------------+
   | Fix the code  |---------------------------+                         | Merge PR       |-------------->| Staging checks |
   +---------------+                                                     +----------------+               +-------+--------+
                                                                                                                |
                                                                                                                v
                                                                                                         +-------------+
                                                                                                         | All pass?   |
                                                                                                         +-------------+
                                                                                                         NO |   | YES
                                                                                                            |   |
                                                                                                            v   v
                                                                                                    +---------------+       +---------------------+
                                                                                                    | Stop pipeline |       | Deploy production   |
                                                                                                    +---------------+       +----------+----------+
                                                                                                                               |
                                                                                                                               v
                                                                                                                             Users

Main NO path:
Local checks pass -> Commit and push code -> Open PR -> CI passes -> Merge PR -> CD passes -> Staging checks pass -> Production

YES path:
Any failed local or CI check goes back to fixing code. Failed CD or staging checks stop the release until the issue is fixed.
\`\`\`

Short version:

\`\`\`text
Write code -> Local checks -> Push -> Pull request -> CI checks -> Merge -> Build artifact -> Staging -> Production
\`\`\`

---

## 1. Developer Phase

The developer phase happens on the developer's local machine before the code reaches GitHub or any CI/CD tool.

In this phase, the developer:

- writes code
- runs local tests
- runs linters
- runs formatters
- runs type checks
- checks whether the app builds locally

Examples:

\`\`\`bash
npm run lint
npm run format
npm test
npm run build
\`\`\`

If anything fails locally, fix the code and run the checks again.

If everything passes, commit and push the code:

\`\`\`bash
git add .
git commit -m "Add new feature"
git push
\`\`\`

Short answer:

> The developer phase is where code is written and checked locally before pushing it to a remote repository. If tests, linting, formatting, type checks, or builds fail, the developer fixes the code before pushing.

---

## 2. Repository Phase

The repository phase starts when code is pushed to a remote repository like GitHub, GitLab, or Bitbucket.

In this phase:

- code is pushed to the repository
- a pull request is opened
- team members can review the code
- the CI pipeline is triggered automatically

Example:

\`\`\`text
Developer -> git push -> GitHub -> Open PR -> Trigger CI pipeline
\`\`\`

A pull request is important because it gives the team a place to review code before merging it into the main branch.

Short answer:

> The repository phase is where pushed code reaches GitHub or another remote repository. Usually, a pull request is opened, and that pull request triggers the CI pipeline.

---

## 3. CI Phase: Continuous Integration

CI means **Continuous Integration**.

Continuous Integration is the process of automatically checking new code before it is merged into the main branch.

The goal of CI is to answer one important question:

**Is this code safe to merge?**

When a pull request is opened or updated, the CI system starts running checks.

Common CI tools:

- GitHub Actions
- Jenkins
- GitLab CI
- CircleCI
- Travis CI

The CI system usually does these steps:

1. Pulls the latest code
2. Installs dependencies
3. Runs lint checks
4. Runs formatting checks
5. Runs type checks
6. Runs security checks
7. Runs automated tests
8. Builds the application

Examples of CI checks in a Node.js project:

\`\`\`bash
npm ci
npm run lint
npm run typecheck
npm audit
npm test
npm run build
\`\`\`

If CI fails:

- the pipeline stops
- the pull request should not be merged
- the developer fixes the code
- the developer pushes again
- CI runs again

If CI passes:

- the pull request can be reviewed
- the pull request can be merged into the main branch

Short answer:

> Continuous Integration is the process of automatically testing and checking code whenever it is pushed or a pull request is opened. CI runs checks like linting, security scanning, tests, and builds. If CI passes, the code is safer to merge. If CI fails, the developer fixes the issue and pushes again.

---

## 4. CD Phase: Continuous Delivery or Continuous Deployment

CD can mean two related things:

- **Continuous Delivery**
- **Continuous Deployment**

Both usually happen after CI passes and the code is merged.

The goal of CD is to answer this question:

**Can this code be released safely?**

The CD system usually does these steps:

1. Builds the production artifact
2. Publishes the artifact
3. Deploys the app to staging or QA
4. Runs staging checks
5. Deploys to production if everything passes

Common artifact storage or registry tools:

- Docker Hub
- Nexus
- GitHub Container Registry
- AWS ECR

Example artifacts:

- Docker image
- compiled frontend build
- backend build package
- \`.jar\` file
- \`.zip\` deployment file

---

## 5. Continuous Delivery vs Continuous Deployment

Continuous Delivery and Continuous Deployment are related, but they are not exactly the same.

| Topic | Continuous Delivery | Continuous Deployment |
| --- | --- | --- |
| Production release | Manual approval is usually required | Production release happens automatically |
| Best for | Teams that want a final human approval | Teams with strong automated testing and release confidence |
| Flow | Merge -> Build -> Test -> Staging -> Approval -> Production | Merge -> Build -> Test -> Staging -> Production |

### Continuous Delivery

Continuous Delivery means the code is automatically built, tested, and prepared for production, but the final production deployment usually needs manual approval.

\`\`\`text
Merge PR -> Build -> Test -> Deploy to staging -> Manual approval -> Production
\`\`\`

Example:

A team may want a manager, senior developer, QA person, or DevOps engineer to approve the production release.

### Continuous Deployment

Continuous Deployment means the code is automatically deployed to production after all checks pass.

\`\`\`text
Merge PR -> Build -> Test -> Deploy to staging -> Checks pass -> Production automatically
\`\`\`

Simple difference:

- Continuous Delivery: production deployment is manual
- Continuous Deployment: production deployment is automatic

---

## 6. Artifact

An artifact is the final packaged output that is ready to deploy.

In CI/CD, teams usually do not deploy raw source code directly. Instead, the pipeline builds an artifact and deploys that artifact.

Examples:

- Docker image
- compiled frontend build
- backend build package
- \`.jar\` file
- \`.zip\` deployment file

Example:

\`\`\`text
Source code -> Build -> Docker image -> Docker Hub -> Server pulls image -> Deploy
\`\`\`

Short answer:

> An artifact is the packaged version of the application that is ready for deployment. In a Docker-based workflow, the artifact is usually a Docker image.

---

## 7. Staging Server

A staging server is a test environment that is very similar to production.

Before deploying to real users, the application is deployed to staging so the team can verify that everything works.

Checks on staging may include:

- smoke testing
- API testing
- database migration checks
- health checks
- QA testing
- performance checks

If staging checks fail, the pipeline stops.

If staging checks pass, the app can move to production.

Short answer:

> A staging server is a production-like environment used to test the application before releasing it to real users.

---

## 8. Production Deployment

Production is the real environment used by actual users.

After all CI and CD checks pass, the application is deployed to production.

Production deployment may include:

- pulling the latest Docker image
- restarting containers
- running database migrations
- switching traffic to the new version
- checking app health after deployment

If the production deployment is successful, users get the new version of the application.

If something fails, the team may stop the pipeline or roll back to the previous version.

Short answer:

> Production deployment is the final step where the tested and approved version of the application is released to real users.

---

## 9. CI/CD In One Line

CI/CD means:

\`\`\`text
Write code -> Test automatically -> Build artifact -> Deploy to staging -> Deploy to production
\`\`\`

Short interview answer:

> CI/CD is an automated process for testing, building, and deploying software. CI, or Continuous Integration, runs checks like linting, tests, security scanning, and builds when code is pushed or a pull request is opened. CD, or Continuous Delivery or Continuous Deployment, builds an artifact, publishes it, deploys it to staging, runs final checks, and then releases it to production either manually or automatically.

---

## Final Checklist

Remember the full flow like this:

- Write code locally
- Run local checks
- Push code to GitHub, GitLab, or Bitbucket
- Open a pull request
- CI runs checks automatically
- Fix the code if CI fails
- Merge the pull request if CI passes
- CD builds and publishes the deployable artifact
- Deploy to staging or QA
- Deploy to production after final checks

CI protects the main branch. CD protects the release process.
    `,
  },
  {
    id: "node-image-processing-worker-threads",
    title: "Image Processing with Node.js",
    date: "April 9, 2026",
    readTime: "16 min read",
    tags: ["Node.js", "Image Processing", "Worker Threads", "Jimp", "Performance"],
    summary:
      "A practical learning guide to batch image processing in Node.js: sequential single-threaded processing, worker_threads, trade-offs, worker-pool thinking, and when to choose each approach.",
    content: `
## What I Learned

These notes come from what I learned while practicing batch image processing in Node.js. The examples are generic and use placeholder folder names, so they can be adapted to any image-processing project.

The goal is to compare two approaches:

- **Sequential single-threaded processing:** simpler and easier to debug.
- **Worker thread processing:** better for CPU-heavy batches because work can run in parallel.

Image processing includes tasks like resizing, generating thumbnails, applying filters, compressing files, or preparing images for upload.

---

## Quick Summary

- Sequential processing is simple, but it can be slow for many large images.
- \`worker_threads\` can run CPU-heavy work in parallel on multiple CPU cores.
- A worker per file can be fast for small batches, but it can overload the system for large batches.
- A worker pool is usually the better production-style approach because it limits concurrency.

Example measurements from one practice run:

| Approach | Total time | Average per image |
| --- | --- | --- |
| Sequential processing | Around 55s | Around 9.2s/image |
| Worker per file | Around 17.7s | Around 2.9s/image |

These numbers are only examples. Real results depend on image size, CPU cores, disk speed, memory, image library, and the transformations being applied.

---

## Why This Matters

Node.js is great at handling I/O, but heavy image transformations are usually **CPU-bound**.

CPU-bound work means the processor is doing expensive calculations. If one Node.js thread is busy resizing or filtering large images, the event loop can become slow or blocked.

Worker threads help because they allow CPU-heavy work to run outside the main thread. The main thread can stay focused on orchestration while workers process images in parallel.

Simple idea:

\`\`\`text
Main thread = finds images and starts work
Worker thread = processes one image or one task
Multiple workers = multiple CPU cores can be used
\`\`\`

---

## Dependencies

These examples use:

- Node.js with ES modules
- \`worker_threads\` from Node.js
- \`jimp\` for reading, transforming, and writing images

Install Jimp:

\`\`\`bash
npm install jimp
\`\`\`

Example folder structure:

\`\`\`text
image-processing-demo/
  input_images/
    photo-1.jpg
    photo-2.png
  normal-processing.js
  worker.js
  multithreaded-main.js
\`\`\`

The folder names are examples only. You can use any input and output folders in your own app.

---

## 1. Sequential Single-Threaded Processing

This approach reads images one by one and applies the transformations sequentially.

It is often the best starting point because it is easy to understand, debug, and measure.

\`\`\`js
// normal-processing.js
import { Jimp } from "jimp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const INPUT_DIR = path.join(process.cwd(), "input_images");
const OUTPUT_DIR = path.join(process.cwd(), "normal_output");

async function processImage(imagePath, filename) {
  const base = path.parse(filename).name;
  const outDir = path.join(OUTPUT_DIR, base);
  await mkdir(outDir, { recursive: true });

  const image = await Jimp.read(imagePath);

  await image
    .clone()
    .resize(200, 200)
    .writeAsync(path.join(outDir, \`\${base}_thumbnail.jpg\`));

  await image
    .clone()
    .resize(300, 300)
    .writeAsync(path.join(outDir, \`\${base}_small.jpg\`));

  await image
    .clone()
    .resize(600, 600)
    .writeAsync(path.join(outDir, \`\${base}_medium.jpg\`));

  await image
    .clone()
    .greyscale()
    .writeAsync(path.join(outDir, \`\${base}_greyscale.jpg\`));

  await image
    .clone()
    .blur(5)
    .writeAsync(path.join(outDir, \`\${base}_blur.jpg\`));
}

async function main() {
  const files = await readdir(INPUT_DIR);
  const images = files.filter((file) => /\\.(jpg|jpeg|png|webp)$/i.test(file));

  const start = Date.now();

  for (const file of images) {
    await processImage(path.join(INPUT_DIR, file), file);
    console.log(\`\${file} processed\`);
  }

  const total = Date.now() - start;
  console.log("SEQUENTIAL PROCESSING", \`Total time: \${total}ms\`);
}

main().catch(console.error);
\`\`\`

### Pros

- Easy to reason about.
- Easy to debug.
- Good for small batches.
- No worker setup required.

### Cons

- Images are processed one after another.
- Large batches can take a long time.
- CPU-heavy work does not use multiple CPU cores effectively.

---

## 2. Multithreaded Processing with Worker Threads

The high-level idea is simple:

1. The main thread finds all images.
2. The main thread starts workers.
3. Each worker receives an image path and filename.
4. The worker processes the image.
5. The worker sends a success or failure message back.

This can reduce wall-clock time because multiple images can be processed at the same time.

---

## 3. Worker File

The worker contains the image-processing logic. It receives data through \`workerData\` and sends the result back through \`parentPort\`.

\`\`\`js
// worker.js
import { Jimp } from "jimp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { parentPort, workerData } from "node:worker_threads";

const OUTPUT_DIR = path.join(process.cwd(), "multithreaded_output");

async function processImage() {
  const { imagePath, filename } = workerData;
  const base = path.parse(filename).name;
  const outDir = path.join(OUTPUT_DIR, base);
  await mkdir(outDir, { recursive: true });

  const image = await Jimp.read(imagePath);

  await image
    .clone()
    .resize(200, 200)
    .writeAsync(path.join(outDir, \`\${base}_thumbnail.jpg\`));

  await image
    .clone()
    .resize(300, 300)
    .writeAsync(path.join(outDir, \`\${base}_small.jpg\`));

  await image
    .clone()
    .resize(600, 600)
    .writeAsync(path.join(outDir, \`\${base}_medium.jpg\`));

  await image
    .clone()
    .greyscale()
    .writeAsync(path.join(outDir, \`\${base}_greyscale.jpg\`));

  await image
    .clone()
    .blur(5)
    .writeAsync(path.join(outDir, \`\${base}_blur.jpg\`));

  parentPort.postMessage({ success: true, filename });
}

processImage().catch((error) => {
  parentPort.postMessage({
    success: false,
    filename: workerData.filename,
    error: String(error),
  });
});
\`\`\`

Important detail:

- The worker should report both success and failure.
- The main thread should decide what to do when a worker fails.

---

## 4. Main Thread for Workers

The main thread creates workers and waits for all of them to finish.

\`\`\`js
// multithreaded-main.js
import { Worker } from "node:worker_threads";
import { readdir } from "node:fs/promises";
import path from "node:path";

const WORKER_FILE = path.join(process.cwd(), "worker.js");
const INPUT_DIR = path.join(process.cwd(), "input_images");

function runWorker(imagePath, filename) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_FILE, {
      workerData: { imagePath, filename },
    });

    worker.on("message", (message) => {
      if (message.success) {
        resolve(message);
      } else {
        reject(new Error(message.error));
      }
    });

    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(\`Worker stopped with exit code \${code}\`));
      }
    });
  });
}

async function main() {
  const files = await readdir(INPUT_DIR);
  const images = files.filter((file) => /\\.(jpg|jpeg|png|webp)$/i.test(file));

  const start = Date.now();

  const tasks = images.map((file) =>
    runWorker(path.join(INPUT_DIR, file), file),
  );

  await Promise.all(tasks);

  const total = Date.now() - start;
  console.log("WORKER THREAD PROCESSING", \`Total time: \${total}ms\`);
}

main().catch(console.error);
\`\`\`

### Pros

- Faster for CPU-heavy batches.
- Can use multiple CPU cores.
- Keeps the main thread focused on orchestration.

### Cons

- More moving parts.
- Each worker has startup and memory overhead.
- Too many workers can slow the system down instead of speeding it up.

---

## 5. Worker Per File vs Worker Pool

Creating one worker per image is simple, but it is not always safe for large batches.

Example problem:

\`\`\`text
500 images -> 500 workers -> high memory usage -> slow system or crash risk
\`\`\`

A better approach is a **worker pool**.

A worker pool means:

- run only a limited number of workers at the same time
- usually match the limit to CPU cores
- keep remaining files in a queue
- start the next task when one worker finishes

Worker pool sketch:

\`\`\`js
// worker-pool-sketch.js
import os from "node:os";

const poolSize = Math.max(1, os.cpus().length - 1);
const queue = [...images];

// Start at most poolSize workers.
// When a worker finishes, take the next image from the queue.
// Resolve when the queue is empty and all active workers are done.
\`\`\`

A full worker pool needs careful error handling and shutdown logic, but this is the main idea.

---

## 6. Practical Tips

- Start with sequential processing so you can confirm the image logic works.
- Measure the time before and after adding workers.
- Limit worker count for large batches.
- Watch memory usage because cloned images can be heavy.
- Use clear success and error messages from workers.
- For I/O-heavy tasks, async I/O may matter more than worker threads.
- For production-grade image processing, consider \`sharp\`, which uses libvips and is usually faster and more memory efficient than pure JavaScript image processing.

---

## 7. When to Use Each Approach

| Situation | Better choice |
| --- | --- |
| Few small images | Sequential processing |
| Simple script or learning example | Sequential processing |
| Many large images | Worker threads |
| CPU-heavy transformations | Worker threads |
| Very large batch | Worker pool |
| Production image pipeline | Worker pool + efficient image library like \`sharp\` |

Short rule:

> Use the simplest approach first. Add worker threads only when image processing time becomes a real bottleneck.

---

## 8. Running the Examples

1. Create an \`input_images\` folder.
2. Add a few JPG, PNG, or WEBP images.
3. Install \`jimp\`.
4. Run the sequential script:

\`\`\`bash
node normal-processing.js
\`\`\`

5. Run the worker-thread script:

\`\`\`bash
node multithreaded-main.js
\`\`\`

Expected output folders:

- \`normal_output\`
- \`multithreaded_output\`

Each processed image gets resized and filtered versions.

---

## 9. Final Notes

Worker threads are useful when JavaScript needs to do CPU-heavy work without blocking the main thread.

For image processing, the best path is usually:

\`\`\`text
Start simple -> Measure -> Add workers if needed -> Limit workers with a pool -> Consider sharp for production
\`\`\`

Sequential processing teaches the transformation logic clearly. Worker threads teach how Node.js can use parallelism for CPU-heavy work.

The important lesson is not just "workers are faster." The real lesson is knowing when the extra complexity is worth it.
    `,
  },
  {
    id: "scaling-nodejs-with-cluster",
    title: "Scaling Node.js with Cluster",
    date: "April 14, 2026",
    readTime: "13 min read",
    tags: ["Node.js", "Cluster", "Scaling", "Express", "Performance"],
    summary:
      "A practical learning guide to Node.js clustering: why one process uses one event loop, how cluster spreads work across CPU cores, and what to consider before using it in production.",
    content: `
## What I Learned

These notes come from what I learned while practicing how Node.js can use multiple CPU cores for a web server.

By default, one Node.js process runs JavaScript on one main event loop. That is great for many I/O-heavy apps, but it can become a bottleneck when request handlers do CPU-heavy work.

The built-in \`cluster\` module helps by starting multiple Node.js worker processes. Each worker has its own event loop and memory, so requests can be handled across multiple CPU cores.

---

## Quick Summary

- One Node.js process uses one main event loop.
- \`cluster\` starts multiple worker processes.
- Each worker can handle requests independently.
- Clustering can improve throughput for CPU-heavy web servers.
- Each worker has separate memory, so resource usage increases.
- For production, combine clustering with monitoring, health checks, a process manager, and load testing.

Short idea:

\`\`\`text
Single process:
One Node.js process -> one event loop -> one CPU core mostly used

Cluster:
Primary process -> multiple workers -> multiple CPU cores can be used
\`\`\`

---

## Why Use Clustering?

Node.js is very good at asynchronous I/O. For example, API calls, database queries, and file reads can be handled efficiently without creating many threads.

But CPU-heavy work is different.

Examples of CPU-heavy work:

- complex calculations
- heavy JSON processing
- password hashing
- image or file transformations
- synchronous loops inside request handlers

If CPU-heavy work runs inside a request handler, the event loop can be blocked. While the event loop is blocked, that process cannot respond quickly to other requests.

Clustering helps by creating multiple worker processes:

\`\`\`text
Request traffic
      |
      v
Primary process
      |
      +--> Worker 1 -> event loop
      +--> Worker 2 -> event loop
      +--> Worker 3 -> event loop
      +--> Worker 4 -> event loop
\`\`\`

Each worker is a full Node.js process. That means workers do not share memory by default.

---

## 1. Single Process Example

This example uses one Express server process.

\`\`\`js
// single-server.js
import express from "express";

const app = express();

app.get("/", (_req, res) => {
  let sum = 0;

  for (let i = 0; i < 100_000; i++) {
    sum += i;
  }

  res.json({ message: sum });
});

app.listen(4400, () => {
  console.log("Single process server running on port 4400");
});
\`\`\`

This works, but all JavaScript runs inside one process. If the request handler becomes CPU-heavy, one event loop has to do all the work.

---

## 2. Clustered Server Example

This version uses the built-in \`cluster\` module.

The primary process starts workers. The workers run the Express server.

\`\`\`js
// cluster-server.js
import cluster from "node:cluster";
import express from "express";
import { availableParallelism } from "node:os";

const PORT = 4400;
const workerCount = availableParallelism();

if (cluster.isPrimary) {
  console.log(\`Primary process \${process.pid} is running\`);

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      \`Worker \${worker.process.pid} stopped. Code: \${code}, signal: \${signal}\`,
    );

    cluster.fork();
  });
} else {
  const app = express();

  app.get("/", (_req, res) => {
    let sum = 0;

    for (let i = 0; i < 100_000; i++) {
      sum += i;
    }

    res.json({
      message: sum,
      workerPid: process.pid,
    });
  });

  app.listen(PORT, () => {
    console.log(\`Worker \${process.pid} listening on port \${PORT}\`);
  });
}
\`\`\`

What happens here:

- The primary process does not handle normal HTTP requests.
- The primary process starts worker processes.
- Each worker runs an Express server.
- If a worker exits, the primary process starts a replacement worker.

---

## 3. How Requests Are Distributed

When multiple workers listen on the same port through \`cluster\`, Node.js coordinates request distribution between workers.

Simple mental model:

\`\`\`text
Incoming requests
      |
      v
Primary process
      |
      +--> Worker A
      +--> Worker B
      +--> Worker C
      +--> Worker D
\`\`\`

The exact scheduling behavior can depend on the operating system and Node.js settings, but the important idea is that multiple worker processes can handle traffic.

---

## 4. Testing Single Process vs Cluster

A load testing tool can help compare the two approaches.

Install \`autocannon\` globally:

\`\`\`bash
npm install -g autocannon
\`\`\`

Run a basic test:

\`\`\`bash
autocannon -c 100 -d 10 http://your-server-url/
\`\`\`

What the flags mean:

- \`-c 100\`: open 100 concurrent connections
- \`-d 10\`: run the test for 10 seconds

Compare:

1. Start the single-process server.
2. Run the load test.
3. Start the clustered server.
4. Run the same load test again.

Look at:

- requests per second
- average latency
- p95 or p99 latency
- CPU usage
- memory usage

The cluster version should usually handle CPU-heavy request work better on a multi-core machine.

---

## 5. Benefits of Cluster

- Uses multiple CPU cores.
- Improves throughput for CPU-heavy request handlers.
- Gives basic resilience because the primary process can restart crashed workers.
- Keeps each worker isolated as a separate process.

Cluster is useful when one server process cannot use the available CPU effectively.

---

## 6. Caveats and Trade-Offs

Cluster is powerful, but it is not free.

| Concern | Why it matters |
| --- | --- |
| More memory usage | Each worker is a separate process with separate memory |
| In-memory sessions | Requests may hit different workers |
| Worker restarts | Restarting blindly can hide repeated crashes |
| Too many workers | More workers than useful CPU capacity can reduce performance |
| Shared state | Workers do not share memory by default |

### Sessions and Shared State

If an app stores sessions in memory, clustering can create bugs because the next request may go to a different worker.

Better options:

- store sessions in Redis
- store state in a database
- use sticky sessions only when needed

Shared external storage is usually cleaner than relying on memory inside one worker.

---

## 7. Production Recommendations

For production, clustering should be part of a wider operational setup.

Use:

- a process manager such as PM2 or systemd
- health checks for workers
- logging per worker
- monitoring for CPU, memory, latency, and error rate
- a reverse proxy such as NGINX when needed
- load testing before and after enabling cluster

For container deployments, it is often cleaner to run one Node.js process per container and scale replicas using the orchestrator. In that setup, Kubernetes, Docker Swarm, or the platform itself handles process scaling.

Simple production rule:

> Do not add cluster just because it exists. Add it when measurement shows one Node.js process is CPU-bound and more CPU cores are available.

---

## 8. Cluster vs Worker Threads

\`cluster\` and \`worker_threads\` solve related but different problems.

| Feature | Cluster | Worker Threads |
| --- | --- | --- |
| Unit of scaling | Process | Thread |
| Best for | Scaling HTTP servers across CPU cores | Offloading CPU-heavy tasks |
| Memory | Separate process memory | Shared process with isolated threads |
| Common use | Multiple server workers | Background CPU tasks |

Simple difference:

- Use \`cluster\` to run multiple server processes.
- Use \`worker_threads\` to move CPU-heavy work away from the main thread.

Sometimes an app can use both, but that increases complexity and should be measured carefully.

---

## 9. When to Choose Alternatives

Cluster is not always the best answer.

Use a job queue when:

- tasks are slow
- tasks should retry
- tasks should run outside the request lifecycle
- HTTP responses need to stay fast

Examples:

- image processing
- report generation
- video processing
- bulk email sending

Common queue tools:

- Redis-based queues
- RabbitMQ
- cloud queue services

For heavy binary transformations, native libraries such as \`sharp\` can be faster and more memory efficient than pure JavaScript work.

---

## 10. Final Summary

Node.js \`cluster\` helps a web server use multiple CPU cores by running multiple worker processes.

The basic flow is:

\`\`\`text
Primary process -> fork workers -> workers run server -> requests spread across workers
\`\`\`

Use cluster when:

- requests contain CPU-heavy work
- one process is not using the full machine
- load testing shows throughput improves

Be careful with:

- memory usage
- session storage
- worker crash loops
- shared state
- deployment model

The main lesson is simple: clustering can scale a Node.js server across CPU cores, but production readiness still needs monitoring, health checks, proper state management, and real load testing.
    `,
  },
  {
    id: "redux-toolkit-ecommerce-guide",
    title: "Redux Toolkit Ecommerce Guide",
    date: "April 21, 2026",
    readTime: "18 min read",
    tags: ["React", "Redux Toolkit", "Redux", "Ecommerce", "Cart"],
    summary:
      "A practical learning guide to Redux Toolkit in an ecommerce app: store setup, cart slices, async product fetching, plain Redux comparison, migration ideas, and best practices.",
    content: `
## What I Learned

These notes come from what I learned while practicing **Redux Toolkit** in an ecommerce-style React app.

The examples focus on two common ecommerce features:

- a **product list** fetched from an API
- a **cart** where users can add, remove, and update items

The goal is to understand:

- how \`configureStore\`, \`createSlice\`, and \`createAsyncThunk\` work together
- how to structure cart and product state cleanly
- how to use \`useSelector\` and \`useDispatch\` in components
- why Redux Toolkit is the recommended way to write Redux today

---

## 1. Why Redux Toolkit

Redux Toolkit is the recommended way to write Redux logic.

It keeps the main Redux idea:

\`\`\`text
Component -> dispatch action -> reducer updates state -> UI reads updated state
\`\`\`

But it removes a lot of manual work that older Redux code needed.

Redux Toolkit gives:

- \`configureStore\` for store setup
- \`createSlice\` for reducers and actions
- \`createAsyncThunk\` for async API calls
- Immer for safe immutable updates with simpler syntax
- Redux DevTools and middleware defaults automatically

In an ecommerce app, Redux Toolkit is useful for shared state like:

- cart items
- product data
- loading state
- API error state
- filters or selected category
- user preferences

Simple cart flow:

\`\`\`text
User clicks Add to Cart
      |
      v
dispatch(addToCart(product))
      |
      v
cartSlice updates cart state
      |
      v
Cart UI shows the item
\`\`\`

---

## 2. Install Redux Toolkit

For a React app, install Redux Toolkit and React Redux:

\`\`\`bash
npm install @reduxjs/toolkit react-redux
\`\`\`

\`@reduxjs/toolkit\` gives the Redux helpers.

\`react-redux\` connects Redux state to React components.

---

## 3. Store Setup with configureStore

The store is the central place where Redux state lives.

With Redux Toolkit, store setup is short:

\`\`\`js
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import productReducer from "./productSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
  },
});
\`\`\`

What \`configureStore\` does:

- combines reducers
- adds useful middleware
- enables Redux DevTools
- applies good defaults

This is why most modern Redux apps do not manually write \`createStore\`, \`combineReducers\`, and middleware setup.

---

## 4. Connect Redux to React

Wrap the app with \`Provider\` so React components can access the Redux store:

\`\`\`jsx
import { Provider } from "react-redux";
import { store } from "./store";

function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
\`\`\`

After this, components can use:

- \`useSelector\` to read state
- \`useDispatch\` to send actions

---

## 5. Minimal Cart Slice

\`createSlice\` creates reducers and action creators together.

Here is a minimal cart slice:

\`\`\`js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    add(state, action) {
      state.push(action.payload);
    },

    remove(state, action) {
      return state.filter((item) => item.id !== action.payload);
    },
  },
});

export const { add, remove } = cartSlice.actions;
export default cartSlice.reducer;
\`\`\`

Important points:

- \`name: "cart"\` gives the slice a namespace.
- \`initialState\` is the starting cart state.
- \`reducers\` contains cart actions.
- \`cartSlice.actions\` gives ready-made action creators.
- \`cartSlice.reducer\` is added to the store.

This looks like mutation:

\`\`\`js
state.push(action.payload);
\`\`\`

But Redux Toolkit uses Immer, so this is safely converted into an immutable update.

---

## 6. Quantity-Aware Cart Slice

For a real ecommerce cart, storing duplicate product objects is usually not ideal.

A better cart stores quantity:

\`\`\`js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...product,
          quantity: 1,
        });
      }
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    increaseQuantity(state, action) {
      const item = state.items.find((cartItem) => cartItem.id === action.payload);

      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQuantity(state, action) {
      const item = state.items.find((cartItem) => cartItem.id === action.payload);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
\`\`\`

This slice handles:

- adding a new product
- increasing quantity when the product already exists
- removing an item
- increasing quantity
- decreasing quantity
- clearing the cart

---

## 7. Product Slice with createAsyncThunk

Product data usually comes from an API.

\`createAsyncThunk\` is useful because it automatically creates three action states:

- \`pending\`: request started
- \`fulfilled\`: request succeeded
- \`rejected\`: request failed

Example product slice:

\`\`\`js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("https://fakestoreapi.com/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue("Unable to load products");
    }
  },
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default productSlice.reducer;
\`\`\`

The product state moves through a predictable flow:

\`\`\`text
idle -> loading -> succeeded
idle -> loading -> failed
\`\`\`

---

## 8. Reading State with useSelector

\`useSelector\` reads Redux state inside a React component.

Example:

\`\`\`jsx
import { useSelector } from "react-redux";

function CartCount() {
  const items = useSelector((state) => state.cart.items);

  const count = items.reduce((total, item) => total + item.quantity, 0);

  return <span>{count}</span>;
}
\`\`\`

---

## 9. Updating State with useDispatch

\`useDispatch\` sends actions to Redux.

Example:

\`\`\`jsx
import { useDispatch } from "react-redux";
import { addToCart } from "./cartSlice";

function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <article>
      <h3>{product.title}</h3>
      <p>{product.price}</p>
      <button onClick={() => dispatch(addToCart(product))}>
        Add to Cart
      </button>
    </article>
  );
}
\`\`\`

---

## 10. Product List Component

This component fetches products when the page loads and displays loading/error states:

\`\`\`jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "./cartSlice";
import { fetchProducts } from "./productSlice";

function ProductList() {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  if (status === "loading") {
    return <p>Loading products...</p>;
  }

  if (status === "failed") {
    return <p>{error}</p>;
  }

  return (
    <div>
      {data.map((product) => (
        <article key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.price}</p>
          <button onClick={() => dispatch(addToCart(product))}>
            Add to Cart
          </button>
        </article>
      ))}
    </div>
  );
}
\`\`\`

---

## 11. Cart Component

This component reads cart items and dispatches cart actions:

\`\`\`jsx
import { useDispatch, useSelector } from "react-redux";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "./cartSlice";

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div>
      {items.map((item) => (
        <article key={item.id}>
          <h3>{item.title}</h3>
          <p>Quantity: {item.quantity}</p>
          <button onClick={() => dispatch(decreaseQuantity(item.id))}>-</button>
          <button onClick={() => dispatch(increaseQuantity(item.id))}>+</button>
          <button onClick={() => dispatch(removeFromCart(item.id))}>
            Remove
          </button>
        </article>
      ))}

      <strong>Total: {total.toFixed(2)}</strong>
    </div>
  );
}
\`\`\`

---

## 12. Selectors for Derived Cart Data

Selectors keep components clean.

Instead of calculating totals in every component, create reusable selector functions:

\`\`\`js
export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
\`\`\`

Use them like this:

\`\`\`jsx
const total = useSelector(selectCartTotal);
\`\`\`

For expensive derived data, memoized selectors with \`reselect\` can help.

---

## 13. Recommended Feature Structure

Redux Toolkit works well with feature-based folders:

\`\`\`text
features/
  cart/
    cartSlice.js
    cartSelectors.js
  products/
    productSlice.js
    productSelectors.js
store.js
\`\`\`

This keeps related logic close together:

- cart reducers with cart selectors
- product reducers with product selectors
- each feature owns its own state logic

---

## 14. Redux Toolkit vs Plain Redux

Plain Redux is useful for learning the fundamentals, but Redux Toolkit is usually better for real apps.

| Topic | Plain Redux | Redux Toolkit |
| --- | --- | --- |
| Store setup | Manual setup | \`configureStore\` |
| Reducers | Switch statements | \`createSlice\` |
| Actions | Manual action creators | Generated by slices |
| Async API calls | Manual thunks | \`createAsyncThunk\` |
| Immutability | Manual copying | Immer handles updates |
| Best use | Learning concepts | Building real apps |

Plain Redux cart update:

\`\`\`js
return [...state, action.payload];
\`\`\`

Redux Toolkit cart update:

\`\`\`js
state.push(action.payload);
\`\`\`

Both are immutable updates. Redux Toolkit just makes the code easier to write and read.

---

## 15. Redux Toolkit Best Practices

For an ecommerce app:

- store cart items with \`quantity\`
- keep product API state as \`data\`, \`status\`, and \`error\`
- show user-friendly error messages
- use selectors for cart totals and item counts
- avoid storing values that can be calculated
- keep slices focused on one feature
- consider TypeScript for stronger state typing
- test reducers because they contain important business logic

---

## 16. Running a Small Demo

For a small React + Redux Toolkit demo:

1. Install dependencies:

\`\`\`bash
npm install @reduxjs/toolkit react-redux
\`\`\`

2. Create a store with \`configureStore\`.
3. Create a cart slice with \`createSlice\`.
4. Create a product slice with \`createAsyncThunk\`.
5. Wrap the app with \`Provider\`.
6. Use \`useSelector\` and \`useDispatch\` inside components.

If the app is created with Vite, a common dev command is:

\`\`\`bash
npm run dev
\`\`\`

The exact command can change depending on the project setup.

---

## 17. Final Summary

Redux Toolkit is the cleanest way to use Redux in most modern React apps.

For an ecommerce products and cart flow:

\`\`\`text
configureStore -> productSlice -> cartSlice -> Provider -> useSelector/useDispatch
\`\`\`

The most important Redux Toolkit tools are:

- \`configureStore\` for setup
- \`createSlice\` for feature state
- \`createAsyncThunk\` for API requests
- \`useSelector\` for reading state
- \`useDispatch\` for updating state

The main lesson is simple: Redux Toolkit keeps Redux predictable while making ecommerce state much easier to write, debug, and maintain.
    `,
  },
  {
    id: "prisma-postgresql-nodejs-guide",
    title: "Prisma ORM with PostgreSQL and Node.js",
    date: "April 28, 2026",
    readTime: "24 min read",
    tags: ["Prisma", "PostgreSQL", "Node.js", "Express", "ORM"],
    summary:
      "A practical learning guide to Prisma ORM with PostgreSQL and Node.js: setup, Prisma 7 config, schema models, migrations, Express routes, common issues, useful commands, and interview questions.",
    content: `
## What I Learned

These notes come from what I learned while practicing Prisma ORM with PostgreSQL and a Node.js/Express API.

The goal is to understand:

- what an ORM is
- why Prisma is useful
- how Prisma connects to PostgreSQL
- how Prisma 7 uses \`prisma.config.ts\`
- how to define models and relationships
- how to run migrations
- how to use Prisma Client in Express routes
- common Prisma issues and fixes
- interview questions for Prisma ORM

All names, credentials, ports, and folder paths are generic examples. Replace them with your own project values.

---

## 1. What Is ORM?

ORM means **Object-Relational Mapping**.

It lets application code work with database tables using objects and methods instead of writing raw SQL everywhere.

Without an ORM, database code often looks like this:

\`\`\`js
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const result = await pool.query("SELECT * FROM users WHERE id = $1", [1]);
\`\`\`

This works, but you are writing raw SQL strings manually.

That means:

- no autocomplete for table and column names
- less type safety
- more manual joins and relationship handling
- more runtime errors from typos
- migrations need separate handling

With Prisma, the same idea becomes:

\`\`\`js
const user = await prisma.user.findUnique({
  where: { id: 1 },
});
\`\`\`

Prisma knows the schema, so it can provide autocomplete, generated client methods, relation helpers, and type-safe query results.

---

## 2. What Is Prisma?

Prisma is an ORM toolkit for Node.js and TypeScript.

It includes:

- **Prisma Schema:** describes database models
- **Prisma Migrate:** creates and tracks schema migrations
- **Prisma Client:** generated query client for application code
- **Prisma Studio:** visual browser for database records

Prisma is not just a database connection library. It gives a structured workflow for schema design, migrations, and type-safe queries.

Use Prisma when:

- the app has multiple models
- relationships matter
- migrations need to be tracked
- autocomplete and type safety are useful
- the team wants a consistent database workflow

Use raw SQL or query builders when:

- queries are extremely complex
- full SQL control is required
- the app is tiny and an ORM is unnecessary
- performance tuning needs hand-written SQL

---

## 3. Stack Used in This Guide

This guide uses:

- Node.js with ES modules
- Express
- Prisma ORM
- PostgreSQL
- Docker for local PostgreSQL
- \`pg\` and \`@prisma/adapter-pg\` for direct PostgreSQL connection in Prisma 7 style setup

> Prisma version details can change, so always check the official Prisma docs when setting up a new project.

---

## 4. Example Project Structure

\`\`\`text
prisma-node-demo/
  src/
    config/
      db.js
  prisma/
    schema.prisma
    migrations/
  docker-compose.yml
  prisma.config.ts
  server.js
  .env
  package.json
\`\`\`

This is only an example structure. The important pieces are:

- \`schema.prisma\` for models
- \`prisma.config.ts\` for Prisma config
- \`.env\` for database connection values
- a Prisma Client setup file
- server routes that use Prisma Client

---

## 5. Install Dependencies

\`\`\`bash
npm install express dotenv @prisma/client @prisma/adapter-pg pg
npm install --save-dev prisma @types/node
\`\`\`

Package purpose:

| Package | Purpose |
| --- | --- |
| \`express\` | HTTP server |
| \`dotenv\` | Load environment variables |
| \`@prisma/client\` | Generated Prisma Client runtime |
| \`prisma\` | Prisma CLI |
| \`pg\` | PostgreSQL driver |
| \`@prisma/adapter-pg\` | Prisma driver adapter for PostgreSQL |

---

## 6. Run PostgreSQL with Docker

Example \`docker-compose.yml\`:

\`\`\`yaml
services:
  db:
    image: postgres:15-alpine
    container_name: app_postgres
    restart: always
    environment:
      POSTGRES_DB: app_db
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_password
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer
    container_name: app_adminer
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    environment:
      ADMINER_DEFAULT_SERVER: db

volumes:
  postgres_data:
\`\`\`

Start containers:

\`\`\`bash
docker compose up -d
\`\`\`

Why map \`5433:5432\`?

- PostgreSQL inside the container listens on \`5432\`.
- The host machine can connect through \`5433\`.
- This avoids conflicts if another PostgreSQL instance already uses \`5432\`.

---

## 7. Environment Variables

Example \`.env\`:

\`\`\`env
# Local development example only
DATABASE_URL="postgresql://app_user:app_password@localhost:5433/app_db"
\`\`\`

Do not commit real production credentials.

For public examples, always use placeholder values.

---

## 8. Prisma 7 Config

In Prisma 7, the datasource URL is configured in \`prisma.config.ts\`, not inside the \`datasource\` block in \`schema.prisma\`.

Example \`prisma.config.ts\`:

\`\`\`ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
\`\`\`

Important:

- \`schema\` points to the Prisma schema file.
- \`migrations.path\` points to the migration folder.
- \`datasource.url\` reads the database URL from environment variables.

---

## 9. Prisma Schema

Example \`schema.prisma\`:

\`\`\`prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
  profile Profile?
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String  @db.VarChar(255)
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  user   User    @relation(fields: [userId], references: [id])
  userId Int     @unique
}
\`\`\`

Relationship meaning:

- One \`User\` can have many \`Post\` records.
- One \`Post\` belongs to one \`User\`.
- One \`User\` can have one \`Profile\`.
- \`Profile.userId\` is unique, so a user gets only one profile.

In Prisma 7, do not put \`url = env("DATABASE_URL")\` inside the datasource block. The URL lives in \`prisma.config.ts\`.

---

## 10. Run Migrations

Create and apply the first migration:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

Reset the database in development:

\`\`\`bash
npx prisma migrate reset
\`\`\`

Use reset carefully. It drops data and reruns migrations.

For production, use:

\`\`\`bash
npx prisma migrate deploy
\`\`\`

\`migrate deploy\` applies existing migrations without creating new ones.

---

## 11. Prisma Client Setup

Example Prisma Client setup with PostgreSQL adapter:

\`\`\`js
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});
\`\`\`

Why use the adapter?

- Prisma 7 direct database connections can use driver adapters.
- \`@prisma/adapter-pg\` connects Prisma Client to PostgreSQL through the \`pg\` driver.

---

## 12. Express Routes with Prisma

Example server:

\`\`\`js
import express from "express";
import { prisma } from "./db.js";

const app = express();

app.use(express.json());

app.get("/api/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch users" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        profile: {
          create: { bio },
        },
      },
      include: { profile: true },
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Unable to create user" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.take || 10);

    const posts = await prisma.post.findMany({
      skip,
      take,
      orderBy: { id: "asc" },
      include: { author: true },
    });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch posts" });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, authorId } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ error: "Unable to create post" });
  }
});

app.listen(4600, () => {
  console.log("Server listening on port 4600");
});
\`\`\`

Notice:

- \`findMany\` fetches many records.
- \`create\` inserts records.
- \`include\` fetches related data.
- pagination uses \`skip\` and \`take\`.
- API errors return friendly messages instead of leaking raw error details.

---

## 13. Useful Prisma Commands

| Command | Description |
| --- | --- |
| \`npx prisma migrate dev --name <name>\` | Create and apply a new development migration |
| \`npx prisma migrate deploy\` | Apply existing migrations in production |
| \`npx prisma migrate reset\` | Drop database and rerun migrations in development |
| \`npx prisma generate\` | Regenerate Prisma Client |
| \`npx prisma studio\` | Open visual database browser |
| \`docker compose up -d\` | Start Docker containers |
| \`docker compose down -v\` | Stop containers and remove volumes |

---

## 14. Common Issues and Fixes

### url property error in schema.prisma

In Prisma 7, move the datasource URL to \`prisma.config.ts\`.

### Authentication failed P1000

Common causes:

- wrong username or password
- database container still using an old volume
- connection string points to the wrong port

Development reset:

\`\`\`bash
docker compose down -v
docker compose up -d
\`\`\`

### Port conflict

If the host port is already in use, map PostgreSQL to another host port:

\`\`\`yaml
ports:
  - "5433:5432"
\`\`\`

Then update \`DATABASE_URL\`.

### Prisma Client not generated

Run:

\`\`\`bash
npx prisma generate
\`\`\`

### PrismaClient needs adapter or accelerateUrl

For direct PostgreSQL connections with driver adapters, install and configure:

\`\`\`bash
npm install @prisma/adapter-pg pg
\`\`\`

### IDs do not reset after deleting rows

This is normal PostgreSQL behavior. Deleting rows does not reset sequences.

For a development reset:

\`\`\`bash
npx prisma migrate reset
\`\`\`

---

## 15. Interview Questions

### Q1. What is the difference between findUnique, findFirst, and findMany?

- \`findUnique\`: fetches one record by a unique field such as \`id\` or \`email\`.
- \`findFirst\`: fetches the first record matching any condition.
- \`findMany\`: fetches all matching records.

\`\`\`js
await prisma.user.findUnique({
  where: { email: "user@example.com" },
});

await prisma.user.findFirst({
  where: { name: "Alex" },
  orderBy: { id: "desc" },
});

await prisma.post.findMany({
  where: { published: true },
  skip: 0,
  take: 10,
});
\`\`\`

### Q2. How does Prisma handle migrations?

Prisma tracks schema changes in migration files.

\`\`\`bash
npx prisma migrate dev --name add_user_table
npx prisma migrate deploy
npx prisma migrate reset
\`\`\`

- \`migrate dev\`: creates and applies migrations in development
- \`migrate deploy\`: applies existing migrations in production
- \`migrate reset\`: drops and recreates the database in development

### Q3. What is the N+1 problem?

N+1 happens when one query fetches records, then one extra query runs for each record.

\`\`\`js
// Avoid this pattern for relation loading
const users = await prisma.user.findMany();

for (const user of users) {
  await prisma.post.findMany({
    where: { authorId: user.id },
  });
}
\`\`\`

Better:

\`\`\`js
const users = await prisma.user.findMany({
  include: { posts: true },
});
\`\`\`

### Q4. What is the difference between include and select?

- \`include\`: adds related data.
- \`select\`: chooses exact fields to return.

\`\`\`js
await prisma.user.findMany({
  include: { posts: true },
});

await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: { title: true },
    },
  },
});
\`\`\`

### Q5. How do transactions work in Prisma?

Use \`prisma.$transaction\` when multiple operations should succeed or fail together.

\`\`\`js
const [user, post] = await prisma.$transaction([
  prisma.user.create({
    data: { email: "user@example.com" },
  }),
  prisma.post.create({
    data: { title: "Hello", authorId: 1 },
  }),
]);

await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "profile@example.com" },
  });

  await tx.profile.create({
    data: {
      bio: "Developer",
      userId: user.id,
    },
  });
});
\`\`\`

### Q6. What is update vs upsert?

- \`update\`: updates an existing record and fails if not found.
- \`upsert\`: updates if found, creates if not found.

\`\`\`js
await prisma.user.update({
  where: { id: 1 },
  data: { name: "New Name" },
});

await prisma.user.upsert({
  where: { email: "user@example.com" },
  update: { name: "Updated" },
  create: {
    email: "user@example.com",
    name: "Created",
  },
});
\`\`\`

### Q7. How do you paginate in Prisma?

Offset pagination:

\`\`\`js
await prisma.post.findMany({
  skip: 20,
  take: 10,
});
\`\`\`

Cursor pagination:

\`\`\`js
await prisma.post.findMany({
  take: 10,
  cursor: { id: lastSeenId },
  skip: 1,
  orderBy: { id: "asc" },
});
\`\`\`

Use cursor pagination for large datasets when possible.

### Q8. How do you run raw SQL safely?

Use tagged template literals:

\`\`\`js
const users = await prisma.$queryRaw\`
  SELECT * FROM "User" WHERE id = \${1}
\`;

const count = await prisma.$executeRaw\`
  UPDATE "User" SET name = 'Alex' WHERE id = \${1}
\`;
\`\`\`

Avoid string concatenation for raw SQL because it can create SQL injection risks.

### Q9. What are Prisma Client Extensions?

Client Extensions let you extend Prisma Client with custom behavior.

\`\`\`js
const prisma = new PrismaClient().$extends({
  model: {
    user: {
      async findByEmail(email) {
        return prisma.user.findUnique({
          where: { email },
        });
      },
    },
  },
});

const user = await prisma.user.findByEmail("user@example.com");
\`\`\`

Prisma Client Extensions are the modern extension mechanism for customizing Prisma Client behavior.

### Q10. How do you implement soft deletes?

Add a nullable \`deletedAt\` field:

\`\`\`prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  deletedAt DateTime?
}
\`\`\`

Instead of deleting:

\`\`\`js
await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
});

await prisma.user.findMany({
  where: { deletedAt: null },
});
\`\`\`

### Q11. migrate dev vs db push

| Topic | migrate dev | db push |
| --- | --- | --- |
| Creates migration files | Yes | No |
| Good for team projects | Yes | Not usually |
| Good for quick prototypes | Sometimes | Yes |
| Production workflow | Use migrations with deploy | No |

Use \`db push\` for quick prototyping. Use migrations for real projects.

### Q12. How do you optimize Prisma queries?

- use \`select\` to fetch only needed fields
- use cursor pagination for large datasets
- add indexes for frequently filtered columns
- use query logging to find slow queries
- use \`$queryRaw\` for complex SQL when needed

\`\`\`js
const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});
\`\`\`

\`\`\`prisma
model Post {
  id       Int @id
  authorId Int

  @@index([authorId])
}
\`\`\`

---

## 16. Final Summary

Prisma makes database work in Node.js more structured.

The main flow is:

\`\`\`text
schema.prisma -> migration -> Prisma Client -> application queries
\`\`\`

For PostgreSQL and Node.js, Prisma gives:

- type-safe queries
- readable model-based API
- migration tracking
- relation loading with \`include\` and \`select\`
- transaction support
- raw SQL escape hatch when needed

The main lesson is simple: raw SQL gives full control, but Prisma gives a safer and more productive workflow for most application-level database work.
    `,
  },
];
