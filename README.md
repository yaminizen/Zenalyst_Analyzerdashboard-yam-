# Zenalyst Analyzer Dashboard

A modern web application for analyzing and visualizing JSON data files stored in AWS S3.

## Features

- Browse and view JSON files from AWS S3 bucket
- Interactive data tables with sorting and pagination
- Data visualization with dynamic charts
- Responsive UI with React and Bootstrap
- Real-time data fetching from S3

## Tech Stack

### Frontend
- React 19 with Vite
- React Router for navigation
- Bootstrap 5 for UI components
- Recharts & Plotly.js for data visualization
- Axios for API calls

### Backend
- Spring Boot 3.1.3
- AWS SDK for S3 integration
- Maven for dependency management
- CORS enabled for frontend integration

## Prerequisites

- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- AWS Account with S3 bucket access

## Setup Instructions

### 1. Configure AWS Credentials

Copy the example environment file and add your AWS credentials:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your AWS credentials:
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
SERVER_PORT=8080
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
mvn clean install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Run the Application

#### Start Backend Server
```bash
cd backend
mvn spring-boot:run
```
The backend will start on http://localhost:8080

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:5173

## API Endpoints

- `GET /files` - List all JSON files from S3 bucket
- `GET /data?filename={filename}` - Get content of a specific JSON file

## Project Structure

```
.
├── backend/                # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/      # Java source code
│   │       └── resources/ # Application properties
│   ├── pom.xml            # Maven configuration
│   └── .env.example       # Environment variables template
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── layouts/      # Layout components
│   │   ├── routes/       # Page components
│   │   └── assets/       # Images and styles
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite configuration
│
└── README.md             # This file
```

## Security Notes

- Never commit `.env` files with real credentials
- Use environment variables for sensitive data
- The `.gitignore` file is configured to exclude sensitive files
- AWS credentials should have minimal required permissions (S3 read access only)

## License

This project is proprietary and confidential.