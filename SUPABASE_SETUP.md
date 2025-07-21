# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the API settings

## 2. Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 3. Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Create uploaded_files table to track file uploads
CREATE TABLE uploaded_files (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- For future auth
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  row_count INTEGER NOT NULL,
  time_granularity TEXT DEFAULT 'daily', -- 'daily', 'hourly', '15min'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_data table to store the actual sales records
CREATE TABLE sales_data (
  id BIGSERIAL PRIMARY KEY,
  file_id BIGINT REFERENCES uploaded_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- For future auth
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL, -- Flexible for any time granularity
  sales DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sales_data_timestamp ON sales_data(timestamp);
CREATE INDEX idx_sales_data_user_id ON sales_data(user_id);
CREATE INDEX idx_sales_data_file_id ON sales_data(file_id);
CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_time_granularity ON uploaded_files(time_granularity);

-- Enable Row Level Security
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (we'll restrict this when auth is added)
CREATE POLICY "Allow all operations on uploaded_files" ON uploaded_files
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on sales_data" ON sales_data
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_uploaded_files_updated_at 
  BEFORE UPDATE ON uploaded_files 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_data_updated_at 
  BEFORE UPDATE ON sales_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some basic constraints
ALTER TABLE sales_data ADD CONSTRAINT sales_positive CHECK (sales >= 0);
ALTER TABLE uploaded_files ADD CONSTRAINT valid_granularity CHECK (time_granularity IN ('daily', 'hourly', '15min'));
```

## 4. Test the Setup

1. Start your development server: `pnpm dev`
2. Go to the upload page
3. Upload a CSV file with date and sales columns
4. Check your Supabase dashboard to see the input data being stored
5. The forecast results will still use mock data (until the ML model is implemented)

## 5. Future Authentication Setup

When you're ready to add authentication:

1. Enable Supabase Auth in your project settings
2. Update the RLS policies to restrict access by user_id
3. Add authentication UI components
4. Update the database service to include user_id in all operations

## Database Schema Overview

### uploaded_files table
- `id`: Unique identifier for each uploaded file
- `user_id`: Links to auth.users (for future multi-user support)
- `filename`: Original filename
- `file_size`: File size in bytes
- `row_count`: Number of data rows processed
- `time_granularity`: Data granularity ('daily', 'hourly', '15min')
- `created_at`/`updated_at`: Timestamps

### sales_data table
- `id`: Unique identifier for each sales record
- `file_id`: Links to uploaded_files table
- `user_id`: Links to auth.users (for future multi-user support)
- `timestamp`: Flexible timestamp for any time granularity
- `sales`: Sales amount (must be positive)
- `created_at`/`updated_at`: Timestamps

## Future Schema Extensions (Easy to Add Later)

```sql
-- When you need to store model outputs:
CREATE TABLE forecast_results (
  id BIGSERIAL PRIMARY KEY,
  file_id BIGINT REFERENCES uploaded_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  forecast_value DECIMAL(15,2) NOT NULL,
  confidence_interval_lower DECIMAL(15,2),
  confidence_interval_upper DECIMAL(15,2),
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- When you need to track model metadata:
CREATE TABLE model_runs (
  id BIGSERIAL PRIMARY KEY,
  file_id BIGINT REFERENCES uploaded_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  parameters JSONB, -- Store model parameters
  training_duration INTERVAL,
  accuracy_metrics JSONB,
  status TEXT DEFAULT 'completed', -- 'running', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

This schema supports:
- ✅ Multiple users (future authentication)
- ✅ File tracking and metadata
- ✅ Efficient querying with indexes
- ✅ Data integrity with foreign keys
- ✅ Automatic timestamp management
- ✅ Input data storage for ML model training
- ✅ Historical data persistence
- ✅ Flexible time granularities (daily/hourly/15min)
- ✅ Easy to extend for model outputs and metadata 