import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/lib/productGenerator';

// Define form schema with validations
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  inStock: z.boolean().default(true),
  sizes: z.array(z.string()).min(1, 'At least one size is required'),
  rating: z.coerce.number().min(0).max(5).default(5),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Available product categories
const categories = [
  'T-Shirts', 
  'Jackets', 
  'Pants', 
  'Dresses', 
  'Shoes'
];

// Available sizes
const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const shoeSizes = ['6', '7', '8', '9', '10', '11', '12'];

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [availableSizes, setAvailableSizes] = useState<string[]>(clothingSizes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or existing product
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      ...product,
      sizes: product.sizes || [],
    } : {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
      inStock: true,
      sizes: [],
      rating: 5.0,
    },
  });

  // Update available sizes when category changes
  const watchCategory = form.watch('category');
  
  useEffect(() => {
    if (watchCategory === 'Shoes') {
      setAvailableSizes(shoeSizes);
      
      // Clear the selected sizes if they're not shoe sizes
      const currentSizes = form.getValues('sizes');
      const validShoeSizes = currentSizes.filter(size => shoeSizes.includes(size));
      
      if (validShoeSizes.length !== currentSizes.length) {
        form.setValue('sizes', validShoeSizes);
      }
    } else {
      setAvailableSizes(clothingSizes);
      
      // Clear the selected sizes if they're not clothing sizes
      const currentSizes = form.getValues('sizes');
      const validClothingSizes = currentSizes.filter(size => clothingSizes.includes(size));
      
      if (validClothingSizes.length !== currentSizes.length) {
        form.setValue('sizes', validClothingSizes);
      }
    }
  }, [watchCategory, form]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // Create a complete product object with all required fields
      const productData: Product = {
        id: product?.id || uuidv4(),
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        imageUrl: values.imageUrl,
        inStock: values.inStock,
        sizes: values.sizes,
        rating: values.rating
      };
      
      onSave(productData);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        className="pl-7" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a valid URL for the product image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* In Stock */}
            <FormField
              control={form.control}
              name="inStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>In Stock</FormLabel>
                    <FormDescription>
                      Indicates if this product is currently available
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            {/* Product Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Available Sizes */}
            <FormField
              control={form.control}
              name="sizes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Available Sizes</FormLabel>
                    <FormDescription>
                      Select all available sizes for this product
                    </FormDescription>
                  </div>
                  {availableSizes.map((size) => (
                    <FormField
                      key={size}
                      control={form.control}
                      name="sizes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={size}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(size)}
                                onCheckedChange={(checked) => {
                                  const currentSizes = [...field.value];
                                  if (checked) {
                                    field.onChange([...currentSizes, size]);
                                  } else {
                                    field.onChange(
                                      currentSizes.filter((value) => value !== size)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {size}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (0-5)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.1" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Product rating from 0 to 5 stars
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : (
              product ? 'Update Product' : 'Create Product'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm; 