# DL Model Builder

A web-based application for building deep learning models through an intuitive drag-and-drop interface. Design neural network architectures visually and export production-ready TensorFlow code.

## Features

### Public Access

- Browse and explore the application without authentication
- Access the Home page with project information
- Build deep learning models using the drag-and-drop interface
- Configure layers, training parameters, and model settings
- View the About page for more information

### Authenticated Features

- Export generated TensorFlow code (requires login)
- Access User Settings page
- Save and manage your models
- Persistent user preferences

## Project Structure

```
web_eng_project/
├── src/
│   ├── components/
│   │   ├── About.jsx              # About page component
│   │   ├── Auth.css               # Authentication styles
│   │   ├── BuildModels.jsx        # Drag-and-drop model builder
│   │   ├── Home.jsx               # Landing page
│   │   ├── HyperspeedBackground.jsx # Animated background
│   │   ├── Login.jsx              # Login form
│   │   ├── Navbar.jsx             # Navigation bar
│   │   ├── Signup.jsx             # Registration form
│   │   └── UserSettings.jsx       # User settings (auth required)
│   ├── utils/
│   │   └── config.jsx             # Backend configuration
│   ├── App.jsx                    # Main application component
│   ├── App.css                    # Global styles
│   ├── index.css                  # Root styles
│   └── main.jsx                   # Application entry point
├── WebDevbackend/
│   ├── models/
│   │   └── User.js                # User data model
│   ├── routes/
│   │   ├── auth.js                # Authentication routes
│   │   ├── codegen.js             # Code generation routes
│   │   └── users.js               # User management routes
│   ├── utils/
│   │   └── logger.js              # Logging utility
│   └── index.js                   # Backend server entry point
├── public/                        # Static assets
├── package.json                   # Frontend dependencies
└── vite.config.js                 # Vite configuration

```

## Technology Stack

### Frontend

- React 18 - UI framework
- Vite - Build tool and development server
- CSS3 - Styling with custom animations
- Lucide React - Icon library

### Backend

- Node.js - Runtime environment
- Express.js - Web application framework
- MongoDB - Database for user data
- JWT - Authentication tokens

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Frontend Setup

1. Clone the repository:

```bash
git clone https://github.com/Overproness/web_eng_project.git
cd web_eng_project
```

2. Install dependencies:

```bash
npm install
```

3. Configure backend URL in `src/utils/config.jsx`:

```javascript
export const backend_url = "http://localhost:5000";
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:

```bash
cd WebDevbackend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Start the backend server:

```bash
npm start
```

The backend will be available at `http://localhost:5000`

## Usage

### Building Models (No Authentication Required)

1. Navigate to the "Build Models" page
2. Drag layers from the left palette onto the canvas
3. Configure layer parameters in the right panel
4. Adjust training and evaluation settings
5. Organize layers by moving them up or down
6. Remove layers as needed

### Exporting Code (Authentication Required)

1. Build your model architecture
2. Click the "Export Code" button
3. If not logged in, you'll be prompted to login
4. After authentication, view the generated TensorFlow code
5. Copy the code to clipboard for use in your projects

### Layer Categories

**Convolutional Layers**

- Conv2D - 2D convolutional layer
- MaxPooling2D - Max pooling operation
- AvgPooling2D - Average pooling operation
- SeparableConv2D - Depthwise separable convolution

**Core Layers**

- Dense - Fully connected layer
- Flatten - Flattens input
- Dropout - Regularization layer
- Input - Input layer definition

**Activation Layers**

- ReLU - Rectified Linear Unit
- Softmax - Softmax activation
- Sigmoid - Sigmoid activation
- Tanh - Hyperbolic tangent activation

### Configuration Options

**Input Configuration**

- Input shape specification
- Data preprocessing (normalize, standardize)
- Data augmentation toggle

**Training Configuration**

- Train/test split ratio
- Validation split ratio
- Number of epochs
- Batch size
- Optimizer selection (Adam, SGD, RMSprop, Adagrad)
- Learning rate
- Loss function

**Output Configuration**

- Evaluation metrics (accuracy, precision, recall, F1)
- Test set evaluation toggle
- Model saving options
- Model naming

## Authentication

### Registration

1. Click "Sign Up" in the navigation bar
2. Enter your name, email, and password
3. Submit the form to create your account
4. You'll be automatically logged in after registration

### Login

1. Click "Login" in the navigation bar
2. Enter your email and password
3. Submit the form to access authenticated features

### Protected Features

- User Settings page - Only accessible when logged in
- Export Code functionality - Requires authentication
- All other pages are publicly accessible

## API Endpoints

### Authentication

- `POST /auth/register` - Create a new user account
- `POST /auth/login` - Authenticate and receive JWT token

### Code Generation

- `POST /codegen/generate` - Generate TensorFlow code from model architecture

### User Management

- `GET /users/profile` - Retrieve user profile (authenticated)
- `PUT /users/profile` - Update user profile (authenticated)

## Development

### Frontend Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development

```bash
npm start            # Start the server
npm run dev          # Start with nodemon (auto-reload)
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of a web engineering course and is available for educational purposes.

## Contact

Project Link: [https://github.com/Overproness/web_eng_project](https://github.com/Overproness/web_eng_project)

## Acknowledgments

- TensorFlow documentation for model architecture references
- React community for component patterns
- Vite team for the excellent build tool
