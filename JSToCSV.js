import dotenv from 'dotenv';
import products from './data/sample-products.js';
import fs from 'fs';

const escapeCsvValue = (value) => {
  if (typeof value === 'string') {
    // escape double quotes
    value = value.replace(/"/g, '""');
    // wrap value in double quotes if contains: comma, double quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      value = `"${value}"`;
    }
  }
  return value;
};

const JSToCSV = () => {
  const headers = [
    'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published', 
    'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 
    'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 
    'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 
    'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 
    'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category', 'Google Shopping / Gender', 
    'Google Shopping / Age Group', 'Google Shopping / MPN', 'Google Shopping / AdWords Grouping', 
    'Google Shopping / AdWords Labels', 'Google Shopping / Condition', 'Google Shopping / Custom Product', 
    'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1', 'Google Shopping / Custom Label 2', 
    'Google Shopping / Custom Label 3', 'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit', 
    'Variant Tax Code', 'Cost per item', 'Price / International', 'Compare At Price / International', 'Status'
  ];

  const rows = [headers.map(escapeCsvValue).join(',')];

  products.forEach(product => {
    product.variants.forEach(variant => {
      const row = [
        product.handle,
        product.title,
        escapeCsvValue(product.descriptionHtml),
        product.vendor,
        '', // category
        product.productType,
        product.tags.join(', '),
        'TRUE', // published
        'Color',
        variant.selectedOptionsMap.Color,
        'Size',
        variant.selectedOptionsMap.Size,
        '', // option3 name
        '', // option3 value
        variant.sku,
        variant.weight * 1000, // convert to grams
        variant.inventoryManagement,
        variant.inventoryQuantity,
        variant.inventoryPolicy,
        'manual', // fulfillment service
        variant.price,
        variant.compareAtPrice,
        variant.requiresShipping,
        variant.taxable,
        variant.barcode,
        variant.image.src,
        1, // image position
        variant.image.altText,
        'FALSE', // gift card
        '', // seo title
        '', // seo description
        '', // google category
        '', // google gender
        '', // google age group
        '', // google mpn
        '', // google adwords grouping
        '', // google adwords labels
        '', // google condition
        '', // google custom product
        '', // google custom label 0
        '', // google custom label 1
        '', // google custom label 2
        '', // google custom label 3
        '', // google custom label 4
        '', // variant image
        'g', // weight unit
        '', // tax code
        '', // cost per item
        '', // price / international
        '', // compare at price / international
        'active' // status
      ].map(escapeCsvValue);

      rows.push(row.join(','));
    });
  });

  const csvContent = rows.join('\n');
  fs.writeFileSync('products.csv', csvContent);

  console.log('csv file created successfully');
};

JSToCSV();
