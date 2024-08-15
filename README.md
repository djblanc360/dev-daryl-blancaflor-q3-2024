
# Shopify Architecture and Development

This project showcases my thought process in organizing various components in their function and their relationships with other components. This project reflects my ideal development process for a Shopify theme. This project is my attempt to a scalable architecture for large-scale Shopify websites.

dev store password: beyondgroupdaryl
collection page: https://beyond-group-promo-banner.myshopify.com/collections/all
product page: https://beyond-group-promo-banner.myshopify.com/products/womens-fairway-quarter-zip

## Symlink Feature

### Example Liquid File:
`header.liquid` file in `components/header/sections/` while running `npm run dev`
should create a `header.liquid` file in `sections/` then reference any changes from the `components/header/sections/header.liquid` file.

### Example JavaScript File:
`index.js` file in `components/header/index.js` while running `npm run dev`
should create a `header.js` file in `assets/` then reference any changes from the `components/header/index.js` file.

`nav.js` file in `components/header/nav.js` while running `npm run dev`
should create a `header_nav.js` file in `assets/` then reference any changes from the `components/header/nav.js` file.

## Promotions Feature
- Organized into global section, each block is a promotion.
- All promotions are stored in the window for use in admin schema settings that accept JavaScript expressions.
- All promotions are stored in local storage for persistent state.
- A promotion can accept a `utm_medium` parameter or discount code which must have either exist in the connect
- A promotion has a `condition` input for more specific logic
show this modal if a user dismissed a particular modal 3 times or more:
```
customer?.promotionHistory.has('welcome_utm') ?
(customer.promotionHistory.get('welcome_utm')).dismissed > 2
: false
```
show this modal if a user is not from the US (requires ip tracking service to have been activated)
```
customer.ipTracking.countryCode !== 'US'
```

## Modal Feature
- Organized into global section, each block is a modal.
- A modal serves as a medium to convey information.
- A modal is a generic component allowing it to render logic from various data sources: promotions, newsletter, back in stock.
- A modal is connected to a particular promotion by referencing the promotion's key.
- It has its own condtional rendering settings. `Location Type` requires that the user must be on a  particlar url or pathname. `seenCount` and `dismissedCount` can limit modal rendering based on customer history

## Customer Feature
- The customer object is stored in the window for use in admin schema settings that accept JavaScript expressions as well as its object literal counterpart which contains its functionality.
- The customer stored in local storage for persistent state.
- The customer contains the history of promotions viewed and therefore listens to user interactions with modals.
- The customer object receives third-party integration data to enrich the customer profile and allow for more logic with promotions and modals.
- The third-party service currently integrated is for tracking the user's ip for location-based modal logic.

## Added Dependencies

### Frontend
- **swiper**: For thumnail carousel / main image in media gallery and for Collection section.

### Symlink Build
- **concurrently**: JavaScript runtime.
- **chokidar**: To simplify file watching cross platform.
- **@vituum/vite-plugin-liquid**: Plugin for processing liquid

### Backend
- **node-fetch**: Fetch API for Node.js
- **express.js**: Web framework for Node.js.
- **cors**: Cross origin sharing
- **dotenv**: For managing environment variables.

## Dev Workflow (npm commands)

- **Develop Locally**:
Set up  fsPromise symlink feature to facilitate the creation of new components in this component based architecture. 

Files created in components directory will be auto linked to their respective shopify theme location. scripts will be auto included in `main.js` and added to assets/ directory.
```
npm run dev
```

- **Pull Changes from Shopify**:
Set up `npm run pull` to run in a new terminal alongside `npm run dev` to pull in changes by an admin in the Shopify editor. `npm run pull` will only pull from templates/ directory to no interfere with symlinked files.

- **Pull 3rd Party Integration Data from Service**:
Set up `npm run server` to concurrently run a backend service. The backend service retrieves the user's ip data to enrich their customer profile.

## Future Updates

* create a `utilities/` directory where `symlinks.js` will bundle each file in folder to a single `utils.js` file in `assets/` directory

* refactor `components/modals/index.js` to have promotions logic in separate `components/modals/promotions.js`

* create `/integrations` directory to organize 3rd-party services

* create an interface API (BFF architecture) to translate and structure data coming form 3rd-party services

* finish observer pattern for PDP