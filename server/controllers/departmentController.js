import Department from "../models/Department.js";

// Generate DEPT-001, DEPT-002, etc.
const generateDepartmentId = async () => {
  const lastDepartment = await Department.findOne()
    .sort({ createdAt: -1 })
    .select("departmentId");

  if (!lastDepartment) {
    return "DEPT-001";
  }

  const lastNumber = parseInt(
    lastDepartment.departmentId.replace("DEPT-", ""),
    10,
  );

  return `DEPT-${String(lastNumber + 1).padStart(3, "0")}`;
};

// GET /api/departments
export const getDepartments = async (req, res) => {
  try {
    let query = {};

    // If the user is a department user (not an admin), filter by their assigned department
    if (req.user.role !== "admin") {
      const departmentId = req.user.department || req.user.departmentId;

      if (!departmentId) {
        return res.status(404).json({
          success: false,
          message: "No department assigned to this user",
        });
      }

      // Match either MongoDB _id or custom departmentId string
      query = {
        $or: [{ _id: departmentId }, { departmentId: departmentId }],
      };
    }

    const departments = await Department.find(query).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments, // Returns all for admin, or an array with just their department for department users
    });
  } catch (error) {
    console.error("Get departments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

// GET /api/departments/:id
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch department",
      error: error.message,
    });
  }
};

// POST /api/departments
export const createDepartment = async (req, res) => {
  try {
    const { name, code, hod, email, phone, location, students, status } =
      req.body;

    if (
      !name?.trim() ||
      !code?.trim() ||
      !hod?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !location?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, code, HOD, email, phone and location are required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingCode = await Department.findOne({
      code: normalizedCode,
    });

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "Department code already exists",
      });
    }

    const existingEmail = await Department.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Department email already exists",
      });
    }

    const departmentId = await generateDepartmentId();

    const department = await Department.create({
      departmentId,
      name: name.trim(),
      code: normalizedCode,
      hod: hod.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      location: location.trim(),
      students: Number(students) || 0,
      requests: 0,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create department",
      error: error.message,
    });
  }
};

// PUT /api/departments/:id
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const { name, code, hod, email, phone, location, students, status } =
      req.body;

    if (code) {
      const normalizedCode = code.trim().toUpperCase();

      const existingCode = await Department.findOne({
        code: normalizedCode,
        _id: { $ne: department._id },
      });

      if (existingCode) {
        return res.status(409).json({
          success: false,
          message: "Department code already exists",
        });
      }

      department.code = normalizedCode;
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();

      const existingEmail = await Department.findOne({
        email: normalizedEmail,
        _id: { $ne: department._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Department email already exists",
        });
      }

      department.email = normalizedEmail;
    }

    if (name !== undefined) {
      department.name = name.trim();
    }

    if (hod !== undefined) {
      department.hod = hod.trim();
    }

    if (phone !== undefined) {
      department.phone = phone.trim();
    }

    if (location !== undefined) {
      department.location = location.trim();
    }

    if (students !== undefined) {
      department.students = Number(students) || 0;
    }

    if (status !== undefined) {
      department.status = status;
    }

    const updatedDepartment = await department.save();

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (error) {
    console.error("Update department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update department",
      error: error.message,
    });
  }
};

// DELETE /api/departments/:id
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete department",
      error: error.message,
    });
  }
};
