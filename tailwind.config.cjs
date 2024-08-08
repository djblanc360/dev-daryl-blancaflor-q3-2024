/** @type {import('tailwindcss').Config} */
module.exports = {
  // prefix: 'tw-',
  content: [
    './**/*.liquid',
    './frontend/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#25293b',
        'secondary': '#989898',
        'black': '#000000',
        'grey': '#808080',
        'ivory': '#FFFFF0',
        'vintage-navy': '#001F3F',
        'white': '#FFFFFF',
        'heather-grey': '#B0B0B0',
        'dry-sage': '#B2AC88',
        'dark-taupe': '#483C32',
        'shell': '#F3E5AB',
        'navy': '#000080',
        'driftwood': '#9E7E5C',
        'ash': '#B2BEB5',
        'willow': '#8A9A5B',
        'sea': '#2E8B57',
        'dune': '#D2B48C',
        'cadet': '#5F9EA0',
        'storm': '#708090',
        'palm': '#0C5C3E',
        'red-clay': '#9E453C',
        'dark-charcoal': '#333333',
        'coffee': '#6F4E37',
        'latte': '#D3AE70',
        'vintage-clay': '#B66A50'
      }
    }
  },
  safelist: [
    'bg-black',
    'bg-grey',
    'bg-ivory',
    'bg-vintage-navy',
    'bg-white',
    'bg-heather-grey',
    'bg-dry-sage',
    'bg-dark-taupe',
    'bg-shell',
    'bg-navy',
    'bg-driftwood',
    'bg-ash',
    'bg-willow',
    'bg-sea',
    'bg-dune',
    'bg-cadet',
    'bg-storm',
    'bg-palm',
    'bg-red-clay',
    'bg-dark-charcoal',
    'bg-coffee',
    'bg-latte',
    'bg-vintage-clay',
    { pattern: /grid-cols-(\d+)/, variants: ['md', 'lg', 'xl'] }
  ],
  plugins: []
}
