# Welcome to your project

## Project info

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply click on Share -> Publish.

## Can I connect a custom domain to my project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

## Deployment to Vercel

This application is configured for easy deployment to Vercel with both frontend and backend running together:

1. Fork or clone this repository to your own GitHub account
2. Sign up for a Vercel account at https://vercel.com if you don't have one
3. Create a new project in Vercel and import your GitHub repository
4. Set the following environment variables in your Vercel project settings:
   - `JWT_SECRET`: A secure random string used to sign JWT tokens
5. Deploy your application

The application uses the following optimizations for Vercel:
- Frontend is built statically using Vite
- API is implemented as a serverless function
- In-memory storage is used for the serverless environment (in production, you'd want to use a database)

### Vercel Environment Variables

You can set the following environment variables in your Vercel project settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | "your_jwt_secret_key" |


### Setting Up Admin Credentials

After deploying the application, you'll need to set up your admin credentials. Here's how:

1. **Generate a Password Hash**:
   - Clone the repository locally
   - Navigate to the project directory
   - Run the password hash generator:
   ```bash
   node api/generate-hash.js
   ```
   - The script will output a hashed password. Copy this hash.

2. **Update Admin Credentials**:
   - In your Vercel deployment, go to the "Storage" tab
   - Create a new file named `users.json` with the following content:
   ```json
   [{
     "id": 1,
     "username": "your_chosen_username",
     "password": "your_copied_hash",
     "role": "admin"
   }]
   ```
   - Replace `your_chosen_username` with your desired admin username
   - Replace `your_copied_hash` with the hash you generated in step 1

3. **Access the Application**:
   - Use your chosen username and the original password (not the hash) to log in
   - The password you entered when generating the hash will be your login password

Note: Keep your password secure and don't share it. The hash is safe to store, but the original password should be kept private.