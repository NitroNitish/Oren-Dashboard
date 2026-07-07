-- Create a table for standard rates
CREATE TABLE public.rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  description TEXT,
  rate NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'sq.ft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view rates" 
ON public.rates 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create rates" 
ON public.rates 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rates" 
ON public.rates 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete rates" 
ON public.rates 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rates_updated_at
BEFORE UPDATE ON public.rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();