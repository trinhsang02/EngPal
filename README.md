# EngPal - Your English Learning Companion 👋

This is an [Expo](https://expo.dev) project designed to help users learn English vocabulary effectively. It features a built-in Oxford Dictionary, vocabulary management, and learning exercises.

## 🚀 Get Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo Go](https://expo.dev/go) app on your mobile device (for testing) or an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)/[iOS simulator](https://docs.expo.dev/workflow/ios-simulator/).

### 1. Install Dependencies

First, navigate to the project's root directory and install the necessary npm packages.

```bash
npm install
```

### 2. Build the Vocabulary Database

The project uses a local SQLite database built from Oxford Dictionary JSON files. You need to run a script to generate this database file. This step is only required once, or whenever the source JSON files are updated.

```bash
npm run build-database
```

This command will:
1.  Read all JSON files from `assets/json/oxford_words/`.
2.  Create and populate a SQLite database file at `assets/database/oxford_words.db`.
3.  This database is then bundled with the app for offline use.

### 3. Start the Application

Once the setup is complete, you can start the development server.

```bash
npx expo start
```

This will open the Expo development server. You can then scan the QR code with the Expo Go app on your phone or run the app on an emulator/simulator.

## Project Structure

-   **`app/`**: Contains all the screens and navigation logic, using [Expo's file-based routing](https://docs.expo.dev/router/introduction).
-   **`assets/`**: Static assets like images, fonts, and the vocabulary database.
    -   `assets/database/`: Stores the generated SQLite database.
    -   `assets/json/oxford_words/`: Source JSON files for the dictionary.
-   **`components/`**: Reusable UI components used across the app.
-   **`hooks/`**: Custom React hooks, including `useOxfordDatabase` for interacting with the database.
-   **`services/`**: Services that handle logic, such as `oxfordDatabase.ts` for database operations.
-   **`scripts/`**: Node.js scripts for project maintenance, like building the database.

## Learn More

To learn more about developing your project with Expo, look at the following resources:

- [Expo Documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the Community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord Community](https://chat.expo.dev): Chat with Expo users and ask questions.
