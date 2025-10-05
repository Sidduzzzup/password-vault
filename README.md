# 🔐 Password Vault

Password Vault is a secure web application for managing your passwords safely. It features a powerful password generator that creates strong, random passwords with customizable length and character types. All your passwords are encrypted using AES-256 encryption before being stored in a MongoDB database. The application includes user authentication with JWT tokens stored in secure HTTP-only cookies. You can easily search through your saved passwords, add new entries, edit existing ones, and copy passwords with an auto-clear feature that clears your clipboard after 15 seconds for security. Built with Next.js 14, React, TypeScript, and Tailwind CSS, this modern password manager provides a clean, responsive interface that works on both desktop and mobile devices. Simply create an account, start generating strong passwords, and save them to your encrypted vault.

## Tech Stack

- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS
- MongoDB Atlas
- JWT Authentication
- AES-256 Encryption
- bcrypt Password Hashing

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/password-vault.git

# Install dependencies
npm install

# Configure environment variables
# Create .env.local file and add:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# Run development server
npm run dev
```

## Usage

1. Open http://localhost:3000
2. Sign up for a new account
3. Generate strong passwords
4. Save them to your encrypted vault
5. Search, edit, or delete passwords anytime

## Security Features

- AES-256 encryption for all passwords
- bcrypt hashing for user passwords
- HTTP-only cookies for JWT tokens
- Auto-clear clipboard after 15 seconds
- Protected API routes

## License

MIT
