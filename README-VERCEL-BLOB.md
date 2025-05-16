# Vercel Blob Setup Guide

This project uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for storing and serving user profile images. This guide explains how to set up Vercel Blob for both development and production environments.

## Development Mode

For local development, the application includes a mock mode that simulates Vercel Blob functionality without requiring a real token. This is useful for testing the upload flow without setting up a Vercel account or Blob store.

### Using Mock Mode

1. In your `.env.local` file, set:
   ```
   NEXT_PUBLIC_MOCK_BLOB=true
   ```

2. With this setting, the application will generate fake URLs for uploaded images instead of actually uploading to Vercel Blob.

3. You can also use a placeholder token:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_development_token
   ```

## Production Setup

For production environments, you'll need to set up a real Vercel Blob store:

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

For local development with a real Blob store, update your `.env.local` file:

```
NEXT_PUBLIC_MOCK_BLOB=false
BLOB_READ_WRITE_TOKEN=your_actual_token_here
```

For production deployment, add this environment variable in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `BLOB_READ_WRITE_TOKEN` with your token value

## Troubleshooting

### Common Issues

1. **"Access denied" or "Invalid token" Error**:
   - Make sure the `BLOB_READ_WRITE_TOKEN` is correctly set in your environment variables
   - Verify that the token has not expired
   - Check that the token has the correct permissions for your Blob store

2. **Upload Fails Without Error Message**:
   - Check your browser console for detailed error messages
   - Verify that your token has the correct permissions

3. **Size Limitations**:
   - Vercel Blob has a default file size limit of 500MB
   - Our application limits uploads to 5MB for performance reasons

### Running the Setup Script

The project includes a setup script to help configure Vercel Blob:

```bash
npm run setup-blob
```

This script will:
1. Check if you have the required environment variables
2. Guide you through setting up Vercel Blob if needed
3. Verify your configuration is working correctly

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Next.js with Vercel Blob Example](https://github.com/vercel/examples/tree/main/storage/blob-starter) 