# Sales Registry Implementation Plan

## Context
This app targets entrepreneurs (emprendedores) in Latin America who may have multiple businesses ("negocios") and multiple types of activities (selling products, services, consulting). The sales registry must be flexible enough to track diverse income streams while remaining simple to use.

## Current Schema
- Only `User` model exists with: id, name, email, passwordHash, role, createdAt

## Proposed Schema Extension

### Models to Add

#### 1. `Business` (Negocio)
Represents an entrepreneur's business. Users can have multiple businesses.
```
- id, name, description, logoUrl, address, phone
- isActive (soft delete)
- userId → User (relation)
- activities, products, sales (relations)
```

#### 2. `Activity` (Actividad)
Categories/types of work within a business (e.g., "Venta de plantas", "Mentoría", "Branding").
```
- id, name, description, icon, color, isActive
- businessId → Business (relation)
- products (relation)
```

#### 3. `Product`
Products or services sold.
```
- id, name, description, sku
- basePrice, cost, unit (unidad/kilo/hora/sesión)
- imageUrl, isActive
- minPrice, maxPrice (for price assistant AI)
- businessId → Business, activityId → Activity (optional)
```

#### 4. `PaymentMethod` (Model, not Enum)
Allows custom payment methods (Cash, Card, Transfer, Wallet like Nequi/Daviplata, Other).
```
- id, name, type (PaymentType enum), icon
- isActive, isDefault, sortOrder
```

#### 5. `Sale`
Main sale transaction with full financial breakdown.
```
- id, invoiceNumber (optional sequential)
- status (SaleStatus enum: PENDIENTE → CONFIRMADO → COBRADO → CANCELADO → REEMBOLSADO)
- subtotal, taxAmount, totalAmount
- customerName, customerPhone, customerEmail
- locationAddress, locationCity, locationState, latitude, longitude
- channel (SaleChannel enum: WHATSAPP, INSTAGRAM, WEB, TIENDA, PERSONAL, OTRO)
- notes, createdAt, updatedAt, completedAt
- businessId → Business, paymentMethodId → PaymentMethod
- items (relation)
```

#### 6. `SaleItem`
Line items within a sale.
```
- id, quantity (Decimal for fractional sales like 1.5 kilos)
- unitPrice (price at time of sale), discount, subtotal
- notes (e.g., "Color azul")
- saleId → Sale (Cascade delete), productId → Product
```

### Enums
```
SaleStatus: PENDIENTE, CONFIRMADO, COBRADO, CANCELADO, REEMBOLSADO
SaleChannel: WHATSAPP, INSTAGRAM, WEB, TIENDA, PERSONAL, OTRO
PaymentType: CASH, CARD, TRANSFER, WALLET, OTHER
```

## Implementation Order

1. **Phase 1: Core Setup**
   - Add enums (SaleStatus, SaleChannel, PaymentType)
   - Add PaymentMethod model
   - Add Business model with User relation
   - Add Activity model with Business relation

2. **Phase 2: Products & Sales**
   - Add Product model
   - Add Sale model
   - Add SaleItem model

3. **Phase 3: Extras (Optional)**
   - PriceSuggestion model (for price assistant)
   - SaleAttachment model (receipts, contracts)

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Payment Method | Model (not enum) | Entrepreneurs need custom methods; Nequi/Daviplata common in LATAM |
| Location | Embedded in Sale | GPS coordinates + address; denormalized for historical accuracy |
| Sale Items | Separate model | Supports multiple products per sale; price locked at time of sale |
| Business-User | 1:N | One user → multiple businesses (common for entrepreneurs who diversify) |
| Status Flow | PENDIENTE → CONFIRMADO → COBRADO | Matches existing frontend pattern |

## Files Modified
- `backend/prisma/schema.prisma` - Added all new models and enums
- `backend/prisma.config.ts` - Already existed with datasource url config (Prisma 7 requirement)

## Notes
- Prisma 7 requires `url` in `prisma.config.ts` not in `schema.prisma` - this was already configured
- Schema validated successfully with `node ./node_modules/prisma/build/index.js validate`

## Verification
```bash
cd backend && node ./node_modules/prisma/build/index.js generate
```