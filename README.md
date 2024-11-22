
# CodePair

This project is a real-time code collaboration platform where multiple users can collaborate by creating and joining rooms using a Room ID. Users can leave comments on specific lines of code, which are displayed in the right-hand sidebar along with the name of the person who made the comment. Additionally, all users within the same room can chat with each other in real-time.

## Features

- **Real-time Code Collaboration:** Multiple users can write and edit code simultaneously.
- **Room-based Collaboration:** Users can create a room and invite others to join by sharing a unique Room ID.
- **Inline Code Comments:** Users can leave comments on individual lines of code, visible to everyone in the room.
- **Real-time Chat:** All users in the room can chat with each other through a built-in chat feature.

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js with Express.js
- **Real-Time Communication:** Socket.IO for real-time communication between clients and the server.

## How It Works

1. **Create a Room:** A user can create a new room for collaboration.
2. **Join a Room:** Other users can join the room using the provided Room ID.
3. **Collaborate on Code:** All users in the room can edit and collaborate on the code in real time.
4. **Add Comments:** Users can add comments to specific lines of code. These comments will appear on the right-hand sidebar along with the name of the user who posted it.
5. **Real-Time Chat:** Users can chat with each other via the chat panel, allowing for real-time communication during the collaboration session.

https://github.com/user-attachments/assets/89cdbec8-7cb3-4724-9006-836b69698fdd




## Project Setup

### Prerequisites

Make sure you have the following installed:
- Node.js
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gresey/CodePair.git
   cd CodePair
   ```

2. Install dependencies for both the server and client.

   **For the Server:**
   ```bash
   cd server
   npm install
   ```

   **For the Client:**
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. **Start the server**:

   ```bash
   cd server
   npm start
   ```

2. **Start the client**:

   In a separate terminal, run:

   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to start using the application.



### Contributions
Feel free to fork this repository, make your changes, and submit a pull request to contribute to the project.

