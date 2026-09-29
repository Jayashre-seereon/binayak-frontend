import { Bell, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { logoutApi } from "@/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (token || refreshToken) {
        const response = await logoutApi();
        const message =
          response.data?.message ||
          response.data?.data?.message ||
          "Logout successful";
        toast.success(message);
      } else {
        toast.success("Logout successful");
      }
      logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 400);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Logout failed";
      toast.error(message);
      logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 400);
    } finally {
    }
  };
  return (
    <div className="h-16 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          <img src={logo} alt="Binayak Jewellers logo" className="h-full w-full object-contain p-1" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-slate-900">Binayak Jewellers</div>
          <div className="text-xs text-slate-500">Jewellery ERP</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* <Bell className="cursor-pointer" /> */}
        <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">
            <User />
            </div>
          <span>{user?.name || user?.email || "User"}</span>
          <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
        </div>
      </div>
    </div>
  );
}
