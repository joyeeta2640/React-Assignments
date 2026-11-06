
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  Navigate
} from "react-router-dom";

import {
  fetchProducts,
  productSelectors,
  setCategory,
  setSearch,
  setSort
} from "./products";

import {
  add,
  quantity,
  remove,
  clear,
  setDiscount
} from "./cart";

import { login, logout } from "./auth";
import { place } from "./orders";

const money = (n) => "$" + Number(n).toFixed(2);

// SHOP PAGE
function Shop() {
  const dispatch = useDispatch();
  const p = useSelector((state) => state.products);
  const all = useSelector(productSelectors.selectAll);

  useEffect(() => {
    if (p.status === "idle") {
      dispatch(fetchProducts());
    }
  }, [p.status, dispatch]);

  const categories = [
    "all",
    ...new Set(all.map((product) => product.category))
  ];

  const list = useMemo(() => {
    let filtered = all.filter((product) =>
      (p.category === "all" || product.category === p.category) &&
      product.title.toLowerCase().includes(p.search.toLowerCase())
    );

    if (p.sort === "low") {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (p.sort === "high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [all, p.category, p.search, p.sort]);

  return (
    <>
      <section className="hero">
        <small>THE EVERYDAY EDIT</small>
        <h1>Find your next<br /><i>favorite thing.</i></h1>
        <p>Discover something lovely, every day.</p>
      </section>

      <section>
        <h2>Shop Products</h2>

        <div className="filters">
          <input
            placeholder="Search products"
            value={p.search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
          />

          <select
            value={p.category}
            onChange={(e) => dispatch(setCategory(e.target.value))}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={p.sort}
            onChange={(e) => dispatch(setSort(e.target.value))}
          >
            <option value="default">Sort by</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        {p.status === "loading" && <p>Loading products...</p>}

        {p.status === "error" && (
          <p>
            {p.error}
            <button onClick={() => dispatch(fetchProducts())}>
              Retry
            </button>
          </p>
        )}

        {p.status === "success" && list.length === 0 && (
          <p>No products found.</p>
        )}

        <div className="grid">
          {list.map((product) => (
            <article className="card" key={product.id}>
              <Link to={"/product/" + product.id}>
                <img src={product.image} alt={product.title} />
                <h3>{product.title}</h3>
              </Link>

              <b>{money(product.price)}</b>

              <button onClick={() => dispatch(add(product))}>
                Add to Cart
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

// PRODUCT DETAILS
function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const product = useSelector((state) =>
    productSelectors.selectById(state, Number(id))
  );

  const status = useSelector((state) => state.products.status);

  if (!product) {
    return (
      <p>
        {status === "loading" ? "Loading product..." : "Product not found."}
        {" "}
        <Link to="/">Back to Shop</Link>
      </p>
    );
  }

  return (
    <div className="detail">
      <img src={product.image} alt={product.title} />

      <div>
        <small>{product.category}</small>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <h2>{money(product.price)}</h2>

        <button onClick={() => dispatch(add(product))}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// CART PAGE
function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const discount = useSelector((state) => state.cart.discount);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const discountAmount = subtotal * discount / 100;
  const tax = (subtotal - discountAmount) * 0.05;
  const total = subtotal - discountAmount + tax;

  return (
    <section>
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/">Shop Now</Link>
        </p>
      ) : (
        <>
          <div className="cart">
            {items.map((item) => (
              <div className="cartrow" key={item.id}>
                <img src={item.image} alt={item.title} />
                <span>{item.title}</span>

                <button onClick={() =>
                  dispatch(quantity({ id: item.id, qty: item.qty - 1 }))
                }>
                  −
                </button>

                {item.qty}

                <button onClick={() =>
                  dispatch(quantity({ id: item.id, qty: item.qty + 1 }))
                }>
                  +
                </button>

                <b>{money(item.price * item.qty)}</b>

                <button onClick={() => dispatch(remove(item.id))}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <p>
            Discount:
            <select
              value={discount}
              onChange={(e) =>
                dispatch(setDiscount(Number(e.target.value)))
              }
            >
              <option value="0">No Discount</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
            </select>
          </p>

          <p>Subtotal: {money(subtotal)}</p>
          <p>Discount: {money(discountAmount)}</p>
          <p>Tax (5%): {money(tax)}</p>

          <h2>Total: {money(total)}</h2>

          <Link className="btn" to="/checkout">
            Proceed to Checkout
          </Link>
        </>
      )}
    </section>
  );
}

// LOGIN PAGE
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(login({ name, email }));
        navigate("/checkout");
      }}
    >
      <h1>Login</h1>

      <label>
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label>
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label>
        Password
        <input type="password" required minLength="4" />
      </label>

      <button type="submit">Sign In</button>

      <small>Demo login only. No real account is created.</small>
    </form>
  );
}

// CHECKOUT PAGE
function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  if (!user) {
    return <Navigate to="/login" />;
  }

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const total = subtotal * 1.05;

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();

        if (items.length === 0) {
          alert("Your cart is empty!");
          return;
        }

        dispatch(
          place({
            items,
            total,
            address,
            phone,
            customer: user.email
          })
        );

        dispatch(clear());
        navigate("/orders");
      }}
    >
      <h1>Checkout</h1>
      <p>Signed in as: {user.email}</p>

      <label>
        Delivery Address
        <textarea
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>

      <label>
        Phone Number
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <h2>Total: {money(total)}</h2>

      <button type="submit">Place Order</button>

      <small>Demo checkout. No real payment is processed.</small>
    </form>
  );
}

// ORDER HISTORY
function Orders() {
  const user = useSelector((state) => state.auth.user);
  const orders = useSelector((state) => state.orders.items);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <section>
      <h1>Order History</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <article className="order" key={order.id}>
            <b>Order {order.id.slice(0, 8)}</b>
            <p>{order.date}</p>
            <p>Customer: {order.customer}</p>

            <p>
              {order.items.map((item) =>
                item.title + " × " + item.qty
              ).join(", ")}
            </p>

            <h3>{money(order.total)}</h3>
          </article>
        ))
      )}
    </section>
  );
}

// MAIN APP
export default function App() {
  const count = useSelector((state) =>
    state.cart.items.reduce(
      (total, item) => total + item.qty,
      0
    )
  );

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  return (
    <>
      <header>
        <Link className="logo" to="/">ShopEase.</Link>

        <nav>
          <Link to="/">Shop</Link>
          <Link to="/orders">Orders</Link>

          {user ? (
            <button
              className="plain"
              onClick={() => dispatch(logout())}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}

          <Link to="/cart">Cart ({count})</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>

      <footer>
        ShopEase · React + Redux Toolkit Academic Project
      </footer>
    </>
  );
}
