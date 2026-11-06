# Assignment 12 – ShopEase E-commerce

## Run
1. Install Node.js (18 or newer).
2. Open this folder in VS Code.
3. Run `npm install`
4. Run `npm run dev`
5. Open the localhost URL printed in the terminal.

Build for deployment: `npm run build`

## Redux Toolkit requirements covered
- configureStore: `src/store.js`
- createSlice: products, cart, auth and orders slices
- createAsyncThunk + extraReducers: Fake Store API product fetching and request states
- createEntityAdapter: normalized product collection
- Memoized selector: `useMemo` for derived filtered product results; cart totals derived from Redux state
- Middleware: custom action logger in store setup
- State persistence: localStorage subscription
- Authentication and protected checkout/order pages
- Cart, checkout simulation and order history

Login and checkout are simulations for an academic assignment; no real payment or account is created.