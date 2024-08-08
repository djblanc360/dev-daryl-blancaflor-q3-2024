# The Beyond Group - Developer Exercise

This repo contains a skeleton theme to use when completing a developer exercise.

Before getting started, be sure to review the scripts in [`package.json`](./package.json).

+++


## Dev Workflow (npm commands)

- **Run Development Server**:
    - Start development server and watch for file changes
    
    ```
    npm run dev
    ```
    
- **Develop Locally**:
    - Add or update schema settings in local environment.
    - Example: Add a schema setting to set text color in `components/header/sections/section.liquid`.
- **Make Admin Changes**:
    - In the Shopify admin dashboard, set schema values
    - Example: set text color to red
- **Pull Changes from Shopify**:
    - Open a new terminal and pull changes from Shopify admin to ensure local environment is up to date.
    
    ```
    npm run pull
    ```
    
- **Terminate `npm run pull`**:
    - Once the pull and symlinks operations complete, terminate this second terminal / command.