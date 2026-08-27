import React, { useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Database,
  Globe,
  Lock,
  Mail,
  Save,
  Shield,
  SlidersHorizontal,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const [generalSettings, setGeneralSettings] = useState({
    institutionName: "Government First Grade College",
    location: "Raichur",
    systemName: "Inventory Management System",
    email: "admin@gfgcraichur.edu.in",
    phone: "",
    address: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStock: true,
    stockOut: true,
    purchaseUpdates: true,
    requestUpdates: true,
    emailNotifications: false,
  });

  const [inventorySettings, setInventorySettings] = useState({
    lowStockThreshold: "10",
    enableNegativeStock: false,
    requireApproval: true,
    autoGenerateItemCode: true,
    enableStockAdjustment: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    loginAttempts: "5",
    requireStrongPassword: true,
  });

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: Building2,
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: SlidersHorizontal,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
    },
  ];

  const updateGeneral = (field, value) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNotification = (field, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateInventory = (field, value) => {
    setInventorySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSecurity = (field, value) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const settings = {
      general: generalSettings,
      inventory: inventorySettings,
      notifications: notificationSettings,
      security: securitySettings,
    };

    console.log("Settings:", settings);

    toast.success("Settings saved successfully");
  };

  const Toggle = ({ checked, onChange }) => {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.75 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0.75"
          }`}
        />
      </button>
    );
  };

  const SettingRow = ({
    title,
    description,
    checked,
    onChange,
  }) => {
    return (
      <div className="flex items-center justify-between gap-6 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800">
            {title}
          </p>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="shrink-0">
          <Toggle checked={checked} onChange={onChange} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Settings
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Configure your inventory management system.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
          <Database className="w-4 h-4 text-slate-500" />

          <span className="text-xs font-medium text-slate-600">
            System Configuration
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[650px]">
          {/* SETTINGS SIDEBAR */}
          <aside className="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/60">
            <div className="p-3 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        active
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }`}
                    />

                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* SETTINGS CONTENT */}
          <div className="flex-1 min-w-0">
            {/* GENERAL */}
            {activeTab === "general" && (
              <div>
                <div className="px-5 sm:px-7 py-5 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-slate-800">
                    General Settings
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Manage institution and system information.
                  </p>
                </div>

                <div className="p-5 sm:p-7 space-y-7">
                  {/* INSTITUTION */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-4 h-4 text-indigo-500" />

                      <h3 className="text-sm font-semibold text-slate-800">
                        Institution Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Institution Name
                        </label>

                        <input
                          type="text"
                          value={generalSettings.institutionName}
                          onChange={(e) =>
                            updateGeneral(
                              "institutionName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Location
                        </label>

                        <input
                          type="text"
                          value={generalSettings.location}
                          onChange={(e) =>
                            updateGeneral(
                              "location",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Contact Email
                        </label>

                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                          <input
                            type="email"
                            value={generalSettings.email}
                            onChange={(e) =>
                              updateGeneral(
                                "email",
                                e.target.value
                              )
                            }
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Phone Number
                        </label>

                        <input
                          type="text"
                          value={generalSettings.phone}
                          onChange={(e) =>
                            updateGeneral(
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder="Enter contact number"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          System Name
                        </label>

                        <input
                          type="text"
                          value={generalSettings.systemName}
                          onChange={(e) =>
                            updateGeneral(
                              "systemName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Address
                        </label>

                        <textarea
                          rows={3}
                          value={generalSettings.address}
                          onChange={(e) =>
                            updateGeneral(
                              "address",
                              e.target.value
                            )
                          }
                          placeholder="Enter institution address"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SYSTEM INFO */}
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-indigo-500" />

                      <h3 className="text-sm font-semibold text-slate-800">
                        System Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Version
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          1.0.0
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Currency
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          INR (₹)
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          Timezone
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          IST (UTC+5:30)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INVENTORY */}
            {activeTab === "inventory" && (
              <div>
                <div className="px-5 sm:px-7 py-5 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-slate-800">
                    Inventory Settings
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Configure stock rules and inventory behavior.
                  </p>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="max-w-2xl space-y-1">
                    {/* THRESHOLD */}
                    <div className="py-4 border-b border-slate-100">
                      <label className="block text-sm font-medium text-slate-800">
                        Low Stock Threshold
                      </label>

                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Items at or below this quantity will be
                        considered low stock.
                      </p>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          value={inventorySettings.lowStockThreshold}
                          onChange={(e) =>
                            updateInventory(
                              "lowStockThreshold",
                              e.target.value
                            )
                          }
                          className="w-32 px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                        />

                        <span className="text-xs text-slate-400">
                          units
                        </span>
                      </div>
                    </div>

                    <SettingRow
                      title="Allow Negative Stock"
                      description="Allow stock quantities to go below zero when issuing items."
                      checked={inventorySettings.enableNegativeStock}
                      onChange={(value) =>
                        updateInventory(
                          "enableNegativeStock",
                          value
                        )
                      }
                    />

                    <div className="border-t border-slate-100" />

                    <SettingRow
                      title="Require Request Approval"
                      description="Item requests must be approved before stock can be issued."
                      checked={inventorySettings.requireApproval}
                      onChange={(value) =>
                        updateInventory(
                          "requireApproval",
                          value
                        )
                      }
                    />

                    <div className="border-t border-slate-100" />

                    <SettingRow
                      title="Auto Generate Item Codes"
                      description="Automatically generate unique codes when new inventory items are created."
                      checked={inventorySettings.autoGenerateItemCode}
                      onChange={(value) =>
                        updateInventory(
                          "autoGenerateItemCode",
                          value
                        )
                      }
                    />

                    <div className="border-t border-slate-100" />

                    <SettingRow
                      title="Enable Stock Adjustments"
                      description="Allow authorized users to manually adjust inventory quantities."
                      checked={inventorySettings.enableStockAdjustment}
                      onChange={(value) =>
                        updateInventory(
                          "enableStockAdjustment",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="mt-7 p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Inventory control
                        </p>

                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                          Changes to stock rules can affect inventory
                          calculations and reporting. Review these
                          settings carefully before saving.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div>
                <div className="px-5 sm:px-7 py-5 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-slate-800">
                    Notification Settings
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Choose which system events should generate
                    notifications.
                  </p>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="max-w-2xl">
                    <SettingRow
                      title="Low Stock Alerts"
                      description="Notify administrators when inventory reaches the low stock threshold."
                      checked={notificationSettings.lowStock}
                      onChange={(value) =>
                        updateNotification("lowStock", value)
                      }
                    />

                    <div className="border-t border-slate-100" />

                    <SettingRow
                      title="Stock Out Alerts"
                      description="Notify administrators when an item reaches zero available stock."
                      checked={notificationSettings.stockOut}
                      onChange={(value) =>
                        updateNotification("stockOut", value)
                      }
                    />

                    <div className="border-t border-slate-100" />

                    <SettingRow
                      title="Purchase Updates"
                      description="Receive notifications about purchase order status changes."
                      checked={notificationSettings.purchaseUpdates}
                      onChange={(value) =>
                        updateNotification(
                          "purchaseUpdates",
                          value
                        )
                      }
                    />

                    <div className="border-t border-slate-100" />

                    <SettingRow
                      title="Item Request Updates"
                      description="Notify users when their item requests are approved or rejected."
                      checked={notificationSettings.requestUpdates}
                      onChange={(value) =>
                        updateNotification(
                          "requestUpdates",
                          value
                        )
                      }
                    />

                    <div className="border-t border-slate-100" />

                    <SettingRow
                      title="Email Notifications"
                      description="Send selected system notifications through email."
                      checked={
                        notificationSettings.emailNotifications
                      }
                      onChange={(value) =>
                        updateNotification(
                          "emailNotifications",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="mt-7 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4 text-indigo-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-indigo-900">
                          Notification preferences
                        </p>

                        <p className="text-xs text-indigo-700 mt-1">
                          You can change these preferences at any
                          time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <div>
                <div className="px-5 sm:px-7 py-5 border-b border-slate-100">
                  <h2 className="text-base font-semibold text-slate-800">
                    Security Settings
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Configure authentication and session security.
                  </p>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="max-w-2xl space-y-6">
                    {/* SESSION */}
                    <div>
                      <label className="block text-sm font-medium text-slate-800">
                        Session Timeout
                      </label>

                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Automatically end inactive sessions after
                        the selected duration.
                      </p>

                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          updateSecurity(
                            "sessionTimeout",
                            e.target.value
                          )
                        }
                        className="w-full sm:w-56 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="15">
                          15 minutes
                        </option>

                        <option value="30">
                          30 minutes
                        </option>

                        <option value="60">
                          1 hour
                        </option>

                        <option value="120">
                          2 hours
                        </option>
                      </select>
                    </div>

                    {/* LOGIN ATTEMPTS */}
                    <div className="pt-5 border-t border-slate-100">
                      <label className="block text-sm font-medium text-slate-800">
                        Maximum Login Attempts
                      </label>

                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Number of failed attempts allowed before
                        temporary protection is applied.
                      </p>

                      <select
                        value={securitySettings.loginAttempts}
                        onChange={(e) =>
                          updateSecurity(
                            "loginAttempts",
                            e.target.value
                          )
                        }
                        className="w-full sm:w-56 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="3">3 attempts</option>
                        <option value="5">5 attempts</option>
                        <option value="10">10 attempts</option>
                      </select>
                    </div>

                    {/* PASSWORD */}
                    <div className="pt-5 border-t border-slate-100">
                      <SettingRow
                        title="Require Strong Password"
                        description="Require users to use stronger passwords containing a combination of letters, numbers and special characters."
                        checked={
                          securitySettings.requireStrongPassword
                        }
                        onChange={(value) =>
                          updateSecurity(
                            "requireStrongPassword",
                            value
                          )
                        }
                      />
                    </div>

                    {/* SECURITY INFO */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4 text-emerald-600" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Security recommendations
                          </p>

                          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                            Keep strong password requirements enabled
                            and use a short session timeout on shared
                            computers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SAVE BAR */}
        <div className="px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Check className="w-3.5 h-3.5 text-emerald-500" />

            <span>
              Settings are stored for this session.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;