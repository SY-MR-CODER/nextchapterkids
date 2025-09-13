#!/bin/bash

echo "🚀 Deploying NextChapterKids to Vercel..."

# Deploy to production
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at:"
echo "   - https://nextchapterkids.com"
echo "   - https://www.nextchapterkids.com"
echo ""
echo "📝 Don't forget to:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Update DNS records at your domain registrar"
echo "   3. Wait for DNS propagation (up to 48 hours)"