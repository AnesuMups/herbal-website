# Herbal Products Website - MVP

A full-stack web application for herbal products with medical consultation services, WhatsApp integration, and membership management.

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Additional**: WhatsApp Web.js for WhatsApp integration

## Features

- ✅ Healer Online Consultation Form (Age 18-80, Medical History, Infection Details)
- ✅ WhatsApp Integration for automated form submissions
- ✅ Membership System with Credit Card Payment
- ✅ Product Catalog (Renal & Prostate Cancer categories)
- ✅ Pricing: Family Kit ($30), Individual ($10)
- ✅ Admin Dashboard for records and reports
- ✅ Testimonials with image uploads
- ✅ User Authentication & Authorization
- ✅ Demo Accounts (Steward & Loans)
- ✅ SEO Optimized

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd HerbalWebsite
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Database Setup

The database is automatically initialized on first run. SQLite will create a `database.sqlite` file in the root directory. No additional setup is required!

### 4. Environment Configuration

Create a `.env` file in the root directory (optional - defaults will work):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (SQLite)
DB_PATH=./database.sqlite

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# WhatsApp Configuration
ENABLE_WHATSAPP=false

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Payment Gateway (optional - for production)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 5. Create Upload Directories (Optional - created automatically)

```bash
mkdir -p uploads/testimonials
mkdir -p uploads/treatments
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Accounts

The following demo accounts are pre-configured:

- **Steward Demo**: steward@demo.com (password: any - needs to be set)
- **Loans Demo**: loans@demo.com (password: any - needs to be set)

**Note**: You'll need to set passwords for demo accounts. You can do this by:
1. Registering a new account with these emails, or
2. Manually updating the password hash in the database

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Consultations
- `POST /api/consultations` - Create consultation
- `GET /api/consultations` - Get all consultations (admin)
- `GET /api/consultations/:id` - Get consultation by ID
- `PATCH /api/consultations/:id/status` - Update consultation status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)

### Memberships
- `POST /api/memberships/register` - Register membership with payment
- `GET /api/memberships/info` - Get membership info

### Testimonials
- `GET /api/testimonials` - Get approved testimonials
- `POST /api/testimonials` - Create testimonial
- `PATCH /api/testimonials/:id/approve` - Approve/reject testimonial (admin)
- `GET /api/testimonials/admin/all` - Get all testimonials (admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/treatment-records` - Create treatment record
- `GET /api/admin/treatment-records` - Get treatment records
- `GET /api/admin/reports` - Get reports

### WhatsApp
- `POST /api/whatsapp/send` - Send WhatsApp message

## WhatsApp Integration

To enable WhatsApp integration:

1. Set `ENABLE_WHATSAPP=true` in your `.env` file
2. When the server starts, scan the QR code displayed in the terminal
3. Once authenticated, WhatsApp messages will be sent automatically

**Note**: WhatsApp Web.js requires a browser instance. In production, consider using a WhatsApp Business API or similar service.

## Project Structure

```
HerbalWebsite/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── index.js           # Server entry point
├── uploads/                # Uploaded files
├── .env                    # Environment variables
├── package.json
└── README.md
```

## Security Notes

- Change the JWT_SECRET in production
- Use strong database passwords
- Implement rate limiting in production
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement proper CORS policies
- Consider implementing CSRF protection

## Payment Integration

The current implementation includes a placeholder for payment processing. For production, integrate with:
- Stripe
- PayPal
- Or your preferred payment gateway

Update the membership registration route to process actual payments.

## SEO Considerations

- Meta tags are included in `public/index.html`
- Semantic HTML structure
- Optimize images
- Add sitemap.xml
- Implement structured data (JSON-LD)
- Use proper heading hierarchy

## Future Enhancements

- [ ] Complete payment gateway integration
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] User training portal
- [ ] Multi-language support
- [ ] Advanced search functionality
- [ ] Mobile app

## Troubleshooting

### Database Connection Issues
- SQLite database is created automatically
- If you get permission errors, check file permissions in the project directory
- Database file is located at `./database.sqlite`

### WhatsApp Not Working
- Ensure `ENABLE_WHATSAPP=true` in `.env`
- Check browser/Chromium dependencies
- Verify QR code is scanned

### Port Already in Use
- Change PORT in `.env`
- Or kill the process using the port

## License

ISC

## Support

For issues and questions, please contact the development team.
