# Setting Up Vercel Blob for Image Storage

This project uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for storing and serving user profile images. Follow these steps to set up Vercel Blob for your development and production environments.

## Prerequisites

- A Vercel account
- Your project deployed on Vercel (for production)

## Setup Instructions

### 1. Install the Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Login to Vercel CLI

```bash
vercel login
```

### 3. Create a Vercel Blob Store

If you've already deployed your project to Vercel, you can add a Blob store to your project:

```bash
vercel storage add
```

Select "Blob" when prompted for the storage type, and follow the instructions to create a new Blob store.

### 4. Get Your Blob Read/Write Token

After creating the Blob store, you can get your read/write token with:

```bash
vercel env pull
```

This will create or update your `.env.local` file with the necessary environment variables.

Alternatively, you can get the token from the Vercel dashboard:

1. Go to your project on the Vercel dashboard
2. Navigate to "Storage" → "Blob"
3. Click on your Blob store
4. Copy the "Read/Write Token"

### 5. Configure Environment Variables

Make sure your `.env.local` file contains the following:

```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

For production, add this environment variable in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `BLOB_READ_WRITE_TOKEN` with your token value

### 6. Testing the Upload Functionality

After setting up the environment variables, you should be able to upload images through the profile photo upload form in the onboarding process.

## Troubleshooting

### Common Issues

1. **"No token found" Error**:
   - Make sure the `BLOB_READ_WRITE_TOKEN` is correctly set in your environment variables
   - Restart your development server after adding the environment variable

2. **Upload Fails Without Error Message**:
   - Check your browser console for detailed error messages
   - Verify that your token has the correct permissions

3. **Size Limitations**:
   - Vercel Blob has a default file size limit of 500MB
   - Our application limits uploads to 5MB for performance reasons

### Getting Help

If you continue to experience issues, check the [Vercel Blob documentation](https://vercel.com/docs/storage/vercel-blob) or open an issue in the project repository. 