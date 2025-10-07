# Web Application - E-commerce Platform

A comprehensive Node.js web application with MongoDB database featuring 8 core functionalities.

## 🚀 Features

1. **User Authentication & Authorization**
   - User registration and login
   - JWT token-based authentication
   - Password hashing with bcrypt
   - Role-based access control (user/admin)

2. **Product Management (CRUD)**
   - Create, read, update, delete products
   - Product categories and tags
   - Image upload support
   - Stock management

3. **Order Management**
   - Create orders with multiple products
   - Order status tracking
   - Shipping and billing addresses
   - Payment method selection
   - Order cancellation

4. **Review System**
   - Product reviews and ratings (1-5 stars)
   - Verified purchase badges
   - Helpful votes system
   - Review moderation

5. **Search & Filtering**
   - Full-text search across products
   - Category and brand filtering
   - Price range filtering
   - Sorting options

6. **File Upload**
   - Image upload for products
   - Multiple file support
   - File size and type validation
   - Secure file handling

7. **User Management**
   - User profiles and settings
   - Admin user management
   - Account activation/deactivation

8. **Dashboard & Analytics**
   - Overview statistics
   - Data visualization
   - Admin analytics panel

## 🛠️ Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- Express-validator for input validation

**Frontend:**
- Vanilla HTML5, CSS3, JavaScript
- Responsive design
- Font Awesome icons
- Modern UI/UX

**Security:**
- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Input validation and sanitization

## 📁 Project Structure

```
├── backend/
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Authentication & validation
│   ├── uploads/        # File upload directory
│   ├── server.js       # Main server file
│   ├── package.json    # Dependencies
│   └── .env           # Environment variables
├── frontend/
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styling
│   ├── script.js      # JavaScript functionality
│   └── package.json   # Frontend package info
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and setup backend:**
```bash
cd backend
npm install
```

2. **Configure environment:**
   Edit `.env` file with your MongoDB URI and JWT secret:
```env
MONGODB_URI=mongodb://localhost:27017/webapp
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

3. **Start the backend server:**
```bash
npm run dev
```

4. **Setup frontend:**
```bash
cd ../frontend
npm run serve
```

5. **Access the application:**
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:3001

### Default Admin User
After starting the server, you can create an admin user by registering and manually updating the user's role in MongoDB:

```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### Product Endpoints
- `GET /api/products` - Get products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

### Order Endpoints
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (auth required)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `PUT /api/orders/:id/cancel` - Cancel order (auth required)

### Review Endpoints
- `GET /api/reviews` - Get reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review (auth required)
- `PUT /api/reviews/:id` - Update review (auth required)
- `DELETE /api/reviews/:id` - Delete review (auth required)
- `PUT /api/reviews/:id/helpful` - Mark review helpful

### User Management Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### File Upload Endpoints
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files

## 🔒 Security Features

- **Authentication:** JWT-based with secure token storage
- **Authorization:** Role-based access control
- **Input Validation:** Comprehensive validation on all endpoints
- **Rate Limiting:** Prevents API abuse
- **CORS:** Configured for cross-origin requests
- **Helmet:** Security headers
- **Password Security:** bcrypt hashing with salt rounds
- **File Upload Security:** Type and size validation

## 🎨 Frontend Features

- **Responsive Design:** Mobile-first approach
- **Modern UI:** Clean and intuitive interface
- **Interactive Elements:** Dynamic forms and modals
- **Real-time Feedback:** Loading states and alerts
- **Search & Filter:** Advanced product search
- **Pagination:** Efficient data loading
- **File Upload:** Drag-and-drop support

## 🗄️ Database Schema

### User Model
- username, email, password
- firstName, lastName, role
- avatar, isActive
- timestamps

### Product Model
- name, description, price
- category, brand, stock
- images, specifications
- tags, dimensions, weight
- creator reference

### Order Model
- orderNumber, user reference
- items array with product references
- totalAmount, status
- shipping/billing addresses
- payment information
- tracking details

### Review Model
- product and user references
- rating (1-5), title, comment
- verified status, helpful count
- images, timestamps

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 for process management
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build for production
2. Deploy to web server
3. Configure CDN if needed

### Database
- Use MongoDB Atlas for cloud hosting
- Set up proper indexes
- Configure backups

## 📈 Performance Optimizations

- **Database Indexing:** Optimized queries
- **Pagination:** Efficient data loading
- **Caching:** Redis for session management
- **File Compression:** Gzip compression
- **Image Optimization:** Automatic resizing

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection:** Check connection string and network
2. **CORS Errors:** Verify frontend URL in CORS config
3. **File Uploads:** Check file permissions and size limits
4. **Authentication:** Verify JWT secret and token validity

### Development Tips
- Use MongoDB Compass for database visualization
- Enable debug logging in development
- Use Postman for API testing
- Monitor server logs for errors

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review API endpoints

---

**Happy Coding! 🎉**