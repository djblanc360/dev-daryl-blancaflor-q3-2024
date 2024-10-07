
# Shopify Architecture and Development

This project showcases my thought process in organizing various components in their function and their relationships with other components. This project reflects my ideal development process for a Shopify theme. This project is my attempt to a scalable architecture for large-scale Shopify websites.

dev store password: beyondgroupdaryl

## Symlink Feature
* Created a `utilities/` directory where `symlinks.js` will bundle each file in folder to a single `utils.js` file in `assets/` directory

### Example Liquid File:
`header.liquid` file in `components/header/sections/` while running `npm run dev` should create a `header.liquid` file in `sections/`. The origin is set to the newly created `sections/header.liquid`. Then a symlink is created to reference any changes from the `components/header/sections/header.liquid` file.

### Example JavaScript File:
`index.js` file in `components/header/index.js` while running `npm run dev`
should create a `header.js` file in `assets/`. The origin is set to the newly created `assets/header.js`. Then a symlink is created to reference any changes from the `components/header/index.js` file.

`nav.js` file in `components/header/nav.js` while running `npm run dev`
should create a `header_nav.js` file in `assets/`. The origin is set to the newly created `assets/header_nav.js`. Then a symlink is created to  reference any changes from the `components/header/nav.js` file.

The content of `polling.js` file in `utilities/` directory is bundled into `utils.js` file in `assets/` directory.

### Example Development to Production Process
1.
run `npm run dev`
- Create file `components/sections/product.liquid` is moved to `sections/product.liquid`, the reference to the origin `components/sections/product.liquid` is saved. 
- `sections/product.liquid` becomes the new origin and the reference to the `components/sections/product.liquid` origin is retrieved.
- A symbolic link `sections/product.liquid` from `components/sections/product.liquid` is created.
- when pushing to github ,`sections/product.liquid` has the code and `components/sections/product.liquid` has the reference to `sections/product.liquid`.

2.
run `npm run pull`
- Section schema is created in `components/sections/product.liquid`.
- The contents of a particular section using that schema is updated in the Shopify Admin.
- In another terminal, run the command to retrieve the updated cusom settings.
- When viewing on shopify store, will just see a string local file reference to `components/sections/product.liquid`.

3.
on `npm run build` or `shopify theme share`
- Run `reverse-symlinks.js`.
- So now `sections/product.liquid` has the code and `components/sections/product.liquid` has the reference to `sections/product.liquid`.
- When viewing on shopify store, should see actual content of `product.liquid`.


## Promotions Feature
- Organized into global section, each block is a promotion.
- All promotions are stored in the window for use in admin schema settings that accept JavaScript expressions.
- All promotions are stored in local storage for persistent state.
- A promotion can accept a `utm_medium` parameter or discount code which must have either exist in the connect.
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

## Utilities Feature
- Created a `utilities/` directory where `symlinks.js` will use supporting plugin from `bundler.js` to bundle each file in the folder to a single `utils.js` file in `assets/` directory.
- Changes in the `utilities/` directory will update the `utils.js`.

## Added Dependencies

### Frontend
- **swiper**: For thumnail carousel / main image in media gallery and for Collection section.

### Symlink Build
- **concurrently**: JavaScript runtime.
- **chokidar**: To simplify file watching cross platform.

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

* refactor `components/modals/index.js` to have promotions logic in separate `components/modals/promotions.js`

* create `integrations/` directory to organize 3rd-party services

* create symlink process for `.css` files in the `components/` directory

* create an interface API (BFF architecture) to translate and structure data coming form 3rd-party services

* finish observer pattern for PDP