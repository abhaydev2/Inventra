"use client";

import { useStore } from "@/lib/context/StoreContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  FaHeart, 
  FaUser, 
  FaBoxOpen, 
  FaChevronRight, 
  FaTrashAlt,
  FaHeartBroken,
  FaEnvelope
} from "react-icons/fa";

export default function WishlistView({ role }: { role: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { products, wishlist, toggleWishlist } = useStore();
  const isAdmin = role === "admin";
  const baseRoute = isAdmin ? "/admin" : "/user";

  // Find products that are in the logged-in user's wishlist
  const wishlistedProducts = products.filter(p => wishlist.includes(p._id));

  // Simulated data for admins to see which users wishlisted which items
  const mockUserWishlists = [
    {
      _id: "mw-1",
      userName: "Alex Maharjan",
      userEmail: "alex@developers.com",
      productName: "Wireless Bluetooth Headphones",
      productSku: "EL-HD-01"
    },
    {
      _id: "mw-2",
      userName: "Abhay Dev",
      userEmail: "abhay@developers.com",
      productName: "English Willow Cricket Bat",
      productSku: "SP-CB-03"
    },
    {
      _id: "mw-3",
      userName: "John Doe",
      userEmail: "user@inventhive.com",
      productName: "Sporty Running Shoes",
      productSku: "SH-RUN-01"
    }
  ];

  // Add current user's actual wishlist items to the admin's table for full live fidelity!
  if (user) {
    wishlistedProducts.forEach((p, idx) => {
      mockUserWishlists.unshift({
        _id: `live-mw-${idx}`,
        userName: `${user.firstName || "You"} ${user.lastName || ""}`.trim(),
        userEmail: user.email,
        productName: p.name,
        productSku: p.sku
      });
    });
  }

  return (
    <div className="space-y-10 lg:space-y-12 animate-fadeIn w-full max-w-[1600px] mx-auto py-6 px-2">
      
      {/* HEADER */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[2px] text-blue-500 mb-1">
          {isAdmin ? "User Analytics" : "Your Favorites"}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <FaHeart className="text-rose-500" /> {isAdmin ? "User Wishlists Directory" : "My Wish List"}
        </h1>
      </div>

      {/* ADMIN VIEW: LIST OF ALL USERS' WISHLISTS */}
      {isAdmin ? (
        <div className="bg-[#1e293b]/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-white/5 bg-slate-900/40">
            <h3 className="font-bold text-white text-base">Customer Wishlist Registry</h3>
            <p className="text-xs text-gray-400 mt-0.5">Track products customers have liked or saved to buy later</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/20 border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-[1px]">
                  <th className="py-5 px-8">Customer Name</th>
                  <th className="py-5 px-8">Email Address</th>
                  <th className="py-5 px-8">Product Name</th>
                  <th className="py-5 px-8">SKU Code</th>
                  <th className="py-5 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {mockUserWishlists.map((item) => (
                  <tr key={item._id} className="hover:bg-white/2 transition-colors">
                    <td className="py-5 px-8 flex items-center gap-3 font-semibold text-white">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <FaUser className="text-xs" />
                      </div>
                      <span>{item.userName}</span>
                    </td>
                    <td className="py-5 px-8 text-gray-400">
                      <span className="flex items-center gap-2 font-mono text-xs">
                        <FaEnvelope className="text-gray-500 text-xs" /> {item.userEmail}
                      </span>
                    </td>
                    <td className="py-5 px-8 font-semibold text-gray-300">{item.productName}</td>
                    <td className="py-5 px-8 font-mono text-xs text-gray-500 uppercase tracking-widest">{item.productSku}</td>
                    <td className="py-5 px-8 text-right">
                      <button
                        onClick={() => {
                          const prod = products.find(p => p.sku === item.productSku);
                          if (prod) router.push(`${baseRoute}/inventory?id=${prod._id}`);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        View Product
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* USER VIEW: USER'S OWN WISHLIST */
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-16 bg-[#1e293b]/40 border border-white/5 rounded-3xl min-h-[350px]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-4">
                <FaHeartBroken className="text-2xl" />
              </div>
              <h4 className="font-semibold text-white text-lg">Your Wishlist is Empty</h4>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mb-6">
                Explore our catalog to save your favorite products.
              </p>
              <button
                onClick={() => router.push(`${baseRoute}/inventory`)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
              {wishlistedProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-[#1e293b]/40 border border-white/5 rounded-3xl p-5 flex flex-col justify-between group shadow-lg"
                >
                  {/* Image & Click trigger */}
                  <div
                    onClick={() => router.push(`${baseRoute}/inventory?id=${prod._id}`)}
                    className="h-44 w-full flex items-center justify-center mb-6 overflow-hidden rounded-2xl bg-slate-900/20 border border-white/2 cursor-pointer relative"
                  >
                    <img
                      src={prod.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
                      alt={prod.name}
                      className="max-h-36 object-contain transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        View Product <FaChevronRight className="text-[10px]" />
                      </span>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <div>
                      <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block">{prod.sku}</span>
                      <h3 
                        onClick={() => router.push(`${baseRoute}/inventory?id=${prod._id}`)}
                        className="font-bold text-white text-base leading-tight hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer mt-1"
                      >
                        {prod.name}
                      </h3>
                      <span className="text-xs text-blue-400 mt-1 block font-semibold">{prod.category}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="text-sm font-black text-white">Rs. {prod.price.toLocaleString()}</span>
                      
                      <button
                        onClick={() => toggleWishlist(prod._id)}
                        className="p-2.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <FaTrashAlt />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
