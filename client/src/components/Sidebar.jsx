import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  Truck,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [openMenus, setOpenMenus] = useState({
    operations: true,
    college: true,
    administration: true,
  });

  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === "admin";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const menuGroups =
    userRole === "admin"
      ? [
          {
            title: "College Management",
            key: "college",
            items: [
              {
                name: "Item Requests",
                href: "/requests",
                icon: ClipboardList,
              },
            ],
          },
          {
            title: "Inventory Management",
            key: "operations",
            items: [
              {
                name: "Items",
                href: "/inventory",
                icon: Package,
                roles: ["admin", "store"],
              },
              {
                name: "Stock In",
                href: "/stock/in",
                icon: ArrowDownToLine,
                roles: ["admin", "store"],
              },
              {
                name: "Stock Out",
                href: "/stock/out",
                icon: ArrowUpFromLine,
                roles: ["admin", "store"],
              },
              {
                name: "Returns",
                href: "/stock/returns",
                icon: RotateCcw,
              },
              {
                name: "Adjustments",
                href: "/stock/adjustments",
                icon: SlidersHorizontal,
                roles: ["admin", "store"],
              },
              {
                name: "Purchases",
                href: "/purchases",
                icon: ShoppingCart,
                roles: ["admin", "store"],
              },
            ],
          },
          {
            title: "Administration",
            key: "administration",
            roles: ["admin"],
            items: [
              {
                name: "Categories",
                href: "/categories",
                icon: Tags,
              },
              {
                name: "Suppliers",
                href: "/suppliers",
                icon: Truck,
              },
              {
                name: "Departments",
                href: "/departments",
                icon: Building2,
              },
              {
                name: "Users",
                href: "/users",
                icon: Users,
              },
            ],
          },
        ]
      : userRole === "department"
        ? [
            {
              title: "Department Services",
              key: "college",
              items: [
                {
                  name: "Item Requests",
                  href: "/requests",
                  icon: ClipboardList,
                },
              ],
            },
            {
              title: "Department Stock",
              key: "operations",
              items: [
                {
                  name: "Returns",
                  href: "/stock/returns",
                  icon: RotateCcw,
                },
              ],
            },
          ]
        : [
            {
              title: "College Services",
              key: "college",
              items: [
                {
                  name: "Item Requests",
                  href: "/requests",
                  icon: ClipboardList,
                },
              ],
            },
            {
              title: "Store Operations",
              key: "operations",
              items: [
                {
                  name: "Items",
                  href: "/inventory",
                  icon: Package,
                },
                {
                  name: "Stock In",
                  href: "/stock/in",
                  icon: ArrowDownToLine,
                },
                {
                  name: "Stock Out",
                  href: "/stock/out",
                  icon: ArrowUpFromLine,
                },
                {
                  name: "Returns",
                  href: "/stock/returns",
                  icon: RotateCcw,
                },
                {
                  name: "Adjustments",
                  href: "/stock/adjustments",
                  icon: SlidersHorizontal,
                },
                {
                  name: "Purchases",
                  href: "/purchases",
                  icon: ShoppingCart,
                },
              ],
            },
          ];

  const sidebarContent = (
    <>
      {/* SIDEBAR HEADER */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
              <Boxes className="w-5 h-5 text-white" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-5">
                Government First Grade College
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Raichur · Inventory System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* USER PROFILE */}
      <div className="mx-3 mt-4 mb-3 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-white/10 shrink-0">
            <span className="text-slate-300 text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-200 truncate">
              {user?.name || "Administrator"}
            </p>

            <p className="text-[11px] text-slate-500 truncate capitalize">
              {userRole || "administrator"}
            </p>

            {!isAdmin && user?.department && (
              <p className="text-[10px] text-indigo-300 truncate mt-1">
                {typeof user.department === "object"
                  ? user.department.name || user.department.departmentName
                  : "Department User"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 px-3 pb-4 overflow-y-auto scrollbar-thin">
        {menuGroups
          .filter((group) => {
            if (group.roles) {
              return group.roles.includes(userRole);
            }

            return true;
          })
          .map((group) => {
            const isGroupOpen = group.key ? openMenus[group.key] : true;

            // Filter menu items according to user role.
            const visibleItems = group.items.filter((item) => {
              if (item.roles) {
                return item.roles.includes(userRole);
              }

              return true;
            });

            return (
              <div key={group.title} className="mb-5">
                <button
                  type="button"
                  disabled={!group.key}
                  onClick={() => group.key && toggleMenu(group.key)}
                  className={`w-full flex items-center justify-between px-2 mb-2 ${
                    group.key ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {group.title}
                  </span>

                  {group.key && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                        isGroupOpen ? "" : "-rotate-90"
                      }`}
                    />
                  )}
                </button>

                {isGroupOpen && (
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                            active
                              ? "bg-indigo-500/10 text-indigo-300"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500" />
                          )}

                          <Icon
                            className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                              active
                                ? "text-indigo-300"
                                : "text-slate-500 group-hover:text-slate-300"
                            }`}
                          />

                          <span className="flex-1 truncate">{item.name}</span>

                          {active && (
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400/60 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* LOGOUT */}
      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10 hover:bg-slate-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white shrink-0 border-r border-white/10">
        {sidebarContent}
      </aside>

      {/* MOBILE SIDEBAR */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white z-50 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export const Session = Sidebar;
export default Sidebar;
