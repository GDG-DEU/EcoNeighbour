## Project Context: Carbon Footprint & Neighborhood Network
This project is a sustainability platform where users track their carbon footprint by scanning electricity and natural gas bills. It features gamification through neighborhood-based leaderboards, tree-planting equivalents, and eco-friendly routing. You are working on the **AI Service** within a Monorepo.

### 1. Document AI & OCR (Electricity & Natural Gas)
- **Data Extraction:** Extract the following fields from bill images with high precision:
    - `consumption_value` (kWh for electricity)
    - `address_data` (To identify neighborhood/district)
    - `billing_period` (Month/Year)
- **Data Normalization:** Structure extracted data into a standardized JSON format for backend consumption.

### Only work within ai_service directory. Do not modify any other directory.