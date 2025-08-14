const Roles = require("../../../../models/roles");
const Brands = require("../../../../models/brands");
const event = require("../../../../services/emitter");
const { http200, http400, http401, http404 } = require("../../../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");

module.exports = async (req, res) => {
    let success = false;
    try {
        const { title, modules, roleId } = req.body;
        // if (!roleId || !isValidObjectId(roleId)) return res.status(http401).json({ success, message: "Invalid Token", });
        const role = await Roles.findById(roleId);
        if (!role)
            return res.status(http404).json({ success, message: "Role not found", });
        console.log(roleId, title, modules)
        const updatedRole = await Roles.findOneAndUpdate(
            { _id: roleId },
            { $set: { title, modules } },
            { new: true }
          );
        if (!updatedRole) return res.status(http400).json({ success, message: "Something went wrong!", });
        const brandData = await Brands.findOne({ userId: role.userId });
        event.emit("notification", {
            userId: role.userId,
            title: "Role Updated!",
            message: `${brandData?.brandName ? brandData?.brandName : "Super Admin"} updated role ${title}`,
            brandName: brandData?.shortBrandName,
            brandLogo: brandData?.brandLogo,
        });

        return res.status(http200).json({ success: true, updatedRole, message: "Role updated successfully!", });
    } catch (error) {
        return res.status(http400).json({ success, message: error?.message || "Something went wrong!", });
    }
};
