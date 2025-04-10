# API Documentation

## API Endpoints

### Referrals

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/referrals` | Create a new referral to a hospital (and optionally a doctor) | Private/Doctor |
| GET | `/api/referrals/patient` | Get all referrals for current patient | Private |
| GET | `/api/referrals/referring` | Get all referrals made by current doctor | Private/Doctor |
| GET | `/api/referrals/referred` | Get all referrals to current doctor | Private/Doctor |
| GET | `/api/referrals/:id` | Get referral by ID | Private* |
| PUT | `/api/referrals/:id/status` | Update referral status | Private/Doctor |
| POST | `/api/referrals/:id/appointment` | Create appointment from referral | Private/Doctor |
