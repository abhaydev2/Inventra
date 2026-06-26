import Link from "next/link";
import "./page.css";

export default function HomePage() {
  return (
    <div className="home_page">

      <div className="overlay">

        
        <nav className="navbar">

          <h2 className="logo">
            InventHive
          </h2>

          <div className="nav_buttons">

            <Link
              href="/login"
              className="nav_login"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="nav_register"
            >
              Register
            </Link>

          </div>

        </nav>

        
        <div className="hero_section">

          <div className="hero_left">

            <h1>
              Smart Inventory
              <br />
              Management System
            </h1>

            <p>
              Track products, manage warehouse stock,
              and monitor inventory operations in one
              modern dashboard.
            </p>

            <div className="hero_buttons">

              <Link
                href="/login"
                className="login_btn"
              >
                Get Started
              </Link>

              <Link
                href="/register"
                className="register_btn"
              >
                Create Account
              </Link>

            </div>

          </div>

          
          <div className="hero_right">

            <div className="dashboard_card">

              <h3>Inventory Overview</h3>

              <div className="card_item">
                <span>Total Products</span>
                <strong>1,248</strong>
              </div>

              <div className="card_item">
                <span>Warehouse Stock</span>
                <strong>8,420</strong>
              </div>

              <div className="card_item">
                <span>Low Stock Items</span>

                <strong className="warning">
                  12
                </strong>
              </div>

              <div className="card_item">
                <span>Orders Today</span>
                <strong>84</strong>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}