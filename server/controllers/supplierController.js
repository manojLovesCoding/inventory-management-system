import Supplier from "../models/Supplier.js";

const generateSupplierId = async () => {
  const lastSupplier = await Supplier.findOne()
    .sort({ supplierId: -1 })
    .select("supplierId");

  if (!lastSupplier) {
    return "SUP-001";
  }

  const lastNumber = Number(
    lastSupplier.supplierId.replace("SUP-", "")
  );

  const nextNumber = lastNumber + 1;

  return `SUP-${String(nextNumber).padStart(3, "0")}`;
};

// GET ALL SUPPLIERS
export const getSuppliers = async (req, res) => {
  try {
    const {
      search = "",
      status = "All",
    } = req.query;

    const query = {};

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        { supplierId: searchRegex },
        { name: searchRegex },
        { contactPerson: searchRegex },
        { phone: searchRegex },
        { gstin: searchRegex },
        { city: searchRegex },
      ];
    }

    if (status !== "All") {
      query.status = status;
    }

    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE SUPPLIER
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error("Get supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// CREATE SUPPLIER
export const createSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      phone,
      email,
      gstin,
      address,
      city,
      state,
      pincode,
      status,
    } = req.body;

    if (
      !name ||
      !contactPerson ||
      !phone ||
      !gstin ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    if (gstin.trim().length !== 15) {
      return res.status(400).json({
        success: false,
        message: "GSTIN must contain 15 characters",
      });
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit PIN code",
      });
    }

    const existingGSTIN = await Supplier.findOne({
      gstin: gstin.trim().toUpperCase(),
    });

    if (existingGSTIN) {
      return res.status(409).json({
        success: false,
        message: "Supplier with this GSTIN already exists",
      });
    }

    const supplierId = await generateSupplierId();

    const supplier = await Supplier.create({
      supplierId,
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email?.trim() || "",
      gstin: gstin.trim().toUpperCase(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Supplier added successfully",
      supplier,
    });
  } catch (error) {
    console.error("Create supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE SUPPLIER
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const {
      name,
      contactPerson,
      phone,
      email,
      gstin,
      address,
      city,
      state,
      pincode,
      status,
    } = req.body;

    if (
      !name ||
      !contactPerson ||
      !phone ||
      !gstin ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    if (gstin.trim().length !== 15) {
      return res.status(400).json({
        success: false,
        message: "GSTIN must contain 15 characters",
      });
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit PIN code",
      });
    }

    const duplicateGSTIN = await Supplier.findOne({
      gstin: gstin.trim().toUpperCase(),
      _id: { $ne: supplier._id },
    });

    if (duplicateGSTIN) {
      return res.status(409).json({
        success: false,
        message: "Another supplier already uses this GSTIN",
      });
    }

    supplier.name = name.trim();
    supplier.contactPerson = contactPerson.trim();
    supplier.phone = phone.trim();
    supplier.email = email?.trim() || "";
    supplier.gstin = gstin.trim().toUpperCase();
    supplier.address = address.trim();
    supplier.city = city.trim();
    supplier.state = state.trim();
    supplier.pincode = pincode.trim();

    if (status) {
      supplier.status = status;
    }

    await supplier.save();

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    console.error("Update supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE SUPPLIER
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// TOGGLE STATUS
export const toggleSupplierStatus = async (req, res) => {
  try {
    const supplier = await Supplier.findById(
      req.params.id
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    supplier.status =
      supplier.status === "Active"
        ? "Inactive"
        : "Active";

    await supplier.save();

    res.status(200).json({
      success: true,
      message: `Supplier marked as ${supplier.status.toLowerCase()}`,
      supplier,
    });
  } catch (error) {
    console.error("Toggle supplier status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

