# NextChapterKids 📚✨

> AI-powered personalized children's stories that make your child the hero of their own magical adventure!

![NextChapterKids](https://img.shields.io/badge/NextChapterKids-Live-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

- **🎯 Personalized Stories**: Create unique stories featuring your child as the hero
- **🤖 AI-Powered**: Uses OpenAI's GPT to generate creative, age-appropriate content  
- **🎨 50+ Adventure Themes**: From fantasy kingdoms to space adventures, ninja quests to bakery magic
- **📖 Reading Levels**: Adapts content complexity based on child's reading ability
- **🎪 Beautiful Interface**: Kid-friendly design with colorful animations and emojis
- **📚 Story Library**: Save and revisit favorite stories
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🚀 Fast & Secure**: Built with modern web technologies

## 🎭 Adventure Themes (50+)

Choose from an incredible variety of themes:
- 🏰 Fantasy Kingdom, 🚀 Space Adventure, 🌊 Underwater World
- 🥷 Ninja Quest, 🧙‍♂️ Wizard School, 👸 Princess Castle
- 🤖 Robot World, 🐅 Jungle Safari, 🎪 Circus Fun
- 🔬 Inventor Lab, 🎨 Art Studio, 🍭 Candy Land
- And 38+ more magical themes!

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT API
- **Authentication**: JWT tokens with bcrypt
- **Deployment**: Vercel
- **Styling**: Custom CSS with animations and gradients

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nextchapterkids.git
   cd nextchapterkids
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   JWT_SECRET=your_random_jwt_secret_here
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all environment variables from your `.env` file

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Custom Domain Setup
1. Add your domain in Vercel dashboard
2. Update DNS records at your domain registrar
3. Wait for DNS propagation (up to 48 hours)

## 📁 Project Structure

```
nextchapterkids/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment config
├── supabase-schema.sql   # Database schema
├── .env.example          # Environment variables template
└── public/               # Frontend files
    ├── index.html        # Main application
    ├── app.js           # Main JavaScript logic
    ├── styles.css       # Main styles
    ├── story-reader.html # Story reading interface
    ├── story-reader.js  # Story reader logic
    └── story-reader.css # Story reader styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for story generation | ✅ |
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `JWT_SECRET` | Random string for JWT token signing | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

### API Keys Setup

1. **OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account and generate an API key
   - Add billing information (required for API usage)

2. **Supabase Setup**
   - Visit [Supabase](https://supabase.com/)
   - Create a new project
   - Get your project URL and anon key from Settings > API

## 🎨 Customization

### Adding New Adventure Themes
1. Add new theme button in `public/index.html`
2. Add theme prompt in `public/app.js` adventurePrompts object
3. Add theme description in `server.js` adventureDescriptions object

### Styling
- Main styles: `public/styles.css`
- Story reader styles: `public/story-reader.css`
- Uses CSS Grid, Flexbox, and custom animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Supabase for the database infrastructure
- Vercel for hosting and deployment
- All the parents and children who inspire magical storytelling

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/nextchapterkids/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/yourusername/nextchapterkids/issues)
- 📧 **Email**: support@nextchapterkids.com

---

<div align="center">
  <p>Made with ❤️ for children and parents everywhere</p>
  <p>🌟 <strong>NextChapterKids</strong> - Where every child is the hero of their own story! 🌟</p>
</div>