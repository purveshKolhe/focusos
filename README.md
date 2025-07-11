# FocusOS

A gamified study platform with AI-powered assistance.

Created and maintained by **Purvesh Kolhe**  
Initial concept, design, and codebase built from March–May 2025.  
This is a private project. Contributors joined after core architecture.


## Setup Instructions

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firestore Database
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Save the downloaded JSON file as `serviceAccountKey.json` in the project root

3. Run the application:
```bash
python app.py
```

## Features

- User authentication with Firebase
- Pomodoro timer with customizable work/break durations
- Progress tracking with XP and levels
- Achievement badges
- AI-powered study assistant (Daphinix)
- To-do list management
- Ambient sounds and customizable backgrounds
- Focus mode

## Security Notes

- Never commit `serviceAccountKey.json` to version control
- Keep your Firebase credentials secure
- If credentials are compromised, generate new ones immediately

## Development

The application uses:
- Flask for the backend
- Firebase for data storage
- Google's Generative AI for the study assistant
- Tailwind CSS for styling


FocusOS is a proprietary closed-source project created solely by Purvesh Kolhe. All contributors joined post-alpha and no part of this project may be used in external competitions without written permission.
